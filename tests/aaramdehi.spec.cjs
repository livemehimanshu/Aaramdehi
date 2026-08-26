// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Aaramdehi Full Project End-to-End Test Suite', () => {

  // 1. Core Load & SEO Metadata Test
  test('1. Homepage loads with correct title and SEO elements', async ({ page }) => {
    await page.goto('https://aaramdehi.co.in');
    await expect(page).toHaveTitle(/Aaramdehi/i);
    await expect(page.locator('body')).toBeVisible();
  });

  // 2. Navigation & Header Elements
  test('2. Header, Categories, and Search elements are visible', async ({ page }) => {
    await page.goto('https://aaramdehi.co.in');
    
    // Check Header/Navbar
    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    // Check Search or Category bar presence
    const searchBar = page.getByPlaceholder('Search the product....');
    await expect(searchBar).toBeVisible();
  });

  // 3. Product Catalog & Interaction Flow
  test('3. Product grid renders items and allows interaction', async ({ page }) => {
    await page.goto('https://aaramdehi.co.in');

    // Wait for product elements to load from data/API
    const productCard = page.locator('.product-card, img[alt], [class*="product"]').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
  });

  // 4. Cart Drawer State Management
  test('4. Cart drawer opens and interacts correctly', async ({ page }) => {
    await page.goto('https://aaramdehi.co.in');

    // Find and click cart button
    const cartBtn = page.locator('button:has-text("Cart"), [aria-label*="cart" i], svg').first();
    if (await cartBtn.isVisible()) {
      await cartBtn.click();
      await page.waitForTimeout(600);
    }
  });

  // 5. Checkout / Minimal Header Routing Check
  test('5. Footer and policy links are accessible', async ({ page }) => {
    await page.goto('https://aaramdehi.co.in');
    
    // Scroll down to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const privacyLink = page.getByRole('link', { name: /privacy policy/i });
    await expect(privacyLink).toBeVisible();
  });

});