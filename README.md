# Modula Launcher - Linux Support Fork

This is a fork of the official [Modula Launcher](https://www.modulamc.in/)
focusing specifically on adding Linux support.

_Note: This fork has been tested on Arch Linux under Wayland (Hyprland)._

## Releases

For quick installation, go to the
[Releases](https://github.com/FrostCalibr/modula-launcher/releases) page and
download:

- **`modula-1.4.0-x86_64.AppImage`**: A universal package that runs on almost
  any modern Linux distribution.
- **`modula-1.4.0-x64.tar.xz`**: A portable tarball containing the unpacked
  application.

---

## How to Run

### Universal AppImage

1. Download the `modula-1.4.0-x86_64.AppImage`.
2. Make it executable:
   ```bash
   chmod +x modula-1.4.0-x86_64.AppImage
   ```
3. Run it:
   ```bash
   ./modula-1.4.0-x86_64.AppImage
   ```
   _Note: If you have AppImageLauncher installed, it will automatically prompt
   to integrate Modula Launcher into your system menu._

   _Tip: If the AppImage fails to start directly from the terminal with a
   `/dev/shm` sandbox permission error, run it with the sandbox disabled:_
   ```bash
   ./modula-1.4.0-x86_64.AppImage --no-sandbox
   ```

### Portable Tarball

1. Download `modula-1.4.0-x64.tar.xz`.
2. Extract the package:
   ```bash
   tar -xf modula-1.4.0-x64.tar.xz
   ```
3. Run the executable inside the extracted folder:
   ```bash
   ./xmcl
   ```

---

## Building from Source (Linux)

If you want to build the launcher yourself, make sure you have `pnpm` and
Node.js installed.

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/NOVE300IQ/modula-launcher.git
   cd modula-launcher
   pnpm install
   ```

2. Build the renderer and main process:
   ```bash
   pnpm build
   ```

3. To run the app in development mode:
   ```bash
   pnpm dev
   ```

4. To package the app into `AppImage` and `tar.xz` target packages:
   ```bash
   pnpm --prefix xmcl-electron-app build:all --linux
   ```
   The built files will be generated in `xmcl-electron-app/build/output/`.

---

## Linux Support & Patches

This fork fixes several issues present in the original repository when running
on Linux:

- **Restored Build Scripts**: Recovered the missing build configurations
  (`electron-builder.config.ts` and `appinstaller-builder.ts`) that were
  accidentally excluded from Git.
- **Native Toolchain Bypass**: Bypassed native compilation errors of the
  outdated `node-datachannel` library on modern systems (GCC 16+ / Python 3.14).
  The launcher now dynamically falls back to runtime loading.
- **JVM Crash Fix**: Removed deprecated arguments
  (`-XX:+RewriteFrequentCallSites` and `-XX:+UseInterpreter`) from the launching
  service that caused modern JDKs (Java 17/21) to crash instantly on startup.
