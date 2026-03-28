import type { DocsShellNavItem } from "@/fumadocs-system";

export const docsSite = {
  metadata: {
    description: "__SITE_DESCRIPTION__",
    title: "__SITE_NAME__",
  },
  shell: {
    githubCountLabel: "Source",
    githubHref: "__GITHUB_URL__",
    homeAriaLabel: "__SITE_NAME__ home",
    homeHref: "/docs",
    navLabelByUrl: {
      "/docs": "Introduction",
    },
    newHref: "/docs",
    newLabel: "Docs",
    primaryNav: [
      { href: "/docs", label: "Docs" },
    ] satisfies DocsShellNavItem[],
    showGithubLink: true,
    showSearch: true,
  },
} as const;
