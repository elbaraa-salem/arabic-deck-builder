import { prepareSourcePages } from "./prepare-source-pages.ts";

const manifestPath = process.argv[2];
if (!manifestPath || process.argv.length !== 3) {
  console.error("Usage: npm run source:render -- <source-intake-manifest.yaml>");
  process.exit(1);
}

try {
  const result = await prepareSourcePages(manifestPath);
  console.log(`Source: ${result.source}`);
  console.log(`Pages requiring visual extraction: ${result.bundle.pages.length}`);
  console.log(`Pages rendered: ${result.bundle.pages.filter((page) => page.renderMethod === "pdftoppm").length}`);
  console.log(`Output: ${result.outputDirectory}/`);
  console.log(`Manifest: ${result.manifestPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
