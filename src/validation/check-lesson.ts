import { formatPreflightIssue } from "./format-issue.ts";

import { preflightLesson } from "./preflight.ts";

const lessonPath = process.argv[2];

if (!lessonPath) {
  console.error("Usage: npm run check -- lessons/A0-L02.yaml");

  process.exit(1);
}

const result = await preflightLesson(lessonPath);

console.log("");

console.log(`Lesson: ${result.lessonPath}`);

if (!result.ok) {
  console.log("Status: FAILED");

  console.log("");

  for (const issue of result.issues) {
    console.error(formatPreflightIssue(issue));
  }

  process.exit(1);
}

console.log("Status: OK");

console.log(`Slides: ${result.slideCount}`);

console.log(`Visuals: ${result.visualCount}`);

console.log("");

console.log("Preflight passed.");
