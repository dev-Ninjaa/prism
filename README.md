# PRISM

**A local-first API testing tool built with Rust and Tauri.**

Prism is a lightweight, desktop-native alternative to Postman and Insomnia. It stores everything locally—no cloud, no accounts, no tracking. Built with Rust for performance and reliability.

---

## Why Prism?

**The Problem**: Modern API clients are bloated, cloud-dependent, and require accounts for basic features.

**The Solution**: A fast, local-first tool that stores requests as portable JSON files you can commit to Git.

### Key Differences

| Feature |    Prism    | Postman/Insomnia |
|---------|-------------|------------------|
| Storage | Local files + SQLite | Cloud-first |
| Auth | None required | Account required |
| Performance | Native Rust | Electron |
| Request files | Git-friendly JSON | Proprietary format |
| Environment vars | `{{VAR}}` syntax | Similar |
| Size | ~10MB | ~200MB+ |

---

## Features

### Core Functionality
- ✅ **HTTP Engine**: Real requests via Rust (reqwest)
- ✅ **All Methods**: GET, POST, PUT, DELETE, PATCH
- ✅ **Authentication**: Bearer Token, API Key, Basic Auth
- ✅ **Request Builder**: URL, params, headers, body
- ✅ **Response Viewer**: Status, timing, headers, pretty JSON
- ✅ **History**: SQLite-based persistence
- ✅ **Environment Variables**: `{{VARIABLE}}` syntax
- ✅ **File-Based Requests**: Save/load as JSON
- ✅ **cURL Export**: Copy as cURL command

### Developer Experience
- 🎨 Dark mode UI
- ⌨️ Keyboard shortcuts (`Ctrl+Enter`, `Ctrl+S`, `Ctrl+O`)
- 📁 Git-friendly request files
- 🔒 100% local, no telemetry
- 🚀 Native performance

---

## Screenshots

### Main Interface
```
┌─────────────────────────────────────────────────────────┐
│  History    │  GET  https://api.example.com/users  [Send]│
│             ├─────────────────────────────────────────────┤
│  • GET /users│  Params │ Auth │ Headers │ Body │ Env     │
│  • POST /login│                                           │
│  • GET /posts│  [Request configuration area]             │
│             │                                             │
│             ├─────────────────────────────────────────────┤
│             │  Response                                   │
│             │  Status: 200 OK  Time: 245ms  Size: 1.2KB  │
│             │                                             │
│             │  {                                          │
│             │    "id": 1,                                 │
│             │    "name": "John Doe"                       │
│             │  }                                          │
└─────────────────────────────────────────────────────────┘
```

*Note: Add actual screenshots to `/docs/screenshots/` for production*

---

## Quick Start

### Prerequisites

- **Rust** (1.77.2+): [Install Rust](https://rustup.rs/)
- **System dependencies** (Linux only):
  ```bash
  # Ubuntu/Debian
  sudo apt install libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
  ```

### Run Locally

```bash
# Clone the repository
git clone https://github.com/dev-Ninjaa/prism.git
cd prism

# Run in development mode
cd src-tauri
cargo tauri dev
```

The app will launch in ~10 seconds on first run (Rust compilation).

### Build for Production

```bash
cd src-tauri
cargo tauri build
```

**Output locations:**
- **Windows**: `src-tauri/target/release/prism.exe`
- **macOS**: `src-tauri/target/release/bundle/macos/prism.app`
- **Linux**: `src-tauri/target/release/bundle/appimage/prism_0.1.0_amd64.AppImage`

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Web UI)                    │
│              HTML + CSS + Vanilla JavaScript            │
│  • Request builder  • Response viewer  • History UI     │
└────────────────────────┬────────────────────────────────┘
                         │ Tauri IPC
┌────────────────────────▼────────────────────────────────┐
│                   Backend (Rust)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  HTTP Engine (reqwest)                           │  │
│  │  • Request execution  • Auth  • Var resolution   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Storage (SQLite)                                │  │
│  │  • History  • Environment variables              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Workspace (File I/O)                            │  │
│  │  • Save/load requests as JSON                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Why This Stack?

- **Tauri**: Native desktop with web UI (smaller than Electron)
- **Rust**: Memory-safe, fast HTTP engine
- **SQLite**: Reliable local storage
- **Vanilla JS**: No framework bloat, fast load times

---

## Project Structure

```
prism/
├── src/                          # Frontend (Web UI)
│   ├── index.html               # Main HTML
│   ├── scripts/
│   │   ├── app.js               # Bootstrap
│   │   ├── state.js             # State management
│   │   └── ui/                  # UI modules
│   │       ├── requestBar.js    # Request controls
│   │       ├── sidebar.js       # History
│   │       ├── responseView.js  # Response display
│   │       ├── authForm.js      # Auth UI
│   │       └── envVars.js       # Env vars UI
│   └── styles/                  # CSS modules
│
├── src-tauri/                    # Backend (Rust)
│   ├── src/
│   │   ├── main.rs              # Tauri commands
│   │   ├── models.rs            # Data structures
│   │   ├── engine/              # HTTP execution
│   │   │   ├── http.rs          # Request engine
│   │   │   ├── auth.rs          # Authentication
│   │   │   └── curl.rs          # cURL generation
│   │   ├── store/               # SQLite storage
│   │   │   ├── db.rs            # Database ops
│   │   │   └── models.rs        # History models
│   │   ├── env/                 # Environment variables
│   │   │   ├── store.rs         # Env storage
│   │   │   └── resolver.rs      # Variable resolution
│   │   └── workspace/           # File operations
│   │       ├── io.rs            # Save/load requests
│   │       └── models.rs        # File models
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # App configuration
│
└── docs/                         # Documentation
    ├── ENV_VARIABLES_GUIDE.md
    ├── FILE_SAVE_LOAD_GUIDE.md
    └── IMPLEMENTATION_STATUS.md
```

### Module Responsibilities

| Module | Purpose | Language |
|--------|---------|----------|
| `src/` | User interface | HTML/CSS/JS |
| `engine/` | HTTP execution | Rust |
| `store/` | History persistence | Rust + SQLite |
| `env/` | Variable management | Rust + SQLite |
| `workspace/` | File save/load | Rust |

---

## Usage

### Basic Request

1. Enter URL: `https://jsonplaceholder.typicode.com/users/1`
2. Select method: `GET`
3. Click **Send** (or press `Ctrl+Enter`)

### Environment Variables

1. Go to **Env** tab
2. Add variable: `BASE_URL = api.example.com`
3. Use in URL: `https://{{BASE_URL}}/users`
4. Variables resolve on send

### Save & Share Requests

```bash
# Save request
Ctrl+S → save as api-requests/get-user.json

# Commit to Git
git add api-requests/
git commit -m "Add user API request"

# Teammate loads it
Ctrl+O → select api-requests/get-user.json
```

**Request file format:**
```json
{
  "name": "GET .../users/1",
  "request": {
    "method": "GET",
    "url": "{{BASE_URL}}/users/1",
    "headers": [
      {
        "enabled": true,
        "key": "Authorization",
        "value": "Bearer {{TOKEN}}"
      }
    ],
    "auth": {
      "type": "bearer",
      "token": "{{TOKEN}}"
    }
  }
}
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Send request |
| `Ctrl/Cmd + S` | Save request |
| `Ctrl/Cmd + O` | Load request |

---

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - ES6+, no frameworks

### Backend
- **Rust** (1.77.2+) - Systems language
- **Tauri 2.x** - Desktop framework
- **reqwest** - HTTP client
- **SQLite** (rusqlite) - Local database
- **tokio** - Async runtime

### Dependencies
```toml
tauri = "2"                    # Desktop framework
tauri-plugin-dialog = "2"      # File dialogs
reqwest = "0.12"               # HTTP client
rusqlite = "0.32"              # SQLite
serde = "1"                    # Serialization
tokio = "1"                    # Async runtime
```

---

## Development

### Project Commands

```bash
# Development mode (hot reload)
cd src-tauri
cargo tauri dev

# Check compilation
cargo check

# Run tests
cargo test

# Build release
cargo tauri build

# Format code
cargo fmt

# Lint
cargo clippy
```

### Adding Features

1. **Backend**: Add Tauri commands in `src-tauri/src/main.rs`
2. **Frontend**: Add UI in `src/scripts/ui/`
3. **State**: Update `src/scripts/state.js`

### Testing

```bash
# Rust tests
cd src-tauri
cargo test

# Manual testing
cargo tauri dev
# Follow test plans in docs/TEST_*.md
```

---

## Documentation

### User Guides
- [Environment Variables Guide](docs/ENV_VARIABLES_GUIDE.md)
- [File Save & Load Guide](docs/FILE_SAVE_LOAD_GUIDE.md)
- [Quick Reference](docs/QUICK_REFERENCE.md)

### Technical Docs
- [Architecture](docs/ARCHITECTURE.md)
- [Implementation Status](docs/IMPLEMENTATION_STATUS.md)
- [HTTP Engine Details](docs/HTTP_ENGINE_COMPLETE.md)

### Test Plans
- [HTTP Engine Tests](docs/TEST_HTTP_ENGINE.md)
- [Environment Variables Tests](docs/TEST_ENV_VARIABLES.md)
- [File Save/Load Tests](docs/TEST_FILE_SAVE_LOAD.md)

---

## Project Status

### ✅ Core Features (Complete)

The following features are **stable and production-ready**:

- HTTP request execution (all methods)
- Authentication (Bearer, API Key, Basic)
- Request history with SQLite persistence
- Environment variables with `{{VAR}}` syntax
- File-based request save/load (JSON)
- cURL export
- Dark mode UI

### 🎯 Current State

**Version**: 0.1.0  
**Status**: Feature-complete for core use cases  
**Stability**: Ready for daily use

This is a **stable foundation**, not an experimental prototype. The core feature set is complete and well-tested.

### 🔮 Future Enhancements (Optional)

Potential additions (not committed):
- Collections/folders UI
- Request chaining
- GraphQL support
- WebSocket testing
- Response history
- Import from Postman/Insomnia

These are **nice-to-haves**, not requirements. The current feature set is intentionally focused.

---

## Why Local-First?

### Privacy
- No account required
- No data sent to cloud
- No telemetry or tracking
- Your API keys stay on your machine

### Portability
- Request files are plain JSON
- Commit to Git with your code
- Share via any method (Git, email, Slack)
- No vendor lock-in

### Performance
- Native Rust HTTP engine
- No network overhead for UI
- Instant startup
- Low memory footprint (~50MB)

### Simplicity
- No sync conflicts
- No subscription
- No internet required (except for requests)
- Works offline

---

## Comparison

### vs Postman
- ✅ Smaller (10MB vs 200MB+)
- ✅ Faster (native Rust vs Electron)
- ✅ Local-first (no cloud required)
- ✅ Git-friendly files
- ❌ No collections UI (use file system)
- ❌ No team features (use Git)

### vs Insomnia
- ✅ Lighter weight
- ✅ No account required
- ✅ Simpler feature set
- ❌ No GraphQL (yet)
- ❌ No plugins

### vs cURL
- ✅ GUI for building requests
- ✅ History and persistence
- ✅ Environment variables
- ✅ Can export to cURL
- ❌ Not scriptable (yet)

---

## Contributing

This is a personal project and portfolio piece. Contributions are not currently accepted, but feel free to fork and adapt for your needs.

### Forking

```bash
git clone https://github.com/dev-Ninjaa/prism.git
cd prism
# Make it your own!
```

---

## License

[Add your license here - MIT recommended for portfolio projects]

---

## Credits

**Built by**: [Your Name]  
**Purpose**: Portfolio project demonstrating Rust, Tauri, and systems programming  
**Inspired by**: Postman, Insomnia, and the need for a lightweight alternative

---

## Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com
- **Portfolio**: [yourportfolio.com](https://yourportfolio.com)

---

**Prism** - Fast, local, and built with Rust.
