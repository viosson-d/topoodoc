"use client";

import Link from "next/link";
import { useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <rect x="9" y="9" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M5 12.5l4.2 4.2L19 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function Callout({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "not-prose relative mt-6 grid w-auto grid-cols-[0_1fr] items-start gap-y-0.5 rounded-xl border border-surface bg-surface px-4 py-3 text-sm leading-6 text-surface-foreground md:-mx-1 [&_p]:m-0 [&_strong]:font-medium **:[code]:border",
        className,
      )}
      data-slot="alert"
      role="alert"
      {...props}
    >
      <div
        data-slot="alert-description"
        className="col-start-2 grid justify-items-start gap-1 text-sm text-card-foreground/80 [&_p]:leading-relaxed"
      >
        {children}
      </div>
    </div>
  );
}

export function LinkedCard({
  children,
  className,
  href,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const isFrameworkCard = href.startsWith("/docs/installation/") || href.startsWith("/docs/rtl/");

  return (
    <Link
      href={href}
      className={cn(
        isFrameworkCard
          ? "not-prose flex w-full flex-col items-center rounded-xl bg-surface p-6 text-surface-foreground no-underline transition-colors hover:bg-surface/80 sm:p-10 [&_p]:mt-2 [&_p]:text-[15px] [&_p]:leading-[22.5px] [&_p]:font-medium"
          : "not-prose flex h-full min-h-[132px] flex-col justify-start rounded-xl border bg-background p-6 text-sm no-underline transition-colors hover:bg-accent/30",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Steps({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("steps mb-12 pl-8 md:pl-12", className)}>{children}</div>;
}

export function Step({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("step scroll-m-24 text-lg font-medium tracking-[-0.45px]", className)}>
      {children}
    </h3>
  );
}

export function Accordion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("not-prose mt-6", className)}>{children}</div>;
}

export function AccordionItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <details className={cn("group rounded-xl border bg-background px-4 py-1", className)}>{children}</details>;
}

export function AccordionTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <summary
      className={cn(
        "flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden",
        className,
      )}
    >
      <span>{children}</span>
      <ChevronDownIcon />
    </summary>
  );
}

export function AccordionContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("pb-4 text-sm text-foreground/80 [&_p+p]:mt-4", className)}>{children}</div>;
}

export function CodeCollapsibleWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("not-prose mt-6", className)}>{children}</div>;
}

export function PackageTabs({
  commands,
}: {
  commands: Record<string, string>;
}) {
  const entries = Object.entries(commands);
  const [activeCommand, setActiveCommand] = useState(entries[0]?.[0] ?? "pnpm");
  const activeValue = commands[activeCommand] ?? entries[0]?.[1] ?? "";

  return (
    <div className="not-prose relative block overflow-x-auto" data-slot="tabs">
      <div className="flex items-center gap-2 border-b border-border/50 px-3 py-1" data-slot="tabs-header">
        <div className="flex size-4 items-center justify-center rounded-[1px] bg-foreground opacity-70">
          <span className="text-[10px] leading-none text-code">&gt;_</span>
        </div>
        <div
          aria-label="Package manager"
          className="flex items-center gap-0 font-mono"
          data-slot="tabs-list"
          role="radiogroup"
        >
          {entries.map(([name]) => {
            const isActive = activeCommand === name;

            return (
              <button
                key={name}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex h-7 items-center rounded-md border border-transparent px-2 pt-0.5 font-mono text-[14px] font-medium leading-[21px] text-muted-foreground transition-colors shadow-none",
                  isActive && "border-input bg-background text-foreground",
                )}
                onClick={() => setActiveCommand(name)}
                type="button"
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="no-scrollbar block overflow-x-auto" data-slot="tabs-panels">
        <pre className="m-0 px-4 py-3.5">
          <code className="relative font-mono text-sm leading-none" data-language="bash">
            {activeValue}
          </code>
        </pre>
      </div>
      <CopyButton label="Copy command" value={activeValue} className="top-2 right-2" />
    </div>
  );
}

export function CopyButton({
  className,
  label = "Copy code",
  value,
}: {
  className?: string;
  label?: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      aria-label={label}
      className={cn(
        "absolute top-3 right-2 z-10 inline-flex size-7 items-center justify-center rounded-md bg-transparent text-muted-foreground opacity-70 transition-colors hover:text-foreground hover:opacity-100 focus-visible:opacity-100",
        className,
      )}
      data-copied={copied}
      data-slot="copy-button"
      onClick={onCopy}
      type="button"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}
