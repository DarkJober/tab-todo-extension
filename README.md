# Tab ToDo Extensions (Chrome + Safari)

A lightweight ToDo browser extension project with two targets:

- **Chrome Extension** (Manifest V3)
- **Safari Extension** (local run via Xcode)

## Highlights

- Add current tab as a task
- Local persistence (`storage.local`)
- Search + filters (`All`, `Active`, `Done`)
- Mark done / restore active
- Edit task title
- Delete task + clear completed
- Duplicate URL handling with URL normalization
- Optional "close tab after adding"

## Repository Layout

- `manifest.json`, `popup.html`, `popup.js`, `storage.js`, `styles.css`
  - base extension sources
- `Tab-todo/chrome-extension/`
  - Chrome-ready unpacked extension
- `Tab-todo/safari-web-extension/`
  - Safari Web Extension source clone
- `Tab-todo/Tab ToDo - Safari/`
  - generated Xcode project for local Safari testing

## Run in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `Tab-todo/chrome-extension`

## Run in Safari (Local Only)

1. Open `Tab-todo/Tab ToDo - Safari/Tab ToDo - Safari.xcodeproj` in Xcode
2. Set **Signing & Capabilities** to your **Personal Team**
3. Run scheme `Tab ToDo - Safari (macOS)`
4. In Safari, enable the extension in **Settings → Extensions**

## Re-generate Safari Xcode Project (Optional)

```bash
xcrun safari-web-extension-converter \
  Tab-todo/safari-web-extension \
  --project-location Tab-todo \
  --no-open --force
```

## Publish This Project to GitHub

### 1. Create an empty GitHub repository

Example: `tab-todo-extensions`

Create it **without** README/.gitignore/license (already present locally).

### 2. Commit local files

```bash
git add .
git commit -m "Initial commit: Tab ToDo Chrome + Safari"
```

### 3. Add remote

HTTPS:

```bash
git remote add origin https://github.com/<YOUR_USERNAME>/tab-todo-extensions.git
```

or SSH:

```bash
git remote add origin git@github.com:<YOUR_USERNAME>/tab-todo-extensions.git
```

If `origin` already exists:

```bash
git remote set-url origin https://github.com/<YOUR_USERNAME>/tab-todo-extensions.git
```

### 4. Push

```bash
git branch -M main
git push -u origin main
```

## Notes

- No backend
- No external libraries
- Safari setup here is intended for **local usage**, not App Store distribution
