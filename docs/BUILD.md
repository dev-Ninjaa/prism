# Building Prism

Complete guide to building Prism from source.

---

## Prerequisites

### All Platforms

**Rust** (1.77.2 or later)
```bash
# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify installation
rustc --version
cargo --version
```

### Platform-Specific Dependencies

#### Windows

**Visual Studio C++ Build Tools**
- Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Install "Desktop development with C++" workload

**WebView2** (usually pre-installed on Windows 10/11)
- If needed: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

#### macOS

**Xcode Command Line Tools**
```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian)

```bash
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

#### Linux (Fedora)

```bash
sudo dnf install \
    webkit2gtk4.1-devel \
    openssl-devel \
    curl \
    wget \
    file \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel
```

#### Linux (Arch)

```bash
sudo pacman -S \
    webkit2gtk-4.1 \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    gtk3 \
    libappindicator-gtk3 \
    librsvg
```

---

## Development Build

### Quick Start

```bash
# Clone repository
git clone https://github.com/dev-Ninjaa/prism.git
cd prism

# Run in development mode
cd src-tauri
cargo tauri dev
```

**First run**: Takes 2-5 minutes (compiles dependencies)  
**Subsequent runs**: ~10 seconds

### Development Features

- Hot reload for frontend changes
- Rust recompilation on backend changes
- DevTools enabled (F12)
- Debug logging

---

## Production Build

### Build Command

```bash
cd src-tauri
cargo tauri build
```

**Build time**: 5-10 minutes (first time)

### Output Locations

#### Windows

```
src-tauri/target/release/
├── prism.exe              # Executable
└── bundle/
    ├── msi/
    │   └── prism_0.1.0_x64_en-US.msi
    └── nsis/
        └── prism_0.1.0_x64-setup.exe
```

**Recommended**: Use the `.msi` installer

#### macOS

```
src-tauri/target/release/bundle/
├── macos/
│   └── prism.app          # Application bundle
└── dmg/
    └── prism_0.1.0_x64.dmg
```

**Recommended**: Use the `.dmg` for distribution

#### Linux

```
src-tauri/target/release/bundle/
├── appimage/
│   └── prism_0.1.0_amd64.AppImage
├── deb/
│   └── prism_0.1.0_amd64.deb
└── rpm/
    └── prism-0.1.0-1.x86_64.rpm
```

**Recommended**: 
- AppImage (universal)
- `.deb` for Debian/Ubuntu
- `.rpm` for Fedora/RHEL

---

## Build Configurations

### Release Build (Optimized)

```bash
cargo tauri build --release
```

- Optimized for size and speed
- No debug symbols
- ~10MB binary (Windows/Linux)
- ~15MB app bundle (macOS)

### Debug Build

```bash
cargo tauri build --debug
```

- Includes debug symbols
- Faster compilation
- Larger binary size
- Useful for troubleshooting

### Target-Specific Builds

```bash
# Build for specific target
cargo tauri build --target x86_64-pc-windows-msvc

# Available targets:
# - x86_64-pc-windows-msvc (Windows)
# - x86_64-apple-darwin (macOS Intel)
# - aarch64-apple-darwin (macOS Apple Silicon)
# - x86_64-unknown-linux-gnu (Linux)
```

---

## Build Options

### Custom Bundle Identifier

Edit `src-tauri/tauri.conf.json`:
```json
{
  "identifier": "com.ninja.prism"
}
```

### Custom App Name

Edit `src-tauri/tauri.conf.json`:
```json
{
  "productName": "Prism"
}
```

### Custom Icons

Replace icons in `src-tauri/icons/`:
- `icon.png` (1024x1024, source)
- `icon.icns` (macOS)
- `icon.ico` (Windows)
- Various PNG sizes

Generate icons:
```bash
# Install icon generator
cargo install tauri-cli

# Generate from source
cd src-tauri
cargo tauri icon path/to/icon.png
```

---

## Troubleshooting

### Build Fails: "linker not found"

**Windows**: Install Visual Studio C++ Build Tools  
**macOS**: Run `xcode-select --install`  
**Linux**: Install `build-essential` or equivalent

### Build Fails: "webkit2gtk not found"

**Linux only**: Install WebKit dependencies
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### Build Fails: "openssl not found"

```bash
# Ubuntu/Debian
sudo apt install libssl-dev

# macOS
brew install openssl

# Fedora
sudo dnf install openssl-devel
```

### Slow Build Times

**First build**: Normal (compiles all dependencies)  
**Subsequent builds**: Should be faster

**Speed up**:
```bash
# Use faster linker (Linux)
sudo apt install lld
export RUSTFLAGS="-C link-arg=-fuse-ld=lld"

# Use faster linker (macOS)
brew install llvm
export RUSTFLAGS="-C link-arg=-fuse-ld=lld"
```

### Out of Memory During Build

Increase swap space or build with fewer parallel jobs:
```bash
cargo tauri build -j 2
```

---

## Verification

### Test the Build

```bash
# Run the built executable
# Windows
./src-tauri/target/release/prism.exe

# macOS
open ./src-tauri/target/release/bundle/macos/API\ Prism.app

# Linux
./src-tauri/target/release/prism
```

### Check Binary Size

```bash
# Windows/Linux
ls -lh src-tauri/target/release/prism*

# macOS
du -sh src-tauri/target/release/bundle/macos/API\ Prism.app
```

**Expected sizes**:
- Windows: ~8-12 MB
- macOS: ~12-18 MB
- Linux: ~8-12 MB

---

## Distribution

### Windows

**Recommended**: `.msi` installer
- Double-click to install
- Adds to Start Menu
- Uninstaller included

### macOS

**Recommended**: `.dmg` disk image
- Drag to Applications folder
- Code signing recommended for distribution
- Notarization required for Gatekeeper

### Linux

**AppImage** (universal):
```bash
chmod +x prism_0.1.0_amd64.AppImage
./prism_0.1.0_amd64.AppImage
```

**Debian/Ubuntu**:
```bash
sudo dpkg -i prism_0.1.0_amd64.deb
```

**Fedora/RHEL**:
```bash
sudo rpm -i prism-0.1.0-1.x86_64.rpm
```

---

## Clean Build

Remove build artifacts:
```bash
cd src-tauri
cargo clean
```

This frees ~2GB of disk space but requires full rebuild next time.

---

## CI/CD (Optional)

### GitHub Actions Example

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Install dependencies (Linux)
        if: matrix.os == 'ubuntu-latest'
        run: |
          sudo apt update
          sudo apt install -y libwebkit2gtk-4.1-dev libssl-dev
      
      - name: Build
        run: |
          cd src-tauri
          cargo tauri build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: src-tauri/target/release/bundle/
```

---

## Build Performance

**Typical build times** (first build):
- **Windows**: 8-12 minutes
- **macOS**: 6-10 minutes
- **Linux**: 5-8 minutes

**Incremental builds**: 30 seconds - 2 minutes

**Factors affecting speed**:
- CPU cores (more is better)
- RAM (16GB+ recommended)
- SSD vs HDD (SSD much faster)
- Internet speed (first build downloads dependencies)

---

## Support

For build issues:
1. Check this guide first
2. Search existing GitHub issues
3. Open a new issue with:
   - OS and version
   - Rust version (`rustc --version`)
   - Full error message
   - Steps to reproduce

---

**Last Updated**: January 2025
