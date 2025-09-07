import { test } from '@playwright/test';
import { Eyes, Target, ClassicRunner, Configuration, BatchInfo } from '@applitools/eyes-playwright';

test.describe('Automated Exploratory Testing', () => {
    test('Should explore the app smartly', async ({ page }) => {
        test.setTimeout(180000); // 3 minutes
        // ✅ Setup Applitools with API key from env
        const runner = new ClassicRunner();
        const eyes = new Eyes(runner);
        const conf = new Configuration();
        conf.setApiKey(process.env.APPLITOOLS_API_KEY!);

        if (process.env.APPLITOOLS_SERVER_URL) {
            conf.setServerUrl(process.env.APPLITOOLS_SERVER_URL);
        }

        conf.setBatch(new BatchInfo('Exploratory Testing'));
        conf.setAppName('Exploratory Testing');
        conf.setTestName('AI Guided Exploration');
        eyes.setConfiguration(conf);
        await eyes.open(page);

        try {
            await page.goto('/todomvc');
            // --- Initial Snapshot ---
            await eyes.check('Initial Page State', Target.window());
            const visitedUrls = new Set<string>([page.url()]);
            const maxPagesToExplore = 5;
            let pagesExplored = 0;

            while (pagesExplored < maxPagesToExplore) {
                pagesExplored++;
                console.log(`\n--- Exploring Page: ${page.url()} (${pagesExplored}/${maxPagesToExplore}) ---`);

                const interactiveElements = await page
                    .locator('input, button, a, [role="button"]')
                    .filter({ hasNotText: 'View on GitHub' })
                    .all();

                console.log(`🔍 Found ${interactiveElements.length} interactive elements`);

                for (let i = 0; i < interactiveElements.length; i++) {
                    const element = interactiveElements[i];
                    const tagName = await element.evaluate(el => el.tagName);
                    const text = (await element.textContent())?.trim() || '';

                    try {
                        if (!await element.isVisible() || !await element.isEnabled()) {
                            console.log(`⏭️ Skipping hidden/disabled element: ${tagName} - "${text}"`);
                            continue;
                        }

                        console.log(`🎯 Exploring: ${tagName} - "${text}"`);
                        await eyes.check(`Before interacting with ${tagName} - "${text}"`, Target.window());
                        await element.hover();
                        await page.waitForTimeout(500);
                        await eyes.check(`Hover on ${tagName} - "${text}"`, Target.window());
                        const currentUrl = page.url();

                        const [response] = await Promise.all([
                            page.waitForNavigation({ timeout: 8000, waitUntil: 'networkidle' }).catch(() => null),
                            element.click()
                        ]);

                        if (response) {
                            const newUrl = page.url();
                            if (newUrl !== currentUrl && !visitedUrls.has(newUrl)) {
                                visitedUrls.add(newUrl);
                                console.log(`➡️ Navigated to new page: ${newUrl}`);
                                break; // re-map elements on new page
                            }
                        }

                        await page.waitForLoadState('networkidle');
                        await eyes.check(`After clicking ${tagName} - "${text}"`, Target.window());
                    } catch (error: any) {
                        if (error.name === 'TimeoutError') {
                            console.log(`⚠️ Timeout on ${tagName} - "${text}"`);
                        } else if (error.message?.includes('Execution context was destroyed')) {
                            console.log(`⚠️ Context destroyed on ${tagName} - "${text}"`);
                            break;
                        } else {
                            console.log(`⚠️ General error on ${tagName} - "${text}": ${error}`);
                        }
                    }
                }
            }
        } finally {
            await eyes.closeAsync();
        }
    });
});
