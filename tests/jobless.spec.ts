import { test, expect } from '@playwright/test';

test.describe('JOBLESS Website Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Homepage - should display explosive title', async ({ page }) => {
    await expect(page.locator('h1').getByText(/Are you still on board|你还在车上吗/)).toBeVisible();
  });

  test('Homepage - should display MIT and McKinsey stats', async ({ page }) => {
    await expect(page.getByText(/11\.7.*%.*replaceable|替代.*11\.7/)).toBeVisible();
    await expect(page.getByText(/57%.*automatable|57%.*可自动化/).first()).toBeVisible();
  });

  test('Homepage - should display dual progress bars', async ({ page }) => {
    await expect(page.getByText(/Current Reality|现实进度/)).toBeVisible();
    await expect(page.getByText(/Technical Ceiling|技术天花板/)).toBeVisible();
  });

  test('Homepage - should show iceberg warning', async ({ page }) => {
    await expect(page.getByText(/tip of the iceberg|冰山/)).toBeVisible();
  });

  test('Language toggle - should display language button', async ({ page }) => {
    await expect(page.getByText(/EN|中文/)).toBeVisible();
  });

  test('Language toggle - should switch to Chinese', async ({ page }) => {
    const button = page.locator('button').filter({ hasText: /EN|中文/ }).first();
    await button.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('你还在车上吗')).toBeVisible();
  });

  test('Language toggle - should switch back to English', async ({ page }) => {
    const button = page.locator('button').filter({ hasText: /EN|中文/ }).first();
    await button.click();
    await page.waitForTimeout(500);
    await button.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Are you still on board')).toBeVisible();
  });

  test('Progress Stages - should display timeline stages', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    await expect(page.getByText(/YOU ARE HERE|你在这里/).first()).toBeVisible();
  });

  test('Timeline - should display main periods', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1800));
    await page.waitForTimeout(500);
    await expect(page.getByText(/From Fun to Fear|从好玩/)).toBeVisible();
  });

  test('Timeline - should show MIT and McKinsey events', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1800));
    await page.waitForTimeout(500);
    await expect(page.getByText(/MIT Iceberg|MIT 冰山/)).toBeVisible();
  });

  test('High Risk Jobs - should display job table', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 3500));
    await page.waitForTimeout(500);
    await expect(page.getByText(/High-Risk Jobs|高危岗位/).first()).toBeVisible();
  });

  test('Layoff Cases - should display company layoffs', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 4500));
    await page.waitForTimeout(500);
    await expect(page.getByText(/Dow|陶氏/)).toBeVisible();
    await expect(page.getByText(/Nike|耐克/)).toBeVisible();
  });

  test('Survival Index - should display questions', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 5500));
    await page.waitForTimeout(500);
    await expect(page.getByText(/Survival Index|生存指数/)).toBeVisible();
  });

  test('Survival Index - should calculate risk', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 5500));
    await page.waitForTimeout(500);
    await expect(page.getByText(/Survival Index|生存指数/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Calculate|计算/ }).first()).toBeVisible();
  });

  test('Footer - should display data sources', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 10000));
    await page.waitForTimeout(500);
    await expect(page.getByText(/Data Sources|数据来源/)).toBeVisible();
  });

  test('Responsive - should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText(/Are you still on board|你还在车上吗/)).toBeVisible();
  });

  test('Full Chinese - all content should be in Chinese', async ({ page }) => {
    const button = page.locator('button').filter({ hasText: /EN|中文/ }).first();
    await button.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('你还在车上吗')).toBeVisible();
    await expect(page.getByText('冰山露头期')).toBeVisible();
    await expect(page.getByText('高危行业')).toBeVisible();
  });
});
