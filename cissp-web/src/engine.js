// The app's arithmetic, kept free of the page so it can be tested on its own:
// progress records, domain statistics, the review scheduler, the adaptive
// mock exam and the study plan. build.mjs inlines this file into the page;
// engine.test.mjs runs it under Node.
// Used by the page script that build.mjs inlines after this file.
// eslint-disable-next-line no-unused-vars
const Engine = (() => {
  const DAY = 86400000;

  // Leitner boxes. A correct answer moves a question up a box and pushes its
  // next review out; a miss sends it back to box 1 for tomorrow.
  const BOX_DAYS = [0, 1, 3, 7, 16, 35, 70];
  const MISS_DELAY = 20 * 3600 * 1000;

  // Per-question progress, stored compactly as an array so the whole record
  // for a few hundred questions stays well under one storage document:
  // [attempts, correct, firstCorrect (1/0), lastCorrect (1/0), lastTs, box, dueTs]
  function record(prev, correct, now) {
    const r = prev ? prev.slice() : [0, 0, correct ? 1 : 0, 0, 0, 0, 0];
    r[0] += 1;
    if (correct) r[1] += 1;
    r[3] = correct ? 1 : 0;
    r[4] = now;
    if (correct) {
      r[5] = Math.min(r[5] + 1, BOX_DAYS.length - 1);
      r[6] = now + BOX_DAYS[r[5]] * DAY;
    } else {
      r[5] = 1;
      r[6] = now + MISS_DELAY;
    }
    return r;
  }

  // First-try accuracy is the honest predictor: it is what you score on a
  // question you have never seen, which is every question on the real exam.
  // Small samples are pulled toward 60% so one lucky answer reads as "unknown".
  const PRIOR_RATE = 0.6;
  const PRIOR_WEIGHT = 4;

  function domainStats(bank, progress, domains) {
    return domains.map((d) => {
      const items = bank.filter((q) => q.d === d.n);
      let seen = 0, first = 0, last = 0, attempts = 0, correct = 0, due = 0;
      const now = Date.now();
      for (const q of items) {
        const r = progress[q.id];
        if (!r) continue;
        seen++;
        first += r[2];
        last += r[3];
        attempts += r[0];
        correct += r[1];
        if (r[6] <= now && r[3] === 0) due++;
      }
      const smoothed = (first + PRIOR_RATE * PRIOR_WEIGHT) / (seen + PRIOR_WEIGHT);
      return {
        n: d.n,
        weight: d.weight,
        total: items.length,
        seen,
        coverage: items.length ? seen / items.length : 0,
        firstRate: seen ? first / seen : null,
        lastRate: seen ? last / seen : null,
        smoothed,
        attempts,
        correct,
        dueMissed: due,
      };
    });
  }

  // A weighted average of first-try accuracy across the eight domains, using
  // the exam's own weights, so a weak heavy domain costs more than a weak light one.
  function readiness(stats) {
    let w = 0, sum = 0, seen = 0, total = 0;
    for (const s of stats) {
      w += s.weight;
      sum += s.weight * s.smoothed;
      seen += s.seen;
      total += s.total;
    }
    return { score: w ? sum / w : 0, coverage: total ? seen / total : 0, seen };
  }

  function shuffle(list, rnd = Math.random) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Domain priority for new material: the exam weight, scaled up where
  // first-try accuracy is low and where you have rated yourself weak.
  function domainPriority(stats, selfRatings = {}) {
    return stats.map((s) => {
      const gap = 1 - s.smoothed + 0.15;
      const rating = Number(selfRatings[s.n]) || 0; // 1..5, 0 = not rated
      const self = rating ? 1 + (3 - rating) * 0.15 : 1;
      return { n: s.n, p: s.weight * gap * self };
    });
  }

  function pickWeighted(entries, rnd) {
    const total = entries.reduce((t, e) => t + e.p, 0);
    if (total <= 0) return entries[0];
    let x = rnd() * total;
    for (const e of entries) {
      x -= e.p;
      if (x <= 0) return e;
    }
    return entries[entries.length - 1];
  }

  // The daily "smart" set: questions you missed that are due again come
  // first (up to 40% of the set), then new questions drawn toward your
  // weakest, heaviest domains, spreading across objectives.
  function smartSet(bank, progress, domains, count, opts = {}) {
    const rnd = opts.rnd || Math.random;
    const now = opts.now || Date.now();
    const only = opts.domains && opts.domains.length ? new Set(opts.domains) : null;
    const pool = only ? bank.filter((q) => only.has(q.d)) : bank;
    const chosen = [];
    const taken = new Set();

    const due = pool
      .filter((q) => progress[q.id] && progress[q.id][6] <= now)
      .sort((a, b) => progress[a.id][3] - progress[b.id][3] || progress[a.id][5] - progress[b.id][5] || progress[a.id][6] - progress[b.id][6]);
    const dueCap = opts.reviewOnly ? count : Math.ceil(count * 0.4);
    for (const q of due) {
      if (chosen.length >= dueCap) break;
      chosen.push(q);
      taken.add(q.id);
    }
    if (opts.reviewOnly) return shuffle(chosen, rnd);

    const stats = domainStats(pool, progress, domains.filter((d) => !only || only.has(d.n)));
    let priorities = domainPriority(stats, opts.selfRatings).filter((p) => pool.some((q) => q.d === p.n));
    const objSeen = {};
    for (const q of bank) if (progress[q.id]) objSeen[q.obj] = (objSeen[q.obj] || 0) + 1;

    let guard = 0;
    while (chosen.length < count && priorities.length && guard++ < count * 20) {
      const pick = pickWeighted(priorities, rnd);
      const fresh = pool.filter((q) => q.d === pick.n && !progress[q.id] && !taken.has(q.id));
      let candidates = fresh;
      if (!candidates.length) {
        // Nothing new left here: fall back to the least-settled questions not yet due.
        candidates = pool
          .filter((q) => q.d === pick.n && !taken.has(q.id))
          .sort((a, b) => (progress[a.id]?.[5] ?? 0) - (progress[b.id]?.[5] ?? 0) || (progress[a.id]?.[4] ?? 0) - (progress[b.id]?.[4] ?? 0))
          .slice(0, 6);
      }
      if (!candidates.length) {
        priorities = priorities.filter((p) => p.n !== pick.n);
        continue;
      }
      // Prefer the objective you have practised least.
      const least = Math.min(...candidates.map((q) => objSeen[q.obj] || 0));
      const spread = candidates.filter((q) => (objSeen[q.obj] || 0) === least);
      const q = spread[Math.floor(rnd() * spread.length)];
      chosen.push(q);
      taken.add(q.id);
      objSeen[q.obj] = (objSeen[q.obj] || 0) + 1;
    }
    return shuffle(chosen, rnd);
  }

  // ---------------------------------------------------------------------
  // The adaptive mock exam.
  //
  // The real English CISSP exam is computerized adaptive (CAT): 100 to 150
  // items in three hours, no going back, and it stops as soon as it is 95%
  // confident you are above or below the passing standard. This models each
  // question with a one-parameter (Rasch) curve whose difficulty comes from the
  // bank's 1-3 rating, estimates your ability after every answer, and applies
  // the same stopping rule. The passing line sits where you would answer about
  // 71% of medium questions correctly.
  const DIFFICULTY = { 1: -1.0, 2: 0.0, 3: 1.0 };
  const PASS_THETA = 0.9;

  const FORMS = {
    full: { label: "Full adaptive exam", min: 100, max: 150, minutes: 180 },
    half: { label: "Half-length adaptive exam", min: 50, max: 75, minutes: 90 },
  };

  const prob = (theta, b) => 1 / (1 + Math.exp(-(theta - b)));

  // Maximum a posteriori ability estimate with a standard normal prior.
  function estimate(responses) {
    let theta = 0;
    for (let k = 0; k < 40; k++) {
      let grad = -theta, info = 1;
      for (const r of responses) {
        const p = prob(theta, r.b);
        grad += (r.correct ? 1 : 0) - p;
        info += p * (1 - p);
      }
      const step = grad / info;
      theta += Math.max(-1, Math.min(1, step));
      if (Math.abs(step) < 1e-6) break;
    }
    let info = 1;
    for (const r of responses) {
      const p = prob(theta, r.b);
      info += p * (1 - p);
    }
    return { theta, se: 1 / Math.sqrt(info) };
  }

  function catDecision(responses, form) {
    const n = responses.length;
    const { theta, se } = estimate(responses);
    const lo = theta - 1.96 * se, hi = theta + 1.96 * se;
    if (n >= form.max) return { done: true, pass: theta >= PASS_THETA, theta, se, reason: "max" };
    if (n >= form.min && lo > PASS_THETA) return { done: true, pass: true, theta, se, reason: "confident" };
    if (n >= form.min && hi < PASS_THETA) return { done: true, pass: false, theta, se, reason: "confident" };
    return { done: false, theta, se };
  }

  // Next item: the domain furthest behind its exam weight, then the unused
  // question in that domain whose difficulty is closest to your current
  // ability, preferring questions you have never practised.
  function nextCatItem(bank, used, responses, domains, progress, rnd = Math.random) {
    const usedSet = new Set(used);
    const counts = {};
    for (const r of responses) counts[r.d] = (counts[r.d] || 0) + 1;
    const n = responses.length + 1;
    const theta = responses.length ? estimate(responses).theta : 0;
    const order = domains
      .map((d) => ({ n: d.n, deficit: (d.weight / 100) * n - (counts[d.n] || 0) + rnd() * 0.01 }))
      .sort((a, b) => b.deficit - a.deficit);
    for (const d of order) {
      const pool = bank.filter((q) => q.d === d.n && !usedSet.has(q.id));
      if (!pool.length) continue;
      const neverSeen = pool.filter((q) => !progress[q.id]);
      const candidates = neverSeen.length ? neverSeen : pool;
      const best = Math.min(...candidates.map((q) => Math.abs(DIFFICULTY[q.diff] - theta)));
      const closest = candidates.filter((q) => Math.abs(DIFFICULTY[q.diff] - theta) === best);
      return closest[Math.floor(rnd() * closest.length)];
    }
    return null;
  }

  // An estimate on the familiar 0-1000 scale, with 700 at the passing line.
  function scaledScore(theta) {
    const s = 700 + (theta - PASS_THETA) * 110;
    return Math.round(Math.max(0, Math.min(1000, s)) / 10) * 10;
  }

  // Per-domain proficiency in the language of the real score report.
  function domainProficiency(responses, domains) {
    return domains.map((d) => {
      const rs = responses.filter((r) => r.d === d.n);
      if (!rs.length) return { n: d.n, count: 0, correct: 0, level: "none" };
      const { theta } = estimate(rs);
      const correct = rs.filter((r) => r.correct).length;
      const level = theta >= PASS_THETA + 0.35 ? "above" : theta <= PASS_THETA - 0.35 ? "below" : "near";
      return { n: d.n, count: rs.length, correct, level, theta };
    });
  }

  // ---------------------------------------------------------------------
  // The study plan from today to the exam date.
  function studyPlan(examDate, stats, selfRatings, now = Date.now()) {
    const days = Math.ceil((examDate - now) / DAY);
    if (!(days > 0)) return { days: Math.max(days, 0), weeks: [] };
    const order = domainPriority(stats, selfRatings).sort((a, b) => b.p - a.p).map((p) => p.n);
    const weeks = [];
    const totalWeeks = Math.ceil(days / 7);
    const mockWeeks = totalWeeks >= 6 ? 3 : totalWeeks >= 3 ? 2 : 1;
    let k = 0;
    for (let w = 0; w < totalWeeks; w++) {
      const start = now + w * 7 * DAY;
      const remaining = totalWeeks - w;
      if (remaining <= mockWeeks) {
        weeks.push({
          start,
          phase: remaining === 1 ? "final" : "exam",
          focus: order.slice(0, 2),
          note: remaining === 1
            ? "Light review of missed questions and key points. No new material in the last two days; sleep well."
            : "Two full adaptive mocks this week. Review every miss, then drill the domains the score report marks below the line.",
        });
      } else {
        const focus = [order[k % order.length], order[(k + 1) % order.length]];
        k += 2;
        weeks.push({
          start,
          phase: "build",
          focus,
          note: "Read the focus domains, then practise them daily. Smart review keeps the rest from fading.",
        });
      }
    }
    return { days, weeks };
  }

  return {
    DAY, BOX_DAYS, DIFFICULTY, PASS_THETA, FORMS,
    record, domainStats, readiness, shuffle, domainPriority, smartSet,
    prob, estimate, catDecision, nextCatItem, scaledScore, domainProficiency, studyPlan,
  };
})();
