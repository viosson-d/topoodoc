import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DocsRootLayout } from "@/fumadocs-system";
import "@/fumadocs-system/styles.css";
import { docsSite } from "@/docs.config";

export const metadata: Metadata = {
  title: docsSite.metadata.title,
  description: docsSite.metadata.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <DocsRootLayout>{children}</DocsRootLayout>;
}
