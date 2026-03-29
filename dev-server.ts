/**
 * Development server for Phoenix Arcade Shooter
 * Serves the dist directory with live reload
 */

export {};

console.log('🚀 Starting development server...\n');
console.log('   Building project...');

// Run the build first
await import('./build.ts');

console.log('\n🌐 Starting server...');
console.log('   Server running at: http://localhost:3000');
console.log('   Press Ctrl+C to stop\n');

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

    // Bun.file(dir).exists() is false for directories; serve …/index.html like a static host
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

// Serve the dist directory
Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        const filePath = await resolveDistFile(url.pathname);
        if (filePath === null) {
            return new Response('Not Found', { status: 404 });
        }
        return new Response(Bun.file(filePath));
    },
});
