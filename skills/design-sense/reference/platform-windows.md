# Windows desktop conventions

- **Fonts:** Segoe UI Variable / Segoe UI for Latin, Microsoft JhengHei UI for zh-TW, 9pt (≈12px) base for dense UI, 10.5–11pt for reading.
- **Scaling:** declare per-monitor DPI awareness (v2) in the manifest; test 100/125/150/200%; never assume 96 DPI.
- **Layout:** commands at the top (menu bar or command bar), primary dialog button on the left of "Cancel" order per Windows: `[確定] [取消]`, right-aligned; Esc = cancel, Enter = default.
- **Shortcuts:** Ctrl+O/S/Shift+S/Z/Y/C/V/F, F1 help, F2 rename, Del delete, Alt opens the menu with access keys (`&F`).
- **Files & permissions:** never write next to the exe (Program Files is read-only for users); use `%LOCALAPPDATA%\<App>` / `%APPDATA%`. Show the full path in errors.
- **Shell integration:** context menus, file associations and installers (Inno Setup) should register per-user by default and remove everything on uninstall.
- **Theme:** respect light/dark (`AppsUseLightTheme`), high-contrast mode, and accent color where practical.
- **Tray & notifications:** a tray icon needs a tooltip and a right-click menu with "結束/Exit"; don't steal focus.
- **Text input:** support IME (注音/倉頡) composition; don't treat the composition Enter as submit; send text via clipboard or Unicode `SendInput` when injecting into other apps.
