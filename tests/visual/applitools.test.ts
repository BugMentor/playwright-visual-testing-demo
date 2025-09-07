import { test, expect } from '@playwright/test';
import { Eyes, Target, Configuration, BatchInfo } from '@applitools/eyes-playwright';

test.describe('AI Visual Testing con Applitools', () => {
    let eyes: Eyes;

    test.beforeEach(async ({ page }) => {
        const config = new Configuration();
        config.setApiKey(process.env.APPLITOOLS_API_KEY!);
        config.setBatch(new BatchInfo('TodoMVC Visual AI Batch'));

        eyes = new Eyes();
        eyes.setConfiguration(config);

        await eyes.open(page, 'TodoMVC App', test.info().title);
    });

    test.afterEach(async () => {
        await eyes.abortIfNotClosed();
    });

    test('Should smartly detect visual changes', async ({ page }) => {
        test.setTimeout(60000); // extend timeout
        await page.goto('/todomvc/#/');
        await page.waitForLoadState('networkidle'); // wait for stable page
        await eyes.check('Main Page', Target.window().fully());
        await eyes.close();
    });

    test('Should adapt to all resolutions responsively', async ({ page }) => {
        test.setTimeout(90000); // more time for mobile Safari

        await page.goto('https://demo.playwright.dev/todomvc/#/');
        await page.waitForLoadState('networkidle');

        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 768, height: 1024 },
            { width: 375, height: 812 },
        ];

        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(1000); // let layout settle
            await eyes.check(`Viewport ${viewport.width}x${viewport.height}`, Target.window().fully());
        }

        await eyes.close();
    });
});
