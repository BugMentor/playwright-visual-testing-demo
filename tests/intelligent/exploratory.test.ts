import { test } from '@playwright/test';
import { Eyes, Target } from '@applitools/eyes-playwright';

test.describe('Automated Exploratory Testing', () => {
    test('Should explore the app smartly', async ({ page }) => {
        // Increase the test timeout for this exploratory test, as it involves many interactions
        test.setTimeout(180000); // Example: 3 minutes (adjust as needed)
        const eyes = new Eyes();
        await eyes.open(page, 'Exploratory Testing', 'AI Guided Exploration');

        try {
            await page.goto('/todomvc');
            // --- Initial Snapshot ---
            await eyes.check('Initial Page State', Target.window());
            // Define a set to keep track of visited URLs to avoid infinite loops on navigation
            const visitedUrls = new Set<string>();
            visitedUrls.add(page.url());
            // Max number of pages to explore to prevent infinite loops in complex apps
            const maxPagesToExplore = 5;
            let pagesExplored = 0;

            // Loop to explore pages
            while (pagesExplored < maxPagesToExplore) {
                pagesExplored++;
                console.log(`\n--- Exploring Page: ${page.url()} (Page ${pagesExplored}/${maxPagesToExplore}) ---`);
                // Re-map interactive elements for the current page
                // Filter for elements that are likely to be visible and interactive
                const interactiveElements = await page.locator('input, button, a, [role="button"]')
                    .filter({ hasNotText: 'View on GitHub' }) // Exclude specific non-app links if desired
                    .all();

                console.log(`🔍 Found ${interactiveElements.length} interactive elements on this page`);

                // Iterate through interactive elements
                for (let i = 0; i < interactiveElements.length; i++) {
                    const element = interactiveElements[i];
                    // Get element details (use a fresh locator if needed to avoid stale element reference)
                    // It's safer to re-locate the element in the loop if the page might change
                    // However, for simple cases, the current 'element' from .all() might suffice
                    // If you encounter "stale element reference" often, consider:
                    // const currentElement = page.locator('input, button, a, [role="button"]').nth(i);
                    // if (!await currentElement.isVisible()) continue; // Skip if not visible now
                    const tagName = await element.evaluate(el => el.tagName);
                    const text = (await element.textContent())?.trim() || '';

                    try {
                        // Skip elements that are hidden or not enabled
                        if (!await element.isVisible() || !await element.isEnabled()) {
                            console.log(`⏭️ Skipping hidden/disabled element: ${tagName} - "${text}"`);
                            continue; // Skip to the next element
                        }

                        console.log(`🎯 Exploring: ${tagName} - "${text}"`);
                        // Capture state before interaction
                        await eyes.check(`Before interacting with ${tagName} - "${text}"`, Target.window());
                        // Simulate hover
                        await element.hover();
                        await page.waitForTimeout(500); // Small pause for hover effect
                        await eyes.check(`Hover on ${tagName} - "${text}"`, Target.window());
                        // If it's clickable, click it
                        if (await element.isEnabled()) {
                            const currentUrl = page.url(); // Store current URL before click
                            // Use Promise.all to wait for both click and potential navigation
                            // This helps catch navigations and prevents "Execution context destroyed" errors
                            const [response] = await Promise.all([
                                page.waitForNavigation({ timeout: 10000, waitUntil: 'networkidle' }).catch(() => null), // Wait for navigation, but don't fail if no navigation
                                element.click()
                            ]);
                            // If navigation occurred, update visited URLs and break to re-map elements on new page
                            if (response) {
                                const newUrl = page.url();
                                if (newUrl !== currentUrl && !visitedUrls.has(newUrl)) {
                                    visitedUrls.add(newUrl);
                                    console.log(`➡️ Navigated to new page: ${newUrl}`);
                                    // Break the inner loop to re-evaluate interactive elements on the new page
                                    break; // This will exit the 'for' loop and go back to the 'while' loop
                                }
                            }
                            // If no navigation, or navigation to an already visited page, just wait for network idle
                            await page.waitForLoadState('networkidle');
                            // Capture state after click
                            await eyes.check(`After clicking ${tagName} - "${text}"`, Target.window());
                        }
                    } catch (error: any) {
                        // Catch specific Playwright errors for better logging
                        if (error.name === 'TimeoutError') {
                            console.log(`⚠️ Timeout error interacting with ${tagName} - "${text}": ${error.message}`);
                        } else if (error.message.includes('Execution context was destroyed')) {
                            console.log(`⚠️ Context destroyed error interacting with ${tagName} - "${text}": ${error.message}`);
                            // If context is destroyed, it means navigation happened unexpectedly or too fast.
                            // Re-evaluate elements on the new page.
                            break; // Exit inner loop to re-map elements
                        } else {
                            console.log(`⚠️ General error interacting with ${tagName} - "${text}": ${error}`);
                        }
                    }
                } // End of for loop (interactiveElements)
                // If the 'for' loop completed without a 'break' (i.e., no navigation occurred),
                // and we are still on the same page, we should exit the 'while' loop
                // or ensure we don't get stuck. For now, the maxPagesToExplore will handle it.
                // If you want to prevent getting stuck on a single page, you might add:
                // if (page.url() === currentUrlBeforeLoop) break;
            } // End of while loop (pagesExplored)
        } finally {
            // Ensure eyes.close() is called even if errors occur
            await eyes.close();
        }
    });
});
