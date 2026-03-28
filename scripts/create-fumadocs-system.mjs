import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const rootDir = path.resolve(currentDir, "..");
const templateDir = path.resolve(rootDir, "templates/fumadocs-system");
const sharedSystemDir = path.resolve(rootDir, "packages/fumadocs-system/src");

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

async function replacePlaceholders(dir, replacements) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await replacePlaceholders(entryPath, replacements);
      continue;
    }

    const raw = await readFile(entryPath, "utf8");
    const replaced = Object.entries(replacements).reduce(
      (content, [key, value]) => content.replaceAll(key, value),
      raw,
    );
    await writeFile(entryPath, replaced, "utf8");
  }
}

const args = parseArgs(process.argv.slice(2));
const siteName = args.name ?? "My Docs";
const siteDescription = args.description ?? `${siteName} documentation.`;
const target = args.target ?? `apps/${slugify(siteName)}-docs`;
const packageName = args.package ?? slugify(siteName).replace(/-/g, "-");
const githubUrl = args.github ?? "https://github.com/your-org/your-repo";
const wranglerName = args.wrangler ?? slugify(siteName);
const absoluteTarget = path.resolve(rootDir, target);

try {
  await stat(absoluteTarget);
  throw new Error(`Target already exists: ${absoluteTarget}`);
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code !== "ENOENT") {
    throw error;
  }
}

await mkdir(path.dirname(absoluteTarget), { recursive: true });
await cp(templateDir, absoluteTarget, { recursive: true });
await cp(sharedSystemDir, path.join(absoluteTarget, "fumadocs-system"), { recursive: true });

await replacePlaceholders(absoluteTarget, {
  "__GITHUB_URL__": githubUrl,
  "__PACKAGE_NAME__": packageName,
  "__SITE_DESCRIPTION__": siteDescription,
  "__SITE_NAME__": siteName,
  "__WRANGLER_NAME__": wranglerName,
});

console.log(`[fumadocs-system] Created ${siteName} at ${absoluteTarget}`);
console.log(`[fumadocs-system] The shared docs shell was vendored into ${path.join(target, "fumadocs-system")}`);
console.log(`[fumadocs-system] Next steps:`);
console.log(`  1. pnpm install`);
console.log(`  2. cd ${target}`);
console.log(`  3. pnpm dev`);
