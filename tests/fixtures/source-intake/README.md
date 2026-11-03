# Source intake fixtures

These are synthetic, test-only files with no textbook content.

- `page.png`: a 40×20 red RGBA image.
- `inspection.pdf`: a small four-page PDF using Helvetica and one RGB pixel image:
  1. 612×792 points, a sentence of embedded text;
  2. 300×400 points, an image only;
  3. 400×300 points, just the page number `12` (insufficient text evidence);
  4. 900×600 points, text plus an image (intake deliberately makes no hybrid claim).

PDF tests require Poppler's `pdfinfo` and `pdftotext`, just like the CLI.
