import { expect, test } from '@playwright/test';

test('admin is static, base-aware, and reports missing OAuth without contacting a login provider', async ({ page }) => {
  const errors: string[] = [];
  const authRequests: string[] = [];
  await page.route('**/admin/config.yml', async (route) => {
    const response = await route.fetch();
    const config = await response.json();
    delete config.backend.base_url;
    await route.fulfill({ json: config });
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/github\.com\/login|api\.netlify\.com\/auth/.test(request.url())) authRequests.push(request.url());
  });
  const response = await page.goto('admin/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByRole('status')).toContainText('GitHub login is not configured yet');
  expect(errors).toEqual([]);
  expect(authRequests).toEqual([]);
});

test('Decap initializes its editorial UI with a mocked local-only backend', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/admin/config.yml', async (route) => {
    const response = await route.fetch();
    const config = await response.json();
    await route.fulfill({
      json: {
        ...config,
        backend: { name: 'test-repo', base_url: 'https://oauth.example.invalid' },
      },
    });
  });
  await page.goto('admin/');
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page.getByText('Projects', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Pages', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Homepage', { exact: true }).first()).toBeVisible();
  await page.getByText('＋ Project', { exact: true }).click();
  await page.getByLabel('URL slug', { exact: true }).fill('test-project');
  await page.getByLabel('Title', { exact: true }).fill('Test project');
  await page.getByLabel('Category', { exact: true }).fill('Design');
  await page.getByLabel('SEO description', { exact: true }).fill('A test project');
  await page.getByText('Add content blocks', { exact: true }).click();
  await page.getByText('Text', { exact: true }).click();
  await page.getByRole('textbox').last().fill('Test content with an editable block.');
  await expect(page.getByText("There's been an error", { exact: false })).not.toBeVisible();
  await expect(page.getByRole('button', { name: /publish/i })).toHaveCount(0);
  expect(errors).toEqual([]);
});
