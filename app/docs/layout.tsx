import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/docs-source";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span className="flex items-center gap-2 font-semibold">
            <svg
              width="20"
              height="20"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="30"
                stroke="currentColor"
                strokeWidth="4"
                opacity="0.7"
              />
              <circle
                cx="50"
                cy="50"
                r="15"
                fill="currentColor"
                opacity="0.9"
              />
            </svg>
            CultureLens
          </span>
        ),
        url: "/docs",
      }}
      links={[
        { text: "API Explorer", url: "/docs/api" },
        { text: "App", url: "/" },
        {
          text: "GitHub",
          url: "https://github.com/sunnypatell/culturelens",
          external: true,
        },
      ]}
      sidebar={{
        footer: (
          <p className="text-xs text-muted-foreground text-center py-2">
            © 2026 Sunny Patel. All rights reserved.
          </p>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
