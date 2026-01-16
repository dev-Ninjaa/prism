# How to Run Prism

## Quick Start (3 Steps)

### 1. Open Terminal in Project Root

```bash
cd path/to/prism
```

### 2. Navigate to Tauri Directory

```bash
cd src-tauri
```

### 3. Run Development Mode

```bash
cargo tauri dev
```

That's it! The app window should open in a few seconds.

---

## Detailed Instructions

### First Time Setup

If this is your first time running the app:

1. **Install Rust** (if not already installed)
   ```bash
   # Windows (PowerShell)
   winget install Rustlang.Rust.MSVC
   
   # macOS/Linux
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Verify Installation**
   ```bash
   rustc --version
   cargo --version
   ```

3. **Install Tauri CLI** (optional, for convenience)
   ```bash
   cargo install tauri-cli --version "^2.0" --locked
   ```

### Running the App

#### Option 1: Using Cargo (Recommended)

```bash
cd src-tauri
cargo tauri dev
```

#### Option 2: Using npm (if Node.js installed)

```bash
# From project root
npm install
npm run dev
```

#### Option 3: Direct Cargo Command

```bash
cd src-tauri
cargo run
```

### What to Expect

#### First Run
- **Time**: 5-10 minutes
- **Why**: Cargo downloads and compiles all dependencies
- **Size**: ~500MB in `target/` directory
- **Network**: Required for downloading crates

#### Subsequent Runs
- **Time**: 5-10 seconds
- **Why**: Incremental compilation
- **Size**: Minimal changes
- **Network**: Not required

#### When App Opens
1. Desktop window appears (1200x800)
2. Window is centered on screen
3. Dark theme UI is visible
4. All features are functional
5. Mock responses work immediately

### Testing the App

Once the app opens:

1. **Make a Request**
   - Default URL is already filled
   - Click "Send" button
   - Wait ~800ms for mock response
   - Response appears below

2. **Check History**
   - Request appears in left sidebar
   - Shows method, URL, status
   - Click to reload request

3. **Try Different Methods**
   - Change method to POST
   - Click Send
   - See different mock response

4. **Test Auth**
   - Click "Auth" tab
   - Select "Bearer Token"
   - Enter a token
   - (Mock doesn't use it yet)

5. **Keyboard Shortcut**
   - Press Ctrl+Enter (Cmd+Enter on Mac)
   - Sends request without clicking

### Building for Production

When ready to create an installer:

```bash
cd src-tauri
cargo tauri build
```

Output location:
- Windows: `src-tauri/target/release/bundle/msi/`
- macOS: `src-tauri/target/release/bundle/dmg/`
- Linux: `src-tauri/target/release/bundle/deb/` or `appimage/`

### Stopping the App

#### During Development
- Close the window normally
- Or press Ctrl+C in terminal

#### Production Build
- Close the window normally
- App exits cleanly

---

## Troubleshooting

### Issue: "cargo: command not found"
**Solution**: Install Rust from https://rustup.rs/

### Issue: "tauri: command not found"
**Solution**: Use `cargo tauri` instead, or install Tauri CLI

### Issue: Window doesn't open
**Solution**: 
1. Check terminal for errors
2. Try `cargo clean` then rebuild
3. Check if port 1420 is available

### Issue: Compilation errors
**Solution**:
1. Update Rust: `rustup update stable`
2. Clean build: `cargo clean`
3. Rebuild: `cargo tauri dev`

### Issue: Icons warning
**Solution**: Ignore - icons are already generated

### Issue: UI looks broken
**Solution**: 
1. Verify all files in `src/` are intact
2. Check browser console (F12) for errors
3. Clear localStorage: `localStorage.clear()`

### Issue: Slow first build
**Solution**: This is normal - subsequent builds are fast

---

## Development Workflow

### Making UI Changes

1. Edit files in `src/` directory
2. Save changes
3. Refresh app window (Ctrl+R or Cmd+R)
4. Changes appear immediately

### Making Rust Changes

1. Edit files in `src-tauri/src/`
2. Save changes
3. Cargo automatically recompiles
4. App restarts with changes

### Viewing Logs

#### Development Console
- Open DevTools: Right-click → Inspect
- Or press F12
- Console shows JavaScript logs

#### Rust Logs
- Terminal shows Rust output
- Use `println!()` for debugging
- Or use `dbg!()` macro

---

## Alternative: Browser Testing

If you want to test the UI without Tauri:

```bash
# From project root
python -m http.server 8000

# Or use any static server
# Then visit: http://localhost:8000/src
```

Note: This uses mock responses only. Real HTTP requires Tauri.

---

## Commands Cheat Sheet

```bash
# Development
cd src-tauri && cargo tauri dev

# Build
cd src-tauri && cargo tauri build

# Check compilation
cd src-tauri && cargo check

# Clean build
cd src-tauri && cargo clean

# Update dependencies
cd src-tauri && cargo update

# View Tauri info
cargo tauri info

# Generate icons
cargo tauri icon icon.png
```

---

## Performance Tips

### Faster Builds
1. Use `cargo check` instead of `cargo build` for syntax checking
2. Use `--release` flag only for production
3. Keep `target/` directory (don't delete)

### Faster Development
1. Keep app running during UI changes
2. Use hot reload (Ctrl+R)
3. Only restart for Rust changes

### Reduce Memory
1. Close unused apps
2. Use `cargo clean` if disk space low
3. Build in release mode for smaller binary

---

## Next Steps

Once the app is running successfully:

1. ✅ Verify all features work
2. ✅ Test with different requests
3. ✅ Check history persistence
4. ✅ Try keyboard shortcuts
5. ➡️ Move to Phase 2: Implement HTTP engine

See `NEXT_STEPS.md` for HTTP implementation guide.

---

**Status**: Ready to run! 🚀
