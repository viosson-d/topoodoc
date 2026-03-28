"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "../lib/utils";

type NeighborPage = {
  title: string;
  url: string;
} | null;

type DocsCopyPageProps = {
  content?: string;
  title: string;
  url: string;
  previousPage: NeighborPage;
  nextPage: NeighborPage;
};

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

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
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
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
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

const pillButtonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[0.8rem] font-medium text-foreground shadow-none transition-colors hover:bg-secondary/80 md:h-7";

const iconPillButtonClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-foreground shadow-none transition-colors hover:bg-secondary/80 md:size-7";

export function DocsCopyPage({
  content,
  nextPage,
  previousPage,
  title,
  url,
}: DocsCopyPageProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const value = content?.trim()
      ? content
      : typeof window === "undefined"
        ? url
        : `${title}\n${window.location.href}`;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="group/buttons relative flex rounded-lg bg-secondary *:focus-visible:relative *:focus-visible:z-10">
        <button className={pillButtonClass} onClick={onCopy} type="button">
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? "Copied" : "Copy Page"}</span>
        </button>
        <span className="absolute top-1 right-8 h-6 w-px bg-foreground/5 md:right-7 md:h-5" />
        <button
          aria-label="Copy options"
          className={cn(iconPillButtonClass, "hidden sm:inline-flex")}
          type="button"
        >
          <ChevronDownIcon />
        </button>
      </div>

      <div className="group/buttons relative flex rounded-lg bg-secondary *:focus-visible:relative *:focus-visible:z-10">
        {previousPage ? (
          <Link
            aria-label={`Previous page: ${previousPage.title}`}
            className={iconPillButtonClass}
            href={previousPage.url}
            title={previousPage.title}
          >
            <ArrowLeftIcon />
          </Link>
        ) : (
          <span className={cn(iconPillButtonClass, "pointer-events-none opacity-50")} aria-hidden="true">
            <ArrowLeftIcon />
          </span>
        )}
        <span className="absolute top-1 right-8 h-6 w-px bg-foreground/5 md:right-7 md:h-5" />
        {nextPage ? (
          <Link
            aria-label={`Next page: ${nextPage.title}`}
            className={iconPillButtonClass}
            href={nextPage.url}
            title={nextPage.title}
          >
            <ArrowRightIcon />
          </Link>
        ) : (
          <span className={cn(iconPillButtonClass, "pointer-events-none opacity-50")} aria-hidden="true">
            <ArrowRightIcon />
          </span>
        )}
      </div>
    </div>
  );
}
