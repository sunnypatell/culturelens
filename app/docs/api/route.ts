import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  url: "/docs/api/openapi.json",
  theme: "kepler",
  pageTitle: "CultureLens API Reference",
  defaultHttpClient: {
    targetKey: "js",
    clientKey: "fetch",
  },
  customCss: `
    .light-mode {
      --scalar-color-1: #4338ca;
      --scalar-color-2: #1e1b4b;
      --scalar-color-3: #4338ca;
      --scalar-color-accent: #4338ca;
      --scalar-color-green: #059669;
      --scalar-background-1: #fafafa;
      --scalar-background-2: #f4f4f5;
      --scalar-background-3: #e4e4e7;
      --scalar-border-color: #e4e4e7;
    }
    .dark-mode {
      --scalar-color-1: #a5b4fc;
      --scalar-color-2: #e0e7ff;
      --scalar-color-3: #a5b4fc;
      --scalar-color-accent: #818cf8;
      --scalar-color-green: #34d399;
      --scalar-background-1: #1a1a2e;
      --scalar-background-2: #16162a;
      --scalar-background-3: #1e1e38;
      --scalar-border-color: #2e2e4a;
    }
  `,
  metaData: {
    title: "CultureLens API Reference",
    description:
      "interactive API explorer for CultureLens — 23 endpoints across 9 resource groups",
  },
});
