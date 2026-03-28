# topoodoc

Topoo-styled Fumadocs system for generating and publishing documentation sites.

## What This Repo Contains

- `packages/fumadocs-system`
- `templates/fumadocs-system`
- `scripts/create-fumadocs-system.mjs`

This repo generates standalone docs sites. Each generated site vendors the shared shell into a local `fumadocs-system/` folder, so it can be moved to another repository and deployed independently.

## Create A Docs Site

```bash
pnpm install
pnpm docs:create -- --name "Topoo Docs" --target apps/topoo-docs --github https://github.com/your-org/topoo-docs
```

## Start The Generated Site

```bash
cd apps/topoo-docs
pnpm install
pnpm dev
```

## Import Existing Markdown

```bash
pnpm import:docs /absolute/path/to/your/docs
```

## Deploy

Inside the generated app:

```bash
pnpm deploy
```

Cloudflare deployment settings live in the generated `wrangler.jsonc`.

## Notes

- generated sites use Next.js + Fumadocs
- generated sites ship with local source, not a monorepo-only workspace dependency
- this repo currently focuses on the docs shell and scaffold flow
