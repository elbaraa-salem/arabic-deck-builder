import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parse } from "yaml";

import { sourceMaterialSchema, sourcePageSchema, sourceRegionSchema } from "../src/schema/source-material.schema.ts";
import { extractionMetadataSchema, sourceReferenceSchema } from "../src/schema/source-reference.schema.ts";
import { sourceGrammarSchema, sourceListeningSchema, sourceTextSchema, sourceVocabularySchema } from "../src/schema/source-items.schema.ts";
import type { SourceDocument } from "../src/types/source-material.ts";

const fixture = () => parse(readFileSync(new URL("../examples/source-material-example.yaml", import.meta.url), "utf8"));
const references = [{ documentId: "book", pageIndex: 1 }];

test("example validates a whole-book-like document with multiple independently reusable source units", () => {
  const material = sourceMaterialSchema.parse(fixture());
  assert.equal(material.schemaVersion, "1.0");
  const document = material.documents[0];
  assert.equal(document.totalPageCount, 24);
  assert.equal(document.units.length, 2);
  assert.deepEqual(document.units.map((unit) => unit.order), [1, 2]);
  const unit = document.units[0];
  for (const collection of [unit.vocabulary, unit.structures, unit.grammar, unit.functions,
    unit.texts, unit.writing, unit.exercises, unit.visuals, unit.contextNotes]) {
    assert.ok(collection && collection.length > 0);
    assert.ok(collection.every((item) => item.references.length > 0));
  }
  assert.equal(document.units[1].listening?.length, 1);
});

test("scanned pages support vision, OCR and block-level hybrid extraction without PDF text", () => {
  const document = sourceMaterialSchema.parse(fixture()).documents[0];
  const vision = document.pages[1];
  assert.equal(vision.extraction.method, "vision");
  assert.equal(vision.extraction.confidence, 0.86);
  assert.ok(vision.imageFile);
  assert.equal(document.pages[2].extraction.method, "ocr");
  assert.equal(document.pages[2].blocks[0].extraction?.method, "hybrid");
  for (const method of ["embedded_text", "ocr", "vision", "manual", "hybrid"]) {
    assert.equal(extractionMetadataSchema.safeParse({ method }).success, true);
  }
  assert.equal(extractionMetadataSchema.safeParse({ method: "guess" }).success, false);
});

test("confidence boundaries apply to pages, blocks and semantic provenance", () => {
  for (const confidence of [0, 1]) {
    assert.equal(extractionMetadataSchema.safeParse({ method: "ocr", confidence }).success, true);
  }
  for (const confidence of [-0.01, 1.01, Infinity, NaN]) {
    assert.equal(extractionMetadataSchema.safeParse({ method: "vision", confidence }).success, false);
    const input = fixture();
    input.documents[0].pages[1].extraction.confidence = confidence;
    assert.equal(sourceMaterialSchema.safeParse(input).success, false);
    assert.equal(sourceReferenceSchema.safeParse({ ...references[0], extraction: { method: "ocr", confidence } }).success, false);
    const page = structuredClone(fixture().documents[0].pages[2]);
    page.blocks[0].extraction.confidence = confidence;
    assert.equal(sourcePageSchema.safeParse(page).success, false);
  }
});

test("page indices, IDs, order and required text reject invalid values without altering source text", () => {
  for (const pageIndex of [0, -1, 1.5, "1"]) {
    assert.equal(sourceReferenceSchema.safeParse({ documentId: "book", pageIndex }).success, false);
    const input = fixture();
    input.documents[0].pages[0].pageIndex = pageIndex;
    assert.equal(sourceMaterialSchema.safeParse(input).success, false);
  }
  for (const text of ["", "  "]) {
    const input = fixture();
    input.documents[0].id = text;
    assert.equal(sourceMaterialSchema.safeParse(input).success, false);
    assert.equal(sourceVocabularySchema.safeParse({ id: "v", surface: text, exposure: "incidental", references }).success, false);
  }
  for (const order of [0, -1, 1.5]) {
    const input = fixture();
    input.documents[0].units[0].order = order;
    assert.equal(sourceMaterialSchema.safeParse(input).success, false);
  }
  const text = "  هاذا كِتاب , كما ورد...  ";
  const parsed = sourceTextSchema.parse({ id: "reading", type: "reading", text, references });
  assert.equal(parsed.type, "reading");
  if (parsed.type === "reading") assert.equal(parsed.text, text);
});

test("vocabulary exposure and language-tagged glosses describe source presentation only", () => {
  for (const exposure of ["explicit_target", "supporting", "contextual", "incidental"]) {
    const entry = sourceVocabularySchema.parse({ id: "word", surface: "كِتَاب", exposure,
      glosses: [{ language: "en", text: "book" }, { language: "ru", text: "книга" }], references });
    assert.equal(entry.exposure, exposure);
    assert.equal(entry.glosses?.length, 2);
  }
  assert.equal(sourceVocabularySchema.safeParse({ id: "word", surface: "كِتَاب", exposure: "memorize", references }).success, false);
});

test("grammar distinguishes explicit from incidental observations", () => {
  for (const presentation of ["explicit", "incidental"]) {
    assert.equal(sourceGrammarSchema.safeParse({ id: "g", title: "الضمائر", presentation, references }).success, true);
  }
  assert.equal(sourceGrammarSchema.safeParse({ id: "g", title: "الضمائر", presentation: "teach_now", references }).success, false);
});

test("dialogues require speaker/text lines; readings preserve original text", () => {
  const base = { id: "dialogue", type: "dialogue", references };
  const line = { speaker: "مريم", text: "مَا اسْمُكَ؟" };
  assert.equal(sourceTextSchema.safeParse({ ...base, lines: [line] }).success, true);
  for (const lines of [[], [{ text: "مَا اسْمُكَ؟" }], [{ speaker: "مريم" }], [{ ...line, text: "" }]]) {
    assert.equal(sourceTextSchema.safeParse({ ...base, lines }).success, false);
  }
  assert.equal(sourceTextSchema.safeParse({ id: "r", type: "reading", text: "أَنَا مِنْ مِصْرَ.", references }).success, true);
});

test("listening supports audio plus transcript and incomplete ingestion states", () => {
  const listening = sourceMaterialSchema.parse(fixture()).documents[0].units[1].listening![0];
  assert.ok(listening.transcript);
  assert.ok(listening.audioFile);
  for (const content of [{}, { transcript: "مَرْحَبًا" }, { audioFile: "audio/track.mp3" }]) {
    assert.equal(sourceListeningSchema.safeParse({ id: "audio", references, ...content }).success, true);
  }
});

test("root supports multiple documents and optional metadata remains optional", () => {
  const input = fixture();
  input.documents.push({ id: "second-book", title: "كتاب ثان", pages: [], units: [] });
  assert.equal(sourceMaterialSchema.parse(input).documents.length, 2);
  const minimal = { schemaVersion: "1.0", documents: [{ id: "book", title: "كتاب", pages: [], units: [] }] };
  assert.equal(sourceMaterialSchema.safeParse(minimal).success, true);
  assert.equal(sourceMaterialSchema.safeParse({ ...minimal, documents: [{ ...minimal.documents[0], approximateLevel: { label: "beginner" } }] }).success, true);
  assert.equal(sourceMaterialSchema.safeParse({ ...minimal, documents: [] }).success, false);
  assert.equal(sourceMaterialSchema.safeParse({ ...minimal, schemaVersion: "2.0" }).success, false);
});

test("semantic provenance requires references and rejects malformed references", () => {
  const entry = { id: "word", surface: "كِتَاب", exposure: "contextual" };
  const reference = { documentId: "book", pageIndex: 3, blockId: "p3", extraction: { method: "vision", confidence: 0.8 } };
  assert.deepEqual(sourceReferenceSchema.parse(reference), reference);
  assert.equal(sourceVocabularySchema.safeParse({ ...entry, references: [reference, references[0]] }).success, true);
  for (const refs of [undefined, [], [{}], [{ pageIndex: 1 }], [{ documentId: "book", pageIndex: 0 }], [{ ...reference, blockId: "" }]]) {
    assert.equal(sourceVocabularySchema.safeParse({ ...entry, references: refs }).success, false);
  }
});

test("document identity and page/block organization reject ambiguous duplicates", () => {
  const input = fixture();
  input.documents.push(structuredClone(input.documents[0]));
  assert.equal(sourceMaterialSchema.safeParse(input).success, false);
  for (const mutate of [
    (document: SourceDocument) => document.pages.push(structuredClone(document.pages[0])),
    (document: SourceDocument) => document.pages[1].blocks[0].id = document.pages[0].blocks[0].id,
    (document: SourceDocument) => document.units[1].id = document.units[0].id,
    (document: SourceDocument) => document.units[1].order = document.units[0].order,
    (document: SourceDocument) => document.pages[0].blocks[0].pageIndex = 99,
  ]) {
    const material = fixture();
    mutate(material.documents[0]);
    assert.equal(sourceMaterialSchema.safeParse(material).success, false);
  }
});

test("physical page indices and non-numeric printed labels are independent", () => {
  const page = fixture().documents[0].pages[1];
  assert.equal(page.pageIndex, 3);
  assert.equal(page.pageLabel, "1");
  for (const pageLabel of ["1", "25", "iv", "أ", undefined]) {
    const parsed = sourcePageSchema.parse({ ...page, pageLabel });
    assert.equal(parsed.pageIndex, 3);
    assert.equal(parsed.pageLabel, pageLabel);
  }
  for (const pageLabel of ["", "  ", 25]) {
    assert.equal(sourcePageSchema.safeParse({ ...page, pageLabel }).success, false);
  }
  // Labels are source text, not page identity, so repeated labels are allowed.
  const input = fixture();
  input.documents[0].pages[0].pageLabel = "1";
  assert.equal(sourceMaterialSchema.safeParse(input).success, true);
});

test("optional normalized block regions preserve position and stay inside the page", () => {
  const material = sourceMaterialSchema.parse(fixture());
  const blocks = material.documents[0].pages[1].blocks;
  assert.deepEqual(blocks[0].region, { x: 0.1, y: 0.12, width: 0.8, height: 0.25 });
  assert.deepEqual(blocks[1].region, { x: 0.25, y: 0.45, width: 0.5, height: 0.35 });
  assert.equal(material.documents[0].pages[0].blocks[0].region, undefined);
  for (const region of [
    { x: 0, y: 0, width: 1, height: 1 },
    { x: 0.75, y: 0.5, width: 0.25, height: 0.5 },
  ]) {
    assert.deepEqual(sourceRegionSchema.parse(region), region);
  }
  const valid = { x: 0.1, y: 0.2, width: 0.5, height: 0.6 };
  for (const region of [
    { ...valid, x: -0.1 }, { ...valid, y: -0.1 },
    { ...valid, width: 0 }, { ...valid, height: 0 },
    { ...valid, width: -0.1 }, { ...valid, height: -0.1 },
    { ...valid, x: 1.1 }, { ...valid, y: 1.1 },
    { ...valid, width: 1.1 }, { ...valid, height: 1.1 },
    { ...valid, x: 0.8, width: 0.3 },
    { ...valid, y: 0.8, height: 0.3 },
    { ...valid, x: NaN }, { ...valid, height: Infinity },
    { ...valid, width: "0.5" },
  ]) {
    assert.equal(sourceRegionSchema.safeParse(region).success, false);
    const input = fixture();
    input.documents[0].pages[1].blocks[0].region = region;
    assert.equal(sourceMaterialSchema.safeParse(input).success, false);
  }
});

test("source units allow absent titles without inventing placeholders", () => {
  const input = fixture();
  const originalTitle = input.documents[0].units[1].title;
  delete input.documents[0].units[0].title;
  const material = sourceMaterialSchema.parse(input);
  assert.equal(Object.hasOwn(material.documents[0].units[0], "title"), false);
  assert.equal(material.documents[0].units[1].title, originalTitle);
  for (const title of ["", "  "]) {
    input.documents[0].units[0].title = title;
    assert.equal(sourceMaterialSchema.safeParse(input).success, false);
  }
  delete input.documents[0].units[0].title;
  delete input.documents[0].title;
  assert.equal(sourceMaterialSchema.safeParse(input).success, false);
});
