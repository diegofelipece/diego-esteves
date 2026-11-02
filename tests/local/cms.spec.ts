import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import profile from '../../content/profile/diego-esteves.json' with { type: 'json' };

const slug = 'cms-validation-fixture';
const projectFile = `content/projects/${slug}.json`;
const imageFile = `public/images/uploads/${slug}.png`;

test('local editor saves a project and image that become a new static route without code changes', async ({ page }) => {
  expect(existsSync(projectFile)).toBe(false);
  expect(existsSync(imageFile)).toBe(false);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('https://api.github.com/**', (route) => route.abort());
  try {
    const [, month, day] = profile.basics.birthDate.split('-').map(Number);
    await page.clock.setFixedTime(new Date(2040, month - 1, day, 12));
    await page.goto('./');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.getByText('Projects', { exact: true }).first().click();
    await page.getByText('1 - Mussum Ipsum', { exact: true }).click();
    await expect.poll(() => page.frameLocator('iframe').locator('img').first()
      .evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await page.goto('./#/collections/projects');
    await page.getByText('＋ Project', { exact: true }).click();
    await page.getByLabel('URL slug', { exact: true }).fill(slug);
    await page.getByLabel('Title', { exact: true }).fill('CMS validation fixture');
    await page.getByLabel('Category', { exact: true }).fill('Design');
    await page.getByLabel('SEO description', { exact: true }).fill('CMS-created static content.');
    await page.getByRole('button', { name: 'Choose an image' }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: `${slug}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64'),
    });
    await page.getByRole('button', { name: 'Choose selected', exact: true }).click();
    await page.getByText('Add content blocks', { exact: true }).click();
    await page.getByText('Text', { exact: true }).click();
    await page.getByRole('textbox').last().fill('Content created in the local Decap editor.');
    await expect(page.frameLocator('iframe').getByText('Content created in the local Decap editor.')).toBeVisible();
    await page.getByText('Add content blocks', { exact: true }).click();
    await page.getByText('Heading', { exact: true }).click();
    await page.getByRole('textbox').last().fill('Fixture heading {{age}}{{birthday}}');
    await expect(page.frameLocator('iframe').getByRole('heading', { name: /Fixture heading \d+/ })).toBeVisible();
    await expect(page.frameLocator('iframe').getByText('(today 🎈)', { exact: false })).toBeVisible();
    await page.getByText('Add content blocks', { exact: true }).click();
    await page.getByText('Image', { exact: true }).click();
    await page.getByRole('button', { name: 'Choose an image', exact: true }).click();
    await page.getByText(`${slug}.png`, { exact: true }).click();
    await page.getByRole('button', { name: 'Choose selected', exact: true }).click();
    await page.getByLabel('Alternative text (optional)', { exact: true }).fill('A test image');
    await page.getByLabel('Original width (px)', { exact: true }).fill('1');
    await page.getByLabel('Original height (px)', { exact: true }).fill('1');
    await expect(page.frameLocator('iframe').getByRole('img', { name: 'A test image' })).toBeVisible();
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Publish now', exact: true }).click();
    await expect.poll(() => existsSync(projectFile)).toBe(true);
    await expect.poll(() => existsSync(imageFile)).toBe(true);
    const saved = JSON.parse(readFileSync(projectFile, 'utf8'));
    expect(saved.slug).toBe(slug);
    expect(saved.coverImage).toBe(`/images/uploads/${slug}.png`);
    expect(saved.blocks[0].body).toContain('Content created in the local Decap editor.');
    expect(saved.blocks[1]).toEqual({ type: 'heading', text: 'Fixture heading {{age}}{{birthday}}', level: 3 });
    expect(saved.blocks[2].src).toBe(`/images/uploads/${slug}.png`);
    expect(saved.published).toBe(true);
    expect(errors).toEqual([]);

    execFileSync('npm', ['run', 'build'], { stdio: 'pipe', timeout: 60000 });
    const html = readFileSync(`out/projects/${slug}/index.html`, 'utf8');
    expect(html).toContain('Content created in the local Decap editor.');
    expect(html).toContain(`href="https://diegoesteves.ink/projects/${slug}/"`);
    expect(readFileSync('out/index.html', 'utf8')).toContain(`data-project-slug="${slug}"`);
    writeFileSync(projectFile, JSON.stringify({ ...saved, published: false }));
    execFileSync('npm', ['run', 'build'], { stdio: 'pipe', timeout: 60000 });
    expect(existsSync(`out/projects/${slug}/index.html`)).toBe(false);
    expect(readFileSync('out/index.html', 'utf8')).not.toContain(`data-project-slug="${slug}"`);
  } finally {
    rmSync(projectFile, { force: true });
    rmSync(imageFile, { force: true });
  }
});

test('the local profile editor saves a reviewed JSON change for static export', async ({ page }) => {
  const file = 'content/profile/diego-esteves.json';
  const original = readFileSync(file, 'utf8');
  try {
    await page.goto('./');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.goto('./#/collections/profile/entries/profile');
    await page.getByLabel('Summary', { exact: true }).fill('Temporary profile validation text.');
    await expect(page.frameLocator('iframe').getByText('Temporary profile validation text.', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Publish now', exact: true }).click();
    await expect.poll(() => JSON.parse(readFileSync(file, 'utf8')).basics.summary).toBe('Temporary profile validation text.');
    execFileSync('npm', ['run', 'build'], { stdio: 'pipe', timeout: 60000 });
    expect(JSON.parse(readFileSync('out/diego-esteves.json', 'utf8')).basics.summary).toBe('Temporary profile validation text.');
  } finally {
    writeFileSync(file, original);
  }
});
