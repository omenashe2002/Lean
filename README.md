# Lean — your personal fat-loss tracker (v14)

A local-first Progressive Web App that runs on your iPhone home screen.
**All data lives on your device** — no servers, no accounts, nothing leaves your phone.

> Built for one specific user (Or), one specific goal (152 lb → 140 lb by Aug 23, 2026), one specific kit (full gym + pool + tennis + GE CS10G smart scale + Google Fitbit Air).

## v14 changes (June 9, 2026)

- **Food search is now huge**: type any product and get Open Food Facts matches (~3M foods) alongside the local DB; everything you pick is cached for offline. Favorites (★), recents, copy-yesterday, one-tap re-log, and saved meal templates.
- **📷 AI photo logging**: snap a meal, Claude estimates each item's grams + macros, you edit, log. Set your Anthropic API key in More → AI features (stays on-device, ~$0.002/photo).
- **🧭 Coach**: tap Coach on Today for a weekly report — week grade, measured TDEE, plateau/diet-break detection, losing too fast/slow with one-tap calorie-rate fixes, and an optional AI-written check-in.
- **Exercise library 74 exercises with photo demonstrations** (animated start↔end position), equipment + muscle tags, searchable browser, swap any exercise mid-workout (⇄), per-exercise history charts (top set + e1RM), weekly sets-per-muscle vs the 12–20 target, HRV-triggered deload button, PR confetti.
- **Apple Health bulk import**: drop the export.zip straight in (More → Data) — weight, BF%, RHR, HRV, sleep, steps, SpO₂. Manual entries never overwritten. Your Fitbit Air data arrives via Google Health → Apple Health sync.
- Polish: tap any chart point for values, animated counters, smarter offline caching of demo photos.

## v2 changes (May 23, 2026)

- **Calorie math fixed.** v1 mislabeled the activity-level field as "outside of training," so picking "moderate" while training 6×/week gave a 1500 kcal target. The fix: standard Mifflin-St Jeor multipliers (which include exercise) + auto-bump to "very active" when you select 5–6 training days. Correct target for 152 lb, 5'10", 6×/wk = **~2360 kcal/day**.
- **Imperial units everywhere.** Pounds, feet-and-inches. Toggle to metric anytime in Profile.
- **Body Progress page** with a morphing silhouette (changes shape by your scale's body-fat %), 28-day weight + BF% trends, composition snapshot (BF, lean mass, muscle mass, water, visceral fat, BMI), and recovery (RHR, HRV, sleep).
- **Body fat + scale tracking.** All 8-electrode metrics from your GE CS10G: BF%, muscle mass, water, visceral, bone. Lean mass auto-calculated.
- **CSV importer** under Body → Import. Paste or drop a CSV from your scale app, Fitbit/Google Health export, Withings, Renpho — auto-detects columns, previews, then bulk-imports.
- **Visual polish.** New typography hierarchy, gradient accents, tile-based stat cards, refined nav, smooth modal animations, proper segment controls.

---

## What's in this folder

```
index.html               ← the entire app (~330 KB)
manifest.webmanifest     ← PWA install metadata
service-worker.js        ← offline caching
icon-180.png             ← Apple touch icon
icon-192.png             ← Android/PWA icon
icon-512.png             ← Splash / large icon
SPEC.md                  ← Product + technical spec with research citations
README.md                ← This file
```

---

## Install on your iPhone (3 minutes)

The app needs to be served over HTTPS for the service worker to work. Pick one of the four paths:

### Path A — GitHub Pages (free, recommended)

1. Create a new public GitHub repo (e.g., `lean-app`).
2. Upload everything in this folder.
3. Repo Settings → Pages → Source: `main` branch, `/ (root)`.
4. Wait 1–2 minutes. GitHub gives you a URL like `https://yourname.github.io/lean-app/`.
5. Open that URL in **Safari** on your iPhone.
6. Tap the Share icon → **Add to Home Screen** → tap **Add**.
7. The "Lean" icon appears on your home screen. Tap it — it opens full-screen, works offline.

### Path B — Netlify Drop (60 seconds, no account)

1. Go to <https://app.netlify.com/drop>.
2. Drag this whole folder onto the page.
3. You get an instant HTTPS URL.
4. Open it in Safari → Share → **Add to Home Screen**.

### Path C — Vercel (also free)

`npx vercel deploy` from this folder, then follow steps 5–7 above.

### Path D — Cloudflare Pages

Same flow as GitHub Pages. Connect repo or drag-drop.

> **Why not just open the file directly?** Safari restricts service workers to HTTPS origins. You can still open `index.html` in any browser to play with it (no offline support, but full functionality).

---

## First-run setup (90 seconds)

Onboarding asks for:
1. **Profile** — name, sex, DOB, height
2. **Starting point** — current weight, activity level
3. **Goal** — goal weight, goal date (defaults to Sep 21, 2026), target rate (0.5–1.0%/wk)
4. **Training** — days per week (5 or 6)

Equipment is preset (full gym + pool + tennis + cardio). Change anything later in **More → Edit profile**.

---

## Daily flow

**Morning (15 sec):**
- Open the app → tap the weight field on Today → enter today's weight → Save.

**At the gym:**
- Tap **Workout** → tap an exercise → log weight, reps, RPE for each set (pre-fills with your last loads + the app's progressive overload suggestion) → tap **Save sets** → next exercise.
- Cardio? Tap **+ Cardio** to log pool, tennis, HIIT, etc.
- Finish: tap **Mark workout complete**.

**During the day:**
- Tap **Food** → **+ Add** → search a food (200+ common foods bundled) → set serving size → log.
- For something not in the database: use the **Quick custom** form (just name + macros).

**Evening (30 sec, optional):**
- Tap **Body** → fill in RHR, HRV, sleep hours, steps from your Fitbit Air's Google Health app → **Save**.

---

## The health score (0–100)

Updates live based on the last 7 days. Tap **More → Health-score breakdown** to see each component:

| Component | Weight | What it measures |
|---|---|---|
| Trend alignment | 25% | 14-day weight regression slope vs. your target |
| Protein adherence | 15% | % of days hitting your protein floor |
| Calorie adherence | 10% | % of days within ±15% of target |
| Training adherence | 20% | Sessions completed vs. planned |
| Sleep | 10% | 7-day avg, peaks at 7.5h |
| Steps | 5% | 7-day avg vs. 8000 step floor |
| HRV trend | 10% | Last 7 days vs. 28-day baseline (z-score) |
| RHR trend | 5% | Last 7 days vs. 28-day baseline (lower = better) |

---

## Getting data in: scale + Fitbit Air

A PWA can't open Bluetooth to your scale or read Apple HealthKit directly — those are native-app APIs. So the data flow has two reliable paths:

**Path 1 — Manual daily entry (~30 sec/day):**
- Step on the GE scale → look at its app → type into Body → Log Today
- Glance at Google Health → type RHR, HRV, sleep, steps
- This is what gives you the day-by-day rhythm and the up-to-date health score

**Path 2 — Bulk CSV import (weekly catch-up):**
- GE scale app → settings → Export → CSV
- Google Health app → Profile → Export Data → ZIP (contains CSV files)
- Open Lean → Body → Import → drag in the file → Preview → Import
- The importer auto-detects the column names, the unit system (lb vs kg), and the date format. It handles GE, Withings, Renpho, Fitbit, and Google Health exports.

**Path 3 — Auto-sync (1–2 day add-on if you want it):**
- Wrap this same PWA in Capacitor → real iOS app with HealthKit read access → scale + Fitbit data flow in automatically
- You'd still need an Apple Developer account for App Store install, but personal "sideload" provisioning works without one for a single device

> **The Fitbit Air launches on shelves May 26, 2026.** Once you have it, set it up with the Google Health app, enable Google Health → Apple Health sync (Connections → Apps → Apple Health), and you have a single source of truth for HR/HRV/sleep/steps that the importer can pull from.

---

## Backup your data

**More → Data → Export all data (JSON)** downloads a single file with everything. Save it to iCloud Drive or email it to yourself periodically.

To restore on a new device: install the PWA, then **More → Data → Import JSON backup**.

> **Important:** Browser storage isn't permanent forever. iOS may evict PWA data if you don't open the app for ~7 weeks. Export weekly until you're in the habit.

---

## Customizing

- **Edit profile** (More → Edit profile): change goal, rate, training days
- **Swap today's plan** (Workout → Swap): pick a different day template
- **Seed 14 days of demo data** (More → Data): see what a full week looks like before you have real data

---

## Roadmap (if you want more)

Just ask, and I'll add:

- **v1.1** — Apple Health XML importer (parses the Health export.zip directly)
- **v1.1** — Google Health CSV bulk importer
- **v1.2** — Native iOS wrapper (Capacitor) for live HealthKit sync
- **v1.2** — Full USDA food database (~8000 items, with search)
- **v1.3** — Recipe builder + grocery list export
- **v1.3** — HRV-triggered deload weeks (currently shown in score, not auto-applied)
- **v1.4** — Apple Watch companion (would require native app)

---

## The science

Every algorithm and target in this app traces to a peer-reviewed paper or recognized position stand. See **SPEC.md** for the full bibliography. Key sources:

- **Protein 2.4 g/kg BW**: Helms 2014, ISSN Position Stand 2017
- **Loss rate 0.5–0.75%/wk**: Garthe 2011 (athletes lost LBM at 1.4%/wk, gained LBM at 0.7%/wk)
- **12–20 weekly sets/muscle**: Baz-Valle 2022, Schoenfeld 2017
- **HIIT + MICT cardio mix**: Wewege 2017 (Obesity Reviews)
- **HRV (rMSSD) for readiness**: Esco 2025

---

## Help / questions

- **"My data disappeared"** → iOS evicted your storage. Restore from your last JSON export.
- **"I want a different program"** → Edit the `PROGRAM` block in `index.html` (it's well-commented JS). Or ask me to generate a new split.
- **"The food I want isn't in the database"** → Use Quick custom entry (saves no food record — just the meal). Or ask me to add to the bundled `FOODS` list.

Built locally, runs locally, owned by you.
