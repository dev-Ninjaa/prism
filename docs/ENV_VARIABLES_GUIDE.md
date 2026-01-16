# Environment Variables Guide

## Overview

Prism now supports environment variables using the `{{VARIABLE}}` syntax, similar to Postman. Variables are stored in SQLite and resolved before sending requests or exporting cURL commands.

## Usage

### 1. Managing Variables

Navigate to the **Env** tab in the request editor to manage your environment variables:

- **Add Variable**: Click "+ Add Variable" button
- **Edit Variable**: Modify the key or value directly (auto-saves after 500ms)
- **Delete Variable**: Click the × button next to the variable

### 2. Using Variables

Use the `{{VARIABLE_NAME}}` syntax in any of these fields:

- **URL**: `https://{{API_HOST}}/users`
- **Query Params**: Key or value can use variables
- **Headers**: Both header names and values support variables
- **Body**: JSON or text body content
- **Auth Fields**: Token, API key, username, password

### 3. Variable Resolution

**Rules:**
- Exact match, case-sensitive
- Single pass (no recursive resolution)
- Unresolved variables remain unchanged (e.g., `{{UNKNOWN}}` stays as-is)

**Example:**

```
Variables:
  API_HOST = api.example.com
  TOKEN = secret-token-123

Request URL:
  https://{{API_HOST}}/users

Resolved URL:
  https://api.example.com/users
```

### 4. cURL Export

When exporting to cURL, variables are automatically resolved to their current values. The exported command contains the actual values, not the variable placeholders.

## Storage

- Variables are stored in SQLite: `~/.local/share/prism/env.db` (Linux/Mac) or `%APPDATA%/prism/env.db` (Windows)
- Persisted across app restarts
- Single active environment (no multiple environments yet)

## Examples

### Example 1: API Base URL

```
Variable: BASE_URL = https://jsonplaceholder.typicode.com

URL: {{BASE_URL}}/users/1
Resolved: https://jsonplaceholder.typicode.com/users/1
```

### Example 2: Bearer Token

```
Variable: AUTH_TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Auth Type: Bearer Token
Token: {{AUTH_TOKEN}}
```

### Example 3: Multiple Variables

```
Variables:
  PROTOCOL = https
  HOST = api.github.com
  VERSION = v3

URL: {{PROTOCOL}}://{{HOST}}/{{VERSION}}/users
Resolved: https://api.github.com/v3/users
```

## Tips

- Use UPPERCASE for variable names (convention)
- Keep variable names descriptive
- Variables work in both Tauri app and browser fallback mode
- Changes are auto-saved after a short delay

## Limitations

- No variable nesting (e.g., `{{VAR_{{OTHER}}}}` not supported)
- No environment switching yet (single active environment)
- No variable scoping (all variables are global)
