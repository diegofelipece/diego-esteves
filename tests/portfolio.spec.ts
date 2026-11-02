import { expect, test } from '@playwright/test';

const order = [
  'mussum-ipsum', 'gucci-interactive-videos', 'gucci-brand-experience',
  'assentamento', 'nexxus', 'cash-me', 'airobot', 'cbf',
];

test('homepage preserves the project order and navigation survives back/forward', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'TL;DR' })).toBeVisible();
  await expect(page.locator('[data-project-slug]')).toHaveCount(8);
  expect(await page.locator('[data-project-slug]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-project-slug')))).toEqual(order);

  await page.getByRole('button', { name: 'View Mussum Ipsum', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/mussum-ipsum\/$/);
  await expect(page.getByText('In 2012 I had the idea', { exact: false })).toBeVisible();
  await expect(page).toHaveTitle('Mussum Ipsum – Diego Esteves');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'TL;DR' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Mussum Ipsum', exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByText('In 2012 I had the idea', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Return to portfolio' }).click();
  await expect(page.getByRole('heading', { name: 'TL;DR' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('direct project navigation renders content, loads images and appends the next project on scroll', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('projects/mussum-ipsum/');
  await expect(page.getByText('In 2012 I had the idea', { exact: false })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://diegoesteves.ink/projects/mussum-ipsum/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const next = page.locator('[data-project-slug="gucci-interactive-videos"]');
  await expect(next).toBeAttached();
  await next.evaluate((node) => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY + 10));
  await expect(page).toHaveURL(/\/projects\/gucci-interactive-videos\/$/);
  await expect(page).toHaveTitle('Gucci Interactive Videos – Diego Esteves');
  await expect(page.locator('[data-project-slug="mussum-ipsum"]')).toBeAttached();
  await page.goBack();
  await expect(page).toHaveURL(/\/projects\/mussum-ipsum\/$/);
  await expect(page.getByText('In 2012 I had the idea', { exact: false })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/projects\/gucci-interactive-videos\/$/);
  await page.reload();
  await expect(page.locator('[data-project-slug="gucci-interactive-videos"] img').first()).toBeAttached();
  await page.locator('[data-project-slug="gucci-interactive-videos"] img').first().scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('[data-project-slug="gucci-interactive-videos"] img').first()
    .evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('About navigation and logo return preserve the biography', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'more details >' }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
  await expect(page.getByText("Hi, I'm Diego Esteves.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to portfolio' }).click();
  await expect(page.getByRole('heading', { name: 'TL;DR' })).toBeVisible();
});

test('all public routes contain text without executing JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const slug of order) {
    const response = await page.goto(`${baseURL}projects/${slug}/`);
    expect(response?.status()).toBe(200);
    expect(await page.locator(`[data-project-slug="${slug}"] p`).count()).toBeGreaterThan(1);
    await expect(page.locator('title')).toHaveCount(1);
  }
  await context.close();
});

test('unknown paths remain 404s instead of receiving an SPA rewrite', async ({ page }) => {
  const response = await page.goto('does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Return to portfolio' }).click();
  await expect(page.getByRole('heading', { name: 'TL;DR' })).toBeVisible();
});
