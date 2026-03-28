# Fumadocs System

This workspace now contains a reusable docs publishing system based on the Topoo docs shell.

## What It Is

- shared package: `packages/fumadocs-system`
- reusable starter: `templates/fumadocs-system`
- scaffold command: `pnpm docs:create -- --name "Acme Docs" --target apps/acme-docs`
- generated sites vendor the shared shell into a local `fumadocs-system/` folder, so they can run outside this monorepo

## What The Shared Package Owns

- docs shell
- docs toolbar search
- docs typography and CSS tokens
- docs page chrome helpers
- MDX primitives such as callout, linked card, tabs, steps, package command tabs
- code highlighting transformers

## What The Starter Owns

- a standalone Next.js + Fumadocs site
- a vendored local `fumadocs-system/` source tree copied from the shared package
- source loader wiring
- Cloudflare `wrangler.jsonc`
- markdown import script

## Create A New Docs Site

```bash
pnpm docs:create -- --name "Acme Docs" --target apps/acme-docs --github https://github.com/acme/docs
```

After generation, the new site does not import `@topoo/fumadocs-system` from the workspace. It imports its own local `fumadocs-system/` folder and can be moved to another repository.

## Import Existing Markdown

Inside the generated site:

```bash
pnpm import:docs ../../docs
```

This copies `.md` and `.mdx` files into `content/docs` and generates `meta.json` files for navigation.

## Local Development

```bash
cd apps/acme-docs
pnpm install
pnpm dev
```

## Deploy

1. Update `wrangler.jsonc`
2. Run `pnpm deploy`

## Current Reference Implementation

The current Topoo docs app at `apps/docs` is now the first consumer of this system.
