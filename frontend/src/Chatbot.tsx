import { useEffect, useRef, useState } from 'react';
import type { FlowState, FlowAction, Sliders } from './flow';
import { inputDisabled, deriveKpis, generateCertificateHTML } from './flow';

type Props = {
  state: FlowState;
  dispatch: (a: FlowAction) => void;
};

function quickRepliesFor(state: FlowState): string[] {
  if (state.step === 'planning-greet') {
    return ['Build an office tower', 'Build an EV charging station'];
  }
  if (state.step === 'planning-ask-solar') {
    return ['Yes, add solar', 'No, skip solar'];
  }
  if (state.step === 'planning-complete') {
    return ['Another building', 'Another EVSE site'];
  }
  if (state.step === 'policy-greet') {
    return ['Ban non-EV motorcycles', 'Phase out gasoline scooters'];
  }
  return [];
}

function placeholderFor(state: FlowState): string {
  if (state.step === 'planning-await-where') return 'Click anywhere on the map…';
  if (state.step === 'policy-await-road') return 'Click a glowing road on the map…';
  if (state.busy) return 'Simulating…';
  if (state.step === 'home-idle') return 'Pick a mode to begin';
  return 'Type your message…';
}

function chatTitle(state: FlowState): string {
  if (state.mode === 'planning') return 'Planning assistant';
  if (state.mode === 'policy') return 'Policy lab';
  return 'GreenTwin AI';
}

function PlanningSliders({ state, dispatch }: { state: FlowState; dispatch: (a: FlowAction) => void }) {
  if (!state.intent) return null;
  const s = state.sliders;
  const setSlider = (key: keyof Sliders, value: number) =>
    dispatch({ type: 'SET_SLIDER', key, value });

  const rows: { key: keyof Sliders; label: string; min: number; max: number; step: number; unit: string }[] =
    state.intent === 'building'
      ? [
          { key: 'buildingFloors', label: 'Floors', min: 12, max: 40, step: 1, unit: '' },
          { key: 'panelCoverage', label: 'Solar coverage', min: 40, max: 100, step: 5, unit: '%' },
        ]
      : [
          { key: 'chargers', label: 'Chargers', min: 4, max: 16, step: 1, unit: '' },
          { key: 'bessKwh', label: 'BESS', min: 200, max: 1200, step: 20, unit: ' kWh' },
          { key: 'panelCoverage', label: 'Canopy coverage', min: 40, max: 100, step: 5, unit: '%' },
        ];

  return (
    <div className="planning-sliders">
      <div className="planning-sliders-title">Tune the plan</div>
      {rows.map((r) => (
        <label key={r.key} className="planning-slider-row">
          <div className="planning-slider-head">
            <span>{r.label}</span>
            <span className="tabular">{s[r.key]}{r.unit}</span>
          </div>
          <input
            type="range"
            className="planning-slider"
            min={r.min}
            max={r.max}
            step={r.step}
            value={s[r.key]}
            onChange={(e) => setSlider(r.key, Number(e.target.value))}
          />
        </label>
      ))}
    </div>
  );
}

export default function Chatbot({ state, dispatch }: Props) {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, state.busy]);

  const submit = (raw?: string) => {
    const val = (raw ?? text).trim();
    if (!val) return;
    setText('');
    dispatch({ type: 'USER_SAY', text: val });
  };

  const disabled = inputDisabled(state.step, state.busy);
  const quick = quickRepliesFor(state);

  return (
    <aside className="chat-panel">
      <header className="chat-head">
        <div className="chat-head-avatar">GT</div>
        <div style={{ flex: 1 }}>
          <div className="chat-head-name">{chatTitle(state)}</div>
          <div className="chat-head-status">
            <span className="dot" />
            {state.busy ? 'Running simulation…' : 'Online · Vietnam pilot'}
          </div>
        </div>
      </header>

      <div className="chat-body scroll-y" ref={scrollRef}>
        {state.messages.map((m) => (
          <div key={m.id} className={`chat-msg ${m.role}`}>
            {m.text}
          </div>
        ))}

        {(() => {
          const derived = deriveKpis(state);
          const kpis = derived ?? state.kpis;
          if (kpis.length === 0) return null;
          if (state.step !== 'planning-ask-solar' && state.step !== 'planning-complete' && state.step !== 'policy-complete') return null;
          return (
            <div className="kpi-grid" style={{ marginTop: 4 }}>
              {kpis.map((k, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-value tabular">{k.value}</div>
                </div>
              ))}
            </div>
          );
        })()}

        {(state.step === 'planning-ask-solar' || state.step === 'planning-complete') && (
          <PlanningSliders state={state} dispatch={dispatch} />
        )}

        {state.step === 'planning-complete' && (
          <button
            type="button"
            className="cert-btn"
            onClick={() => {
              const html = generateCertificateHTML(state);
              const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const w = window.open(url, '_blank');
              // Popup blocked? Fall back to a regular file download.
              if (!w || w.closed) {
                const a = document.createElement('a');
                a.href = url;
                a.download = `greentwin-certificate-${Date.now()}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
              // Release the blob after the new tab has had a chance to fetch it.
              setTimeout(() => URL.revokeObjectURL(url), 60_000);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="14" x2="15" y2="14" />
              <line x1="9" y1="18" x2="13" y2="18" />
            </svg>
            Generate Energy Efficiency Certificate
          </button>
        )}

        {state.busy && (
          <div className="chat-msg ai" style={{ padding: 0, background: 'transparent' }}>
            <div className="typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {quick.length > 0 && !state.busy && (
        <div className="chat-quick">
          {quick.map((q) => (
            <button key={q} className="chat-quick-btn" onClick={() => submit(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          className="chat-input"
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholderFor(state)}
        />
        <button className="chat-send" type="submit" disabled={disabled || !text.trim()} aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </aside>
  );
}
