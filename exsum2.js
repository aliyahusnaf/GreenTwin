const pptxgen = require("pptxgenjs");

// ── Palette (matched to reference slides) ──────────────────
const NAVY      = "1C2F5E";   // dark navy headers
const NAVY2     = "2B4080";   // slightly lighter navy
const BLUE_MID  = "3A5BA0";   // medium blue accents
const BLUE_LITE = "D6E4F7";   // light blue fills
const BLUE_PALE = "EEF4FB";   // very pale blue bg
const TEAL      = "1A7A6E";   // teal for Module 2
const TEAL_LITE = "D0EEEA";
const GREEN     = "217A3C";
const GREEN_LITE= "D4EDDA";
const WHITE     = "FFFFFF";
const OFFWHITE  = "F7F9FC";
const GRAY_BG   = "F0F4F8";
const GRAY_LINE = "BBCAD8";
const DARK_TEXT = "1A1A2E";
const MID_TEXT  = "3D4F6B";
const LIGHT_TEXT= "6B7FA3";

const makeShadow = () => ({ type:"outer", blur:5, offset:2, angle:135, color:"000000", opacity:0.08 });
const dashedBorder = { pt:1, color:GRAY_LINE, dash:"dash" };
const solidBorder  = { pt:1, color:GRAY_LINE };

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.3 × 7.5

  // ══════════════════════════════════════════════════════════
  // SLIDE 1 — Solution Overview (matches EVNest/EVNet style)
  // ══════════════════════════════════════════════════════════
  const s1 = pres.addSlide();
  s1.background = { color: WHITE };

  // ── Title row (like EVNest: circle number + bold title) ──
  s1.addShape(pres.shapes.OVAL, {
    x:0.25, y:0.1, w:0.55, h:0.55,
    fill:{color:GRAY_BG}, line:{color:GRAY_LINE, pt:1}
  });
  s1.addText("4", {
    x:0.25, y:0.1, w:0.55, h:0.55,
    fontSize:18, color:NAVY, bold:true, align:"center", valign:"middle", margin:0
  });
  s1.addText([
    {text:"EcoGrid Vietnam", options:{bold:false, color:NAVY, fontSize:18}},
    {text:": AI-Powered 3D Urban Energy & Mobility Intelligence Platform", options:{bold:true, color:NAVY, fontSize:18}},
  ], { x:0.9, y:0.1, w:12.1, h:0.35, valign:"middle", margin:0 });
  s1.addText("A shared AI intelligence layer — closing Vietnam's developer↔government coordination gap on renewable energy & low-carbon mobility", {
    x:0.9, y:0.45, w:12.1, h:0.22,
    fontSize:9.5, color:LIGHT_TEXT, italic:true, margin:0
  });

  // ── "Strategy Description" header bar ───────────────────
  s1.addShape(pres.shapes.RECTANGLE, {
    x:0.2, y:0.75, w:12.9, h:0.28,
    fill:{color:NAVY}, line:{color:NAVY}
  });
  s1.addText("Solution Description", {
    x:0.2, y:0.75, w:12.9, h:0.28,
    fontSize:10, color:WHITE, bold:true, align:"center", valign:"middle", margin:0
  });

  // ── Description box ──────────────────────────────────────
  s1.addShape(pres.shapes.RECTANGLE, {
    x:0.2, y:1.03, w:12.9, h:0.72,
    fill:{color:WHITE}, line:{color:GRAY_LINE, pt:1}
  });
  s1.addText([
    {text:"Vietnam's low-carbon transition is trapped in a ", options:{color:DARK_TEXT}},
    {text:"structural coordination deadlock", options:{bold:true, color:DARK_TEXT}},
    {text:": EV sales surged 2.5× in 2024, yet 18% of would-be EV buyers abandon the purchase due to insufficient chargers (FTU HCMC, 2024); Vietnam needs ", options:{color:DARK_TEXT}},
    {text:"USD 12B in EVSE investment (HSBC)", options:{bold:true, color:DARK_TEXT}},
    {text:" that won't materialize without coordination. EcoGrid resolves this as a ", options:{color:DARK_TEXT}},
    {text:"shared AI intelligence layer", options:{bold:true, color:DARK_TEXT}},
    {text:" with a ", options:{color:DARK_TEXT}},
    {text:"closed feedback loop", options:{bold:true, color:DARK_TEXT}},
    {text:": developer plans → city energy forecast; policy simulation → recommends where to prioritize EVSE & solar (e.g. EV demand surge in District X → platform flags that district for EVSE deployment). The ", options:{color:DARK_TEXT}},
    {text:"3D Digital Twin", options:{bold:true, color:DARK_TEXT}},
    {text:" is not decoration — it is the common language allowing a rooftop solar decision in District 1 to be understood in the context of mobility policy in District 3.", options:{color:DARK_TEXT}},
  ], {
    x:0.3, y:1.06, w:12.7, h:0.66,
    fontSize:9, valign:"top", margin:0
  });

  // ── Three column section below: Objectives | Core System | Action Steps ──
  // Column headers
  const colHeaders = [
    {x:0.2,  w:2.5,  label:"The Problem",     color:NAVY},
    {x:2.75, w:7.9,  label:"How It Works — Two Integrated Modules + Digital Twin", color:NAVY},
    {x:10.7, w:2.4,  label:"Key Outputs",     color:NAVY},
  ];
  colHeaders.forEach(h => {
    s1.addShape(pres.shapes.RECTANGLE, {
      x:h.x, y:1.82, w:h.w, h:0.26,
      fill:{color:h.color}, line:{color:h.color}
    });
    s1.addText(h.label, {
      x:h.x, y:1.82, w:h.w, h:0.26,
      fontSize:8.5, color:WHITE, bold:true, align:"center", valign:"middle", margin:0
    });
  });

  // ── Left col: The Problem ────────────────────────────────
  s1.addShape(pres.shapes.RECTANGLE, {
    x:0.2, y:2.08, w:2.5, h:5.15,
    fill:{color:BLUE_PALE}, line:{color:GRAY_LINE, pt:1}
  });

  const problems = [
    {q:"Developers build EVSE & solar\nwithout knowing grid limits"},
    {q:"Government bans fossil motorbikes\nwithout knowing if charging infra exists"},
    {q:"18% of EV buyers abandon\npurchase: not enough chargers\n(FTU HCMC, 2024)"},
    {q:"Vietnam needs USD 12B in\ncharging investment (HSBC)"},
    {q:"World Bank: grid capacity\nmust grow 4% by 2035 just\nfor EV charging demand"},
  ];
  problems.forEach((p, i) => {
    const py = 2.14 + i * 1.0;
    s1.addShape(pres.shapes.RECTANGLE, {
      x:0.28, y:py, w:2.34, h:0.82,
      fill:{color:BLUE_LITE}, line:{color:BLUE_MID, pt:1}
    });
    s1.addText(p.q, {
      x:0.3, y:py+0.04, w:2.3, h:0.74,
      fontSize:8, color:NAVY, bold:false, valign:"middle", align:"center", margin:0
    });
  });

  // ── Middle col: Two modules + feedback arrow ─────────────
  // MODULE 1 box
  s1.addShape(pres.shapes.RECTANGLE, {
    x:2.75, y:2.08, w:3.85, h:5.15,
    fill:{color:WHITE}, line:{color:GRAY_LINE, pt:1}
  });
  s1.addShape(pres.shapes.RECTANGLE, {
    x:2.75, y:2.08, w:3.85, h:0.3,
    fill:{color:BLUE_MID}, line:{color:BLUE_MID}
  });
  s1.addText("MODULE 1 — Smart Infrastructure Planning", {
    x:2.77, y:2.08, w:3.81, h:0.3,
    fontSize:8, color:WHITE, bold:true, align:"center", valign:"middle", margin:0
  });
  s1.addText("For: Developers · EVSE Operators · ESG Investors", {
    x:2.77, y:2.4, w:3.81, h:0.2,
    fontSize:7.5, color:LIGHT_TEXT, italic:true, margin:0, align:"center"
  });

  // Sub-feature 1A
  s1.addShape(pres.shapes.RECTANGLE, {
    x:2.85, y:2.65, w:3.65, h:0.18,
    fill:{color:NAVY}, line:{color:NAVY}
  });
  s1.addText("Sub-Feature 1A — Grid Stability, BESS Sizing & EVSE Placement", {
    x:2.87, y:2.65, w:3.61, h:0.18,
    fontSize:7.5, color:WHITE, bold:true, valign:"middle", margin:0
  });
  s1.addText(
    "Ingests EVN historical load data → computes proposed building peak demand vs. local transformer capacity → auto-sizes optimal BESS (kWh + cost estimate) to prevent grid overload. Cable loss minimization (∑I²·R·L) finds optimal EV charging pile positions inside parking structure. 3D underground X-ray view shows existing cable trenches & transformer tie-in points — no trial-and-error surveys. Supports Vietnam's 150,000 EVSE target by 2030.",
    { x:2.87, y:2.85, w:3.6, h:0.98, fontSize:8, color:DARK_TEXT, valign:"top", margin:0 }
  );

  // divider
  s1.addShape(pres.shapes.LINE, {x:2.9, y:3.85, w:3.55, h:0, line:{color:GRAY_LINE, pt:0.5, dashType:"dash"}});

  // Sub-feature 1B
  s1.addShape(pres.shapes.RECTANGLE, {
    x:2.85, y:3.9, w:3.65, h:0.18,
    fill:{color:NAVY}, line:{color:NAVY}
  });
  s1.addText("Sub-Feature 1B — Solar Rooftop Optimization", {
    x:2.87, y:3.9, w:3.61, h:0.18,
    fontSize:7.5, color:WHITE, bold:true, valign:"middle", margin:0
  });
  s1.addText(
    "Full annual ray-casting simulation (Solargis Vietnam GHI): casts shadow volumes from neighbor buildings hour-by-hour → pinpoints best-yield rooftop zones. Drag-and-drop panel placement gives live AI feedback: annual kWh yield, CO₂ offset, payback period. Directly advances Vietnam's 39.2% renewable energy target by 2045.",
    { x:2.87, y:4.1, w:3.6, h:0.72, fontSize:8, color:DARK_TEXT, valign:"top", margin:0 }
  );

  // Output badge mod1
  s1.addShape(pres.shapes.RECTANGLE, {
    x:2.85, y:4.87, w:3.65, h:0.2,
    fill:{color:GREEN_LITE}, line:{color:GREEN, pt:1}
  });
  s1.addText("Output: Energy Efficiency & Grid Readiness Certificate (ESG-ready)", {
    x:2.87, y:4.87, w:3.61, h:0.2,
    fontSize:7.5, color:GREEN, bold:true, valign:"middle", margin:0
  });

  // Key Improvements list mod1
  s1.addShape(pres.shapes.RECTANGLE, {
    x:2.75, y:5.12, w:3.85, h:0.22,
    fill:{color:GRAY_BG}, line:{color:GRAY_LINE, pt:1}
  });
  s1.addText("Key Features Prototyped at Hackathon", {
    x:2.77, y:5.12, w:3.81, h:0.22,
    fontSize:8, color:NAVY, bold:true, align:"center", valign:"middle", margin:0
  });

  const f1items = [
    "① AI Load Balancing + BESS sizing from EVN data",
    "② Solar ray-casting → drag-and-drop panel feedback",
    "③ EVSE cable-loss optimizer + 3D underground X-ray",
  ];
  f1items.forEach((txt, i) => {
    const fy = 5.37 + i * 0.28;
    s1.addShape(pres.shapes.RECTANGLE, {
      x:2.85, y:fy, w:3.65, h:0.24,
      fill:{color:BLUE_LITE}, line:{color:GRAY_LINE, pt:0.5}
    });
    s1.addText(txt, {
      x:2.9, y:fy+0.02, w:3.55, h:0.2,
      fontSize:8, color:NAVY, bold:true, valign:"middle", margin:0
    });
  });

  // ── Feedback loop arrow ───────────────────────────────
  s1.addShape(pres.shapes.OVAL, {
    x:6.58, y:3.9, w:0.54, h:0.54,
    fill:{color:BLUE_LITE}, line:{color:BLUE_MID, pt:1.5}
  });
  s1.addText("⇄", {
    x:6.58, y:3.9, w:0.54, h:0.54,
    fontSize:18, color:BLUE_MID, bold:true, align:"center", valign:"middle", margin:0
  });
  s1.addText("feedback loop", {
    x:6.45, y:4.47, w:0.8, h:0.2,
    fontSize:6, color:BLUE_MID, align:"center", margin:0
  });

  // MODULE 2 box
  s1.addShape(pres.shapes.RECTANGLE, {
    x:7.15, y:2.08, w:3.5, h:5.15,
    fill:{color:WHITE}, line:{color:GRAY_LINE, pt:1}
  });
  s1.addShape(pres.shapes.RECTANGLE, {
    x:7.15, y:2.08, w:3.5, h:0.3,
    fill:{color:TEAL}, line:{color:TEAL}
  });
  s1.addText("MODULE 2 — Low-Carbon Mobility Policy Simulation", {
    x:7.17, y:2.08, w:3.46, h:0.3,
    fontSize:8, color:WHITE, bold:true, align:"center", valign:"middle", margin:0
  });
  s1.addText("For: Depts. of Transport · City Planning · MoIT · EVN", {
    x:7.17, y:2.4, w:3.46, h:0.2,
    fontSize:7.5, color:LIGHT_TEXT, italic:true, margin:0, align:"center"
  });

  // Urgent callout
  s1.addShape(pres.shapes.RECTANGLE, {
    x:7.22, y:2.63, w:3.38, h:0.68,
    fill:{color:TEAL_LITE}, line:{color:TEAL, pt:1}
  });
  s1.addText([
    {text:"⚡ Urgent use case: ", options:{bold:true, color:TEAL}},
    {text:"Hanoi Directive 20\n", options:{bold:true, color:DARK_TEXT}},
    {text:"Gasoline motorbike ban: Ring Road 1 (Jul 2026) → Ring Road 2 (2028) → Ring Road 3 (2030). 6.9M motorbikes affected. Two-wheelers meet ", options:{color:DARK_TEXT}},
    {text:"72.6% of Hanoi's transport needs", options:{bold:true, color:DARK_TEXT}},
    {text:" (ICCT, 2022) — largest urban mobility transition in Asia.", options:{color:DARK_TEXT}},
  ], { x:7.25, y:2.65, w:3.32, h:0.64, fontSize:7.5, valign:"top", margin:0 });

  // ABM
  s1.addShape(pres.shapes.RECTANGLE, {
    x:7.22, y:3.35, w:3.38, h:0.18,
    fill:{color:NAVY}, line:{color:NAVY}
  });
  s1.addText("Agent-Based Modeling (ABM)", {
    x:7.24, y:3.35, w:3.34, h:0.18,
    fontSize:7.5, color:WHITE, bold:true, valign:"middle", margin:0
  });
  s1.addText("Simulates 10,000s of synthetic citizens (calibrated GSO 2023 household survey). Apply Ring Road ban → predicts who shifts to e-moto, BRT, private EV, or faces mobility exclusion (equity flag).",
    { x:7.24, y:3.55, w:3.34, h:0.5, fontSize:8, color:DARK_TEXT, valign:"top", margin:0 });

  s1.addShape(pres.shapes.LINE, {x:7.27, y:4.07, w:3.28, h:0, line:{color:GRAY_LINE, pt:0.5, dashType:"dash"}});

  // Emission
  s1.addShape(pres.shapes.RECTANGLE, {
    x:7.22, y:4.11, w:3.38, h:0.18,
    fill:{color:NAVY}, line:{color:NAVY}
  });
  s1.addText("Emission Physics Engine + RE Demand Forecaster", {
    x:7.24, y:4.11, w:3.34, h:0.18,
    fontSize:7.5, color:WHITE, bold:true, valign:"middle", margin:0
  });
  s1.addText([
    {text:"Computes CO₂, NOx, PM2.5 changes (IPCC Tier 2 / MoNRE). Calculates additional green electricity needed per scenario. ", options:{color:DARK_TEXT}},
    {text:"Critical flag: ", options:{bold:true, color:"B71C1C"}},
    {text:"does the EV transition actually reduce emissions, or merely shift them from exhaust pipes to coal plants?", options:{bold:true, color:"B71C1C"}},
    {text:" — answered explicitly per scenario.", options:{color:DARK_TEXT}},
  ],
    { x:7.24, y:4.31, w:3.34, h:0.5, fontSize:8, color:DARK_TEXT, valign:"top", margin:0 });

  s1.addShape(pres.shapes.LINE, {x:7.27, y:4.83, w:3.28, h:0, line:{color:GRAY_LINE, pt:0.5, dashType:"dash"}});

  // 3D Fog
  s1.addShape(pres.shapes.RECTANGLE, {
    x:7.22, y:4.87, w:3.38, h:0.18,
    fill:{color:NAVY}, line:{color:NAVY}
  });
  s1.addText("3D Pollution Fog + XAI Policy Reports", {
    x:7.24, y:4.87, w:3.34, h:0.18,
    fontSize:7.5, color:WHITE, bold:true, valign:"middle", margin:0
  });
  s1.addText("Live volumetric PM2.5 fog layer thins as policy sliders move (zone, timeline, EV subsidy). Claude API generates plain-language XAI report: why emissions fell, who benefits, who is at risk.",
    { x:7.24, y:5.07, w:3.34, h:0.44, fontSize:8, color:DARK_TEXT, valign:"top", margin:0 });

  // Output badge mod2
  s1.addShape(pres.shapes.RECTANGLE, {
    x:7.22, y:5.57, w:3.38, h:0.2,
    fill:{color:TEAL_LITE}, line:{color:TEAL, pt:1}
  });
  s1.addText("Output: XAI Policy Report + RE Demand Forecast per Scenario", {
    x:7.24, y:5.57, w:3.34, h:0.2,
    fontSize:7.5, color:TEAL, bold:true, valign:"middle", margin:0
  });

  // Key items mod2
  s1.addShape(pres.shapes.RECTANGLE, {
    x:7.15, y:5.82, w:3.5, h:0.22,
    fill:{color:GRAY_BG}, line:{color:GRAY_LINE, pt:1}
  });
  s1.addText("Key Features Prototyped at Hackathon", {
    x:7.17, y:5.82, w:3.46, h:0.22,
    fontSize:8, color:NAVY, bold:true, align:"center", valign:"middle", margin:0
  });
  const f2items = [
    "④ ABM policy slider → behavioral mode-shift prediction",
    "⑤ 3D fog visualization + XAI Claude API report",
  ];
  f2items.forEach((txt, i) => {
    const fy = 6.07 + i * 0.28;
    s1.addShape(pres.shapes.RECTANGLE, {
      x:7.22, y:fy, w:3.38, h:0.24,
      fill:{color:TEAL_LITE}, line:{color:GRAY_LINE, pt:0.5}
    });
    s1.addText(txt, {
      x:7.26, y:fy+0.02, w:3.3, h:0.2,
      fontSize:8, color:TEAL, bold:true, valign:"middle", margin:0
    });
  });

  // ── Right col: Key Outputs ───────────────────────────────
  s1.addShape(pres.shapes.RECTANGLE, {
    x:10.7, y:2.08, w:2.4, h:5.15,
    fill:{color:BLUE_PALE}, line:{color:GRAY_LINE, pt:1}
  });

  const outputs = [
    { icon:"📋", label:"Energy Efficiency &\nGrid Readiness\nCertificate", sub:"For ESG reporting\n& regulatory filing" },
    { icon:"⚡", label:"BESS Sizing\nRecommendation\n+ Cost Estimate", sub:"Per building,\nwith payback period" },
    { icon:"☀️", label:"Solar Panel\nPlacement Map\n+ Live kWh Yield", sub:"Drag-and-drop\ninteractive output" },
    { icon:"📊", label:"Policy Impact\nProjection\n(CO₂, PM2.5, NOx)", sub:"Per Ring Road zone\n& timeline scenario" },
    { icon:"🤖", label:"XAI Plain-Language\nPolicy Report", sub:"Auto-generated\nvia Claude API" },
  ];
  outputs.forEach((o, i) => {
    const oy = 2.13 + i * 1.0;
    if (i > 0) {
      s1.addShape(pres.shapes.LINE, {x:10.75, y:oy, w:2.3, h:0, line:{color:GRAY_LINE, pt:0.5, dashType:"dash"}});
    }
    s1.addText(o.icon, { x:10.75, y:oy+0.05, w:0.35, h:0.4, fontSize:16, align:"center", margin:0 });
    s1.addText(o.label, { x:11.12, y:oy+0.03, w:1.9, h:0.5, fontSize:7.5, color:NAVY, bold:true, valign:"top", margin:0 });
    s1.addText(o.sub,   { x:11.12, y:oy+0.53, w:1.9, h:0.35, fontSize:7, color:LIGHT_TEXT, valign:"top", margin:0 });
  });

  // ── Impact bar at bottom ────────────────────────────────
  s1.addShape(pres.shapes.RECTANGLE, {
    x:0.2, y:7.18, w:12.9, h:0.27,
    fill:{color:NAVY}, line:{color:NAVY}
  });
  s1.addText("Impact", {
    x:0.25, y:7.18, w:1.0, h:0.27,
    fontSize:9, color:WHITE, bold:true, valign:"middle", margin:0
  });
  // impact items
  const impacts = [
    {val:"15–20%", txt:"higher solar yield per building vs. unguided placement"},
    {val:"8–12 MW", txt:"peak grid demand reduced per 100 buildings (BESS)"},
    {val:"6.9M", txt:"motorbikes simulated in Directive 20 Ring Road scenarios"},
    {val:"39.2%", txt:"RE target 2045 — directly supported by Module 1"},
  ];
  impacts.forEach((imp, i) => {
    const ix = 1.4 + i * 2.9;
    s1.addText(imp.val + "  ", {
      x:ix, y:7.18, w:1.1, h:0.27,
      fontSize:10, color:"F9A825", bold:true, align:"right", valign:"middle", margin:0
    });
    s1.addText(imp.txt, {
      x:ix+1.1, y:7.18, w:1.75, h:0.27,
      fontSize:7.5, color:WHITE, valign:"middle", margin:0
    });
  });

  await pres.writeFile({ fileName: "/mnt/user-data/outputs/EcoGrid_Section4_v2.pptx" });
  console.log("Done!");
}

main().catch(console.error);