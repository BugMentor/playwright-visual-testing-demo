import { test } from '@playwright/test';
import { writeFileSync } from 'fs';
import { UserJourney } from '../../models/user-journey';

test.describe('UX Mapping', () => {
    test('Should generate UX flow map', async ({ page }) => {
        const userJourney: UserJourney[] = [];
        let stepCounter = 0;
        // Función helper para registrar acciones
        const logAction = async (action: string, element: string) => {
            stepCounter++;
            const timestamp = Date.now();
            const screenshot = `step-${stepCounter}-${timestamp}.png`;
            // Ensure the directory exists before writing the screenshot
            // You might want to add a check or create the directory if it doesn't exist
            // For simplicity, assuming 'test-results/ux-journey/' exists or will be created by Playwright
            await page.screenshot({
                path: `test-results/ux-journey/${screenshot}`,
                fullPage: true
            });

            userJourney.push({
                step: stepCounter,
                action,
                element,
                timestamp,
                screenshot
            });

            console.log(`📍 Paso ${stepCounter}: ${action} en ${element}`);
        };
        // Iniciar journey
        await page.goto('https://demo.playwright.dev/todomvc');
        await logAction('Navegar', 'Página principal');
        // Flujo típico de usuario
        const todoInput = page.locator('input.new-todo');
        await todoInput.click();
        await logAction('Click', 'Input de nueva tarea');
        await todoInput.fill('Mi primera tarea');
        await logAction('Escribir', 'Texto en input');
        await todoInput.press('Enter');
        await logAction('Enviar', 'Formulario de tarea');
        // Agregar más tareas
        const tasks = ['Segunda tarea', 'Tercera tarea importante'];

        for (const task of tasks) {
            await todoInput.fill(task);
            await logAction('Escribir', `Tarea: ${task}`);
            await todoInput.press('Enter');
            await logAction('Enviar', 'Nueva tarea');
        }
        // Marcar tarea como completada
        await page.locator('.todo-list li').first().locator('input.toggle').click();
        await logAction('Marcar completada', 'Primera tarea');
        // Filtrar tareas
        // Use getByRole('link') to specifically target the "Active" filter link
        await page.getByRole('link', { name: 'Active' }).click();
        await logAction('Filtrar', 'Tareas activas');
        // Use getByRole('link') to specifically target the "Completed" filter link
        await page.getByRole('link', { name: 'Completed' }).click();
        await logAction('Filtrar', 'Tareas completadas');
        // Eliminar tarea
        await page.locator('.todo-list li').first().hover();
        await page.locator('.destroy').first().click();
        await logAction('Eliminar', 'Tarea completada');
        // Generar reporte del journey
        const report = {
            testName: 'TodoMVC User Journey',
            startTime: userJourney[0]?.timestamp,
            endTime: userJourney[userJourney.length - 1]?.timestamp,
            totalSteps: userJourney.length,
            duration: userJourney[userJourney.length - 1]?.timestamp - userJourney[0]?.timestamp,
            steps: userJourney
        };
        // Guardar reporte
        writeFileSync(
            'test-results/ux-journey/user-journey-report.json',
            JSON.stringify(report, null, 2)
        );

        console.log(`✅ Journey completado: ${report.totalSteps} pasos en ${report.duration}ms`);
    });
});
