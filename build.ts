/**
 * Build script for Phoenix Arcade Shooter
 * Uses Bun to bundle the game and copy static assets
 * 
 * Creates two bundles:
 * - phoenix-arcade-shooter.js (main game with auto-start)
 * - phoenix-arcade-shooter-embedded.js (for embedding in other pages)
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const DIST_DIR = './dist';

// Ensure dist directory exists
if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR, { recursive: true });
}

console.log('🎮 Building Phoenix Arcade Shooter...\n');

// Copy static assets
console.log('📦 Copying static assets...');
copyFileSync('./favicon.ico', join(DIST_DIR, 'favicon.ico'));
copyFileSync('./styles/game.css', join(DIST_DIR, 'game.css'));
console.log('   ✓ favicon.ico');
console.log('   ✓ game.css\n');

// Get all JS files in order
function getAllJsFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (extname(file) === '.js') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Build file list in the correct order (matching gulpfile.js)
const jsFiles = [
  './libs/simple-web-modules/index.js',
  './libs/pxlr-core/dist/index.js',
  './libs/pxlr-gl/dist/index.js',
  './libs/pxlr-fonts/dist/index.js',
  ...getAllJsFiles('./src')
];

// Function to concatenate files
function concatenateFiles(files: string[], excludePattern?: RegExp): string {
  return files
    .filter(file => !excludePattern || !excludePattern.test(file))
    .map(file => readFileSync(file, 'utf-8'))
    .join('\n');
}

// Build main bundle (excludes embedded.js)
console.log('🔨 Building main bundle...');
const mainBundle = concatenateFiles(jsFiles, /embedded/);
const wrappedMainBundle = `(function () {\n${mainBundle}\n}());\n`;
writeFileSync(join(DIST_DIR, 'phoenix-arcade-shooter.js'), wrappedMainBundle);
console.log('   ✓ phoenix-arcade-shooter.js\n');

// Build embedded bundle (excludes main.js)
console.log('🔨 Building embedded bundle...');
const embeddedBundle = concatenateFiles(jsFiles, /main\.js$/);
const wrappedEmbeddedBundle = `(function () {\n${embeddedBundle}\n}());\n`;
writeFileSync(join(DIST_DIR, 'phoenix-arcade-shooter-embedded.js'), wrappedEmbeddedBundle);
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
console.log(`   Main bundle: ${(wrappedMainBundle.length / 1024).toFixed(2)} KB`);
console.log(`   Embedded bundle: ${(wrappedEmbeddedBundle.length / 1024).toFixed(2)} KB`);
