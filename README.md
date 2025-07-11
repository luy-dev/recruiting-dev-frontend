# Welcome!

Welcome to the wicked to-do list! It's a simple to-do list application written by a constantly drunk intern with a
split personality. Your job is to refactor the application so that it's actually maintainable and follows common
development practices. The good news? The application at least works and is (probably) bug-free.

The application is written in old-school Angular (no signals, no new template syntax). However, you're free to use the
new syntax during refactoring if you're more familiar with it.

## Getting started

You will need NodeJs 20+ installed and your favorite IDE. Once you've checked out this repository, go
to the root directory and run:

```
npm install
npx playwright install 
```

After successful installation, start the Angular application by running:

```
npm run start
```

You can run end-to-end tests any time to check if the refactoring did break something. To run E2E tests,
execute this command in a new console tab (keep in mind that the Angular application has to be up and running):

```
npm run e2e
```

## Task

Your entry point is the `todo-list` component. Analyze what's wrong with it and think how you could refactor it.
The to-do list has the following functions:

* Listing existing to-do items.
* Filtering existing to-do items by keywords. Any word in an item's title or description can match.
* Adding new to-do items.
* Removing to-do items.

These functions should work the same as before refactoring. When working on the task, please share your thoughts,
reasoning and ask questions if something is not clear. Good luck!

## REST API

The to-do list app comes with mocked REST API. You can use Angular's HTTP client like it was a regular online
API. The API supports the following methods:

### GET /todo

Returns all saved to-do items. If no items are present, returns an empty list.

```
// Request
GET /todo

// Respone
200 OK
[
    { 
        id: 1,
        title: "Item 1", 
        description: "An easy to-do item.", 
        addedOn: "2025-01-06T12:34:00Z" 
    } 
]
```

### POST /todo

Saves a new to-do item and returns the saved item with assigned ID.

```
// Request
POST /todo
{ 
    title: "Item 1", 
    description: "An easy to-do item.", 
    addedOn: "2025-01-06T12:34:00Z" 
} 

// Respone
200 OK
{ 
    id: 1,
    title: "Item 1", 
    description: "An easy to-do item.", 
    addedOn: "2025-01-06T12:34:00Z" 
} 
```

### DELETE /todo?id={id}

Deletes a to-do item with the given ID. Returns always `200 OK` - event if there was no item with the given ID.

```
// Request
DELETE /todo?id=1

// Respone
200 OK
```

