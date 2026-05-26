export const siteBaseUrl = 'https://sitedokai.com';
export const contactEmail = 'troelsostbjerg@gmail.com';
export const linkedInUrl = 'https://www.linkedin.com/in/troels-%C3%B8stbjerg-37757726/';

export const labMeta = {
  name: 'SiteDokAILab',
  title: 'SiteDokAILab - Free workflow reviews for manual work and AI ideas',
  description:
    'Send in a recurring workflow, manual process or AI idea. Troels Østbjerg reviews where the friction is, whether AI can help, and what the first practical step should be.',
  positioning: 'Free workflow reviews for teams drowning in manual work.',
  hero:
    'Send me your messy workflow. I will tell you where AI can actually help.',
  support:
    'Send in a recurring process, handover, report, email flow or AI idea. I will review where the friction is, whether AI belongs anywhere near it, and what the first practical step could be.',
} as const;

export function absoluteUrl(path: string) {
  return new URL(path, siteBaseUrl).href;
}

export type WorkflowType = {
  id: string;
  label: string;
  pain: string;
  check: string;
  aiAssist: string;
  firstStep: string;
};

export const workflowTypeOptions: WorkflowType[] = [
  {
    id: 'reporting',
    label: 'Reporting',
    pain: 'Updates live across email, Teams, meetings and someone who remembers the latest number.',
    check:
      'I would look for missing input standards, unclear owners and where the summary work really starts.',
    aiAssist:
      'AI can draft summaries, compare updates and flag missing fields when the input is structured enough.',
    firstStep: 'Create one weekly update template before adding automation.',
  },
  {
    id: 'inbox',
    label: 'Inbox',
    pain: 'Requests arrive in a shared inbox and bounce between people until ownership becomes a mood.',
    check:
      'I would map request types, urgency signals, routing rules and the approval point before any reply is sent.',
    aiAssist:
      'AI can classify requests, extract context and draft replies for a person to approve.',
    firstStep: 'Define 5 to 8 request categories and who owns each one.',
  },
  {
    id: 'handover',
    label: 'Handover',
    pain: 'Important context sits in calls, notes, memory and half-finished documents.',
    check:
      'I would find the minimum context needed by the next person and where handovers currently lose it.',
    aiAssist:
      'AI can turn notes into handover briefs, action lists and open-risk summaries.',
    firstStep: 'Write the handover checklist the receiver actually needs.',
  },
  {
    id: 'crm',
    label: 'CRM',
    pain: 'Follow-ups disappear because CRM notes are inconsistent, stale or written for the person who already knows the story.',
    check:
      'I would inspect ownership, next action quality, missing dates and repeated follow-up patterns.',
    aiAssist:
      'AI can summarize account context, suggest next actions and flag stale opportunities.',
    firstStep: 'Standardize what a good next action must contain.',
  },
  {
    id: 'supplier',
    label: 'Supplier flow',
    pain: 'Supplier status is tracked through spreadsheets, email threads and heroic memory.',
    check:
      'I would separate normal status from exceptions, missing confirmations and escalation rules.',
    aiAssist:
      'AI can draft nudges, summarize exceptions and create a clean daily follow-up list.',
    firstStep: 'Define the minimum fields that make a supplier case healthy.',
  },
  {
    id: 'ai-idea',
    label: 'AI idea',
    pain: 'The company has many AI ideas, but nobody has tied them to pain, risk, frequency or ownership.',
    check:
      'I would score ideas against real workflows before evaluating tools or shiny demos.',
    aiAssist:
      'AI can help structure and compare ideas, but prioritization must stay business-led.',
    firstStep: 'Create a one-page AI use case scorecard.',
  },
];

export const messySubmissions = [
  {
    title: 'Weekly reporting chaos',
    pain: 'Updates live across emails, Teams and memory.',
    why: 'Managers spend time chasing the latest version instead of making decisions.',
    lookFor: 'Missing input format, owner gaps and whether AI can summarize or flag missing fields.',
  },
  {
    title: 'Customer requests stuck in inboxes',
    pain: 'Shared inboxes create unclear ownership and uneven replies.',
    why: 'Urgent requests can wait too long, while simple ones get handled twice.',
    lookFor: 'Request categories, routing rules, tone standards and human approval before sending.',
  },
  {
    title: 'Supplier follow-ups',
    pain: 'People rely on memory to know what is missing.',
    why: 'Late confirmations become fire drills instead of visible exceptions.',
    lookFor: 'A clean status structure, missing fields and safe follow-up drafts.',
  },
  {
    title: 'Repeated meeting notes',
    pain: 'Actions are captured differently every time.',
    why: 'Follow-up depends on who took notes and how much context survived.',
    lookFor: 'Decision points, owner/date logic and reusable action summaries.',
  },
  {
    title: 'Manual spreadsheet updates',
    pain: 'Numbers move from system to sheet to report by hand.',
    why: 'Copy-paste creates errors and burns attention on low-value work.',
    lookFor: 'Source of truth, validation points and where AI should only assist.',
  },
  {
    title: 'CRM follow-up gaps',
    pain: 'Next steps are vague, missing or written after the fact.',
    why: 'Sales and delivery lose momentum when the record does not guide action.',
    lookFor: 'Next-action quality, stale records and suggested follow-up structure.',
  },
  {
    title: 'Handover problems',
    pain: 'The receiving team gets fragments instead of usable context.',
    why: 'Work slows down when every transfer requires another meeting.',
    lookFor: 'Minimum handover fields, risks, open decisions and ownership.',
  },
  {
    title: 'AI ideas nobody made concrete',
    pain: 'Ideas sound interesting, but nobody knows the first useful pilot.',
    why: 'Tool-first AI work becomes theatre when it is not tied to a repeated task.',
    lookFor: 'Frequency, value, risk, readiness and the human approval point.',
  },
] as const;

export const outputSteps = [
  {
    title: 'Diagnosis',
    text: 'What the real problem seems to be.',
  },
  {
    title: 'Workflow sketch',
    text: 'The simple version of the process before tools get involved.',
  },
  {
    title: 'AI fit',
    text: 'Where AI could help, and where it should not.',
  },
  {
    title: 'Risk / watch-out',
    text: 'What could break, confuse people or create bad automation.',
  },
  {
    title: 'First step',
    text: 'One practical move the company can make without buying a tool.',
  },
] as const;

export type CaseStudy = {
  id: string;
  title: string;
  category: string;
  submittedBy?: string;
  context: string;
  problem: string;
  likelyRootCause: string;
  processSketch: string[];
  aiOpportunity: string;
  humanApprovalPoint: string;
  risk: string;
  firstStep: string;
  status: 'example' | 'reviewed' | 'published';
};

export const caseFilters = [
  'All',
  'Reporting',
  'Inbox / email',
  'Handover',
  'CRM',
  'Operations',
  'AI idea',
  'Meeting notes',
  'Supplier/customer flow',
] as const;

export const caseStudies: CaseStudy[] = [
  {
    id: 'weekly-status-chaos',
    title: 'Weekly status chaos',
    category: 'Reporting',
    status: 'example',
    context:
      'A team collects weekly updates from several people across email, Teams and meetings.',
    problem:
      'Nobody knows which version is the latest. Managers spend too much time chasing updates and rewriting summaries.',
    likelyRootCause:
      'The input is not standardized before the reporting work starts.',
    processSketch: [
      'Team members submit updates in one format',
      'Missing fields are flagged',
      'AI drafts summary',
      'Manager reviews and edits',
      'Final report is sent',
    ],
    aiOpportunity:
      'AI can summarize updates, identify missing information and draft the first version.',
    humanApprovalPoint:
      'The manager approves the final wording and decisions before anything is sent.',
    risk: 'If input remains messy, AI will just create faster-looking mess.',
    firstStep: 'Create a fixed weekly update template before introducing automation.',
  },
  {
    id: 'customer-inbox-ping-pong',
    title: 'Customer inbox ping-pong',
    category: 'Inbox / email',
    status: 'example',
    context:
      'Customer requests arrive in a shared inbox and get forwarded between people.',
    problem:
      'Ownership is unclear, replies are inconsistent, and urgent requests can sit too long.',
    likelyRootCause:
      'No triage logic exists before the work is distributed.',
    processSketch: [
      'Request enters shared inbox',
      'Request type is classified',
      'Urgency and owner are suggested',
      'Human confirms assignment',
      'Reply draft is prepared',
      'Status is tracked',
    ],
    aiOpportunity:
      'AI can classify request types, extract key details and draft first replies.',
    humanApprovalPoint:
      'A person approves classification and sends final reply.',
    risk: 'Fully automated replies can damage trust if the case is sensitive.',
    firstStep: 'Define 5 to 8 common request categories and ownership rules.',
  },
  {
    id: 'supplier-follow-up-black-hole',
    title: 'Supplier follow-up black hole',
    category: 'Supplier/customer flow',
    status: 'example',
    context:
      'Supplier updates are handled by email, memory and scattered spreadsheets.',
    problem:
      'Follow-ups depend on individuals remembering what is missing.',
    likelyRootCause:
      'There is no single status structure or exception list.',
    processSketch: [
      'Supplier status is captured in one tracker',
      'Missing confirmations are flagged',
      'AI drafts follow-up emails',
      'Responsible person approves',
      'Escalations are visible',
    ],
    aiOpportunity:
      'AI can detect missing responses, draft nudges and create an exception summary.',
    humanApprovalPoint:
      'Procurement or operations approves follow-ups before sending.',
    risk: 'Bad data in the tracker creates false urgency.',
    firstStep:
      'Define the minimum fields needed to know whether a supplier case is healthy.',
  },
  {
    id: 'ai-idea-without-owner',
    title: 'AI idea without owner',
    category: 'AI idea',
    status: 'example',
    context:
      'A company has many AI ideas but no clear way to prioritize them.',
    problem:
      'Ideas stay abstract because nobody defines pain, frequency, risk or owner.',
    likelyRootCause:
      'The company is evaluating tools before evaluating workflows.',
    processSketch: [
      'Collect AI ideas',
      'Map each idea to workflow pain',
      'Score by frequency, value, risk and readiness',
      'Pick one pilot',
      'Measure before and after',
    ],
    aiOpportunity:
      'AI can help structure and compare ideas, but prioritization must be business-led.',
    humanApprovalPoint:
      'Leadership chooses the pilot based on business value and risk.',
    risk: 'AI theatre: many demos, no changed workflow.',
    firstStep: 'Create a one-page AI use case scorecard.',
  },
  {
    id: 'meeting-actions-drift',
    title: 'Meeting actions drift',
    category: 'Meeting notes',
    status: 'example',
    context:
      'A team leaves meetings with decisions, loose notes and action items in different places.',
    problem:
      'Follow-up depends on memory, and the next meeting starts by reconstructing the last one.',
    likelyRootCause:
      'The meeting has no standard output format or owner review step.',
    processSketch: [
      'Meeting notes are captured',
      'Actions, owners and decisions are extracted',
      'AI drafts a follow-up summary',
      'Meeting owner approves',
      'Actions are added to the team tracker',
    ],
    aiOpportunity:
      'AI can extract actions, open questions and decision summaries from notes.',
    humanApprovalPoint:
      'The meeting owner confirms owners, deadlines and decision wording.',
    risk: 'Badly captured notes can create confident but wrong action lists.',
    firstStep: 'Agree one meeting output template before adding AI note processing.',
  },
  {
    id: 'handover-context-loss',
    title: 'Handover context loss',
    category: 'Handover',
    status: 'example',
    context:
      'Sales, delivery and support hand work to each other through calls, notes and CRM fragments.',
    problem:
      'The receiving team has to ask for the same context again before they can move.',
    likelyRootCause:
      'There is no shared definition of a complete handover.',
    processSketch: [
      'Source notes and CRM context are collected',
      'Missing fields are flagged',
      'AI drafts a handover brief',
      'Sender approves sensitive context',
      'Receiver gets a clean next-action view',
    ],
    aiOpportunity:
      'AI can compile scattered context into a structured handover brief.',
    humanApprovalPoint:
      'The sender reviews what is included and removes anything sensitive.',
    risk: 'A long summary can look useful while hiding the missing decision.',
    firstStep: 'Define the five fields every handover must contain.',
  },
];

export const methodSteps = [
  {
    title: 'Mess',
    text: 'Start with the annoying reality, not the tool.',
  },
  {
    title: 'Map',
    text: 'Who does what, where does information move, and where does it get stuck?',
  },
  {
    title: 'Simplify',
    text: 'Remove unnecessary steps before adding AI. Automating a bad process is just faster nonsense.',
  },
  {
    title: 'Assist',
    text: 'Decide where AI can summarize, draft, classify, compare, extract or flag.',
  },
  {
    title: 'Approve',
    text: 'Decide where a human must still review, decide or own the outcome.',
  },
  {
    title: 'Measure',
    text: 'Define whether the new workflow actually saves time, reduces errors or improves decisions.',
  },
] as const;

export const roleCards = [
  {
    title: 'AI Implementation',
    text:
      'I help teams identify realistic AI use cases, test them quickly, and turn them into workflows people actually use.',
  },
  {
    title: 'Operations Transformation',
    text:
      'I map operational friction, create structure and build practical improvements across teams, tools and stakeholders.',
  },
  {
    title: 'AI Adoption',
    text:
      'I help non-technical teams understand where AI can help, how to use it safely, and how to avoid turning it into another unused initiative.',
  },
  {
    title: 'Project / Transformation Leadership',
    text:
      'I bring order to complex work, align stakeholders and turn fuzzy ideas into visible progress.',
  },
] as const;

export const aboutBullets = {
  bring: [
    'Operations reality',
    'AI implementation thinking',
    'Process mapping',
    'Stakeholder alignment',
    'Fast prototyping',
    'Adoption focus',
    'Human-in-the-loop mindset',
    'Bias toward action',
  ],
  fit: [
    'AI Implementation Lead',
    'AI Adoption Lead',
    'Operations Transformation Manager',
    'Digital Transformation / Project Manager',
    'Workflow Automation Lead',
    'Business Operations / Process Improvement roles',
  ],
  work: [
    'Direct',
    'Practical',
    'Fast',
    'Human',
    'Slightly allergic to pointless meetings',
    'Good with ambiguity',
    'Better with real problems than polished theory',
  ],
} as const;

export const permissionOptions = [
  'Yes, you may publish an anonymized version',
  'Yes, but remove all company/person details',
  'No, keep it private',
] as const;
