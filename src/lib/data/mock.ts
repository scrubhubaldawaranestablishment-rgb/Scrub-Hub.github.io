import type { PromptContext } from "@/lib/ai/prompts";
import type {
  GeneratedCompetitor,
  GeneratedInsight,
  GeneratedOpportunity,
  GeneratedProspect,
} from "@/lib/ai/prompts";

const SAUDI_CITIES = [
  "Riyadh",
  "Jeddah",
  "Dammam",
  "Khobar",
  "Makkah",
  "Madinah",
  "Tabuk",
  "Abha",
];

function hashContext(ctx: PromptContext): number {
  const str = `${ctx.whatTheySell}-${ctx.targetMarket}-${ctx.location}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const OPPORTUNITY_TEMPLATES = [
  {
    title: "Corporate Facility Management Contracts",
    title_ar: "عقود إدارة المرافق للشركات",
    description:
      "Large enterprises in Riyadh are outsourcing facility management to specialized providers under Vision 2030 privatization initiatives.",
    why_it_matches:
      "Your service portfolio aligns with the growing demand for outsourced operational excellence in corporate campuses.",
    revenue_potential: 450000,
    confidence_score: 91,
    recommended_action:
      "Target NEOM contractors and Aramco suppliers with a tailored enterprise proposal.",
  },
  {
    title: "Hospitality Sector Expansion",
    title_ar: "توسع قطاع الضيافة",
    description:
      "Saudi tourism targets 150M visitors by 2030, creating massive demand for hospitality support services.",
    why_it_matches:
      "Hotels and resorts need reliable local partners for ongoing operational support.",
    revenue_potential: 320000,
    confidence_score: 88,
    recommended_action:
      "Partner with 3-5 boutique hotels in AlUla and Red Sea Project zones.",
  },
  {
    title: "Healthcare Facility Partnerships",
    title_ar: "شراكات المرافق الصحية",
    description:
      "Private healthcare expansion under Saudi Health Transformation Program creates recurring service contracts.",
    why_it_matches:
      "Clinics and hospitals require specialized, compliant service providers with local presence.",
    revenue_potential: 280000,
    confidence_score: 86,
    recommended_action:
      "Approach Seha Virtual and private hospital groups in Riyadh and Jeddah.",
  },
  {
    title: "Government Tender Pipeline",
    title_ar: "خط أنابيب المناقصات الحكومية",
    description:
      "Etimad platform lists thousands of active tenders matching your service category.",
    why_it_matches:
      "Your operational capacity meets government procurement requirements for local content.",
    revenue_potential: 750000,
    confidence_score: 82,
    recommended_action:
      "Register on Etimad and prepare SAMA-compliant documentation.",
  },
  {
    title: "Industrial City Contracts",
    title_ar: "عقود المدن الصناعية",
    description:
      "MODON industrial cities across Saudi Arabia need ongoing maintenance and support services.",
    why_it_matches:
      "Industrial tenants prefer bundled service providers with rapid response capabilities.",
    revenue_potential: 520000,
    confidence_score: 84,
    recommended_action:
      "Contact MODON tenant relations in 2nd Industrial City, Riyadh.",
  },
  {
    title: "Retail Chain Standardization",
    title_ar: "توحيد معايير سلاسل التجزئة",
    description:
      "Major retail groups are standardizing vendor relationships across 500+ locations nationwide.",
    why_it_matches:
      "Multi-location contracts offer predictable recurring revenue with scale economies.",
    revenue_potential: 390000,
    confidence_score: 79,
    recommended_action:
      "Pitch centralized vendor program to Panda, BinDawood, and Tamimi Markets.",
  },
  {
    title: "Education Sector Growth",
    title_ar: "نمو قطاع التعليم",
    description:
      "Private schools and universities expanding under Human Capability Development Program.",
    why_it_matches:
      "Educational institutions need year-round reliable service partners with child-safe certifications.",
    revenue_potential: 210000,
    confidence_score: 77,
    recommended_action:
      "Target international school networks in Riyadh's Diplomatic Quarter.",
  },
  {
    title: "Logistics Hub Integration",
    title_ar: "تكامل مراكز اللوجستيات",
    description:
      "Saudi logistics sector growing 8% annually with new free zones and bonded warehouses.",
    why_it_matches:
      "Warehouses and distribution centers require 24/7 operational support.",
    revenue_potential: 410000,
    confidence_score: 83,
    recommended_action:
      "Connect with SPL (Saudi Post Logistics) and Agility warehouse operators.",
  },
  {
    title: "Real Estate Developer Partnerships",
    title_ar: "شراكات مطوري العقارات",
    description:
      "Major developers launching mixed-use projects need pre-handover service agreements.",
    why_it_matches:
      "Early integration with developers secures long-term contracts before tenant occupancy.",
    revenue_potential: 680000,
    confidence_score: 80,
    recommended_action:
      "Engage ROSHN and Jeddah Central Project procurement teams.",
  },
  {
    title: "SME Digital Transformation",
    title_ar: "التحول الرقمي للمنشآت الصغيرة",
    description:
      "Monsha'at programs subsidize SME service adoption, creating a funded buyer segment.",
    why_it_matches:
      "SMEs need affordable, scalable solutions with quick implementation timelines.",
    revenue_potential: 150000,
    confidence_score: 74,
    recommended_action:
      "List on Meras platform and offer Monsha'at-eligible pricing tiers.",
  },
];

const PROSPECT_TEMPLATES = [
  { company_name: "Saudi Aramco Total Refining", industry: "Energy & Petrochemicals", fit_score: 94 },
  { company_name: "Almarai Company", industry: "Food & Beverage", fit_score: 91 },
  { company_name: "SABIC", industry: "Manufacturing", fit_score: 89 },
  { company_name: "King Faisal Specialist Hospital", industry: "Healthcare", fit_score: 87 },
  { company_name: "Riyadh Front Development", industry: "Real Estate", fit_score: 85 },
  { company_name: "Saudi Airlines Catering", industry: "Aviation Services", fit_score: 83 },
  { company_name: "Jarir Marketing Company", industry: "Retail", fit_score: 81 },
  { company_name: "Nadec", industry: "Agriculture & Food", fit_score: 78 },
];

const COMPETITOR_TEMPLATES = [
  {
    name: "Elite Services Group",
    strength: "Established government relationships and 15-year market presence",
    weakness: "Slow digital adoption and limited SME focus",
    suggested_advantage: "Offer faster onboarding with digital reporting dashboard",
  },
  {
    name: "Gulf Operations Co.",
    strength: "Low pricing and wide geographic coverage",
    weakness: "Quality inconsistency and high staff turnover",
    suggested_advantage: "Position on quality guarantees and dedicated account managers",
  },
  {
    name: "National Support Services",
    strength: "Large workforce and 24/7 availability",
    weakness: "Generic offerings without industry specialization",
    suggested_advantage: "Develop vertical-specific packages for healthcare and hospitality",
  },
  {
    name: "ProServe Arabia",
    strength: "Strong brand in Eastern Province industrial sector",
    weakness: "Limited presence in Riyadh and Western region",
    suggested_advantage: "Expand Riyadh operations with local partnership strategy",
  },
  {
    name: "Smart Solutions KSA",
    strength: "Technology-enabled service delivery",
    weakness: "Higher price point and limited offline capabilities",
    suggested_advantage: "Combine tech efficiency with on-ground Saudi expertise",
  },
];

const INSIGHT_TEMPLATES = [
  {
    market_trend:
      "Saudi private sector spending increased 12% YoY driven by Vision 2030 mega-projects",
    recommended_action:
      "Allocate 40% of sales efforts to NEOM, Qiddiya, and Red Sea Project suppliers",
    growth_opportunity:
      "Untapped mid-market segment: companies with 50-200 employees seeking enterprise-grade services at SME prices",
  },
  {
    market_trend:
      "Local Content (Iktva) requirements now mandatory for government contracts above 5M SAR",
    recommended_action:
      "Obtain Iktva certification and highlight Saudi workforce percentage in proposals",
    growth_opportunity:
      "Joint ventures with international firms needing local content compliance partners",
  },
  {
    market_trend:
      "Remote work adoption in Riyadh corporate sector increased facility management outsourcing by 23%",
    recommended_action:
      "Launch hybrid workplace support packages targeting tech companies in King Abdullah Financial District",
    growth_opportunity:
      "Co-working spaces and serviced offices needing flexible service agreements",
  },
  {
    market_trend:
      "Healthcare privatization accelerating with 290 private hospitals planned by 2030",
    recommended_action:
      "Develop healthcare-specific compliance documentation and CBAHI-aligned processes",
    growth_opportunity:
      "Medical city developments in Riyadh and Jeddah seeking turnkey service partners",
  },
  {
    market_trend:
      "E-commerce logistics growing 35% annually with new fulfillment centers across Saudi Arabia",
    recommended_action:
      "Partner with last-mile delivery companies for bundled warehouse support services",
    growth_opportunity:
      "Cross-border e-commerce hubs in Jeddah Islamic Port free zone",
  },
];

export function getMockOpportunities(ctx: PromptContext): GeneratedOpportunity[] {
  const offset = hashContext(ctx) % 3;
  return OPPORTUNITY_TEMPLATES.map((t, i) => ({
    ...t,
    title: i === 0 ? `${t.title} — ${ctx.targetMarket}` : t.title,
    revenue_potential: t.revenue_potential + (offset * 10000) + i * 5000,
    confidence_score: Math.min(98, t.confidence_score + (offset % 5)),
  }));
}

export function getMockProspects(ctx: PromptContext): GeneratedProspect[] {
  return PROSPECT_TEMPLATES.map((p, i) => ({
    ...p,
    location: `${SAUDI_CITIES[i % SAUDI_CITIES.length]}, Saudi Arabia`,
    why_they_match: `${p.company_name} operates in ${ctx.targetMarket} and has active procurement needs matching your ${ctx.whatTheySell} offerings. Their scale and location in ${ctx.location} make them an ideal fit.`,
    fit_score: Math.min(98, p.fit_score + (hashContext(ctx) % 7)),
  }));
}

export function getMockCompetitors(ctx: PromptContext): GeneratedCompetitor[] {
  return COMPETITOR_TEMPLATES.map((c) => ({
    ...c,
    suggested_advantage: `${c.suggested_advantage} for ${ctx.whatTheySell} in ${ctx.location}.`,
  }));
}

export function getMockInsights(ctx: PromptContext): GeneratedInsight[] {
  return INSIGHT_TEMPLATES.map((ins) => ({
    ...ins,
    growth_opportunity: `${ins.growth_opportunity} Relevant for businesses selling ${ctx.whatTheySell}.`,
  }));
}
