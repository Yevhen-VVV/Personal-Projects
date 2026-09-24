// Builds the single-file web app, civics-web/civics-test.html, from the page template, the answer checker,
// and the same question bank the iPhone app uses.
//
//   node civics-web/build.mjs           write civics-test.html
//   node civics-web/build.mjs --check   fail if civics-test.html is out of date
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

const template = readFileSync(here("./src/app.html"), "utf8");
const matcher = readFileSync(here("./src/matcher.js"), "utf8");
const questions = JSON.parse(readFileSync(here("../CitizenshipPractice/CitizenshipPractice/Resources/questions.json"), "utf8"));

if (questions.questions.length !== 128) throw new Error(`Expected 128 questions, found ${questions.questions.length}`);

// Inside a <script> element, "</" could end the element early, so it is escaped in the JSON.
const bankJSON = JSON.stringify(questions).replace(/</g, "\\u003c");

const placeholders = ["__QUESTIONS__", "/*__MATCHER__*/"];
for (const placeholder of placeholders) {
  if (template.split(placeholder).length !== 2) throw new Error(`Template must contain ${placeholder} exactly once`);
}

const header = "<!-- Built by civics-web/build.mjs from civics-web/src. Edit those files, not this one. -->\n";
// Placed after the <title> so it stays within the first lines of the file.
const [titleLine, ...rest] = template.split("\n");
const output = [titleLine, header + rest.join("\n")].join("\n")
  .replace("__QUESTIONS__", () => bankJSON)
  .replace("/*__MATCHER__*/", () => matcher.trim());

const target = here("./civics-test.html");
if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(target, "utf8"); } catch { /* missing counts as out of date */ }
  if (current !== output) {
    console.error("civics-web/civics-test.html is out of date. Run: node civics-web/build.mjs");
    process.exit(1);
  }
  console.log("civics-test.html is up to date");
} else {
  writeFileSync(target, output);
  console.log(`Wrote civics-web/civics-test.html (${(output.length / 1024).toFixed(0)} KB)`);
}
