import { expect, test } from '@playwright/test';
import profile from '../content/profile/diego-esteves.json' with { type: 'json' };

const [birthYear, month, day] = profile.basics.birthDate.split('-').map(Number);
const year = 2040;
const birthday = Date.UTC(year, month - 1, day);
const age = year - birthYear;
const suffix = '(today 🎈)';

test.use({ timezoneId: 'UTC' });

test('home and About hydrate from an older build into birthday text without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.clock.setFixedTime(new Date(birthday + 12 * 60 * 60 * 1000));
  for (const path of ['./', 'about/']) {
    await page.goto(path);
    await expect(page.getByText(`${age} years old ${suffix}`, { exact: false })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('midnight updates the age and adds/removes the birthday suffix in an open tab', async ({ page }) => {
  await page.clock.install({ time: new Date(birthday - 1000) });
  await page.goto('./');
  await expect(page.getByText(`${age - 1} years old.`, { exact: false })).toBeVisible();
  await expect(page.getByText(suffix, { exact: false })).toHaveCount(0);
  await page.clock.runFor(1000);
  await expect(page.getByText(`${age} years old ${suffix}`, { exact: false })).toBeVisible();
  await page.clock.fastForward(24 * 60 * 60 * 1000);
  await expect(page.getByText(suffix, { exact: false })).toHaveCount(0);
  await expect(page.getByText(`${age} years old.`, { exact: false })).toBeVisible();
});

test('returning to a tab recalculates dates even when the midnight timer has not run', async ({ page }) => {
  await page.clock.setFixedTime(new Date(birthday - 60000));
  await page.goto('about/');
  await expect(page.getByText(`${age - 1} years old,`, { exact: false })).toBeVisible();
  await page.clock.setFixedTime(new Date(birthday + 60000));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByText(`${age} years old ${suffix}`, { exact: false })).toBeVisible();
  await page.clock.setFixedTime(new Date(birthday + 24 * 60 * 60 * 1000));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByText(suffix, { exact: false })).toHaveCount(0);
});

test('the same instant is a birthday only for visitors whose local date matches', async ({ browser, baseURL }) => {
  for (const [timezoneId, isBirthday] of [['America/Los_Angeles', false], ['Asia/Tokyo', true]] as const) {
    const context = await browser.newContext({ timezoneId });
    try {
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date(birthday + 60 * 60 * 1000));
      await page.goto(baseURL!);
      await expect(page.getByText(`${isBirthday ? age : age - 1} years old`, { exact: false })).toBeVisible();
      await expect(page.getByText(suffix, { exact: false })).toHaveCount(isBirthday ? 1 : 0);
    } finally {
      await context.close();
    }
  }
});
