# GreenTwin — UI & 3D Design Specification

> **Brand:** GreenTwin (logo in [logo.jpg](logo.jpg))
> **Product:** EcoGrid Vietnam — AI-Powered 3D Urban Energy & Mobility Intelligence Platform
> **Source brief:** [idea.txt](idea.txt)
>
> This document is the single source of truth for AI agents (Claude Code, Cursor, v0, etc.)
> building the frontend. It locks down the visual language, 3D look, animations, and tech stack
> so that every generated component stays on-brand.

---

## 1. Brand Identity

### 1.1 Logo
- File: [logo.jpg](logo.jpg)
- Treatment: dark-green wordmark `GreenTwin` paired with a sand/striped terraced-hill mark on the left.
- Placement: top-left of the app shell, 32–40 px height, always on a light background (`#E2DFDA` or `#FFFFFF`).
- Do **not** recolor the logo. If used on a dark hero, place it on a `#E2DFDA` rounded chip with 12 px padding.

### 1.2 Color Palette — "Earthy Harmony"
Use these tokens everywhere. No off-palette hex values.

| Token              | Hex       | Role |
|--------------------|-----------|------|
| `--mint-50`        | `#CBDED3` | Light surfaces, low-density data, parks/vegetation on map |
| `--sage-400`       | `#8BA49A` | Secondary UI, river/water, mid-density data |
| `--sand-400`       | `#D2C49E` | Terrain base, dirt paths, EVSE highlights, warm accents |
| `--forest-700`     | `#3B6255` | Primary CTA, headings, building shells, logo green, dark mode bg |
| `--bone-100`       | `#E2DFDA` | App background, cards, ground plane base |
| `--ink-900`        | `#1F2A26` | Body text on light bg (derived; tinted near-black, not pure #000) |
| `--alert-amber`    | `#C8923B` | Warnings, grid-stress overlays (derived from sand, +saturation) |
| `--alert-red`      | `#A04A3C` | Critical pollution / blackout zones (derived; muted brick) |

**Rules:**
- Default text on light bg: `--forest-700` for headings, `--ink-900` for body.
- Default text on `--forest-700` bg: `--bone-100`.
- Charts: order is `forest-700 → sage-400 → sand-400 → mint-50` (dark → light).
- Pollution fog gradient: `mint-50` (clean) → `sand-400` (moderate) → `alert-amber` (unhealthy) → `alert-red` (hazardous). Never use neon/saturated red.

### 1.3 Typography
- **Display / Headings:** `Inter`, `display`, weight 600–700, tight tracking (`-0.02em`).
- **Body:** `Inter`, weight 400–500.
- **Numeric / Data readouts:** `JetBrains Mono` or `Inter` `font-variant-numeric: tabular-nums`.
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 px. Line-height 1.4 body, 1.15 headings.

### 1.4 Spacing & Radius
- 4 px base grid. Spacing tokens: 4, 8, 12, 16, 24, 32, 48, 64.
- Radius: `8px` inputs, `12px` cards, `16px` panels, `24px` hero modals, `9999px` pills.
- Shadows: soft, warm, low-elevation — `0 1px 2px rgba(31,42,38,.06), 0 8px 24px rgba(31,42,38,.08)`. No hard black shadows.

---

## 2. The 3D Look — "Stylized Isometric Slice"

The hero 3D model must match the reference: a **floating isometric slice of land** with rounded earthy edges, mixing dense vegetation, a curving river, low-poly modern skyscrapers, a domed civic building, and decorative gears. It is **toy-like, not photoreal** — think "Monument Valley × SimCity 4 × planning diorama".

### 2.1 Visual Rules

1. **Camera:** orthographic-ish, 35° elevation, 45° yaw. Slight perspective is allowed (FOV ~25–30 if PerspectiveCamera). Locked rotation in marketing hero; orbitable in app view (clamp polar 15°–60°).
2. **Ground slab:** chunky extruded landmass, ~0.6 unit thick, with a **soft chamfered side wall** in `--sand-400`. Top surface uses `--mint-50` for grass, `--sage-400` for water, `--sand-400` for paths.
3. **Buildings:**
   - Skyscrapers: simple rectangular prisms + a few set-back rooftops, 4–10 units tall. Shell color `--bone-100`, window strips in `--forest-700`. One hero tower can have `--sand-400` accents.
   - Civic dome: hemisphere on a low cylinder, dome in `--mint-50`, base in `--forest-700`.
   - Houses (residential cluster): tiny rounded boxes with pitched roofs, roofs `--forest-700`, walls `--bone-100`.
   - **No textures.** Flat materials only. Use `MeshStandardMaterial` with low roughness variation, or `MeshToonMaterial` for the most diorama-like read.
4. **Vegetation:** Low-poly trees = a single cylinder trunk (`--sand-400`) + an icosahedron or rounded cone foliage (`--forest-700`). Hedges = rounded boxes `--sage-400`. Scatter densely, not in straight lines.
5. **River:** a curving extruded ribbon in `--sage-400` with a subtle animated normal-map or a slow scrolling UV for shimmer. Avoid reflective/glassy water — keep it matte.
6. **Decorative gears** (from reference): 2–3 large flat gears lying on the ground in `--sand-400`, slowly rotating (~6 rpm). They symbolize "the city as a system" and are intentional.
7. **Edges:** every mesh gets a `0.04` bevel/round (use `RoundedBox` from drei, or `Geometry.BufferGeometryUtils` chamfering). **No sharp 90° corners.**
8. **Lighting:**
   - 1× `directionalLight` at `(5, 10, 7.5)`, intensity 1.2, casts soft shadows, color `#FFF6E5` (warm sun).
   - 1× `ambientLight`, intensity 0.6, color `#CBDED3` (mint fill).
   - 1× `hemisphereLight` sky `#E2DFDA` / ground `#8BA49A`, intensity 0.4.
   - Shadow map size 2048, soft `PCFSoftShadowMap`. Contact shadows tight under each building.
9. **Background:** solid `--bone-100`, **no skybox, no gradient**. The slab floats. Add a faint elliptical drop-shadow under the slab.
10. **Post-processing (optional, subtle):** `SMAA` antialias + a very mild `Vignette` (offset 0.1, darkness 0.25 in `--forest-700`). **Do not** add bloom, chromatic aberration, or DoF on the hero — keep it crisp.

### 2.2 Model Source Strategy

Pick ONE of these in order of preference:

| Option | Use when | How |
|---|---|---|
| **Procedural in R3F** (recommended for hackathon) | You want everything code-driven and themable | Compose `<RoundedBox>`, `<Cylinder>`, `<Cone>` from `@react-three/drei`. Each building is a small React component. |
| **GLTF from Kenney/Quaternius low-poly city** | You need it to look "real" fast | Load via `useGLTF`, then **override all materials** in an effect to swap to the palette. |
| **Hand-modelled in Blender** | Post-hackathon polish | Export `.glb`, draco-compressed. Bake AO but no color textures — keep flat materials. |

For the hackathon, **go procedural.** It guarantees the palette stays locked.

### 2.3 Required Scene Components (file layout)

```
frontend/src/three/
  Scene.tsx                  // <Canvas>, lights, camera, postprocessing
  LandSlab.tsx               // the chunky ground island
  buildings/
    Skyscraper.tsx           // parametric: width, depth, height, accent
    CivicDome.tsx
    House.tsx
    SolarPanel.tsx           // draggable; emits onPlace(coords)
    EVSEStation.tsx          // little charging pole + glow
  nature/
    Tree.tsx
    Hedge.tsx
    River.tsx
  overlays/
    PollutionFog.tsx         // volumetric-ish shader, density driven by store
    SolarHeatmap.tsx         // rooftop ray-cast result, vertex-colored
    GridXRay.tsx             // toggle: shows underground cables
  controls/
    SceneCamera.tsx          // orbit, clamped
    Gears.tsx                // slowly rotating ground gears (decorative)
  hooks/
    useDayCycle.ts           // drives sun angle from time slider
    useShadingFactor.ts      // ray-cast solar irradiance per panel
```

---

## 3. Animation Language

All motion should feel **calm, deliberate, and "natural"** — like wind, water, breath. Never bouncy or playful.

### 3.1 Global motion tokens

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-xs` | 120 ms | `cubic-bezier(.2,.8,.2,1)` | Hover, focus rings, tooltip fade |
| `motion-sm` | 220 ms | `cubic-bezier(.2,.8,.2,1)` | Button press, dropdown open |
| `motion-md` | 420 ms | `cubic-bezier(.16,.84,.32,1)` | Card enter, panel slide |
| `motion-lg` | 800 ms | `cubic-bezier(.22,1,.36,1)` | 3D camera moves, big chart morphs |
| `motion-loop-breath` | 6 s | `easeInOutSine` | Idle scene breathing, gear rotation |

Library: **`framer-motion`** for DOM, and `@react-spring/three` (or `useFrame` + lerp) for 3D.

### 3.2 Required animations

1. **Scene intro (page load, once):**
   - Slab drops in from `y = -2` to `y = 0` over 900 ms (`motion-lg`).
   - Buildings stagger-rise from `y = -building.height` to final, 60 ms stagger, 700 ms each.
   - Trees pop in last, scale `0 → 1` with `back.out(1.4)` (this is the only place we allow a touch of overshoot).
   - Camera does a 1.2 s subtle dolly from FOV 35 → 28.

2. **Idle / ambient:**
   - Decorative gears rotate at 0.1 rad/s, opposite directions.
   - River UV scrolls at 0.02 u/s.
   - Trees sway: each tree's foliage mesh `rotation.z = sin(t * 0.6 + offset) * 0.03`.
   - Sun light angle drifts ±2° on a 12 s sine to subtly shift shadows.

3. **Solar heatmap reveal:**
   - When user enables solar mode, rooftops fade from `--bone-100` to a vertex-color gradient (mint → sand → amber → red) over 600 ms.
   - A soft "scanning sweep" line travels across the slab (`x` axis, 1.4 s, one shot) using an additive shader band.

4. **Pollution fog (policy simulation):**
   - Volumetric-ish fog (raymarched plane stack or `Sprites`) appears in affected districts.
   - Density animates from current value to target over 1.2 s using `react-spring`.
   - On policy "good" outcomes, fog dissipates upward (`y += 0.4`, opacity → 0) over 1.6 s.

5. **EV adoption sim:**
   - Tiny EV icons (rounded capsule meshes in `--forest-700` with `--sand-400` accent) animate along road splines.
   - On policy change, ratio of EVs to gasoline icons updates with a 900 ms crossfade.
   - Each EVSE station pulses `--mint-50` emissive at 1 Hz when active.

6. **Drag-and-drop solar panel:**
   - Panel mesh follows pointer with raycast hit on roof, with a `lerp(0.25)` for smoothness.
   - On valid roof: ghost mesh tints `--mint-50` at 70% opacity.
   - On invalid (shaded zone): tints `--alert-amber`.
   - On drop: snap-scale `0.9 → 1.0` over 220 ms, and a kWh tooltip floats up 12 px and fades in.

7. **XAI panel reveal:**
   - Right-side panel slides in from `x: 100%` with `motion-md`.
   - Text streams in word-by-word at ~40 ms per word (use Claude SDK streaming).

### 3.3 Reduced motion
Respect `prefers-reduced-motion: reduce`:
- Disable scene intro stagger (snap to final).
- Freeze gears, river scroll, tree sway.
- Keep functional transitions (fog density updates) but cut their duration in half and remove easing overshoot.

---

## 4. App Layout & Information Architecture

### 4.1 Shell

```
┌──────────────────────────────────────────────────────────────────┐
│ [GreenTwin logo]   Plan · Simulate · Report          [user menu] │  ← TopBar (64 px, bone-100)
├────────────┬─────────────────────────────────────┬───────────────┤
│            │                                     │               │
│  LeftRail  │           3D Canvas (R3F)           │  RightPanel   │
│  (72 px)   │           full-bleed                │   (360 px)    │
│  icon nav  │           with floating HUD chips   │   contextual  │
│            │                                     │               │
├────────────┴─────────────────────────────────────┴───────────────┤
│ Bottom Slider Dock — policy sliders, day-of-year, time-of-day    │  ← 96 px, bone-100, sticky
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Two primary modes (from idea.txt §4)

- **Mode A — Smart Infrastructure Planning** (developers)
  - LeftRail icons: `Building`, `Solar`, `BESS`, `EVSE`, `Grid X-ray`, `Certificate`.
  - RightPanel: KPI cards (kWh/yr, payback, CO₂ offset, BESS kWh), drag-drop palette.
- **Mode B — Mobility Policy Simulation** (government)
  - LeftRail icons: `Zones`, `Ban Timeline`, `EV Subsidy`, `BRT`, `Air Quality`, `XAI Report`.
  - Bottom dock: Ring Road slider (1/2/3), Year slider (2026 → 2030), Subsidy slider.
  - RightPanel: live PM2.5 / CO₂ / NOx readouts, equity warning, XAI explanation card.

### 4.3 Components needed (Tailwind + shadcn-style)
`Button`, `IconButton`, `Toggle`, `Slider` (range + dual), `Tabs`, `Card`, `KpiCard`, `Tooltip`, `Sheet` (right panel), `Dialog`, `Toast`, `Legend`, `Progress`, `Badge`, `Select`, `Combobox`, `MapHud` (floating chip cluster), `MetricSpark` (tiny inline sparkline).

All components default to `--bone-100` surface, `--forest-700` primary, 12 px radius, soft shadow.

---

## 5. Tech Stack

### 5.1 Frontend (already initialized in [frontend/](frontend/))
- **React 19** + **TypeScript** + **Vite** (already in [frontend/package.json](frontend/package.json)).
- **three** + **@react-three/fiber** + **@react-three/drei** (installed).
- **Add:**
  - `@react-three/postprocessing` — vignette, SMAA.
  - `@react-spring/three` — smooth 3D tweens.
  - `framer-motion` — DOM animation.
  - `zustand` — global app store (mode, sliders, scenario id, scene refs).
  - `tailwindcss` + `tailwind-merge` + `clsx` — styling.
  - `lucide-react` — icons (consistent stroke 1.5).
  - `recharts` or `visx` — 2D charts in side panel.
  - `react-hook-form` + `zod` — forms (developer inputs).
  - `@tanstack/react-query` — server state, simulation calls.

Install:
```bash
cd frontend
npm i @react-three/postprocessing @react-spring/three framer-motion zustand \
      tailwindcss @tailwindcss/vite tailwind-merge clsx lucide-react recharts \
      react-hook-form zod @tanstack/react-query
```

### 5.2 Backend (already initialized in [backend/](backend/))
- **Python 3.11+** + **FastAPI** + **uvicorn**.
- **AI / sim libraries:**
  - `numpy`, `scipy` — solar ray-cast and grid load math.
  - `mesa` — Agent-Based Modeling (commuters).
  - `shap`, `lime` — explainability.
  - `scikit-learn` — load regression.
  - `anthropic` — Claude SDK for XAI natural-language reports.
  - `geopandas`, `shapely`, `pyproj` — geospatial.
  - `psycopg[binary]` + `sqlalchemy` — PostGIS connection.
  - `redis` — slider → result cache.
  - `websockets` (FastAPI built-in) — push delta updates to scene.

### 5.3 Data
- **OpenStreetMap Overpass** — building footprints for HCMC District 1 (pilot).
- **Solargis GHI** — annual irradiance raster (1 km).
- **EVN load profiles** — mocked CSV for hackathon, MOU later.
- **GSO 2023 household survey** — ABM agent priors.
- **AirVisual** — PM2.5 baseline.

### 5.4 Folder layout

```
vietnuy/
├── frontend/
│   └── src/
│       ├── three/              # see §2.3
│       ├── components/         # DOM UI
│       ├── store/              # zustand slices
│       ├── api/                # react-query hooks → /backend
│       ├── styles/             # tailwind.css with palette tokens
│       └── App.tsx
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── solar/                  # ray-casting + heatmap endpoint
│   ├── grid/                   # BESS + EVSE optimizer
│   ├── abm/                    # Mesa simulation
│   ├── xai/                    # SHAP + Claude prompts
│   └── data/                   # static csv/json datasets
└── design.md                   # this file
```

---

## 6. Tailwind Theme (drop-in)

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        mint:    { 50: '#CBDED3' },
        sage:    { 400: '#8BA49A' },
        sand:    { 400: '#D2C49E' },
        forest:  { 700: '#3B6255' },
        bone:    { 100: '#E2DFDA' },
        ink:     { 900: '#1F2A26' },
        alert:   { amber: '#C8923B', red: '#A04A3C' },
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono:    ['JetBrains Mono', 'ui-monospace'],
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
      boxShadow: {
        soft: '0 1px 2px rgba(31,42,38,.06), 0 8px 24px rgba(31,42,38,.08)',
      },
      transitionTimingFunction: {
        natural: 'cubic-bezier(.22,1,.36,1)',
        snap:    'cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
}
```

---

## 7. Quick prompts for AI codegen agents

Paste these (with this file linked) into your codegen tool to get on-brand output.

> **"Build the hero 3D scene"**
> Read `design.md`. Create `frontend/src/three/Scene.tsx` plus the components in §2.3. Use only the palette in §1.2, no textures, RoundedBox-based meshes only, lighting per §2.1.8. Include the slab, 6 skyscrapers, 1 civic dome, ~30 trees, a curving river, and 2 decorative ground gears. Animate per §3.2.1 and §3.2.2. No comments unless non-obvious.

> **"Build the policy slider dock"**
> Create the bottom dock in §4.1 with three sliders (Ring Road 1–3, Year 2026–2030, Subsidy 0–100%). Use shadcn `Slider`. On change, debounce 150 ms, call `useScenarioStore.setSliders`. Apply Tailwind tokens from §6.

> **"Wire the XAI panel"**
> Build the right panel per §4.2 Mode B. Stream Claude text per §3.2.7 from `/api/xai/explain`. Each metric card shows current value, delta vs baseline, sparkline. Respect reduced motion.

---

## 8. Acceptance checklist

A screen is "done" only if **all** are true:
- [ ] Uses only Earthy Harmony palette tokens (no off-palette hex).
- [ ] Logo is present, uncropped, on `--bone-100` chip if on dark.
- [ ] All meshes have rounded edges; no sharp 90° corners visible.
- [ ] No textures on 3D meshes; flat or toon materials only.
- [ ] Lighting matches §2.1.8 (warm sun + mint ambient + hemi).
- [ ] Background is solid `--bone-100`, no skybox.
- [ ] Decorative gears rotate; river shimmers; trees sway.
- [ ] All animations use tokens in §3.1; none exceed 1.2 s except camera moves.
- [ ] `prefers-reduced-motion` honored.
- [ ] No emoji in shipped UI (icons via `lucide-react`).
- [ ] Tabular numerals on every numeric readout.
