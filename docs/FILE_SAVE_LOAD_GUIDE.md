# File-Based Request Save & Load - Guide

## Overview

Prism now supports saving and loading requests as portable JSON files. This allows you to:
- Store requests in version control (Git)
- Share requests with team members
- Organize requests in your file system
- Keep environment variables unresolved for portability

## Usage

### Save Request

**Three ways to save:**

1. **Button**: Click the save icon (💾) next to the Send button
2. **Keyboard**: Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac)
3. **Menu**: File → Save Request (if menu implemented)

A native file dialog will open. Choose location and filename (defaults to `request.json`).

### Load Request

**Three ways to load:**

1. **Button**: Click the folder icon (📂) next to the save button
2. **Keyboard**: Press `Ctrl+O` (Windows/Linux) or `Cmd+O` (Mac)
3. **Menu**: File → Load Request (if menu implemented)

A native file dialog will open. Select a `.json` request file.

**Important**: Loading a request populates the UI but does NOT automatically send it. Review and click Send when ready.

## File Format

Requests are saved as human-readable JSON:

```json
{
  "name": "GET .../users/1",
  "request": {
    "method": "GET",
    "url": "{{BASE_URL}}/users/1",
    "params": [
      {
        "enabled": true,
        "key": "page",
        "value": "1"
      }
    ],
    "headers": [
      {
        "enabled": true,
        "key": "Authorization",
        "value": "Bearer {{TOKEN}}"
      }
    ],
    "body": null,
    "auth": {
      "type": "bearer",
      "token": "{{TOKEN}}",
      "apiKey": null,
      "apiValue": null,
      "username": null,
      "password": null
    }
  }
}
```

### Key Features

- **Pretty-printed**: Easy to read and edit
- **UTF-8 encoded**: Supports all characters
- **Variables preserved**: `{{VAR}}` syntax remains unresolved
- **Complete state**: All request details included
- **No history**: Only the request, not responses
- **No timestamps**: Clean and portable

## Use Cases

### 1. Version Control

```bash
# Save requests in your project
mkdir api-requests
# Save request as api-requests/get-user.json

# Commit to Git
git add api-requests/
git commit -m "Add user API request"
```

### 2. Team Sharing

```bash
# Share via Git
git push origin main

# Teammate pulls and loads
git pull
# Load api-requests/get-user.json in Prism
```

### 3. Request Organization

```
project/
├── api-requests/
│   ├── auth/
│   │   ├── login.json
│   │   └── refresh-token.json
│   ├── users/
│   │   ├── get-user.json
│   │   ├── create-user.json
│   │   └── update-user.json
│   └── products/
│       ├── list-products.json
│       └── get-product.json
```

### 4. Environment Portability

Save with variables:
```json
{
  "url": "{{API_HOST}}/users",
  "auth": {
    "type": "bearer",
    "token": "{{AUTH_TOKEN}}"
  }
}
```

Each developer sets their own environment variables:
- Dev: `API_HOST = dev.api.example.com`
- Staging: `API_HOST = staging.api.example.com`
- Prod: `API_HOST = api.example.com`

## Workflow Example

### Scenario: Testing a new API endpoint

1. **Build the request** in Prism
   - Set method, URL, headers, body
   - Use environment variables for flexibility
   - Test with Send button

2. **Save the request**
   - Press `Ctrl+S`
   - Save as `api-requests/new-endpoint.json`

3. **Commit to Git**
   ```bash
   git add api-requests/new-endpoint.json
   git commit -m "Add new endpoint request"
   git push
   ```

4. **Teammate loads it**
   - Pull latest changes
   - Press `Ctrl+O`
   - Select `api-requests/new-endpoint.json`
   - Set their environment variables
   - Click Send to test

## Tips

### File Naming

Use descriptive names:
- ✅ `get-user-by-id.json`
- ✅ `create-product.json`
- ✅ `auth-login.json`
- ❌ `request1.json`
- ❌ `test.json`

### Directory Structure

Organize by feature or resource:
```
api-requests/
├── authentication/
├── users/
├── products/
└── orders/
```

### Environment Variables

Always use variables for:
- Base URLs: `{{BASE_URL}}`
- Auth tokens: `{{TOKEN}}`
- API keys: `{{API_KEY}}`
- Environment-specific values

### Git Integration

Add to `.gitignore` if needed:
```gitignore
# Ignore local test requests
api-requests/local-*.json
api-requests/test-*.json
```

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Save Request | `Ctrl+S` | `Cmd+S` |
| Load Request | `Ctrl+O` | `Cmd+O` |
| Send Request | `Ctrl+Enter` | `Cmd+Enter` |

## Limitations

**Not Included in Files:**
- Response data
- History entries
- Timestamps
- Request execution results

**Not Supported:**
- Collections (single requests only)
- Folders in UI
- Auto-save
- Cloud sync
- Request naming UI (name auto-generated)

## Troubleshooting

**File dialog doesn't open?**
- Ensure you're running the desktop app (not browser)
- Check app permissions

**Variables not resolving after load?**
- Variables are preserved as `{{VAR}}` in files
- Set environment variables in Env tab
- Variables resolve when you click Send

**Can't find saved file?**
- Check the directory you selected in save dialog
- Use OS file search
- Files have `.json` extension

**Load doesn't work?**
- Ensure file is valid JSON
- Check file format matches expected structure
- Look for syntax errors in JSON

## See Also

- `ENV_VARIABLES_GUIDE.md` - Environment variables documentation
- `QUICK_REFERENCE.md` - Quick reference for all features
- `README.md` - General app documentation
