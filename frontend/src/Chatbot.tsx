import { useEffect, useRef, useState } from 'react';
import type { FlowState, FlowAction } from './flow';
import { inputDisabled } from './flow';

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

        {state.kpis.length > 0 && (state.step === 'planning-ask-solar' || state.step === 'planning-complete' || state.step === 'policy-complete') && (
          <div className="kpi-grid" style={{ marginTop: 4 }}>
            {state.kpis.map((k, i) => (
              <div key={i} className="kpi-card">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value tabular">{k.value}</div>
              </div>
            ))}
          </div>
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
