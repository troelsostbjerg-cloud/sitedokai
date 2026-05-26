export type RoleLensId = 'ai' | 'operations' | 'project';

export type RoleLens = {
  id: RoleLensId;
  label: string;
  eyebrow: string;
  headline: string;
  summary: string;
  valueBullets: string[];
  proofIds: string[];
  plan90: {
    days030: string;
    days3160: string;
    days6190: string;
  };
};

export type ProofCard = {
  id: string;
  title: string;
  categories: string[];
  problem: string;
  built: string;
  value: string;
  takeaway: string;
  talkTrack?: string;
};

export const roleLenses: RoleLens[] = [
  {
    id: 'ai',
    label: 'AI implementation',
    eyebrow: 'Role lens A',
    headline: 'For AI implementation and adoption roles',
    summary: 'I am strongest where AI has to leave the demo stage and survive inside daily operations.',
    valueBullets: [
      'Find real use cases in operational work.',
      'Turn vague AI potential into testable PoCs.',
      'Translate between users, operations, leadership and technical teams.',
      'Build early prototypes with AI, no-code and coding-assistant workflows.',
      'Keep adoption, governance and human approval in scope from the beginning.',
    ],
    proofIds: ['sitedokai', 'job-search-ai', 'aeven-roadmap', 'todai-adoption', 'dfds-automation'],
    plan90: {
      days030: 'Map workflows, stakeholders, tools, pain points and candidate use cases.',
      days3160: 'Prototype 2-3 small workflows with users; define success metrics and risk controls.',
      days6190: 'Launch one credible pilot, measure adoption and time saved, then create a reusable workflow pattern and backlog.',
    },
  },
  {
    id: 'operations',
    label: 'Operations transformation',
    eyebrow: 'Role lens B',
    headline: 'For operations and transformation roles',
    summary: 'I build structure where work is growing faster than the operating model.',
    valueBullets: [
      'Build operating rhythms, ownership and KPI follow-up.',
      'Reduce manual coordination and ad hoc firefighting.',
      'Improve handovers, reporting, supplier follow-up and decision cadence.',
      'Bring practical AI as a modernisation layer, not as buzzword decoration.',
    ],
    proofIds: ['vitamin-well', 'premium-products', 'sitedokai', 'dfds-automation'],
    plan90: {
      days030: 'Understand operating rhythm, bottlenecks, handovers and KPI reality.',
      days3160: 'Fix the highest-friction coordination loops and define ownership and cadence.',
      days6190: 'Standardise the new rhythm and identify AI-assisted automation candidates.',
    },
  },
  {
    id: 'project',
    label: 'Strategic projects',
    eyebrow: 'Role lens C',
    headline: 'For strategic project and digital transformation roles',
    summary: 'I am useful between business complexity and execution, where someone has to turn noise into a plan people can follow.',
    valueBullets: [
      'Map stakeholders, dependencies and decision points.',
      'Convert messy input into requirements, workflow logic and next actions.',
      'Build 30/60/90-day execution plans.',
      'Communicate clearly across leadership, users and technical teams.',
    ],
    proofIds: ['twoday-pm', 'dfds-automation', 'aeven-roadmap', 'job-search-ai'],
    plan90: {
      days030: 'Map stakeholders, dependencies, decisions and delivery risks.',
      days3160: 'Turn ambiguity into roadmap, pilots, governance and communication rhythm.',
      days6190: 'Ship the first visible outcome and convert learnings into a repeatable delivery model.',
    },
  },
];

export const proofCards: ProofCard[] = [
  {
    id: 'sitedokai',
    title: 'SiteDokAI — manual work to AI workflows',
    categories: ['AI product', 'Automation', 'Strategy / roadmap', 'Adoption / governance'],
    problem: 'Many teams do not have an AI problem; they have recurring workflow friction in emails, spreadsheets, notes, reports and handovers.',
    built: 'Built a founder-led AI operations concept that maps manual workflows, prioritises AI opportunities and designs human-approved AI workflows.',
    value: 'Ability to spot a problem, frame it commercially, create a service model, write the operating logic and ship a public site.',
    takeaway: 'Troels does not just talk about AI adoption. He packages it into something people can understand, buy and use.',
    talkTrack: 'Ask him to unpack one workflow from the homepage and he will show the trigger, input, logic, approval point and output.',
  },
  {
    id: 'job-search-ai',
    title: 'Automated job search AI — daily market scanner',
    categories: ['Automation', 'AI product', 'Strategy / roadmap'],
    problem: 'Job searching creates noise, repetition and poor prioritisation.',
    built: 'Built an AI-driven job scanning workflow that searches public job sources, scores roles against Troels’ profile, deduplicates seen jobs, generates reports and updates dashboards.',
    value: 'Agentic workflow thinking: external data in, scoring logic, prioritisation, reporting and next actions out.',
    takeaway: 'He builds practical systems for his own problems before asking others to trust him with theirs.',
    talkTrack: 'This proves the operating pattern: find recurring friction, codify decisions, generate a useful next action.',
  },
  {
    id: 'aeven-roadmap',
    title: 'Commercial AI roadmap — from capability to service model',
    categories: ['Strategy / roadmap', 'Stakeholder translation', 'AI product'],
    problem: 'How can a technical service company turn AI capabilities into concrete customer-facing services?',
    built: 'Created a role-targeted strategy package with AI commercialization pillars, pricing logic, financial scenario thinking, competitive framing and a 180-day implementation plan.',
    value: 'Can move from company research to commercial AI strategy and execution roadmap.',
    takeaway: 'He shows up with thinking already done, not just interest in the job.',
    talkTrack: 'Financial ideas were framed as scenarios and proposals, not as claims about any company’s actual performance.',
  },
  {
    id: 'dfds-automation',
    title: 'Automation impact plan — operational workflow redesign',
    categories: ['Automation', 'Operations scaling', 'Adoption / governance', 'Stakeholder translation'],
    problem: 'Manual workload, fragmented handovers, unclear ownership and process complexity slow teams down.',
    built: 'Created an automation plan covering manual workload heatmap, workflow blueprints, exception summaries, handover generation, governance templates and a 90-day plan.',
    value: 'Can translate operational complexity into automation opportunities, with governance and adoption built in.',
    takeaway: 'He understands that automation is not a demo; it is trigger, input, logic, approval, output, monitoring and fallback.',
    talkTrack: 'Useful for teams that need someone to bridge operations, Technology and business owners.',
  },
  {
    id: 'vitamin-well',
    title: 'Vitamin Well — scaling operations in a high-growth FMCG setup',
    categories: ['Operations scaling', 'Stakeholder translation'],
    problem: 'Growth creates operational complexity across logistics, procurement, planning, suppliers, commercial teams and retail partners.',
    built: 'Led and scaled Danish operations, built follow-up structures, KPI rhythms, forecasting and reporting practices and cross-functional execution routines.',
    value: 'Real operating experience, not theoretical transformation language.',
    takeaway: 'He knows where work breaks because he has lived inside the work.',
    talkTrack: 'This is the proof that the AI angle is built on operations reality.',
  },
  {
    id: 'premium-products',
    title: 'Premium Products — building the supply chain foundation',
    categories: ['Operations scaling', 'Stakeholder translation'],
    problem: 'A growing consumer products business needed practical operating structure across warehousing, procurement, planning and distribution.',
    built: 'Built hands-on supply chain structure that supported growth and contributed to the foundation later acquired by Vitamin Well.',
    value: 'Can build from low maturity, not only optimise polished enterprise processes.',
    takeaway: 'Useful in scale-ups and teams where the operating model is still forming.',
    talkTrack: 'Ask about this if your team is still creating the machine while running the machine.',
  },
  {
    id: 'todai-adoption',
    title: 'AI adoption profile — workflow, trust and usable delivery',
    categories: ['Adoption / governance', 'Stakeholder translation', 'AI product'],
    problem: 'AI adoption can turn into theatre if it is not grounded in user workflows, trust and usable deliverables.',
    built: 'Positioned a senior AI adoption profile around practical AI workflows, customer translation, governance and hands-on tool use.',
    value: 'Can speak to leaders and operational teams without making AI more mysterious than necessary.',
    takeaway: 'Strong fit for AI consulting, adoption and business-facing implementation roles.',
    talkTrack: 'This is the softer but important layer: communication, trust and repeatable behaviour change.',
  },
  {
    id: 'twoday-pm',
    title: 'Strategic project profile — complexity to execution rhythm',
    categories: ['Strategy / roadmap', 'Stakeholder translation', 'Automation'],
    problem: 'Transformation roles often need someone who can coordinate across vendors, stakeholders and complex operating environments.',
    built: 'Framed Novo Nordisk CMO coordination, Vitamin Well operating model work and AI-assisted workflows as practical project execution evidence.',
    value: 'Can turn ambiguous transformation work into governance, milestones, delivery rhythm and usable AI-supported coordination.',
    takeaway: 'A project profile with operations depth and AI as daily work infrastructure.',
    talkTrack: 'Useful where the work sits between business ownership, technical teams and the people who must adopt the change.',
  },
];

export const proofFilters = [
  'AI product',
  'Automation',
  'Operations scaling',
  'Strategy / roadmap',
  'Stakeholder translation',
  'Adoption / governance',
];

export const workflowTypes = [
  'Status reporting',
  'Supplier updates',
  'Customer requests',
  'Meeting follow-up',
  'Handover',
  'CRM follow-up',
  'Management reporting',
];

export const frequencies = ['Daily', 'Weekly', 'Monthly'];
export const painTypes = ['Time', 'Errors', 'Ownership', 'Decision delay', 'Inconsistent quality'];
export const riskLevels = ['Low', 'Medium', 'High'];

export const workingStyle = [
  ['Fast pattern recognition', 'Sees repeated friction and hidden dependencies quickly.'],
  ['Operator empathy', 'Understands the user who has to use the process on a busy Tuesday.'],
  ['No tool-first AI', 'Starts with the work, then picks the simplest useful setup.'],
  ['Human approval by design', 'AI drafts, people approve when quality, risk or tone matters.'],
  ['Governance without drama', 'Owner, data source, fallback and review rhythm from the start.'],
  ['Bias toward useful output', 'Fewer workshops, more artefacts people can actually use.'],
];

export const operatingModel = [
  ['Product', 'Practical AI workflows for real operational friction.'],
  ['Market', 'Teams where work still lives in emails, spreadsheets, handovers, meetings, reports and people’s memory.'],
  ['Differentiator', 'Operations brain first. AI tool second. Adoption always included.'],
  ['Business model', 'Find the friction. Map the workflow. Prototype the smallest useful solution. Measure whether people actually use it.'],
];
