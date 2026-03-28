/**
 * Build script for Phoenix Arcade Shooter v2
 * Uses Bun's bundler to create ES module bundles
 * 
 * Creates two bundles:
 * - phoenix-arcade-shooter.js (main game with auto-start)
 * - phoenix-arcade-shooter-embedded.js (for embedding in other pages)
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DIST_DIR = './dist';

// Ensure dist directory exists
if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR, { recursive: true });
}

console.log('🎮 Building Phoenix Arcade Shooter v2...\n');

// Copy static assets
console.log('📦 Copying static assets...');
copyFileSync('./favicon.ico', join(DIST_DIR, 'favicon.ico'));
copyFileSync('./styles/game.css', join(DIST_DIR, 'game.css'));
console.log('   ✓ favicon.ico');
console.log('   ✓ game.css\n');

// Build main bundle using Bun's bundler
console.log('🔨 Building main bundle with Bun...');
const mainResult = await Bun.build({
  entrypoints: ['./src/main.ts'],
  outdir: DIST_DIR,
  naming: 'phoenix-arcade-shooter.js',
  target: 'browser',
  format: 'iife',
  minify: false,
  sourcemap: 'none',
});

if (!mainResult.success) {
  console.error('❌ Main bundle build failed:');
  mainResult.logs.forEach(log => console.error(log));
  process.exit(1);
}
console.log('   ✓ phoenix-arcade-shooter.js\n');

// Build embedded bundle
console.log('🔨 Building embedded bundle with Bun...');
const embeddedResult = await Bun.build({
  entrypoints: ['./src/embedded.ts'],
  outdir: DIST_DIR,
  naming: 'phoenix-arcade-shooter-embedded.js',
  target: 'browser',
  format: 'iife',
  minify: false,
  sourcemap: 'none',
});

if (!embeddedResult.success) {
  console.error('❌ Embedded bundle build failed:');
  embeddedResult.logs.forEach(log => console.error(log));
  process.exit(1);
}
console.log('   ✓ phoenix-arcade-shooter-embedded.js\n');

// Process HTML
console.log('📝 Processing HTML...');
const htmlTemplate = readFileSync('./index.html', 'utf-8');
const processedHtml = htmlTemplate
  .replace(/<!-- htmlbuild:js -->[\s\S]*?<!-- endbuild -->/, 
    '<script src="phoenix-arcade-shooter.js"></script>')
  .replace(/<!-- htmlbuild:css -->[\s\S]*?<!-- endbuild -->/, 
    '<link rel="stylesheet" type="text/css" href="game.css"/>');

writeFileSync(join(DIST_DIR, 'index.html'), processedHtml);
console.log('   ✓ index.html\n');

console.log('✅ Build complete!');
console.log(`   Output directory: ${DIST_DIR}`);

// Get file sizes
const mainSize = Bun.file(join(DIST_DIR, 'phoenix-arcade-shooter.js')).size;
const embeddedSize = Bun.file(join(DIST_DIR, 'phoenix-arcade-shooter-embedded.js')).size;

console.log(`   Main bundle: ${(mainSize / 1024).toFixed(2)} KB`);
console.log(`   Embedded bundle: ${(embeddedSize / 1024).toFixed(2)} KB`);
