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

### Hardening Test Endpoints

-   **GET** `http://localhost:3000/api/params` -> Echoes received query params
    -   Example: `?q=test&page=1`
    -   Expected: `{"query": {"q": "test", "page": "1"}}`
-   **GET** `http://localhost:3000/api/headers` -> Echoes received headers
    -   Example Header: `X-Test: value`
    -   Expected: `{"headers": {..., "x-test": "value"}}`
-   **POST** `http://localhost:3000/api/body` -> Returns parsed body or raw body
    -   Body: `{"key": "value"}` (JSON) or `Raw text`
    -   Expected: `{"body": ..., "contentType": ...}`
    -   Errors: 400 if `Content-Type: application/json` but invalid JSON
-   **GET** `http://localhost:3000/api/env/:value` -> Returns value from URL param
    -   Example: `/api/env/my-value`
    -   Expected: `{"value": "my-value"}`
-   **GET** `http://localhost:3000/api/auth/bearer` -> Requires Bearer token
    -   Header: `Authorization: Bearer my-token`
    -   Expected: `{"message": "Authenticated with Bearer token", "token": "my-token"}`
    -   Errors: 401 if missing
-   **GET** `http://localhost:3000/api/auth/basic` -> Requires Basic auth
    -   Auth: `Basic (username:password)`
    -   Expected: `{"message": "Authenticated with Basic auth", "username": "admin"}`
    -   Errors: 401 if missing
-   **GET** `http://localhost:3000/api/auth/apikey` -> Requires API key in header OR query
    -   Header: `X-API-Key: key123` OR Query: `api_key=key123`
    -   Expected: `{"message": "Authenticated with API key", "key": "key123", "location": "..."}`
    -   Errors: 403 if missing
-   **POST** `http://localhost:3000/api/mixed` -> Echoes params, headers, body, auth
    -   Uses all components together
