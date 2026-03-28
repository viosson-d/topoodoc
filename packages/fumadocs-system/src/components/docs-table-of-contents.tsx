"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";

type TocItem = {
  title?: ReactNode;
  url: string;
  depth: number;
};

function useActiveHeading(itemIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0% 0% -80% 0%" },
    );

    for (const id of itemIds) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      for (const id of itemIds) {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      }
    };
  }, [itemIds]);

  return activeId;
}

export function DocsTableOfContents({ toc }: { toc: TocItem[] }) {
  const itemIds = useMemo(() => toc.map((item) => item.url.replace("#", "")), [toc]);
  const activeHeading = useActiveHeading(itemIds);

  if (!toc.length) {
    return null;
  }

  return (
    <aside aria-label="On this page" className="ml-auto hidden w-56 xl:block">
      <div className="flex flex-col gap-2 p-4 pt-0 text-sm">
        <p className="sticky top-0 h-6 bg-background text-xs font-medium text-muted-foreground">On This Page</p>
        {toc.map((item) => (
          <a
            key={item.url}
            className={cn(
              "text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground",
              "data-[active=true]:font-medium data-[active=true]:text-foreground",
              "data-[depth=3]:pl-4 data-[depth=4]:pl-6",
            )}
            data-active={item.url === `#${activeHeading}`}
            data-depth={item.depth}
            href={item.url}
          >
            {item.title}
          </a>
        ))}
      </div>
    </aside>
  );
}
