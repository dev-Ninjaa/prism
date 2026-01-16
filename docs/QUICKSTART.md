# Quick Start Guide

## Prerequisites

1. **Install Rust**: https://rustup.rs/
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Install Node.js** (optional, for npm scripts): https://nodejs.org/

## Running the App

### Option 1: Using Cargo (Recommended)

```bash
cd src-tauri
cargo tauri dev
```

### Option 2: Using npm (if Node.js installed)

```bash
npm install
npm run dev
```

## First Run

The first run will take a few minutes as Cargo downloads and compiles dependencies.

Subsequent runs will be much faster.

## Expected Behavior

- A desktop window should open with the title "Prism"
- Window size: 1200x800
- The UI should look identical to the browser version
- All features should work (mock responses)
- History should persist in localStorage

## Troubleshooting

### Icons Warning
If you see icon-related warnings, that's expected. The placeholder icons are temporary.
To generate proper icons:
```bash
cargo tauri icon path/to/your-icon.png
```

### Build Errors
Make sure you have the latest Rust stable:
```bash
rustup update stable
```

### Port Already in Use
If you see port conflicts, Tauri will automatically try another port.

## Building for Production

```bash
cd src-tauri
cargo tauri build
```

The built app will be in `src-tauri/target/release/bundle/`

## Next Steps

- The UI is fully functional with mock responses
- Next phase: Implement real HTTP engine in Rust
- Tauri commands will be added to `src-tauri/src/main.rs`
