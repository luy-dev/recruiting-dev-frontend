import {expect, Page, test} from '@playwright/test';
import {Todo} from "../src/app/todo.model";
import {TODO_LIST_KEY} from "../src/app/mock-storage";

const TEST_TODO_LIST: Todo[] = [
    {
        id: 1,
        title: 'Buy gift for Alice',
        description: 'Alice has birthday in 6 months. I need to buy a gift for her.',
        addedOn: new Date('2025-05-01T15:35:00Z')
    },
    {
        id: 2,
        title: 'Wash the cat',
        description: 'My cat was roaming again and its fur is sticky and dusty. I should really wash it.',
        addedOn: new Date('2025-06-23T10:35:00Z')
    },
    {
        id: 3,
        title: 'Clean the kitchen',
        description: 'After the last party the kitchen is really messy. I should clean it before my Mom\'s visit.',
        addedOn: new Date()
    },
];

/**
 * Loads the given to-do list into the local storage and navigates to the main page.
 */
async function setup(page: Page, todoList: Todo[]) {
    await page.addInitScript(arg => {
        localStorage.removeItem(arg.key);
        const todoListJson = JSON.stringify(arg.list);
        localStorage.setItem(arg.key, todoListJson);
    }, {key: TODO_LIST_KEY, list: todoList});

    await page.goto('http://localhost:4200');
}

test('should render stored todo cards', async ({page}) => {
    await setup(page, TEST_TODO_LIST);
    await expect(page.getByTestId('todo-card')).toHaveCount(TEST_TODO_LIST.length);
});


test('should filter todo cards by search term', async ({page}) => {
    await setup(page, TEST_TODO_LIST);
    await expect(page.getByTestId('todo-card')).toHaveCount(TEST_TODO_LIST.length);

    await page.getByTestId('search-input').fill('for'); // Matches 1st and 3rd to-do items

    await expect(page.getByTestId('todo-card')).toHaveCount(2);
    await expect(page.getByTestId('matched-todos-count')).toHaveText('2');
    await expect(page.getByTestId('total-todos-count')).toHaveText('3');
});

test('should add a new todo card', async ({page}) => {
    await setup(page, []);
    await page.getByTestId('add-todo-btn').click();
    await expect(page.getByTestId('add-todo-dialog')).toBeVisible();

    await page.getByTestId('title-input').fill('Todo title');
    await page.getByTestId('description-input').fill('Todo description');
    await page.getByTestId('add-btn').click();

    await expect(page.getByTestId('todo-card')).toHaveCount(1);
    await expect(page.getByTestId('todo-card').last()).toContainText('Todo title');
    await expect(page.getByTestId('todo-card').last()).toContainText('Todo description');

});

test('should remove existing todo card', async ({page}) => {
    await setup(page, TEST_TODO_LIST);
    await expect(page.getByTestId('todo-card')).toHaveCount(TEST_TODO_LIST.length);

    await page.getByTestId('remove-todo-btn').nth(1).click();

    await expect(page.getByTestId('todo-card')).toHaveCount(TEST_TODO_LIST.length - 1);
});

