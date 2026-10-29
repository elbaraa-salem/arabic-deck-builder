import { loadLesson } from "./parser/lesson.parser.ts";
import { planSlides } from "./planner/slide-planner.ts";
import { renderPresentation } from "./presentation/render-presentation.ts";

const lesson = await loadLesson("lessons/A0-L02.yaml");

const slides = planSlides(lesson);

console.log(`Slides: ${slides.length}`);

await renderPresentation(slides, "output/A0-L02.pptx");

console.log("Successful");
