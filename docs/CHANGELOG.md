# Changelog

All notable changes to Prism are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2025-01-16

### Initial Release

First stable release of Prism - a local-first API testing tool.

#### Added

**Core Features**
- HTTP request execution (GET, POST, PUT, DELETE, PATCH)
- Real Rust-based HTTP engine using reqwest
- Request builder with URL, params, headers, body
- Response viewer with status, timing, size, and pretty JSON
- Authentication support (Bearer Token, API Key, Basic Auth)

**Storage & Persistence**
- SQLite-based request history
- History sidebar with click-to-load
- Clear history functionality
- Persistent across app restarts

**Environment Variables**
- `{{VARIABLE}}` syntax support
- SQLite storage for env vars
- Variable resolution in URL, params, headers, body, auth
- Env tab for managing variables
- Case-sensitive matching
- Auto-save with debounce

**File Operations**
- Save requests as JSON files
- Load requests from JSON files
- Native file dialogs (save/open)
- Git-friendly format (human-readable)
- Variables preserved unresolved in files
- Keyboard shortcuts (Ctrl+S, Ctrl+O)

**Developer Experience**
- cURL export with copy to clipboard
- Dark mode UI
- Keyboard shortcuts (Ctrl+Enter to send)
- Native desktop performance
- No cloud, no accounts, no telemetry

**Technical**
- Tauri 2.x desktop framework
- Rust backend with tokio async runtime
- SQLite for local storage
- Vanilla JavaScript frontend (no frameworks)
- ~10MB binary size

#### Architecture

- Modular Rust backend:
  - `engine/` - HTTP execution and auth
  - `store/` - SQLite persistence
  - `env/` - Environment variables
  - `workspace/` - File I/O
- Clean separation of concerns
- Tauri IPC for frontend-backend communication

#### Documentation

- Comprehensive README
- User guides for all features
- Test plans and scenarios
- Architecture documentation
- Build instructions
- Quick reference guides

---

## [Unreleased]

### Planned (Not Committed)

Potential future enhancements:
- Collections/folders UI
- Request chaining
- GraphQL support
- WebSocket testing
- Response history
- Import from Postman/Insomnia
- Pre-request scripts
- Tests/assertions

**Note**: These are ideas, not promises. The current feature set is complete and stable.

---

## Version History

- **0.1.0** (2025-01-16) - Initial release

---

## Upgrade Guide

### From Nothing to 0.1.0

This is the first release. No upgrade needed.

---

## Breaking Changes

None yet. This is the first release.

---

## Deprecations

None yet.

---

## Security

### 0.1.0

- All data stored locally (no cloud)
- No telemetry or tracking
- HTTPS for all requests (rustls)
- Environment variables stored in local SQLite
- No external dependencies at runtime

**Reporting Security Issues**: Open a GitHub issue or email [your.email@example.com]

---

## Contributors

- [Your Name] - Initial development and design

---

## Links

- [GitHub Repository](https://github.com/dev-Ninjaa/prism)
- [Documentation](docs/)
- [Issue Tracker](https://github.com/dev-Ninjaa/prism/issues)

---

**Note**: This project follows semantic versioning. Version numbers indicate:
- **Major** (1.x.x): Breaking changes
- **Minor** (x.1.x): New features, backwards compatible
- **Patch** (x.x.1): Bug fixes, backwards compatible
