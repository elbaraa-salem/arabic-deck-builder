import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { parse } from "yaml";

import { sourceIntakeManifestSchema } from "../src/schema/source-intake.schema.ts";
import { inspectSource } from "../src/source-intake/inspect-source.ts";
import { writeIntakeManifest } from "../src/source-intake/write-manifest.ts";
import type { SourceIntakeManifest } from "../src/types/source-intake.ts";

const fixtures = fileURLToPath(new URL("./fixtures/source-intake/", import.meta.url));
const cli = fileURLToPath(new URL("../src/source-intake/cli.ts", import.meta.url));

async function temporary(run: (directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "source-intake-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("single image records actual dimensions and requires visual extraction", async () => {
  const manifest = await inspectSource(join(fixtures, "page.png"));
  assert.deepEqual(sourceIntakeManifestSchema.parse(manifest), manifest);
  assert.equal(manifest.source.kind, "image");
  assert.equal(manifest.pages.length, 1);
  const page = manifest.pages[0];
  assert.deepEqual([page.pageIndex, page.width, page.height, page.dimensionUnit], [1, 40, 20, "pixels"]);
  assert.equal(page.embeddedTextAvailable, false);
  assert.equal(page.embeddedTextCharacterCount, 0);
  assert.equal(page.suggestedExtraction, "vision");
  assert.equal(page.imageFile, manifest.source.path);
  assert.equal(page.sourceFile, manifest.source.path);
});

test("page directories use deterministic natural ordering and ignore unrelated files and subdirectories", async () => {
  await temporary(async (directory) => {
    for (const name of ["page-10.png", "page-2.PNG", "page-1.png", "page-01.png"]) {
      await copyFile(join(fixtures, "page.png"), join(directory, name));
    }
    await writeFile(join(directory, "notes.txt"), "not a page");
    await copyFile(join(fixtures, "inspection.pdf"), join(directory, "book.pdf"));
    await mkdir(join(directory, "nested.png"));
    const manifest = await inspectSource(directory);
    assert.equal(manifest.source.kind, "image_directory");
    assert.deepEqual(manifest.pages.map((page) => basename(page.sourceFile)), ["page-01.png", "page-1.png", "page-2.PNG", "page-10.png"]);
    assert.deepEqual(manifest.pages.map((page) => page.pageIndex), [1, 2, 3, 4]);
    assert.ok(manifest.pages.every((page) => page.width === 40 && page.height === 20 && page.suggestedExtraction === "vision"));
    assert.deepEqual(await inspectSource(directory), manifest);
  });
});

test("empty directories, missing files, unsupported files and corrupted images fail clearly", async () => {
  await temporary(async (directory) => {
    await assert.rejects(inspectSource(directory), /No supported page images/);
    await writeFile(join(directory, "notes.txt"), "not a page");
    await assert.rejects(inspectSource(directory), /No supported page images/);
    await assert.rejects(inspectSource(join(directory, "notes.txt")), /Unsupported input file/);
    await assert.rejects(inspectSource(join(directory, "absent.pdf")), /Input path not found/);
    await writeFile(join(directory, "broken.png"), "not an image");
    await assert.rejects(inspectSource(join(directory, "broken.png")), /Could not inspect image/);
  });
});

test("real PDF inspection distinguishes text evidence, image-only pages and sparse text", async () => {
  const manifest = await inspectSource(join(fixtures, "inspection.pdf"));
  assert.equal(manifest.source.kind, "pdf");
  assert.equal(manifest.pages.length, 4);
  assert.deepEqual(manifest.pages.map((page) => page.embeddedTextAvailable), [true, false, false, true]);
  assert.deepEqual(manifest.pages.map((page) => page.suggestedExtraction), ["embedded_text", "vision", "vision", "embedded_text"]);
  assert.deepEqual(manifest.pages.map((page) => [page.width, page.height]), [[612, 792], [300, 400], [400, 300], [900, 600]]);
  assert.equal(manifest.pages[1].embeddedTextCharacterCount, 0);
  assert.equal(manifest.pages[2].embeddedTextCharacterCount, 2);
  assert.ok(manifest.pages.every((page) => page.dimensionUnit === "points" && page.imageFile === undefined));
  assert.deepEqual(await inspectSource(join(fixtures, "inspection.pdf")), manifest);
  assert.deepEqual(sourceIntakeManifestSchema.parse(manifest), manifest);
});

test("invalid PDFs fail rather than being classified as pages requiring vision", async () => {
  await temporary(async (directory) => {
    const path = join(directory, "broken.pdf");
    await writeFile(path, "not a PDF");
    await assert.rejects(inspectSource(path), /Could not inspect PDF/);
  });
});

test("manifest writes validate first and produce deterministic, collision-resistant names and YAML", async () => {
  await temporary(async (directory) => {
    const manifest = await inspectSource(join(fixtures, "page.png"));
    const path = await writeIntakeManifest(manifest, directory);
    assert.match(basename(path), /^page-[a-f0-9]{12}\.yaml$/);
    const yaml = await readFile(path, "utf8");
    assert.deepEqual(sourceIntakeManifestSchema.parse(parse(yaml)), manifest);
    assert.equal(await writeIntakeManifest(manifest, directory), path);
    assert.equal(await readFile(path, "utf8"), yaml);
    const other = { ...manifest, source: { ...manifest.source, path: "another/page.png" } };
    assert.notEqual(await writeIntakeManifest(other, directory), path);
    const invalid = { ...manifest, pages: [] } as SourceIntakeManifest;
    const count = (await readdir(directory)).length;
    await assert.rejects(writeIntakeManifest(invalid, directory));
    assert.equal((await readdir(directory)).length, count);
  });
});

test("intake schema rejects invalid page indices, dimensions and contradictory suggestions", async () => {
  const manifest = await inspectSource(join(fixtures, "page.png"));
  for (const change of [{ pageIndex: 0 }, { pageIndex: 2 }, { width: 0 }, { height: -1 },
    { suggestedExtraction: "ocr" }, { suggestedExtraction: "embedded_text" }, { embeddedTextCharacterCount: -1 }]) {
    assert.equal(sourceIntakeManifestSchema.safeParse({ ...manifest, pages: [{ ...manifest.pages[0], ...change }] }).success, false);
  }
  assert.equal(sourceIntakeManifestSchema.safeParse({ ...manifest, source: { kind: "docx", path: "book.docx" } }).success, false);
});

test("CLI writes its manifest, summarizes PDF evidence and reports missing Poppler without a stack trace", async () => {
  await temporary(async (directory) => {
    const summary = execFileSync(process.execPath, [cli, join(fixtures, "inspection.pdf")], { cwd: directory, encoding: "utf8" });
    assert.match(summary, /Kind: pdf\nPages: 4\nEmbedded-text pages: 2\nVisual-extraction pages: 2/);
    const path = /Manifest: (.+)/.exec(summary)![1];
    sourceIntakeManifestSchema.parse(parse(await readFile(resolve(directory, path), "utf8")));
    const missing = spawnSync(process.execPath, [cli, join(fixtures, "inspection.pdf")], {
      cwd: directory, encoding: "utf8", env: { ...process.env, PATH: "" },
    });
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /PDF intake requires Poppler/);
    assert.doesNotMatch(missing.stderr, /\n\s+at /);
    const badPath = spawnSync(process.execPath, [cli, "does-not-exist"], { cwd: directory, encoding: "utf8" });
    assert.equal(badPath.status, 1);
    assert.match(badPath.stderr, /Input path not found/);
    assert.doesNotMatch(badPath.stderr, /\n\s+at /);
  });
});
