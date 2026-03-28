import type { ReactNode } from "react";
import { DocsBrand, DocsShell } from "@/fumadocs-system";
import { docsSite } from "@/docs.config";
import { source } from "@/lib/source";

export default function DocsSectionLayout({ children }: { children: ReactNode }) {
  return (
    <DocsShell
      brand={<DocsBrand label={docsSite.metadata.title} />}
      githubCountLabel={docsSite.shell.githubCountLabel}
      githubHref={docsSite.shell.githubHref}
      homeAriaLabel={docsSite.shell.homeAriaLabel}
      homeHref={docsSite.shell.homeHref}
      navLabelByUrl={docsSite.shell.navLabelByUrl}
      newHref={docsSite.shell.newHref}
      newLabel={docsSite.shell.newLabel}
      primaryNav={docsSite.shell.primaryNav}
      showGithubLink={docsSite.shell.showGithubLink}
      showSearch={docsSite.shell.showSearch}
      tree={source.getPageTree()}
    >
      {children}
    </DocsShell>
  );
}
