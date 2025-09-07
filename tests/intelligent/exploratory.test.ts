import { test, expect } from '@playwright/test';

test.describe('Automated Exploratory Testing', () => {
    test('Should explore the app smartly', async ({ page }) => {
        await page.goto('https://demo.playwright.dev/todomvc/#/');

        const interactiveElements = await page.locator('a, button, input, [role="button"]').all();

        for (let i = 0; i < interactiveElements.length; i++) {
            const element = interactiveElements[i];
            try {
                if (!(await element.isVisible()) || !(await element.isEnabled())) {
                    continue;
                }

                const tagName = await element.evaluate(el => el.tagName);
                const text = (await element.textContent())?.trim() || '';
                console.log(`🎯 Exploring: ${tagName} - "${text}"`);

                await element.scrollIntoViewIfNeeded();

                if (tagName === 'A' || tagName === 'BUTTON') {
                    const href = await element.getAttribute('href');
                    if (href && href.startsWith('http')) {
                        console.log(`🌍 Skipping external link: ${href}`);
                        continue; // no abrir externos
                    }
                    await element.click({ timeout: 2000 }).catch(() => { });
                }

            } catch (err) {
                console.log(`⚠️ Error on element index ${i}: ${(err as Error).message}`);
            }
        }

        if (!page.isClosed()) {
            expect(await page.title()).not.toBe('');
        }
    });
});
