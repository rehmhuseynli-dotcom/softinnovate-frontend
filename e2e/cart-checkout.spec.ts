import { test, expect } from '@playwright/test';

test.describe('Sepet ve checkout', () => {
  test('ürünü sepete ekleyip checkout sayfasına gidebilir', async ({ page }) => {
    await page.goto('/products');

    const addButton = page.getByRole('button', { name: 'Sepete ekle' }).first();
    await addButton.waitFor({ state: 'visible' });
    await addButton.click();

    await expect(addButton).toHaveText('Sepete eklendi');

    await page.goto('/checkout');

    await expect(page.getByRole('heading', { name: 'Siparişi tamamla' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ödemeyi başlat' })).toBeVisible();
  });

  test('boş sepetle checkout sayfası "sepet boş" mesajı gösterir', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/checkout');

    await expect(page.getByText('Sepetiniz boş')).toBeVisible();
  });

  test('geçersiz kupon kodu hata mesajı gösterir', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Sepete ekle' }).first().click();
    await page.goto('/checkout');

    await page.getByPlaceholder('Kupon kodunuz varsa girin').fill('GECERSIZ-KUPON-XYZ');
    await page.getByRole('button', { name: 'Ödemeyi başlat' }).click();

    // Backend InvalidCouponException fırlatır, frontend bunu error state'inde gösterir.
    await expect(page.locator('text=/geçersiz|bulunamadı/i')).toBeVisible({ timeout: 10_000 });
  });
});
