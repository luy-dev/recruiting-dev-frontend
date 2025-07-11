import {isTodo, Todo} from "./todo.model";
import {HttpEvent, HttpRequest, HttpResponse, HttpStatusCode} from "@angular/common/http";
import {Observable, of} from "rxjs";

type HttpHandler = (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>;

interface HttpHandlerRegistration {
    method: string;
    urlMatcher: RegExp;
    handler: HttpHandler;
}

/**
 * Mock server that simulates REST API for managing to-do items. It uses local storage for persistency.
 * See README for descriptions of supported endpoints.
 */
export class MockServer {

    private static readonly TODO_LIST_KEY = 'luy_todo_list';
    private static readonly INITIAL_TODO_LIST: Todo[] = [
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
    private static readonly HANDLER_REGISTRATION: HttpHandlerRegistration[] = [
        {method: 'GET', urlMatcher: /\/todo/, handler: MockServer.get},
        {method: 'POST', urlMatcher: /\/todo/, handler: MockServer.post},
        {method: 'DELETE', urlMatcher: /\/todo/, handler: MockServer.delete},
    ];

    /**
     * Initializes the local storage with an initial to-do item list.
     */
    static initialize(): void {
        const todoListJson = localStorage.getItem(MockServer.TODO_LIST_KEY);
        if (todoListJson == null) {
            MockServer.saveTodoList(MockServer.INITIAL_TODO_LIST);
        }
    }

    /**
     * Removes all data from the local storage.
     */
    static clear(): void {
        localStorage.removeItem(MockServer.TODO_LIST_KEY);
    }

    static dispatch(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
        const handler = MockServer.HANDLER_REGISTRATION
            .find(registration => registration.method === req.method && registration.urlMatcher.exec(req.url))
            ?.handler;

        if (handler == null) {
            console.log('Could not find handler for request: ', req.method, req.url);
            return of(new HttpResponse({
                status: 418,
                statusText: 'Oh no! This request transformed the server into a teapot.'
            }));
        }

        return handler(req);
    }

    private static get(_req: HttpRequest<unknown>): Observable<HttpResponse<Todo[]>> {
        const todoList = MockServer.getTodoList();
        console.log("[GET] To-do item list fetched successfully.");
        return of(new HttpResponse({body: todoList, status: HttpStatusCode.Ok}));
    }

    private static post(req: HttpRequest<unknown>): Observable<HttpResponse<Todo>> {
        const payload = req.body;
        if (!isTodo(payload)) {
            console.error("[POST] The given payload is not a todo item.", payload);
            throw new Error('The given payload is not a todo item.');
        }

        if (payload.id !== undefined) {
            console.error("[POST] The given todo item already has an ID.", payload);
            throw new Error('The given todo item already has an ID.');
        }

        const todoList = MockServer.getTodoList();
        const todoIds = todoList.map(todoItem => todoItem.id).filter(id => id != undefined);
        const nextId = Math.max(...todoIds) + 1;
        const savedTodo: Todo = {
            ...payload,
            id: nextId
        };

        todoList.push(savedTodo);
        MockServer.saveTodoList(todoList);

        console.log("[POST] New to-do item added successfully", payload);
        return of(new HttpResponse({body: savedTodo, status: HttpStatusCode.Ok}));
    }

    private static delete(req: HttpRequest<unknown>): Observable<HttpResponse<unknown>> {
        const idParam = req.params.get('id');
        if (idParam == null) {
            console.error("[DELETE] Missing id parameter");
            return of(new HttpResponse({status: HttpStatusCode.BadRequest, statusText: 'Missing id parameter.'}));
        }

        const id = parseInt(idParam);
        if (isNaN(id)) {
            console.error("[DELETE] Id parameter is not a number");
            return of(new HttpResponse({
                status: HttpStatusCode.BadRequest,
                statusText: 'Id parameter is not a number.'
            }));
        }

        console.log(`[DELETE] Deleted to-do item with id=${id}`);
        const todoList = MockServer.getTodoList();
        const newTodoList = todoList.filter(todo => todo.id !== id);
        MockServer.saveTodoList(newTodoList);
        return of(new HttpResponse({status: HttpStatusCode.Ok}));
    }

    private static getTodoList(): Todo[] {
        const todoListJson = localStorage.getItem(MockServer.TODO_LIST_KEY);
        if (todoListJson == null) {
            return [];
        } else {
            return JSON.parse(todoListJson);
        }
    }

    private static saveTodoList(todoList: Todo[]): void {
        const todoListJson = JSON.stringify(todoList);
        localStorage.setItem(MockServer.TODO_LIST_KEY, todoListJson);
    }
}