import { readdir } from "node:fs/promises";

import { join } from "node:path";

import { formatPreflightIssue } from "./format-issue.ts";

import { preflightLesson } from "./preflight.ts";

const lessonsDirectory = "lessons";

const files = await readdir(lessonsDirectory);

const lessonFiles = files
  .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
  .sort();

if (lessonFiles.length === 0) {
  console.log("No lesson files found.");

  process.exit(0);
}

console.log(`Checking ${lessonFiles.length} lesson(s).`);

console.log("");

let passed = 0;

let failed = 0;

for (const file of lessonFiles) {
  const lessonPath = join(lessonsDirectory, file);

  const result = await preflightLesson(lessonPath);

  if (result.ok) {
    passed += 1;

    console.log(`✓ ${file}`);

    console.log(`  Slides: ${result.slideCount}`);

    console.log(`  Visuals: ${result.visualCount}`);
  } else {
    failed += 1;

    console.log(`✗ ${file}`);

    for (const issue of result.issues) {
      console.log(`  ${formatPreflightIssue(issue)}`);
    }
  }

  console.log("");
}

console.log("Preflight summary");

console.log(`Passed: ${passed}`);

console.log(`Failed: ${failed}`);

console.log(`Total: ${lessonFiles.length}`);

if (failed > 0) {
  process.exit(1);
}
