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

  // ---------------------------------------------------------------------
  // The Arcade: seeded draws, the daily five, survival's difficulty ramp,
  // confidence bets, experience levels and the game record.

  // A seeded generator (a string hash feeding mulberry32), so every device
  // draws the same daily set and a question's study order never changes.
  function seeded(seed) {
    let h = 2166136261;
    for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    let a = h >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Five questions for the day, the same on every device: five different
  // domains drawn by exam weight, one medium or hard question from each.
  function dailyPick(bank, dateKey, domains, n = 5) {
    const rnd = seeded("daily:" + dateKey);
    let left = domains.map((d) => ({ n: d.n, p: d.weight }));
    const out = [];
    while (out.length < n && left.length) {
      const d = pickWeighted(left, rnd);
      left = left.filter((x) => x.n !== d.n);
      const pool = bank.filter((q) => q.d === d.n && q.diff >= 2);
      if (pool.length) out.push(pool[Math.floor(rnd() * pool.length)]);
    }
    return out;
  }

  // Survival gets harder the longer you last: easy and medium questions
  // first, then medium and hard, then hard only. Questions you have not yet
  // answered correctly come first.
  function survivalTiers(score) {
    return score < 4 ? [1, 2] : score < 10 ? [2, 3] : [3];
  }
  function survivalPick(bank, progress, used, score, rnd = Math.random) {
    const usedSet = new Set(used);
    const open = bank.filter((q) => !usedSet.has(q.id));
    if (!open.length) return null;
    const tiers = survivalTiers(score);
    const tiered = open.filter((q) => tiers.includes(q.diff));
    const pool = tiered.length ? tiered : open;
    const unsettled = pool.filter((q) => !progress[q.id] || progress[q.id][3] === 0);
    const from = unsettled.length ? unsettled : pool;
    return from[Math.floor(rnd() * from.length)];
  }

  // Confidence bets: [points if right, points if wrong]. The payoffs make an
  // honest bet the best bet: "Guess" pays most below 50% certainty, "Likely"
  // between 50% and 83%, and "Sure" only above 83%.
  const BETS = { 1: [1, 0], 2: [2, -1], 3: [3, -6] };
  const betPoints = (bet, correct) => (BETS[bet] || BETS[1])[correct ? 0 : 1];

  // calib holds [answered, right] for each bet level.
  function calibration(calib = {}) {
    const levels = [1, 2, 3].map((bet) => {
      const [n, right] = calib[bet] || [0, 0];
      return { bet, n, right, rate: n ? right / n : null };
    });
    const [guess, , sure] = levels;
    let verdict = "Bet on at least ten answers as Sure to see how well your confidence matches your accuracy.";
    if (sure.n >= 10) {
      if (sure.rate < 0.8) verdict = "Overconfident: too many of your Sure answers are wrong. On the exam, reread the questions that feel obvious.";
      else if (guess.n >= 8 && guess.rate > 0.6) verdict = "Underconfident: most of your guesses are right. Your first line of reasoning is better than you think.";
      else verdict = "Well calibrated: your confidence matches your accuracy.";
    }
    return { levels, verdict };
  }

  // Experience: 10 points for a right answer plus 5 per difficulty step, 2
  // for a miss. Level L starts at 50·L·(L−1) points, so each level needs 100
  // more than the last; a steady 30 questions a day reaches about level 20
  // in two months.
  const xpFor = (correct, diff = 2) => (correct ? 10 + 5 * (diff - 1) : 2);
  const levelFloor = (level) => 50 * level * (level - 1);
  const LEVEL_TITLES = [[1, "Intern"], [3, "Analyst"], [6, "Engineer"], [9, "Architect"], [12, "Manager"], [15, "Director"], [18, "CISO"], [22, "Board advisor"]];
  function levelFor(xp) {
    let level = 1;
    while (levelFloor(level + 1) <= xp) level++;
    const title = LEVEL_TITLES.filter(([l]) => l <= level).pop()[1];
    const floor = levelFloor(level), next = levelFloor(level + 1);
    return { level, title, floor, next, into: xp - floor, span: next - floor };
  }

  // How many steps of an ordering are in the right place.
  function orderScore(answer, correct) {
    return answer.reduce((n, x, i) => n + (x === correct[i] ? 1 : 0), 0);
  }

  // Two copies of the game record (two devices) merge by keeping the larger
  // of each figure: counts only ever grow. Pairs such as [answered, right]
  // keep the copy with more answered; a day's Daily 5 keeps the better score.
  function mergeGame(a, b) {
    if (a == null) return b;
    if (b == null) return a;
    if (typeof a === "number" && typeof b === "number") return Math.max(a, b);
    if (Array.isArray(a) && Array.isArray(b)) return (b[0] || 0) > (a[0] || 0) ? b : a;
    if (typeof a === "object" && typeof b === "object") {
      const out = { ...a };
      for (const k of Object.keys(b)) out[k] = mergeGame(a[k], b[k]);
      return out;
    }
    return b;
  }

  // ---------------------------------------------------------------------
  // The Oracle: a deck of 22 Major Arcana, each an archetype carrying one
  // cluster of exam objectives. A card's state comes from your latest answers
  // on its objectives; the daily spread and the Shadow are drawn from it.

  // seen: questions answered on the card's objectives; latest: share right on
  // the latest try; state: veiled (under 3 seen), upright, wavering, reversed.
  function cardMastery(card, bank, progress) {
    const objs = new Set(card.objectives);
    let total = 0, seen = 0, latest = 0, first = 0;
    for (const q of bank) {
      if (!objs.has(q.obj)) continue;
      total++;
      const r = progress[q.id];
      if (!r) continue;
      seen++;
      latest += r[3];
      first += r[2];
    }
    const rate = seen ? latest / seen : null;
    const smoothed = (first + PRIOR_RATE * PRIOR_WEIGHT) / (seen + PRIOR_WEIGHT);
    const state = seen < 3 ? "veiled" : rate >= 0.75 ? "upright" : rate < 0.5 ? "reversed" : "wavering";
    return { n: card.n, total, seen, rate, smoothed, state };
  }

  // The Shadow is the card you are weakest on, once there is enough evidence:
  // at least 20 answers in all and 3 on the card. Ties break by seeded draw.
  function shadowCard(masteries, dateKey = "") {
    const answered = masteries.reduce((n, m) => n + m.seen, 0);
    const known = masteries.filter((m) => m.seen >= 3);
    if (answered < 20 || !known.length) return null;
    const rnd = seeded("shadow:" + dateKey);
    const ranked = known.map((m) => ({ m, k: m.smoothed + rnd() * 1e-6 })).sort((a, b) => a.k - b.k);
    return ranked[0].m.n;
  }

  // Three cards a day, the same on every device: the Past is drawn from what
  // you have integrated (strongest), the Present from the middle, the Future
  // from what you are weakest on, skipping the Shadow. Without data, the
  // draw is simply seeded by the date.
  function dailySpread(masteries, dateKey, shadow = null) {
    const rnd = seeded("spread:" + dateKey);
    const pool = masteries.filter((m) => m.n !== shadow).map((m) => ({ n: m.n, k: (m.seen >= 3 ? m.smoothed : 0.6) + rnd() * 0.08 }));
    pool.sort((a, b) => a.k - b.k);
    const third = Math.max(1, Math.floor(pool.length / 3));
    const pick = (list) => list[Math.floor(rnd() * list.length)].n;
    const future = pick(pool.slice(0, third));
    const past = pick(pool.slice(-third).filter((x) => x.n !== future));
    const mid = pool.slice(third, -third).filter((x) => x.n !== future && x.n !== past);
    const present = pick(mid.length ? mid : pool.filter((x) => x.n !== future && x.n !== past));
    return [past, present, future];
  }

  // A question for a card: never seen first, then latest-wrong, then the
  // longest unseen; a seeded draw among the best candidates.
  function cardQuestion(card, bank, progress, seedKey, exclude = []) {
    const objs = new Set(card.objectives);
    const skip = new Set(exclude);
    const pool = bank.filter((q) => objs.has(q.obj) && !skip.has(q.id));
    if (!pool.length) return null;
    const rank = (q) => {
      const r = progress[q.id];
      return !r ? 0 : r[3] === 0 ? 1 : 2 + 1 / (1 + (r[4] || 0) / DAY);
    };
    const best = Math.min(...pool.map(rank));
    const top = pool.filter((q) => rank(q) === best);
    const rnd = seeded("q:" + seedKey);
    return top[Math.floor(rnd() * top.length)];
  }

  // Two copies of the Oracle record merge day by day, keeping the further
  // along of each day's reading; integrated Shadows are a union.
  function mergeOracle(a, b) {
    if (!a) return b;
    if (!b) return a;
    const progress = (r) => (r.results || []).filter((x) => x != null).length * 2 + (r.flipped || []).filter(Boolean).length + (r.oracle ? 10 : 0);
    const readings = { ...(a.readings || {}) };
    for (const [day, r] of Object.entries(b.readings || {})) if (!readings[day] || progress(r) > progress(readings[day])) readings[day] = r;
    const sa = a.shadows || {}, sb = b.shadows || {};
    return {
      ...a,
      readings,
      shadows: { attempts: Math.max(sa.attempts || 0, sb.attempts || 0), wins: { ...(sb.wins || {}), ...(sa.wins || {}) } },
      updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0),
    };
  }

  // The card face as an SVG string. The art is always a night sky, whatever
  // the page theme. A reversed card is drawn upside down, as in a real reading.
  const GOLD = "#dcb86c", PALE = "#f5ead0";
  function cardSvg(card, { reversed = false, back = false, gilded = false, uid = "" } = {}) {
    const id = `c${card ? card.n : "b"}${uid}`;
    const hue = back || !card ? 248 : card.hue;
    const rnd = seeded("stars:" + (back || !card ? "back" : card.id));
    let stars = "";
    for (let i = 0; i < 16; i++) {
      // Stars stay clear of the numeral and the name.
      const x = 16 + rnd() * 108, y = 38 + rnd() * 130, r = 0.35 + rnd() * 0.8;
      stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${PALE}" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>`;
    }
    const frame = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="hsl(${hue} 46% 17%)"/><stop offset="1" stop-color="hsl(${(hue + 28) % 360} 52% 7%)"/></linearGradient>
      <radialGradient id="${id}h" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="hsl(${hue} 70% 70%)" stop-opacity="0.32"/><stop offset="1" stop-color="hsl(${hue} 70% 70%)" stop-opacity="0"/></radialGradient></defs>
      <rect x="0" y="0" width="140" height="230" rx="10" fill="url(#${id}g)"/>${stars}
      <rect x="5" y="5" width="130" height="220" rx="7" fill="none" stroke="${GOLD}" stroke-width="${gilded ? 2.6 : 1.1}"/>
      <rect x="10" y="10" width="120" height="210" rx="5" fill="none" stroke="${GOLD}" stroke-width="0.5" opacity="0.6"/>`;
    let body;
    if (back || !card) {
      body = `<circle cx="70" cy="115" r="54" fill="url(#${id}h)"/>
        <g fill="none" stroke="${GOLD}" stroke-width="1.4" stroke-linecap="round">
          <circle cx="70" cy="115" r="40" opacity="0.7"/><circle cx="70" cy="115" r="30" opacity="0.45"/>
          <path d="M38 115 Q70 88 102 115 Q70 142 38 115 Z"/><circle cx="70" cy="115" r="9"/><circle cx="70" cy="115" r="3" fill="${GOLD}"/>
          <path d="M70 61 V71 M70 159 V169 M16 115 H26 M114 115 H124"/></g>
        <text x="70" y="208" text-anchor="middle" font-family="Literata, Georgia, serif" font-size="8" letter-spacing="3" fill="${GOLD}" opacity="0.8">ARCANA</text>`;
    } else {
      body = `<text x="70" y="29" text-anchor="middle" font-family="Literata, Georgia, serif" font-size="13" letter-spacing="2" fill="${GOLD}">${card.numeral}</text>
        <circle cx="70" cy="100" r="50" fill="url(#${id}h)"/>
        <g transform="translate(20 50)" fill="none" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" color="${GOLD}">${card.glyph}</g>
        <text x="70" y="186" text-anchor="middle" font-family="Literata, Georgia, serif" font-size="${card.name.length > 15 ? 8.6 : card.name.length > 12 ? 10 : 11}" letter-spacing="1.1" fill="${PALE}">${card.name.toUpperCase()}</text>
        <line x1="44" y1="194" x2="96" y2="194" stroke="${GOLD}" stroke-width="0.5" opacity="0.6"/>
        <text x="70" y="207" text-anchor="middle" font-family="Archivo, system-ui, sans-serif" font-size="6.6" letter-spacing="0.6" fill="${GOLD}" opacity="0.85">${card.archetype.toUpperCase()}</text>`;
    }
    const inner = reversed ? `<g transform="rotate(180 70 115)">${body}</g>` : body;
    return `<svg class="tarot" viewBox="0 0 140 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${back || !card ? "A face-down card" : `${card.name}${reversed ? ", reversed" : ""}`}">${frame}${inner}</svg>`;
  }

  return {
    DAY, BOX_DAYS, DIFFICULTY, PASS_THETA, FORMS, BETS,
    cardMastery, shadowCard, dailySpread, cardQuestion, cardSvg, mergeOracle,
    record, domainStats, readiness, shuffle, domainPriority, smartSet,
    prob, estimate, catDecision, nextCatItem, scaledScore, domainProficiency, studyPlan,
    seeded, dailyPick, survivalTiers, survivalPick, betPoints, calibration,
    xpFor, levelFor, orderScore, mergeGame,
  };
})();
