# Setup Instructions

**Get Prism running in under 2 minutes.**

---

## Quick Setup (Recommended)

### Step 1: Install Rust

```bash
# Windows (PowerShell)
winget install Rustlang.Rustup

# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Verify**:
```bash
rustc --version
# Should show: rustc 1.77.2 or later
```

### Step 2: Clone Repository

```bash
git clone https://github.com/dev-Ninjaa/prism.git
cd prism
```

### Step 3: Run

```bash
cd src-tauri
cargo tauri dev
```

**First run**: Takes 2-5 minutes (compiles dependencies)  
**App launches**: Automatically when ready

---

## Platform-Specific Setup

### Windows

**Prerequisites**:
1. **Rust**: Install via [rustup](https://rustup.rs/)
2. **Visual Studio C++ Build Tools**: [Download](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Select "Desktop development with C++" workload
3. **WebView2**: Usually pre-installed on Windows 10/11

**Run**:
```powershell
cd src-tauri
cargo tauri dev
```

### macOS

**Prerequisites**:
1. **Rust**: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. **Xcode Command Line Tools**: `xcode-select --install`

**Run**:
```bash
cd src-tauri
cargo tauri dev
```

### Linux (Ubuntu/Debian)

**Prerequisites**:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install system dependencies
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

**Run**:
```bash
cd src-tauri
cargo tauri dev
```

---

## Troubleshooting

### "rustc not found"

**Solution**: Restart terminal after installing Rust, or run:
```bash
source $HOME/.cargo/env
```

### "linker not found" (Windows)

**Solution**: Install Visual Studio C++ Build Tools

### "webkit2gtk not found" (Linux)

**Solution**:
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### "Permission denied" (macOS/Linux)

**Solution**:
```bash
chmod +x src-tauri/target/debug/prism
```

### Build takes too long

**Normal**: First build takes 2-5 minutes (compiles all dependencies)  
**Subsequent builds**: ~10 seconds

---

## Verification

### Check Installation

```bash
# Verify Rust
rustc --version
cargo --version

# Verify Tauri CLI (optional)
cargo install tauri-cli
cargo tauri --version
```

### Test Build

```bash
cd src-tauri
cargo check
# Should complete without errors
```

### Run App

```bash
cargo tauri dev
# App should launch in ~10 seconds (after first build)
```

---

## Next Steps

### 1. Explore Features

- Make a test request: `GET https://jsonplaceholder.typicode.com/users/1`
- Try environment variables: Add `BASE_URL` in Env tab
- Save a request: Press `Ctrl+S`
- Export to cURL: Click export button

### 2. Read Documentation

- [User Guide](docs/README.md)
- [Quick Reference](docs/QUICK_REFERENCE.md)
- [Environment Variables](docs/ENV_VARIABLES_GUIDE.md)

### 3. Build for Production

```bash
cd src-tauri
cargo tauri build
```

Output in `src-tauri/target/release/bundle/`

---

## Development Workflow

### Daily Use

```bash
# Start development server
cd src-tauri
cargo tauri dev

# Make changes to:
# - Frontend: src/ (hot reload)
# - Backend: src-tauri/src/ (auto recompile)

# Stop: Ctrl+C
```

### Building

```bash
# Check compilation
cargo check

# Run tests
cargo test

# Build release
cargo tauri build
```

---

## Configuration

### Change App Name

Edit `src-tauri/tauri.conf.json`:
```json
{
  "productName": "Your App Name"
}
```

### Change Window Size

Edit `src-tauri/tauri.conf.json`:
```json
{
  "app": {
    "windows": [{
      "width": 1400,
      "height": 900
    }]
  }
}
```

### Change Bundle ID

Edit `src-tauri/tauri.conf.json`:
```json
{
  "identifier": "com.yourcompany.yourapp"
}
```

---

## Uninstall

### Remove Application

```bash
# Windows
# Uninstall via Settings > Apps

# macOS
rm -rf /Applications/API\ Prism.app

# Linux
sudo apt remove prism  # if installed via .deb
# or just delete the binary
```

### Remove Development Files

```bash
cd prism
rm -rf src-tauri/target/  # Build artifacts
cargo clean  # Clean Cargo cache
```

---

## Getting Help

1. **Check documentation**: [docs/](docs/)
2. **Search issues**: [GitHub Issues](https://github.com/dev-Ninjaa/prism/issues)
3. **Open new issue**: Include OS, Rust version, error message

---

## System Requirements

### Minimum

- **OS**: Windows 10, macOS 10.15, Ubuntu 20.04 (or equivalent)
- **RAM**: 4GB
- **Disk**: 500MB (for development)
- **Internet**: Required for initial setup

### Recommended

- **OS**: Windows 11, macOS 12+, Ubuntu 22.04+
- **RAM**: 8GB+
- **Disk**: 2GB (for development + build artifacts)
- **CPU**: Multi-core (faster builds)

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `cargo tauri dev` | Run development server |
| `cargo tauri build` | Build production binary |
| `cargo check` | Check compilation |
| `cargo test` | Run tests |
| `cargo clean` | Clean build artifacts |

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send request |
| `Ctrl+S` | Save request |
| `Ctrl+O` | Load request |
| `F12` | Open DevTools (dev mode) |

---

**Ready to build?** Run `cargo tauri dev` and start testing APIs!
