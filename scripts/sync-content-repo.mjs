import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const rootDir = path.resolve(currentDir, "..");

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (!arg.startsWith("--")) {
      continue;
    }

    options[arg.slice(2)] = next && !next.startsWith("--") ? next : "true";
    if (next && !next.startsWith("--")) {
      index += 1;
    }
  }

  return options;
}

function titleFromSlug(slug) {
  if (slug === "mcp") {
    return "MCP";
  }

  if (slug === "topooui") {
    return "TopooUI";
  }

  if (slug.startsWith("to")) {
    return `to${slug.slice(2).replace(/(^|-)([a-z])/g, (_, prefix, char) => `${prefix === "-" ? "" : ""}${char.toUpperCase()}`)}`;
  }

  return slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function parseFrontmatterTitle(raw) {
  if (raw.startsWith("---\n")) {
    const endIndex = raw.indexOf("\n---\n", 4);
    if (endIndex !== -1) {
      const frontmatter = raw.slice(4, endIndex);
      const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
      if (titleMatch?.[1]) {
        return titleMatch[1].trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }

  const headingMatch = raw.match(/^#\s+(.+)$/m);
  return headingMatch?.[1]?.trim();
}

function docsUrlFromRelativePath(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  const withoutExt = normalized.replace(/\.(md|mdx)$/u, "");
  if (withoutExt === "index") {
    return "/docs";
  }

  if (withoutExt.endsWith("/index")) {
    return `/docs/${withoutExt.slice(0, -"/index".length)}`;
  }

  return `/docs/${withoutExt}`;
}

async function collectDocFiles(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectDocFiles(fullPath, relativePath)));
      continue;
    }

    if (!/\.(md|mdx)$/u.test(entry.name)) {
      continue;
    }

    files.push(relativePath);
  }

  return files;
}

async function pathExists(targetPath) {
  try {
    await readdir(targetPath);
    return true;
  } catch {
    return false;
  }
}

function renderDocsConfig(contentConfig, navLabelByUrl) {
  const metadataTitle = JSON.stringify(contentConfig.site?.title ?? "Docs");
  const metadataDescription = JSON.stringify(contentConfig.site?.description ?? "Documentation.");
  const githubCountLabel = JSON.stringify(contentConfig.shell?.githubCountLabel ?? "Source");
  const githubHref = JSON.stringify(contentConfig.shell?.githubHref ?? "https://github.com/your-org/your-docs");
  const homeAriaLabel = JSON.stringify(contentConfig.shell?.homeAriaLabel ?? `${contentConfig.site?.title ?? "Docs"} home`);
  const homeHref = JSON.stringify(contentConfig.shell?.homeHref ?? "/docs");
  const newHref = JSON.stringify(contentConfig.shell?.newHref ?? "/docs");
  const newLabel = JSON.stringify(contentConfig.shell?.newLabel ?? "Docs");
  const showGithubLink = contentConfig.shell?.showGithubLink ?? true;
  const showPrimaryAction = contentConfig.shell?.showPrimaryAction ?? false;
  const showSearch = contentConfig.shell?.showSearch ?? true;
  const primaryNav = JSON.stringify(contentConfig.navigation?.primary ?? [{ href: "/docs", label: "Docs" }], null, 2);
  const navMap = JSON.stringify(navLabelByUrl, null, 2);

  return `import type { DocsShellNavItem } from "@topoo/fumadocs-system";

export const docsSite = {
  metadata: {
    description: ${metadataDescription},
    title: ${metadataTitle},
  },
  shell: {
    githubCountLabel: ${githubCountLabel},
    githubHref: ${githubHref},
    homeAriaLabel: ${homeAriaLabel},
    homeHref: ${homeHref},
    navLabelByUrl: ${navMap},
    newHref: ${newHref},
    newLabel: ${newLabel},
    primaryNav: ${primaryNav} satisfies DocsShellNavItem[],
    showGithubLink: ${showGithubLink},
    showSearch: ${showSearch},
    showPrimaryAction: ${showPrimaryAction},
  },
} as const;
`;
}

const args = parseArgs(process.argv.slice(2));
const contentRepoDir = path.resolve(rootDir, args.content ?? process.env.TOPOODOC_CONTENT_REPO ?? "../topoo-docs");
const siteDir = path.resolve(rootDir, args.site ?? "apps/content-site");
const contentSourceDir = path.join(contentRepoDir, "content/docs");
const contentTargetDir = path.join(siteDir, "content/docs");
const systemContentDir = path.join(rootDir, "system-content/docs");
const systemOwnedDirs = ["topooui"];
const contentConfigPath = path.join(contentRepoDir, "topoodoc.content.json");
const docsConfigPath = path.join(siteDir, "docs.config.ts");

const contentConfig = JSON.parse(await readFile(contentConfigPath, "utf8"));

await rm(contentTargetDir, { recursive: true, force: true });
await mkdir(path.dirname(contentTargetDir), { recursive: true });
await cp(contentSourceDir, contentTargetDir, { recursive: true });

for (const systemOwnedDir of systemOwnedDirs) {
  const sourcePath = path.join(systemContentDir, systemOwnedDir);
  const targetPath = path.join(contentTargetDir, systemOwnedDir);

  if (!(await pathExists(sourcePath))) {
    continue;
  }

  await rm(targetPath, { recursive: true, force: true });
  await cp(sourcePath, targetPath, { recursive: true });
}

const docFiles = await collectDocFiles(contentTargetDir);
const navLabelByUrl = {};

for (const item of contentConfig.navigation?.primary ?? []) {
  navLabelByUrl[item.href] = item.label;
}

for (const relativePath of docFiles) {
  const filePath = path.join(contentTargetDir, relativePath);
  const raw = await readFile(filePath, "utf8");
  const url = docsUrlFromRelativePath(relativePath);
  const fallback = titleFromSlug(path.basename(relativePath, path.extname(relativePath)));
  navLabelByUrl[url] = parseFrontmatterTitle(raw) ?? fallback;
}

await writeFile(docsConfigPath, renderDocsConfig(contentConfig, navLabelByUrl), "utf8");

console.log(`[content:sync] Synced ${contentRepoDir} into ${siteDir}`);
