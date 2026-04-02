import { DocsCopyPage, DocsTableOfContents, flattenPageTree, type PageTreeNode } from "@topoo/fumadocs-system";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import { source } from "@/lib/source";

type DocsPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

function isSectionMatch(pathname: string, url: string) {
  if (url === "/docs") {
    return pathname === url;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

function nodeContainsPath(node: PageTreeNode, pathname: string): boolean {
  if (node.url && isSectionMatch(pathname, node.url)) {
    return true;
  }

  return (node.children ?? []).some((child) => nodeContainsPath(child as PageTreeNode, pathname));
}

function getScopedTreeNodes(nodes: PageTreeNode[], currentUrl: string): PageTreeNode[] {
  if (currentUrl === "/docs") {
    return nodes.filter((node) => node.type === "page");
  }

  const activeFolder = nodes.find((node) => node.type === "folder" && nodeContainsPath(node, currentUrl));
  return activeFolder?.children ?? nodes;
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5">
      <path
        d="M15 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export default async function DocsPageRoute({ params }: DocsPageProps) {
  const { slug = [] } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const raw = await page.data.getText("raw");
  const tocItems = (page.data.toc ?? []).filter((item) => item.depth <= 3);
  const currentUrl = slug.length === 0 ? "/docs" : `/docs/${slug.join("/")}`;
  const pageTreeNodes = (source.getPageTree()?.children ?? []) as PageTreeNode[];
  const orderedPages = flattenPageTree(getScopedTreeNodes(pageTreeNodes, currentUrl));
  const currentIndex = orderedPages.findIndex((item) => item.url === currentUrl);
  const previousPage = currentIndex > 0 ? orderedPages[currentIndex - 1] : null;
  const nextPage = currentIndex >= 0 && currentIndex < orderedPages.length - 1 ? orderedPages[currentIndex + 1] : null;
  const relativeLink = createRelativeLink(source, page);

  return (
    <div className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[40rem] min-w-0 flex-1 flex-col gap-6 px-4 pt-10 pb-6 md:px-0 lg:pt-12 lg:pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between md:items-start">
              <h1 className="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl">{page.data.title}</h1>
              <div className="hidden sm:block">
                <DocsCopyPage
                  content={raw}
                  nextPage={nextPage}
                  previousPage={previousPage}
                  title={page.data.title}
                  url={currentUrl}
                />
              </div>
            </div>

            {page.data.description ? (
              <p className="text-[1.05rem] text-muted-foreground sm:text-base md:max-w-[80%]">{page.data.description}</p>
            ) : null}
          </div>

          <div className="sm:hidden">
            <DocsCopyPage
              content={raw}
              nextPage={nextPage}
              previousPage={previousPage}
              title={page.data.title}
              url={currentUrl}
            />
          </div>

          <div className="w-full flex-1 pb-16 sm:pb-0 *:data-[slot=alert]:first:mt-0">
            <MDX
              components={getMDXComponents({
                a: ({ className, ...props }) =>
                  relativeLink({
                    className: `font-medium underline underline-offset-4${className ? ` ${className}` : ""}`,
                    ...props,
                  }),
              })}
            />
          </div>

          {(previousPage || nextPage) ? (
            <div className="hidden h-16 w-full items-center gap-2 sm:flex">
              {previousPage ? (
                <a
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-3 text-[12.8px] font-medium text-foreground no-underline transition-colors hover:bg-secondary/80"
                  href={previousPage.url}
                >
                  <ArrowLeftIcon />
                  {previousPage.title}
                </a>
              ) : null}

              {nextPage ? (
                <a
                  className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-3 text-[12.8px] font-medium text-foreground no-underline transition-colors hover:bg-secondary/80"
                  href={nextPage.url}
                >
                  {nextPage.title}
                  <ArrowRightIcon />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-64 shrink-0 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="no-scrollbar flex flex-col gap-8 overflow-y-auto px-6 pt-8">
          <DocsTableOfContents toc={tocItems} />
          <div className="w-full rounded-xl border bg-muted/40 p-5 text-sm">
            <div className="font-semibold leading-6">Topoo documentation system</div>
            <p className="mt-2 text-muted-foreground">
              This board structure now separates desktop docs, work surfaces, and TopooUI references.
            </p>
            <p className="mt-2 text-muted-foreground">
              Use the top navigation to move between Topoo, toAgent, toWork, toProject, toMemory, and TopooUI.
            </p>
            <a
              className="mt-4 inline-flex h-8 items-center rounded-lg border bg-background px-4 text-[12.8px] font-medium text-foreground no-underline"
              href="/docs/topooui"
            >
              Open TopooUI
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
