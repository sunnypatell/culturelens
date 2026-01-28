import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  url: "/docs/api/openapi.json",
  theme: "kepler",
  pageTitle: "CultureLens API Reference",
  defaultHttpClient: {
    targetKey: "js",
    clientKey: "fetch",
  },
});
