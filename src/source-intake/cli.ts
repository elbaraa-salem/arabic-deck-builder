import { inspectSource } from "./inspect-source.ts";
import { writeIntakeManifest } from "./write-manifest.ts";

const inputPath = process.argv[2];
if (!inputPath || process.argv.length !== 3) {
  console.error("Usage: npm run source:intake -- <source.pdf|page-image|page-image-directory>");
  process.exit(1);
}

try {
  const manifest = await inspectSource(inputPath);
  const path = await writeIntakeManifest(manifest);
  console.log(`Source: ${manifest.source.path}`);
  console.log(`Kind: ${manifest.source.kind}`);
  console.log(`Pages: ${manifest.pages.length}`);
  console.log(`Embedded-text pages: ${manifest.pages.filter((page) => page.embeddedTextAvailable).length}`);
  console.log(`Visual-extraction pages: ${manifest.pages.filter((page) => page.suggestedExtraction !== "embedded_text").length}`);
  console.log(`Manifest: ${path}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
