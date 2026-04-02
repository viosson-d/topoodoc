# topoodoc

Topoo-styled documentation system for generating and publishing documentation sites from pure content repositories.

## What This Repo Contains

- `packages/fumadocs-system`
- `templates/fumadocs-system`
- `templates/docs-content-repo`
- `scripts/create-fumadocs-system.mjs`
- `scripts/create-docs-content-repo.mjs`

This repo owns the docs system, not customer content. Customer docs should live in separate pure content repositories.

## Two Repo Model

- `topoodoc`: system repo
- customer docs repo: pure content repo

## Create A Docs Site Shell

```bash
pnpm install
pnpm docs:create -- --name "Topoo Docs" --target apps/topoo-docs --github https://github.com/your-org/topoo-docs
```

## Create A Pure Content Repo

```bash
pnpm content:create -- --name "Acme Docs" --target ../acme-docs-content --github https://github.com/acme/docs-content --domain docs.acme.com
```

## Build From A Pure Content Repo

By default, the system looks for a sibling repo named `../topoo-docs`.

```bash
pnpm content:sync
pnpm content:build
pnpm content:deploy
```

To target another content repo:

```bash
TOPOODOC_CONTENT_REPO=../acme-docs-content pnpm content:build
TOPOODOC_CONTENT_REPO=../acme-docs-content pnpm content:deploy
```

For local authoring:

```bash
TOPOODOC_CONTENT_REPO=../acme-docs-content pnpm content:dev
```

`apps/content-site/content/docs`, `apps/content-site/docs.config.ts`, and `apps/content-site/.source` are generated during sync/build and are not the source of truth.

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

## Notes

- generated docs sites use Next.js + Fumadocs
- generated content repos stay pure and do not carry the app shell
- system upgrades belong in `topoodoc`, not in customer content repos
