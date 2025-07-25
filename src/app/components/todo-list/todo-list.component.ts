import {Component} from '@angular/core';
import {MatFormField, MatHint, MatInput, MatInputModule, MatPrefix, MatSuffix} from "@angular/material/input";
import {MatButton, MatButtonModule, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {Todo} from "../../todo.model";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-todo-list',
    imports: [
        MatFormField,
        MatInput,
        MatFormField,
        MatButton,
        MatIconButton,
        MatIcon,
        MatPrefix,
        MatHint,
        NgForOf,
        DatePipe,
        NgIf,
        ReactiveFormsModule,
        MatSuffix
    ],
    templateUrl: './todo-list.component.html',
    styleUrl: './todo-list.component.scss'
})
export class TodoListComponent {

    matDialog: MatDialog;

    todoList: Todo[] = [];
    filteredTodoList: Todo[] = [];

    filteredCount = -1;
    todoListCount = -1;

    hc!: HttpClient;

    searchControl: FormControl<string> = new FormControl('', {nonNullable: true});

    constructor(matDialog: MatDialog, httpClient: HttpClient) {
        this.matDialog = matDialog;
        this.hc = httpClient;

        this.hc.get<Todo[]>('/todo').subscribe(todoList => {
            this.todoList = [...todoList];
            this.filteredTodoList = [...todoList];
            this.todoListCount = todoList.length;
            this.filteredCount = todoList.length;
        });

        this.searchControl.valueChanges.subscribe(v => {
            const lower: any = v.toLowerCase();
            this.filteredTodoList = this.todoList.filter(todo =>
                todo.title.toLowerCase().includes(lower) || todo.description.toLowerCase().includes(lower)
            );
            this.filteredCount = this.filteredTodoList.length;
        });
    }

    add() {
        let ref: MatDialogRef<AddTodoDialog, any> = this.matDialog.open(AddTodoDialog);
        ref.afterClosed().subscribe(result => {
            if (result) {
                this.hc.post<Todo>('/todo', result).subscribe(addedTodo => {
                    this.todoList.push(addedTodo);
                    this.todoListCount = this.todoList.length;

                    const searchTerm = this.searchControl.value.toLowerCase();
                    const matchesFilter = addedTodo.title.toLowerCase().includes(searchTerm) || addedTodo.description.toLowerCase().includes(searchTerm);
                    if (matchesFilter) {
                        this.filteredTodoList.push(addedTodo);
                        this.filteredCount = this.filteredTodoList.length;
                    }
                });
            }
        });
    }

    removeTodo(index: number) {
        var todoId = this.filteredTodoList[index].id;
        if (todoId == undefined) {
            throw new Error('Expected defined ID.');
        }

        this.hc.delete('/todo', {params: {id: todoId.toString()}}).subscribe(() => {
            this.todoList = this.todoList.filter(todo => todo.id !== todoId);
            this.todoListCount = this.todoList.length;
            this.filteredTodoList = this.filteredTodoList.filter(todo => todo.id !== todoId);
            this.filteredCount = this.filteredTodoList.length;
        });
    }

    clear() {
        this.searchControl.setValue('');
    }
}

@Component({
    selector: 'app-add-todo-dialog',
    host: {
        '[attr.data-testid]': '"add-todo-dialog"'
    },
    template: `
        <h2 mat-dialog-title>Add a new to-do</h2>
        <mat-dialog-content>
            <div class="add-todo-form">
                <mat-form-field>
                    <mat-label>Title</mat-label>
                    <input matInput data-testid="title-input" [formControl]="titleControl" placeholder="Title">
                    <mat-error *ngIf="titleControl.hasError('required')">Title is required.</mat-error>
                </mat-form-field>
                <mat-form-field>
                    <mat-label>Description</mat-label>
                    <textarea matInput data-testid="description-input" [formControl]="descriptionControl" placeholder="Description"></textarea>
                    <mat-error *ngIf="descriptionControl.hasError('required')">Description is required.</mat-error>
                </mat-form-field>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button (click)="cancel()">Cancel</button>
            <button mat-flat-button
                    data-testid="add-btn"
                    [mat-dialog-close]="add()"
                    [disabled]="titleControl.invalid || descriptionControl.invalid">
                Add
            </button>
        </mat-dialog-actions>
    `,
    styles: `
      .add-todo-form {
        min-width: 500px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatDialogTitle,
        ReactiveFormsModule,
        NgIf,

    ],
})
export class AddTodoDialog {
    dialogRef: MatDialogRef<AddTodoDialog>;

    titleControl = new FormControl('', {nonNullable: true, validators: [Validators.required]});
    descriptionControl = new FormControl('', {nonNullable: true, validators: [Validators.required]});

    constructor(dialogRef: MatDialogRef<AddTodoDialog>) {
        this.dialogRef = dialogRef;
    }

    add() {
        return {
            title: this.titleControl.value ?? '',
            description: this.descriptionControl.value ?? '',
            addedOn: new Date()
        };
    }

    cancel() {
        this.dialogRef.close();
    }
}
