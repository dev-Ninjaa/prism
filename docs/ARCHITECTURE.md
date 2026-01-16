# Architecture Overview

## Current Architecture (Phase 1 - Complete)

```
┌─────────────────────────────────────────────────────────────┐
│                     Desktop Window (Tauri)                  │
│                     1200x800, Centered                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │              Web UI (HTML/CSS/JS)                     │  │
│  │                                                       │  │
│  │  ┌─────────────┬──────────────────────────────────┐  │  │
│  │  │             │  Request Bar                     │  │  │
│  │  │  Sidebar    ├──────────────────────────────────┤  │  │
│  │  │  (History)  │  Request Editor (Tabs)           │  │  │
│  │  │             ├──────────────────────────────────┤  │  │
│  │  │             │  Response Viewer                 │  │  │
│  │  └─────────────┴──────────────────────────────────┘  │  │
│  │                                                       │  │
│  │              Mock Responses (JavaScript)              │  │
│  │              localStorage for History                 │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│                   Rust Backend (Minimal)                    │
│                   - No commands yet                         │
│                   - Ready for IPC                           │
└─────────────────────────────────────────────────────────────┘
```

## Future Architecture (Phase 2 - Planned)

```
┌─────────────────────────────────────────────────────────────┐
│                     Desktop Window (Tauri)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Web UI (HTML/CSS/JS)                     │  │
│  │                                                       │  │
│  │  User clicks "Send" ──────────────────┐              │  │
│  │                                        │              │  │
│  │  JavaScript calls:                     │              │  │
│  │  invoke('send_request', {...})         │              │  │
│  └────────────────────────────────────────┼──────────────┘  │
│                                           │                 │
│                                           ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Tauri IPC Bridge                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                           │                 │
│                                           ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Rust Backend                              │   │
│  │                                                     │   │
│  │  #[tauri::command]                                  │   │
│  │  async fn send_request(...)                         │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  HTTP Client (reqwest)                       │  │   │
│  │  │  - Build request                             │  │   │
│  │  │  - Add headers/auth                          │  │   │
│  │  │  - Send to API                               │  │   │
│  │  │  - Measure time                              │  │   │
│  │  │  - Parse response                            │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                     │   │
│  │  Returns: ApiResponse { status, body, time, ... }  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                           │                 │
│                                           ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Response flows back to UI                 │   │
│  │           - Display status badge                    │   │
│  │           - Show formatted JSON                     │   │
│  │           - Update history                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   External API   │
                    │  (Real HTTP)     │
                    └──────────────────┘
```

## File Structure

```
prism/
│
├── src/                          # Frontend (Web UI)
│   ├── index.html               # Main HTML structure
│   ├── styles/                  # CSS styling
│   │   ├── variables.css        # Design tokens
│   │   ├── base.css            # Global styles
│   │   ├── layout.css          # Layout grid
│   │   ├── theme-dark.css      # Dark theme
│   │   └── components/         # Component styles
│   │       ├── sidebar.css
│   │       ├── request-bar.css
│   │       ├── tabs.css
│   │       ├── response.css
│   │       └── buttons.css
│   ├── scripts/                 # JavaScript logic
│   │   ├── state.js            # State management
│   │   ├── app.js              # Bootstrap
│   │   ├── ui/                 # UI modules
│   │   │   ├── sidebar.js
│   │   │   ├── requestBar.js
│   │   │   ├── tabs.js
│   │   │   ├── responseView.js
│   │   │   └── authForm.js
│   │   └── mock/               # Mock responses
│   │       └── mockResponse.js # ← Will call Tauri in Phase 2
│   └── assets/                  # Static assets
│
├── src-tauri/                   # Backend (Rust)
│   ├── src/
│   │   └── main.rs             # ← HTTP engine goes here
│   ├── Cargo.toml              # Rust dependencies
│   ├── tauri.conf.json         # Tauri configuration
│   ├── build.rs                # Build script
│   └── icons/                  # App icons
│
├── .gitignore                   # Git ignore patterns
├── package.json                 # npm scripts
│
└── Documentation/
    ├── README.md               # Main readme
    ├── QUICKSTART.md           # Getting started
    ├── NEXT_STEPS.md           # Implementation guide
    ├── TAURI_SETUP_COMPLETE.md # Setup verification
    ├── test-setup.md           # Testing checklist
    ├── IMPLEMENTATION_SUMMARY.md # Summary
    └── ARCHITECTURE.md         # This file
```

## Data Flow (Current - Mock)

```
User Action (Click Send)
        │
        ▼
JavaScript (requestBar.js)
        │
        ▼
handleSendRequest()
        │
        ▼
generateMockResponse() ← Mock data
        │
        ▼
renderResponse()
        │
        ▼
Update UI + History
```

## Data Flow (Future - Real HTTP)

```
User Action (Click Send)
        │
        ▼
JavaScript (requestBar.js)
        │
        ▼
handleSendRequest()
        │
        ▼
Check if Tauri available
        │
        ├─ Yes ──▶ invoke('send_request', config)
        │                   │
        │                   ▼
        │          Rust HTTP Client
        │                   │
        │                   ▼
        │          External API
        │                   │
        │                   ▼
        │          Parse Response
        │                   │
        │                   ▼
        │          Return to JavaScript
        │                   │
        └───────────────────┘
                    │
                    ▼
            renderResponse()
                    │
                    ▼
            Update UI + History
```

## Technology Stack

### Frontend
- **HTML5**: Semantic structure
- **CSS3**: Custom properties, Grid, Flexbox
- **JavaScript**: ES6+, Vanilla (no frameworks)
- **Storage**: localStorage for history

### Backend
- **Rust**: Systems programming language
- **Tauri**: Desktop framework (v2.x)
- **Future**: reqwest (HTTP client), tokio (async runtime)

### Build Tools
- **Cargo**: Rust package manager
- **Tauri CLI**: Build and dev tools
- **npm**: Optional, for convenience scripts

## Security Model

### Current
- No network access (mock responses)
- localStorage only
- No sensitive data handling

### Future
- Tauri IPC for secure communication
- Rust handles all HTTP requests
- No direct network access from JavaScript
- CSP policies enforced
- Native OS security features

## Performance Characteristics

### Startup
- Cold start: <1 second
- Memory: ~50-100MB
- CPU: Minimal

### Runtime
- UI: 60fps (CSS transitions)
- Mock responses: ~800ms delay
- Real HTTP: Network dependent
- History: Instant (localStorage)

### Build
- First build: 5-10 minutes
- Incremental: 5-10 seconds
- Bundle size: ~5-10MB (compressed)

## Platform Support

### Desktop
- ✅ Windows (tested)
- ✅ macOS (ready)
- ✅ Linux (ready)

### Mobile
- ⏳ iOS (icons ready, not tested)
- ⏳ Android (icons ready, not tested)

## Development Workflow

```
┌─────────────────────────────────────────────────────────┐
│  Developer                                              │
│                                                         │
│  1. Edit UI files (src/)                               │
│     - HTML/CSS/JS changes                              │
│     - Hot reload in browser                            │
│                                                         │
│  2. Edit Rust files (src-tauri/src/)                   │
│     - Add Tauri commands                               │
│     - Implement HTTP logic                             │
│                                                         │
│  3. Run: cargo tauri dev                               │
│     - Compiles Rust                                    │
│     - Opens desktop window                             │
│     - Hot reload on changes                            │
│                                                         │
│  4. Test in app                                        │
│     - Make requests                                    │
│     - Check responses                                  │
│     - Verify history                                   │
│                                                         │
│  5. Build: cargo tauri build                           │
│     - Creates installer                                │
│     - Platform-specific bundle                         │
│     - Ready for distribution                           │
└─────────────────────────────────────────────────────────┘
```

## Next Phase Implementation

See `NEXT_STEPS.md` for detailed implementation guide.

Key changes needed:
1. Add `reqwest` and `tokio` to Cargo.toml
2. Implement `send_request` command in main.rs
3. Update `mockResponse.js` to use Tauri invoke
4. Test with real APIs
5. Handle errors and edge cases

---

**Current Status**: Phase 1 Complete ✅
**Next Phase**: HTTP Engine Implementation
