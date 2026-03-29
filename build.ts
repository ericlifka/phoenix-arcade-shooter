/**
 * Build script for Phoenix Arcade Shooter v2
 * Uses Bun's bundler to create the browser bundle.
 *
 * Output: dist/phoenix-arcade-shooter.js (IIFE, auto-starts from main.ts)
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
console.log('🔨 Building bundle with Bun...');
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
    console.error('❌ Bundle build failed:');
    mainResult.logs.forEach(log => console.error(log));
    process.exit(1);
}
console.log('   ✓ phoenix-arcade-shooter.js\n');

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

const mainSize = Bun.file(join(DIST_DIR, 'phoenix-arcade-shooter.js')).size;
console.log(`   Bundle: ${(mainSize / 1024).toFixed(2)} KB`);
