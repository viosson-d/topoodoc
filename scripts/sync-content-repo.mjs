import { access, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
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

function relativeDocPathFromHref(href) {
  if (href === "/docs") {
    return "index.mdx";
  }

  const withoutPrefix = href.replace(/^\/docs\//u, "");
  return `${withoutPrefix}.mdx`;
}

function blockFolderFromHref(href) {
  if (href === "/docs") {
    return null;
  }

  return href.replace(/^\/docs\//u, "").split("/")[0] ?? null;
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

async function collectAllFiles(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectAllFiles(fullPath, relativePath)));
      continue;
    }

    files.push(relativePath);
  }

  return files;
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeJson(targetPath, value) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(`${targetPath}`, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
  const sidebarSectionsByRoot = JSON.stringify(contentConfig.navigation?.sidebarSectionsByRoot ?? {}, null, 2);

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
    sidebarSectionsByRoot: ${sidebarSectionsByRoot},
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
const systemOwnedRoots = ["topooui"];
const contentConfigPath = path.join(contentRepoDir, "topoodoc.content.json");
const contentModelDir = path.join(contentRepoDir, "content-model");
const systemContentModelDir = path.join(rootDir, "system-content/content-model");
const docsConfigPath = path.join(siteDir, "docs.config.ts");

await rm(contentTargetDir, { recursive: true, force: true });
await mkdir(path.dirname(contentTargetDir), { recursive: true });
await cp(contentSourceDir, contentTargetDir, { recursive: true });

for (const rootName of systemOwnedRoots) {
  await rm(path.join(contentTargetDir, rootName), { recursive: true, force: true });
}

try {
  const systemFiles = await collectAllFiles(systemContentDir);

  for (const relativePath of systemFiles) {
    const sourcePath = path.join(systemContentDir, relativePath);
    const targetPath = path.join(contentTargetDir, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath);
  }
} catch {
  // no system baseline content yet
}

const contentConfig = JSON.parse(await readFile(contentConfigPath, "utf8"));
const hasContentModel = await pathExists(contentModelDir);
const hasSystemContentModel = await pathExists(systemContentModelDir);

if (hasContentModel) {
  const [siteModel, contentBoardsModel, contentBlocksModel, contentTopicsModel, contentPagesModel] = await Promise.all([
    readFile(path.join(contentModelDir, "site.json"), "utf8").then(JSON.parse),
    readFile(path.join(contentModelDir, "boards.json"), "utf8").then(JSON.parse),
    readFile(path.join(contentModelDir, "blocks.json"), "utf8").then(JSON.parse),
    readFile(path.join(contentModelDir, "topics.json"), "utf8").then(JSON.parse),
    readFile(path.join(contentModelDir, "pages.json"), "utf8").then(JSON.parse),
  ]);

  const [systemBoardsModel, systemBlocksModel, systemTopicsModel, systemPagesModel] = hasSystemContentModel
    ? await Promise.all([
        readFile(path.join(systemContentModelDir, "boards.json"), "utf8").then(JSON.parse),
        readFile(path.join(systemContentModelDir, "blocks.json"), "utf8").then(JSON.parse),
        readFile(path.join(systemContentModelDir, "topics.json"), "utf8").then(JSON.parse),
        readFile(path.join(systemContentModelDir, "pages.json"), "utf8").then(JSON.parse),
      ])
    : [[], [], [], []];

  const boardsModel = [...contentBoardsModel, ...systemBoardsModel];
  const blocksModel = [...contentBlocksModel, ...systemBlocksModel];
  const topicsModel = [...contentTopicsModel, ...systemTopicsModel];
  const pagesModel = [...contentPagesModel, ...systemPagesModel];

  const boardOrder = siteModel.boardOrder ?? blocksModel.map((block) => block.id);
  const systemOwnedBoards = new Set(siteModel.systemOwnedBoards ?? []);
  const boardById = new Map(boardsModel.map((board) => [board.id, board]));
  const blockById = new Map(blocksModel.map((block) => [block.id, block]));
  const pageById = new Map(pagesModel.map((page) => [page.id, page]));
  const sidebarSectionsByRoot = {};

  for (const page of pagesModel) {
    const pageBaseDir = page.file.startsWith("docs/topooui/")
      ? path.join(rootDir, "system-content")
      : contentRepoDir;
    const pagePath = path.join(pageBaseDir, page.file);
    if (!(await pathExists(pagePath))) {
      throw new Error(`[content:model] Missing page body for ${page.id}: ${page.file}`);
    }
  }

  const rootPages = ["index"];
  for (const boardId of boardOrder) {
    if (boardId === "topoo") {
      continue;
    }

    const board = boardById.get(boardId);
    if (!board) {
      throw new Error(`[content:model] Unknown board ${boardId} in site.json`);
    }

    const folder = blockFolderFromHref(board.href);
    if (folder && !systemOwnedBoards.has(boardId)) {
      rootPages.push(folder);
    }
  }

  await writeJson(path.join(contentTargetDir, "meta.json"), {
    root: true,
    title: "Boards",
    pages: rootPages,
  });

  for (const board of boardsModel) {
    if (board.id === "topoo") {
      continue;
    }

    const folder = blockFolderFromHref(board.href);
    if (!folder) {
      continue;
    }

    const boardBlocks = blocksModel.filter((block) => block.boardId === board.id);
    const pages = [];
    const sections = [];

    for (const block of boardBlocks) {
      const blockTopics = topicsModel.filter((topic) => topic.blockId === block.id);

      for (const topic of blockTopics) {
        const sectionItems = [];

        for (const pageId of topic.pageIds ?? []) {
          const page = pageById.get(pageId);
          if (!page) {
            throw new Error(`[content:model] Unknown page ${pageId} in topic ${topic.id}`);
          }

          let pageKey = "index";

          if (page.href !== board.href) {
            const relativeDocPath = relativeDocPathFromHref(page.href);
            const blockRelative = relativeDocPath.replace(`${folder}/`, "");
            pageKey = blockRelative.replace(/\.(md|mdx)$/u, "").replace(/\/index$/u, "") || "index";
          }

          pages.push(pageKey || "index");
          sectionItems.push({
            href: page.href,
            label: page.title,
          });
        }

        if (sectionItems.length > 0) {
          sections.push({
            label: topic.label,
            items: sectionItems,
          });
        }
      }
    }

    if (!systemOwnedBoards.has(board.id)) {
      await writeJson(path.join(contentTargetDir, folder, "meta.json"), {
        title: board.label,
        pages,
      });
    }

    sidebarSectionsByRoot[board.href] = sections;
  }

  const existingPrimaryNav = contentConfig.navigation?.primary ?? [];
  const generatedPrimaryNav = boardsModel.map((board) => ({
    href: board.href,
    label: board.label,
  }));
  const generatedPrimaryNavHrefs = new Set(generatedPrimaryNav.map((item) => item.href));
  const systemOwnedPrimaryNav = existingPrimaryNav.filter((item) => {
    const folder = blockFolderFromHref(item.href);
    return folder ? systemOwnedBoards.has(folder) && !generatedPrimaryNavHrefs.has(item.href) : false;
  });

  contentConfig.navigation = {
    ...(contentConfig.navigation ?? {}),
    primary: [
      ...generatedPrimaryNav,
      ...systemOwnedPrimaryNav,
    ],
    sidebarSectionsByRoot,
  };
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
