'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Area, AreaChart } from 'recharts';
import { AlertTriangle, TrendingUp, Users, Clock, Search, Shield, Zap, Target, Skull, Flame, Building2, Calendar, AlertCircle, Languages, Cpu, Sparkles, Bot } from 'lucide-react';

// 语言类型
type Language = 'en' | 'zh';

// 翻译数据
const translations = {
  en: {
    // 首屏
    alertBadge: '2026: AI has started picking people off the bus',
    heroTitle: 'Are you still on board?',
    heroSubtitlePre: 'MIT study: ',
    heroSubtitlePost: ' of U.S. workforce. McKinsey: ',
    heroSubtitleEnd: ' technically automatable.',
    mitStat: 'AI can already replace 11.7%',
    mckinseyStat: '57% of work hours',

    // 进度条
    progressTitle: "AI Replacement Progress: Where are we?",
    currentReality: 'Current Reality',
    currentRealityDesc: 'MIT: AI can replace 11.7% of workforce',
    technicalCeiling: 'Technical Ceiling',
    technicalCeilingDesc: 'McKinsey: 57% of work hours automatable',
    icebergWarning: 'What you see is just the 11.7% tip of the iceberg.',

    // 统计数据
    replaceableNow: 'Replaceable Now',
    technicallyPossible: 'Technically Possible',
    hrImpact: 'HR Say Impact Coming',
    jobsBy2030: 'Jobs by 2030',

    // 进度阶段
    roadTitle: 'The Road to Automation',
    experimental: 'Experimental',
    experimentalDesc: '"AI is fun"',
    pilot: 'Pilot',
    pilotDesc: '"Quiet replacements begin"',
    youAreHere: 'YOU ARE HERE',
    hereDesc: 'MIT: 11.7% replaceable',
    acceleration: 'Acceleration',
    accelerationDesc: 'WEF: 30% jobs automated by 2030',
    restructuring: 'Restructuring',
    restructuringDesc: '50-60% jobs transformed',

    // 时间线
    timelineTitle: 'From Fun to Fear: AI Timeline',
    timelineSubtitle: 'Key milestones in AI\'s journey to replace human work',

    // 时期
    period1Title: 'Iceberg Emerging',
    period1Subtitle: 'Most people are still watching',
    period2Title: 'Active Replacement',
    period2Subtitle: 'AI written into layoff announcements',
    period3Title: 'Systemic Restructuring',
    period3Subtitle: 'Your job becomes unrecognizable',
    period4Title: 'High Automation Society',
    period4Subtitle: 'Toward 50%-80% automation',

    // 事件 - 突出 LLM, Agent, Skills
    event2020: 'Transformer Architecture',
    event2020Impact: 'Foundation for modern AI',
    event2020Highlight: 'LLM Era Begins',
    event2022: 'ChatGPT Launch',
    event2022Impact: '100M users in 2 months',
    event2022Highlight: 'Generative AI Breakthrough',
    event2023: 'GPT-4 Multimodal',
    event2023Impact: 'AI sees, hears, understands',
    event2023Highlight: 'Advanced LLM',
    event2024: 'AI Agent Revolution',
    event2024Impact: 'AI works autonomously',
    event2024Highlight: 'Agentic AI',
    event2025: 'AI Skills & Tool Use',
    event2025Impact: 'AI uses tools, completes tasks',
    event2025Highlight: 'Reasoning AI',
    eventMit: 'MIT Iceberg Index',
    eventMitImpact: '11.7% replaceable, $1.2T exposed',
    eventMitHighlight: 'Scientific Validation',
    eventMcKinsey: 'McKinsey: 57% automatable',
    eventMcKinseyImpact: '57% of hours technically automatable',
    eventMcKinseyHighlight: 'Automation Potential',
    eventHr: '89% HR leaders admit impact',
    eventHrImpact: '67% say AI already affecting jobs',
    eventHrHighlight: 'Executive Awareness',
    eventHalf: 'Half of all jobs affected',
    eventHalfImpact: 'Near 50% see significant change',
    eventHalfHighlight: 'Widespread Impact',
    event92m: '92M jobs displaced globally',
    event92mImpact: '30% at high automation risk',
    event92mHighlight: 'Global Crisis',
    event2030: 'Agentic AI Mainstream',
    event2030Impact: 'AI agents manage end-to-end workflows',
    event2030Highlight: 'Agent Economy',
    event2040: 'AGI Emergence',
    event2040Impact: 'Human-level AI capabilities',
    event2040Highlight: 'Singularity Approaching',

    // 高风险职业
    highRiskTitle: "AI's First Targets: High-Risk Jobs",
    highRiskSubtitle: "If your job appears on this list, you need to be nervous",
    industry: 'Industry',
    riskLevel: 'Risk Level',
    highRiskJobs: 'High-Risk Jobs',
    evidence: 'Evidence & Trend',
    pickSoftTargets: "AI doesn't affect everyone equally—it picks the soft targets first.",
    pickSoftTargetsDesc: 'If your daily work is: clearly rule-describable, highly repetitive, involves lots of documents/data processing—you\'re on AI\'s priority optimization list.',

    // 企业裁员
    layoffTitle: "This Isn't Theory: Companies Are Already Cutting Jobs with AI",
    layoffSubtitle: 'What you see in news is layoff numbers. In company spreadsheets, these become:',
    takenOver: '"Taken over by AI and automation"',
    jobsCut: 'Jobs Cut',
    reason: 'Reason',
    oneInTwenty: 'In 2025, about 1 in 20 layoffs officially cited AI as the reason.',
    source: 'Source: Layoff tracking reports, 2024-2025',

    // 生存指数
    survivalTitle: 'Calculate: Your AI Survival Index',
    survivalSubtitle: 'Stop asking "Will AI replace me?" Ask "When will it be my turn?"',
    q1: "How much of your daily work involves repetitive documents, reports, emails, spreadsheets?",
    q1High: 'Over 50%',
    q1Options: ['Less than 20%', '20-50%', 'Over 50%'],
    q2: "Does your industry frequently use these terms in presentations?",
    q2High: 'Appears frequently',
    q2Options: ['Rarely', 'Sometimes', 'Frequently'],
    q2Keywords: ['Automation', 'AI empowerment', 'Cost reduction', 'Efficiency revolution'],
    q3: "Has anyone in your company left due to 'restructuring' or 'optimization'?",
    q3High: 'Yes, recently',
    q3Options: ['No', 'Yes, a while ago', 'Yes, recently'],
    calculate: 'Calculate My Risk',
    yourRisk: 'AI Replacement Risk',
    realityCheck: 'Reality check:',
    realityCheckText: 'AI won\'t make you unemployed overnight. First, it will quietly take over the most replaceable parts of your work—until you realize, what\'s left isn\'t worth a full-time salary.',
    notTalkShow: 'This isn\'t a talk show. This is a timeline.',
    decideYear: 'What decides which year you become unemployed isn\'t AI—it\'s when you start preparing.',

    // Footer
    title: 'JOBLESS',
    tagline: 'AI Era Job Observation Platform',
    dataSources: 'Data Sources:',
    sources: 'MIT Study, McKinsey Global Institute, World Economic Forum',
    sources2: 'CNBC, Fortune, Forbes, Exploding Topics',
    disclaimer: 'This website data is for reference only and does not constitute investment or career advice.',
    disclaimer2: 'All statistics cited from public research reports and news sources.',

    // 技术标签
    techLLM: 'LLM',
    techAgent: 'Agent',
    techSkills: 'Skills',
    techAgentic: 'Agentic AI',
  },
  zh: {
    // 首屏
    alertBadge: '2026：AI 已经开始让人下车了',
    heroTitle: '你还在车上吗？',
    heroSubtitlePre: 'MIT研究：AI已可替代',
    heroSubtitlePost: '的美国劳动力。麦肯锡：',
    heroSubtitleEnd: '的工作时长理论上可自动化。',
    mitStat: 'AI 已可替代 11.7%',
    mckinseyStat: '57% 工作时长',

    // 进度条
    progressTitle: 'AI 替代进度：我们走到哪一步了？',
    currentReality: '现实进度',
    currentRealityDesc: 'MIT：AI 可替代 11.7% 劳动力',
    technicalCeiling: '技术天花板',
    technicalCeilingDesc: '麦肯锡：57% 工作时长可自动化',
    icebergWarning: '你看到的只是冰山露出的那 11.7%。',

    // 统计数据
    replaceableNow: '现已可替代',
    technicallyPossible: '技术上可行',
    hrImpact: 'HR 认为即将来临',
    jobsBy2030: '2030年岗位',

    // 进度阶段
    roadTitle: '自动化之路',
    experimental: '试验期',
    experimentalDesc: '"AI很好玩"',
    pilot: '试点期',
    pilotDesc: '"悄悄替换开始"',
    youAreHere: '你在这里',
    hereDesc: 'MIT：11.7% 可被替代',
    acceleration: '加速期',
    accelerationDesc: 'WEF：2030年30%岗位可自动化',
    restructuring: '重构期',
    restructuringDesc: '50-60% 工作被重塑',

    // 时间线
    timelineTitle: '从好玩到好怕：AI吞噬工作的时间轴',
    timelineSubtitle: 'AI替代人类工作的关键里程碑',

    // 时期
    period1Title: '冰山露头期',
    period1Subtitle: '大多数人还在看热闹',
    period2Title: '动手裁人期',
    period2Subtitle: 'AI已写进裁员公告',
    period3Title: '系统性重构期',
    period3Subtitle: '你的职位将变成你不认识的样子',
    period4Title: '高比例自动化社会',
    period4Subtitle: '走向50%-80%自动化世界',

    // 事件 - 突出 LLM, Agent, Skills
    event2020: 'Transformer 架构',
    event2020Impact: '现代 AI 的基础',
    event2020Highlight: 'LLM 时代开启',
    event2022: 'ChatGPT 发布',
    event2022Impact: '2个月 1 亿用户',
    event2022Highlight: '生成式 AI 突破',
    event2023: 'GPT-4 多模态',
    event2023Impact: 'AI 能看、能听、能理解',
    event2023Highlight: '高级 LLM',
    event2024: 'AI Agent 革命',
    event2024Impact: 'AI 自主工作',
    event2024Highlight: '智能体 AI',
    event2025: 'AI 技能与工具使用',
    event2025Impact: 'AI 使用工具、完成任务',
    event2025Highlight: '推理 AI',
    eventMit: 'MIT 冰山指数发布',
    eventMitImpact: '11.7% 可被替代，涉及 1.2 万亿美元工资',
    eventMitHighlight: '科学验证',
    eventMcKinsey: '麦肯锡：57% 可自动化',
    eventMcKinseyImpact: '57% 工作时长理论上可自动化',
    eventMcKinseyHighlight: '自动化潜力',
    eventHr: '89% HR 高层承认影响',
    eventHrImpact: '67% 说 AI 已在影响工作',
    eventHrHighlight: '高管意识觉醒',
    eventHalf: '近一半岗位受影响',
    eventHalfImpact: '近 50% 看到显著变化',
    eventHalfHighlight: '广泛影响',
    event92m: '全球 9200 万岗位被替代',
    event92mImpact: '30% 处于高自动化风险',
    event92mHighlight: '全球危机',
    event2030: '智能体 AI 主流',
    event2030Impact: 'AI 代理管理端到端工作流',
    event2030Highlight: '代理经济',
    event2040: 'AGI 诞生',
    event2040Impact: '人类水平 AI 能力',
    event2040Highlight: '奇点临近',

    // 高风险职业
    highRiskTitle: 'AI 的第一批猎物：高危行业与岗位清单',
    highRiskSubtitle: '如果你的工作出现在这张表里，你需要紧张',
    industry: '行业',
    riskLevel: '风险等级',
    highRiskJobs: '典型高危岗位',
    evidence: '证据与趋势',
    pickSoftTargets: 'AI 不会平均地影响所有人，它是"挑软柿子捏"的。',
    pickSoftTargetsDesc: '如果你的日常工作是：可被清晰规则描述、重复度高、需要大量文档或数据处理——你就在 AI 的第一批"优先优化列表"里。',

    // 企业裁员
    layoffTitle: '这不是理论：这些公司已经开始用 AI 裁人',
    layoffSubtitle: '你在新闻里看到的是"裁员数字"，但在公司 Excel 里，这些人被合并成了另一个词：',
    takenOver: '"由 AI 和自动化接管"',
    jobsCut: '裁员人数',
    reason: '原因',
    oneInTwenty: '2025 年约 1/20 的裁员在官方理由中点名 AI。',
    source: '来源：裁员追踪报告，2024-2025',

    // 生存指数
    survivalTitle: '算一算：你的 AI 生存指数',
    survivalSubtitle: '别再问"AI 会不会替代我"，问："什么时候轮到我"',
    q1: '你的日常工作中，有多少时间在处理重复性的文档、报表、邮件、表格？',
    q1High: '超过 50%',
    q1Options: ['少于 20%', '20-50%', '超过 50%'],
    q2: '你所在行业是否频繁使用这些词汇？',
    q2High: '频繁出现',
    q2Options: ['很少', '有时', '频繁'],
    q2Keywords: ['自动化', 'AI 赋能', '降本增效', '效率革命'],
    q3: '你公司里是否有人因为"业务重组""优化结构"而离开？',
    q3High: '是的，最近',
    q3Options: ['没有', '是的，之前', '是的，最近'],
    calculate: '计算我的风险',
    yourRisk: 'AI 替代风险',
    realityCheck: '现实检查：',
    realityCheckText: 'AI 不会"一天之内"让你失业，它会先悄悄拿走你工作里最好替代的那一部分——等你发现，剩下那点工作，已经不值一个全职工资了。',
    notTalkShow: '这不是访谈节目，这是时间轴。',
    decideYear: '决定你站在哪一年失业的，不是 AI，而是你什么时候开始准备。',

    // Footer
    title: 'JOBLESS',
    tagline: 'AI 时代就业观察平台',
    dataSources: '数据来源：',
    sources: 'MIT 研究、麦肯锡全球研究院、世界经济论坛',
    sources2: 'CNBC、Fortune、Forbes、Exploding Topics',
    disclaimer: '本网站数据仅供参考，不构成投资或职业建议。',
    disclaimer2: '所有统计数据引用自公开研究报告和新闻来源。',

    // 技术标签
    techLLM: 'LLM',
    techAgent: '智能体',
    techSkills: '技能',
    techAgentic: '智能体 AI',
  },
};

// 核心数据
const MIT_REPLACEMENT_RATE = 11.7;
const MCKINSEY_AUTOMATION_POTENTIAL = 57;

// 企业裁员案例
const layoffCases = [
  { company: { en: 'Dow', zh: '陶氏化学' }, layoffs: '4,500', reason: { en: 'Focus on AI and automation', zh: '聚焦 AI 与自动化' }, industry: { en: 'Chemical', zh: '化工' } },
  { company: { en: 'Pinterest', zh: 'Pinterest' }, layoffs: '~15%', reason: { en: 'Shifting to AI-driven products', zh: '转向 AI 驱动产品' }, industry: { en: 'Tech', zh: '科技' } },
  { company: { en: 'Nike', zh: '耐克' }, layoffs: '775', reason: { en: 'Automating warehouses', zh: '自动化仓储' }, industry: { en: 'Retail', zh: '零售' } },
  { company: { en: 'UPS', zh: 'UPS' }, layoffs: '30,000', reason: { en: 'Automation and restructuring', zh: '自动化与重组' }, industry: { en: 'Logistics', zh: '物流' } },
  { company: { en: 'Tech Sector', zh: '科技行业' }, layoffs: '276,000+', reason: { en: 'AI-driven restructuring', zh: 'AI 驱动的重组' }, industry: { en: '2024-25', zh: '2024-25' } },
];

// 高风险职业
const highRiskJobs = [
  { industry: { en: 'Customer Service', zh: '客服/呼叫中心' }, risk: 95, jobs: { en: 'Phone support, Online chat', zh: '电话客服、在线客服' }, reason: { en: 'AI handles 70% of standard queries', zh: 'AI 可处理 70% 标准问答' } },
  { industry: { en: 'Admin / Support', zh: '行政/文秘' }, risk: 90, jobs: { en: 'Assistants, Data entry', zh: '助理、数据录入' }, reason: { en: 'Part of MIT\'s 11.7%', zh: 'MIT 11.7% 的重要组成部分' } },
  { industry: { en: 'Finance / Accounting', zh: '金融/会计' }, risk: 75, jobs: { en: 'Junior analysts', zh: '初级分析师' }, reason: { en: '30-70% tasks AI-handled', zh: '30-70% 任务可由 AI 处理' } },
  { industry: { en: 'Manufacturing', zh: '制造业' }, risk: 70, jobs: { en: 'Quality inspection', zh: '质检员' }, reason: { en: '80%+ QC automated', zh: '80%+ 质检已自动化' } },
  { industry: { en: 'Logistics', zh: '物流/仓储' }, risk: 65, jobs: { en: 'Sorting, Scheduling', zh: '分拣、调度' }, reason: { en: 'UPS cutting 30,000 jobs', zh: 'UPS 计划削减 3 万岗位' } },
  { industry: { en: 'Media / Content', zh: '媒体/内容' }, risk: 55, jobs: { en: 'Copywriting', zh: '文案写作' }, reason: { en: 'AI generates at scale', zh: 'AI 大规模生成内容' } },
  { industry: { en: 'Legal Services', zh: '法律服务' }, risk: 40, jobs: { en: 'Contract review', zh: '合同初审' }, reason: { en: 'AI handles routine work', zh: 'AI 处理常规工作' } },
  { industry: { en: 'Healthcare', zh: '医疗(非面对面)' }, risk: 30, jobs: { en: 'Imaging, Records', zh: '影像、病历' }, reason: { en: 'AI diagnosis improving', zh: 'AI 诊断准确率提升' } },
];

// 时间线数据 - 突出重要技术节点
const timelineData = [
  {
    period: '2020',
    title: { en: 'Foundation Era', zh: '冰山露头期' },
    subtitle: { en: 'Modern AI foundations laid', zh: '大多数人还在看热闹' },
    progress: 5,
    events: [
      { year: '2020', event: { en: 'Transformer Architecture', zh: 'Transformer 架构' }, impact: { en: 'Foundation for modern AI', zh: '现代 AI 的基础' }, highlight: { en: 'LLM Era Begins', zh: 'LLM 时代开启' }, tech: 'LLM' },
    ],
    color: '#30d158',
  },
  {
    period: '2022',
    title: { en: 'Generative AI Breakthrough', zh: '生成式 AI 突破' },
    subtitle: { en: 'ChatGPT changes everything', zh: 'ChatGPT 改变一切' },
    progress: 8,
    events: [
      { year: '2022', event: { en: 'ChatGPT Launch', zh: 'ChatGPT 发布' }, impact: { en: '100M users in 2 months', zh: '2个月1亿用户' }, highlight: { en: 'Generative AI', zh: '生成式 AI' }, tech: 'LLM' },
    ],
    color: '#30d158',
  },
  {
    period: '2023',
    title: { en: 'Advanced LLM Era', zh: '高级 LLM 时代' },
    subtitle: { en: 'Multimodal AI emerges', zh: '多模态 AI 诞生' },
    progress: 10,
    events: [
      { year: '2023', event: { en: 'GPT-4 Multimodal', zh: 'GPT-4 多模态' }, impact: { en: 'AI sees, hears, understands', zh: 'AI 能看、能听、能理解' }, highlight: { en: 'Advanced LLM', zh: '高级 LLM' }, tech: 'LLM' },
    ],
    color: '#ff9500',
  },
  {
    period: '2024',
    title: { en: 'Agentic AI Revolution', zh: '智能体 AI 革命' },
    subtitle: { en: 'AI begins working autonomously', zh: 'AI 开始自主工作' },
    progress: 12,
    events: [
      { year: '2024', event: { en: 'AI Agent Revolution', zh: 'AI Agent 革命' }, impact: { en: 'AI works autonomously', zh: 'AI 自主工作' }, highlight: { en: 'Agentic AI', zh: '智能体 AI' }, tech: 'Agent' },
    ],
    color: '#ff9500',
  },
  {
    period: '2025',
    title: { en: 'WE ARE HERE', zh: '动手裁人期' },
    subtitle: { en: 'AI written into layoff announcements', zh: 'AI已写进裁员公告' },
    progress: MIT_REPLACEMENT_RATE,
    events: [
      { year: '2025.11', event: { en: 'MIT Iceberg Index', zh: 'MIT 冰山指数' }, impact: { en: '11.7% replaceable, $1.2T exposed', zh: '11.7% 可被替代，涉及 1.2 万亿美元工资' }, highlight: { en: 'Scientific Validation', zh: '科学验证' }, tech: '' },
      { year: '2025.11', event: { en: 'McKinsey: 57% automatable', zh: '麦肯锡：57% 可自动化' }, impact: { en: '57% of hours technically automatable', zh: '57% 工作时长理论上可自动化' }, highlight: { en: 'Automation Potential', zh: '自动化潜力' }, tech: '' },
      { year: '2025', event: { en: 'AI Skills & Tool Use', zh: 'AI 技能与工具使用' }, impact: { en: 'AI uses tools, completes tasks', zh: 'AI 使用工具、完成任务' }, highlight: { en: 'Reasoning AI', zh: '推理 AI' }, tech: 'Skills' },
      { year: '2025', event: { en: '89% HR leaders admit impact', zh: '89% HR 高层承认影响' }, impact: { en: '67% say AI already affecting jobs', zh: '67% 说 AI 已在影响工作' }, highlight: { en: 'Executive Awareness', zh: '高管意识觉醒' }, tech: '' },
    ],
    color: '#ff2d37',
    isCurrent: true,
  },
  {
    period: '2030',
    title: { en: 'Systemic Restructuring', zh: '系统性重构期' },
    subtitle: { en: 'Agentic AI goes mainstream', zh: '你的职位将变成你不认识的样子' },
    progress: 30,
    events: [
      { year: '2030', event: { en: 'Agentic AI Mainstream', zh: '智能体 AI 主流' }, impact: { en: 'AI agents manage end-to-end workflows', zh: 'AI 代理管理端到端工作流' }, highlight: { en: 'Agent Economy', zh: '代理经济' }, tech: 'Agent' },
      { year: '2030', event: { en: '92M jobs displaced', zh: '9200 万岗位被替代' }, impact: { en: '30% at high automation risk', zh: '30% 处于高自动化风险' }, highlight: { en: 'Global Crisis', zh: '全球危机' }, tech: '' },
    ],
    color: '#ff2d37',
  },
  {
    period: '2040+',
    title: { en: 'High Automation Society', zh: '高比例自动化社会' },
    subtitle: { en: 'Human-level AI capabilities', zh: '走向50%-80%自动化世界' },
    progress: 60,
    events: [
      { year: '2040', event: { en: 'AGI Emergence', zh: 'AGI 诞生' }, impact: { en: 'Human-level AI capabilities', zh: '人类水平 AI 能力' }, highlight: { en: 'Singularity Approaching', zh: '奇点临近' }, tech: 'AGI' },
    ],
    color: '#ff2d37',
  },
];

// 进度阶段
const progressStages = [
  { label: { en: 'Experimental', zh: '试验期' }, range: '0-10%', description: { en: '"AI is fun"', zh: '"AI很好玩"' } },
  { label: { en: 'Pilot', zh: '试点期' }, range: '10-20%', description: { en: '"Quiet replacements"', zh: '"悄悄替换"' } },
  { label: { en: 'YOU ARE HERE', zh: '你在这里' }, range: '20-30%', description: { en: 'MIT: 11.7%', zh: 'MIT: 11.7%' } },
  { label: { en: 'Acceleration', zh: '加速期' }, range: '30-60%', description: { en: 'WEF: 30% by 2030', zh: 'WEF: 2030年30%' } },
  { label: { en: 'Restructuring', zh: '重构期' }, range: '60-80%', description: { en: '50-60% transformed', zh: '50-60% 被重塑' } },
];

function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const steps = 60;
    const stepValue = end / steps;
    const stepDuration = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span className="font-mono font-bold">{count.toLocaleString()}{suffix}</span>;
}

// 技术标签组件
function TechTag({ tech, lang }: { tech: string; lang: Language }) {
  const techLabels: Record<string, { en: string; zh: string; color: string }> = {
    LLM: { en: 'LLM', zh: '大语言模型', color: 'bg-purple-500' },
    Agent: { en: 'Agent', zh: '智能体', color: 'bg-blue-500' },
    Skills: { en: 'Skills', zh: '技能', color: 'bg-green-500' },
  };

  const label = techLabels[tech] || { en: tech, zh: tech, color: 'bg-gray-500' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${label.color} text-white`}>
      {tech === 'LLM' && <Cpu className="w-3 h-3" />}
      {tech === 'Agent' && <Bot className="w-3 h-3" />}
      {tech === 'Skills' && <Sparkles className="w-3 h-3" />}
      <span>{label[lang]}</span>
    </span>
  );
}

// 语言切换按钮
function LanguageButton({ lang, setLang }: { lang: Language; setLang: (lang: Language) => void }) {
  return (
    <motion.button
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-surface-elevated hover:bg-risk-high/80 text-foreground hover:text-white px-4 py-2 rounded-lg border border-surface-elevated transition-all card-hover"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Languages className="w-5 h-5" />
      <span className="font-medium">{lang === 'en' ? 'EN' : '中文'}</span>
    </motion.button>
  );
}

// 首屏
function HeroSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-risk-high/30 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-risk-high/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-risk-high/20 text-risk-high px-4 py-2 rounded-full text-sm font-medium mb-6">
            <AlertCircle className="w-4 h-4" />
            <span>{t.alertBadge}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 glitch">
            <span className="gradient-text">{t.heroTitle}</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground-muted mb-8 max-w-3xl mx-auto">
            {t.heroSubtitlePre}<span className="text-risk-high font-bold">11.7%</span>{t.heroSubtitlePost}<span className="text-risk-high font-bold">57%</span>{t.heroSubtitleEnd}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-2xl p-8 md:p-12 border border-surface-elevated glow-box mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8">{t.progressTitle}</h2>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <div className="text-sm text-foreground-muted">{t.currentReality}</div>
                <div className="text-xs text-foreground-muted">{t.currentRealityDesc}</div>
              </div>
              <div className="text-4xl font-bold mono text-risk-high"><Counter end={MIT_REPLACEMENT_RATE} suffix="%" /></div>
            </div>
            <div className="h-6 bg-surface-elevated rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(MIT_REPLACEMENT_RATE / 60) * 100}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-risk-high to-risk-medium rounded-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </motion.div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <div className="text-sm text-foreground-muted">{t.technicalCeiling}</div>
                <div className="text-xs text-foreground-muted">{t.technicalCeilingDesc}</div>
              </div>
              <div className="text-4xl font-bold mono text-risk-medium"><Counter end={MCKINSEY_AUTOMATION_POTENTIAL} suffix="%" /></div>
            </div>
            <div className="h-6 bg-surface-elevated rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(MCKINSEY_AUTOMATION_POTENTIAL / 100) * 100}%` }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-risk-medium to-risk-low rounded-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="bg-risk-high/10 border border-risk-high/30 rounded-xl p-4 text-center"
          >
            <p className="text-risk-high font-semibold">
              <Skull className="w-5 h-5 inline mr-2 animate-pulse-glow" />
              {t.icebergWarning}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-surface rounded-xl p-4 border border-surface-elevated">
            <div className="text-2xl md:text-3xl font-bold text-risk-high mono"><Counter end={11.7} suffix="%" /></div>
            <div className="text-xs text-foreground-muted mt-1">{t.replaceableNow}</div>
          </div>
          <div className="bg-surface rounded-xl p-4 border border-surface-elevated">
            <div className="text-2xl md:text-3xl font-bold text-risk-medium mono"><Counter end={57} suffix="%" /></div>
            <div className="text-xs text-foreground-muted mt-1">{t.technicallyPossible}</div>
          </div>
          <div className="bg-surface rounded-xl p-4 border border-surface-elevated">
            <div className="text-2xl md:text-3xl font-bold text-data-blue mono"><Counter end={89} suffix="%" /></div>
            <div className="text-xs text-foreground-muted mt-1">{t.hrImpact}</div>
          </div>
          <div className="bg-surface rounded-xl p-4 border border-surface-elevated">
            <div className="text-2xl md:text-3xl font-bold text-risk-low mono">92M</div>
            <div className="text-xs text-foreground-muted mt-1">{t.jobsBy2030}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// 进度阶段
function ProgressStages({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <section className="py-16 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          {t.roadTitle}
        </motion.h2>

        <div className="relative">
          <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-risk-low via-risk-medium to-risk-high rounded-full"></div>

          <div className="grid grid-cols-5 gap-4 relative">
            {progressStages.map((stage, index) => (
              <motion.div
                key={stage.label.en}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                <div className={`w-4 h-4 rounded-full mx-auto mb-4 border-4 border-background z-10 ${
                  stage.label.en === 'YOU ARE HERE' ? 'bg-risk-high scale-150 animate-pulse-glow' : 'bg-surface-elevated'
                }`}></div>
                <div className="text-xs text-foreground-muted mb-1 mono">{stage.range}</div>
                <div className={`font-semibold text-sm mb-2 ${
                  stage.label.en === 'YOU ARE HERE' ? 'text-risk-high' : ''
                }`}>{stage.label[lang]}</div>
                <div className="text-xs text-foreground-muted">{stage.description[lang]}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 时间线
function TimelineSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4"
        >
          {t.timelineTitle}
        </motion.h2>
        <p className="text-center text-foreground-muted mb-16 max-w-2xl mx-auto">
          {t.timelineSubtitle}
        </p>

        <div className="space-y-8">
          {timelineData.map((period, index) => (
            <motion.div
              key={period.period}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 border-2 ${
                period.isCurrent
                  ? 'bg-risk-high/20 border-risk-high glow-box'
                  : period.progress <= MIT_REPLACEMENT_RATE
                  ? 'bg-surface border-risk-high/50'
                  : 'bg-surface border-surface-elevated opacity-60'
              }`}
            >
              {period.isCurrent && (
                <div className="absolute -top-3 left-8 bg-risk-high text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse-glow">
                  <Skull className="w-4 h-4 inline mr-1" />
                  {t.youAreHere}
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <Calendar className="w-8 h-8 text-data-blue" />
                <div>
                  <h3 className="text-2xl font-bold">{period.title[lang]}</h3>
                  <p className="text-foreground-muted">{period.subtitle[lang]}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-3xl font-bold mono" style={{ color: period.color }}>{period.progress}%</div>
                  <div className="text-xs text-foreground-muted">Progress</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {period.events.map((event, i) => (
                  <div key={i} className="bg-background/50 rounded-lg p-4 border border-surface-elevated">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold mono bg-surface-elevated px-2 py-1 rounded">{event.year}</span>
                      {event.highlight && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-risk-high/20 text-risk-high">
                          {event.tech === 'LLM' && <Cpu className="w-3 h-3" />}
                          {event.tech === 'Agent' && <Bot className="w-3 h-3" />}
                          {event.tech === 'Skills' && <Sparkles className="w-3 h-3" />}
                          <span>{event.highlight[lang]}</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold mb-1">{event.event[lang]}</h4>
                    <p className="text-sm text-foreground-muted">{event.impact[lang]}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 高风险职业
function HighRiskJobsSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4"
        >
          {t.highRiskTitle}
        </motion.h2>
        <p className="text-center text-foreground-muted mb-16 max-w-2xl mx-auto">
          {t.highRiskSubtitle}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-elevated">
                <th className="text-left py-4 px-4">{t.industry}</th>
                <th className="text-left py-4 px-4">{t.riskLevel}</th>
                <th className="text-left py-4 px-4">{t.highRiskJobs}</th>
                <th className="text-left py-4 px-4">{t.evidence}</th>
              </tr>
            </thead>
            <tbody>
              {highRiskJobs.map((job, index) => (
                <motion.tr
                  key={job.industry.en}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-surface-elevated hover:bg-surface-elevated/50 transition-colors"
                >
                  <td className="py-4 px-4 font-semibold">{job.industry[lang]}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${job.risk}%` }}
                          viewport={{ once: true }}
                          className="h-full"
                          style={{ backgroundColor: job.risk >= 70 ? '#ff2d37' : job.risk >= 50 ? '#ff9500' : '#30d158' }}
                        />
                      </div>
                      <span className={`font-bold mono ${
                        job.risk >= 70 ? 'text-risk-high' : job.risk >= 50 ? 'text-risk-medium' : 'text-risk-low'
                      }`}>{job.risk}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-foreground-muted">{job.jobs[lang]}</td>
                  <td className="py-4 px-4 text-sm text-foreground-muted">{job.reason[lang]}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 bg-risk-high/10 border border-risk-high/30 rounded-xl p-6 text-center"
        >
          <Flame className="w-8 h-8 text-risk-high mx-auto mb-4 animate-pulse-glow" />
          <p className="text-lg font-semibold text-risk-high">
            {t.pickSoftTargets}
          </p>
          <p className="text-foreground-muted mt-2">
            {t.pickSoftTargetsDesc}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// 企业裁员案例
function LayoffCasesSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4"
        >
          {t.layoffTitle}
        </motion.h2>
        <p className="text-center text-foreground-muted mb-4 max-w-2xl mx-auto">
          {t.layoffSubtitle}
        </p>
        <p className="text-center text-risk-high font-semibold mb-16">
          "{t.takenOver}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layoffCases.map((case_, index) => (
            <motion.div
              key={case_.company.en}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface rounded-xl p-6 border border-surface-elevated card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-8 h-8 text-risk-high" />
                <div>
                  <h3 className="font-bold text-xl">{case_.company[lang]}</h3>
                  <span className="text-xs text-foreground-muted">{case_.industry[lang]}</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-risk-high mono mb-3">{case_.layoffs}</div>
              <div className="text-sm text-foreground-muted mb-2">{t.jobsCut}</div>
              <div className="text-sm p-3 bg-background/50 rounded border border-surface-elevated">
                <span className="text-risk-high font-medium">{t.reason}: </span>{case_.reason[lang]}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-foreground-muted">{t.oneInTwenty}</p>
          <p className="text-sm text-foreground-muted mt-2">{t.source}</p>
        </motion.div>
      </div>
    </section>
  );
}

// 生存指数测试
function SurvivalIndexSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [result, setResult] = useState<number | null>(null);

  const questions = [
    {
      q: t.q1,
      highRisk: t.q1High,
      options: t.q1Options,
    },
    {
      q: t.q2,
      highRisk: t.q2High,
      options: t.q2Options,
    },
    {
      q: t.q3,
      highRisk: t.q3High,
      options: t.q3Options,
    },
  ];

  const calculateRisk = () => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    const maxScore = questions.length * 2;
    const percentage = (total / maxScore) * 100;
    setResult(percentage);
  };

  return (
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4"
        >
          {t.survivalTitle}
        </motion.h2>
        <p className="text-center text-foreground-muted mb-12">
          {t.survivalSubtitle}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-background rounded-2xl p-8 border border-surface-elevated"
        >
          <div className="space-y-8 mb-8">
            {questions.map((question, qIndex) => (
              <div key={qIndex}>
                <h4 className="font-semibold mb-4">{question.q}</h4>
                <div className="grid grid-cols-3 gap-3">
                  {question.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      onClick={() => setAnswers({ ...answers, [qIndex]: oIndex })}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        answers[qIndex] === oIndex
                          ? 'bg-risk-high text-white border-risk-high'
                          : 'bg-surface border-surface-elevated hover:border-risk-high'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={calculateRisk}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full bg-risk-high hover:bg-risk-high/80 disabled:bg-surface-elevated disabled:text-foreground-muted text-white py-4 rounded-lg font-semibold transition-all"
          >
            {t.calculate}
          </button>

          {result !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-surface-elevated"
            >
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold mono ${
                  result >= 66 ? 'text-risk-high' : result >= 33 ? 'text-risk-medium' : 'text-risk-low'
                }`}>
                  {Math.round(result)}%
                </div>
                <div className="text-foreground-muted mt-2">{t.yourRisk}</div>
              </div>

              <div className="bg-surface rounded-lg p-4 border border-surface-elevated">
                <p className="text-sm text-foreground-muted">
                  <Flame className="w-4 h-4 inline text-risk-high mr-2" />
                  <span className="font-semibold text-foreground">{t.realityCheck}</span>
                  <br />
                  {t.realityCheckText}
                </p>
              </div>

              <div className="mt-6 text-center text-sm text-foreground-muted">
                <p className="font-semibold">{t.notTalkShow}</p>
                <p className="mt-2">{t.decideYear}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <footer className="py-12 px-6 border-t border-surface-elevated">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-2">{t.title}</h3>
            <p className="text-foreground-muted text-sm">{t.tagline}</p>
          </div>
          <div className="text-sm text-foreground-muted">
            <p className="font-semibold mb-2">{t.dataSources}</p>
            <p>{t.sources}</p>
            <p>{t.sources2}</p>
          </div>
        </div>
        <div className="text-center text-xs text-foreground-muted border-t border-surface-elevated pt-6">
          <p>⚠️ {t.disclaimer}</p>
          <p className="mt-1">{t.disclaimer2}</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  return (
    <main className="min-h-screen">
      <LanguageButton lang={lang} setLang={setLang} />
      <HeroSection lang={lang} t={t} />
      <ProgressStages lang={lang} t={t} />
      <TimelineSection lang={lang} t={t} />
      <HighRiskJobsSection lang={lang} t={t} />
      <LayoffCasesSection lang={lang} t={t} />
      <SurvivalIndexSection lang={lang} t={t} />
      <Footer lang={lang} t={t} />
    </main>
  );
}
