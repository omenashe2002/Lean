# Deploying Lean — and getting auto-rolling updates

## TL;DR

You want **one** setup that:
- Hosts Lean on HTTPS (required for PWA)
- Auto-deploys when files change
- Lets you (and me) push fixes by editing files, without you re-installing anything

The path: **GitHub repo + Cloudflare Pages OR Netlify OR Vercel** — all free, all auto-deploy on every commit, all production-grade.

---

## Initial setup (one time, ~10 minutes)

### Option A — GitHub + Cloudflare Pages (recommended, fastest CDN)

1. **Create a GitHub repo** (free): https://github.com/new → name it `lean` (or anything) → private if you want
2. **Push this folder** to GitHub:
   ```bash
   cd ~/Documents/Claude/Projects/Health
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:YOUR-USERNAME/lean.git
   git push -u origin main
   ```
3. **Connect Cloudflare Pages**: https://pages.cloudflare.com → "Connect to Git" → pick the `lean` repo → Build settings: **leave everything blank** (it's a static site, no build needed) → Deploy
4. You'll get a URL like `lean-abc.pages.dev`. Open it in iPhone Safari → Share → Add to Home Screen → done.

### Option B — Netlify (slightly easier, drag-and-drop friendly)

1. https://app.netlify.com/drop → drag the whole `Health` folder → instant URL
2. (Optional) Connect to GitHub later under Site settings → Build & Deploy

### Option C — Vercel (one CLI command)

```bash
cd ~/Documents/Claude/Projects/Health
npx vercel deploy
```
Follow prompts. Done.

---

## How updates roll out automatically

The app already has a service worker (`service-worker.js`) that:

1. **Network-first** for `index.html` — every time you open the app, Safari checks for a fresh version
2. **Auto-invalidates** the cache when `APP_VERSION` (in `index.html`) bumps
3. **Force-refresh logic** kicks in within ~5 seconds of finding a new version, no manual reload needed
4. **Your data persists** — IndexedDB never gets wiped on update

**So the flow when I (or you) push an update is:**

```
Edit file → git commit → git push
         ↓
Cloudflare Pages auto-deploys (~30 sec)
         ↓
Next time you open the Lean icon on your iPhone:
         ↓
Service worker fetches the new index.html, swaps it in
         ↓
You see the new version. Data intact. No reinstall.
```

That's it. No App Store. No reinstall. No manual step on your end.

---

## How "I push fixes" works in practice

Each time you tell me about a bug or want a new feature in chat:

1. I edit the files in this folder
2. You run **one command**:
   ```bash
   cd ~/Documents/Claude/Projects/Health
   git add . && git commit -m "Updates from chat" && git push
   ```
3. ~30 seconds later, the deployed site updates
4. Your iPhone app picks it up automatically on the next open

If you want even less work, you can:
- Set up a [GitHub Codespace](https://github.com/codespaces) and have me push directly to a branch (advanced)
- Or just leave a terminal window open in this folder and run `git push` after each chat

---

## File reference

| File | Purpose |
|---|---|
| `index.html` | Whole app (HTML + CSS + JS, single file) |
| `manifest.webmanifest` | PWA install metadata (name, icon, color) |
| `service-worker.js` | Offline cache + update logic |
| `icon-180.png` / `icon-192.png` / `icon-512.png` | App icons |
| `netlify.toml` | Netlify build/headers config (caching rules) |
| `vercel.json` | Vercel build/headers config (caching rules) |
| `.gitignore` | Files Git should ignore (screenshots, etc.) |
| `SPEC.md` | Product + technical spec with research citations |
| `README.md` | Install instructions for end users |
| `DEPLOY.md` | This file |

---

## Troubleshooting

**My iPhone says "outdated version" or the app looks weird after an update**
→ In the app, More → "Force refresh (clear cache)". Or close all Safari tabs of the Lean URL and reopen.

**Updates aren't reaching the deployed site**
→ Check the Cloudflare Pages / Netlify dashboard. Build should succeed (we have no build step, so it should always succeed). If `git push` worked but the deploy didn't trigger, re-link the repo.

**I want a custom domain like `lean.or.com`**
→ All three platforms (Cloudflare / Netlify / Vercel) let you add a custom domain in a few clicks. Buy the domain from Cloudflare/Namecheap (~$10/yr), point it at the deploy.

**My data disappeared**
→ iOS may evict PWA storage if you don't open the app for ~7 weeks. Always have a recent JSON export from More → Export. Restore via More → Restore JSON backup.

---

## When you outgrow PWA → native iOS

If you want App Store presence + real push notifications + Apple HealthKit auto-sync:

1. Install Capacitor (one CLI tool, ~10 min)
2. Wrap this same code as a native iOS app (~1 day of work)
3. Apple Developer account ($99/yr) for App Store submission
4. ~1-week App Store review

You don't lose anything — the PWA keeps working. Capacitor is a wrapper, the code stays the same.
