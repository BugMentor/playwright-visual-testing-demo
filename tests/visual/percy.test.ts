import { test } from '@playwright/test';
import { captureSnapshots } from '../../utils/percy';
import { viewports } from '../../models/viewport';

test.describe('Percy Visual Testing', () => {
    test('Landing page responsive visual testing', async ({ page }) => {
        await page.goto('/todomvc');
        // Capture snapshots across viewports
        await captureSnapshots(page, 'TodoMVC - Landing Page', viewports);
    });

    test('Initial state, added, completed, active, and completed tasks', async ({ page }) => {
        await page.goto('/todomvc');
        // Initial state
        await captureSnapshots(page, 'TodoMVC - Estado inicial', viewports);
        // Add tasks
        await page.fill('.new-todo', 'Task 1');
        await page.keyboard.press('Enter');
        await page.fill('.new-todo', 'Task 2');
        await page.keyboard.press('Enter');
        await captureSnapshots(page, 'TodoMVC - Con tareas agregadas', viewports);
        // Complete first task
        await page.click('.todo-list li:first-child .toggle', { timeout: 60000 });
        await captureSnapshots(page, 'TodoMVC - Tarea completada', viewports);
        // View active tasks
        await page.click('text=Active', { timeout: 60000 });
        await captureSnapshots(page, 'TodoMVC - Vista tareas activas', viewports);
        // View completed tasks
        await page.click('text=Completed', { timeout: 60000 });
        await captureSnapshots(page, 'TodoMVC - Vista tareas completadas', viewports);
    });
});
