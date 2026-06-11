# Personal Health Tracker — Product & Technical Spec

**Owner:** Or
**Goal:** Fat loss (lean out) by end of summer 2026 (~Sep 21, 2026 → ~17 weeks from 2026-05-23)
**Target rate:** Moderate — 0.5–0.75% body weight per week (evidence-based for muscle retention) [4]
**Form factor:** Progressive Web App (PWA), iPhone "Add to Home Screen"
**Data:** Local-first (IndexedDB on-device). Single user. JSON export/import for backup.

---

## 1. Why a PWA (not native iOS)

- No App Store review, no $99/yr developer account, no Mac/Xcode required
- Installs to iPhone home screen, runs full-screen, works offline (service worker)
- Standard `<canvas>`, IndexedDB, and Web APIs cover every feature in scope
- Data lives only on your device — no server, no privacy concerns
- Tradeoffs: cannot read Apple HealthKit directly (would need a native wrapper). We compensate with manual entry + CSV import from Apple Health and Google Health exports.

---

## 2. Device & data ingest plan

### Google Fitbit Air (launched May 7, 2026, on-shelf May 26)
- Screenless tracker, $99–$129. Sensors: optical HR, red/IR for SpO2, skin temp, 3-axis accelerometer, gyro. 7-day battery. Tracks: 24/7 HR, HRV (rMSSD), AFib, SpO2, sleep stages, steps, cardio load, "readiness." [Source: Google blog, 9to5Google, Tech Advisor]
- Pairs with **Google Health app** (replaces Fitbit app). Google Health on iOS supports **Apple Health sync** — bidirectional. [Source: Android Headlines, Google Health support]
- Legacy Fitbit Web API is being deprecated September 2026 and replaced by **Google Health API** (Google OAuth 2.0). [Source: Fitbit Community, Thryve]

**Ingest path for this app (PWA):**
1. **Quick daily (recommended):** Manual entry of 4 numbers: weight (from your scale), RHR, HRV, sleep hours. Takes <15 sec/day.
2. **Bulk import:** Export from Google Health (CSV/JSON archive — takes 3–7 days) or Apple Health (Health app → profile → Export All Health Data → ZIP of XML). The app accepts the Apple Health export.xml and the Google CSV bundle.
3. **Future upgrade path:** If you want hands-free sync, we could later wrap the PWA in a tiny native shell (Capacitor/Expo) that reads HealthKit and writes to the same IndexedDB store. Out of scope for v1.

---

## 3. Evidence base (cited inline; full bibliography at bottom)

| Decision | Evidence |
|---|---|
| Target 0.5–0.75% BW/week loss | Garthe 2011 [4]: 0.7%/wk → +LBM; 1.4%/wk → flat LBM in trained athletes |
| Protein 2.2–2.6 g/kg BW/day | Helms 2014 [2]: 2.3–3.1 g/kg FFM during deficit; ISSN [1] confirms 1.4–2.0 g/kg general, up to 3.1 g/kg in lean hypocaloric resistance trainees |
| 12–20 sets/muscle/week | Baz-Valle 2022 [5]: 12–20 sets is the optimal range for hypertrophy in trained men; Schoenfeld 2017 [6]: dose-response ~0.37%/added set; Bernárdez-Vázquez 2022 [7]: ≥10 sets/week minimum |
| HIIT + moderate-intensity cardio mix | Wewege 2017 [8] and Guo 2023 [9]: HIIT ≈ MICT for fat loss; HIIT modest edge on waist circumference + 40% time-saver |
| Sleep ≥7h | Cappuccio 2008 [10]: short sleep → +55% obesity risk in adults; Kohanmoo 2024 [11]: confirms central obesity link |
| HRV (rMSSD) for readiness | Esco 2025 [12]: near-daily rMSSD + weekly avg + CV is the practical standard; Alfonso 2025 [13]: HRV + RHR + subjective wellbeing best combo |

---

## 4. Core algorithms

### 4.1 TDEE (Mifflin-St Jeor + activity multiplier)
```
BMR (male)   = 10·kg + 6.25·cm − 5·age + 5
BMR (female) = 10·kg + 6.25·cm − 5·age − 161
TDEE         = BMR × activity_multiplier
  sedentary 1.2 | light 1.375 | moderate 1.55 | very 1.725 | extreme 1.9
```

### 4.2 Calorie + macro targets
- **Deficit:** target rate × bodyweight × 7700 kcal/kg / 7 = daily kcal deficit
  - Example: 0.6%/wk × 80 kg × 7700 / 7 ≈ 528 kcal/day deficit
- **Cap:** deficit never exceeds 25% of TDEE (protects training quality + metabolic adaptation)
- **Protein:** 2.4 g/kg BW (within 2.3–3.1 g/kg FFM range — safer to anchor on BW for users without DEXA)
- **Fat:** 0.8–1.0 g/kg BW (hormonal floor)
- **Carbs:** remainder

### 4.3 Adaptive logic (re-calc weekly)
- Compute 7-day weight trend (linear regression slope, not raw delta — avoids water-weight noise)
- If trend slope ≥ target rate → maintain calories
- If trend slope < 50% of target for 2 consecutive weeks → drop calories by 100/day OR add 1 cardio session
- If trend slope > 150% of target → bump calories +150/day (too fast = muscle loss risk)
- If HRV 7-day avg drops >1 SD below 28-day baseline → flag a deload (reduce volume 30% that week)

### 4.4 Health score (0–100, daily)

A weighted composite that's interpretable and modifiable:

| Component | Weight | What it measures |
|---|---|---|
| Trend alignment | 25 | How close 7-day weight trend is to target rate |
| Protein adherence | 15 | % of days last 7 hitting protein floor |
| Calorie adherence | 10 | % within ±10% of target |
| Training adherence | 20 | Sessions completed / sessions planned (last 7) |
| Sleep | 10 | Avg sleep last 7d; 100 at 7.5h, drops linearly outside 6–9h |
| Steps | 5 | Avg vs. 8000 step floor (non-training NEAT) |
| HRV trend | 10 | Last 7-day rMSSD vs. 28-day baseline (penalize >1 SD drop) |
| RHR trend | 5 | Same, inverted |

Each component is normalized to 0–100, then weighted. Sub-scores are shown so you can see which lever to pull.

### 4.5 Goal projection
- "At your current trend, you'll hit X kg by Sep 21, which is Y kg short of your target. To close the gap, options: ① drop calories by N, ② add M cardio sessions/wk, ③ extend timeline by Z weeks."

---

## 5. Training program

### 5.1 Split: 6-day Push/Pull/Legs (PPL) — intermediate-advanced, fat-loss block

Hits 12–20 sets per muscle/week with 2× frequency per muscle group.

| Day | Focus |
|---|---|
| Mon | Push A (chest emphasis) |
| Tue | Pull A (back width emphasis) |
| Wed | Legs A (quad emphasis) |
| Thu | Push B (shoulder emphasis) + optional pool 20-min Z2 |
| Fri | Pull B (back thickness + biceps) |
| Sat | Legs B (posterior chain) |
| Sun | Active recovery: tennis OR pool 30–45 min Z2 |

### 5.2 Cardio overlay (uses your pool + tennis)
- **2× MICT/week** (Zone 2: ~60–70% HRmax) — pool laps or steady bike — 25–40 min. Better for recovery in a deficit.
- **1× HIIT/week** — 6×30s @ near-max, 90s easy. Treadmill, bike, or rower. Bigger waist-circumference benefit per minute [8][9].
- **Tennis** counts as cross-training; logged as steady-state cardio with intensity zone you select.

### 5.3 Daily workout generator
- Pulls from an exercise library tagged by movement pattern, equipment, primary/secondary muscles
- Rotates exercises week-over-week to prevent staleness while keeping a stable "core" lift each day (bench, squat, deadlift, OHP, row, pull-up)
- Auto-progresses load: if previous session hit top of rep range with RPE ≤8 → +2.5 kg next time
- Reduces volume 30% on deload weeks (every 5–6 weeks, or HRV-triggered)
- You can swap any exercise; the app remembers your preferences

### 5.4 Session logging
- Pre-filled with last session's loads and reps
- Log: weight, reps, RPE (1–10) per set
- Marks "completed" when ≥80% of planned sets logged
- Surfaces: PRs, total volume, comparison to last week

---

## 6. Food log

### 6.1 Entry methods
1. **Search** — local food database (USDA SR Legacy subset, ~8000 common foods, bundled in-app — no network)
2. **Quick custom** — name + kcal + protein/carb/fat, saved for re-use
3. **Recipes** — build once, reuse (totals macros)
4. **Voice / paste** — paste a meal description; app parses (rule-based, no LLM call in v1)

### 6.2 Display
- Day view: total kcal + macros vs. target with progress bars
- Week view: avg adherence, hits/misses
- Per-meal breakdown

---

## 7. Data model (IndexedDB schema)

```
profile:        { id, name, sex, dob, height_cm, weight_kg_start, goal_kg, goal_date,
                  activity_level, training_days_per_week, equipment[], goal_rate_pct }
weights:        [{ date, kg, source: 'manual'|'scale'|'fitbit' }]
biometrics:     [{ date, rhr, hrv_rmssd, sleep_hours, sleep_score, spo2, skin_temp_delta }]
steps:          [{ date, count, distance_km, active_minutes }]
workouts:       [{ id, date, type, planned_exercises[], logged_sets[],
                   rpe_avg, duration_min, calories_est, completed }]
exercises_lib:  [{ id, name, pattern, primary[], secondary[], equipment[], notes }]
foods_lib:      [{ id, name, brand, serving_g, kcal_per_100g, p, c, f, fiber }]
meals:          [{ id, date, meal_type, items:[{food_id|custom, grams, kcal, p, c, f}] }]
custom_foods:   [{ id, name, serving_g, kcal, p, c, f }]
recipes:        [{ id, name, items[], yields }]
settings:       { units, theme, notifications, last_export }
```

---

## 8. Screens (information architecture)

1. **Today** (default) — health score, today's workout (start button), today's macros (log button), today's weigh-in (single input), 7-day trend sparkline
2. **Workout** — today's plan, exercise-by-exercise log, "swap" affordance, RPE input, finish + summary
3. **Food** — add meal, search foods, custom/recipe, day totals
4. **Body** — weight + biometric entry, trend chart (with regression line + target line), HRV/RHR/sleep trends
5. **Program** — week view, swap days, deload status, regenerate
6. **Dashboard** — health score breakdown, goal projection, adherence heatmap (last 28 days)
7. **Data** — import (Apple Health XML, Google Health CSV, Fitbit CSV), export (full JSON backup), profile/settings

---

## 9. Build tech

- Single-file `index.html` with inline CSS and vanilla JS modules (no build step → easy to host anywhere, no toolchain rot)
- `manifest.webmanifest` (PWA install)
- `service-worker.js` (offline cache)
- IndexedDB via thin wrapper (`idb` library inlined)
- Chart.js (inlined or via CDN with fallback) for trend visuals
- Hosting options: open the file from disk via Safari (works for testing), or push to a static host (GitHub Pages, Netlify, Vercel — all free) to install as PWA

---

## 10. Roadmap

**v1 (today's build):**
- Onboarding (profile + goal → auto-computed TDEE + targets)
- Today dashboard with health score
- Workout: PPL generator, log, adaptive progression
- Food: search + custom + macros vs target
- Body: weight + biometrics entry, trend chart
- Data: JSON export/import
- PWA install (manifest + SW)
- Bundled USDA food subset (~300 of the most common foods to keep file small; expandable)

**v1.1 (next iteration if you want):**
- Apple Health XML importer (parses the export.zip)
- Google Health CSV importer
- Apple HealthKit native bridge via Capacitor (real iOS app, optional)
- More foods (full USDA, ~8000)
- Recipe builder
- Notifications

---

## v16 changelog (2026-06-10) — F&F feedback release

- **Food bank**: barcode cascade OFF → USDA FDC (gtinUpc zero-padded to 13/14 digits — the trick for US products); text search merges local + OFF + FDC (badged); FDC key in settings ('fdc_key', DEMO_KEY default, personal key via More → Integrations); built-in staples lazily self-enrich micros from FDC on first pick (settings 'staple_micros' cache).
- **Micronutrients**: 19-nutrient `micro` object (per-100g on foods, per-portion on meals) across every log path incl. photo-AI (7 core estimated); MICROS table with NIH RDA/AI by sex, target vs limit semantics; collapsible daily panel in Food with %-bars, Today/7-day-avg toggle, coverage indicator.
- **Schedule**: month calendar modal (planned label/day, completion ticks, missed dimming, month nav, monthly counts, tap-to-open) + full program overview (all 7 days × exercises with thumbs, meso context). Links under the week strip.
- **Custom metrics**: DB v4 adds `metric_entries` store (profile-scoped, in backups); defs in settings 'custom_metrics'; 12 presets; Body → Metrics tab with sparklines; detail modal (chart, upsert-by-date logging, history, delete).
- **Device bridge**: `#hd=` URL-fragment receiver (k:v pairs, unit-aware weight, range-validated, fill-only — manual always wins) + guided iOS Shortcut setup + test injection. Fitbit Air → Google Health → Apple Health → Shortcut → app.
- **Spotify**: playlist deep links for all; optional PKCE OAuth (user Client ID in settings, redirect = app URL, tokens in settings 'spotify_tokens' w/ auto-refresh) for now-playing + prev/play-pause/next via Spotify Connect (Premium). Music card in Workout.
- **Art direction (Nike pass)**: matte near-black (#09090b), single ember accent #ff5e1f (pink/violet eliminated incl. rings/charts/comp-bar/icon), neutral grays, emoji purged from all chrome (achievements/confetti retained), heavier numerals (hero 42/800, jumbo 58/800, tiles 24/800), r 16/11, flat tiles, restrained Apple-gray light theme. SW v9.

## v15 changelog (2026-06-09) — visual redesign
- Flame-coral design system: all colors tokenized in :root; full light theme via `prefers-color-scheme` + manual override (`html[data-theme]`, More → Appearance, stored in settings `theme`).
- New tokens: --accent-rgb, --on-accent, --glow-*, --nav-bg, --ring-track, --mm-*, --tile-*, --hero-bg; JS SVG (rings, muscle map) now uses style-attr CSS vars so both themes render correctly.
- New flame app icon (logo.svg source, icons re-rendered); manifest colors #0d0f1e; dynamic meta theme-color.
- SW cache v7.

## v14 changelog (2026-06-09) — "best it can be" release

### Food
- **Online food search**: Open Food Facts (~3M products) merged into search with offline caching of every food you pick; barcode flow unchanged. Results badge ONLINE; picked items become local custom foods.
- **Favorites** (★ on any result, max 30) + recents chips; **copy yesterday** + per-meal re-log; **meal templates** stored in the `recipes` store (save from Build tab, one-tap reload).
- **Photo food logging (AI)**: 📷 AI tab — photo → Claude vision (Haiku 4.5 default / Sonnet 4.6 optional) → editable per-item grams/kcal/macros → log as one meal or separately. Needs user's own Anthropic API key (More → AI features; stored only in IndexedDB, sent only to api.anthropic.com via CORS direct-browser access).

### Coach 2.0
- `computeCoachReport()`: week grade (rate-vs-target 40%, protein 20%, training 20%, logging 20%), measured TDEE, plateau detection (3-wk flat trend + logged intake), diet-break suggestion after ≥8 wks (MATADOR), HRV-triggered deload, rate too-fast/too-slow with one-tap goal-rate adjustment (clamped 0.4–1.0%/wk).
- Entry points: 🧭 Coach button on Today + auto "top call" card when an actionable rec exists. Optional AI-written narrative via same key.

### Training
- **Exercise library: 74 exercises** (was 41), each with equipment, primary+secondary muscles, form cues, tempo, mistakes, and **demonstration photo pairs** (free-exercise-db, public domain) animated start↔end; offline-cached by SW after first view (`lean-img-v1`, LRU 400).
- Library browser (Workout → Library) with muscle filter + search; **exercise swap** (⇄ on any card, same-primary-muscle alternatives, session-scoped); **exercise history** (top-set chart, e1RM Epley, recent sessions); **weekly volume per muscle** vs 12–20 sets (secondary counts ½, Baz-Valle 2022); **HRV deload banner** (z < −1 → one-tap deload = meso week 5); PR confetti.

### Apple Health import
- export.zip (streamed unzip via fflate) or export.xml; chunked regex parse handles multi-hundred-MB files. Types: BodyMass (unit-aware), BodyFatPercentage (fraction→%), RestingHeartRate, HRV SDNN (→ hrv_rmssd field; baselines are self-relative so trends stay valid — documented caveat), StepCount (max-per-source per day to avoid phone+watch double count), SleepAnalysis (sums Asleep* stages to wake-date, ignores InBed/Awake), OxygenSaturation. Existing manual entries always win; imports only fill gaps.

### Infra/UX
- SW v6: persistent runtime caches (exercise images + CDN libs), network-only for api.anthropic.com/openfoodfacts; version-bump cache nuking preserves persistent caches.
- Chart tap-tooltips, hero-score count-up, staggered card entrances, prefers-reduced-motion support, week-strip labels fixed for non-PPL programs.
- New settings helpers (getSetting/setSetting) on the `settings` store: `anthropic_key`, `ai_model_pref`, `fav_foods`.

---

## Bibliography

1. [International Society of Sports Nutrition Position Stand: protein and exercise](https://consensus.app/papers/details/d37a061294705590aca659c3d19807c3/) — Jäger et al., 2017 (865 citations, JISSN)
2. [A systematic review of dietary protein during caloric restriction in resistance trained lean athletes](https://consensus.app/papers/details/bf17a203d21e555a951c4809f9baf9e7/) — Helms et al., 2014 (IJSNEM)
3. [High protein intakes during energy restriction in recreational athletes](https://consensus.app/papers/details/6f364fb29f125a9fa9865e8828f8fe10/) — Kanaan et al., 2025 (Eur J Clin Nutr)
4. [Effect of two different weight-loss rates on body composition and strength in elite athletes](https://consensus.app/papers/details/11cbad8cc1e2562596bf1e1ffbddb887/) — Garthe et al., 2011 (IJSNEM)
5. [A Systematic Review of The Effects of Different Resistance Training Volumes on Muscle Hypertrophy](https://consensus.app/papers/details/d82bc2b70af65cea97f69cdebc6ab92a/) — Baz-Valle et al., 2022 (J Hum Kinetics)
6. [Dose-response relationship between weekly resistance training volume and muscle mass](https://consensus.app/papers/details/0fec06fa365f5224b7c53cd5acdd007d/) — Schoenfeld et al., 2017 (J Sports Sci)
7. [Resistance Training Variables for Optimization of Muscle Hypertrophy: An Umbrella Review](https://consensus.app/papers/details/ecd39e3d22c25a63ba2d7ed3f1a3af61/) — Bernárdez-Vázquez et al., 2022 (Front Sports Active Living)
8. [HIIT vs MICT on body composition in overweight/obese adults: meta-analysis](https://consensus.app/papers/details/3080231570cc5d0da72d91801b5f7335/) — Wewege et al., 2017 (Obesity Reviews)
9. [HIIT vs MICT on Fat Loss and Cardiorespiratory Fitness: Systematic Review and Meta-Analysis](https://consensus.app/papers/details/06d64a022b135bfbba772ff16bf50d84/) — Guo et al., 2023 (IJERPH)
10. [Meta-analysis of short sleep duration and obesity in children and adults](https://consensus.app/papers/details/2a14a1e9612153eba952f84007464589/) — Cappuccio et al., 2008 (Sleep)
11. [Short sleep duration and central obesity: meta-analysis of prospective cohort studies](https://consensus.app/papers/details/c22f614891ad5316b7a428bcbce31898/) — Kohanmoo et al., 2024 (Obesity Sci & Practice)
12. [Monitoring Training Adaptation and Recovery Using HRV via Mobile Devices: Narrative Review](https://consensus.app/papers/details/a674d22b9e845190918c14399a23fa57/) — Esco et al., 2025 (Sensors)
13. [Individual training prescribed by HRV, HR, and well-being in experienced cyclists](https://consensus.app/papers/details/cb1ea722f2d75d80833029fc39159a81/) — Alfonso et al., 2025 (Sci Reports)

**Web sources (Fitbit Air, ingest path):**
- [Introducing the new Google Fitbit Air](https://blog.google/products-and-platforms/devices/fitbit/fitbit-air/) — Google blog
- [Google announces $99 Fitbit Air for screen-less all-day tracking](https://9to5google.com/2026/05/07/fitbit-air-launch/) — 9to5Google
- [Google Fitbit Air: Release Date, Price, Specs & Features](https://www.techadvisor.com/article/3133758/google-fitbit-air-release-date-price-specs-features.html) — Tech Advisor
- [Google Health app works with Apple Health on iOS](https://www.androidheadlines.com/2026/05/the-new-google-health-app-works-with-apple-health-because-google-wants-your-iphone-data-too.html) — Android Headlines
- [Fitbit API Deprecation: What the Google Health API Means](https://www.thryve.health/blog/fitbit-api-deprecation) — Thryve
