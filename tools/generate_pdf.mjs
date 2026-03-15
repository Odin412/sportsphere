#!/usr/bin/env node
/**
 * generate_pdf.mjs — Branded PDF Generator for TitanAI documents
 *
 * Usage:
 *   node tools/generate_pdf.mjs --template investor-brief
 *   node tools/generate_pdf.mjs --template partnership-proposal
 *   node tools/generate_pdf.mjs --html path/to/file.html --output path/to/output.pdf
 *
 * Requires: playwright (already installed)
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TEMPLATES_DIR = resolve(ROOT, 'business', 'templates');
const PROPOSALS_DIR = resolve(ROOT, 'business', 'proposals');

// Parse CLI args
const args = process.argv.slice(2);
const templateArg = args.indexOf('--template') !== -1 ? args[args.indexOf('--template') + 1] : null;
const htmlArg = args.indexOf('--html') !== -1 ? args[args.indexOf('--html') + 1] : null;
const outputArg = args.indexOf('--output') !== -1 ? args[args.indexOf('--output') + 1] : null;

async function generatePDF(htmlPath, outputPath) {
  console.log(`\n📄 Generating PDF...`);
  console.log(`   Source: ${htmlPath}`);
  console.log(`   Output: ${outputPath}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Use goto with file:// URL so local images resolve correctly
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Wait for fonts and images to fully load
  await page.waitForTimeout(3000);

  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.6in', right: '0.6in' },
    displayHeaderFooter: false,
  });

  await browser.close();

  console.log(`   ✅ PDF generated successfully!`);
  console.log(`   📁 ${outputPath}\n`);
}

// Template mapping
const TEMPLATES = {
  'investor-brief': {
    html: resolve(TEMPLATES_DIR, 'investor-brief.html'),
    output: resolve(PROPOSALS_DIR, '2-Investor-Brief.pdf'),
  },
  'partnership-proposal': {
    html: resolve(TEMPLATES_DIR, 'partnership-proposal.html'),
    output: resolve(PROPOSALS_DIR, '1-Partnership-Proposal.pdf'),
  },
};

async function main() {
  let htmlPath, outputPath;

  if (templateArg && TEMPLATES[templateArg]) {
    htmlPath = TEMPLATES[templateArg].html;
    outputPath = outputArg || TEMPLATES[templateArg].output;
  } else if (htmlArg) {
    htmlPath = resolve(htmlArg);
    outputPath = outputArg || htmlArg.replace('.html', '.pdf');
  } else {
    console.log('Usage:');
    console.log('  node tools/generate_pdf.mjs --template investor-brief');
    console.log('  node tools/generate_pdf.mjs --template partnership-proposal');
    console.log('  node tools/generate_pdf.mjs --html path/to/file.html --output path/to/output.pdf');
    console.log('\nAvailable templates:', Object.keys(TEMPLATES).join(', '));
    process.exit(1);
  }

  if (!existsSync(htmlPath)) {
    console.error(`❌ HTML file not found: ${htmlPath}`);
    process.exit(1);
  }

  await generatePDF(htmlPath, resolve(outputPath));
}

main().catch(err => {
  console.error('❌ PDF generation failed:', err.message);
  process.exit(1);
});
