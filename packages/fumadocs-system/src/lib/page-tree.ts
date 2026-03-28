import type { ReactNode } from "react";

export type PageTreeNode = {
  type?: string | null;
  name?: ReactNode;
  url?: string | null;
  children?: PageTreeNode[] | null;
};

export type PageTree = {
  children?: PageTreeNode[] | null;
};

export type FlatPage = {
  title: string;
  url: string;
};

function textFromReactNode(value: ReactNode): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(textFromReactNode).join("").trim();
  }

  return "";
}

export function getPageTreeLabel(node: PageTreeNode, labelByUrl: Record<string, string> = {}): string {
  if (node.url && labelByUrl[node.url]) {
    return labelByUrl[node.url];
  }

  const name = node.name ? textFromReactNode(node.name).trim() : "";
  if (name) {
    return name;
  }

  if (node.url) {
    return node.url;
  }

  return "Untitled";
}

export function flattenPageTree(nodes: PageTreeNode[]): FlatPage[] {
  const pages = nodes.flatMap((node) => {
    const current =
      node.type !== "separator" && node.url
        ? [{ title: getPageTreeLabel(node), url: node.url }]
        : [];

    return [...current, ...flattenPageTree(node.children ?? [])];
  });

  return pages.filter((page, index) => pages.findIndex((item) => item.url === page.url) === index);
}
