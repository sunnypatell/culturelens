import { test, expect } from "@playwright/test";

test.describe("smoke tests", () => {
  test("homepage loads and shows CultureLens branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CultureLens/);
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveTitle(/CultureLens/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page).toHaveTitle(/CultureLens/);
  });

  test("health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");
    // CI has no real backend — accept 200 (healthy) or 503 (degraded)
    expect([200, 503]).toContain(response.status());
  });

  test("unauthenticated API returns 401", async ({ request }) => {
    const response = await request.get("/api/sessions");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });
});

test.describe("docs site", () => {
  test("docs landing page renders", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.locator("body")).toContainText("CultureLens");
  });

  test("docs API reference page renders", async ({ page }) => {
    await page.goto("/docs/api-reference");
    await expect(page.locator("body")).toContainText("API Reference");
  });

  test("Scalar API explorer loads", async ({ page }) => {
    await page.goto("/docs/api");
    await expect(page).toHaveTitle(/API Reference/);
  });

  test("OpenAPI spec endpoint returns valid JSON", async ({ request }) => {
    const response = await request.get("/docs/api/openapi.json");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("CultureLens API");
    expect(Object.keys(body.paths).length).toBeGreaterThanOrEqual(10);
  });

  test("/api/docs redirects to /docs/api", async ({ request }) => {
    const response = await request.get("/api/docs", {
      maxRedirects: 0,
    });
    expect([301, 308]).toContain(response.status());
    expect(response.headers()["location"]).toBe("/docs/api");
  });
});

test.describe("docs footer", () => {
  test("docs sidebar shows copyright", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.locator("body")).toContainText("Sunny Patel");
  });
});
