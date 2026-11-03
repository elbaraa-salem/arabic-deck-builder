import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { imageSize } from "image-size";
import { parse, stringify } from "yaml";

import { sourcePageBundleSchema } from "../src/schema/source-page-bundle.schema.ts";
import { inspectSource } from "../src/source-intake/inspect-source.ts";
import { writeIntakeManifest } from "../src/source-intake/write-manifest.ts";
import { prepareSourcePages } from "../src/source-pages/prepare-source-pages.ts";
import { writePageBundle } from "../src/source-pages/write-bundle.ts";
import type { SourceIntakeManifest } from "../src/types/source-intake.ts";

const fixtures = fileURLToPath(new URL("./fixtures/source-intake/", import.meta.url));
const cli = fileURLToPath(new URL("../src/source-pages/cli.ts", import.meta.url));

async function temporary(run: (directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "source-pages-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function intake(directory: string, input: string): Promise<string> {
  return writeIntakeManifest(await inspectSource(input), join(directory, "intake"));
}

test("PDF rendering prepares only visual pages, preserving physical indices and actual pixel dimensions", async () => {
  await temporary(async (directory) => {
    const path = await intake(directory, join(fixtures, "inspection.pdf"));
    const evidence = await readFile(path, "utf8");
    const result = await prepareSourcePages(path, join(directory, "pages"));
    assert.deepEqual(result.bundle.pages.map((page) => page.pageIndex), [2, 3]);
    assert.deepEqual(result.bundle.pages.map((page) => basename(page.imageFile)), ["page-0002.png", "page-0003.png"]);
    assert.deepEqual(result.bundle.pages.map((page) => [page.width, page.height]), [[2250, 3000], [3000, 2250]]);
    for (const page of result.bundle.pages) {
      const actual = imageSize(await readFile(page.imageFile));
      assert.equal(actual.type, "png");
      assert.equal(actual.width, page.width);
      assert.equal(actual.height, page.height);
      assert.equal(page.renderMethod, "pdftoppm");
    }
    assert.deepEqual((await readdir(result.outputDirectory)).sort(), ["manifest.yaml", "page-0002.png", "page-0003.png"]);
    assert.equal(await readFile(path, "utf8"), evidence);
    const bundleYaml = await readFile(result.manifestPath, "utf8");
    assert.deepEqual(sourcePageBundleSchema.parse(parse(bundleYaml)), result.bundle);
    const originalImages = await Promise.all(result.bundle.pages.map((page) => readFile(page.imageFile)));
    const repeated = await prepareSourcePages(path, join(directory, "pages"));
    assert.equal(repeated.manifestPath, result.manifestPath);
    assert.equal(await readFile(repeated.manifestPath, "utf8"), bundleYaml);
    for (const [index, page] of repeated.bundle.pages.entries()) {
      assert.deepEqual(await readFile(page.imageFile), originalImages[index]);
    }
  });
});

test("hybrid suggestions are rendered and text-only sources produce valid empty bundles", async () => {
  await temporary(async (directory) => {
    const manifest = await inspectSource(join(fixtures, "inspection.pdf"));
    manifest.pages[3].suggestedExtraction = "hybrid";
    const path = await writeIntakeManifest(manifest, join(directory, "intake"));
    const hybrid = await prepareSourcePages(path, join(directory, "pages"));
    assert.deepEqual(hybrid.bundle.pages.map((page) => page.pageIndex), [2, 3, 4]);
    for (const page of manifest.pages) {
      page.embeddedTextAvailable = true;
      page.suggestedExtraction = "embedded_text";
    }
    await writeIntakeManifest(manifest, join(directory, "intake"));
    const empty = await prepareSourcePages(path, join(directory, "pages"));
    assert.deepEqual(sourcePageBundleSchema.parse(parse(await readFile(empty.manifestPath, "utf8"))).pages, []);
  });
});

test("image sources retain original bytes and dimensions without copying or re-encoding", async () => {
  await temporary(async (directory) => {
    const path = await intake(directory, join(fixtures, "page.png"));
    const original = await readFile(join(fixtures, "page.png"));
    const result = await prepareSourcePages(path, join(directory, "pages"));
    assert.equal(result.bundle.pages.length, 1);
    const page = result.bundle.pages[0];
    assert.equal(resolve(page.imageFile), join(fixtures, "page.png"));
    assert.deepEqual([page.width, page.height, page.renderMethod], [40, 20, "existing_image"]);
    assert.deepEqual(await readFile(page.imageFile), original);
    assert.deepEqual(await readdir(result.outputDirectory), ["manifest.yaml"]);
    assert.equal(basename(result.outputDirectory), basename(path, ".yaml"));
    assert.equal((await prepareSourcePages(path, join(directory, "pages"))).manifestPath, result.manifestPath);
  });
});

test("image directory artifacts retain natural intake ordering and same basenames cannot collide", async () => {
  await temporary(async (directory) => {
    const sources = [join(directory, "first", "book"), join(directory, "second", "book")];
    const outputs: string[] = [];
    for (const source of sources) {
      await mkdir(source, { recursive: true });
      for (const name of ["page-10.png", "page-2.png", "page-1.png"]) {
        await copyFile(join(fixtures, "page.png"), join(source, name));
      }
      const path = await intake(directory, source);
      const result = await prepareSourcePages(path, join(directory, "pages"));
      outputs.push(result.outputDirectory);
      assert.deepEqual(result.bundle.pages.map((page) => basename(page.imageFile)), ["page-1.png", "page-2.png", "page-10.png"]);
      assert.deepEqual(result.bundle.pages.map((page) => page.pageIndex), [1, 2, 3]);
      assert.ok(result.bundle.pages.every((page) => page.width === 40 && page.height === 20));
      sourcePageBundleSchema.parse(result.bundle);
    }
    assert.notEqual(outputs[0], outputs[1]);
  });
});

test("missing/invalid intake manifests, missing sources, and rendering failures fail clearly", async () => {
  await temporary(async (directory) => {
    await assert.rejects(prepareSourcePages(join(directory, "missing.yaml")), /Intake manifest not found/);
    const invalid = join(directory, "invalid.yaml");
    for (const yaml of ["pages: [", "schemaVersion: '1.0'\npages: []"]) {
      await writeFile(invalid, yaml);
      await assert.rejects(prepareSourcePages(invalid), /Invalid intake manifest/);
    }
    const source = join(directory, "book.pdf");
    await copyFile(join(fixtures, "inspection.pdf"), source);
    const path = await intake(directory, source);
    await rm(source);
    await assert.rejects(prepareSourcePages(path), /Original source missing or unavailable/);
    await writeFile(source, "not a PDF anymore");
    const outputRoot = join(directory, "pages");
    await assert.rejects(prepareSourcePages(path, outputRoot), /Rendering failed for PDF page 2/);
    for (const name of await readdir(outputRoot)) {
      await assert.rejects(stat(join(outputRoot, name, "manifest.yaml")), /ENOENT/);
    }
  });
});

test("bundle writing verifies file existence and dimensions before declaring success", async () => {
  await temporary(async (directory) => {
    const base = {
      schemaVersion: "1.0" as const,
      sourceManifest: "intake.yaml",
      pages: [{ pageIndex: 1, imageFile: join(directory, "missing.png"), width: 40, height: 20, renderMethod: "existing_image" as const }],
    };
    const output = join(directory, "bundle");
    await assert.rejects(writePageBundle(base, output), /Could not inspect image/);
    await assert.rejects(stat(join(output, "manifest.yaml")), /ENOENT/);
    base.pages[0].imageFile = join(fixtures, "page.png");
    base.pages[0].width = 41;
    await assert.rejects(writePageBundle(base, output), /dimensions changed/);
    for (const change of [{ pageIndex: 0 }, { width: 0 }, { height: 1.5 }]) {
      assert.equal(sourcePageBundleSchema.safeParse({ ...base, pages: [{ ...base.pages[0], ...change }] }).success, false);
    }
    assert.equal(sourcePageBundleSchema.safeParse({ ...base, pages: [base.pages[0], base.pages[0]] }).success, false);
  });
});

test("CLI reports missing renderer, renderer failure, and missing output images without success manifests", async () => {
  await temporary(async (directory) => {
    const manifest: SourceIntakeManifest = await inspectSource(join(fixtures, "inspection.pdf"));
    // CLI subprocess uses its own CWD; use absolute source paths for this fixture.
    manifest.source.path = join(fixtures, "inspection.pdf");
    for (const page of manifest.pages) page.sourceFile = manifest.source.path;
    const path = join(directory, "intake.yaml");
    await writeFile(path, stringify(manifest));
    const tools = join(directory, "tools");
    await mkdir(tools);
    const invoke = () => spawnSync(process.execPath, [cli, path], {
      cwd: directory, encoding: "utf8", env: { ...process.env, PATH: tools },
    });
    const missing = invoke();
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /requires Poppler's pdftoppm/);
    for (const body of [
      "process.stderr.write('test rendering failure'); process.exit(2);",
      "process.exit(0);", // Reports success but produces no output file.
    ]) {
      await writeFile(join(tools, "pdftoppm"), `#!${process.execPath}\nif (process.argv.includes('-v')) process.exit(0);\n${body}\n`, { mode: 0o755 });
      const result = invoke();
      assert.equal(result.status, 1);
      assert.match(result.stderr, body.includes("stderr") ? /Rendering failed.*test rendering failure/s : /Output image missing/);
      assert.doesNotMatch(result.stderr, /\n\s+at /);
      assert.equal(result.stdout.includes("Manifest:"), false);
      const root = join(directory, "output", "source-pages");
      for (const name of await readdir(root)) {
        await assert.rejects(stat(join(root, name, "manifest.yaml")), /ENOENT/);
      }
    }
  });
});
