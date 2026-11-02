import { expect, test } from '@playwright/test';

test('the deployed site does not expose the local CMS or its configuration', async ({ request }) => {
  for (const path of ['admin/', 'admin/config.yml']) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain('local_backend');
  }
});
