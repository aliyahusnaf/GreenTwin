import { useEffect, useReducer } from 'react';
import './App.css';
import Scene from './Scene';
import Chatbot from './Chatbot';
import HomeOverlay from './HomeOverlay';
import { reducer, initialState, expectsMapClick } from './flow';
import { THEME } from './theme';

const ANIM_DURATION: Record<string, number> = {
  'planning-animating': 2400,
  'planning-xray-reveal': 2800,
  'planning-animating-solar': 7000,
  'policy-animating': 11000,
};

function modeLabel(mode: string): string {
  if (mode === 'planning') return 'Planning';
  if (mode === 'policy') return 'Policy';
  return 'Home';
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const dur = ANIM_DURATION[state.step];
    if (!dur) return;
    const id = window.setTimeout(() => dispatch({ type: 'ANIM_DONE' }), dur);
    return () => window.clearTimeout(id);
  }, [state.step]);

  const expecting = expectsMapClick(state.step);

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <BrandMark />
          <div>
            <div className="brand-name">GreenTwin</div>
            <div className="brand-sub">Urban Energy Digital Twin · Vietnam Pilot</div>
          </div>
        </div>

        <div className="crumb">
          <span>{modeLabel(state.mode)}</span>
          {state.mode !== 'home' && (
            <>
              <span className="crumb-dot" />
              <span>{stepLabel(state.step)}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {state.mode !== 'home' && <span className="mode-pill">{modeLabel(state.mode)}</span>}
          {state.mode !== 'home' && (
            <button className="reset-btn" onClick={() => dispatch({ type: 'RESET' })}>
              Back to start
            </button>
          )}
        </div>
      </header>

      <main className="canvas-wrap">
        <Scene
          state={state}
          onPickGround={(pos) => dispatch({ type: 'CLICK_GROUND', position: pos })}
          onPickRoad={(id) => dispatch({ type: 'CLICK_ROAD', roadId: id })}
        />

        {expecting === 'ground' && (
          <div className="hud-hint">
            <span className="dot" />
            Click anywhere on the map — I'll snap to the nearest open site
          </div>
        )}
        {expecting === 'road' && (
          <div className="hud-hint">
            <span className="dot" />
            Click a glowing road to apply the policy
          </div>
        )}

        {state.mode === 'home' && (
          <HomeOverlay onPick={(mode) => dispatch({ type: 'PICK_MODE', mode })} />
        )}

        {state.mode !== 'home' && <Chatbot state={state} dispatch={dispatch} />}

        {state.mode !== 'home' && <Legend mode={state.mode} />}
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M4 28 C6 18, 10 10, 18 6 C26 10, 30 18, 32 28 Z"
        fill={THEME.sand400}
      />
      <path d="M10 26 C12 20, 14 16, 18 14" stroke={THEME.bone100} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M14 28 C16 22, 18 18, 22 16" stroke={THEME.bone100} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M18 30 C20 24, 22 20, 26 18" stroke={THEME.bone100} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="26" cy="10" r="3" fill={THEME.forest700} />
    </svg>
  );
}

function stepLabel(step: string): string {
  const map: Record<string, string> = {
    'home-idle': 'Home',
    'planning-greet': 'Choose what to build',
    'planning-await-where': 'Pick a site',
    'planning-animating': 'Building',
    'planning-xray-reveal': 'Scanning subsurface',
    'planning-ask-solar': 'Solar?',
    'planning-animating-solar': 'Installing solar',
    'planning-complete': 'Plan ready',
    'policy-greet': 'Define a policy',
    'policy-await-road': 'Pick a corridor',
    'policy-animating': 'Simulating',
    'policy-complete': 'Impact report',
  };
  return map[step] ?? step;
}

function Legend({ mode }: { mode: string }) {
  const items =
    mode === 'planning'
      ? [
          { color: THEME.ground, label: 'Buildable surface' },
          { color: THEME.bone100, label: 'Building shell' },
          { color: THEME.forest700, label: 'Solar panel · clear' },
          { color: THEME.ink900, label: 'Solar cell · shaded (skipped)' },
        ]
      : [
          { color: THEME.fog, label: 'Pollution fog' },
          { color: THEME.alertRed, label: 'Removed fossil vehicle' },
          { color: THEME.forest700, label: 'Tree-equivalent CO₂' },
          { color: THEME.mint50, label: 'Replacement EV' },
        ];

  return (
    <div className="legend">
      <div className="legend-title">{mode === 'planning' ? 'Map legend' : 'Policy overlay'}</div>
      {items.map((it) => (
        <div className="legend-item" key={it.label}>
          <span className="legend-swatch" style={{ background: it.color }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
