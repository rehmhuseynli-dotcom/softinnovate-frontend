import { test, expect } from '@playwright/test';

test.describe('Ürün listeleme', () => {
  test('ana ürün sayfası açılır ve başlık görünür', async ({ page }) => {
    await page.goto('/products');

    await expect(page.getByRole('heading', { name: 'Tüm ürünler' })).toBeVisible();
  });

  test('bir ürün kartına tıklayınca detay sayfasına gider', async ({ page }) => {
    await page.goto('/products');

    // NOT: Bu test backend'in seed edilmiş örnek verisine (CatalogSeeder)
    // dayanır — en az bir ürün kartı render edilmiş olmalı.
    const firstProductLink = page.locator('article a').first();
    await firstProductLink.waitFor({ state: 'visible' });
    await firstProductLink.click();

    await expect(page).toHaveURL(/\/products\/.+/);
    await expect(page.getByRole('button', { name: /Sepete ekle|Stokta yok/ })).toBeVisible();
  });

  test('robots.txt ve sitemap.xml erişilebilir', async ({ page }) => {
    const robotsResponse = await page.goto('/robots.txt');
    expect(robotsResponse?.status()).toBe(200);

    const sitemapResponse = await page.goto('/sitemap.xml');
    expect(sitemapResponse?.status()).toBe(200);
  });
});
