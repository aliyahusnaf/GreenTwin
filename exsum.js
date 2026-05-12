const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, Header, Footer, VerticalAlign, PageBreak
} = require('docx');
const fs = require('fs');

const GREEN_DARK = "1B5E20";
const GREEN_MID = "2E7D32";
const GREEN_LIGHT = "4CAF50";
const GREEN_BG = "E8F5E9";
const GREEN_HEADER = "C8E6C9";
const TEAL = "00796B";
const GRAY = "546E7A";
const LIGHT_GRAY = "F1F8E9";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

// Section heading (numbered, bold green underline)
function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: GREEN_DARK, size: 24, font: "Georgia" })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: GREEN_LIGHT, space: 3 } }
  });
}

// Sub-heading
function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: GREEN_MID, size: 21, font: "Georgia" })],
    spacing: { before: 130, after: 55 },
  });
}

// Body paragraph — justified, 9.5pt
function p(text, opts = {}) {
  const runs = [];
  if (opts.label) {
    runs.push(new TextRun({ text: opts.label + " ", bold: true, size: 19, font: "Calibri", color: GREEN_DARK }));
  }
  runs.push(new TextRun({ text, size: 19, font: "Calibri", color: "1a1a1a", bold: opts.bold || false, italics: opts.italic || false }));
  return new Paragraph({
    children: runs,
    spacing: { after: opts.after !== undefined ? opts.after : 85, before: opts.before || 0 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function gap(n = 60) {
  return new Paragraph({ children: [new TextRun("")], spacing: { after: n } });
}

// Tick-box row for cover
function tick(checked, text) {
  return new Paragraph({
    children: [new TextRun({ text: (checked ? "☑" : "☐") + "  " + text, size: 19, font: "Calibri", color: "1a1a1a", bold: checked })],
    spacing: { after: 40 },
  });
}

// Two-column info table (label | value)
function infoTable(rows) {
  return new Table({
    width: { size: 10080, type: WidthType.DXA },
    columnWidths: [2200, 7880],
    rows: rows.map(([label, value], i) => new TableRow({
      children: [
        new TableCell({
          borders, width: { size: 2200, type: WidthType.DXA },
          shading: { fill: GREEN_HEADER, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, font: "Calibri", color: GREEN_DARK })] })]
        }),
        new TableCell({
          borders, width: { size: 7880, type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? GREEN_BG : "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 18, font: "Calibri", color: "1a1a1a" })] })]
        }),
      ]
    }))
  });
}

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 19 } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 864, right: 864, bottom: 864, left: 864 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: "EcoGrid Vietnam  ·  Asian Hackathon for Green Future 2026  ·  Renewable Energy & Low-Carbon Mobility", size: 15, color: GREEN_MID, font: "Calibri", bold: true })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: GREEN_LIGHT, space: 3 } },
          spacing: { after: 30 }
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [new TextRun({ text: "Target: Vietnam & Southeast Asia  ·  Solution: AI-Powered Software Platform  ·  ☑ Renewable Energy and Low-Carbon Mobility", size: 15, color: GRAY, font: "Calibri" })],
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: GREEN_LIGHT, space: 3 } },
          spacing: { before: 30 }
        })]
      })
    },
    children: [

      // ══════════════════════════════════════════
      // COVER TITLE BLOCK
      // ══════════════════════════════════════════
      new Table({
        width: { size: 10080, type: WidthType.DXA },
        columnWidths: [10080],
        rows: [new TableRow({ children: [new TableCell({
          borders: { top: { style: BorderStyle.SINGLE, size: 8, color: GREEN_MID }, bottom: { style: BorderStyle.SINGLE, size: 8, color: GREEN_MID }, left: { style: BorderStyle.SINGLE, size: 8, color: GREEN_MID }, right: { style: BorderStyle.SINGLE, size: 8, color: GREEN_MID } },
          shading: { fill: GREEN_BG, type: ShadingType.CLEAR },
          margins: { top: 140, bottom: 140, left: 260, right: 260 },
          children: [
            new Paragraph({ children: [new TextRun({ text: "EcoGrid Vietnam", bold: true, size: 52, color: GREEN_DARK, font: "Georgia" })], alignment: AlignmentType.CENTER, spacing: { after: 50 } }),
            new Paragraph({ children: [new TextRun({ text: "AI-Powered 3D Urban Energy & Mobility Intelligence Platform", size: 21, color: TEAL, font: "Calibri", italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 70 } }),
            new Paragraph({ children: [new TextRun({ text: "☑  Renewable Energy and Low-Carbon Mobility  ·  ☑  Software / Platform", bold: true, size: 19, color: GREEN_MID, font: "Calibri" })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
          ]
        })]})],
      }),

      gap(100),

      // ══════════════════════════════════════════
      // SECTION 1: PROJECT OVERVIEW
      // ══════════════════════════════════════════
      h1("1. PROJECT OVERVIEW"),

      h2("1.1 Project Title"),
      p("EcoGrid Vietnam: AI-Powered 3D Urban Energy & Mobility Intelligence Platform"),

      h2("1.2 Key Challenge Area"),
      tick(true,  "Renewable Energy and Low-Carbon Mobility"),
      tick(false, "Urban Air Quality and Climate Resilience"),
      tick(false, "Water Resources and Climate-Resilient Agriculture"),

      gap(40),
      h2("1.3 Solution Category"),
      tick(false, "Mobile App / Web App"),
      tick(true,  "Software / Platform"),
      tick(false, "Hardware / IoT Device"),
      tick(false, "Integrated Solution (Hardware + Software)"),
      tick(false, "Others"),

      gap(40),
      h2("1.4 Project Summary"),
      p("Vietnam's low-carbon transition is trapped in a structural deadlock: government enacts bold mobility policies—like Hanoi's Directive 20 gasoline motorbike ban starting July 2026—without knowing whether energy infrastructure can support the transition, while developers build EVSE and solar installations without knowing whether the local grid can absorb the added load. EcoGrid Vietnam resolves this coordination failure by acting as a shared AI-powered intelligence layer between the private sector and government on one integrated 3D platform. The Smart Infrastructure Planning module uses physics-based solar ray-casting simulation, AI grid stability analysis, and BESS sizing algorithms to help developers design solar-optimized, EV-charging-ready, grid-stable buildings from day one. The Low-Carbon Mobility Policy Simulation module uses Agent-Based Modeling (ABM), an emission physics engine, and Explainable AI (XAI) to let government agencies test mobility policy scenarios—visualized in a live 3D city environment—before real-world implementation. Key technologies include CesiumJS 3D Digital Twin rendering, the Anthropic Claude API for natural language policy reports, SHAP/LIME for explainability, and a Vietnam-calibrated data stack of EVN grid topology, Solargis GHI irradiance, and MoNRE emission factors. Primary beneficiaries are real estate developers and ESG investors in Vietnam and Southeast Asia, municipal governments and transport departments implementing EV transition policies, and ultimately urban residents who gain cleaner air and reliable EV charging infrastructure."),

      // ══════════════════════════════════════════
      // SECTION 2: CONTEXT AND PROBLEM STATEMENT
      // ══════════════════════════════════════════
      h1("2. CONTEXT AND PROBLEM STATEMENT"),

      p("Vietnam and Southeast Asia are urbanizing at a pace that far outstrips the development of green energy and transport infrastructure. Vietnam emitted approximately 374 Mt CO₂e in 2022, with transport and energy collectively responsible for over 60% of urban greenhouse gas emissions. Hanoi's PM2.5 concentrations regularly reach 40 µg/m³—nearly double WHO limits—with 58–74% of road emissions attributed to motorbikes, making the city's 6.9 million registered two-wheelers the single largest urban air quality challenge in the country. The urgency is acute: under Directive 20 issued by Prime Minister Pham Minh Chinh in July 2025, Hanoi must ban fossil-fuel motorbikes within Ring Road 1 from July 1, 2026, expanding to Ring Road 2 by 2028 and Ring Road 3 by 2030—one of the largest urban mobility transitions in Asia, affecting tens of millions of commuters. Vietnam's Ministry of Transport has set a parallel target of 30% of cars and 22% of motorbikes nationwide to be electric-powered by 2030, while the National Energy Development Strategy targets 39.2% renewable energy in the national power mix by 2045."),

      p("The core problem, however, is not a lack of ambition—it is a coordination failure between the two actors whose decisions collectively determine whether these targets are met. On the energy supply side, new commercial buildings continue to be constructed without solar readiness or grid-impact assessment, adding uncoordinated load to a system already experiencing emergency demand spikes (Northern Vietnam grid failures, June 2023). The World Bank (2024) warns Vietnam must grow grid capacity by 4% and electricity generation by 5% by 2035 just to absorb projected EV charging demand—yet no planning tool currently connects individual developer decisions to city-level grid impact. On the mobility demand side, EV sales surged 2.5× in 2024 but charging infrastructure has not kept pace: a 2024 study by Foreign Trade University HCMC found that 70% of consumers want to buy an EV, yet 18% abandon the decision specifically because public charging points are insufficient. HSBC estimates Vietnam needs USD 12 billion in charging station investment for widespread EV adoption—an amount that will not materialize without coordinated planning. The consequence is a deadlock: government cannot confidently implement Directive 20 without knowing whether the grid and charging network can absorb the transition; developers cannot confidently invest in EVSE without knowing where government will concentrate EV demand. Neither side has the data to act, so both act too slowly. Directly affected stakeholders include urban residents bearing air pollution health costs (70,000 premature deaths annually in Vietnam, UNICEF 2019), private developers and ESG investors exposed to stranded-asset risk, municipal transport departments responsible for Directive 20 compliance, grid operator EVN facing uncoordinated peak demand, and EVSE operators unable to place infrastructure efficiently without demand forecasts."),

      // ══════════════════════════════════════════
      // SECTION 3: EXISTING SOLUTIONS AND GAP ANALYSIS
      // ══════════════════════════════════════════
      h1("3. EXISTING SOLUTIONS AND GAP ANALYSIS"),

      p("Several tools address partial aspects of this problem in isolation. Google Project Sunroof estimates rooftop solar potential using satellite imagery, but is unavailable in Vietnam and Southeast Asia, uses no 3D neighbor-shading simulation, and has no connection to grid stability or EVSE planning. Autodesk Insight 360 and EnergyPlus perform building-level thermal and energy simulation for architects, but cover HVAC optimization only—with no spatial grid integration, no BESS sizing, and no EV infrastructure component. PTV Vissim and SUMO simulate vehicle traffic flows and are used by some Southeast Asian transport departments, but provide no emission modeling, no behavioral policy response (ABM), and no renewable energy integration. National-level tools such as Climate TRACE and BNEF Pathways Explorer track aggregate GHG trends but cannot operate at the city block or building level required for actionable planning. VinFast's V-Green charging app serves consumer-facing EVSE discovery but provides no grid-level planning or policy simulation capability."),

      p("Three critical gaps cut across all existing solutions. First, none operates across both the energy supply domain (solar, grid, BESS) and the mobility demand domain (behavioral response, emissions, policy) simultaneously—meaning the compounding interdependencies between a developer's EVSE installation and the city's motorbike transition policy are invisible to every current tool. Second, none is calibrated to Vietnam or Southeast Asian conditions: existing platforms use temperate-climate solar defaults, European or North American grid models, and Western urban morphology that fundamentally misrepresent tropical rooftop irradiance, Vietnam's grid topology, and the two-wheeler-dominant transport behavior of the region. Third, none provides a real-time 3D spatial environment that makes complex AI outputs interpretable to non-technical government users—the gap between technical expert analysis and ministerial decision-making remains unbridged, causing delays and poorly calibrated policy rollout."),

      // ══════════════════════════════════════════
      // SECTION 4: PROPOSED SOLUTION AND CORE FEATURES
      // ══════════════════════════════════════════
      h1("4. PROPOSED SOLUTION AND CORE FEATURES"),

      p("EcoGrid Vietnam is a web-based AI platform with a 3D Digital Twin layer that acts as a shared intelligence layer connecting private developers and government agencies on one integrated environment. Its fundamental insight is that Vietnam's low-carbon transition cannot succeed if developers and government plan in isolation: developer EVSE installations determine grid load; government mobility policies determine EV demand; renewable energy capacity must grow in coordination with both. The platform creates a closed feedback loop between these actors—developer infrastructure plans feed into city-level energy demand forecasts; policy simulation outputs guide where developers should prioritize solar and EVSE deployment; and the 3D Digital Twin built on Vietnam-specific urban geometry, Solargis GHI data, EVN grid topology, and MoNRE emission factors provides the common spatial context that makes cross-sector coordination coherent."),

      p("", { label: "Feature 1 — Sub-Feature 1A: Grid Stability, BESS Sizing & EVSE Placement (Macro Scale).", after: 0 }),
      p("The AI engine ingests EVN historical grid load profiles to compute a proposed building or EVSE cluster's anticipated peak demand and checks it against local transformer capacity. If the peak load exceeds safe limits—a recurring risk in Vietnam's rapidly developing districts—the system automatically sizes the optimal Battery Energy Storage System (BESS) in kWh to prevent grid instability, with cost estimates and payback period. The same sub-feature applies a cable loss minimization algorithm (minimizing ∑I²·R·L) to determine the most energy-efficient physical placement of EV charging piles within the parking structure. A 3D underground X-ray view displays existing cable trenches, transformer positions, and nearest grid connection points, eliminating costly trial-and-error site surveys."),

      p("", { label: "Feature 1 — Sub-Feature 1B: Solar Rooftop Optimization (Micro Scale).", after: 0 }),
      p("The engine performs a full annual solar irradiance ray-casting simulation on the 3D building model using Vietnam-specific GHI data from Solargis. Rather than applying generic irradiance averages, the system casts shadow volumes from surrounding buildings hour-by-hour across a synthetic full year—identifying which rooftop zones receive unobstructed sunlight in every season, accounting for neighbor buildings, parapets, and rooftop equipment. Developers drag solar panel arrays onto the 3D rooftop and receive live AI feedback: annual kWh yield, CO₂ offset in tonnes, and financial payback period. This directly advances Vietnam's 39.2% renewable energy target by 2045 by ensuring every installation generates maximum clean energy rather than underperforming on shaded zones. Output: a bankable Energy Efficiency & Grid Readiness Certificate for regulatory submission and ESG investor reporting."),

      p("", { label: "Feature 2 — Low-Carbon Mobility Policy Simulation.", after: 0 }),
      p("The most urgent use case is Hanoi's Directive 20: a ban on fossil-fuel motorbikes within Ring Road 1 from July 2026, expanding citywide by 2030, affecting 6.9 million registered motorbikes in a city where two-wheeled vehicles meet 72.6% of transport needs (ICCT, 2022). The AI engine runs an Agent-Based Model of tens of thousands of synthetic citizen agents calibrated with GSO household survey socioeconomic data. When a policy is applied—the Ring Road 1 ban, an accelerated Ring Road 3 expansion, or a varied EV subsidy level—the ABM predicts behavioral shifts: what share transitions to electric motorbikes, shifts to the BRT electric corridor, or faces mobility exclusion due to affordability constraints. Using IPCC Tier 2 emission factors localized with MoNRE data, the platform simultaneously computes resulting changes in CO₂, NOx, and PM2.5. Critically, the Renewable Energy Demand Forecaster calculates how much additional green electricity must be generated to power the newly electric fleet—explicitly flagging whether the transition reduces net emissions or merely shifts them from exhaust pipes to coal plants. Results appear as Explainable AI (XAI) plain-language reports (generated via Anthropic Claude API) and as a live 3D volumetric pollution fog layer that thins in real time as policymakers adjust the zone boundary, timeline, and subsidy sliders."),

      // ══════════════════════════════════════════
      // SECTION 5: INNOVATION AND COMPETITIVE ADVANTAGE
      // ══════════════════════════════════════════
      h1("5. INNOVATION AND COMPETITIVE ADVANTAGE"),

      p("EcoGrid Vietnam's primary innovation is the feedback loop architecture itself: no existing platform simultaneously optimizes renewable energy supply and simulates behavioral mobility demand, or connects developer infrastructure decisions to government policy outcomes in a shared spatial environment. This cross-domain integration captures compounding effects invisible to single-domain tools—for example, mass EV adoption increasing grid load precisely when rooftop solar can offset it, or a motorbike ban accelerating EVSE demand in specific districts before developers have planned for it. The second breakthrough is Vietnam-first calibration: EVN grid topology, MoNRE Tier 2 emission factors, GSO transport survey microdata, and Solargis tropical GHI data replace the European and North American defaults that make every existing platform structurally inaccurate for Southeast Asian conditions. The third innovation is real-time 3D policy communication: the transition from running a simulation to seeing its result in a living city environment—with volumetric pollution fog responding to slider inputs—eliminates the translation gap between expert analysis and ministerial decision-making, an accountability barrier that has delayed Vietnam's urban policy rollout across multiple reform cycles."),

      p("Competitively, EcoGrid outperforms existing tools on three axes: contextual accuracy (Vietnam-specific data versus generic global defaults), integration breadth (energy supply and mobility demand simultaneously versus either/or), and accessibility (policy slider UI with XAI plain-language output versus enterprise tools requiring specialist consultants at USD 10,000–100,000 per year). For the hackathon prototype, the team will deliver: a functional CesiumJS 3D city tile render of HCMC District 1 with OpenStreetMap building data; a simplified solar ray-casting module producing live kWh feedback on drag-and-drop panel placement; and a policy slider connected to a pre-computed ABM lookup table (10 scenarios × 5 behavioral outcomes) driving the pollution fog animation in real time. The post-hackathon roadmap targets an EVN and Da Nang Smart City Office data partnership by Month 3; full Mesa ABM calibration with GSO 2023 microdata by Month 8; a closed beta with the HCMC Department of Transport for Directive 20 simulation by Month 12; and SaaS commercialization with application to the ADB Urban Climate Change Resilience Trust Fund by Month 18."),

      // ══════════════════════════════════════════
      // SECTION 6: TARGET GROUPS AND POTENTIAL IMPACT
      // ══════════════════════════════════════════
      h1("6. TARGET GROUPS AND POTENTIAL IMPACT"),

      p("EcoGrid Vietnam serves two primary user groups. Group A—Private Sector—comprises real estate developers planning new commercial or mixed-use complexes (addressable market: approximately 3,200 active developers, VREA 2023), ESG fund managers requiring quantified green building metrics for portfolio reporting, and EVSE network operators such as VinFast V-Green and Grab Electric targeting Vietnam's Ministry of Transport goal of 150,000 public EVSE points by 2030. Group B—Public Sector—comprises the Departments of Transport in Vietnam's five Type-1 cities (Hanoi, HCMC, Da Nang, Can Tho, Hai Phong) responsible for implementing Directive 20, city planning boards (BAPPEDA equivalents) in Indonesia, Philippines, and Thailand exploring parallel EV transition policies, and national ministries including MoIT, MoNRE, and the Ministry of Transport."),

      p("On the renewable energy pillar: optimizing solar panel placement across 100 new commercial buildings per year in HCMC is estimated to deliver 15–20% higher annual kWh yield per building compared to unguided installation—equivalent to 8–12 GWh of additional clean electricity per year from the same roof area, directly contributing to Vietnam's 39.2% renewable energy target. IRENA estimates Vietnam holds over 15 GW of technically viable but untapped rooftop solar potential; EcoGrid's bankable certificate reduces investor risk and accelerates capital deployment into this resource. BESS optimization across those buildings is estimated to reduce peak grid demand by 8–12 MW, cutting the frequency of fossil-fuel peaker plant activations—each of which represents a measurable emissions spike in a grid where coal still supplies over 35% of total electricity. On the low-carbon mobility pillar: government adoption of the Policy Simulation module in one Type-1 city could accelerate Directive 20 implementation by 12–18 months, compressing the timeline for reducing the approximately 11 Mt CO₂e per year that transport currently contributes to Vietnam's national total. The ABM's equity modeling—flagging which income segments face mobility exclusion during the gasoline ban—enables targeted subsidy design that protects low-income commuters, addressing the social backlash risk that has derailed analogous reforms in Indonesia and Thailand. Economically, developers using the platform avoid wasted capital on undersized solar systems or overcapacity BESS installations, with estimated savings of USD 50,000–200,000 per project; governments avoiding poorly calibrated policies prevent reversal costs that comparable Southeast Asian cases place at USD 5–50 million per rollback."),

      // ══════════════════════════════════════════
      // SECTION 7: TECHNOLOGIES APPLIED
      // ══════════════════════════════════════════
      h1("7. DESCRIPTION OF TECHNOLOGIES APPLIED"),

      h2("7A. Proposed Technologies"),
      p("Frontend & 3D Visualization: React.js + TypeScript (component-based SPA), CesiumJS (3D globe and urban tile rendering with OpenStreetMap building extrusion), Three.js (custom GLSL shaders for volumetric pollution fog and dynamic shadow volume rendering), Tailwind CSS. AI & Computation Backend: Python 3.11 + FastAPI (core AI computation server), Mesa (Agent-Based Modeling framework for mobility behavioral simulation), NumPy / SciPy (physics-based solar irradiance ray-casting and cable loss optimization), Scikit-learn (regression models for predictive load balancing trained on EVN consumption data), SHAP / LIME (Explainable AI libraries for policy impact attribution), Anthropic Claude API — claude-sonnet-4-20250514 (natural language XAI report generation). Data & Geospatial: GDAL / GeoPandas (spatial data processing), OpenStreetMap Overpass API (building footprints and heights for HCMC, Hanoi, Da Nang), Solargis Vietnam GHI Dataset (1 km resolution annual irradiance), PostGIS on PostgreSQL (spatial database for grid topology and simulation outputs). Infrastructure: Docker + Docker Compose (containerized microservices), AWS Southeast Asia region EC2 + RDS + ElastiCache Redis (compute, database, real-time caching), WebSocket API (live delta updates for drag-and-drop and slider interactions)."),

      h2("7B. System Architecture & Technical Approach"),
      p("EcoGrid Vietnam follows a four-layer microservices architecture. Layer 1 — Data Ingestion & Preprocessing normalizes inputs from EVN grid APIs, OpenStreetMap, Solargis GHI rasters, MoNRE emission factor tables, GSO household survey data, and AirVisual PM2.5 baselines into standardized GeoJSON building objects enriched with area-level grid capacity attributes. Layer 2 — AI Computation Engine runs three sub-engines in parallel: the Solar Ray-Casting Engine iterates hour-by-hour sun azimuth and elevation angles across a synthetic full year, casting shadow volumes from surrounding 3D building geometry and multiplying unshaded zone areas by local GHI to yield annual kWh/m²; the Grid Load & BESS Optimizer applies Scikit-learn regression models trained on EVN historical data to predict peak demand for proposed buildings, then solves for the minimum BESS capacity ensuring peak demand remains at or below 90% of local transformer rated capacity at all hours; and the ABM Mobility Simulator runs Mesa agent populations with 24-hour time-stepped simulations, updating travel mode splits in response to policy constraints and feeding outputs to the Emission Physics Engine for IPCC Tier 2 CO₂ and PM2.5 computation. Layer 3 — API Gateway (REST + WebSocket) exposes computation results to the frontend in real time, pushing delta updates for live drag-and-drop and slider interactions without full page reloads. Layer 4 — 3D Frontend renders the CesiumJS city tileset with dynamic shadow volumes and Three.js volumetric fog, calls the Anthropic Claude API to generate XAI natural language summaries as inline tooltips and downloadable PDF policy reports, and provides the drag-and-drop solar placement and policy slider UI."),

      h2("7C. Data and Infrastructure Requirements"),
      p("Data sources: EVN (Vietnam Electricity) historical grid load profiles and transformer capacity data by distribution zone; MoNRE Vietnam IPCC Tier 2 GHG emission factors for electricity generation and transport fuel combustion; General Statistics Office of Vietnam 2023 Household Living Standards Survey for ABM agent calibration; Solargis 1 km resolution Vietnam GHI raster (free academic tier); OpenStreetMap Overpass API for building footprint and height data (open license); AirVisual / IQAir historical PM2.5 concentration maps for Hanoi and HCMC as simulation baselines. Infrastructure: hackathon phase requires only local development environment and Anthropic API access; post-hackathon deployment targets AWS EC2 c5.2xlarge for AI computation, AWS RDS PostGIS for spatial data, and AWS ElastiCache Redis for real-time caching, at an estimated monthly cost of USD 300–800 during the closed beta phase, scaling to multi-region Southeast Asia deployment on commercial launch."),

      // ══════════════════════════════════════════
      // SECTION 8: REFERENCES
      // ══════════════════════════════════════════
      h1("8. REFERENCES"),

      p("[1] World Bank (2024). World Bank Report Recommends Pathways for Transitioning to Electric Mobility in Viet Nam. https://www.worldbank.org/en/news/press-release/2024/11/22. [2] IEA (2023). Southeast Asia Energy Outlook 2023. https://www.iea.org/reports/southeast-asia-energy-outlook-2023. [3] Vu Truc Quynh et al. (2024). Electric Vehicle Charging Stations Placement Optimization in Vietnam Using MINLP. arXiv:2412.16025. [4] MoNRE Vietnam (2023). Vietnam's Updated Nationally Determined Contribution (NDC) 2022. Government of Vietnam. [5] Prime Minister's Office, Vietnam (2025). Directive 20 on Low-Emission Zones and Fossil-Fuel Motorbike Restrictions in Hanoi. [6] ICCT (2022). Two-Wheel Electric Vehicle Markets in Vietnam. International Council on Clean Transportation. [7] Hanoi People's Council (2025). Draft Resolution on Low-Emission Zone within Ring Road 1, Hanoi. VietnamPlus, November 2025. [8] HSBC / Rest of World (2024). Vietnam's EV Charging Network Expansion. https://restofworld.org/2024/vietnam-ev-charging-network-expansion-landowners. [9] IRENA (2023). Rooftop Solar Market in ASEAN. IRENA Publications. [10] UNDP (2024). Net Zero Transport: EV Infrastructure Roadmap for Vietnam. https://www.undp.org/sites/g/files/zskgke326/files/2024-12/main_report_to_drvn_en_29.11.2024.pdf. [11] Anari Energy (2025). Unlocking Vietnam's EV Charging Goldmine. https://www.anariev.com. [12] IPCC (2006). Guidelines for National Greenhouse Gas Inventories, Volume 2: Energy. [13] Solargis. Global Solar Atlas: Vietnam GHI Data. https://globalsolaratlas.info. [14] Lundberg S.M. & Lee S.-I. (2017). A Unified Approach to Interpreting Model Predictions (SHAP). NeurIPS 30, 4765–4774. [15] UNICEF / Vietnam.vn (2019). Air Pollution and Premature Mortality in Vietnam. [16] VAMA (2024). Vietnam Electric Vehicle Sales Report 2024. Vietnam Automobile Manufacturers Association. [17] MoIT Vietnam (2023). National Energy Development Strategy to 2030, Vision to 2045 (Resolution 55-NQ/TW).", { color: "444444" }),

    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('EcoGrid_Vietnam_5Page.docx', buf);
  console.log('Done!');
}).catch(console.error);