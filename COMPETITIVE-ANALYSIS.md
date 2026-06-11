# Lean v16 — Competitive Analysis (June 2026)

Benchmarked against the category leaders: **Strong / Hevy / Boostcamp / Fitbod** (training), **MacroFactor / Cronometer / MyFitnessPal** (nutrition), **Whoop / Oura** (recovery), plus 2026 AI-coach trendline (MFP AI Coach, Cal AI, Simple Avo).

## 1 · What they have that Lean doesn't

### Training (Strong/Hevy-class in-gym UX) — biggest gap cluster
| Gap | Who has it | Cost to build | Value |
|---|---|---|---|
| **Supersets** (pair exercises, smart scrolling) | Hevy, Strong | M | High — standard for intermediate lifters |
| **Warm-up set calculator** (% of working weight) | Hevy, Strong | S | High — used every heavy session |
| **Auto rest timer** (starts on set completion, per-exercise default) | Hevy, Strong, Fitbod | S | High — ours is manual-start |
| **Set types** (warm-up / drop / failure tags, excluded from volume) | Hevy, Strong | S | Med |
| **Session duration** (live timer, logged per workout) | All | S | Med |
| **Custom program authoring** (build your own multi-week routine) | Boostcamp (11k programs), Hevy | L | High — we have 6 fixed programs + per-session swaps only |
| AI-generated personalized program | Fitbod, Boostcamp Pro | M (we have AI infra) | High |
| Apple Watch companion / live HR | Strong, Fitbod, Whoop | Native-only | Roadmap (Capacitor wrapper) |
| Social feed / sharing / leaderboards | Hevy | — | **Deliberately out** — Lean is private-by-design |

### Nutrition (MacroFactor/Cronometer-class)
| Gap | Who has it | Cost | Value |
|---|---|---|---|
| **Nutrition trend charts** (intake vs target over weeks, weight overlay) | MacroFactor dashboards | S | High — we compute it, never chart it |
| **AI text/voice quick-log** ("chicken wrap and a coke" → parsed meal) | MFP AI Coach, Simple Avo, 2026 standard | S (AI infra exists) | High — fastest possible logging |
| 84-nutrient depth | Cronometer (we track 19) | M (data, not code) | Low for fat-loss use case |
| Verified/lab-analyzed data badging | Cronometer | — | Partial via USDA badge |
| Scheduled refeeds / diet-break periodization UI | MacroFactor | M | Med — coach suggests, doesn't schedule |

### Recovery / coaching (Whoop-class)
| Gap | Who has it | Cost | Value |
|---|---|---|---|
| Daily strain target ("today take it easy / push") | Whoop | S | Med — we have recovery score, no daily directive |
| Sleep coach (recommended bedtime) | Whoop | S | Low-med |
| Behavior journal → recovery correlations | Whoop | L | Low for v1 |
| **Conversational AI coach (chat over your data)** | MFP AI Coach, Avo (2026 trend) | M | High — we have one-shot narrative only |
| Push-notification reminders | All native apps | Blocked (iOS PWA needs push server) | Shortcut automation partially covers |

## 2 · What Lean has that they don't
- **The full stack in one app** — measured TDEE (MacroFactor's killer feature) + micros (Cronometer-lite) + evidence-based training with mesocycles (Boostcamp-class) + HRV recovery & deload logic (Whoop-lite) + progress photos. Every competitor silos 1-2 of these behind separate $60-100/yr subscriptions; the combined equivalent stack is ~$200+/yr.
- **Radical privacy** — no account, no server, data never leaves the device. No competitor offers this.
- **$0 forever** vs Hevy $24/yr, MacroFactor $72/yr, Fitbod $80-96/yr, Whoop $199-359/yr.
- **BYO-AI transparency** — photo logging + coach run on the user's own API key (~$0.002/photo); MFP charges $25/mo for the same.
- **Dual-source barcode** (OFF + USDA with GTIN normalization) — most apps use one.
- **Evidence citations in-product** (Helms, Garthe, Baz-Valle, MATADOR) — nobody does this.
- **Offline exercise demos**, multi-profile per device, vendor-free device bridge, exportable JSON you own.

## 3 · Recommended build (this release)
**In-workout pack**: supersets + warm-up calculator + auto rest timer w/ per-exercise defaults + set types + session duration — closes the entire Strong/Hevy UX gap.
**AI quick-log**: type/dictate a meal description → parsed entry with macros+micros.
**Nutrition trends**: 30-day intake vs target chart with weight-trend overlay in Food.
**AI program generator**: goals/equipment/days → personalized program saved alongside the built-ins (Fitbod/Boostcamp value, our infra).

Deferred with reasons: social (anti-goal), push notifications (architecturally blocked in iOS PWA), Watch app (needs native wrapper), 84 micros (low ROI), journal correlations (needs months of data).

## Sources
- [Vora: Best strength training apps 2026](https://askvora.com/blog/best-strength-training-apps-2026) · [Boostcamp vs Fitbod](https://www.boostcamp.app/alternatives/fitbod) · [Hevy feature list](https://www.hevyapp.com/features/) · [Hevy workout settings](https://help.hevyapp.com/hc/en-us/articles/33882110558743-Workout-Settings-Preferences-Timer-Warm-up-calculator-Plate-Calculator-Smart-Superset-Scrolling)
- [AI Fit Hub: MacroFactor vs Cronometer 2026](https://aifithub.io/articles/macrofactor-vs-cronometer-2026/) · [NutriScan comparison](https://nutriscan.app/blog/posts/macrofactor-vs-cronometer-2026-62a278ee64) · [kcalm: calorie app comparison](https://www.kcalm.app/blog/best-calorie-tracking-apps-comparison/)
- [Whoop: how it works](https://www.whoop.com/us/en/how-it-works/) · [Whoop vs Oura 2026](https://healnourishgrow.com/whoop-vs-oura/) · [the5krunner Whoop 5.0 review](https://the5krunner.com/2025/10/31/2026-whoop-5-0-mg-review-discount-accuracy-strain-recovery-athletes/)
- [MFP AI Coach launch](https://finance.yahoo.com/sectors/healthcare/articles/myfitnesspal-introduces-ai-coach-deliver-130000257.html) · [Orangesoft: AI in fitness 2026](https://orangesoft.co/blog/ai-in-fitness-industry) · [Welling: best AI fitness apps](https://www.welling.ai/articles/best-ai-fitness-apps)
