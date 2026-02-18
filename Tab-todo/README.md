# Tab ToDo Clones (Chrome + Safari)

This project contains two complete clones of the same extension:

- `chrome-extension/` - unpacked extension for Google Chrome
- `safari-web-extension/` - Safari Web Extension source clone (same functionality)
- `Tab ToDo - Safari/` - generated Xcode project for local Safari testing

## Chrome (load unpacked)

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click **Load unpacked**
4. Select `/Users/petr.vojtechovsky/Documents/New project/Tab-todo/chrome-extension`

## Safari (local-only)

This Safari variant is configured for local testing only.

1. Open:
   `/Users/petr.vojtechovsky/Documents/New project/Tab-todo/Tab ToDo - Safari/Tab ToDo - Safari.xcodeproj`
2. In Xcode, use schemes:
   - `Tab ToDo - Safari (macOS)`
   - `Tab ToDo - Safari Extension (macOS)`
3. In `Signing & Capabilities`, set `Personal Team` (paid Apple Developer Program is not required for local run).
4. Build and run from Xcode.
5. In Safari, go to `Settings -> Extensions` and enable `Tab ToDo - Safari`.

## Optional re-generate (local)

If you need to re-generate the Safari Xcode project from web-extension sources:

```bash
xcrun safari-web-extension-converter \
  /Users/petr.vojtechovsky/Documents/New\ project/Tab-todo/safari-web-extension \
  --project-location /Users/petr.vojtechovsky/Documents/New\ project/Tab-todo \
  --no-open --force
```

## Notes

- No framework, no backend, local-only persistence (`storage.local`)
- Safari clone includes API wrappers for callback/Promise compatibility
- Current setup is intended for local usage, not App Store distribution
