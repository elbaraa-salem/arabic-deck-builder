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
import type { DirectionVisual } from "../src/types/visual.ts";
import { createDirectionSvg } from "../src/visuals/direction.ts";
import { resolveVisualSource } from "../src/visuals/visual-source-resolver.ts";
import { preflightLesson } from "../src/validation/preflight.ts";

const directions = ["left", "right", "up", "down"] as const;

function lesson(directionValues: readonly unknown[]) {
  return {
    id: "direction-test",
    level: "A0",
    title: "Test",
    goal: "Test",
    activities: directionValues.map((direction) => ({
      type: "question_reveal",
      question: "Q",
      answer: "A",
      visual: { type: "direction", direction },
    })),
  };
}

test("direction schema accepts only the four supported directions", () => {
  for (const direction of directions) {
    assert.deepEqual(educationalVisualSchema.parse({ type: "direction", direction }), {
      type: "direction", direction,
    });
  }
  for (const direction of ["diagonal", "backwards", "forward", "north", "LEFT", " left", "", 0, null, undefined]) {
    const result = lessonSchema.safeParse(lesson([direction]));
    assert.equal(result.success, false);
    if (!result.success) {
      assert.deepEqual(result.error.issues[0].path, ["activities", 0, "visual", "direction"]);
    }
  }
  assert.throws(
    () => createDirectionSvg("diagonal" as DirectionVisual["direction"]),
    /Invalid direction visual: diagonal/,
  );
});

test("direction SVGs rotate one shared arrow geometry into the expected orientations", () => {
  const geometry = new Set<string>();
  const outputs = new Set<string>();
  const expectedTips = { right: [500, 300], down: [300, 500], left: [100, 300], up: [300, 100] };

  for (const direction of directions) {
    const svg = createDirectionSvg(direction);
    assert.equal(svg, createDirectionSvg(direction));
    assert.match(svg, /width="600" height="600" viewBox="0 0 600 600"/);
    assert.equal((svg.match(/<polygon /g) ?? []).length, 1);
    assert.doesNotMatch(svg, /<text\b/);
    assert.match(svg, /fill="#184F4C"/);

    const points = /points="([^"]+)"/.exec(svg);
    const transform = /transform="rotate\((\d+) 300 300\)"/.exec(svg);
    assert.ok(points);
    assert.ok(transform);
    geometry.add(points[1]);
    outputs.add(svg);

    const vertices = points[1].split(" ").map((point) => point.split(",").map(Number));
    const tip = vertices.reduce((a, b) => a[0] > b[0] ? a : b);
    const radians = Number(transform[1]) * Math.PI / 180;
    const rotatedTip = [
      300 + (tip[0] - 300) * Math.cos(radians) - (tip[1] - 300) * Math.sin(radians),
      300 + (tip[0] - 300) * Math.sin(radians) + (tip[1] - 300) * Math.cos(radians),
    ];
    for (let axis = 0; axis < 2; axis++) {
      assert.ok(Math.abs(rotatedTip[axis] - expectedTips[direction][axis]) < 1e-10);
    }
  }
  assert.equal(geometry.size, 1);
  assert.equal(outputs.size, 4);
});

test("direction YAML flows through planning, generated files, preflight and presentation", async () => {
  const directory = mkdtempSync(join(tmpdir(), "direction-test-"));
  try {
    const input = lesson(directions);
    const slides = planSlides(lessonSchema.parse(input));
    assert.equal(slides.length, 8);
    for (const [index, direction] of directions.entries()) {
      const question = slides[index * 2];
      const reveal = slides[index * 2 + 1];
      assert.equal(question.type, "question");
      assert.equal(reveal.type, "reveal");
      if (question.type !== "question" || reveal.type !== "reveal") assert.fail("Expected question/reveal pair");
      assert.deepEqual(question.visual, { kind: "generated", spec: { type: "direction", direction } });
      assert.deepEqual(reveal.visual, question.visual);
      const path = resolveVisualSource(question.visual);
      assert.ok(existsSync(path));
      assert.equal(basename(path), `direction-${direction}.svg`);
      assert.equal(resolveVisualSource(question.visual), path);
      assert.equal(readFileSync(path, "utf8"), createDirectionSvg(direction));
    }

    const lessonPath = join(directory, "directions.yaml");
    writeFileSync(lessonPath, stringify(input));
    const inspection = await preflightLesson(lessonPath);
    assert.equal(inspection.ok, true);
    assert.equal(inspection.visualCount, 4);
    await renderPresentation(slides, join(directory, "directions.pptx"));
    assert.ok(existsSync(join(directory, "directions.pptx")));

    writeFileSync(lessonPath, stringify(lesson(["backwards"])));
    const invalid = await preflightLesson(lessonPath);
    assert.equal(invalid.ok, false);
    assert.equal(invalid.issues[0].type, "schema");
    assert.equal(invalid.issues[0].path, "activities.0.visual.direction");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
