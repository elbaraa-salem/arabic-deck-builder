// import { loadLesson } from "./parser/lesson.parser.ts";
// import { planSlides } from "./planner/slide-planner.ts";
// import { renderPresentation } from "./presentation/render-presentation.ts";

// const lesson = await loadLesson("lessons/A0-L02.yaml");

// const slides = planSlides(lesson);

// console.log(`Slides: ${slides.length}`);

// await renderPresentation(slides, "output/A0-L02.pptx");

// console.log("Successful");

// -----------

import { mkdir } from "node:fs/promises";

import { basename, extname, join } from "node:path";

import { loadLesson } from "./parser/lesson.parser.ts";

import { planSlides } from "./planner/slide-planner.ts";

import { renderPresentation } from "./presentation/render-presentation.ts";

const lessonPath = process.argv[2];

if (!lessonPath) {
  console.error("Usage: npm run generate -- lessons/A0-L02.yaml");

  process.exit(1);
}

const extension = extname(lessonPath);

if (extension !== ".yaml" && extension !== ".yml") {
  console.error("Lesson file must be a YAML file (.yaml or .yml).");

  process.exit(1);
}

const lessonName = basename(lessonPath, extension);

const outputDirectory = "output";

const outputPath = join(outputDirectory, `${lessonName}.pptx`);

await mkdir(outputDirectory, {
  recursive: true,
});

console.log(`Loading lesson: ${lessonPath}`);

const lesson = await loadLesson(lessonPath);

const slides = planSlides(lesson);

console.log(`Slides planned: ${slides.length}`);

console.log(`Generating: ${outputPath}`);

await renderPresentation(slides, outputPath);

console.log(`Successful: ${outputPath}`);
