import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";

import { planSlides } from "../src/planner/slide-planner.ts";
import { renderPresentation } from "../src/presentation/render-presentation.ts";
import { lessonSchema } from "../src/schema/lesson.schema.ts";
import { educationalVisualSchema } from "../src/schema/visual.schema.ts";
import { createFractionSvg } from "../src/visuals/fraction.ts";
import { resolveVisualSource } from "../src/visuals/visual-source-resolver.ts";
import { preflightLesson } from "../src/validation/preflight.ts";

const fractions = [[1, 2], [2, 3], [3, 4], [5, 8], [12, 12]] as const;

function lesson(values: readonly (readonly [number, number])[]) {
  return {
    id: "fraction-test",
    level: "A0",
    title: "Test",
    goal: "Test",
    activities: values.map(([numerator, denominator]) => ({
      type: "question_reveal",
      question: "Q",
      answer: "A",
      visual: { type: "fraction", numerator, denominator },
    })),
  };
}

test("fraction schema validates integer bounds and numerator/denominator relationship", () => {
  for (const [numerator, denominator] of fractions) {
    assert.deepEqual(educationalVisualSchema.parse({ type: "fraction", numerator, denominator }), {
      type: "fraction", numerator, denominator,
    });
  }
  for (const [numerator, denominator, field] of [
    [0, 4, "numerator"], [5, 4, "numerator"], [1, 1, "denominator"],
    [3, 13, "denominator"], [3, 20, "denominator"], [-1, 4, "numerator"],
    [1.5, 4, "numerator"], [1, 2.5, "denominator"],
    [Infinity, 4, "numerator"], [1, Infinity, "denominator"],
    ["1", 4, "numerator"], [1, "4", "denominator"],
  ] as const) {
    const result = educationalVisualSchema.safeParse({ type: "fraction", numerator, denominator });
    assert.equal(result.success, false);
    if (!result.success) assert.deepEqual(result.error.issues[0].path, [field]);
  }
  assert.throws(() => createFractionSvg(5, 4), /Invalid fraction numerator/);
  assert.throws(() => createFractionSvg(0, 4), /Invalid fraction numerator/);
  assert.throws(() => createFractionSvg(1, 1), /Invalid fraction denominator/);
  assert.throws(() => createFractionSvg(3, 13), /Invalid fraction denominator/);
});

test("fraction SVGs contain equal clockwise sectors and exactly the requested highlights", () => {
  // Check every supported denominator, including full fractions.
  for (let denominator = 2; denominator <= 12; denominator++) {
    for (let numerator = 1; numerator <= denominator; numerator++) {
      const svg = createFractionSvg(numerator, denominator);
      assert.equal(svg, createFractionSvg(numerator, denominator));
      assert.match(svg, /width="600" height="600" viewBox="0 0 600 600"/);
      assert.doesNotMatch(svg, /<text\b/);
      const paths = [...svg.matchAll(/<path d="M 300 300 L ([^ ]+) ([^ ]+) A 220 220 0 0 1 ([^ ]+) ([^ ]+) Z" fill="([^"]+)" stroke="#9B6A3D" stroke-width="6"/g)];
      assert.equal(paths.length, denominator);
      assert.equal(paths.filter((path) => path[5] === "#184F4C").length, numerator);
      assert.equal(paths.filter((path) => path[5] === "#F7F3E9").length, denominator - numerator);

      let previousEnd: number[] | undefined;
      for (const [index, path] of paths.entries()) {
        const [startX, startY, endX, endY] = path.slice(1, 5).map(Number);
        for (const [x, y] of [[startX, startY], [endX, endY]]) {
          assert.ok(Math.abs(Math.hypot(x - 300, y - 300) - 220) < 1e-10);
        }
        const startAngle = Math.atan2(startY - 300, startX - 300);
        const endAngle = Math.atan2(endY - 300, endX - 300);
        const sweep = (endAngle - startAngle + 2 * Math.PI) % (2 * Math.PI);
        assert.ok(Math.abs(sweep - 2 * Math.PI / denominator) < 1e-10);
        if (previousEnd) assert.deepEqual([startX, startY], previousEnd);
        previousEnd = [endX, endY];
        assert.equal(path[5], index < numerator ? "#184F4C" : "#F7F3E9");
      }
      assert.ok(Math.abs(Number(paths[0][1]) - Number(paths.at(-1)![3])) < 1e-10);
      assert.ok(Math.abs(Number(paths[0][2]) - Number(paths.at(-1)![4])) < 1e-10);
    }
  }
});

test("fraction YAML integrates with planning, deterministic generated files, preflight and slides", async () => {
  const directory = mkdtempSync(join(tmpdir(), "fraction-test-"));
  try {
    const input = lesson(fractions);
    const slides = planSlides(lessonSchema.parse(input));
    assert.equal(slides.length, 10);
    for (const [index, [numerator, denominator]] of fractions.entries()) {
      const question = slides[index * 2];
      const reveal = slides[index * 2 + 1];
      assert.equal(question.type, "question");
      assert.equal(reveal.type, "reveal");
      if (question.type !== "question" || reveal.type !== "reveal") assert.fail("Expected question/reveal pair");
      assert.deepEqual(question.visual, { kind: "generated", spec: { type: "fraction", numerator, denominator } });
      assert.deepEqual(reveal.visual, question.visual);
      const path = resolveVisualSource(question.visual);
      assert.ok(existsSync(path));
      assert.equal(basename(path), `fraction-${numerator}-${denominator}.svg`);
      assert.equal(resolveVisualSource(question.visual), path);
      assert.equal(readFileSync(path, "utf8"), createFractionSvg(numerator, denominator));
    }

    const lessonPath = join(directory, "fractions.yaml");
    writeFileSync(lessonPath, stringify(input));
    const inspection = await preflightLesson(lessonPath);
    assert.equal(inspection.ok, true);
    assert.equal(inspection.visualCount, 5);
    await renderPresentation(slides, join(directory, "fractions.pptx"));
    assert.ok(existsSync(join(directory, "fractions.pptx")));

    for (const invalidFraction of [[0, 4], [5, 4], [1, 1], [3, 13]] as const) {
      writeFileSync(lessonPath, stringify(lesson([invalidFraction])));
      const invalid = await preflightLesson(lessonPath);
      assert.equal(invalid.ok, false);
      assert.equal(invalid.issues[0].type, "schema");
      assert.match(invalid.issues[0].path ?? "", /^activities\.0\.visual\.(numerator|denominator)$/);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
