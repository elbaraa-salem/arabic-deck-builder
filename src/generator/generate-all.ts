import { readdir } from "node:fs/promises";

import { join } from "node:path";

import { generateLesson } from "./generate-lesson.ts";

const lessonsDirectory = "lessons";

const files = await readdir(lessonsDirectory);

const lessonFiles = files
  .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
  .sort();

if (lessonFiles.length === 0) {
  console.log("No lesson files found.");

  process.exit(0);
}

console.log(`Found ${lessonFiles.length} lesson(s).`);

console.log("");

let successful = 0;

let failed = 0;

for (const file of lessonFiles) {
  const lessonPath = join(lessonsDirectory, file);

  console.log(`Generating: ${file}`);

  try {
    const result = await generateLesson(lessonPath);

    successful += 1;

    console.log(`  ✓ ${result.slideCount} slides`);

    console.log(`  ✓ ${result.outputPath}`);
  } catch (error) {
    failed += 1;

    console.error(`  ✗ Failed`);

    console.error(`  ${error instanceof Error ? error.message : error}`);
  }

  console.log("");
}

console.log("Generation summary");

console.log(`Successful: ${successful}`);

console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}
