# __SITE_NAME__

This site was generated from the Topoo Fumadocs system starter.
The site includes a local `fumadocs-system/` directory, so it can be developed and deployed independently of the source monorepo.

## Start

```bash
pnpm install
pnpm dev
```

## Import Existing Markdown

```bash
pnpm import:docs ../../docs
```

## Build

```bash
pnpm build
```

## Deploy To Cloudflare

1. Update `wrangler.jsonc`
2. Run:

```bash
pnpm deploy
```
