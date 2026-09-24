// Decides whether a typed or spoken reply gives an accepted answer. A port of the iPhone app's
// AnswerMatcher.swift, kept behaviour-for-behaviour identical so both apps agree.
//
// The interview is spoken and the officer accepts an answer in the applicant's own words, so this is
// deliberately forgiving: word order, filler words, plurals, a typo, and numbers said as words
// ("twenty-seven") all still match. Words the official list puts in parentheses are optional.
//
// A plain script rather than a module: the build inlines it into the page, and the tests load it in a VM.
// eslint-disable-next-line no-unused-vars -- used by the page's own script
const AnswerMatcher = (() => {
  const SMALL = new Map(Object.entries({
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
    eighteen: 18, nineteen: 19,
  }));
  const TENS = new Map(Object.entries({
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  }));
  const ORDINALS = new Map(Object.entries({
    first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
    eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16,
    seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20, thirtieth: 30, fortieth: 40, fiftieth: 50,
  }));
  // "World War I" and "World War II": Roman numerals only mean numbers straight after "war".
  const ROMAN = new Map([["i", "1"], ["ii", "2"]]);

  // Words that carry no meaning for matching. "Day" and "year" are here so that "Christmas" answers
  // "Christmas Day" and "six" answers "Six (6) years".
  const STOP_WORDS = new Set(`a an the of to and or in on for by is are was were be been being it its they
    their them that this these those from with as at so do does did has have had who what which because
    there he she his her we our you your i me my also about into if than can will would should could day
    year says say just like think`.split(/\s+/).filter(Boolean));

  // Dropped from an answer's required words when something else is left, because people leave them out.
  const CONTEXT_WORDS = new Set(["us", "america", "american"]);

  function numberWord(word) {
    if (SMALL.has(word)) return { kind: "small", value: SMALL.get(word) };
    if (TENS.has(word)) return { kind: "tens", value: TENS.get(word) };
    if (ORDINALS.has(word)) return { kind: "ordinal", value: ORDINALS.get(word) };
    if (word === "hundred") return { kind: "hundred", value: 100 };
    if (word === "thousand") return { kind: "thousand", value: 1000 };
    return null;
  }

  // Whether `word` can continue a number that ended with `previous`.
  function canFollow(previous, word) {
    if (!previous) return true;
    switch (previous.kind) {
      case "small":
        return word.kind === "hundred" || word.kind === "thousand";
      case "tens":
        return (word.kind === "small" || word.kind === "ordinal") && word.value >= 1 && word.value <= 9;
      case "hundred":
        return ["small", "tens", "ordinal", "thousand"].includes(word.kind);
      case "thousand":
        return ["small", "tens", "ordinal", "hundred"].includes(word.kind);
      default:
        return false;
    }
  }

  // "four hundred thirty five" → "435", "twenty second" → "22".
  function writingNumbersAsDigits(words) {
    const output = [];
    let index = 0;
    while (index < words.length) {
      if (!numberWord(words[index])) {
        output.push(words[index]);
        index += 1;
        continue;
      }
      let total = 0;
      let current = 0;
      let previous = null;
      while (index < words.length) {
        const word = numberWord(words[index]);
        if (!word || !canFollow(previous, word)) break;
        if (word.kind === "hundred") current = Math.max(current, 1) * 100;
        else if (word.kind === "thousand") {
          total += Math.max(current, 1) * 1000;
          current = 0;
        } else current += word.value;
        previous = word;
        index += 1;
        if (word.kind === "ordinal") break;
      }
      output.push(String(total + current));
    }
    return output;
  }

  // A deliberately crude plural stripper. It only has to treat the reply and the answer the same way.
  function stem(word) {
    if (word.length <= 3) return word;
    if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
    for (const suffix of ["sses", "xes", "ches", "shes"]) {
      if (word.endsWith(suffix)) return word.slice(0, -2);
    }
    if (word.endsWith("ss") || word.endsWith("us") || word.endsWith("is")) return word;
    if (word.endsWith("s")) return word.slice(0, -1);
    return word;
  }

  function normalize(word) {
    // "4th" → "4", "1800s" → "1800"
    if (/^\d/.test(word)) {
      const match = /^(\d+)(st|nd|rd|th|s)?$/.exec(word);
      return match ? match[1] : word;
    }
    return stem(word);
  }

  // Lowercased, stemmed content words, with numbers written as digits.
  function tokens(text) {
    let s = String(text).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
    s = s.replace(/’/g, "'")
      .replace(/n't/g, " not")
      .replace(/'s/g, " ")
      .replace(/\./g, "")
      .replace(/&/g, " and ")
      .replace(/[^\p{L}\p{N}]+/gu, " ");
    const words = s.split(" ").filter(Boolean);
    for (let index = 1; index < words.length; index += 1) {
      if (words[index - 1] === "war" && ROMAN.has(words[index])) words[index] = ROMAN.get(words[index]);
    }
    const result = [];
    for (const word of writingNumbersAsDigits(words)) {
      const normalized = normalize(word);
      if (STOP_WORDS.has(word) || STOP_WORDS.has(normalized)) continue;
      result.push(normalized);
    }
    return result;
  }

  function removingParentheticals(text) {
    return text.replace(/\([^)]*\)/g, " ");
  }

  // The words of an answer that a reply has to contain. Parenthesised words are optional, and
  // "United States" or "American" is dropped when anything else is left: "Obey the laws of the
  // United States" is answered by "obey the law".
  function requiredTokens(answer) {
    let base = tokens(removingParentheticals(answer));
    if (base.length === 0) base = tokens(answer.replace(/[()]/g, " "));
    const trimmed = [];
    for (let index = 0; index < base.length; index += 1) {
      if (base[index] === "united" && base[index + 1] === "state") {
        index += 1;
        continue;
      }
      if (!CONTEXT_WORDS.has(base[index])) trimmed.push(base[index]);
    }
    return trimmed.length > 0 ? trimmed : base;
  }

  function editDistance(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i += 1) {
      const current = [i];
      for (let j = 1; j <= b.length; j += 1) {
        current[j] = Math.min(
          previous[j] + 1,
          current[j - 1] + 1,
          previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
      }
      previous = current;
    }
    return previous[b.length];
  }

  // Equal, or a small typo apart. Numbers must match exactly.
  function similar(a, b) {
    if (a === b) return true;
    if (/^\d+$/.test(a) || /^\d+$/.test(b)) return false;
    const longer = Math.max(a.length, b.length);
    if (longer < 5) return false;
    return editDistance(a, b) <= (longer >= 9 ? 2 : 1);
  }

  // Short answers must be matched in full ("Senate and House" needs both). Longer ones need about 70%
  // of their words, so a natural paraphrase of a sentence-length answer still counts.
  function neededCount(count) {
    return count <= 2 ? count : Math.ceil(count * 0.7 - 1e-9);
  }

  function matches(replyTokens, form) {
    const required = requiredTokens(form);
    if (required.length === 0) return false;
    const found = required.filter((token) => replyTokens.some((word) => similar(word, token))).length;
    return found >= neededCount(required.length);
  }

  // answers: [{text, also: [...]}]. Returns {verdict: "correct" | "incorrect" | "unchecked", matched, required}.
  // "unchecked" means there is nothing to check against: the answer depends on details not entered yet.
  function check(reply, answers, required = 1) {
    if (answers.length === 0) return { verdict: "unchecked", matched: [], required };
    const replyTokens = tokens(reply);
    if (replyTokens.length === 0) return { verdict: "incorrect", matched: [], required };
    const matched = [];
    answers.forEach((answer, index) => {
      const forms = [answer.text, ...(answer.also || [])];
      if (forms.some((form) => matches(replyTokens, form))) matched.push(index);
    });
    const verdict = matched.length >= Math.max(required, 1) ? "correct" : "incorrect";
    return { verdict, matched, required };
  }

  return { check, tokens, requiredTokens };
})();
