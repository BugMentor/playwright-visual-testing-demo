import { Page } from '@playwright/test';
import percySnapshot from '@percy/playwright';
import { Viewport } from '../models/viewport';

export async function captureSnapshots(
  page: Page,
  baseName: string,
  viewports: Viewport[],
  waitSelector: string = 'body' // default to wait for body visible
) {
  // Generate a single timestamp for all snapshots within this captureSnapshots call
  // This ensures that all snapshots for a given 'baseName' and its viewports
  // are grouped under the same timestamp, making them unique across test runs.
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Format: YYYY-MM-DDTHH-MM-SS-sssZ

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForSelector(waitSelector, { state: 'visible', timeout: 60000 });

    // Append the timestamp to the snapshot name
    await percySnapshot(page, `${baseName} - ${vp.name} - ${timestamp}`);
  }
}
