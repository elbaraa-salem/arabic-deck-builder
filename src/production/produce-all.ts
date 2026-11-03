import { readdir } from "node:fs/promises";

import { join } from "node:path";

import { generateLesson } from "../generator/generate-lesson.ts";

import { formatPreflightIssue } from "../validation/format-issue.ts";

import { preflightLesson } from "../validation/preflight.ts";

const lessonsDirectory = "lessons";

const files = await readdir(lessonsDirectory);

const lessonFiles = files
  .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
  .sort();

if (lessonFiles.length === 0) {
  console.log("No lesson files found.");

  process.exit(0);
}

console.log(`Production preflight: ${lessonFiles.length} lesson(s).`);

console.log("");

let preflightPassed = 0;

let preflightFailed = 0;

for (const file of lessonFiles) {
  const lessonPath = join(lessonsDirectory, file);

  const result = await preflightLesson(lessonPath);

  if (result.ok) {
    preflightPassed += 1;

    console.log(`✓ ${file}`);

    console.log(`  Slides: ${result.slideCount}`);

    console.log(`  Images: ${result.imageCount}`);
  } else {
    preflightFailed += 1;

    console.log(`✗ ${file}`);

    for (const issue of result.issues) {
      console.log(`  ${formatPreflightIssue(issue)}`);
    }
  }

  console.log("");
}

console.log("Preflight summary");

console.log(`Passed: ${preflightPassed}`);

console.log(`Failed: ${preflightFailed}`);

console.log(`Total: ${lessonFiles.length}`);

if (preflightFailed > 0) {
  console.log("");

  console.error("Production stopped because preflight failed.");

  console.error("No presentations were generated.");

  process.exit(1);
}

console.log("");
console.log("All lessons passed preflight.");

console.log("Starting presentation generation...");

console.log("");

let generated = 0;

let generationFailed = 0;

for (const file of lessonFiles) {
  const lessonPath = join(lessonsDirectory, file);

  console.log(`Generating: ${file}`);

  try {
    const result = await generateLesson(lessonPath);

    generated += 1;

    console.log(`  ✓ ${result.slideCount} slides`);

    console.log(`  ✓ ${result.outputPath}`);
  } catch (error) {
    generationFailed += 1;

    console.error("  ✗ Generation failed");

    console.error(
      `  ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  console.log("");
}

console.log("Production summary");

console.log(`Generated: ${generated}`);

console.log(`Failed: ${generationFailed}`);

console.log(`Total: ${lessonFiles.length}`);

if (generationFailed > 0) {
  process.exit(1);
}

console.log("");

console.log("Production completed successfully.");
