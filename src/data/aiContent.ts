export const siteBaseUrl = 'https://sitedokai.com';
export const contactEmail = 'info@sitedokai.com';

export const ctaLabels = {
  primary: 'Send your workflow',
  audit: 'Start with a Manual Work Audit',
  examples: 'See workflow examples',
  partner: 'Talk about ongoing support',
} as const;

export const services = [
  {
    id: 'manual-work-audit',
    name: 'Manual Work Audit',
    path: '/manual-work-audit',
    legacyPath: '/hjemmeside-tjek',
    eyebrow: 'Recommended first step',
    title: 'Find the workflows where AI can safely help.',
    description:
      'A 5-business-day audit that maps recurring manual workflows, prioritizes AI opportunities and gives your team the top 3 workflows to start with.',
    shortAnswer:
      'Manual Work Audit maps messy recurring workflows, scores where AI and better structure can create value, and gives your team a practical starting point before anything is built.',
    priceLabel: 'From DKK 15,000 excl. VAT',
    priceValue: '15000',
    duration: '5 business days',
    ctaLabel: ctaLabels.audit,
    interest: 'Manual Work Audit',
    recommended: true,
    bestFor:
      'Teams that want to know where AI actually makes sense before buying tools, launching a big roadmap or automating the wrong work.',
    fit: [
      'Recurring work lives in email, spreadsheets, Teams, Slack, CRM notes or reports.',
      'The team has tried AI, but still does not know where it belongs in daily operations.',
      'You need a decision-ready view before building or buying anything.',
      'Ownership, quality or follow-up keeps disappearing between people and systems.',
    ],
    outputs: [
      'Process map',
      'Prioritized workflow backlog',
      'Top 3 AI workflow candidates',
      'First workflow sketch',
      'Fit, risk and adoption score',
      'Suggested next step',
      'Measurement points',
    ],
    notIncluded: [
      'No built automation',
      'No tool purchase',
      'No full system replacement',
      'No giant AI roadmap',
    ],
    nextStep:
      'After the audit, you decide whether the first workflow should be simplified manually, built in an AI Workflow Sprint or parked because AI is not the right first step.',
    process: [
      'Collect examples of the recurring workflow and the tools it touches.',
      'Interview the people who do the work, wait for the work or approve the output.',
      'Map the real process, including exceptions, delays and ownership gaps.',
      'Score opportunities by effect, risk, complexity and adoption.',
      'Recommend the first workflow, measurement points and safest next step.',
    ],
    faq: [
      {
        question: 'What is a Manual Work Audit?',
        answer:
          'A Manual Work Audit is a 5-business-day review of recurring manual work. It maps the real workflow, prioritizes AI opportunities and gives your team the top 3 workflows to start with.',
      },
      {
        question: 'Do we need to choose an AI tool first?',
        answer:
          'No. SiteDokAI starts with the work. Once the workflow is clear, the simplest useful tool choice becomes easier.',
      },
      {
        question: 'What if our workflow is messy?',
        answer:
          'That is often the reason to start with an audit. If the workflow is unclear, AI usually scales the mess faster.',
      },
      {
        question: 'What happens after the audit?',
        answer:
          'You receive a process map, prioritized backlog, top 3 workflow candidates, a first workflow sketch and a recommended next step.',
      },
    ],
  },
  {
    id: 'ai-workflow-sprint',
    name: 'AI Workflow Sprint',
    path: '/ai-workflow-sprint',
    legacyPath: '/hjemmeside-fix',
    eyebrow: 'Build one workflow',
    title: 'Build one practical AI workflow for a real operational problem.',
    description:
      'A 10-business-day sprint to design, build and test one human-approved AI workflow for a real operational problem.',
    shortAnswer:
      'AI Workflow Sprint turns one selected workflow into a practical AI-assisted workflow with clear input, logic, human approval, output, testing and documentation.',
    priceLabel: 'From DKK 35,000 excl. VAT',
    priceValue: '35000',
    duration: '10 business days',
    ctaLabel: ctaLabels.primary,
    interest: 'AI Workflow Sprint',
    recommended: false,
    bestFor:
      'Teams with one concrete workflow that repeats often enough to justify design, build, testing and adoption work.',
    fit: [
      'A specific workflow has already been selected.',
      'The output can be described clearly enough to test.',
      'Users are available to review and approve the workflow before it is used.',
      'The goal is a practical prototype or working workflow, not a strategy document.',
    ],
    outputs: [
      'Workflow design',
      'AI logic or prompt structure',
      'Automation or prototype',
      'Human approval step',
      'Testing with users',
      'Documentation',
      'Training',
      'Effect measurement',
    ],
    notIncluded: [
      'No blind full automation',
      'No large IT transformation project',
      'No replacement of core systems unless already agreed',
      'No ongoing support after the sprint without a separate agreement',
    ],
    nextStep:
      'After the sprint, the team measures actual use, errors, time saved and the next improvement decision.',
    process: [
      'Confirm the workflow scope, user group, risk level and success criteria.',
      'Define input, AI logic, rules, exceptions, approval and output.',
      'Build the smallest useful workflow in or around the tools the team already uses.',
      'Test with real users, adjust the workflow and document how it should be used.',
      'Agree how effect will be measured after the sprint.',
    ],
    faq: [
      {
        question: 'Is this full automation?',
        answer:
          'Not necessarily. Many useful workflows are AI-assisted rather than fully automated. AI drafts, structures or classifies; people approve where quality, risk or responsibility matters.',
      },
      {
        question: 'What tools can this work with?',
        answer:
          'Typical inputs include email, spreadsheets, Teams, Slack, CRM notes, reports, shared documents and exports from existing systems.',
      },
      {
        question: 'How do you measure effect?',
        answer:
          'The sprint defines simple measurement points such as time saved, fewer follow-ups, fewer errors, faster decisions and actual use by the team.',
      },
    ],
  },
  {
    id: 'ai-operations-partner',
    name: 'AI Operations Partner',
    path: '/ai-operations-partner',
    legacyPath: '/visuelt-loeft',
    eyebrow: 'Ongoing support',
    title: 'Keep AI workflow improvements moving after the first audit or sprint.',
    description:
      'Ongoing practical support for AI workflow backlog, improvements, documentation, adoption and effect measurement.',
    shortAnswer:
      'AI Operations Partner keeps practical AI workflow improvement running through a monthly backlog, workflow upgrades, documentation, training, adoption support and measured effect.',
    priceLabel: 'From DKK 10,000/month excl. VAT',
    priceValue: '10000',
    duration: 'Ongoing',
    ctaLabel: ctaLabels.partner,
    interest: 'AI Operations Partner',
    recommended: false,
    bestFor:
      'Teams that already have workflow candidates or first AI workflows and need a practical partner between operations, people and technology.',
    fit: [
      'The first audit or workflow sprint has created a backlog.',
      'The team needs steady improvement, documentation and adoption support.',
      'AI work should stay close to daily operations instead of becoming a side project.',
      'Leadership wants sober measurement rather than a one-off demonstration.',
    ],
    outputs: [
      'Monthly AI and process backlog',
      'Workflow improvements',
      'Documentation',
      'Training',
      'Adoption support',
      'Measurement',
      'Practical sparring between operations, people and technology',
    ],
    notIncluded: [
      'No passive advisory retainer without a concrete backlog',
      'No generic IT support',
      'No automation of work that should be removed first',
      'No unsupported compliance or security certification claims',
    ],
    nextStep:
      'Agree a monthly rhythm for backlog review, workflow improvement, documentation, training and effect measurement.',
    process: [
      'Review current workflow use, blockers and adoption signals.',
      'Prioritize the next improvements by effect, risk and team capacity.',
      'Build, adjust or document workflows in short cycles.',
      'Report what changed, what was used and what decision comes next.',
    ],
    faq: [
      {
        question: 'What does ongoing support include?',
        answer:
          'It includes practical backlog work, workflow improvements, documentation, training, adoption support, measurement and sparring between operations, people and technology.',
      },
      {
        question: 'When does this make sense?',
        answer:
          'It makes sense after an audit or first workflow sprint, when there is a real backlog and a need to keep improvements moving.',
      },
      {
        question: 'Is this a replacement for an internal AI team?',
        answer:
          'No. It is a practical operating partner for teams that need momentum without turning AI improvement into a large internal program.',
      },
    ],
  },
] as const;

export const workflowExamples = [
  {
    id: 'ai-status-report',
    path: '/workflow-examples/ai-status-report',
    title: 'From status emails to decision-ready weekly updates',
    eyebrow: 'Workflow example',
    description:
      'Turn scattered emails, notes and updates into one AI-assisted status summary with actions, owners, deadlines and decisions.',
    brokenWorkflow:
      'Status is chased across email, Teams, Slack and loose notes. Meetings become status collection instead of decision time.',
    whoFeelsPain:
      'Operations teams, project delivery, leadership teams and anyone who owns weekly coordination.',
    typicalInputs: ['Status emails', 'Teams or Slack threads', 'Meeting notes', 'Project lists', 'CRM updates'],
    aiAssistedWorkflow:
      'AI gathers fixed inputs, summarizes progress, flags missing information, extracts actions and drafts a decision-ready update.',
    humanApproval:
      'The workflow owner reviews actions, owners, deadlines and decision points before anything is shared.',
    output:
      'A weekly status report with progress, risks, owners, deadlines, open questions and decisions needed.',
    goodFitSignals: ['Weekly status rhythm', 'Many input sources', 'Repeated follow-up chasing', 'A stable update format is possible'],
    metrics: ['Time spent collecting status', 'Number of follow-up messages', 'Decision delay', 'Meeting time used for updates'],
    recommendedService: 'Manual Work Audit',
  },
  {
    id: 'management-report',
    path: '/workflow-examples/management-report',
    title: 'From spreadsheets to management reports',
    eyebrow: 'Workflow example',
    description:
      'Turn spreadsheet numbers, comments and recurring variance explanations into a report draft ready for human judgement.',
    brokenWorkflow:
      'Numbers exist, but the management report is rebuilt manually every week or month.',
    whoFeelsPain:
      'Finance, operations, leadership and teams where reporting depends on copy-paste and personal memory.',
    typicalInputs: ['Spreadsheets', 'Exports', 'KPI comments', 'Previous reports', 'Variance notes'],
    aiAssistedWorkflow:
      'AI reads fixed inputs, identifies variances, compares against previous periods and drafts explanations and decision points.',
    humanApproval:
      'The responsible person checks figures, judgement, context and recommendations before the report is used.',
    output:
      'A report draft with metrics, variances, explanations, open questions and suggested decisions.',
    goodFitSignals: ['Same report repeats', 'Manual formatting takes time', 'Variances need explanation', 'Leadership wants decision points'],
    metrics: ['Report preparation time', 'Correction rounds', 'Missing explanations', 'Time available for judgement'],
    recommendedService: 'Manual Work Audit',
  },
  {
    id: 'customer-reply-draft',
    path: '/workflow-examples/customer-reply-draft',
    title: 'From customer request to reply draft',
    eyebrow: 'Workflow example',
    description:
      'Classify customer requests, retrieve context and draft a response with a clear human approval step.',
    brokenWorkflow:
      'Customers receive different answers depending on who handles the request and how much context they can find.',
    whoFeelsPain:
      'Customer support, sales operations and Customer Success teams handling repeated questions or cases.',
    typicalInputs: ['Customer email', 'CRM history', 'Product rules', 'Previous replies', 'Internal guidelines'],
    aiAssistedWorkflow:
      'AI categorizes the request, finds relevant context, drafts a reply and marks anything that should be escalated.',
    humanApproval:
      'A team member approves tone, facts, escalation and responsibility before the customer receives anything.',
    output:
      'A reply draft with category, context, suggested next step and clear checks for the human reviewer.',
    goodFitSignals: ['Repeated request types', 'Known rules', 'Need for consistent tone', 'Human responsibility must remain clear'],
    metrics: ['First response time', 'Escalation quality', 'Correction rate', 'Consistency across replies'],
    recommendedService: 'AI Workflow Sprint',
  },
  {
    id: 'meeting-actions-follow-up',
    path: '/workflow-examples/meeting-actions-follow-up',
    title: 'From meeting notes to actions and follow-up',
    eyebrow: 'Workflow example',
    description:
      'Turn notes, transcripts and loose agreements into actions, owners, deadlines and a follow-up draft.',
    brokenWorkflow:
      'Meetings end with good intentions, but actions live in notebooks, chat messages and memory.',
    whoFeelsPain:
      'Meeting owners, project managers, leadership teams and cross-functional delivery teams.',
    typicalInputs: ['Meeting notes', 'Transcript', 'Agenda', 'Participant list', 'Previous action log'],
    aiAssistedWorkflow:
      'AI separates decisions from discussion, extracts actions, suggests owners and drafts follow-up.',
    humanApproval:
      'The meeting owner approves actions, owners, deadlines and the follow-up message.',
    output:
      'A short meeting summary, prioritized action list, open questions and a follow-up draft.',
    goodFitSignals: ['Many recurring meetings', 'Actions are often lost', 'Follow-up depends on one person', 'Meeting notes already exist'],
    metrics: ['Actions completed on time', 'Follow-up preparation time', 'Missed agreements', 'Repeat discussion in later meetings'],
    recommendedService: 'AI Workflow Sprint',
  },
  {
    id: 'supplier-status-exceptions',
    path: '/workflow-examples/supplier-status-exceptions',
    title: 'From supplier updates to exception overview',
    eyebrow: 'Workflow example',
    description:
      'Turn supplier emails, delays and changes into an exception overview that shows what needs action.',
    brokenWorkflow:
      'Supplier status arrives in different formats and the important exceptions hide inside email text and spreadsheets.',
    whoFeelsPain:
      'Supply chain, procurement, operations and teams coordinating with external suppliers.',
    typicalInputs: ['Supplier emails', 'Status files', 'Order lists', 'Delay notes', 'Known risk categories'],
    aiAssistedWorkflow:
      'AI reads incoming status, detects exceptions, groups reasons and suggests which deliveries need action.',
    humanApproval:
      'Procurement or operations approves the proposed action, escalation and internal update.',
    output:
      'An exception overview with delays, risk, suggested action and a short internal update draft.',
    goodFitSignals: ['Many supplier emails', 'Exceptions are hidden in text', 'Manual copy-paste to status sheets', 'Operations needs a clearer overview'],
    metrics: ['Exception detection time', 'Late escalation', 'Manual copy-paste time', 'Supplier follow-up volume'],
    recommendedService: 'Manual Work Audit',
  },
  {
    id: 'rfq-clarification',
    path: '/workflow-examples/rfq-clarification',
    title: 'From RFQ to clarification list',
    eyebrow: 'Workflow example',
    description:
      'Read customer requests, identify missing information and draft clarification questions or a quote structure.',
    brokenWorkflow:
      'Sales or delivery spends time understanding unclear requests and rewriting the same clarification questions.',
    whoFeelsPain:
      'Sales operations, project delivery, consulting teams and technical specialists receiving repeated RFQs.',
    typicalInputs: ['Customer request', 'Requirements', 'Attachments', 'Previous quotes', 'Scope criteria'],
    aiAssistedWorkflow:
      'AI reviews the request, compares it with fixed criteria, highlights missing information and drafts clarification questions.',
    humanApproval:
      'The responsible person approves questions, risk points and the recommended next step.',
    output:
      'A clarification list, risk points, recommended next step and a draft email or quote structure.',
    goodFitSignals: ['Many similar requests', 'Missing information delays quotes', 'Scope criteria are known', 'Sales writes similar messages repeatedly'],
    metrics: ['Time to qualify request', 'Missing information loops', 'Quote preparation time', 'Clarification quality'],
    recommendedService: 'AI Workflow Sprint',
  },
  {
    id: 'new-customer-onboarding',
    path: '/workflow-examples/new-customer-onboarding',
    title: 'From new customer to onboarding brief',
    eyebrow: 'Workflow example',
    description:
      'Turn sales notes, agreements and internal context into a practical onboarding plan.',
    brokenWorkflow:
      'Important context disappears between sales, delivery and support. The customer starts with questions that should already be answered.',
    whoFeelsPain:
      'Sales, delivery, Customer Success, support and leadership teams responsible for a clean handover.',
    typicalInputs: ['Sales notes', 'Contract points', 'Scope', 'Customer emails', 'Internal commitments'],
    aiAssistedWorkflow:
      'AI gathers context into an onboarding template with tasks, risks, missing information and next actions.',
    humanApproval:
      'The delivery owner approves onboarding tasks, risks, missing information and the first customer message.',
    output:
      'An onboarding brief with first steps, internal tasks, customer questions, risks and a welcome draft.',
    goodFitSignals: ['Frequent handover between sales and delivery', 'Repeated customer starts', 'Context is lost', 'Multiple teams coordinate'],
    metrics: ['Handover preparation time', 'Missing context incidents', 'Customer onboarding delay', 'Rework in first delivery phase'],
    recommendedService: 'Manual Work Audit',
  },
  {
    id: 'crm-follow-up-next-step',
    path: '/workflow-examples/crm-follow-up-next-step',
    title: 'From CRM notes to next best follow-up',
    eyebrow: 'Workflow example',
    description:
      'Turn loose CRM notes and contact history into concrete follow-up suggestions so opportunities do not go cold.',
    brokenWorkflow:
      'CRM is updated unevenly and the next step often lives in a note, an email thread or the salesperson’s memory.',
    whoFeelsPain:
      'Sales operations, sales teams and Customer Success teams managing many open opportunities.',
    typicalInputs: ['CRM notes', 'Emails', 'Last contact', 'Quote status', 'Agreed next steps'],
    aiAssistedWorkflow:
      'AI reads notes and contact history, finds missing information and suggests the next action with a short draft.',
    humanApproval:
      'The owner approves priority, wording and next action before contacting the customer.',
    output:
      'A prioritized follow-up list with suggested action, email draft and cases that need human judgement.',
    goodFitSignals: ['Many open opportunities', 'CRM notes vary by person', 'Follow-up depends on memory', 'Repeated sales messages'],
    metrics: ['Lost follow-up count', 'Time since last contact', 'CRM note completeness', 'Follow-up preparation time'],
    recommendedService: 'AI Workflow Sprint',
  },
  {
    id: 'complaint-case-brief',
    path: '/workflow-examples/complaint-case-brief',
    title: 'From complaint to case brief',
    eyebrow: 'Workflow example',
    description:
      'Collect customer message, history and internal rules into a case brief with a recommended next step.',
    brokenWorkflow:
      'Complaint handling requires manual reading of history, images, emails, notes and conditions before anyone feels ready to reply.',
    whoFeelsPain:
      'Customer support, quality teams, finance and operations teams handling repeated complaint types.',
    typicalInputs: ['Customer message', 'Order data', 'Images', 'Previous emails', 'Terms or internal guidelines'],
    aiAssistedWorkflow:
      'AI structures the case, extracts facts, flags missing documentation and drafts an internal assessment.',
    humanApproval:
      'The responsible person approves the assessment and customer reply before anything is sent.',
    output:
      'A case brief with timeline, facts, missing documentation, recommended action and reply draft.',
    goodFitSignals: ['Repeated complaint categories', 'Need for consistent assessment', 'History is spread out', 'Replies require approval'],
    metrics: ['Case preparation time', 'Missing documentation', 'Escalation quality', 'Correction rate'],
    recommendedService: 'Manual Work Audit',
  },
  {
    id: 'process-documentation',
    path: '/workflow-examples/process-documentation',
    title: 'From interviews to process documentation',
    eyebrow: 'Workflow example',
    description:
      'Turn interviews, recordings and practical know-how into usable process documentation and improvement points.',
    brokenWorkflow:
      'The process lives inside experienced employees. New people learn through shadowing, and exceptions are rarely documented.',
    whoFeelsPain:
      'Operations, HR, team leads and companies where key knowledge depends on a few people.',
    typicalInputs: ['Interviews', 'Screen recordings', 'Existing SOPs', 'Notes', 'Exceptions'],
    aiAssistedWorkflow:
      'AI structures interview notes, describes steps, captures exceptions and suggests where the workflow can be simplified.',
    humanApproval:
      'The process owner approves steps, rules, exceptions and training use before documentation is shared.',
    output:
      'A process description with steps, roles, inputs, outputs, exceptions, friction and improvement ideas.',
    goodFitSignals: ['Knowledge sits with a few people', 'Training takes too long', 'The process has many exceptions', 'No one owns documentation'],
    metrics: ['Training time', 'Number of undocumented exceptions', 'Support questions from new employees', 'Process owner review time'],
    recommendedService: 'Manual Work Audit',
  },
] as const;

export const aiReadinessItems = [
  {
    name: 'Canonical service pages',
    status: 'Active',
    detail:
      '/manual-work-audit, /ai-workflow-sprint and /ai-operations-partner answer what the service is, who it fits, what it produces, price, duration and next step.',
  },
  {
    name: 'Visible answer blocks',
    status: 'Active',
    detail:
      'FAQ and service sections are written as direct answers so people, search engines and AI assistants can summarize the offer correctly.',
  },
  {
    name: 'Structured data',
    status: 'Active',
    detail:
      'Core pages use Organization, WebSite, ProfessionalService, Service, Offer, FAQPage, BreadcrumbList and WebPage where the content is visible.',
  },
  {
    name: 'Sitemap',
    status: 'Active',
    detail:
      'The sitemap points to canonical English service, pricing, workflow example, AI readiness, contact and legal pages.',
  },
  {
    name: 'llms.txt',
    status: 'Active',
    detail:
      'A plain English AI-readable profile explains positioning, services, workflow examples, customers, principles, URLs and contact details.',
  },
  {
    name: 'No hidden AI trickery',
    status: 'Active',
    detail:
      'The same structure that helps AI assistants also helps human buyers understand the offer faster.',
  },
] as const;

export const homepageFaq = [
  {
    question: 'What does SiteDokAI do?',
    answer:
      'SiteDokAI helps operations-heavy B2B teams turn recurring manual work into practical, human-approved AI workflows.',
  },
  {
    question: 'What is a Manual Work Audit?',
    answer:
      'It is a 5-business-day audit that maps recurring manual workflows, prioritizes AI opportunities and identifies the top 3 workflows to start with.',
  },
  {
    question: 'Do we need to choose an AI tool first?',
    answer:
      'No. SiteDokAI starts with the work, then chooses the simplest useful workflow and tool setup.',
  },
  {
    question: 'What if our workflow is messy?',
    answer:
      'That is often the point. If the workflow is unclear, AI usually scales the mess faster. The audit makes the work understandable first.',
  },
  {
    question: 'Is this full automation?',
    answer:
      'Not by default. Many workflows are AI-assisted with a human approval step where quality, risk, tone or responsibility matters.',
  },
  {
    question: 'What tools can you work with?',
    answer:
      'Typical workflows touch email, spreadsheets, Teams, Slack, CRM notes, reports, shared documents, support queues and system exports.',
  },
  {
    question: 'How do you measure effect?',
    answer:
      'Effect is measured with practical signals such as time saved, fewer follow-ups, fewer errors, faster decisions and actual use by the team.',
  },
  {
    question: 'What happens after the audit?',
    answer:
      'You receive a process map, prioritized backlog, top 3 AI workflow candidates, a first workflow sketch and a recommended next step.',
  },
  {
    question: 'Can you work with customer support, operations, finance or sales teams?',
    answer:
      'Yes. The strongest fit is operations-heavy teams where recurring coordination work still lives in email, spreadsheets, CRM notes, meetings, reports or handovers.',
  },
  {
    question: 'What if AI is not the right first step?',
    answer:
      'SiteDokAI says so. Some work should be removed, simplified or documented before AI is useful.',
  },
  {
    question: 'Do you replace people?',
    answer:
      'No. The point is to reduce friction and help people approve better drafts, summaries, actions and decision notes.',
  },
  {
    question: 'How much time does our team need to spend?',
    answer:
      'A Manual Work Audit usually needs short interviews with key people and examples of the recurring workflow.',
  },
  {
    question: 'What data does AI need access to?',
    answer:
      'The starting point is the minimum data needed to understand and test the workflow. SiteDokAI does not connect everything to AI by default.',
  },
  {
    question: 'Can this work with existing tools?',
    answer:
      'Often yes. SiteDokAI usually starts around the tools the team already uses before suggesting new systems.',
  },
  {
    question: 'Why not just use ChatGPT or Copilot directly?',
    answer:
      'Chat tools can help individuals, but recurring operational work needs a clear trigger, input, rules, human approval, output and measurement.',
  },
] as const;

export const legacyRedirects = [
  { from: '/priser', to: '/pricing', label: 'Pricing' },
  { from: '/om', to: '/about', label: 'About' },
  { from: '/kontakt', to: '/contact', label: 'Contact' },
  { from: '/use-cases', to: '/workflow-examples', label: 'Workflow examples' },
  { from: '/ai-klar', to: '/ai-readiness', label: 'AI readiness' },
  { from: '/hjemmeside-tjek', to: '/manual-work-audit', label: 'Manual Work Audit' },
  { from: '/hjemmeside-fix', to: '/ai-workflow-sprint', label: 'AI Workflow Sprint' },
  { from: '/visuelt-loeft', to: '/ai-operations-partner', label: 'AI Operations Partner' },
  { from: '/gratis-mini-tjek', to: '/contact', label: 'Send your workflow' },
  { from: '/gratis-rapport', to: '/manual-work-audit', label: 'Manual Work Audit' },
  { from: '/eksempel', to: '/manual-work-audit', label: 'Manual Work Audit' },
  { from: '/privatlivspolitik', to: '/privacy-policy', label: 'Privacy policy' },
  { from: '/tilgaengelighed', to: '/accessibility', label: 'Accessibility' },
  { from: '/tak', to: '/thank-you', label: 'Thank you' },
  { from: '/tak-for-henvendelsen', to: '/thank-you', label: 'Thank you' },
] as const;

export const legacyWorkflowRedirects = [
  { from: '/use-cases/ai-statusrapport', to: '/workflow-examples/ai-status-report', label: 'AI status report' },
  { from: '/use-cases/ledelsesrapport', to: '/workflow-examples/management-report', label: 'Management report' },
  { from: '/use-cases/kundehenvendelse-svarudkast', to: '/workflow-examples/customer-reply-draft', label: 'Customer reply draft' },
  { from: '/use-cases/moede-actions-opfoelgning', to: '/workflow-examples/meeting-actions-follow-up', label: 'Meeting actions follow-up' },
  { from: '/use-cases/leverandoerstatus-undtagelser', to: '/workflow-examples/supplier-status-exceptions', label: 'Supplier status exceptions' },
  { from: '/use-cases/tilbudsanmodning-afklaring', to: '/workflow-examples/rfq-clarification', label: 'RFQ clarification' },
  { from: '/use-cases/ny-kunde-onboarding', to: '/workflow-examples/new-customer-onboarding', label: 'New customer onboarding' },
  { from: '/use-cases/crm-opfoelgning-naeste-skridt', to: '/workflow-examples/crm-follow-up-next-step', label: 'CRM follow-up next step' },
  { from: '/use-cases/reklamation-sagsoverblik', to: '/workflow-examples/complaint-case-brief', label: 'Complaint case brief' },
  { from: '/use-cases/procesdokumentation-interviews', to: '/workflow-examples/process-documentation', label: 'Process documentation' },
] as const;

export type ServiceOffer = (typeof services)[number];
export type WorkflowExample = (typeof workflowExamples)[number];

export function absoluteUrl(path: string) {
  return new URL(path, siteBaseUrl).href;
}

export function findService(id: string) {
  return services.find((service) => service.id === id);
}

export function findWorkflowExample(id: string) {
  return workflowExamples.find((workflowExample) => workflowExample.id === id);
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(path: string, faq: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${siteBaseUrl}/#organization`,
    name: 'SiteDokAI',
    url: siteBaseUrl,
    logo: absoluteUrl('/favicon.svg'),
    email: contactEmail,
    founder: {
      '@id': `${siteBaseUrl}/#troels-ostbjerg`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: contactEmail,
      contactType: 'customer enquiries',
      availableLanguage: ['en'],
      areaServed: ['Europe', 'International'],
    },
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${siteBaseUrl}/#website`,
    name: 'SiteDokAI',
    url: `${siteBaseUrl}/`,
    inLanguage: 'en',
    publisher: {
      '@id': `${siteBaseUrl}/#organization`,
    },
    description:
      'SiteDokAI helps operations-heavy B2B teams turn recurring manual work into practical AI workflows people actually use.',
  };
}

export function professionalServiceSchema() {
  return {
    '@type': 'ProfessionalService',
    '@id': `${siteBaseUrl}/#professional-service`,
    name: 'SiteDokAI',
    url: siteBaseUrl,
    serviceType: 'AI operations for manual workflows',
    email: contactEmail,
    provider: {
      '@id': `${siteBaseUrl}/#organization`,
    },
    areaServed: [
      { '@type': 'Place', name: 'Europe' },
      { '@type': 'Place', name: 'International' },
    ],
    knowsAbout: [
      'AI operations',
      'manual workflow improvement',
      'human-in-the-loop AI workflows',
      'operations process mapping',
      'AI workflow implementation',
      'workflow automation',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'SiteDokAI services',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@id': `${absoluteUrl(service.path)}#service`,
        },
        price: service.priceValue,
        priceCurrency: 'DKK',
        url: absoluteUrl(service.path),
      })),
    },
  };
}

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': `${siteBaseUrl}/#troels-ostbjerg`,
    name: 'Troels Østbjerg',
    jobTitle: 'Founder, SiteDokAI',
    worksFor: {
      '@id': `${siteBaseUrl}/#organization`,
    },
    knowsAbout: ['operations', 'supply chain', 'process improvement', 'AI workflows', 'AI operations'],
  };
}

export function serviceSchema(service: ServiceOffer) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema(),
      websiteSchema(),
      professionalServiceSchema(),
      {
        '@type': 'Service',
        '@id': `${absoluteUrl(service.path)}#service`,
        name: service.name,
        serviceType: service.name,
        url: absoluteUrl(service.path),
        description: service.description,
        provider: {
          '@id': `${siteBaseUrl}/#organization`,
        },
        areaServed: [
          { '@type': 'Place', name: 'Europe' },
          { '@type': 'Place', name: 'International' },
        ],
        audience: {
          '@type': 'BusinessAudience',
          audienceType:
            'Operations-heavy B2B teams with recurring manual work in email, spreadsheets, CRM notes, reports, follow-ups or handovers',
        },
        offers: {
          '@type': 'Offer',
          url: absoluteUrl(service.path),
          price: service.priceValue,
          priceCurrency: 'DKK',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${absoluteUrl(service.path)}#webpage`,
        url: absoluteUrl(service.path),
        name: `${service.name} — SiteDokAI`,
        description: service.description,
        inLanguage: 'en',
        about: {
          '@id': `${absoluteUrl(service.path)}#service`,
        },
        isPartOf: {
          '@id': `${siteBaseUrl}/#website`,
        },
      },
    ],
  };
}

export function workflowExampleSchema(workflowExample: WorkflowExample) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(workflowExample.path)}#webpage`,
    url: absoluteUrl(workflowExample.path),
    name: `${workflowExample.title} — SiteDokAI`,
    description: workflowExample.description,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteBaseUrl}/#website`,
      name: 'SiteDokAI',
      url: `${siteBaseUrl}/`,
    },
    about: ['AI operations', 'manual workflow improvement', 'human-approved AI workflows'],
  };
}
