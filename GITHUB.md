# Setting up GitHub for Lean — step by step

Everything you do happens **once**. After this, every future update I make to the app deploys with one command.

Total time: ~10 minutes.

---

## Step 1 — Make sure you have a GitHub account

If you don't already:
1. Go to **https://github.com/join**
2. Sign up (free). Pick any username — for example `or-menashe`. Remember what you pick — you'll use it in Step 3.

If you already have one, skip ahead.

---

## Step 2 — Create a new empty repo on github.com

1. Click the **+** in the top-right of github.com → **New repository**
2. Fill in:
   - **Repository name:** `lean`
   - **Description:** (optional) `Personal health PWA`
   - **Public or Private:** **Private** is fine (only you need access)
   - **DO NOT check** "Add a README", ".gitignore", or "license" — we already have those.
3. Click **Create repository**

GitHub will show you a page with setup commands. Ignore them — I've prepped your folder differently. Just keep that page open or copy the URL at the top (will look like `https://github.com/YOUR-USERNAME/lean.git`).

---

## Step 3 — Push your folder up (Terminal commands)

Open **Terminal** on your Mac (Cmd+Space, type "Terminal", press Enter).

Copy-paste this block — **replace `YOUR-USERNAME`** with your actual GitHub username:

```bash
cd ~/Documents/Claude/Projects/Health
git init -b main
git config user.email "ordavidmenashe@gmail.com"
git config user.name "Or"
git add .
git commit -m "Initial commit: Lean v3-l"
git remote add origin https://github.com/YOUR-USERNAME/lean.git
git push -u origin main
```

It will ask for your GitHub credentials.

- **Username:** your GitHub username
- **Password:** *not* your GitHub password — use a **Personal Access Token** instead (see Step 3a below)

### Step 3a — Create a Personal Access Token (one-time)

GitHub stopped accepting passwords for git push in 2021. You need a token:

1. https://github.com/settings/tokens
2. **Generate new token (classic)** → name it `lean-deploy`, expiration `90 days` or `No expiration`
3. Under **scopes**, check just `repo`
4. Click **Generate token**, **copy the long string immediately** (you can't see it again)
5. When `git push` asks for your password, paste this token

(Mac alternative: use `gh auth login` after installing GitHub CLI with `brew install gh` — it handles auth automatically.)

After `git push` finishes, refresh your repo page on github.com — you'll see all the files there.

---

## Step 4 — Connect to a free deploy host (pick one)

### Easiest: Cloudflare Pages (recommended)

1. https://pages.cloudflare.com → sign up (free)
2. **Connect to Git** → authorize GitHub → pick the `lean` repo
3. Build settings: **leave everything blank** (no framework, no build command, output directory `/`)
4. Click **Save and Deploy**
5. ~1 minute later, you get a URL like `lean-abc.pages.dev`

### Alternative: Netlify

1. https://app.netlify.com → **Add new site** → **Import an existing project** → pick GitHub → pick `lean` repo
2. Leave build settings blank → Deploy
3. URL like `lean-abc.netlify.app`

### Alternative: Vercel

1. https://vercel.com → import from GitHub → pick `lean` → leave defaults → Deploy
2. URL like `lean-abc.vercel.app`

All three are free, fast, and auto-deploy on every git push.

---

## Step 5 — Install Lean on your iPhone

1. Open the URL from Step 4 in **Safari** on your iPhone (must be Safari)
2. Tap the **Share** icon (square with up-arrow)
3. Scroll → **Add to Home Screen** → Add
4. Tap the new "Lean" icon — opens full-screen, offline-capable, behaves like a real app

Done. Bookmark the github.com repo page too.

---

## How updates work after this is set up

Whenever I update files in this chat:

1. You run this in Terminal (one-time per update):

```bash
cd ~/Documents/Claude/Projects/Health
git add .
git commit -m "update"
git push
```

2. Cloudflare Pages (or Netlify/Vercel) auto-deploys in ~30 seconds
3. Next time you open the Lean icon on your iPhone, the service worker pulls the new code and swaps it in. Your data stays put.

You never re-install. You never have to do anything on the iPhone.

---

## Troubleshooting

**`xcode-select: error: unable to find utility "git"`**
→ Install Xcode Command Line Tools: `xcode-select --install` (takes 5 minutes, free)

**Git push fails: "Authentication failed"**
→ You used your GitHub password instead of a token. Go back to Step 3a.

**Cloudflare Pages "Build failed"**
→ Should never happen — this is a static site, no build step. If it does, check that the **build command is empty** and **output directory is `/`** (or blank).

**iPhone shows "Outdated version"**
→ In the app: More → "Force refresh (clear cache)". Or close all Safari tabs of the URL and reopen.

**I want a custom domain like `lean.ormenashe.com`**
→ Buy from Cloudflare/Namecheap (~$10/yr). Add it to Cloudflare Pages → Custom domains → DNS auto-configures.

---

## Quick reference (copy/paste-able)

**First-time setup (run once):**

```bash
cd ~/Documents/Claude/Projects/Health
git init -b main
git config user.email "ordavidmenashe@gmail.com"
git config user.name "Or"
git add .
git commit -m "Initial commit: Lean v3-l"
git remote add origin https://github.com/YOUR-USERNAME/lean.git
git push -u origin main
```

**Every future update (run when I push changes):**

```bash
cd ~/Documents/Claude/Projects/Health
git add .
git commit -m "update"
git push
```

That's it.
