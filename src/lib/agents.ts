import { content, learnerName, personalise } from '../content';
import { useStored } from './useStored';
import usecasesData from '../../content/usecases.json';
import builderData from '../../content/builder.json';

const B = builderData;

export type Trigger = { type: string; frequency: string; day: string; time: string; eventDesc: string };
export type Business = {
  ownerName: string;
  agencyName: string;
  hostAgency: string;
  networkCompany: string;
  specialisms: string;
  signOff: string;
};
export type AgentDraft = {
  id: string;
  name: string;
  usecase: string;
  templateId: string;
  goal: string;
  audience: string;
  steps: string;
  output: string;
  tools: string[];
  trigger: Trigger;
  guardrails: string[];
  customRules: string;
  knowledge: string;
  tone: string;
  business: Business;
  platform: string;
  createdAt: string;
  updatedAt: string;
};

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function defaultBusiness(): Business {
  const d = content.site.businessDefaults;
  return {
    ownerName: learnerName,
    agencyName: d.agencyName,
    hostAgency: d.hostAgency,
    networkCompany: d.networkCompany,
    specialisms: d.specialisms,
    signOff: personalise(d.signOff, learnerName).replace(/\nme$/, ''),
  };
}

export function blankDraft(platform = ''): AgentDraft {
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: '',
    usecase: '',
    templateId: '',
    goal: '',
    audience: 'clients',
    steps: '',
    output: '',
    tools: ['paste'],
    trigger: { type: 'ondemand', frequency: 'weekly', day: 'Monday', time: '07:00', eventDesc: '' },
    guardrails: B.guardrails.filter((g) => g.default).map((g) => g.id),
    customRules: '',
    knowledge: '',
    tone: content.site.businessDefaults.tone,
    business: defaultBusiness(),
    platform,
    createdAt: now,
    updatedAt: now,
  };
}

export function fromTemplate(templateId: string, platform: string, business?: Business): AgentDraft {
  const t = B.templates.find((x) => x.id === templateId)!;
  const base = blankDraft(platform);
  return {
    ...base,
    ...t.draft,
    trigger: { ...t.draft.trigger },
    tools: [...t.draft.tools],
    guardrails: [...t.draft.guardrails],
    templateId,
    business: business ?? base.business,
  };
}

/** Pre-fill a draft from a gallery use case that has no full template. */
export function fromUseCase(id: string, platform: string, business?: Business): AgentDraft {
  const u = usecasesData.items.find((x) => x.id === id);
  if (!u) return blankDraft(platform);
  const tpl = (u as { template?: string }).template;
  if (tpl) return fromTemplate(tpl, platform, business);
  const base = blankDraft(platform);
  const isSchedule = /schedule|every|first of/i.test(u.trigger);
  const audience = u.category === 'network' ? (/team|recruit/i.test(u.title) ? 'team' : 'public') : /review|countdown|enquir|itinerar/i.test(u.title) ? 'clients' : 'me';
  return {
    ...base,
    name: u.title,
    usecase: u.id,
    goal: `${u.title}: ${u.does.join('; ')}.`,
    audience,
    steps: u.does.map((d, i) => `${i + 1}. ${d}.`).join('\n'),
    output: `Hand the result back to me for review. (${u.approve}.)`,
    tools: u.connects.map((c) => (c === 'web' ? 'web' : c)).filter((c) => B.tools.some((t) => t.id === c)),
    trigger: { ...base.trigger, type: isSchedule ? 'schedule' : 'ondemand' },
    guardrails: [
      ...base.guardrails,
      ...(u.category === 'network' ? ['noincome', 'consent'] : []),
      ...(audience === 'clients' || audience === 'public' ? ['verifylist'] : []),
    ],
    business: business ?? base.business,
  };
}

export function scheduleText(t: Trigger): string {
  const time = t.time || '07:00';
  switch (t.frequency) {
    case 'daily':
      return `every day at ${time}`;
    case 'weekdays':
      return `every weekday (Monday to Friday) at ${time}`;
    case 'monthly':
      return `on the 1st of every month at ${time}`;
    default:
      return `every ${t.day || 'Monday'} at ${time}`;
  }
}

export function triggerText(t: Trigger): string {
  if (t.type === 'schedule') return `You run automatically ${scheduleText(t)} (UK time).`;
  if (t.type === 'event') return `You run when ${t.eventDesc || 'a relevant new email arrives'}.`;
  return 'You run when I ask you to.';
}

const AUDIENCE_TEXT: Record<string, string> = {
  me: 'Your output is for me only.',
  clients: 'Your output will go to my clients, after I have checked it.',
  team: 'Your output is for my team members and recruits, after I have checked it.',
  public: 'Your output will be posted publicly on social media, after I have checked it.',
};

/** The platform-neutral instructions text: the heart of the pack. */
export function buildInstructions(d: AgentDraft): string {
  const b = d.business;
  const name = b.ownerName.trim() || learnerName;
  const p = (s: string) => personalise(s, name);
  const biz = [
    b.agencyName ? `${b.agencyName}, ` : '',
    name ? `an independent travel business run by ${name}` : 'an independent travel business',
    b.hostAgency ? ` (working with ${b.hostAgency})` : '',
    b.specialisms ? `, specialising in ${b.specialisms}` : '',
    '.',
  ].join('');
  const nm = b.networkCompany && (d.audience === 'team' || d.usecase && /content|follow|recruit|team/.test(d.usecase))
    ? ` ${name || 'The owner'} also runs a network marketing business with ${b.networkCompany}.`
    : '';
  const tools = d.tools
    .map((id) => B.tools.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => `- ${t!.instr}`);
  const rules = d.guardrails
    .map((id) => B.guardrails.find((g) => g.id === id))
    .filter(Boolean)
    .map((g) => `- ${p(g!.text)}`);
  if (d.customRules.trim()) {
    d.customRules
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((l) => rules.push(`- ${p(l.replace(/^[-•]\s*/, ''))}`));
  }
  const tone = B.tones.find((t) => t.id === d.tone)?.instr ?? '';

  const sections = [
    `# Who you are`,
    `You are "${d.name || 'my assistant'}", an assistant working for ${biz}${nm}`,
    ``,
    `# Your job`,
    p(d.goal || 'Help me with the task I describe.'),
    AUDIENCE_TEXT[d.audience] ?? '',
    ``,
    `# When you run`,
    triggerText(d.trigger),
    ``,
    `# What you can use`,
    ...(tools.length ? tools : ['- Only what I paste into the chat.']),
  ];
  if (d.steps.trim()) sections.push('', '# How to do it', p(d.steps.trim()));
  if (d.output.trim()) sections.push('', '# What to hand back', p(d.output.trim()));
  sections.push('', '# Rules you must always follow', ...rules);
  sections.push(
    '',
    '# Tone and style',
    tone,
    b.signOff ? `When writing as me, sign off with:\n${b.signOff}` : '',
    '',
    `If anything is unclear or outside these instructions, stop and ask ${name || 'me'} rather than guessing.`,
  );
  return sections.filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n').trim();
}

export type Pack = {
  platformName: string;
  instructions: string;
  checklist: string[];
  test: string;
  goodLooksLike: string[];
  review: string[];
  help: string;
  warnings: string[];
};

export function buildPack(d: AgentDraft): Pack {
  const setupAll = B.platformSetup as Record<string, (typeof B.platformSetup)['claude']>;
  const s = setupAll[d.platform] ?? setupAll.claude;
  const fill = (x: string) =>
    personalise(x.replace(/\{agentName\}/g, d.name || 'My agent').replace(/\{schedule\}/g, scheduleText(d.trigger)), d.business.ownerName);

  const needsKnowledge = d.tools.includes('files') || d.knowledge.trim();
  const create = s.create
    .map((step) => (step === '{knowledgeStep}' ? (needsKnowledge && s.knowledgeStep ? s.knowledgeStep : '') : step))
    .filter(Boolean)
    .map(fill);
  const connect = d.tools
    .filter((t) => t !== 'paste' || d.tools.length === 1)
    .map((t) => (s.connect as Record<string, string>)[t])
    .filter(Boolean)
    .map(fill);
  const trig = fill((s.trigger as Record<string, string>)[d.trigger.type] ?? s.trigger.ondemand);
  const tpl = B.templates.find((t) => t.id === d.templateId);

  const checklist = [
    ...create,
    ...connect,
    'Run the test prompt below and compare the result with "What good looks like".',
    trig,
  ];
  if (d.knowledge.trim()) checklist.splice(create.length, 0, `Knowledge to add: ${d.knowledge.trim()}`);

  const warnings: string[] = [];
  if (d.platform === 'claude' && d.trigger.type === 'event')
    warnings.push("Claude can't start the instant an email arrives, so this pack sets it to check on a schedule instead.");
  if (d.platform === 'copilot' && d.trigger.type !== 'ondemand')
    warnings.push("Personal Copilot can't run on a schedule or react to emails. You'll start it yourself each time.");
  if (d.platform === 'copilot') warnings.push('Check you are signed in to your personal Microsoft account, never your NHS one.');
  if (d.platform === 'claude' && d.tools.includes('email'))
    warnings.push("Claude connects to Gmail and business Microsoft 365 accounts, not personal Outlook.com/Hotmail addresses.");
  if ((d.audience === 'clients' || d.audience === 'public') && !d.guardrails.includes('draftonly'))
    warnings.push("This agent's output goes to clients or the public, but 'Always ask me before anything is sent' is switched off. We strongly suggest switching it on.");

  return {
    platformName: s.name,
    instructions: buildInstructions(d),
    checklist,
    test: tpl ? tpl.test : B.blankTest,
    goodLooksLike: tpl ? tpl.goodLooksLike : B.blankGoodLooksLike,
    review: [...s.review.map(fill), ...B.reviewTips],
    help: s.help,
    warnings,
  };
}

/** Plain-text version of the full pack, for export and printing. */
export function packAsText(d: AgentDraft): string {
  const p = buildPack(d);
  return [
    `${d.name || 'My agent'}: setup pack for ${p.platformName}`,
    `Made with the "${content.site.courseTitle}" course · ${new Date(d.updatedAt).toLocaleDateString('en-GB')}`,
    '',
    ...(p.warnings.length ? ['IMPORTANT', ...p.warnings.map((w) => `! ${w}`), ''] : []),
    'SETUP CHECKLIST',
    ...p.checklist.map((c, i) => `${i + 1}. ${c}`),
    '',
    'INSTRUCTIONS (copy and paste)',
    '----------------------------------------',
    p.instructions,
    '----------------------------------------',
    '',
    'TEST PROMPT',
    p.test,
    '',
    'WHAT GOOD LOOKS LIKE',
    ...p.goodLooksLike.map((g) => `- ${g}`),
    '',
    'REVIEW, TWEAK AND SWITCH OFF',
    ...p.review.map((r) => `- ${r}`),
    '',
    p.help,
  ].join('\n');
}

export function useAgents() {
  return useStored<AgentDraft[]>('agents', []);
}
