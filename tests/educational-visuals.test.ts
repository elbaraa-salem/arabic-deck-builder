import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { lessonSchema } from "../src/schema/lesson.schema.ts";
import { educationalVisualSchema } from "../src/schema/visual.schema.ts";
import { planSlides } from "../src/planner/slide-planner.ts";
import { createNumberSvg } from "../src/visuals/number.ts";
import { renderPresentation } from "../src/presentation/render-presentation.ts";
import { preflightLesson } from "../src/validation/preflight.ts";

const clock = { type: "clock", hour: 10, minute: 30 };
const number = { type: "number", value: 1200 };
const lesson = (activities: unknown[]) => ({
  id: "visual-test", level: "A0", title: "Test", goal: "Test", activities,
});
const required = { type: "question_reveal", question: "Q", answer: "A" };
const slots = [
  { base: { type: "introduce", arabic: "A" }, required: true },
  { base: required, required: true },
  { base: { type: "dialogue_build", speakers: { A: "A", B: "B" }, segments: [{ lines: [{ speaker: "A", arabic: "A" }] }] } },
  { base: { type: "recall", answer: "A" }, nested: "prompt", content: { question: "Q" } },
  { base: { type: "discriminate", choices: ["A", "B"], answer: "A" }, nested: "prompt", content: { question: "Q" } },
  { base: { type: "transform", instruction: "I", model: "M", answer: "A" }, nested: "cue", content: { text: "T" } },
  { base: { type: "personalize" }, nested: "prompt", content: { question: "Q" } },
  { base: { type: "interpret", passage: "P", question: "Q", choices: ["A", "B"], answer: "A" } },
  { base: { type: "information_gap", instruction: "I", facts: [{ label: "L", answer: "A" }, { label: "L", value: "V" }] } },
  { base: { type: "role_play", instruction: "I", situation: "S", roles: { student: "S", partner: "P" }, goals: ["G"] } },
  { base: { type: "error_correction", instruction: "I", incorrect: "I", correction: "C" } },
];

test("every existing visual slot enforces exclusivity and normalizes sources", () => {
  for (const slot of slots) {
    for (const source of [{ image: "book" }, { visual: clock }, {}]) {
      const activity = slot.nested
        ? { ...slot.base, [slot.nested]: { ...slot.content, ...source } }
        : { ...slot.base, ...source };
      const parsed = lessonSchema.safeParse(lesson([activity]));
      assert.equal(parsed.success, !(slot.required && Object.keys(source).length === 0));
      if (parsed.success) {
        const slide = planSlides(parsed.data)[0];
        const visual = slide.type === "transform" ? slide.cue.visual : Reflect.get(slide, "visual");
        assert.deepEqual(visual, "image" in source ? { kind: "asset", key: "book" }
          : "visual" in source ? { kind: "generated", spec: clock } : undefined);
      }
    }
    const both = { image: "book", visual: clock };
    const activity = slot.nested ? { ...slot.base, [slot.nested]: { ...slot.content, ...both } } : { ...slot.base, ...both };
    assert.equal(lessonSchema.safeParse(lesson([activity])).success, false);
  }
  const item = { text: "T", visual: number };
  const activity = { type: "noticing", instruction: "I", question: "Q", insight: "I", items: [item, item] };
  const slide = planSlides(lessonSchema.parse(lesson([activity])))[0];
  assert.equal(slide.type, "noticing");
  if (slide.type === "noticing") assert.deepEqual(slide.items[0].visual, { kind: "generated", spec: number });
  assert.equal(lessonSchema.safeParse(lesson([{ ...activity, items: [{ ...item, image: "book" }, item] }])).success, false);
});

test("visual bounds reject malformed data and support all non-negative safe integers", () => {
  for (const spec of [clock, number, { type: "clock", hour: 0, minute: 0 }, { type: "clock", hour: 23, minute: 59 }, { type: "number", value: 0 }, { type: "number", value: Number.MAX_SAFE_INTEGER }]) {
    assert.equal(educationalVisualSchema.safeParse(spec).success, true);
  }
  for (const spec of [{ ...clock, hour: 24 }, { ...clock, hour: -1 }, { ...clock, minute: 60 }, { ...clock, minute: 1.5 }, { ...number, value: -1 }, { ...number, value: 1.5 }, { ...number, value: Number.MAX_SAFE_INTEGER + 1 }, { ...number, value: Infinity }, { ...number, value: "1200" }]) {
    assert.equal(educationalVisualSchema.safeParse(spec).success, false);
  }
  assert.match(createNumberSvg(1200), /١٢٠٠/);
  assert.match(createNumberSvg(Number.MAX_SAFE_INTEGER), /٩٠٠٧١٩٩٢٥٤٧٤٠٩٩١/);
  assert.match(createNumberSvg(Number.MAX_SAFE_INTEGER), /font-size="30"/);
});

test("structured visuals generate, while asset and rendering failures stay distinct", async () => {
  const directory = mkdtempSync(join(tmpdir(), "educational-visuals-"));
  try {
    const path = join(directory, "structured.yaml");
    writeFileSync(path, JSON.stringify(lesson([{ ...required, visual: clock }, { ...required, visual: number }, { ...required, visual: { type: "number", value: Number.MAX_SAFE_INTEGER } }])));
    assert.equal((await preflightLesson(path)).ok, true);
    const slides = planSlides(lessonSchema.parse(lesson([{ ...required, visual: clock }, { ...required, visual: number }, { ...required, visual: { type: "number", value: Number.MAX_SAFE_INTEGER } }])));
    assert.equal(slides.length, 6);
    await renderPresentation(slides, join(directory, "structured.pptx"));
    writeFileSync(path, JSON.stringify(lesson([{ ...required, image: "missing-visual-test-asset" }])));
    assert.equal((await preflightLesson(path)).issues[0].type, "asset");
    writeFileSync(path, JSON.stringify(lesson([{ ...required, visual: clock }])));
    // A file blocking the output directory simulates a real generated-file failure.
    writeFileSync(join(directory, "output"), "blocked");
    const moduleUrl = pathToFileURL(resolve("src/validation/preflight.ts")).href;
    const result = execFileSync(process.execPath, ["--input-type=module", "-e", `import { preflightLesson } from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(await preflightLesson(${JSON.stringify(path)})));`], { cwd: directory, encoding: "utf8" });
    const inspection = JSON.parse(result);
    assert.equal(inspection.issues[0].type, "visual");
    assert.deepEqual(inspection.missingImages, []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
