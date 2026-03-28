"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DocsBrand } from "./docs-brand";
import { DocsToolbarSearch } from "./docs-toolbar-search";
import { Button } from "./ui/button";
import { getPageTreeLabel, type PageTree, type PageTreeNode } from "../lib/page-tree";
import { cn } from "../lib/utils";

export type DocsShellNavItem = {
  href: string;
  label: string;
};

type NavSection = {
  label: string;
  items: DocsShellNavItem[];
};

export type DocsShellProps = {
  brand?: ReactNode;
  children: ReactNode;
  githubCountLabel?: string;
  githubHref?: string;
  homeAriaLabel?: string;
  homeHref?: string;
  navLabelByUrl?: Record<string, string>;
  newHref?: string;
  newLabel?: string;
  primaryNav?: DocsShellNavItem[];
  showGithubLink?: boolean;
  showSearch?: boolean;
  tree: PageTree | null;
};

const defaultPrimaryNav: DocsShellNavItem[] = [
  { href: "/docs", label: "Docs" },
  { href: "/docs/components", label: "Components" },
  { href: "/docs/components/card", label: "Blocks" },
  { href: "/docs/components/chart", label: "Charts" },
  { href: "/docs/registry", label: "Directory" },
  { href: "/create", label: "Create" },
];

const defaultNavLabelByUrl: Record<string, string> = {
  "/docs": "Introduction",
  "/docs/changelog": "Changelog",
  "/docs/cli": "CLI",
  "/docs/components": "Components",
  "/docs/forms": "Forms",
  "/docs/installation": "Installation",
  "/docs/mcp": "MCP Server",
  "/docs/registry": "Registry",
  "/docs/rtl": "RTL",
  "/docs/skills": "Skills",
  "/docs/theming": "Theming",
};

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M12 2.75a9.25 9.25 0 0 0-2.92 18.03c.46.08.63-.19.63-.44v-1.68c-2.55.56-3.09-1.08-3.09-1.08a2.43 2.43 0 0 0-1.03-1.34c-.83-.56.06-.55.06-.55a1.93 1.93 0 0 1 1.41.94 1.98 1.98 0 0 0 2.69.77 1.98 1.98 0 0 1 .59-1.25c-2.03-.23-4.17-1.01-4.17-4.52a3.55 3.55 0 0 1 .94-2.47 3.3 3.3 0 0 1 .09-2.43s.77-.25 2.53.95a8.86 8.86 0 0 1 4.61 0c1.76-1.2 2.53-.95 2.53-.95a3.3 3.3 0 0 1 .09 2.43 3.55 3.55 0 0 1 .94 2.47c0 3.52-2.14 4.28-4.18 4.5a2.24 2.24 0 0 1 .63 1.73v2.56c0 .25.17.52.64.43A9.25 9.25 0 0 0 12 2.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ModeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.55 1.55M17.75 17.75l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.55-1.55M17.75 6.25l1.55-1.55"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/docs") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function toNavItem(node: PageTreeNode, labelByUrl: Record<string, string>): DocsShellNavItem | null {
  if (node.type !== "page" || !node.url) {
    return null;
  }

  return {
    href: node.url,
    label: getPageTreeLabel(node, labelByUrl),
  };
}

function flattenPages(nodes: PageTreeNode[], labelByUrl: Record<string, string>): DocsShellNavItem[] {
  return nodes.flatMap((node) => {
    if (node.type === "page") {
      const item = toNavItem(node, labelByUrl);
      return item ? [item] : [];
    }

    if (node.type === "folder") {
      return flattenPages(node.children ?? [], labelByUrl);
    }

    return [];
  });
}

function buildSidebarSections(tree: PageTree | null, labelByUrl: Record<string, string>): NavSection[] {
  const nodes = tree?.children ?? [];
  const sections: NavSection[] = [];

  const rootItems = nodes.flatMap((node) => {
    const item = toNavItem(node, labelByUrl);
    return item ? [item] : [];
  });

  if (rootItems.length > 0) {
    sections.push({
      label: "Documents",
      items: rootItems,
    });
  }

  nodes.forEach((node) => {
    if (node.type !== "folder") {
      return;
    }

    const items = flattenPages(node.children ?? [], labelByUrl);
    if (items.length === 0) {
      return;
    }

    sections.push({
      label: getPageTreeLabel(node),
      items,
    });
  });

  return sections;
}

function SidebarLink({
  href,
  isCurrent,
  label,
}: {
  href: string;
  isCurrent: boolean;
  label: string;
}) {
  return (
    <Link
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "relative inline-flex h-[30px] w-fit max-w-full items-center gap-2 overflow-visible rounded-md border border-transparent px-2 text-[0.8rem] font-medium text-foreground/82 transition-colors hover:text-foreground",
        "after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md",
        isCurrent && "border-accent bg-accent text-foreground",
      )}
      href={href}
    >
      <span className="relative z-10 truncate">{label}</span>
    </Link>
  );
}

export function DocsShell({
  brand = <DocsBrand label="Docs" />,
  children,
  githubCountLabel = "GitHub",
  githubHref = "https://github.com/topooAI/topoo",
  homeAriaLabel = "Docs home",
  homeHref = "/docs",
  navLabelByUrl = defaultNavLabelByUrl,
  newHref = "/create",
  newLabel = "New",
  primaryNav = defaultPrimaryNav,
  showGithubLink = true,
  showSearch = true,
  tree,
}: DocsShellProps) {
  const pathname = usePathname();
  const sidebarSections = buildSidebarSections(tree, navLabelByUrl);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur">
        <div className="w-full px-5 lg:px-6">
          <div className="flex h-(--header-height) items-center gap-4">
            <div className="flex items-center gap-3">
              <Button asChild className="hidden size-8 lg:inline-flex" size="icon-sm" variant="ghost">
                <Link aria-label={homeAriaLabel} href={homeHref}>
                  {brand}
                </Link>
              </Button>
              <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    className={cn(
                      "inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-foreground/72 transition-colors hover:text-foreground",
                      isActive(pathname, item.href) && "text-foreground",
                    )}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {showSearch ? (
                <div className="hidden md:flex">
                  <DocsToolbarSearch />
                </div>
              ) : null}
              {showSearch ? <div className="hidden h-4 w-px bg-border lg:block" /> : null}
              {showGithubLink ? (
                <>
                  <a
                    className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm font-medium text-foreground/72 transition-colors hover:text-foreground"
                    href={githubHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <GitHubIcon />
                    <span>{githubCountLabel}</span>
                  </a>
                  <div className="hidden h-4 w-px bg-border lg:block" />
                </>
              ) : null}
              <Button aria-label="Toggle theme" className="size-8" size="icon-sm" variant="ghost">
                <ModeIcon />
              </Button>
              <div className="hidden h-4 w-px bg-border lg:block" />
              <Button asChild className="h-[31px] rounded-lg px-3" size="sm">
                <Link href={newHref}>
                  <PlusIcon />
                  {newLabel}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-5 lg:px-6">
        <div className="grid w-full gap-8 lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[224px_minmax(0,1fr)]">
          <aside className="sticky top-[calc(var(--header-height)+0.6rem)] hidden mt-[0.6rem] h-[calc(100svh-5.6rem)] overflow-hidden lg:block">
            <div className="absolute top-8 z-10 h-8 w-56 shrink-0 bg-linear-to-b from-background via-background/80 to-background/50 blur-xs" />
            <div className="absolute top-12 right-2 bottom-0 hidden w-px bg-linear-to-b from-transparent via-border to-transparent lg:block" />
            <div className="no-scrollbar h-full w-56 overflow-y-auto px-2 pb-6 pt-9">
              {sidebarSections.map((section) => (
                <section key={section.label} className="pt-6">
                  <p className="mb-2 px-2 text-xs font-medium text-foreground/52">{section.label}</p>
                  <ul className="flex flex-col gap-0.5">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <SidebarLink href={item.href} isCurrent={isActive(pathname, item.href)} label={item.label} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
