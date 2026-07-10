/**
 * Build script for Phoenix Arcade Shooter v2
 * Uses Bun's bundler to create the browser bundle.
 *
 * Output: dist/phoenix-arcade-shooter.js (IIFE, auto-starts from main.ts)
 */

import {
    copyFileSync,
    cpSync,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    writeFileSync,
} from 'fs';
import { join } from 'path';

const DIST_DIR = './dist';

export interface BuildOptions {
    /** When false, failed builds return false instead of exiting the process. */
    exitOnError?: boolean;
    /** When false, skip verbose console output (used during dev watch rebuilds). */
    verbose?: boolean;
}

export async function buildProject(options: BuildOptions = {}): Promise<boolean> {
    const { exitOnError = true, verbose = true } = options;

    const log = verbose ? console.log.bind(console) : () => {};

    if (!existsSync(DIST_DIR)) {
        mkdirSync(DIST_DIR, { recursive: true });
    }

    log('🎮 Building Phoenix Arcade Shooter v2...\n');

    log('📦 Copying static assets...');
    copyFileSync('./favicon.ico', join(DIST_DIR, 'favicon.ico'));
    copyFileSync('./styles/game.css', join(DIST_DIR, 'game.css'));
    log('   ✓ favicon.ico');
    log('   ✓ game.css');

    const LEGACY_DIR = './old-versions';
    if (existsSync(LEGACY_DIR)) {
        const entries = readdirSync(LEGACY_DIR, { withFileTypes: true });
        const copied: string[] = [];
        for (const ent of entries) {
            const src = join(LEGACY_DIR, ent.name);
            const dest = join(DIST_DIR, ent.name);
            if (ent.isDirectory()) {
                cpSync(src, dest, { recursive: true });
                copied.push(`${ent.name}/`);
            } else {
                copyFileSync(src, dest);
                copied.push(ent.name);
            }
        }
        if (copied.length > 0) {
            for (const label of copied) {
                log(`   ✓ ${label} (legacy)`);
            }
        }
    }
    log('');

    log('🔨 Building bundle with Bun...');
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
        mainResult.logs.forEach((entry) => console.error(entry));
        if (exitOnError) {
            process.exit(1);
        }
        return false;
    }
    log('   ✓ phoenix-arcade-shooter.js\n');

    log('📝 Processing HTML...');
    const htmlTemplate = readFileSync('./index.html', 'utf-8');
    const processedHtml = htmlTemplate
        .replace(/<!-- htmlbuild:js -->[\s\S]*?<!-- endbuild -->/,
            '<script src="phoenix-arcade-shooter.js"></script>')
        .replace(/<!-- htmlbuild:css -->[\s\S]*?<!-- endbuild -->/,
            '<link rel="stylesheet" type="text/css" href="game.css"/>');

    writeFileSync(join(DIST_DIR, 'index.html'), processedHtml);
    log('   ✓ index.html\n');

    log('✅ Build complete!');
    log(`   Output directory: ${DIST_DIR}`);

    const mainSize = Bun.file(join(DIST_DIR, 'phoenix-arcade-shooter.js')).size;
    log(`   Bundle: ${(mainSize / 1024).toFixed(2)} KB`);

    return true;
}

if (import.meta.main) {
    await buildProject();
}
