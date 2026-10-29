import { loadLesson } from "./parser/lesson.parser.ts";
import { planSlides } from "./planner/slide-planner.ts";

const lesson = await loadLesson("lessons/A0-L02.yaml");

console.log("Arabic Deck Builder");
console.log("-------------------");

console.log(`Lesson: ${lesson.id}`);
console.log(`Title: ${lesson.title}`);
console.log(`Level: ${lesson.level}`);
console.log(`Goal: ${lesson.goal}`);

console.log("");
console.log(`Activities: ${lesson.activities.length}`);

for (const activity of lesson.activities) {
  console.log(`- ${activity.type}`);
}

console.log("---------------------------------------\n");

const slides = planSlides(lesson);

console.log(`Slides: ${slides.length}`);

for (const slide of slides) {
  console.log(`- ${slide.type}`);
}
