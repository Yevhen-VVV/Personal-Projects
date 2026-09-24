// Tests the web app's answer checker and question logic against the same cases as the iPhone app's
// AnswerMatcherTests.swift, so the two apps grade replies identically.
//
//   node civics-web/matcher.test.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import assert from "node:assert/strict";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

const context = {};
vm.runInNewContext(`${readFileSync(here("./src/matcher.js"), "utf8")}\nthis.AnswerMatcher = AnswerMatcher;`, context);
// Results are built inside the VM, whose arrays fail strict deep-equality against this realm's; copy them out.
const plain = (value) => JSON.parse(JSON.stringify(value));
const AnswerMatcher = {
  check: (...args) => plain(context.AnswerMatcher.check(...args)),
  tokens: (text) => plain(context.AnswerMatcher.tokens(text)),
  requiredTokens: (text) => plain(context.AnswerMatcher.requiredTokens(text)),
};

const bank = JSON.parse(readFileSync(here("../CitizenshipPractice/CitizenshipPractice/Resources/questions.json"), "utf8"));
const normalizeAnswer = (answer) => (typeof answer === "string" ? { text: answer, also: [] } : { also: [], ...answer });
const questions = new Map(bank.questions.map((q) => [q.id, { ...q, answers: (q.answers || []).map(normalizeAnswer) }]));

let failures = 0;
function test(name, body) {
  try {
    body();
  } catch (error) {
    failures += 1;
    console.error(`✗ ${name}\n  ${error.message.split("\n").join("\n  ")}`);
    return;
  }
  console.log(`✓ ${name}`);
}

const person = (name) => {
  const parts = name.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  while (parts.length && ["jr", "jr.", "sr", "sr.", "ii", "iii", "iv"].includes(parts.at(-1).toLowerCase())) parts.pop();
  return { text: name, also: parts.length > 1 ? [parts.at(-1)] : [] };
};

const verdict = (id, reply, answers) => {
  const question = questions.get(id);
  return AnswerMatcher.check(reply, answers ?? question.answers, question.required ?? 1).verdict;
};

test("bank has all 128 questions in order", () => {
  assert.deepEqual([...questions.keys()], Array.from({ length: 128 }, (_, i) => i + 1));
});

test("every official answer, and every extra wording, matches its own question", () => {
  for (const question of questions.values()) {
    for (const answer of question.answers) {
      for (const form of [answer.text, ...answer.also]) {
        assert.equal(AnswerMatcher.check(form, question.answers, 1).verdict, "correct", `Q${question.id}: “${form}”`);
      }
    }
  }
});

test("typical replies, the way people say them", () => {
  const cases = [
    [2, "the constitution", "correct"], [2, "the Declaration of Independence", "incorrect"],
    [2, "", "incorrect"], [2, "I don't know", "incorrect"], [5, "amendments", "correct"],
    [7, "27", "correct"], [7, "twenty-seven", "correct"], [7, "twenty seven amendments", "correct"],
    [7, "26", "incorrect"], [8, "all men are created equal", "correct"], [12, "capitalism", "correct"],
    [12, "a market economy", "correct"], [12, "communism", "incorrect"], [13, "no one is above the law", "correct"],
    [13, "nobody is above the law", "correct"], [15, "so no branch becomes too powerful", "correct"],
    [15, "checks and balances", "correct"], [16, "legislative, executive and judicial", "correct"],
    [16, "legislative and executive", "incorrect"], [19, "the Senate and the House of Representatives", "correct"],
    [19, "the Senate", "incorrect"], [21, "one hundred", "correct"], [21, "100", "correct"],
    [24, "four hundred thirty-five", "correct"], [24, "435", "correct"], [36, "four years", "correct"],
    [36, "4", "correct"], [36, "six years", "incorrect"], [37, "the twenty-second amendment", "correct"],
    [37, "22nd amendment", "correct"], [40, "the vice president", "correct"],
    [40, "the Speaker of the House", "incorrect"], [41, "he can veto bills", "correct"],
    [48, "Secretary of State and Attorney General", "correct"],
    [48, "Secretary of Defense and the Vice President", "correct"], [48, "Secretary of State", "incorrect"],
    [55, "for life", "correct"], [55, "until they retire", "correct"], [55, "ten years", "incorrect"],
    [65, "freedom of speech, freedom of religion, and the right to bear arms", "correct"],
    [65, "freedom of speech", "incorrect"], [66, "the United States", "correct"], [66, "the flag", "correct"],
    [66, "the president", "incorrect"], [67, "obey the laws and defend the Constitution", "correct"],
    [67, "obey the laws", "incorrect"], [78, "Jefferson", "correct"], [78, "Thomas Jeferson", "correct"],
    [78, "George Washington", "incorrect"], [79, "July 4th, 1776", "correct"],
    [79, "the fourth of July 1776", "correct"], [79, "1776", "incorrect"],
    [81, "New York, New Jersey, Virginia, Georgia and Delaware", "correct"],
    [81, "North Carolina South Carolina Georgia Maryland Delaware", "correct"],
    [81, "New York and Virginia", "incorrect"], [81, "New York New Hampshire Texas Florida Ohio", "incorrect"],
    [86, "he was the first president", "correct"], [86, "the father of our country", "correct"],
    [87, "he wrote the Declaration of Independence", "correct"], [87, "third president", "correct"],
    [87, "first president", "incorrect"], [94, "he freed the slaves", "correct"],
    [97, "the fourteenth amendment", "correct"], [97, "the 15th amendment", "incorrect"],
    [100, "World War 2", "correct"], [100, "the Civil War", "incorrect"], [105, "Franklin Roosevelt", "correct"],
    [105, "Lincoln", "incorrect"], [113, "people should not be judged by the color of their skin", "correct"],
    [119, "Washington D.C.", "correct"], [119, "New York", "incorrect"],
    [121, "because there were thirteen original colonies", "correct"], [121, "50 states", "incorrect"],
    [122, "a star for each state", "correct"], [126, "Christmas, Thanksgiving and the Fourth of July", "correct"],
    [126, "MLK day, New Year's day and Juneteenth", "correct"], [126, "Christmas and Thanksgiving", "incorrect"],
    [128, "to honor veterans", "correct"],
  ];
  const wrong = cases.filter(([id, reply, expected]) => verdict(id, reply) !== expected)
    .map(([id, reply, expected]) => `Q${id} “${reply}”: expected ${expected}, got ${verdict(id, reply)}`);
  assert.deepEqual(wrong, []);
});

test("numbers are written as digits", () => {
  assert.deepEqual(AnswerMatcher.tokens("Four hundred thirty-five"), ["435"]);
  assert.deepEqual(AnswerMatcher.tokens("twenty-seven"), ["27"]);
  assert.deepEqual(AnswerMatcher.tokens("the sixteenth president"), ["16", "president"]);
  assert.deepEqual(AnswerMatcher.tokens("22nd Amendment"), ["22", "amendment"]);
  assert.deepEqual(AnswerMatcher.tokens("World War II"), ["world", "war", "2"]);
});

test("words in parentheses are optional", () => {
  assert.deepEqual(AnswerMatcher.requiredTokens("(Thomas) Jefferson"), ["jefferson"]);
  assert.deepEqual(AnswerMatcher.requiredTokens("Senate and House (of Representatives)"), ["senate", "house"]);
  assert.deepEqual(AnswerMatcher.requiredTokens("Obey the laws of the United States"), ["obey", "law"]);
  assert.deepEqual(AnswerMatcher.requiredTokens("The United States"), ["united", "state"]);
});

test("matched answers are reported for highlighting", () => {
  const question = questions.get(81);
  const result = AnswerMatcher.check("Georgia, Delaware", question.answers, question.required);
  assert.deepEqual(result.matched.map((i) => question.answers[i].text).sort(), ["Delaware", "Georgia"]);
  assert.equal(result.verdict, "incorrect");
});

test("officials and local answers accept the surname", () => {
  assert.equal(verdict(38, "Trump", [person("Donald J. Trump")]), "correct");
  assert.equal(verdict(38, "Donald Trump", [person("Donald J. Trump")]), "correct");
  assert.equal(verdict(38, "Biden", [person("Donald J. Trump")]), "incorrect");
  assert.equal(verdict(57, "John Roberts", [person("John G. Roberts, Jr.")]), "correct");
  assert.equal(verdict(23, "Schiff", [person("Alex Padilla"), person("Adam Schiff")]), "correct");
  assert.equal(verdict(62, "Sacramento", []), "unchecked");
});

test("District of Columbia answers", () => {
  assert.equal(verdict(23, "D.C. has no senators", [{ text: "D.C. has no U.S. senators", also: ["no senators", "none"] }]), "correct");
  assert.equal(verdict(61, "there is no governor", [{ text: "D.C. does not have a governor", also: ["no governor", "none"] }]), "correct");
  assert.equal(verdict(62, "St. Paul", [{ text: "Saint Paul", also: ["St. Paul"] }]), "correct");
});

if (failures > 0) {
  console.error(`\n${failures} failed`);
  process.exit(1);
}
console.log("\nAll passed");
