/**
 * Development server for Phoenix Arcade Shooter
 * Serves dist/ and rebuilds when source files change.
 */

import { watch } from 'fs';
import { buildProject } from './build.ts';

export {};

console.log('🚀 Starting development server...\n');
console.log('   Building project...');

await buildProject();

console.log('\n🌐 Starting server...');
console.log('   Server running at: http://localhost:3000');
console.log('   Watching src/ for changes — refresh after rebuild');
console.log('   Press Ctrl+C to stop\n');

let rebuildTimer: ReturnType<typeof setTimeout> | undefined;
let building = false;
let rebuildQueued = false;

async function rebuild(): Promise<void> {
    if (building) {
        rebuildQueued = true;
        return;
    }

    building = true;
    console.log('🔄 Rebuilding...');
    const ok = await buildProject({ exitOnError: false, verbose: false });
    if (ok) {
        console.log('✅ Rebuild complete — refresh the browser\n');
    }
    building = false;

    if (rebuildQueued) {
        rebuildQueued = false;
        void rebuild();
    }
}

function scheduleRebuild(): void {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => void rebuild(), 150);
}

for (const path of ['./src', './styles']) {
    watch(path, { recursive: true }, scheduleRebuild);
}

watch('./index.html', scheduleRebuild);
watch('./build.ts', scheduleRebuild);

/**
 * Map a URL path to a file under ./dist, including directory → index.html (e.g. /v1 → dist/v1/index.html).
 */
async function resolveDistFile(pathname: string): Promise<string | null> {
    if (pathname.includes('..')) {
        return null;
    }

    let path = pathname;
    if (path === '/' || path === '') {
        path = '/index.html';
    }

    const direct = `./dist${path}`;
    if (await Bun.file(direct).exists()) {
        return direct;
    }

    if (!path.endsWith('.html')) {
        const withIndex = path.endsWith('/')
            ? `./dist${path}index.html`
            : `./dist${path}/index.html`;
        if (await Bun.file(withIndex).exists()) {
            return withIndex;
        }
    }

    return null;
}

Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        const filePath = await resolveDistFile(url.pathname);
        if (filePath === null) {
            return new Response('Not Found', { status: 404 });
        }

        return new Response(Bun.file(filePath), {
            headers: {
                'Cache-Control': 'no-store',
            },
        });
    },
});
