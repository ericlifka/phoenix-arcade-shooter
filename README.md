# Phoenix — Pixel-Rendered Arcade Shooter

A Phoenix / Galaga–style space shooter built around a custom pixel pipeline: logical sprites are grids of colored cells drawn to a 2D canvas, closer to old console frame buffers than texture sprites.

## Requirements

- [Bun](https://bun.sh) (v1.x) — install and build tooling

## Development

From the repository root:

```bash
bun install
bun run dev
```

This runs `build.ts` (bundles the game) and serves **`dist/`** at **http://localhost:3000**. Use that URL to play locally; opening the repo’s root **`index.html`** directly is not supported (it is only a template processed by the build into **`dist/index.html`**).

### Scripts

| Command | Purpose |
|--------|---------|
| `bun run dev` | Production build + static server on port 3000 |
| `bun run build` | Emit **`dist/phoenix-arcade-shooter.js`**, **`dist/index.html`**, CSS, and favicon |
| `bun run deploy` | Build and commit the output to the **`gh-pages`** branch (see below) |
| `bun run clean` | Remove the **`dist/`** directory |

## Build output

After **`bun run build`**, **`dist/`** contains the playable app:

- **`index.html`** — loads **`phoenix-arcade-shooter.js`** (IIFE bundle from **`src/main.ts`**) and **`game.css`**
- **`phoenix-arcade-shooter.js`** — full game bundle

You can open **`dist/index.html`** in a browser or deploy the contents of **`dist/`** to any static host.

## GitHub Pages

The live site is published from the **`gh-pages`** branch (root of that branch = site root).

To deploy:

```bash
bun run deploy          # build, commit on gh-pages, return to your branch
bun run deploy -- --push   # same, then push gh-pages to origin
```

Or run **`./deploy.sh`** directly. The script builds **`dist/`**, copies it to a temp directory, checks out **`gh-pages`**, replaces the branch contents with the build, creates a deployment commit, and checks out your previous branch again.

Publish when ready:

```bash
git push origin gh-pages
```

## Project layout (high level)

- **`src/`** — game logic, UI, and assets in TypeScript
- **`src/rendering/`** — low-level pixel engine (sprites, frame buffer, canvas renderer, bitmap fonts)
- **`build.ts`** / **`dev-server.ts`** — Bun-based build and dev server
- **`styles/`** — source CSS copied into **`dist/`** as **`game.css`**

## Play (hosted)

A build is also hosted here: [ericlifka.com/phoenix-arcade-shooter](http://www.ericlifka.com/phoenix-arcade-shooter/)

## License

MIT — see **`package.json`**.
