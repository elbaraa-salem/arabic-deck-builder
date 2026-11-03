import { generateLesson } from "./generator/generate-lesson.ts";

const lessonPath = process.argv[2];

if (!lessonPath) {
  console.error("Usage: npm run generate -- lessons/A0-L02.yaml");

  process.exit(1);
}

try {
  console.log(`Loading: ${lessonPath}`);

  const result = await generateLesson(lessonPath);

  console.log(`Slides: ${result.slideCount}`);

  console.log(`Generated: ${result.outputPath}`);
} catch (error) {
  console.error("Generation failed.");

  console.error(error instanceof Error ? error.message : error);

  process.exit(1);
}
