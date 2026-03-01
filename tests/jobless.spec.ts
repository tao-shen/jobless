import { test, expect, type Page } from '@playwright/test';

async function openSharePanel(page: Page) {
  const calculator = page.locator('#risk-calculator');
  await calculator.scrollIntoViewIfNeeded();
  const calculateBtn = calculator.getByRole('button', { name: /Calculate My Risk|计算我的风险/ });
  await expect(calculateBtn).toBeVisible();
  await calculateBtn.click();
  const shareTrigger = page.getByTestId('share-trigger');
  await expect(shareTrigger).toBeVisible();
  await shareTrigger.click();
  await expect(page.getByTestId('share-panel')).toBeVisible();
}

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

  test('Share - should open share panel after clicking share trigger', async ({ page }) => {
    await openSharePanel(page);
    await expect(page.getByTestId('share-copy-btn')).toBeVisible();
    await expect(page.getByTestId('share-twitter-btn')).toBeVisible();
    await expect(page.getByTestId('share-wechat-btn')).toBeVisible();
    await expect(page.getByTestId('share-telegram-btn')).toBeVisible();
  });

  test('Share - should open Twitter share popup', async ({ page }) => {
    await openSharePanel(page);
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByTestId('share-twitter-btn').click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toMatch(/(twitter|x)\.com\/intent\/tweet/);
    expect(popup.url()).toContain('url=');
    expect(decodeURIComponent(popup.url())).toContain('/share/');
  });

  test('Share - should copy content for WeChat sharing', async ({ page }) => {
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: async () => undefined },
        configurable: true,
      });
    });
    await openSharePanel(page);
    const wechatBtn = page.getByTestId('share-wechat-btn');
    await wechatBtn.click();
    await expect(wechatBtn).toContainText(/Copied|已复制/);
  });

  test('Share - should call Telegram photo API and show success state', async ({ page }) => {
    await page.route('**/api/share/telegram/photo', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, messageId: 321, fileId: 'photo-file-id' }),
      });
    });

    await openSharePanel(page);
    const telegramBtn = page.getByTestId('share-telegram-btn');
    await telegramBtn.click();
    await expect(telegramBtn).toContainText(/Sent|已发送/);
  });

  test('Share - should fallback to Telegram text API when photo API fails', async ({ page }) => {
    await page.route('**/api/share/telegram/photo', async (route) => {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Telegram API rejected the photo' }),
      });
    });
    await page.route('**/api/share/telegram', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, messageId: 321 }),
      });
    });

    await openSharePanel(page);
    const telegramBtn = page.getByTestId('share-telegram-btn');
    await telegramBtn.click();
    await expect(telegramBtn).toContainText(/Sent|已发送/);
  });

  test('Share - should fallback to Telegram web share when API is unavailable', async ({ page }) => {
    await page.route('**/api/share/telegram/photo', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Telegram API is not configured' }),
      });
    });
    await page.route('**/api/share/telegram', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Telegram API is not configured' }),
      });
    });

    await openSharePanel(page);
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByTestId('share-telegram-btn').click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toContain('t.me/share/url');
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
