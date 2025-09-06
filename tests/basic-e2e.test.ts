import { test, expect } from '@playwright/test';

test.describe('Demo E2E - BugMentor', () => {
    test('Should navigate and complete the form', async ({ page }) => {
        // Navegar a la página principal
        await page.goto('/todomvc');
        // Verificar título
        await expect(page).toHaveTitle(/TodoMVC/);
        // Agregar tareas
        const todoInput = page.locator('input.new-todo');
        await todoInput.fill('Preparar demo con Playwright');
        await todoInput.press('Enter');
        await todoInput.fill('Configurar Percy para visual testing');
        await todoInput.press('Enter');
        await todoInput.fill('Integrar Applitools Eyes');
        await todoInput.press('Enter');
        // Verificar que las tareas se agregaron
        const todoItems = page.locator('.todo-list li');
        await expect(todoItems).toHaveCount(3);
        // Marcar primera tarea como completada
        await page.locator('.todo-list li').first().locator('input.toggle').check();
        // Verificar filtros
        // Use getByRole('link') to specifically target the "Active" filter link
        await page.getByRole('link', { name: 'Active' }).click();
        await expect(todoItems.filter({ hasText: 'Preparar demo' })).toBeHidden();
        // Use getByRole('link') to specifically target the "Completed" filter link
        await page.getByRole('link', { name: 'Completed' }).click();
        await expect(todoItems.filter({ hasText: 'Preparar demo' })).toBeVisible();
    });
});
