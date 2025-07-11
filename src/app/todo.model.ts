export interface Todo {
    id?: number;
    title: string;
    description: string;
    addedOn: Date;
}

export function isTodo(value: unknown): value is Todo {
    return typeof value === 'object' && value !== null && 'title' in value && 'description' in value && 'addedOn' in value;
}