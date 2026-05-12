type Props = {
  onPick: (mode: 'planning' | 'policy') => void;
};

export default function HomeOverlay({ onPick }: Props) {
  return (
    <div className="home-overlay">
      <span className="home-eyebrow">GreenTwin · Urban Energy Digital Twin</span>
      <h1 className="home-title">Plan, simulate, and de-risk the low-carbon city.</h1>
      <p className="home-sub">
        Pick a mode to start. The AI assistant will walk you through the workflow and animate
        every decision on the 3D digital twin.
      </p>

      <div className="home-cards">
        <button className="home-card" onClick={() => onPick('planning')}>
          <div className="home-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4 8 4v14" />
              <path d="M9 9h2" />
              <path d="M9 13h2" />
              <path d="M13 9h2" />
              <path d="M13 13h2" />
              <path d="M9 17h6" />
            </svg>
          </div>
          <h2 className="home-card-title">Planning</h2>
          <p className="home-card-desc">
            For developers and infrastructure teams. Design a low-carbon building or EV
            charging site — get a solar-optimized, grid-stable, bankable plan in minutes.
          </p>
          <span className="home-card-cta">
            Start planning
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </button>

        <button className="home-card" onClick={() => onPick('policy')}>
          <div className="home-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M6 21V10" />
              <path d="M18 21V10" />
              <path d="M3 10h18" />
              <path d="M5 10l7-7 7 7" />
            </svg>
          </div>
          <h2 className="home-card-title">Policy Simulation</h2>
          <p className="home-card-desc">
            For city governments and transport agencies. Test a mobility policy — like banning
            non-EV motorcycles — and see the carbon, equity, and infrastructure impact live.
          </p>
          <span className="home-card-cta">
            Open policy lab
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
