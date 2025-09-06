import { Page, Locator } from '@playwright/test';

export class TodoPage {
    readonly page: Page;
    readonly newTodoInput: Locator;
    readonly todoItems: Locator;
    readonly activeFilter: Locator;
    readonly completedFilter: Locator;
    readonly allFilter: Locator;

    constructor(page: Page) {
        this.page = page;
        this.newTodoInput = page.locator('input.new-todo');
        this.todoItems = page.locator('.todo-list li');
        this.activeFilter = page.locator('text=Active');
        this.completedFilter = page.locator('text=Completed');
        this.allFilter = page.locator('text=All');
    }

    async goto() {
        await this.page.goto('/todomvc');
    }

    async addTodo(text: string) {
        await this.newTodoInput.fill(text);
        await this.newTodoInput.press('Enter');
    }

    async toggleTodo(index: number) {
        await this.todoItems.nth(index).locator('input.toggle').check();
    }

    async filterActive() {
        await this.activeFilter.click();
    }

    async filterCompleted() {
        await this.completedFilter.click();
    }

    async filterAll() {
        await this.allFilter.click();
    }
}
