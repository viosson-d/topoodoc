# Content Repo Contract

`topoodoc` and customer documentation content must live in separate repositories.

## Repository Roles

### 1. `topoodoc`
Owns:
- docs shell
- reusable components
- Fumadocs runtime integration
- Next.js app code
- build and deploy tooling
- publishing automation

### 2. content repo
Owns:
- `content/docs/**`
- `content/docs/**/meta.json`
- `topoodoc.content.json`
- doc-local assets when needed

Does not own:
- Next.js app code
- Fumadocs system files
- deployment code
- package manager lockfiles

## Why This Split Matters

- system upgrades should not require editing client content repos
- multiple client docs repos can reuse the same publishing system
- content repos stay low-risk, searchable, and easy to review
- the rendering and deployment stack can evolve independently

## Minimum File Set

- `README.md`
- `.gitignore`
- `topoodoc.content.json`
- `content/docs/**`

## Current Generator

Use:

```bash
pnpm content:create -- --name "Acme Docs" --target ../acme-docs-content --github https://github.com/acme/docs-content --domain docs.acme.com
```
