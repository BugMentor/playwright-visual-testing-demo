import { test } from '@playwright/test';
import { Eyes, Target, Configuration, BatchInfo } from '@applitools/eyes-playwright';

test.describe('AI Visual Testing con Applitools', () => {
    let eyes: Eyes;

    test.beforeEach(async () => {
        eyes = new Eyes();
        // Configuración
        const configuration = new Configuration();
        configuration.setApiKey(process.env.APPLITOOLS_API_KEY!);
        configuration.setAppName('BugMentor Demo');
        configuration.setTestName('TodoMVC Visual AI Testing');
        // Batch info para agrupar tests
        const batchInfo = new BatchInfo('Playwright + Applitools Demo');
        configuration.setBatch(batchInfo);
        eyes.setConfiguration(configuration);
    });

    test('Should smartly detect visual changes', async ({ page }) => {
        await eyes.open(page, 'TodoMVC App', 'Visual AI Test');

        try {
            await page.goto('/todomvc');
            // Checkpoint del estado inicial
            await eyes.check('Estado inicial', Target.window().fully());
            // Agregar tareas con diferentes contenidos
            const tasks = [
                'Implementar testing visual con IA',
                'Configurar pipeline CI/CD',
                'Entrenar modelo de detección de anomalías'
            ];

            const todoInput = page.locator('input.new-todo');

            for (const task of tasks) {
                await todoInput.fill(task);
                await todoInput.press('Enter');
            }
            // Checkpoint con tareas
            await eyes.check('Lista con tareas', Target.window().fully());
            // Interacciones complejas
            await page.locator('.todo-list li').first().locator('input.toggle').check();
            await page.locator('.todo-list li').nth(1).hover();
            // Checkpoint con interacciones
            await eyes.check('Tarea completada y hover', Target.window().fully());
            // Test de diferentes filtros
            await page.locator('text=Active').click();
            await eyes.check('Vista activas', Target.window().fully());
            await page.getByRole('link', { name: 'Completed' }).click();
            await eyes.check('Vista completadas', Target.window().fully());
            // Test específico de región
            await page.getByRole('link', { name: 'All' }).click();

            await eyes.check(
                'Lista completa - Región específica',
                Target.region('.todoapp').fully()
            );

        } finally {
            await eyes.close();
        }
    });

    test('Should adapt to all resolutions responsively', async ({ page }) => {
        await eyes.open(page, 'TodoMVC App', 'Responsive AI Test');

        try {
            await page.goto('/todomvc');
            // Agregar contenido de prueba
            const todoInput = page.locator('input.new-todo');
            await todoInput.fill('Tarea para testing responsivo');
            await todoInput.press('Enter');
            // Test en diferentes viewports
            const viewports = [
                { width: 1920, height: 1080, name: 'Desktop Large' },
                { width: 1366, height: 768, name: 'Desktop Medium' },
                { width: 1024, height: 768, name: 'Tablet Landscape' },
                { width: 768, height: 1024, name: 'Tablet Portrait' },
                { width: 375, height: 667, name: 'Mobile' }
            ];

            for (const viewport of viewports) {
                await page.setViewportSize({
                    width: viewport.width,
                    height: viewport.height
                });

                await eyes.check(
                    `Layout ${viewport.name}`,
                    Target.window().fully().layoutBreakpoints(true)
                );
            }

        } finally {
            await eyes.close();
        }
    });

    test.afterEach(async () => {
        await eyes.abort();
    });
});
