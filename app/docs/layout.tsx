import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/docs-source";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: "CultureLens Docs",
        url: "/docs",
      }}
      links={[
        { text: "API Explorer", url: "/docs/api" },
        { text: "App", url: "/" },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
