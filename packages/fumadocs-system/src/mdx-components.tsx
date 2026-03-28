import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Callout,
  CodeCollapsibleWrapper,
  CopyButton,
  LinkedCard,
  PackageTabs,
  Step,
  Steps,
} from "./components/docs-mdx";
import { Button } from "./components/ui/button";
import { CodeTabs, Tabs, TabsContent, TabsList, TabsTrigger } from "./components/docs-tabs";
import { cn } from "./lib/utils";

type CodeProps = React.ComponentProps<"code"> & {
  __raw__?: string;
  __npm__?: string;
  __yarn__?: string;
  __pnpm__?: string;
  __bun__?: string;
  "data-language"?: string;
  "data-raw"?: string;
  "data-command-npm"?: string;
  "data-command-yarn"?: string;
  "data-command-pnpm"?: string;
  "data-command-bun"?: string;
};

function flattenText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(flattenText).join("");
  }

  if (isValidElement(node)) {
    return flattenText((node as ReactElement<{ children?: ReactNode }>).props.children);
  }

  return "";
}

function slugify(node: ReactNode): string | undefined {
  const text = flattenText(node)
    .trim()
    .replace(/ /g, "-")
    .replace(/'/g, "")
    .replace(/\?/g, "")
    .toLowerCase();

  return text || undefined;
}

function getCodeProps(node: ReactNode): CodeProps | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const codeProps = getCodeProps(child);
      if (codeProps) {
        return codeProps;
      }
    }

    return undefined;
  }

  if (!isValidElement(node)) {
    return undefined;
  }

  const element = node as ReactElement<CodeProps>;
  const props = element.props;

  if (
    props.__raw__ ||
    props.__npm__ ||
    props.__yarn__ ||
    props.__pnpm__ ||
    props.__bun__ ||
    props["data-raw"] ||
    props["data-command-npm"] ||
    props["data-command-yarn"] ||
    props["data-command-pnpm"] ||
    props["data-command-bun"] ||
    props["data-language"]
  ) {
    return props;
  }

  if (element.type !== "code") {
    return getCodeProps(props.children);
  }

  return props;
}

export function getFumadocsSystemMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    h1: ({ className, ...props }) => (
      <h1 className={cn("mt-2 scroll-m-28 text-3xl font-semibold tracking-tight", className)} {...props} />
    ),
    h2: ({ className, children, id, ...props }) => (
      <h2
        className={cn(
          "[&+]*:[code]:text-xl mt-10 scroll-m-28 text-xl font-medium tracking-tight first:mt-0 lg:mt-12 [&+p]:mt-4! [&+ul]:mt-4! [&+ol]:mt-4!",
          className,
        )}
        id={id ?? slugify(children)}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ className, ...props }) => (
      <h3 className={cn("mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4!", className)} {...props} />
    ),
    h4: ({ className, ...props }) => (
      <h4 className={cn("mt-8 scroll-m-28 text-base font-medium tracking-tight", className)} {...props} />
    ),
    h5: ({ className, ...props }) => (
      <h5 className={cn("mt-8 scroll-m-28 text-base font-medium tracking-tight", className)} {...props} />
    ),
    h6: ({ className, ...props }) => (
      <h6 className={cn("mt-8 scroll-m-28 text-base font-medium tracking-tight", className)} {...props} />
    ),
    a: ({ className, ...props }) => (
      <a className={cn("font-medium underline underline-offset-4", className)} {...props} />
    ),
    p: ({ className, ...props }) => (
      <p className={cn("leading-relaxed [&:not(:first-child)]:mt-6", className)} {...props} />
    ),
    strong: ({ className, ...props }) => <strong className={cn("font-medium", className)} {...props} />,
    ul: ({ className, ...props }) => <ul className={cn("my-6 ml-6 list-disc", className)} {...props} />,
    ol: ({ className, ...props }) => <ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />,
    li: ({ className, ...props }) => <li className={cn("mt-2", className)} {...props} />,
    blockquote: ({ className, ...props }) => (
      <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props} />
    ),
    hr: ({ ...props }) => <hr className="my-4 md:my-8" {...props} />,
    table: ({ className, ...props }) => (
      <div className="my-6 no-scrollbar w-full overflow-y-auto rounded-xl border">
        <table
          className={cn(
            "relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0",
            className,
          )}
          {...props}
        />
      </div>
    ),
    tr: ({ className, ...props }) => <tr className={cn("m-0 border-b", className)} {...props} />,
    th: ({ className, ...props }) => (
      <th
        className={cn(
          "px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
          className,
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={cn(
          "px-4 py-2 text-left whitespace-nowrap [&[align=center]]:text-center [&[align=right]]:text-right",
          className,
        )}
        {...props}
      />
    ),
    pre: ({ className, children, ...props }) =>
      (() => {
        const codeProps = getCodeProps(children);
        const npmCommand = codeProps?.__npm__ ?? codeProps?.["data-command-npm"];
        const yarnCommand = codeProps?.__yarn__ ?? codeProps?.["data-command-yarn"];
        const pnpmCommand = codeProps?.__pnpm__ ?? codeProps?.["data-command-pnpm"];
        const bunCommand = codeProps?.__bun__ ?? codeProps?.["data-command-bun"];
        const raw = codeProps?.__raw__ ?? codeProps?.["data-raw"];

        if (npmCommand && yarnCommand && pnpmCommand && bunCommand) {
          return (
            <PackageTabs
              commands={{
                pnpm: pnpmCommand,
                npm: npmCommand,
                yarn: yarnCommand,
                bun: bunCommand,
              }}
            />
          );
        }

        return (
          <div className="group relative">
            {raw ? <CopyButton label="Copy code" value={raw} /> : null}
            <pre
              className={cn(
                "no-scrollbar min-w-0 overflow-x-auto overflow-y-auto overscroll-x-contain overscroll-y-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0",
                className,
              )}
              {...props}
            >
              {children}
            </pre>
          </div>
        );
      })(),
    figure: ({ className, ...props }) => <figure className={cn(className)} {...props} />,
    figcaption: ({ className, ...props }) => (
      <figcaption className={cn("flex items-center gap-2 text-code-foreground", className)} {...props} />
    ),
    code: ({
      className,
      __raw__: _raw,
      __npm__: _npm,
      __yarn__: _yarn,
      __pnpm__: _pnpm,
      __bun__: _bun,
      ...props
    }: CodeProps) => {
      const isBlockCode = Boolean(props["data-language"]);

      if (isBlockCode) {
        return (
          <code
            data-command-bun={_bun}
            data-command-npm={_npm}
            data-command-pnpm={_pnpm}
            data-command-yarn={_yarn}
            data-raw={_raw}
            {...props}
          />
        );
      }

      if (typeof props.children === "string") {
        return (
          <code
            className={cn(
              "relative rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] break-words outline-none",
              className,
            )}
            {...props}
          />
        );
      }

      return <code {...props} />;
    },
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Button,
    Callout,
    CodeCollapsibleWrapper,
    CodeTabs,
    LinkedCard,
    PackageTabs,
    Step,
    Steps,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ...components,
  };
}

export const useMDXComponents = getFumadocsSystemMDXComponents;
