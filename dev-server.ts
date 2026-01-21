/**
 * Development server for Phoenix Arcade Shooter
 * Serves the dist directory with live reload
 */

console.log('🚀 Starting development server...\n');
console.log('   Building project...');

// Run the build first
await import('./build.ts');

console.log('\n🌐 Starting server...');
console.log('   Server running at: http://localhost:3000');
console.log('   Press Ctrl+C to stop\n');

// Serve the dist directory
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Default to index.html
    if (path === '/') {
      path = '/index.html';
    }
    
    // Serve files from dist directory
    const filePath = `./dist${path}`;
    const file = Bun.file(filePath);
    
    if (await file.exists()) {
      return new Response(file);
    }
    
    return new Response('Not Found', { status: 404 });
  },
});
