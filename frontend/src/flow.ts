export type Mode = 'home' | 'planning' | 'policy';

export type Intent = 'building' | 'evse';

export type Step =
  | 'home-idle'
  | 'planning-greet'
  | 'planning-await-where'
  | 'planning-animating'
  | 'planning-xray-reveal'
  | 'planning-ask-solar'
  | 'planning-animating-solar'
  | 'planning-complete'
  | 'policy-greet'
  | 'policy-await-road'
  | 'policy-animating'
  | 'policy-complete';

export type ChatRole = 'ai' | 'user' | 'system';

export type ChatMsg = {
  id: string;
  role: ChatRole;
  text: string;
};

export type WorldPos = [number, number];

export type PlacedBuilding = {
  id: string;
  kind: 'building';
  position: WorldPos;
  hasSolar: boolean;
};

export type PlacedEvse = {
  id: string;
  kind: 'evse';
  position: WorldPos;
  hasSolar: boolean;
};

export type Placed = PlacedBuilding | PlacedEvse;

export type Kpi = { label: string; value: string };

export type Sliders = {
  buildingFloors: number;   // 12 – 40, default 28
  panelCoverage: number;    // 50 – 100 (%), default 75
  chargers: number;         // 4 – 16, default 8
  bessKwh: number;          // 200 – 1200, default 540
};

export const DEFAULT_SLIDERS: Sliders = {
  buildingFloors: 28,
  panelCoverage: 75,
  chargers: 8,
  bessKwh: 540,
};

export type FlowState = {
  mode: Mode;
  step: Step;
  intent?: Intent;
  selectedPosition?: WorldPos;
  selectedRoadId?: string;
  placed: Placed[];
  policyApplied: boolean;
  messages: ChatMsg[];
  busy: boolean;
  kpis: Kpi[];
  sliders: Sliders;
};

export type FlowAction =
  | { type: 'PICK_MODE'; mode: 'planning' | 'policy' }
  | { type: 'USER_SAY'; text: string }
  | { type: 'AI_SAY'; text: string }
  | { type: 'SYSTEM_SAY'; text: string }
  | { type: 'CLICK_GROUND'; position: WorldPos }
  | { type: 'CLICK_ROAD'; roadId: string }
  | { type: 'ANIM_DONE' }
  | { type: 'SET_KPIS'; kpis: Kpi[] }
  | { type: 'CLEAR_KPIS' }
  | { type: 'SET_SLIDER'; key: keyof Sliders; value: number }
  | { type: 'RESET' };

const uid = () => Math.random().toString(36).slice(2, 9);

export const initialState: FlowState = {
  mode: 'home',
  step: 'home-idle',
  placed: [],
  policyApplied: false,
  messages: [],
  busy: false,
  kpis: [],
  sliders: DEFAULT_SLIDERS,
};

const aiMsg = (text: string): ChatMsg => ({ id: uid(), role: 'ai', text });
const userMsg = (text: string): ChatMsg => ({ id: uid(), role: 'user', text });
const sysMsg = (text: string): ChatMsg => ({ id: uid(), role: 'system', text });

export function detectPlanningIntent(text: string): Intent | null {
  const t = text.toLowerCase();
  if (/(charg|evse|ev station|charging|spklu)/.test(t)) return 'evse';
  if (/(build|tower|office|mall|complex|apartment|housing|residen|gedung)/.test(t)) return 'building';
  return null;
}

export function detectPolicyIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /(ban|non[\s-]?ev|motorbike|motorcycle|gasoline|fossil|policy|directive|larang)/.test(t);
}

export function detectYesNo(text: string): 'yes' | 'no' | null {
  const t = text.toLowerCase().trim();
  if (/^(y|yes|yeah|yep|sure|ok|okay|please|do it|go|ya|iya)\b/.test(t)) return 'yes';
  if (/^(n|no|nope|skip|not now|nah|tidak|enggak)\b/.test(t)) return 'no';
  return null;
}

export function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'PICK_MODE': {
      if (action.mode === 'planning') {
        return {
          ...state,
          mode: 'planning',
          step: 'planning-greet',
          messages: [
            aiMsg(
              "Hi — I'm your GreenTwin planning assistant. I can design a low-carbon building or an EV charging site. What would you like to plan today?",
            ),
          ],
          kpis: [],
          intent: undefined,
        };
      }
      return {
        ...state,
        mode: 'policy',
        step: 'policy-greet',
        messages: [
          aiMsg(
            "Welcome to GreenTwin policy lab. I'll simulate a mobility policy across the digital twin. What policy do you want to test?",
          ),
        ],
        kpis: [],
      };
    }

    case 'USER_SAY': {
      const m: FlowState = { ...state, messages: [...state.messages, userMsg(action.text)] };
      if (state.step === 'planning-greet') {
        const intent = detectPlanningIntent(action.text);
        if (intent === 'building') {
          return {
            ...m,
            step: 'planning-await-where',
            intent,
            messages: [
              ...m.messages,
              aiMsg(
                "Got it — a new mixed-use building. Click anywhere on an open area of the map and I'll find a good site near your click.",
              ),
            ],
          };
        }
        if (intent === 'evse') {
          return {
            ...m,
            step: 'planning-await-where',
            intent,
            messages: [
              ...m.messages,
              aiMsg(
                "Got it — an EV charging site. Click anywhere on the map (ideally near a road) and I'll snap to the best nearby spot.",
              ),
            ],
          };
        }
        return {
          ...m,
          messages: [
            ...m.messages,
            aiMsg(
              "I can plan a *building* or an *EV charging station*. Which one would you like to start with?",
            ),
          ],
        };
      }

      if (state.step === 'planning-ask-solar') {
        const yn = detectYesNo(action.text);
        if (yn === 'yes') {
          return {
            ...m,
            step: 'planning-animating-solar',
            busy: true,
            messages: [
              ...m.messages,
              aiMsg(
                state.intent === 'evse'
                  ? "Simulating one full day of sun on the canopy — sweeping the sun east → south → west and tallying lit vs shaded hours per cell."
                  : "Simulating one full day of sun on the rooftop — the sun is going to arc east → south → west while I tally lit vs shaded hours for each cell.",
              ),
            ],
          };
        }
        if (yn === 'no') {
          return {
            ...m,
            step: 'planning-complete',
            messages: [
              ...m.messages,
              aiMsg(
                "No solar this round. The plan is saved to the Energy Efficiency Certificate. Want to plan something else?",
              ),
            ],
          };
        }
      }

      if (state.step === 'planning-complete') {
        const intent = detectPlanningIntent(action.text);
        if (intent) {
          return {
            ...m,
            step: 'planning-await-where',
            intent,
            selectedPosition: undefined,
            messages: [
              ...m.messages,
              aiMsg(
                intent === 'building'
                  ? "Another building — click an open area of the map."
                  : "Another EVSE site — click an open area near a road.",
              ),
            ],
          };
        }
      }

      if (state.step === 'policy-greet') {
        if (detectPolicyIntent(action.text)) {
          return {
            ...m,
            step: 'policy-await-road',
            messages: [
              ...m.messages,
              aiMsg(
                "Locked in: ban on non-EV motorbikes within the selected corridor. Click one of the highlighted roads on the map to apply the ban.",
              ),
            ],
          };
        }
        return {
          ...m,
          messages: [
            ...m.messages,
            aiMsg(
              "Try something like \"ban non-EV motorcycles\" or \"phase out gasoline scooters\". I'll run the agent-based model on that.",
            ),
          ],
        };
      }

      return m;
    }

    case 'AI_SAY':
      return { ...state, messages: [...state.messages, aiMsg(action.text)] };

    case 'SYSTEM_SAY':
      return { ...state, messages: [...state.messages, sysMsg(action.text)] };

    case 'CLICK_GROUND': {
      if (state.step !== 'planning-await-where') return state;
      return {
        ...state,
        selectedPosition: action.position,
        step: 'planning-animating',
        busy: true,
        messages: [
          ...state.messages,
          sysMsg(`Site snapped to (${action.position[0].toFixed(1)}, ${action.position[1].toFixed(1)})`),
          aiMsg(
            state.intent === 'evse'
              ? "Surveying the parcel and checking transformer headroom on the local feeder…"
              : "Site survey running — building height, setback and shadow envelope being computed in 3D…",
          ),
        ],
      };
    }

    case 'CLICK_ROAD': {
      if (state.step !== 'policy-await-road') return state;
      return {
        ...state,
        selectedRoadId: action.roadId,
        step: 'policy-animating',
        busy: true,
        messages: [
          ...state.messages,
          sysMsg(`Corridor ${action.roadId} selected — camera diving in`),
          aiMsg(
            "Running 24-hour Agent-Based Model on ~38,000 synthetic commuters. Watch the corridor below as the gasoline fleet is removed and replaced.",
          ),
        ],
      };
    }

    case 'ANIM_DONE': {
      if (state.step === 'planning-animating') {
        const pos = state.selectedPosition!;
        const placed: Placed =
          state.intent === 'evse'
            ? { id: uid(), kind: 'evse', position: pos, hasSolar: false }
            : { id: uid(), kind: 'building', position: pos, hasSolar: false };

        return {
          ...state,
          step: 'planning-xray-reveal',
          busy: true,
          placed: [...state.placed, placed],
          messages: [
            ...state.messages,
            aiMsg(
              state.intent === 'evse'
                ? 'Site committed. Now scanning subsurface infrastructure — locating cable trenches and the nearest transformer feeder…'
                : 'Site committed. Now scanning subsurface infrastructure — locating cable trenches and the nearest transformer feeder…',
            ),
          ],
        };
      }

      if (state.step === 'planning-xray-reveal') {
        const aiResult =
          state.intent === 'evse'
            ? "Subsurface mapped. EVSE site is live — 8 fast chargers (150 kW). Peak load 1.2 MW exceeds the local transformer (1.0 MW). I've pre-sized a 540 kWh BESS to absorb the spike. Want a solar canopy on top to power it cleanly?"
            : "Subsurface mapped. Tower complete: 28 floors, ~12,400 m² gross. Adds ~4.2 GWh/yr to district demand. Want me to install rooftop solar to offset it?";

        const kpis: Kpi[] =
          state.intent === 'evse'
            ? [
                { label: 'Chargers', value: '8 × 150 kW' },
                { label: 'Peak load', value: '1.2 MW' },
                { label: 'BESS', value: '540 kWh' },
                { label: 'Grid risk', value: 'Mitigated' },
              ]
            : [
                { label: 'Floors', value: '28' },
                { label: 'GFA', value: '12,400 m²' },
                { label: 'Annual load', value: '4.2 GWh' },
                { label: 'Roof area', value: '1,420 m²' },
              ];

        return {
          ...state,
          step: 'planning-ask-solar',
          busy: false,
          kpis,
          messages: [...state.messages, aiMsg(aiResult)],
        };
      }

      if (state.step === 'planning-animating-solar') {
        const updatedPlaced = state.placed.map((p, i) =>
          i === state.placed.length - 1 ? { ...p, hasSolar: true } : p,
        );
        const aiResult =
          state.intent === 'evse'
            ? "Solar canopy installed: 320 panels (40 cells skipped — shaded by the warehouse cluster). 118 MWh/yr, covers 34% of charging energy directly. BESS + grid handle the rest."
            : "Solar layout optimised: 12 of 16 grid cells cleared, 4 dropped because the neighbouring tower casts winter-morning shade on them. Annual yield ≈ 540 MWh — 25% higher than a naive full-roof install of the same panel count.";

        const kpis: Kpi[] =
          state.intent === 'evse'
            ? [
                { label: 'Panels', value: '320' },
                { label: 'Yield', value: '118 MWh/yr' },
                { label: 'Cells skipped', value: '4 (shade)' },
                { label: 'CO₂ avoided', value: '1.9 kt' },
              ]
            : [
                { label: 'Cells placed', value: '12 / 16' },
                { label: 'Yield', value: '540 MWh/yr' },
                { label: 'Payback', value: '4.6 yr' },
                { label: 'Shade loss avoided', value: '+25%' },
              ];

        return {
          ...state,
          step: 'planning-complete',
          busy: false,
          placed: updatedPlaced,
          kpis,
          messages: [
            ...state.messages,
            aiMsg(aiResult),
            aiMsg(
              "Plan another? Try \"another office building\" or \"an EV charging station\" — or open the policy lab from the top bar.",
            ),
          ],
        };
      }

      if (state.step === 'policy-animating') {
        return {
          ...state,
          step: 'policy-complete',
          busy: false,
          policyApplied: true,
          kpis: [
            { label: 'PM2.5 ↓', value: '−22%' },
            { label: 'CO₂ ↓', value: '−14.2 t/day' },
            { label: 'Tree-equivalent', value: '~640 trees' },
            { label: 'EVSE needed', value: '12 sites' },
          ],
          messages: [
            ...state.messages,
            aiMsg(
              "Simulation done. On this corridor the ban removes ~14.2 t CO₂/day and drops curbside PM2.5 by 22%. That carbon delta is equivalent to planting ~640 mature trees — both visualizations are now on the map.",
            ),
            aiMsg(
              "Behavioral split from the ABM: 38% switch to e-motorbikes, 19% shift to the BRT corridor, 32% keep cars (slight congestion bump), and 11% face mobility exclusion — low-income commuters who need a targeted subsidy.",
            ),
            aiMsg(
              "Recommendation: pair the ban with ~12 new EVSE sites along this corridor and a means-tested e-motorbike rebate. Otherwise the bottom-decile commuters bear the cost and political backlash follows.",
            ),
          ],
        };
      }

      return state;
    }

    case 'SET_KPIS':
      return { ...state, kpis: action.kpis };
    case 'CLEAR_KPIS':
      return { ...state, kpis: [] };
    case 'SET_SLIDER':
      return { ...state, sliders: { ...state.sliders, [action.key]: action.value } };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Slider-driven KPI derivation. Static numbers from the AI come back through
// state.kpis, but once the user nudges a slider in the chat panel the live
// chat KPI cards switch over to these derived values.
export function deriveKpis(state: FlowState): Kpi[] | null {
  if (state.mode !== 'planning') return null;
  if (state.step !== 'planning-ask-solar' && state.step !== 'planning-complete') return null;
  const s = state.sliders;
  if (state.intent === 'building') {
    const gfa = Math.round(s.buildingFloors * 442);                    // ~442 m² per floor
    const load = (gfa * 0.34) / 1000;                                  // GWh/yr
    const roofArea = Math.round(2200 * (gfa / (28 * 442)));            // scales w/ tower
    const cellsTotal = 16;
    const cellsPlaced = Math.max(1, Math.round((cellsTotal * s.panelCoverage) / 100));
    const panels = cellsPlaced * 122;                                  // ~122 panels / cell
    const yieldMwh = Math.round(panels * 0.37);                        // ~0.37 MWh/panel/yr
    const co2 = Math.round((yieldMwh * 0.56) * 25 / 100) / 10;         // 0.56 t CO₂ / MWh × 25 yr
    const payback = Math.max(2.4, 4.6 + (75 - s.panelCoverage) * 0.02);

    if (state.step === 'planning-ask-solar') {
      return [
        { label: 'Floors', value: `${s.buildingFloors}` },
        { label: 'GFA', value: `${gfa.toLocaleString()} m²` },
        { label: 'Annual load', value: `${load.toFixed(1)} GWh` },
        { label: 'Roof area', value: `${roofArea.toLocaleString()} m²` },
      ];
    }
    return [
      { label: 'Cells placed', value: `${cellsPlaced} / ${cellsTotal}` },
      { label: 'Annual yield', value: `${yieldMwh} MWh` },
      { label: 'Financial payback', value: `${payback.toFixed(1)} yr` },
      { label: 'CO₂ offset', value: `${co2.toFixed(1)} kt` },
    ];
  }
  if (state.intent === 'evse') {
    const peakKw = s.chargers * 150;                                    // kW
    const peakMw = (peakKw / 1000).toFixed(1);
    const txCap = 1.0;                                                  // MW
    const overload = peakKw / 1000 - txCap;
    const bessHeadroom = Math.max(0, s.bessKwh - overload * 1000 * 0.45);
    const gridRisk = overload <= 0 || s.bessKwh >= overload * 1000 * 0.45 ? 'Mitigated' : 'Constrained';
    const yieldMwh = Math.round((s.panelCoverage / 100) * 132);
    const co2EvseKt = (yieldMwh * 0.56 * 25 / 1000).toFixed(1);
    if (state.step === 'planning-ask-solar') {
      return [
        { label: 'Chargers', value: `${s.chargers} × 150 kW` },
        { label: 'Peak load', value: `${peakMw} MW` },
        { label: 'BESS', value: `${s.bessKwh} kWh` },
        { label: 'Grid risk', value: gridRisk },
      ];
    }
    return [
      { label: 'Annual yield', value: `${yieldMwh} MWh` },
      { label: 'CO₂ offset', value: `${co2EvseKt} kt` },
      { label: 'BESS headroom', value: `${Math.round(bessHeadroom)} kWh` },
      { label: 'Grid risk', value: gridRisk },
    ];
  }
  return null;
}

export function generateCertificateHTML(state: FlowState): string {
  const s = state.sliders;
  const issued = new Date().toISOString().slice(0, 10);
  const isBuilding = state.intent === 'building';
  const title = isBuilding ? 'Energy Efficiency & Grid Readiness Certificate' : 'EV Charging Site Energy Certificate';
  const projectName = isBuilding ? `Mixed-Use Tower · ${s.buildingFloors} floors` : `EVSE Site · ${s.chargers} chargers`;
  const gfa = Math.round(s.buildingFloors * 442);
  const load = (gfa * 0.34) / 1000;
  const peakKw = s.chargers * 150;
  const tableRows = isBuilding
    ? [
        ['Project type', 'Mixed-use commercial tower'],
        ['Floors', `${s.buildingFloors}`],
        ['Gross floor area', `${gfa.toLocaleString()} m²`],
        ['Annual energy load', `${load.toFixed(2)} GWh`],
        ['Roof panel coverage', `${s.panelCoverage}%`],
        ['Panels installed', `${Math.max(1, Math.round((16 * s.panelCoverage) / 100)) * 122}`],
        ['Estimated annual yield', `${Math.round(Math.max(1, Math.round((16 * s.panelCoverage) / 100)) * 122 * 0.37)} MWh`],
        ['Lifetime CO₂ avoided', `${(Math.round(Math.max(1, Math.round((16 * s.panelCoverage) / 100)) * 122 * 0.37 * 0.56 * 25 / 100) / 10).toFixed(1)} kt`],
        ['Shade analysis', 'Day-cycle ray-cast against neighbour buildings'],
      ]
    : [
        ['Project type', 'EV charging site'],
        ['Charging points', `${s.chargers} × 150 kW`],
        ['Peak load', `${(peakKw / 1000).toFixed(2)} MW`],
        ['Local transformer', '1.0 MW'],
        ['BESS sized', `${s.bessKwh} kWh`],
        ['Solar canopy coverage', `${s.panelCoverage}%`],
        ['Solar canopy yield', `${Math.round((s.panelCoverage / 100) * 132)} MWh/yr`],
        ['Grid risk assessment', s.bessKwh >= (peakKw - 1000) * 0.45 ? 'Mitigated' : 'Constrained'],
      ];
  const grade = isBuilding ? (s.panelCoverage >= 75 ? 'A' : s.panelCoverage >= 50 ? 'B' : 'C') : (s.bessKwh >= 540 ? 'A' : 'B');
  const refCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${title} · GreenTwin</title>
<style>
:root { color-scheme: light; }
body { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif; background: #E2DFDA; color: #1F2A26; margin: 0; padding: 48px; }
.sheet { max-width: 780px; margin: 0 auto; background: #F4EFE6; padding: 48px; border-radius: 18px; box-shadow: 0 20px 60px rgba(31,42,38,0.18); }
header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 2px solid #3B6255; }
.brand { font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: #3B6255; font-weight: 700; }
.grade { background: #3B6255; color: #E2DFDA; padding: 12px 18px; border-radius: 12px; font-size: 36px; font-weight: 800; }
.grade-cap { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; opacity: 0.7; display: block; margin-bottom: 2px; text-align: center; }
h1 { font-size: 28px; margin: 28px 0 6px; letter-spacing: -0.01em; }
.project { font-size: 16px; color: #3B6255; font-weight: 600; }
table { width: 100%; margin-top: 24px; border-collapse: collapse; }
td { padding: 12px 8px; border-bottom: 1px solid rgba(59,98,85,0.15); font-size: 14px; }
td:first-child { color: #6F807B; width: 44%; }
td:last-child { font-weight: 600; }
.disclaimer { margin-top: 28px; padding: 16px 18px; border-radius: 12px; background: #FFF3D4; border-left: 4px solid #C8923B; font-size: 12.5px; line-height: 1.55; color: #6B521C; }
.disclaimer strong { color: #4A3812; }
.disclaimer-title { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; color: #8E6A22; margin-bottom: 6px; }
.footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(59,98,85,0.15); display: flex; justify-content: space-between; font-size: 12px; color: #6F807B; }
.sig { font-style: italic; color: #3B6255; }
@media print { body { background: #fff; padding: 0; } .sheet { box-shadow: none; border-radius: 0; max-width: none; } .noprint { display: none; } }
.btn { background: #3B6255; color: #E2DFDA; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; }
</style></head><body>
<div class="sheet">
  <header>
    <div>
      <div class="brand">GreenTwin</div>
      <div style="margin-top:4px;font-size:13px;color:#6F807B">Urban Energy Digital Twin · Vietnam Pilot</div>
    </div>
    <div>
      <span class="grade-cap">Indicative grade</span>
      <div class="grade">${grade}</div>
    </div>
  </header>
  <h1>${title}</h1>
  <div class="project">${projectName}</div>
  <table>
    ${tableRows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
  </table>
  <div class="disclaimer">
    <div class="disclaimer-title">Not a regulatory permit</div>
    <strong>This is an indicative pre-assessment, not an official approval.</strong> The figures above are produced by GreenTwin's simulation engine (ray-cast solar shading, regression-predicted grid load and behavioural modelling) and are intended only as a <em>starting point</em> for stakeholder discussion and feasibility planning. This document does <strong>not replace</strong> permits, building approvals, environmental impact assessments, fire-safety sign-offs, or grid-interconnection clearance from MoIT, EVN, MoNRE, or the relevant municipal authority. Formal regulatory approval must still be obtained before construction or operation.
  </div>
  <div class="footer">
    <div>Issued <strong>${issued}</strong> · ref ${refCode}</div>
    <div class="sig">GreenTwin Planning AI · ray-cast verified</div>
  </div>
  <div class="noprint" style="margin-top:24px;text-align:right">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
</div>
</body></html>`;
}

export function expectsMapClick(step: Step): 'ground' | 'road' | null {
  if (step === 'planning-await-where') return 'ground';
  if (step === 'policy-await-road') return 'road';
  return null;
}

export function inputDisabled(step: Step, busy: boolean): boolean {
  if (busy) return true;
  if (step === 'planning-await-where') return false;
  if (step === 'policy-await-road') return false;
  if (step === 'home-idle') return true;
  return false;
}
