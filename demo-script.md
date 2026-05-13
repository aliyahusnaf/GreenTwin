# GreenTwin · 90-Second Demo Script

Total run time: **~90 seconds** at a normal speaking pace (~150 wpm).
Each block has a target time, a screen action, and a script.

---

## 0:00 – 0:07 · Open on the home screen

**On screen:** the home overlay with the two big cards — Planning and Policy Simulation — sitting over the 3D city diorama.

> "This is **GreenTwin** — an AI-powered 3D urban energy and mobility platform for Vietnam.
> Developers and city governments make low-carbon decisions in isolation. GreenTwin gives both sides a shared digital twin to plan and simulate together."

---

## 0:07 – 0:12 · Pick Planning mode

**Action:** Click the **Planning** card. The chatbot panel slides in from the right.

> "Two modes. First — **Planning**, for developers designing low-carbon buildings or EV charging sites."

---

## 0:12 – 0:21 · Place a building

**Action:** Type or quick-reply *"build an office tower"*. AI says "click anywhere on the map." Click an open plot. Camera dives in, building rises out of the ground over ~2.4 seconds.

> "I tell the assistant I want a new tower. It asks where — I click anywhere on the open ground, and the system snaps to the nearest valid site clear of any road. The building rises out of the ground…"

---

## 0:21 – 0:28 · Underground X-ray reveal (NEW)

**Action:** The camera dives to a near-top-down view and the X-ray scan activates. Cyan cable trenches appear *through* the new building's footprint, connecting it to a transformer roughly three units away. Floating tags read "Transformer · 1.0 MW · 22 kV" and "Connection point". A white sweep line traverses the layout.

> "…and the AI immediately **x-rays the subsurface**, locating the nearest transformer feeder, mapping the cable trench, and projecting the building's connection point — all before anyone has to dig up an EVN record or commission a trial-and-error site survey."

---

## 0:28 – 0:36 · Tune the plan with sliders

**Action:** In the chat panel, drag the **Floors** slider from 28 → 34. KPI cards instantly update: GFA goes from ~12,400 m² → ~15,000 m², annual load from 4.2 → 5.1 GWh.

> "Every spec on the KPI cards is **live-tunable**. I drag the floors slider and the assistant immediately recomputes gross floor area, annual load and grid impact — so the developer can find the sweet spot before committing."

---

## 0:36 – 0:55 · The day-cycle solar simulation (the headline feature)

**Action:** Reply *"yes, add solar"*. A bright yellow sun appears in the sky and starts arcing east → south → west. Shadows across the city sweep with it. On the rooftop, 16 ghost cells fill up with a green progress bar as each one tallies "sun hours". A floating HUD shows live time-of-day ("9:00 AM… 10:00 AM…") and a running "12 of 16 cells ≥ 55% sun-hours so far" counter.

> "Now the AI runs a **full-day solar simulation**.
> The sun arcs east to west, every shadow in the city sweeps with it, and each of sixteen panel cells ray-casts toward the moving sun every frame and tallies its **sun-hours**.
> When the day finishes, panels are placed only on cells that received clear sun more than 55% of the day. The four cells permanently shaded by the neighbouring skyscraper are dropped — that's a 25% efficiency gain over a naïve full-roof install. The chat now shows the annual yield, financial payback, and lifetime CO₂ offset, all live-recomputed from the sliders."

---

## 0:55 – 1:03 · Generate the certificate

**Action:** Drag the **Solar coverage** slider briefly to show payback and CO₂ updating. Then click **"Generate Energy Efficiency Certificate"**. A new browser tab opens with a printable certificate showing the project specs, a grade, and a clear disclaimer notice.

> "Once the plan looks good, the developer downloads the **Energy Efficiency Certificate** — a bankable pre-assessment for investors. Note the disclaimer: it's a **starting point** for feasibility, not a substitute for the actual permits from EVN, MoIT, or municipal authorities."

---

## 1:03 – 1:11 · Switch to Policy mode

**Action:** Click *Back to start*, then the **Policy Simulation** card. Quick-reply *"ban non-EV motorcycles"*. AI says click a road. Roads pulse amber. Click Ring Road 1.

> "Now the second mode — for **city governments**. Here, we can simulate a low-carbon mobility policy. For example, I will try to ban non-EV motorbikes — Hanoi's actual Directive 20, starting July 2026 — and click the map to choose the corridor."

---

## 1:11 – 1:26 · The ABM impact simulation

**Action:** Camera swoops down to a low-angle view of the corridor. Phase callouts fade in/out above the road as the 11-second simulation unfolds. Cars flash red one by one, freeze, lift, and disappear. Pollution smog dissipates upward. Trees grow along the curb. Replacement EVs roll in.

> "An **Agent-Based Model** runs on thirty-eight thousand synthetic commuters drawn from Vietnam's household survey. Each gasoline vehicle is flagged and removed; the smog clears; trees grow on the curb to visualize the carbon-equivalent; and replacement EVs roll in.
> Since we use Explainable AI, the AI will then explains the behavioural split that will happen according to the policy and recommends pairing the ban with EVSE sites and a means-tested subsidy."

---

## 1:26 – 1:30 · Close

**On screen:** the impact KPI cards (PM2.5 −22%, CO₂ −14.2 t/day, 640 trees, 12 EVSE sites) in the chat.

> "Planning, policy, evidence — and a bankable certificate at the end. All on one digital twin. That's GreenTwin."

---

## Cheat-sheet for the live demo

| Time | Click / Type | Why |
|------|--------------|-----|
| 0:07 | Click **Planning** card | Enter planning mode |
| 0:12 | Type `build an office tower` (or quick-reply chip) | Trigger building placement |
| 0:17 | Click any open plot (south-center works best) | Trigger 2.4s rise animation |
| 0:21 | **Don't click anything — let the X-ray reveal play** | Camera auto-dives top-down + transformer/cable scan appears (≈2.8s) |
| 0:28 | Drag **Floors** slider 28 → 34 | Show live-tunable KPIs |
| 0:36 | Type `yes` (or *Yes, add solar* chip) | Trigger the 7-second day-cycle solar demo |
| 0:55 | Drag **Solar coverage** slider, then click **Generate Energy Efficiency Certificate** | Open the printable certificate in a new tab |
| 1:03 | Close cert tab → click **Back to start** → **Policy Simulation** card | Switch modes |
| 1:09 | Type `ban non-EV motorcycles` | Activate road-picking |
| 1:11 | Click **Ring Road 1** (amber-pulsing strip near the center) | Trigger 11-second ABM simulation |

## Talking-points if you have extra time

- "The underground x-ray isn't a static lookup — the transformer position and cable routing are computed from the placement coordinates in real time, replacing what would normally be a multi-week EVN coordination process."
- "All solar shading uses real ray-casting against neighbour-building bounding boxes — not a fudged lookup table. The sun arc moves the actual directional light, so every shadow in the city moves with it."
- "Every figure on the certificate is live-recomputed from the sliders — annual yield, financial payback, CO₂ offset, panels installed — no hard-coded numbers."
- "The certificate carries a disclaimer making clear it's an indicative pre-assessment, not a regulatory permit — formal approval still comes from EVN, MoIT, MoNRE."
- "The 640-tree carbon-equivalent number is calibrated to MoNRE Tier-2 emission factors and Vietnam's GHG inventory."
- "Earthy Harmony palette — chosen so the visualization reads as a real urban environment, not a video game."
- "Built on React 19, Three.js, FastAPI, with the Anthropic Claude SDK powering the natural-language XAI reports."
