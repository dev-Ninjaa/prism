# PRISM

**A modern, local-first API testing tool built with Rust and Tauri.**

Prism is a lightweight and fast desktop application for all your API testing needs. It's a developer-focused alternative to tools like Postman and Insomnia, designed to be simple, efficient, and completely offline.

---

### Built with

![Tauri](https://img.shields.io/badge/Tauri-24C8E8?style=for-the-badge&logo=tauri&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## The Problem

Modern API clients are often bloated, slow, and heavily reliant on the cloud. They require you to create accounts, store your data on their servers, and deal with unnecessary complexity for what should be a simple task: testing your APIs. This can be a privacy concern and a drag on your development workflow.

## Our Solution

Prism is a **local-first** API testing tool that puts you in control.

*   **No Cloud, No Accounts:** Everything is stored locally on your machine. Your data is your own.
*   **Fast and Lightweight:** Built with Rust and Tauri, Prism is significantly smaller and faster than Electron-based alternatives.
*   **Git-Friendly:** Save your API requests as simple JSON files. Version control your requests alongside your code.
*   **Simple and Focused:** Prism provides the essential features for API testing without the bloat.

---

## Features

| Feature                  | Description                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| **All HTTP Methods**     | `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.                                                                 |
| **Full Request Control** | Customize URL, parameters, headers, and body.                                                            |
| **Multiple Auth Types**  | `Bearer Token`, `API Key`, and `Basic Auth` are supported.                                               |
| **Response Viewer**      | View response status, time, size, headers, and a pretty-printed JSON body.                               |
| **Request History**      | All your requests are saved locally in a SQLite database for easy access.                                |
| **Environment Variables**| Use `{{VARIABLE}}` syntax in your requests for dynamic values.                                           |
| **File-Based Requests**  | Save and load your requests as portable JSON files.                                                      |
| **cURL Export**          | Instantly generate a cURL command for any request.                                                       |
| **Dark Mode**            | A beautiful dark mode UI for those late-night coding sessions.                                           |
| **Keyboard Shortcuts**   | `Ctrl+Enter` to send, `Ctrl+S` to save, `Ctrl+O` to open.                                                |

---

## Screenshots

*Note: Add actual screenshots to `/docs/screenshots/` for production*

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

---

## Quick Start

### Prerequisites

*   **Rust** (1.77.2+): [Install Rust](https://rustup.rs/)
*   **System dependencies** (Linux only):
    ```bash
    # Ubuntu/Debian
    sudo apt install libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
    ```

### Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dev-Ninjaa/prism.git
    cd prism
    ```
2.  **Run in development mode:**
    ```bash
    cd src-tauri
    cargo tauri dev
    ```

The app will launch in about 10 seconds on the first run due to Rust compilation.

### Build for Production

```bash
cd src-tauri
cargo tauri build
```

The compiled application will be in the `src-tauri/target/release` directory.

---

## Architecture

Prism is built with a simple and powerful architecture that separates the frontend UI from the backend logic.

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

---

## Contributing

This is a personal project, but feel free to fork it and make it your own!

```bash
git clone https://github.com/dev-Ninjaa/prism.git
cd prism
# Start coding!
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.