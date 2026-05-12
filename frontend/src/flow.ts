export type Mode = 'home' | 'planning' | 'policy';

export type Intent = 'building' | 'evse';

export type Step =
  | 'home-idle'
  | 'planning-greet'
  | 'planning-await-where'
  | 'planning-animating'
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

        const aiResult =
          state.intent === 'evse'
            ? "EVSE site live — 8 fast chargers (150 kW). Peak load 1.2 MW exceeds the local transformer (1.0 MW). I've pre-sized a 540 kWh BESS to absorb the spike. Want a solar canopy on top to power it cleanly?"
            : "Tower complete: 28 floors, ~12,400 m² gross. Adds ~4.2 GWh/yr to district demand. Want me to install rooftop solar to offset it?";

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
          placed: [...state.placed, placed],
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

    case 'RESET':
      return initialState;

    default:
      return state;
  }
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
