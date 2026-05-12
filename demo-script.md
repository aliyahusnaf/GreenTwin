# GreenTwin · 90-Second Demo Script

Total run time: **~90 seconds** at a normal speaking pace (~150 wpm).
Each block has a target time, a screen action, and a script.

---

## 0:00 – 0:10 · Open on the home screen

**On screen:** the home overlay with the two big cards — Planning and Policy Simulation — sitting over the 3D city diorama.

> "This is **GreenTwin** — an AI-powered 3D urban energy and mobility platform for Vietnam.
> Vietnam wants to decarbonize, but developers and city governments make decisions in isolation. GreenTwin gives both sides a shared digital twin to plan and simulate together."

---

## 0:10 – 0:20 · Pick Planning mode

**Action:** Click the **Planning** card. The chatbot panel slides in from the right.

> "GreenTwin has two modes. The first is **Planning** — for developers and infrastructure teams designing low-carbon buildings or EV charging sites."

---

## 0:20 – 0:32 · Place a building

**Action:** Type or quick-reply *"build an office tower"*. AI says "click anywhere on the map." Move cursor — the outline ring follows. Click an open plot. Camera dives in, building rises out of the ground over ~2.4 seconds. KPI cards populate.

> "I tell the assistant I want to build an office tower. It asks where — I click anywhere on the map and the system snaps to the nearest valid site away from roads. The building rises and the AI reports floor count, gross floor area, and the 4.2 GWh-per-year load this tower adds to the district."

---

## 0:32 – 0:55 · The day-cycle solar simulation (the headline feature)

**Action:** Reply *"yes, add solar"*. A bright yellow sun appears in the sky and starts arcing east → south → west. Shadows across the entire city visibly sweep with it. On the rooftop, 16 ghost cells fill up with a green progress bar as each one tallies "sun hours". A floating HUD shows live time-of-day ("9:00 AM… 10:00 AM…") and a running "12 of 16 cells ≥ 55% sun-hours so far" counter.

> "Now the AI runs a **full-day solar simulation**.
> Watch — the sun arcs east to west, the directional light follows, and every shadow in the city sweeps with it. On the roof, each of sixteen panel cells ray-casts toward the moving sun every frame and tallies its **sun-hours**.
> When the day finishes, panels are placed only on cells that received clear sun more than 55% of the day. The four cells permanently shaded by the neighbouring skyscraper are dropped — that's a 25% efficiency gain over a naïve full-roof install."

---

## 0:55 – 1:05 · Switch to Policy mode

**Action:** Click *Back to start*, then the **Policy Simulation** card. Quick-reply *"ban non-EV motorcycles"*. AI says click a road. Two amber-pulsing roads appear. Click Ring Road 1.

> "The second mode is for **city governments**. I tell it to ban non-EV motorbikes — a real policy Hanoi is enacting under Directive 20 starting July 2026 — and click a corridor to apply it."

---

## 1:05 – 1:25 · The ABM impact simulation

**Action:** Camera swoops down to a low-angle view of the corridor. Phase callouts fade in/out above the road as the 11-second simulation unfolds. Cars flash red one by one, freeze, lift, and disappear. Pollution fog dissipates upward. Trees grow along the curb. Replacement EVs roll in.

> "Now the **Agent-Based Model** runs on thirty-eight thousand synthetic commuters drawn from Vietnam's household survey data. Each gasoline vehicle on this corridor is flagged and removed; the smog clears; six-hundred-and-forty trees grow on the roadside to visualize the carbon-equivalent reduction; and replacement EVs roll onto the now-clean street.
> The AI then explains the behavioral split — 38% switch to e-motorbikes, 19% to BRT, 11% face mobility exclusion — and recommends pairing the ban with twelve new EVSE sites and a means-tested subsidy."

---

## 1:25 – 1:30 · Close

**On screen:** the impact KPI cards (PM2.5 −22%, CO₂ −14.2 t/day, 640 trees, 12 EVSE sites) in the chat.

> "Planning, policy, evidence — all on one digital twin. That's GreenTwin."

---

## Cheat-sheet for the live demo

| Time | Click / Type | Why |
|------|--------------|-----|
| 0:10 | Click **Planning** card | Enter planning mode |
| 0:20 | Type `build an office tower` (or use the quick-reply chip) | Trigger building placement |
| 0:25 | Click any open plot (NE or south-center area works best) | Trigger 2.4s rise animation |
| 0:34 | Type `yes` (or click the *Yes, add solar* chip) | Trigger the 7-second day-cycle solar demo |
| 0:55 | Click **Back to start**, then **Policy Simulation** card | Switch modes |
| 1:00 | Type `ban non-EV motorcycles` | Activate road-picking |
| 1:05 | Click **Ring Road 1** (the highlighted amber strip nearer the center) | Trigger 11-second ABM simulation |

## Talking-points if you have extra time

- "All shading uses real ray-casting against neighbour-building bounding boxes — not a fudged lookup table."
- "The 640-tree number is calibrated to MoNRE Tier-2 emission factors and Vietnam's GHG inventory."
- "Earthy Harmony palette — chosen so the visualization reads as a real urban environment, not a video game."
- "Built on React 19, Three.js, FastAPI, with the Anthropic Claude SDK powering the natural-language XAI reports."
