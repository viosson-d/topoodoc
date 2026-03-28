import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const rootDir = path.resolve(currentDir, "..");
const sourceArg = process.argv[2];
const sourceDir = sourceArg ? path.resolve(rootDir, sourceArg) : path.resolve(rootDir, "docs-source");
const targetDir = path.resolve(rootDir, "content/docs");

function isMarkdownFile(fileName) {
  return fileName.endsWith(".md") || fileName.endsWith(".mdx");
}

function outputName(fileName) {
  const parsed = path.parse(fileName);
  if (parsed.name.toLowerCase() === "readme") {
    return "index.mdx";
  }

  return `${parsed.name}.mdx`;
}

async function buildMeta(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const pages = entries
    .filter((entry) => entry.isDirectory() || entry.name.endsWith(".mdx"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => (entry.isDirectory() ? entry.name : path.parse(entry.name).name));

  await writeFile(
    path.join(dir, "meta.json"),
    `${JSON.stringify({ pages, root: dir === targetDir, title: "Documents" }, null, 2)}\n`,
    "utf8",
  );

  for (const entry of entries) {
    if (entry.isDirectory()) {
      await buildMeta(path.join(dir, entry.name));
    }
  }
}

async function importDirectory(fromDir, toDir) {
  await mkdir(toDir, { recursive: true });
  const entries = await readdir(fromDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const sourcePath = path.join(fromDir, entry.name);
    if (entry.isDirectory()) {
      await importDirectory(sourcePath, path.join(toDir, entry.name));
      continue;
    }

    if (!isMarkdownFile(entry.name)) {
      continue;
    }

    const content = await readFile(sourcePath, "utf8");
    await writeFile(path.join(toDir, outputName(entry.name)), content.trimEnd() + "\n", "utf8");
  }
}

await rm(targetDir, { recursive: true, force: true });
await mkdir(targetDir, { recursive: true });

await importDirectory(sourceDir, targetDir);
await buildMeta(targetDir);

const importedFiles = await readdir(targetDir);

if (importedFiles.length === 1 && importedFiles[0] === "meta.json") {
  await writeFile(
    path.join(targetDir, "index.mdx"),
    "---\ntitle: \"Introduction\"\ndescription: \"Imported docs are empty.\"\n---\n\nNo markdown files were found in the source directory.\n",
    "utf8",
  );
  await buildMeta(targetDir);
}

console.log(`[fumadocs-system] Imported docs from ${sourceDir}`);
