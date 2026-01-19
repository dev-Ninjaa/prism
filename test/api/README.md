# Prism Test API

Deterministic REST API for testing Prism.

## Setup

1.  Navigate to this directory: `cd test/api`
2.  Install dependencies: `npm install`
3.  Start the server: `npm start`

The server will start at `http://localhost:3000`.

## Endpoints to Test in Prism

-   **GET** `http://localhost:3000/api/users` -> Returns list of users (200 OK)
-   **POST** `http://localhost:3000/api/users` -> Create user (201 Created)
    -   Body: `{"name": "John Doe"}`
-   **GET** `http://localhost:3000/api/error` -> Deterministic error (500 Internal Server Error)
-   **POST** `http://localhost:3000/api/echo` -> Echoes headers and body (200 OK)
