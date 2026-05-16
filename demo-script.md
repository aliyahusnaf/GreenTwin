# GreenTwin · ~2.5-Minute Demo Script

Total run time: **~2:30** at a normal speaking pace (~150 wpm).
Each block has a target time, a screen action, and a script.

---

## 0:00 – 0:05 · Open on the home screen

**On screen:** the home overlay with the two big cards — Planning and Policy Simulation — sitting over the 3D city diorama.

> "We present **GreenTwin** — an AI urban energy digital twin for Vietnam."

---

## 0:05 – 0:18 · Place a building

**Action:** Click the **Planning** card → quick-reply *"build an office tower"* → click an open plot. Camera dives in, building rises (~2.4 s). X-ray scan activates: cyan cable trenches connect to a transformer, floating tags read "Transformer · 1.0 MW · 22 kV".

> "First is planning mode, for developers designing low-carbon buildings and EV charging sites — I ask for a tower. As it rises, the AI **x-rays the subsurface** and maps the nearest grid connection point."

---

## 0:18 – 0:23 · Tune the plan with sliders

**Action:** Drag the **Floors** slider 28 → 34. KPI cards update: GFA ~15,000 m², annual load 5.1 GWh.

> "We can tune the building's specs — floors and solar coverage — and see the KPIs recompute live."

---

## 0:23 – 0:34 · Day-cycle solar simulation

**Action:** Quick-reply *"yes, add solar"*. Sun arcs east → west, shadows sweep the city, 16 rooftop cells tally sun-hours. 4 cells are dropped (shaded by the neighbouring tower).

> "We can also add rooftop solar panels and run a simulation to find their optimal placement. From this result, four cells shaded by neighboring buildings get dropped, giving 25% better yield than a naïve full-roof install."

---

## 0:34 – 0:38 · Generate the building certificate

**Action:** Click **"Generate Energy Efficiency Certificate"**. Certificate opens in a new tab.

> "With one click, we can generate a pre-assessment certificate for the developer."

---

## 0:38 – 0:45 · Place an EVSE + X-ray reveals a grid constraint

**Action:** Click **"Another EVSE site"** quick-reply → click open area near a road (north-east works well). EVSE canopy rises (~2.4 s). X-ray scan activates: cable trenches connect to the same transformer. The AI message appears:

> *"Subsurface mapped. EVSE site is live — 8 fast chargers (150 kW). Peak load 1.2 MW exceeds the local transformer (1.0 MW). I've pre-sized a 540 kWh BESS to absorb the spike. Want a solar canopy on top to power it cleanly?"*

KPI cards show: **Chargers 8 × 150 kW · Peak load 1.2 MW · BESS 540 kWh · Grid risk: Mitigated**.

> "We can also simulate EV charging site placement. Here, the AI detects that peak load **exceeds the transformer capacity** and automatically pre-sizes a BESS to mitigate it ."

---

## 1:26 – 1:34 · Show the BESS slider live-protecting the grid

**Action:** Drag the **Chargers** slider from 8 → 12. Peak load jumps to 1.8 MW, and if BESS stays at 540 kWh, Grid risk flips to **Constrained**. Then drag the **BESS** slider up to 900 kWh — Grid risk flips back to **Mitigated**.

> "Watch what happens when I scale up to twelve chargers — peak load hits 1.8 MW and the BESS is no longer enough. I drag the battery slider up to 900 kWh and it's mitigated again. The developer sees this trade-off in seconds, not after a six-week EVN coordination process."

---

## 1:34 – 1:52 · Solar canopy simulation on the EVSE

**Action:** Drag the **Chargers** slider back to 8 and **BESS** back to 540 kWh. Click the **"Yes, add solar"** quick-reply. The day-cycle solar simulation runs on the canopy cells.

> "Now I add the solar canopy. The same day-cycle simulation runs — sun arcs east to west, each cell tallies its sun-hours. 40 cells are skipped because they're shaded by the nearby warehouse cluster. The result: **320 panels**, **118 MWh per year** — covering 34% of the station's charging energy directly. The BESS and grid handle the rest."

**On screen after simulation:** KPI cards show **Panels 320 · Yield 118 MWh/yr · Cells skipped 4 (shade) · CO₂ avoided 1.9 kt**.

---

## 1:52 – 2:00 · Generate the EVSE certificate

**Action:** Click **"Generate Energy Efficiency Certificate"**. The EV Charging Site Energy Certificate opens in a new tab. It shows charger count, peak load, transformer capacity, BESS sizing, solar yield, and the grid risk grade.

> "Same bankable certificate — this time for the charging site. It records the overload finding, the BESS mitigation, and the solar yield, with the same regulatory disclaimer. A developer can hand this directly to an investor or an EVN pre-assessment desk."

---

## 2:00 – 2:08 · Switch to Policy mode

**Action:** Close the cert tab. Click **Back to start**, then the **Policy Simulation** card. Quick-reply *"ban non-EV motorcycles"*. AI says click a road. Roads pulse amber. Click Ring Road 1.

> "Now the second mode — for **city governments**. Here, we can simulate a low-carbon mobility policy. For example, I will try to ban non-EV motorbikes — Hanoi's actual Directive 20, starting July 2026 — and click the map to choose the corridor."

---

## 2:08 – 2:23 · The ABM impact simulation

**Action:** Camera swoops down to a low-angle view of the corridor. Phase callouts fade in/out above the road as the 11-second simulation unfolds. Cars flash red one by one, freeze, lift, and disappear. Pollution smog dissipates upward. Trees grow along the curb. Replacement EVs roll in.

> "An **Agent-Based Model** runs on thirty-eight thousand synthetic commuters drawn from Vietnam's household survey. Each gasoline vehicle is flagged and removed; the smog clears; trees grow on the curb to visualize the carbon-equivalent; and replacement EVs roll in.
> Since we use Explainable AI, the AI then explains the behavioural split that will happen according to the policy and recommends pairing the ban with EVSE sites and a means-tested subsidy."

---

## 2:23 – 2:30 · Close

**On screen:** the impact KPI cards (PM2.5 −22%, CO₂ −14.2 t/day, 640 trees, 12 EVSE sites) in the chat.

> "Planning, policy, evidence — and bankable certificates at the end. All on one digital twin. That's GreenTwin."

---

## Cheat-sheet for the live demo

| Time | Click / Type                                                                                                                                | Why                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 0:00 | *(on home screen)*                                                                                                                        | Open                                                   |
| 0:05 | Click**Planning** card → quick-reply `build an office tower`                                                                       | Enter planning mode                                    |
| 0:08 | Click any open plot (south-center works best)                                                                                               | Trigger 2.4s rise + auto x-ray (≈2.8s)                |
| 0:18 | Drag**Floors** slider 28 → 34                                                                                                        | Show live-tunable KPIs                                 |
| 0:23 | Quick-reply*Yes, add solar*                                                                                                               | Trigger the 7-second day-cycle solar sim               |
| 0:34 | Click**Generate Energy Efficiency Certificate**                                                                                       | Open the printable building certificate                |
| 0:38 | Close cert tab → click**"Another EVSE site"** quick-reply chip                                                                             | Start EVSE placement flow                              |
| 0:40 | Click any open area near a road (north-east works well)                                                                                     | Trigger 2.4s EVSE rise + auto x-ray (≈2.8s)           |
| 0:45 | **Don't click anything — let the X-ray reveal play**                                                                                 | AI flags the 1.2 MW overload + 540 kWh BESS mitigation |
| 1:26 | Drag**Chargers** slider 8 → 12, watch Grid risk flip to Constrained; drag **BESS** to 900 kWh, watch it flip back to Mitigated | Show live grid-risk trade-off                          |
| 1:34 | Reset Chargers to 8, BESS to 540 kWh; click**"Yes, add solar"** chip                                                                        | Trigger solar canopy simulation                        |
| 1:52 | Click**Generate Energy Efficiency Certificate**                                                                                       | Open the EVSE certificate                              |
| 2:00 | Close cert tab → click**Back to start** → **Policy Simulation** card                                                          | Switch modes                                           |
| 2:06 | Type `ban non-EV motorcycles`                                                                                                             | Activate road-picking                                  |
| 2:08 | Click**Ring Road 1** (amber-pulsing strip near the center)                                                                            | Trigger 11-second ABM simulation                       |

## Talking-points if you have extra time

- "The underground x-ray isn't a static lookup — the transformer position and cable routing are computed from the placement coordinates in real time, replacing what would normally be a multi-week EVN coordination process."
- "The BESS pre-sizing formula is live — it scales with charger count and transformer headroom so the grid risk flag reflects the actual overload delta, not a hardcoded threshold."
- "All solar shading uses real ray-casting against neighbour-building bounding boxes — not a fudged lookup table. The sun arc moves the actual directional light, so every shadow in the city moves with it."
- "Every figure on both certificates is live-recomputed from the sliders — annual yield, financial payback, CO₂ offset, BESS size — no hard-coded numbers."
- "The certificates carry a disclaimer making clear they are indicative pre-assessments, not regulatory permits — formal approval still comes from EVN, MoIT, MoNRE."
- "The 640-tree carbon-equivalent number is calibrated to MoNRE Tier-2 emission factors and Vietnam's GHG inventory."
- "Earthy Harmony palette — chosen so the visualization reads as a real urban environment, not a video game."
- "Built on React 19, Three.js, FastAPI, with the Anthropic Claude SDK powering the natural-language XAI reports."
