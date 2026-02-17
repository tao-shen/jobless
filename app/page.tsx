'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Area, AreaChart } from 'recharts';
import { AlertTriangle, TrendingUp, Users, Clock, Search, Shield, Zap, Target, Skull, Flame, Building2, Calendar, AlertCircle, Languages, Cpu, Sparkles, Bot, ClipboardCheck, Database, FileText, Workflow, Activity, Eye, ChevronRight, CheckCircle2, BarChart3, Brain, ArrowUpRight, History, RefreshCw, TrendingDown, Info } from 'lucide-react';
import Link from 'next/link';
import { calculateAIRisk, RISK_LEVEL_INFO, RiskInputData, RiskOutputResult } from '@/lib/ai_risk_calculator_v2';

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
    tableRiskLevel: 'Risk Level',
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

    // 生存指数 V2
    survivalTitle: 'Calculate: Your AI Replacement Risk',
    survivalSubtitle: 'Four dimensions, three metrics, data-driven answers',
    coreDimensions: 'Four Core Dimensions',
    // 新的四个维度
    dim1Title: 'Data Openness',
    dim1Desc: 'How accessible is the data needed for your work?',
    dim1Low: 'Closed/Proprietary',
    dim1High: 'Open/Public',
    dim1Detail: 'Training data availability determines AI learning speed',
    dim2Title: 'Work Data Digitalization',
    dim2Desc: 'How digitized is your work input/output?',
    dim2Low: 'Mostly Physical',
    dim2High: 'Fully Digital',
    dim2Detail: 'Digital work is easier for AI to process',
    dim3Title: 'Process Standardization',
    dim3Desc: 'How standardized are your work processes?',
    dim3Low: 'Highly Variable',
    dim3High: 'Standardized',
    dim3Detail: 'Standardized processes are easier to automate',
    dim4Title: 'Current AI Problem-Solving',
    dim4Desc: 'What % of your work can AI already handle?',
    dim4Low: '0%',
    dim4High: '100%',
    dim4Detail: 'Current adoption shows proven AI capability',
    // 额外保护因素（可选）
    protectiveFactors: 'Protective Factors (Optional)',
    ctx1Title: 'Creative Requirement',
    ctx1Desc: 'How much creativity does your work require?',
    ctx2Title: 'Human Interaction',
    ctx2Desc: 'How much person-to-person interaction?',
    ctx3Title: 'Physical Operation',
    ctx3Desc: 'Does your work require physical manipulation?',
    // 按钮和结果
    toggleOptional: 'Show Optional Factors',
    toggleRequired: 'Back to Core Dimensions',
    calculate: 'Calculate My Risk',
    // 三个核心指标
    threeMetrics: 'Your Three Core Metrics',
    metric1Title: 'Replacement Probability',
    metric1Desc: 'Likelihood AI will replace your job',
    metric2Title: 'Predicted Year',
    metric2Desc: 'When AI will significantly impact your job',
    metric3Title: 'Current Degree',
    metric3Desc: 'How much AI can already do now',
    yearRange: 'Prediction Range',
    riskLevel: 'Risk Level',
    insights: 'Key Insights',
    primaryDriver: 'Primary Risk Driver',
    secondaryFactors: 'Contributing Factors',
    protectionFactors: 'Protective Factors',
    recommendations: 'Recommendations',
    recalculate: 'Recalculate',
    yourRisk: 'AI Replacement Risk',
    realityCheck: 'Reality check:',
    realityCheckText: 'AI won\'t make you unemployed overnight. First, it will quietly take over the most replaceable parts of your work—until you realize, what\'s left isn\'t worth a full-time salary.',
    notTalkShow: 'This isn\'t a talk show. This is a timeline.',
    decideYear: 'What decides which year you become unemployed isn\'t AI—it\'s when you start preparing.',
    detailedAssessment: 'Get Detailed Assessment →',
    detailedAssessmentDesc: 'Want a personalized prediction with specific timeline and recommendations?',
    // 风险等级
    riskVeryLow: 'Very Low Risk',
    riskLow: 'Low Risk',
    riskMedium: 'Medium Risk',
    riskHigh: 'High Risk',
    riskCritical: 'Critical Risk',

    // Footer
    title: 'JOBLESS',
    tagline: 'AI Era Job Observation Platform',
    dataSources: 'Data Sources:',
    sources: 'MIT, McKinsey, WEF, PwC, Goldman Sachs, OECD, BLS, ILO',
    sources2: 'Stanford Digital Economy Lab, Gallup, World Bank',
    disclaimer: 'This website data is for reference only and does not constitute investment or career advice.',
    disclaimer2: 'All statistics cited from public research reports and news sources.',

    // 技术标签
    techLLM: 'LLM',
    techAgent: 'Agent',
    techSkills: 'Skills',
    techAgentic: 'Agentic AI',

    // 新增：历史脉络章节
    historyTitle: 'History Shows: Technology Always Reshapes Work',
    historySubtitle: 'Every technological revolution creates winners and losers. The question is: where will you stand?',
    historyPeriod1: 'Mechanization (1850-1950)',
    historyPeriod1Desc: 'Steam and machines replaced farm labor → Manufacturing boom',
    historyPeriod2: 'Computerization (1970-2000)',
    historyPeriod2Desc: 'Office automation → Job polarization: middle-skill jobs declined',
    historyPeriod3: 'Early AI (2000-2015)',
    historyPeriod3Desc: 'Task-level automation → Jobs redesigned, not eliminated',
    historyPeriod4: 'Generative AI (2015-Present)',
    historyPeriod4Desc: 'From analysis to creation → High-skill work now affected',
    historyLesson: 'The Pattern:',
    historyLessonText: 'Jobs change, but those who adapt survive. The difference this time: AI learns faster than any technology before.',

    // 新增：净就业效应章节
    netImpactTitle: 'The Full Picture: Displacement vs Creation',
    netImpactSubtitle: 'WEF predicts 92M jobs lost, but 170M new jobs created. Net: +78M.',
    wefData: 'WEF Future of Jobs 2025',
    wefDisplaced: '92M displaced',
    wefCreated: '170M new jobs',
    wefNet: '+78M net gain',
    wefPeriod: '2025-2030',
    pwcData: 'PwC Global AI Jobs Barometer',
    pwcExposedGrowth: 'AI-exposed jobs: +38% growth',
    pwcNonExposedGrowth: 'Non-exposed jobs: +65% growth',
    pwcWagePremium: 'AI skills wage premium: +56%',
    mitSloanData: 'MIT Sloan Study',
    mitSloanFinding: 'AI adoption correlates with +6% employment growth',
    oecdData: 'OECD Survey 2024',
    oecdFinding: '4/5 workers say AI improved their performance',
    theReality: 'The Reality:',
    theRealityText: 'Structural reshuffling, not total collapse. New jobs > displaced jobs, but transition pain is real.',

    // 新增：行业深度分析章节
    industryDiveTitle: 'Industry Deep Dive: 7 Sectors, Different Fates',
    industryDiveSubtitle: 'AI affects every industry differently. Know your sector\'s pattern.',
    tabManufacturing: 'Manufacturing',
    tabFinance: 'Finance',
    tabHealthcare: 'Healthcare',
    tabEducation: 'Education',
    tabMedia: 'Media & Content',
    tabCustomerService: 'Customer Service',
    tabSoftware: 'Software Dev',

    // 制造业
    manufTitle: 'Manufacturing',
    manufMode: 'Human-Machine Collaboration',
    manufDesc: 'Workers shift from operation to monitoring and maintenance',
    manufJobs: 'Quality inspection, equipment monitoring, process optimization',
    manufTrend: 'No mass layoffs observed. Employment stable in post-pandemic recovery.',
    manufSource: 'Source: BLS Manufacturing Trends 2025',

    // 金融
    financeTitle: 'Finance & Banking',
    financeMode: 'Mixed: Low-end Replaced + High-end Enhanced',
    financeDesc: 'Algorithmic trading, automated credit scoring, AI advisory',
    financeJobs: 'Junior analysts, loan officers, compliance staff',
    financeTrend: 'Goldman Sachs: 6-7% jobs replacable in baseline scenario',
    financeSource: 'Source: Goldman Sachs Economic Research',

    // 医疗
    healthcareTitle: 'Healthcare',
    healthcareMode: 'Strong Augmentation, Weak Replacement',
    healthcareDesc: 'AI assists diagnosis, medical coding, patient triage',
    healthcareJobs: 'Radiologists, medical records, diagnostic support',
    healthcareTrend: 'BLS predicts radiology +5% growth (2024-2034), above average',
    healthcareSource: 'Source: CNN/BLS Employment Projections',

    // 教育
    eduTitle: 'Education',
    eduMode: 'Clear Enhancement',
    eduDesc: 'AI helps with grading, lesson planning, personalized tutoring',
    eduJobs: 'K-12 teachers, university faculty, corporate trainers',
    eduTrend: '60% of teachers use AI, saving 5.9 hours/week',
    eduSource: 'Source: Gallup Education Poll 2024-2025',

    // 媒体
    mediaTitle: 'Media & Content',
    mediaMode: 'Mixed: Low-end Replaced + Creative Enhanced',
    mediaDesc: 'AI generates content at scale, humans curate and direct',
    mediaJobs: 'Copywriters, basic designers, video editors',
    mediaTrend: 'WGA strike 2023 highlighted AI concerns, but industry continues growing',
    mediaSource: 'Source: WEF Media & Entertainment Report',

    // 客服
    csTitle: 'Customer Service',
    csMode: 'High Replacement Ratio',
    csDesc: 'Chatbots handle 80% of standard queries by 2025',
    csJobs: 'Phone support, online chat, Tier-1 support',
    csTrend: 'One of the first sectors with significant job reduction',
    csSource: 'Source: Okoone AI Trends 2025',

    // 软件开发
    softTitle: 'Software Development',
    softMode: 'Structural Shift: Junior Compressed, Senior Enhanced',
    softDesc: 'AI code assistants boost productivity, reducing junior demand',
    softJobs: 'Junior developers, QA engineers, basic coders',
    softTrend: 'Young devs (-20%), but overall +17.9% growth predicted (2023-2033)',
    softSource: 'Source: Stanford Digital Economy Lab & BLS',

    // 模式标签
    modeHighReplacement: 'High Replacement',
    modeMixed: 'Mixed Impact',
    modeAugmentation: 'Strong Augmentation',
    modeCollaboration: 'Collaboration',
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
    tableRiskLevel: '风险等级',
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

    // 生存指数 V2
    survivalTitle: '算一算：你的 AI 替代风险',
    survivalSubtitle: '四个维度，三个指标，数据驱动答案',
    coreDimensions: '四个核心维度',
    // 新的四个维度
    dim1Title: '数据开放程度',
    dim1Desc: '你工作所需的数据可获取性如何？',
    dim1Low: '封闭/私有',
    dim1High: '开放/公开',
    dim1Detail: '训练数据的可获得性决定 AI 学习速度',
    dim2Title: '工作数据数字化',
    dim2Desc: '你的工作输入/输出数字化程度如何？',
    dim2Low: '主要依赖实体',
    dim2High: '完全数字化',
    dim2Detail: '数字化工作更容易被 AI 处理',
    dim3Title: '流程标准化',
    dim3Desc: '你的工作流程标准化程度如何？',
    dim3Low: '高度变化',
    dim3High: '标准化',
    dim3Detail: '标准化流程更容易自动化',
    dim4Title: '当前 AI 解决问题占比',
    dim4Desc: 'AI 目前能处理你工作的百分之多少？',
    dim4Low: '0%',
    dim4High: '100%',
    dim4Detail: '当前采用率反映已验证的 AI 能力',
    // 额外保护因素（可选）
    protectiveFactors: '保护因素（可选）',
    ctx1Title: '创造性要求',
    ctx1Desc: '你的工作需要多少创造力？',
    ctx2Title: '人际交互',
    ctx2Desc: '需要多少人与人之间的互动？',
    ctx3Title: '物理操作',
    ctx3Desc: '你的工作是否需要物理操作？',
    // 按钮和结果
    toggleOptional: '显示可选因素',
    toggleRequired: '返回核心维度',
    calculate: '计算我的风险',
    // 三个核心指标
    threeMetrics: '你的三个核心指标',
    metric1Title: '被 AI 替代的概率',
    metric1Desc: 'AI 替代你工作的可能性',
    metric2Title: '预测年份',
    metric2Desc: 'AI 显著影响你工作的时间',
    metric3Title: '当前程度',
    metric3Desc: 'AI 目前能完成多少',
    yearRange: '预测范围',
    riskLevel: '风险等级',
    insights: '关键洞察',
    primaryDriver: '主要风险驱动因素',
    secondaryFactors: '次要因素',
    protectionFactors: '保护因素',
    recommendations: '行动建议',
    recalculate: '重新计算',
    yourRisk: 'AI 替代风险',
    realityCheck: '现实检查：',
    realityCheckText: 'AI 不会"一天之内"让你失业，它会先悄悄拿走你工作里最好替代的那一部分——等你发现，剩下那点工作，已经不值一个全职工资了。',
    notTalkShow: '这不是访谈节目，这是时间轴。',
    decideYear: '决定你站在哪一年失业的，不是 AI，而是你什么时候开始准备。',
    detailedAssessment: '获取详细评估 →',
    detailedAssessmentDesc: '想要个性化的时间预测和具体建议？',
    // 风险等级
    riskVeryLow: '极低风险',
    riskLow: '低风险',
    riskMedium: '中等风险',
    riskHigh: '高风险',
    riskCritical: '极高风险',

    // Footer
    title: 'JOBLESS',
    tagline: 'AI 时代就业观察平台',
    dataSources: '数据来源：',
    sources: 'MIT、麦肯锡、WEF、PwC、高盛、OECD、BLS、ILO',
    sources2: '斯坦福数字经济实验室、Gallup、世界银行',
    disclaimer: '本网站数据仅供参考，不构成投资或职业建议。',
    disclaimer2: '所有统计数据引用自公开研究报告和新闻来源。',

    // 技术标签
    techLLM: 'LLM',
    techAgent: '智能体',
    techSkills: '技能',
    techAgentic: '智能体 AI',

    // 新增：历史脉络章节
    historyTitle: '历史证明：技术总在重塑工作',
    historySubtitle: '每次技术革命都有赢家和输家。问题是：你会站在哪一边？',
    historyPeriod1: '机械化时代 (1850-1950)',
    historyPeriod1Desc: '蒸汽机和机器取代农场劳动力 → 制造业繁荣',
    historyPeriod2: '计算机化时代 (1970-2000)',
    historyPeriod2Desc: '办公自动化 → 就业两极化：中等技能岗位减少',
    historyPeriod3: '早期 AI (2000-2015)',
    historyPeriod3Desc: '任务级自动化 → 岗位重构而非消失',
    historyPeriod4: '生成式 AI (2015-至今)',
    historyPeriod4Desc: '从分析到创作 → 高技能工作受影响',
    historyLesson: '规律：',
    historyLessonText: '工作会改变，但适应的人能生存。这次的不同：AI比任何技术都学得更快。',

    // 新增：净就业效应章节
    netImpactTitle: '全貌：替代 vs 创造',
    netImpactSubtitle: 'WEF 预测 9200 万岗位流失，但 1.7 亿新岗位被创造。净增：+7800 万。',
    wefData: 'WEF 就业未来报告 2025',
    wefDisplaced: '9200 万被替代',
    wefCreated: '1.7 亿新岗位',
    wefNet: '+7800 万净增长',
    wefPeriod: '2025-2030',
    pwcData: 'PwC 全球 AI 就业晴雨表',
    pwcExposedGrowth: 'AI暴露岗位：+38% 增长',
    pwcNonExposedGrowth: '非暴露岗位：+65% 增长',
    pwcWagePremium: 'AI技能工资溢价：+56%',
    mitSloanData: 'MIT 斯隆商学院研究',
    mitSloanFinding: 'AI采用与企业就业增长 +6% 相关',
    oecdData: 'OECD 2024 调查',
    oecdFinding: '4/5 工人说 AI 提升了他们的工作表现',
    theReality: '现实：',
    theRealityText: '结构性洗牌，而非全面崩盘。新岗位 > 被替代岗位，但转型痛苦是真实的。',

    // 新增：行业深度分析章节
    industryDiveTitle: '行业深度分析：7个行业，不同命运',
    industryDiveSubtitle: 'AI对不同行业影响不同。了解你所在行业的模式。',
    tabManufacturing: '制造业',
    tabFinance: '金融',
    tabHealthcare: '医疗',
    tabEducation: '教育',
    tabMedia: '媒体内容',
    tabCustomerService: '客服',
    tabSoftware: '软件开发',

    // 制造业
    manufTitle: '制造业',
    manufMode: '人机协作增强',
    manufDesc: '工人从操作转向监控和维护',
    manufJobs: '质检、设备监控、流程优化',
    manufTrend: '未观察到大规模裁员。疫情后就业稳定恢复。',
    manufSource: '来源：BLS 制造业趋势 2025',

    // 金融
    financeTitle: '金融银行业',
    financeMode: '混合：低端替代 + 高端增强',
    financeDesc: '算法交易、自动信贷评分、AI 投顾',
    financeJobs: '初级分析师、信贷员、合规人员',
    financeTrend: '高盛：基准情景下 6-7% 岗位可被替代',
    financeSource: '来源：高盛经济研究',

    // 医疗
    healthcareTitle: '医疗健康',
    healthcareMode: '强增强、弱替代',
    healthcareDesc: 'AI 辅助诊断、医疗编码、患者分诊',
    healthcareJobs: '放射科医生、病历管理、诊断辅助',
    healthcareTrend: 'BLS 预测放射科 +5% 增长 (2024-2034)，高于平均',
    healthcareSource: '来源：CNN/BLS 就业预测',

    // 教育
    eduTitle: '教育',
    eduMode: '明显增强',
    eduDesc: 'AI 帮助批改作业、备课、个性化辅导',
    eduJobs: '中小学教师、大学教师、企业培训师',
    eduTrend: '60% 教师使用 AI，每周节省 5.9 小时',
    eduSource: '来源：Gallup 教育民调 2024-2025',

    // 媒体
    mediaTitle: '媒体与内容',
    mediaMode: '混合：低端替代 + 创意增强',
    mediaDesc: 'AI 大规模生成内容，人类策展和导演',
    mediaJobs: '文案、基础设计、视频剪辑',
    mediaTrend: '2023 年编剧罢工突显 AI 焦虑，但行业持续增长',
    mediaSource: '来源：WEF 媒体与娱乐报告',

    // 客服
    csTitle: '客户服务',
    csMode: '高比例替代',
    csDesc: '到 2025 年，聊天机器人可处理 80% 标准询问',
    csJobs: '电话客服、在线客服、一级支持',
    csTrend: '首批显著减少就业的领域之一',
    csSource: '来源：Okoone AI 趋势 2025',

    // 软件开发
    softTitle: '软件开发',
    softMode: '结构性洗牌：初级压缩、资深增强',
    softDesc: 'AI 代码助手提升效率，降低初级人力需求',
    softJobs: '初级开发者、QA 工程师、基础编码',
    softTrend: '年轻开发者 -20%，但整体预测 +17.9% 增长 (2023-2033)',
    softSource: '来源：斯坦福数字经济实验室 & BLS',

    // 模式标签
    modeHighReplacement: '高替代',
    modeMixed: '混合影响',
    modeAugmentation: '强增强',
    modeCollaboration: '协作',
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

// 高风险职业 - 包含替代/增强模式
const highRiskJobs = [
  { industry: { en: 'Customer Service', zh: '客服/呼叫中心' }, risk: 95, mode: 'high-replacement', jobs: { en: 'Phone support, Online chat', zh: '电话客服、在线客服' }, reason: { en: 'AI handles 80% of standard queries by 2025', zh: '2025年AI可处理80%标准问答' } },
  { industry: { en: 'Admin / Support', zh: '行政/文秘' }, risk: 90, mode: 'high-replacement', jobs: { en: 'Assistants, Data entry', zh: '助理、数据录入' }, reason: { en: 'Part of MIT\'s 11.7%', zh: 'MIT 11.7% 的重要组成部分' } },
  { industry: { en: 'Software Development', zh: '软件开发' }, risk: 45, mode: 'mixed', jobs: { en: 'Junior developers', zh: '初级开发者' }, reason: { en: 'Young devs -20%, but overall +17.9% growth', zh: '年轻开发者-20%，但整体增长+17.9%' } },
  { industry: { en: 'Finance / Accounting', zh: '金融/会计' }, risk: 65, mode: 'mixed', jobs: { en: 'Junior analysts', zh: '初级分析师' }, reason: { en: 'Entry-level at risk, high-level enhanced', zh: '入门级有风险，高级岗位增强' } },
  { industry: { en: 'Manufacturing', zh: '制造业' }, risk: 55, mode: 'collaboration', jobs: { en: 'Quality inspection, Monitoring', zh: '质检、监控' }, reason: { en: 'Human-machine collaboration, no mass layoffs', zh: '人机协作，无大规模裁员' } },
  { industry: { en: 'Education', zh: '教育' }, risk: 20, mode: 'augmentation', jobs: { en: 'K-12 Teachers', zh: '中小学教师' }, reason: { en: 'BLS predicts +5% growth (2024-2034)', zh: 'BLS预测+5%增长(2024-2034)' } },
  { industry: { en: 'Healthcare (Radiology)', zh: '医疗(放射科)' }, risk: 15, mode: 'augmentation', jobs: { en: 'Radiologists', zh: '放射科医生' }, reason: { en: 'BLS predicts +5% growth, AI as assistant', zh: 'BLS预测+5%增长，AI作为助手' } },
  { industry: { en: 'Media / Content', zh: '媒体/内容' }, risk: 50, mode: 'mixed', jobs: { en: 'Copywriting, Basic design', zh: '文案、基础设计' }, reason: { en: 'Low-end replaced, creative enhanced', zh: '低端被替代，创意岗位增强' } },
];

// 模式标签颜色和图标映射
const modeConfig: Record<string, { color: string; label: { en: string; zh: string }; icon: any }> = {
  'high-replacement': { color: '#ff2d37', label: { en: '🔴 High Replacement', zh: '🔴 高替代' }, icon: AlertTriangle },
  'mixed': { color: '#ff9500', label: { en: '🟡 Mixed Impact', zh: '🟡 混合影响' }, icon: RefreshCw },
  'collaboration': { color: '#30d158', label: { en: '🟢 Collaboration', zh: '🟢 协作' }, icon: Users },
  'augmentation': { color: '#30d158', label: { en: '🟢 Strong Augmentation', zh: '🟢 强增强' }, icon: TrendingUp },
};

// 净就业效应数据
const netImpactData = [
  {
    source: { en: 'WEF Future of Jobs 2025', zh: 'WEF 就业未来报告 2025' },
    displaced: '92M',
    created: '170M',
    net: '+78M',
    period: '2025-2030',
    color: '#30d158'
  },
  {
    source: { en: 'PwC Global AI Jobs Barometer', zh: 'PwC 全球 AI 就业晴雨表' },
    exposedGrowth: '38%',
    nonExposedGrowth: '65%',
    wagePremium: '56%',
    color: '#64d2ff'
  },
  {
    source: { en: 'MIT Sloan Study', zh: 'MIT 斯隆研究' },
    finding: { en: '+6% employment growth with AI', zh: 'AI 采用企业就业 +6% 增长' },
    color: '#0a84ff'
  },
  {
    source: { en: 'OECD Survey 2024', zh: 'OECD 2024 调查' },
    finding: { en: '4/5 workers say AI helps', zh: '4/5 工人说 AI 有帮助' },
    color: '#30d158'
  },
];

// 行业深度分析数据
const industryDiveData = [
  {
    id: 'manufacturing',
    title: { en: 'Manufacturing', zh: '制造业' },
    mode: 'collaboration',
    color: '#30d158',
    desc: { en: 'Human-machine collaboration', zh: '人机协作增强' },
    jobs: { en: 'Quality inspection, monitoring', zh: '质检、监控' },
    trend: { en: 'No mass layoffs, stable employment', zh: '无大规模裁员，就业稳定' },
    source: { en: 'BLS Manufacturing Trends 2025', zh: 'BLS 制造业趋势 2025' }
  },
  {
    id: 'finance',
    title: { en: 'Finance & Banking', zh: '金融银行业' },
    mode: 'mixed',
    color: '#ff9500',
    desc: { en: 'Low-end replaced, high-end enhanced', zh: '低端替代、高端增强' },
    jobs: { en: 'Junior analysts, loan officers', zh: '初级分析师、信贷员' },
    trend: { en: '6-7% jobs replacable (Goldman Sachs)', zh: '6-7%可替代（高盛）' },
    source: { en: 'Goldman Sachs Economic Research', zh: '高盛经济研究' }
  },
  {
    id: 'healthcare',
    title: { en: 'Healthcare', zh: '医疗健康' },
    mode: 'augmentation',
    color: '#30d158',
    desc: { en: 'Strong augmentation, weak replacement', zh: '强增强、弱替代' },
    jobs: { en: 'Radiologists, diagnostic support', zh: '放射科、诊断辅助' },
    trend: { en: '+5% growth predicted (2024-2034)', zh: '预测 +5% 增长 (2024-2034)' },
    source: { en: 'CNN/BLS Employment Projections', zh: 'CNN/BLS 就业预测' }
  },
  {
    id: 'education',
    title: { en: 'Education', zh: '教育' },
    mode: 'augmentation',
    color: '#30d158',
    desc: { en: 'Clear enhancement', zh: '明显增强' },
    jobs: { en: 'K-12 teachers, faculty', zh: '中小学教师、大学教师' },
    trend: { en: '60% use AI, save 5.9hrs/week', zh: '60%使用AI，每周省5.9小时' },
    source: { en: 'Gallup Education Poll 2024-2025', zh: 'Gallup 教育民调 2024-2025' }
  },
  {
    id: 'media',
    title: { en: 'Media & Content', zh: '媒体内容' },
    mode: 'mixed',
    color: '#ff9500',
    desc: { en: 'Low-end replaced, creative enhanced', zh: '低端被替代，创意增强' },
    jobs: { en: 'Copywriters, basic designers', zh: '文案、基础设计' },
    trend: { en: 'Industry growing despite AI', zh: '尽管有AI，行业仍在增长' },
    source: { en: 'WEF Media Report 2025', zh: 'WEF 媒体报告 2025' }
  },
  {
    id: 'customer-service',
    title: { en: 'Customer Service', zh: '客户服务' },
    mode: 'high-replacement',
    color: '#ff2d37',
    desc: { en: 'High replacement ratio', zh: '高比例替代' },
    jobs: { en: 'Phone support, online chat', zh: '电话客服、在线客服' },
    trend: { en: '80% queries handled by AI by 2025', zh: '2025年80%询问由AI处理' },
    source: { en: 'Okoone AI Trends 2025', zh: 'Okoone AI 趋势 2025' }
  },
  {
    id: 'software',
    title: { en: 'Software Development', zh: '软件开发' },
    mode: 'mixed',
    color: '#ff9500',
    desc: { en: 'Junior compressed, senior enhanced', zh: '初级压缩、资深增强' },
    jobs: { en: 'Junior developers, QA engineers', zh: '初级开发者、QA工程师' },
    trend: { en: 'Young -20%, overall +17.9% growth', zh: '年轻-20%，整体+17.9%增长' },
    source: { en: 'Stanford & BLS Data', zh: '斯坦福 & BLS 数据' }
  },
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

// 历史脉络章节
function HistoricalContextSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const historyPeriods = [
    { periodKey: 'historyPeriod1', descKey: 'historyPeriod1Desc', icon: History, color: 'bg-amber-500/20 text-amber-500' },
    { periodKey: 'historyPeriod2', descKey: 'historyPeriod2Desc', icon: Clock, color: 'bg-blue-500/20 text-blue-500' },
    { periodKey: 'historyPeriod3', descKey: 'historyPeriod3Desc', icon: Cpu, color: 'bg-purple-500/20 text-purple-500' },
    { periodKey: 'historyPeriod4', descKey: 'historyPeriod4Desc', icon: Zap, color: 'bg-risk-high/20 text-risk-high' },
  ] as const;

  return (
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4"
        >
          {t.historyTitle}
        </motion.h2>
        <p className="text-center text-foreground-muted mb-16 max-w-2xl mx-auto">
          {t.historySubtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {historyPeriods.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background rounded-xl p-6 border border-surface-elevated"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{t[item.periodKey]}</h3>
              <p className="text-sm text-foreground-muted">{t[item.descKey]}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-risk-high/10 border border-risk-high/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-risk-high flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-risk-high mb-2">{t.historyLesson}</h4>
              <p className="text-foreground-muted">{t.historyLessonText}</p>
            </div>
          </div>
        </motion.div>
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
                <th className="text-left py-4 px-4">{t.tableRiskLevel}</th>
                <th className="text-left py-4 px-4">{t.highRiskJobs}</th>
                <th className="text-left py-4 px-4">AI Impact Mode</th>
                <th className="text-left py-4 px-4">{t.evidence}</th>
              </tr>
            </thead>
            <tbody>
              {highRiskJobs.map((job, index) => {
                const config = modeConfig[job.mode];
                const Icon = config.icon;
                return (
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
                            style={{ backgroundColor: config.color }}
                          />
                        </div>
                        <span className="font-bold mono" style={{ color: config.color }}>{job.risk}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground-muted">{job.jobs[lang]}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium`} style={{ backgroundColor: config.color + '20', color: config.color }}>
                        <Icon className="w-3 h-3" />
                        <span>{config.label[lang]}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground-muted">{job.reason[lang]}</td>
                  </motion.tr>
                );
              })}
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

// 净就业效应章节
function NetJobImpactSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4"
        >
          {t.netImpactTitle}
        </motion.h2>
        <p className="text-center text-foreground-muted mb-16 max-w-2xl mx-auto">
          {t.netImpactSubtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {netImpactData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background rounded-xl p-6 border-2"
              style={{ borderColor: item.color + '30' }}
            >
              <h3 className="font-bold text-sm mb-4" style={{ color: item.color }}>{item.source[lang]}</h3>
              {item.displaced && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-foreground-muted">{t.wefDisplaced}:</span>
                    <span className="text-lg font-bold text-risk-high">{item.displaced}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-foreground-muted">{t.wefCreated}:</span>
                    <span className="text-lg font-bold text-risk-low">{item.created}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-surface-elevated">
                    <span className="text-xs text-foreground-muted">{t.wefNet}:</span>
                    <span className="text-xl font-bold text-risk-low">{item.net}</span>
                  </div>
                </>
              )}
              {item.exposedGrowth && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-foreground-muted">{t.pwcExposedGrowth}:</span>
                    <span className="text-lg font-bold" style={{ color: item.color }}>{item.exposedGrowth}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-foreground-muted">{t.pwcNonExposedGrowth}:</span>
                    <span className="text-lg font-bold text-foreground-muted">{item.nonExposedGrowth}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-surface-elevated">
                    <span className="text-xs text-foreground-muted">{t.pwcWagePremium}:</span>
                    <span className="text-lg font-bold text-data-blue">{item.wagePremium}</span>
                  </div>
                </>
              )}
              {item.finding && (
                <div className="text-center py-4">
                  <p className="text-base font-semibold mb-2" style={{ color: item.color }}>{item.finding[lang]}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-surface-elevated/50 border border-surface-elevated rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-data-blue flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-2">{t.theReality}</h4>
              <p className="text-foreground-muted">{t.theRealityText}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// 行业深度分析章节
function IndustryDeepDiveSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const [selectedIndustry, setSelectedIndustry] = useState(0);

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4"
        >
          {t.industryDiveTitle}
        </motion.h2>
        <p className="text-center text-foreground-muted mb-12 max-w-2xl mx-auto">
          {t.industryDiveSubtitle}
        </p>

        {/* 行业标签 */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {industryDiveData.map((industry, index) => {
            const Icon = modeConfig[industry.mode].icon;
            return (
              <button
                key={index}
                onClick={() => setSelectedIndustry(index)}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedIndustry === index
                    ? 'bg-risk-high text-white shadow-lg shadow-risk-high/30'
                    : 'bg-surface hover:bg-surface-elevated text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{industry.title[lang]}</span>
              </button>
            );
          })}
        </div>

        {/* 行业详情 */}
        <motion.div
          key={selectedIndustry}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface rounded-2xl p-8 border border-surface-elevated"
        >
          {(() => {
            const industry = industryDiveData[selectedIndustry];
            const config = modeConfig[industry.mode];
            const Icon = config.icon;

            return (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: config.color + '20' }}>
                    <Icon className="w-8 h-8" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">{industry.title[lang]}</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium`} style={{ backgroundColor: config.color + '20', color: config.color }}>
                      <span>{config.label[lang]}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-background/50 rounded-lg p-4 border border-surface-elevated">
                      <div className="text-xs text-foreground-muted mb-1">主导模式</div>
                      <div className="font-semibold">{industry.desc[lang]}</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 border border-surface-elevated">
                      <div className="text-xs text-foreground-muted mb-1">典型岗位</div>
                      <div className="font-semibold">{industry.jobs[lang]}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-background/50 rounded-lg p-4 border border-surface-elevated">
                      <div className="text-xs text-foreground-muted mb-1">就业趋势</div>
                      <div className="font-semibold text-foreground">{industry.trend[lang]}</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 border border-surface-elevated">
                      <div className="text-xs text-foreground-muted mb-1">数据来源</div>
                      <div className="text-xs text-foreground-muted">{industry.source[lang]}</div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </motion.div>
      </div>
    </section>
  );
}

// 维度滑块组件
function DimensionSlider({
  title,
  desc,
  detail,
  value,
  onChange,
  lowLabel,
  highLabel,
  icon: Icon,
  color
}: {
  title: string;
  desc: string;
  detail: string;
  value: number;
  onChange: (val: number) => void;
  lowLabel: string;
  highLabel: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-surface-elevated">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold mb-1">{title}</h4>
          <p className="text-xs text-foreground-muted mb-1">{desc}</p>
          <p className="text-xs text-foreground-muted opacity-70">{detail}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-foreground-muted">
          <span>{lowLabel}</span>
          <span className="font-bold" style={{ color }}>{Math.round(value)}%</span>
          <span>{highLabel}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-surface-elevated rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, var(--surface-elevated) ${value}%, var(--surface-elevated) 100%)`
          }}
        />
      </div>
    </div>
  );
}

// 生存指数测试 V2
function SurvivalIndexSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const [showOptional, setShowOptional] = useState(false);
  const [result, setResult] = useState<RiskOutputResult | null>(null);

  // 核心维度状态
  const [dimensions, setDimensions] = useState({
    dataOpenness: 50,
    workDataDigitalization: 50,
    processStandardization: 50,
    currentAIAdoption: 20,
  });

  // 可选保护因素状态
  const [protections, setProtections] = useState({
    creativeRequirement: 50,
    humanInteraction: 50,
    physicalOperation: 50,
  });

  const updateDimension = (key: string, value: number) => {
    setDimensions(prev => ({ ...prev, [key]: value }));
  };

  const updateProtection = (key: string, value: number) => {
    setProtections(prev => ({ ...prev, [key]: value }));
  };

  const calculateRisk = () => {
    const inputData: RiskInputData = {
      jobTitle: 'User',
      industry: 'other',
      yearsOfExperience: 5,
      ...dimensions,
      ...protections,
    };
    const assessment = calculateAIRisk(inputData, lang);
    setResult(assessment);
  };

  const resetCalculator = () => {
    setResult(null);
    setDimensions({
      dataOpenness: 50,
      workDataDigitalization: 50,
      processStandardization: 50,
      currentAIAdoption: 20,
    });
  };

  return (
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4"
        >
          {t.survivalTitle}
        </motion.h2>
        <p className="text-center text-foreground-muted mb-8">
          {t.survivalSubtitle}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-background rounded-2xl p-6 md:p-8 border border-surface-elevated"
        >
          {!result ? (
            <>
              {/* 四个核心维度 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-risk-high" />
                  <h3 className="font-bold text-lg">{t.coreDimensions}</h3>
                </div>
                <div className="space-y-4">
                  <DimensionSlider
                    title={t.dim1Title}
                    desc={t.dim1Desc}
                    detail={t.dim1Detail}
                    value={dimensions.dataOpenness}
                    onChange={(v) => updateDimension('dataOpenness', v)}
                    lowLabel={t.dim1Low}
                    highLabel={t.dim1High}
                    icon={Database}
                    color="#6366f1"
                  />
                  <DimensionSlider
                    title={t.dim2Title}
                    desc={t.dim2Desc}
                    detail={t.dim2Detail}
                    value={dimensions.workDataDigitalization}
                    onChange={(v) => updateDimension('workDataDigitalization', v)}
                    lowLabel={t.dim2Low}
                    highLabel={t.dim2High}
                    icon={FileText}
                    color="#8b5cf6"
                  />
                  <DimensionSlider
                    title={t.dim3Title}
                    desc={t.dim3Desc}
                    detail={t.dim3Detail}
                    value={dimensions.processStandardization}
                    onChange={(v) => updateDimension('processStandardization', v)}
                    lowLabel={t.dim3Low}
                    highLabel={t.dim3High}
                    icon={Workflow}
                    color="#ec4899"
                  />
                  <DimensionSlider
                    title={t.dim4Title}
                    desc={t.dim4Desc}
                    detail={t.dim4Detail}
                    value={dimensions.currentAIAdoption}
                    onChange={(v) => updateDimension('currentAIAdoption', v)}
                    lowLabel={t.dim4Low}
                    highLabel={t.dim4High}
                    icon={Bot}
                    color="#f43f5e"
                  />
                </div>
              </div>

              {/* 可选保护因素切换按钮 */}
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="w-full mb-4 py-2 px-4 bg-surface-elevated hover:bg-surface-elevated/80 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {showOptional ? <ChevronRight className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4" />}
                {showOptional ? t.toggleRequired : t.toggleOptional}
              </button>

              {/* 可选保护因素 */}
              {showOptional && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-surface rounded-xl border border-surface-elevated"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-risk-low" />
                    <h4 className="font-semibold text-sm">{t.protectiveFactors}</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-foreground-muted mb-1 block">{t.ctx1Title}</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={protections.creativeRequirement}
                        onChange={(e) => updateProtection('creativeRequirement', parseFloat(e.target.value))}
                        className="w-full h-2 bg-surface-elevated rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #30d158 0%, #30d158 ${protections.creativeRequirement}%, var(--surface-elevated) ${protections.creativeRequirement}%, var(--surface-elevated) 100%)`
                        }}
                      />
                      <div className="text-xs text-center mt-1 text-risk-low font-medium">{Math.round(protections.creativeRequirement)}%</div>
                    </div>
                    <div>
                      <label className="text-xs text-foreground-muted mb-1 block">{t.ctx2Title}</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={protections.humanInteraction}
                        onChange={(e) => updateProtection('humanInteraction', parseFloat(e.target.value))}
                        className="w-full h-2 bg-surface-elevated rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #30d158 0%, #30d158 ${protections.humanInteraction}%, var(--surface-elevated) ${protections.humanInteraction}%, var(--surface-elevated) 100%)`
                        }}
                      />
                      <div className="text-xs text-center mt-1 text-risk-low font-medium">{Math.round(protections.humanInteraction)}%</div>
                    </div>
                    <div>
                      <label className="text-xs text-foreground-muted mb-1 block">{t.ctx3Title}</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={protections.physicalOperation}
                        onChange={(e) => updateProtection('physicalOperation', parseFloat(e.target.value))}
                        className="w-full h-2 bg-surface-elevated rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #30d158 0%, #30d158 ${protections.physicalOperation}%, var(--surface-elevated) ${protections.physicalOperation}%, var(--surface-elevated) 100%)`
                        }}
                      />
                      <div className="text-xs text-center mt-1 text-risk-low font-medium">{Math.round(protections.physicalOperation)}%</div>
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                onClick={calculateRisk}
                className="w-full bg-risk-high hover:bg-risk-high/90 text-white py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                {t.calculate}
              </button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* 风险等级标题 */}
              <div className="text-center mb-6">
                <div className="text-sm text-foreground-muted mb-2">{t.riskLevel}</div>
                <div className="text-2xl font-bold" style={{ color: RISK_LEVEL_INFO[result.riskLevel].color }}>
                  {result.riskLevel === 'very-low' ? t.riskVeryLow :
                   result.riskLevel === 'low' ? t.riskLow :
                   result.riskLevel === 'medium' ? t.riskMedium :
                   result.riskLevel === 'high' ? t.riskHigh : t.riskCritical}
                </div>
              </div>

              {/* 三个核心指标 */}
              <div className="mb-6">
                <h4 className="font-bold mb-4 flex items-center justify-center gap-2">
                  <BarChart3 className="w-5 h-5 text-risk-high" />
                  {t.threeMetrics}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface rounded-xl p-4 border-2 text-center" style={{ borderColor: '#f43f5e' }}>
                    <Activity className="w-6 h-6 mx-auto mb-2" style={{ color: '#f43f5e' }} />
                    <div className="text-xs text-foreground-muted mb-1">{t.metric1Title}</div>
                    <div className="text-2xl font-bold" style={{ color: '#f43f5e' }}>{result.replacementProbability}%</div>
                  </div>
                  <div className="bg-surface rounded-xl p-4 border-2 text-center" style={{ borderColor: '#f59e0b' }}>
                    <Calendar className="w-6 h-6 mx-auto mb-2" style={{ color: '#f59e0b' }} />
                    <div className="text-xs text-foreground-muted mb-1">{t.metric2Title}</div>
                    <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{result.predictedReplacementYear}</div>
                  </div>
                  <div className="bg-surface rounded-xl p-4 border-2 text-center" style={{ borderColor: '#6366f1' }}>
                    <Bot className="w-6 h-6 mx-auto mb-2" style={{ color: '#6366f1' }} />
                    <div className="text-xs text-foreground-muted mb-1">{t.metric3Title}</div>
                    <div className="text-2xl font-bold" style={{ color: '#6366f1' }}>{result.currentReplacementDegree}%</div>
                  </div>
                </div>
              </div>

              {/* 置信区间 */}
              <div className="bg-surface rounded-lg p-3 border border-surface-elevated mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">{t.yearRange}:</span>
                  <span className="font-mono font-bold">
                    {result.confidenceInterval.earliest} - {result.confidenceInterval.latest}
                  </span>
                </div>
              </div>

              {/* 洞察 */}
              <div className="bg-surface rounded-xl p-4 border border-surface-elevated mb-4">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-data-blue" />
                  {t.insights}
                </h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-foreground-muted">{t.primaryDriver}: </span>
                    <span className="font-bold text-risk-high">{result.insights.primaryDriver}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.insights.secondaryFactors.map((factor, i) => (
                      <span key={i} className="px-2 py-0.5 bg-risk-high/10 text-risk-high text-xs rounded">{factor}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.insights.protectionFactors.map((factor, i) => (
                      <span key={i} className="px-2 py-0.5 bg-risk-low/20 text-risk-low text-xs rounded">{factor}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 建议 */}
              <div className="bg-surface rounded-xl p-4 border border-surface-elevated mb-4">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-data-blue" />
                  {t.recommendations}
                </h5>
                <div className="space-y-2">
                  {result.insights.recommendations.slice(0, 4).map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-risk-low flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 现实检查 */}
              <div className="bg-surface rounded-lg p-4 border border-surface-elevated mb-4">
                <p className="text-sm text-foreground-muted">
                  <Flame className="w-4 h-4 inline text-risk-high mr-2" />
                  <span className="font-semibold text-foreground">{t.realityCheck}</span>
                  <br />
                  {t.realityCheckText}
                </p>
              </div>

              <button
                onClick={resetCalculator}
                className="w-full bg-surface-elevated hover:bg-surface-elevated/80 py-3 rounded-lg font-semibold transition-all"
              >
                {t.recalculate}
              </button>
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
      <HistoricalContextSection lang={lang} t={t} />
      <TimelineSection lang={lang} t={t} />
      <HighRiskJobsSection lang={lang} t={t} />
      <LayoffCasesSection lang={lang} t={t} />
      <NetJobImpactSection lang={lang} t={t} />
      <IndustryDeepDiveSection lang={lang} t={t} />
      <SurvivalIndexSection lang={lang} t={t} />
      <Footer lang={lang} t={t} />
    </main>
  );
}
