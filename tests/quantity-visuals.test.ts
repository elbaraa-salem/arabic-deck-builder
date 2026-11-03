import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { test } from "node:test";

import { planSlides } from "../src/planner/slide-planner.ts";
import { renderPresentation } from "../src/presentation/render-presentation.ts";
import { lessonSchema } from "../src/schema/lesson.schema.ts";
import { educationalVisualSchema } from "../src/schema/visual.schema.ts";
import { createQuantitySvg } from "../src/visuals/quantity.ts";
import { resolveVisualSource } from "../src/visuals/visual-source-resolver.ts";
import { preflightLesson } from "../src/validation/preflight.ts";

const landscapePng = "iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAYAAAD/Rn+7AAAAL0lEQVR4nO3OMQ0AAAjAsPk3DSrIOHb0LwPzGXagYEE7ULCgHShY0A4ULGgHCl5biXs6G0TdvUkAAAAASUVORK5CYII=";
const portraitPng = "iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAYAAAD+MdrbAAAAJklEQVR4nO3MoQEAAAjAoP3/tB6hkUClqfmUUCgUCoVCoVAoFN4szrE6G0qgEi8AAAAASUVORK5CYII=";

function lesson(item: string, count: number) {
  return {
    id: "quantity-test",
    level: "A0",
    title: "Test",
    goal: "Test",
    activities: [{
      type: "question_reveal",
      question: "Q",
      answer: "A",
      visual: { type: "quantity", item, count },
    }],
  };
}

test("quantity schema accepts 1, 5, 20 and rejects invalid counts and items", () => {
  for (const count of [1, 5, 20]) {
    assert.equal(educationalVisualSchema.safeParse({ type: "quantity", item: "apple", count }).success, true);
  }
  for (const count of [0, 21, 1.5, -1, Infinity, "5"]) {
    const result = educationalVisualSchema.safeParse({ type: "quantity", item: "apple", count });
    assert.equal(result.success, false);
    if (!result.success) assert.deepEqual(result.error.issues[0].path, ["count"]);
  }
  assert.equal(educationalVisualSchema.safeParse({ type: "quantity", item: "", count: 5 }).success, false);
  assert.throws(() => createQuantitySvg("apple", 21), /integer from 1 through 20/);
});

test("quantity composes self-contained grids and integrates with planning, preflight and slides", async () => {
  const assetsDirectory = resolve("assets/images");
  const fixtures = mkdtempSync(join(assetsDirectory, "quantity-test-"));
  const output = mkdtempSync(join(tmpdir(), "quantity-test-"));
  const generatedPaths = new Set<string>();

  try {
    for (const [name, data, ratio] of [
      ["landscape", landscapePng, 2],
      ["portrait", portraitPng, 0.5],
    ] as const) {
      const item = relative(assetsDirectory, join(fixtures, name));
      writeFileSync(join(fixtures, `${name}.png`), Buffer.from(data, "base64"));

      for (let count = 1; count <= 20; count++) {
        const svg = createQuantitySvg(item, count);
        assert.equal(svg, createQuantitySvg(item, count));
        const images = [...svg.matchAll(/<use x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" xlink:href="#quantity-item"/g)];
        assert.equal(images.length, count);
        assert.equal((svg.match(/data:/g) ?? []).length, 1);
        assert.equal((svg.match(/<image /g) ?? []).length, 1);
        assert.match(svg, /<defs>\s*<image id="quantity-item"[^>]+preserveAspectRatio="xMidYMid meet" xlink:href="data:image\/png;base64,/);
        assert.equal(svg.includes(item), false);
        for (const image of images) {
          const [x, y, width, height] = image.slice(1).map(Number);
          assert.ok(Math.abs(width / height - ratio) < 1e-10);
          assert.ok(x >= 24 && y >= 24);
          assert.ok(x + width <= 576.000001 && y + height <= 576.000001);
        }
      }

      for (const count of [1, 5, 20]) {
        const input = lesson(item, count);
        const slides = planSlides(lessonSchema.parse(input));
        assert.equal(slides[0].type, "question");
        if (slides[0].type !== "question") assert.fail("Expected question slide");
        const source = slides[0].visual;
        assert.deepEqual(source, { kind: "generated", spec: { type: "quantity", item, count } });
        const path = resolveVisualSource(source);
        generatedPaths.add(path);
        assert.equal(resolveVisualSource(source), path);
        assert.equal(readFileSync(path, "utf8"), createQuantitySvg(item, count));
        assert.equal(relative(resolve("output/.generated-visuals"), path).includes("/"), false);

        const lessonPath = join(output, `${name}-${count}.yaml`);
        writeFileSync(lessonPath, JSON.stringify(input));
        const inspection = await preflightLesson(lessonPath);
        assert.equal(inspection.ok, true);
        assert.equal(inspection.visualCount, 1);
        await renderPresentation(slides, join(output, `${name}-${count}.pptx`));
      }
    }
    assert.equal(generatedPaths.size, 6);

    const missingItem = `${relative(assetsDirectory, fixtures)}/nonexistent`;
    const lessonPath = join(output, "missing.yaml");
    writeFileSync(lessonPath, JSON.stringify(lesson(missingItem, 5)));
    const inspection = await preflightLesson(lessonPath);
    assert.equal(inspection.ok, false);
    assert.equal(inspection.issues.length, 1);
    assert.equal(inspection.issues[0].type, "visual");
    assert.ok(inspection.issues[0].message.includes(missingItem));
    assert.match(inspection.issues[0].message, /Image asset not found/);
    assert.deepEqual(inspection.missingImages, []);
  } finally {
    rmSync(fixtures, { recursive: true, force: true });
    rmSync(output, { recursive: true, force: true });
    for (const path of generatedPaths) rmSync(path, { force: true });
  }
});
