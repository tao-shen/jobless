'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Area, AreaChart } from 'recharts';
import { AlertTriangle, TrendingUp, Users, Clock, Search, Shield, Zap, Target, Skull, Flame, Building2, Calendar, AlertCircle, Languages, Cpu, Sparkles, Bot, ClipboardCheck, Database, FileText, Workflow, Activity, Eye, ChevronRight, ChevronDown, CheckCircle2, BarChart3, Brain, ArrowUpRight, History, RefreshCw, TrendingDown, Info, BookOpen, Lock, Share2, Download, Copy, ExternalLink, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { calculateAIRisk, RISK_LEVEL_INFO, RiskInputData, RiskOutputResult } from '@/lib/ai_risk_calculator_v2';
import InteractiveTimeline from '@/components/InteractiveTimeline';
import { dataProtectionTranslations } from '@/lib/data-protection';

// 语言类型
type Language = 'en' | 'zh';

// 翻译数据
const translations = {
  en: {
    // 首屏
    alertBadge: '2026: AI has started picking people off the bus',
    heroTitle: 'Are you still on board?',
    heroSubtitlePre: '',
    heroSubtitlePost: 'The AI Kill Line is approaching.',
    heroSubtitleEnd: '',
    mitStat: 'AI can already replace 21.37%',
    mckinseyStat: '57% of work hours',

    // 进度条
    progressTitle: "Industry-Wide AI Progress: Where are we?",
    killLineLabel: 'All-Industry AI Replacement Rate',
    killLineSpeed: '+1.8%/mo',
    killLineHow: 'How we calculate',
    killLineFormula: 'Replacement Rate = Exposure × AI Proficiency',
    killLineExposure: 'Exposure',
    killLineExposureDesc: 'Proportion of job tasks that AI can technically perform',
    killLineProbability: 'AI Proficiency',
    killLineProbabilityDesc: 'Proportion of cases where AI outperforms humans at those tasks',
    killLineExample: 'e.g. Customer Service: 85% exposure × 80% proficiency = 68% replacement rate',
    killLineSource: 'All-industry weighted average by employment share → 21.37%',
    icebergWarning: 'What you see is already 21.37%. The AI Kill Line is approaching.',

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
    hereDesc: 'Current estimate: 21.37% replaceable',
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
    eventMit: 'Current Task-Aligned Estimate',
    eventMitImpact: '21.37% replaceable (task-aligned, win-only)',
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
    survivalBadge: 'RISK CALCULATOR',
    survivalTitle: 'Calculate: Your AI Replacement Risk',
    survivalSubtitle: 'Four dimensions, three metrics, data-driven answers',
    // 职业预设
    selectProfession: 'Select Your Profession (Optional)',
    selectProfessionDesc: 'Choose a profession to auto-fill preset values',
    customProfession: 'Custom Configuration',
    customProfessionDesc: 'Adjust values manually',
    professionName: 'Profession',
    // 四个核心维度
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
    metric2Title: 'AI Kill Line (Year)',
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
    realityCheckText: 'AI won\'t make you unemployed overnight. First, it will quietly take over the most replaceable parts of your work—until you realize, what\'s left isn\'t worth a full-time salary. That\'s when you\'ve crossed the AI Kill Line.',
    notTalkShow: 'This isn\'t a talk show. This is a timeline.',
    decideYear: 'What decides which year you cross the AI Kill Line isn\'t AI—it\'s when you start preparing.',
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

    // 新增：职业分化章节
    divergenceTitle: 'The Career Divergence: Time is the Hidden Variable',
    divergenceSubtitle: 'Every technical person is doing the same math. How much is it costing you to stay where you are?',
    divergenceSource: 'Source: Amy Tam, Bloomberg Beta Investor',

    // 技能转移
    skillShiftTitle: 'The Skill Shift: Execution → Judgment',
    skillShiftOld: 'Old: "Can you solve this problem?"',
    skillShiftNew: 'New: "Can you tell which problems are worth solving?"',
    skillShiftCapabilities: 'Judgment capabilities:',
    skillShiftCap1: 'Orchestrate systems',
    skillShiftCap2: 'Run parallel bets',
    skillShiftCap3: 'Have taste to know what matters',
    skillShiftCap4: 'Distinguish signal from noise',

    // 时间对比
    timeComparisonTitle: 'The Timing Cost Has Changed',
    timeYearAgo: 'A Year Ago',
    timeYearAgoDesc: 'Career decisions felt reversible. Take the wrong job, course correct in 18 months.',
    timeNow: 'Now',
    timeNowDesc: 'Divergence accelerating. Every quarter in the wrong seat = quarter of compounding missed.',
    timeGap: 'The Gap',
    timeGapDesc: 'People who moved 6 months ago are building on what they learned. You\'re not.',

    // 舒适陷阱
    comfortTrapTitle: 'The Comfort Trap',
    comfortTrapDesc: '"Fine" has a cost that doesn\'t show up in your paycheck.',
    comfortTrapQuote: 'The hardest problems aren\'t here anymore, and the org hasn\'t caught up to that fact.',

    // 被动杠杆
    passiveLeverageTitle: 'Passive Leverage',
    passiveLeverageDesc: 'Set experiments in motion. Compounding happens whether or not you\'re at your desk.',
    passiveLeverageQuote: 'You set the experiments in motion, and the compounding happens whether or not you\'re at your desk.',

    // 赢家公司特征
    winningCompaniesTitle: 'What Winning Companies Offer',
    winningComp1: 'Maximum surface area for your judgment',
    winningComp2: 'Zero distance between taste and what gets built',
    winningComp3: 'Surrounded by people who have tricks you haven\'t learned',
    winningComp4: 'Enough compute to actually run experiments',

    // 声望 vs 亲近度
    prestigeProximityTitle: 'Prestige vs Proximity',
    prestigeProximityDesc: 'Big lab resume still opens doors. But "I was at [top lab]" is depreciating while "I did frontier research where my judgment shaped direction" is appreciating.',
    prestigeQuote: 'You joined to touch the thing and you\'re three layers removed from it.',

    // 关键洞察
    divergenceInsight: 'The Math:',
    divergenceInsightText: 'Both bets are rational. But only one of them is time-sensitive.',

    // 数据威胁板块
    dataThreatTitle: 'Your Data Is Training AI to Replace You',
    dataThreatSubtitle: 'Skill is the last mile from general AI to your specific job. Your experience data is the last defense line.',
    lastMileTitle: 'The Last Mile Problem',
    lastMileDesc: 'A foundation model alone can\'t do your job. But add your industry data, your workflows, your expertise — and it becomes your replacement.',
    lastMileStep1: 'Foundation Model',
    lastMileStep1Desc: 'General capability, no specialization',
    lastMileStep2: 'Your Data & Experience',
    lastMileStep2Desc: 'Industry knowledge, workflows, expertise',
    lastMileStep3: 'Your Replacement',
    lastMileStep3Desc: 'AI that does YOUR specific job',
    lastMileArrow1: 'Fine-tuning / Skills',
    lastMileArrow2: 'Specialization',
    lastMileWarning: 'The more open your experience data is, the faster AI crosses the last mile to replace you.',

    // 平台协议
    platformTitle: 'What You Already Agreed To',
    platformSubtitle: 'Most people unknowingly "agreed" to let their data train AI. Here\'s what\'s in the fine print:',
    platformName: 'Platform',
    platformClause: 'AI Training Clause',
    platformRisk: 'Risk',
    platformTrains: 'What It Trains',
    platformRiskHigh: 'Explicit Training',
    platformRiskMedium: 'Ambiguous',
    platformRiskLow: 'Opt-out Available',

    // 反馈循环
    feedbackLoopTitle: 'The Feedback Loop',
    feedbackLoopDesc: 'You create data → Company collects it → AI trains on it → AI replaces you → Company profits',
    feedbackLoopExample: 'Real example: Developers wrote code on GitHub → Copilot trained on it → Companies now hire fewer junior devs',
    feedbackLoopStat: 'The people who created the training data are the first to be replaced.',

    // 保护清单
    protectionTitle: 'Protect Your Last Defense Line',
    protectionSubtitle: 'Actionable steps to guard your experience data:',
    protection1: 'Review AI training opt-out settings on every platform you use',
    protection2: 'Understand your employer\'s data collection and AI training policies',
    protection3: 'Develop non-digitizable skills: judgment, relationships, physical craft',
    protection4: 'Keep proprietary knowledge in non-indexed, private formats',
    protection5: 'Know your rights: GDPR (EU) and data protection laws grant you control',
    viewFullDetails: 'View Full Data Protection Guide',
    viewFullDetailsCta: 'See what platforms collect, the feedback loop, and how to protect yourself.',

    // 社交分享
    shareTitle: 'Share Your Result',
    shareSubtitle: 'Let others know the risk',
    shareCopyLink: 'Copy Link',
    shareCopied: 'Copied!',
    shareTwitter: 'Twitter/X',
    shareWeChat: 'WeChat',
    shareWeibo: 'Weibo',
    shareDownload: 'Download',
    shareText: 'My AI Replacement Risk: {level} ({prob}%). AI Kill Line: {year}. What\'s yours?',
  },
  zh: {
    // 首屏
    alertBadge: '2026：AI 已经开始让人下车了',
    heroTitle: '你还在车上吗？',
    heroSubtitlePre: '',
    heroSubtitlePost: 'AI 斩杀线正在逼近。',
    heroSubtitleEnd: '',
    mitStat: 'AI 已可替代 21.37%',
    mckinseyStat: '57% 工作时长',

    // 进度条
    progressTitle: '全行业 AI 替代进度：我们走到哪了？',
    killLineLabel: '全行业 AI 替代率',
    killLineSpeed: '+1.8%/月',
    killLineHow: '计算方式',
    killLineFormula: '替代率 = 曝光度 × AI 胜任度',
    killLineExposure: '曝光度',
    killLineExposureDesc: 'AI 在技术上能执行的工作任务占比',
    killLineProbability: 'AI 胜任度',
    killLineProbabilityDesc: 'AI 在这些任务上胜出人类的比例',
    killLineExample: '例：客服岗位 85% 曝光度 × 80% 胜任度 = 68% 替代率',
    killLineSource: '全行业按就业人数加权平均 → 21.37%',
    icebergWarning: '你现在看到的已经是 21.37%。AI 斩杀线正在逼近。',

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
    hereDesc: '当前估计：21.37% 可被替代',
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
    eventMit: '当前任务对齐估计',
    eventMitImpact: '21.37% 可被替代（任务对齐，仅win）',
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
    survivalBadge: '风险计算器',
    survivalTitle: '算一算：你的 AI 替代风险',
    survivalSubtitle: '四个维度，三个指标，数据驱动答案',
    // 职业预设
    selectProfession: '选择你的职业（可选）',
    selectProfessionDesc: '选择职业自动填充预设值',
    customProfession: '自定义配置',
    customProfessionDesc: '手动调整各项数值',
    professionName: '职业',
    // 四个核心维度
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
    metric2Title: 'AI 斩杀线（年份）',
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
    realityCheckText: 'AI 不会"一天之内"让你失业，它会先悄悄拿走你工作里最好替代的那一部分——等你发现，剩下那点工作，已经不值一个全职工资了。那一刻，你就已经跨过了 AI 斩杀线。',
    notTalkShow: '这不是访谈节目，这是时间轴。',
    decideYear: '决定你何时跨过 AI 斩杀线的，不是 AI，而是你什么时候开始准备。',
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

    // 新增：职业分化章节
    divergenceTitle: '职业分化：时间是隐形变量',
    divergenceSubtitle: '每个技术人员都在算同一笔账。留在原地正在付出什么代价？',
    divergenceSource: '来源：Amy Tam，Bloomberg Beta 投资人',

    // 技能转移
    skillShiftTitle: '技能转移：执行力 → 判断力',
    skillShiftOld: '过去："你能解决这个问题吗？"',
    skillShiftNew: '现在："你能判断哪些问题值得解决吗？"',
    skillShiftCapabilities: '判断力核心能力：',
    skillShiftCap1: '系统能力',
    skillShiftCap2: '并行投注',
    skillShiftCap3: '品味判断',
    skillShiftCap4: '信号与噪声识别',

    // 时间对比
    timeComparisonTitle: '时间成本已经改变',
    timeYearAgo: '一年前',
    timeYearAgoDesc: '职业决策感觉可逆。选错工作，18个月后调整。',
    timeNow: '现在',
    timeNowDesc: '分化加速。在错误位置待一个季度 = 错过一个季度的复利。',
    timeGap: '差距',
    timeGapDesc: '6个月前转型的人正在在上个季度学习的基础上构建。你没有。',

    // 舒适陷阱
    comfortTrapTitle: '舒适陷阱',
    comfortTrapDesc: '"还行"有代价——代价不体现在工资单上。',
    comfortTrapQuote: '最难的问题已经不在这里了，而组织还没意识到这个事实。',

    // 被动杠杆
    passiveLeverageTitle: '被动杠杆',
    passiveLeverageDesc: '设置实验在运动中。无论你在不在桌前，复利都在发生。',
    passiveLeverageQuote: '你设置实验在运动中，无论你不在不在桌前，复利都在发生。',

    // 赢家公司特征
    winningCompaniesTitle: '赢得人才战的公司特征',
    winningComp1: '判断力有最大的表面积',
    winningComp2: '品味与实际构建之间的距离为零',
    winningComp3: '被拥有你还不知道技巧的人包围',
    winningComp4: '有足够的计算资源实际运行实验',

    // 声望 vs 亲近度
    prestigeProximityTitle: '声望 vs 亲近度',
    prestigeProximityDesc: '大实验室简历仍然能打开每扇门。但"我在[顶级实验室]"的简历价值正在贬值，而"我在判断塑造方向的地方进行前沿研究"的价值在升值。',
    prestigeQuote: '你加入是为了接触到那个东西，但你现在离它隔着三层。',

    // 关键洞察
    divergenceInsight: '这笔账：',
    divergenceInsightText: '两个赌注都合理。但只有一个是时间敏感的。',

    // 数据威胁板块
    dataThreatTitle: '你的数据正在训练 AI 来取代你',
    dataThreatSubtitle: '技能是通用 AI 到专业任务的最后一公里。你的经验数据，是最后一道防线。',
    lastMileTitle: '最后一公里问题',
    lastMileDesc: '基础模型本身做不了你的工作。但加上你的行业数据、你的工作流、你的专业知识——它就变成了你的替代者。',
    lastMileStep1: '基础模型',
    lastMileStep1Desc: '通用能力，无专业化',
    lastMileStep2: '你的数据与经验',
    lastMileStep2Desc: '行业知识、工作流程、专业技能',
    lastMileStep3: '你的替代者',
    lastMileStep3Desc: '能做你具体工作的 AI',
    lastMileArrow1: '微调 / 技能',
    lastMileArrow2: '专业化',
    lastMileWarning: '你的经验数据越开放，AI 就越快跨过最后一公里来取代你。',

    // 平台协议
    platformTitle: '你签了什么？',
    platformSubtitle: '大多数人在不知情的情况下已经"同意"了让自己的数据训练 AI。以下是细则里写的：',
    platformName: '平台',
    platformClause: 'AI 训练条款',
    platformRisk: '风险',
    platformTrains: '训练了什么',
    platformRiskHigh: '明确训练',
    platformRiskMedium: '模糊条款',
    platformRiskLow: '可选退出',

    // 反馈循环
    feedbackLoopTitle: '死亡循环',
    feedbackLoopDesc: '你创造数据 → 公司收集 → AI 训练 → AI 取代你 → 公司获利',
    feedbackLoopExample: '真实案例：开发者在 GitHub 上写代码 → Copilot 用它训练 → 公司现在减少招聘初级开发者',
    feedbackLoopStat: '创造训练数据的人，是第一批被替代的人。',

    // 保护清单
    protectionTitle: '保护你的最后防线',
    protectionSubtitle: '立即可行的经验数据保护措施：',
    protection1: '检查你使用的每个平台的 AI 训练退出设置',
    protection2: '了解你的雇主的数据收集和 AI 训练政策',
    protection3: '发展不可数字化的技能：判断力、人际关系、物理技艺',
    protection4: '将专有知识保存在未被索引的私有格式中',
    protection5: '了解你的权利：GDPR（欧盟）和《个人信息保护法》赋予你数据控制权',
    viewFullDetails: '查看完整数据保护指南',
    viewFullDetailsCta: '了解平台数据收集条款、反馈循环和保护措施。',

    // 社交分享
    shareTitle: '分享你的结果',
    shareSubtitle: '让更多人知道风险',
    shareCopyLink: '复制链接',
    shareCopied: '已复制！',
    shareTwitter: 'Twitter/X',
    shareWeChat: '微信',
    shareWeibo: '微博',
    shareDownload: '下载图片',
    shareText: '我的 AI 替代风险：{level}（{prob}%）。AI 斩杀线：{year}年。你呢？',
  },
};

// 核心数据
const CURRENT_REPLACEMENT_RATE = 21.37;

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
  { industry: { en: 'Admin / Support', zh: '行政/文秘' }, risk: 90, mode: 'high-replacement', jobs: { en: 'Assistants, Data entry', zh: '助理、数据录入' }, reason: { en: 'Part of current 21.37% replacement exposure', zh: '属于当前 21.37% 替代暴露的重要部分' } },
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
    progress: CURRENT_REPLACEMENT_RATE,
    events: [
      { year: '2026.02', event: { en: 'Task-Aligned National Estimate', zh: '任务对齐全国估计' }, impact: { en: '21.37% replaceable (win-only)', zh: '21.37% 可被替代（仅win）' }, highlight: { en: 'Latest Estimate', zh: '最新估计' }, tech: '' },
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

// 五阶段模型（按暴露度分档：<20%, 20-40%, 40-60%, 60-80%, ≥80%）
const KILL_LINE_STAGES = [
  { id: 1, start: 0,  end: 20, label: { en: 'AI Assist', zh: 'AI 助手' }, desc: { en: 'Tool automation', zh: '工具型自动化' }, nature: { en: 'You lead, AI executes', zh: '你主导，AI 执行' }, color: 'var(--risk-low)' },
  { id: 2, start: 20, end: 40, label: { en: 'AI Augment', zh: 'AI 增强' }, desc: { en: 'Cognitive augmentation', zh: '认知增强' }, nature: { en: 'You lead, AI thinks with you', zh: '你主导，AI 辅助思考' }, color: 'var(--risk-medium)' },
  { id: 3, start: 40, end: 60, label: { en: 'AI Agent', zh: 'AI 代理' }, desc: { en: 'Execution delegation', zh: '执行权转移' }, nature: { en: 'You direct, AI executes', zh: '人定方向，AI 执行' }, color: 'var(--risk-high)' },
  { id: 4, start: 60, end: 80, label: { en: 'AI Lead', zh: 'AI 主导' }, desc: { en: 'Decision authority transfer', zh: '决策权转移' }, nature: { en: 'AI decides, you support', zh: 'AI 主导，人类配合' }, color: 'var(--risk-critical)' },
  { id: 5, start: 80, end: 100, label: { en: 'Kill Line', zh: '斩杀线' }, desc: { en: 'Structural replacement', zh: '结构性替代' }, nature: { en: 'AI fully autonomous', zh: 'AI 完全自主运行' }, color: 'var(--accent-purple)' },
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

// AI 斩杀线进度条
function AIKillLineBar({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const maxPct = 100;
  const basePct = CURRENT_REPLACEMENT_RATE;
  const [displayPct, setDisplayPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const calcRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCalc) return;
    const handler = (e: MouseEvent) => {
      if (calcRef.current && !calcRef.current.contains(e.target as Node)) setShowCalc(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCalc]);

  useEffect(() => {
    const duration = 2000;
    const fps = 60;
    const total = (duration / 1000) * fps;
    let f = 0;
    const id = setInterval(() => {
      f++;
      setDisplayPct((1 - Math.pow(1 - f / total, 3)) * basePct);
      if (f >= total) { clearInterval(id); setDisplayPct(basePct); setReady(true); }
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [basePct]);

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setDisplayPct(p => p + 0.005), 2500);
    return () => clearInterval(id);
  }, [ready]);

  const w = (displayPct / maxPct) * 100;
  const activeStage = KILL_LINE_STAGES.find(s => displayPct >= s.start && displayPct < s.end) || KILL_LINE_STAGES[KILL_LINE_STAGES.length - 1];

  return (
    <div className="mb-8">
      {/* Header row */}
      <div className="flex justify-between items-end mb-4">
        <div ref={calcRef} className="flex items-center gap-2.5 relative">
          <span className="text-sm font-medium text-foreground-muted">{t.killLineLabel}</span>
          <button
            onClick={() => setShowCalc(!showCalc)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-foreground-dim hover:text-foreground-muted transition-colors cursor-pointer"
            style={{ border: '1px solid var(--foreground-dim)', opacity: 0.5 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}
          >
            <Info className="w-3 h-3" />
            <span className="hidden sm:inline">{t.killLineHow}</span>
          </button>

          {/* Calculation popup */}
          <AnimatePresence>
            {showCalc && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-3 z-50 w-[320px] sm:w-[380px] rounded-xl border border-surface-elevated/50 p-5"
                style={{
                  background: 'var(--surface-card)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* Formula */}
                <div className="text-center mb-4 py-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
                  <span className="mono text-sm font-bold text-foreground">{t.killLineFormula}</span>
                </div>

                {/* Explanation */}
                <div className="space-y-3 mb-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-risk-medium/20 text-risk-medium text-xs font-bold mt-0.5">E</div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{t.killLineExposure}</div>
                      <div className="text-[11px] text-foreground-muted leading-relaxed">{t.killLineExposureDesc}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-risk-high/20 text-risk-high text-xs font-bold mt-0.5">P</div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{t.killLineProbability}</div>
                      <div className="text-[11px] text-foreground-muted leading-relaxed">{t.killLineProbabilityDesc}</div>
                    </div>
                  </div>
                </div>

                {/* Example */}
                <div className="text-[11px] text-foreground-dim leading-relaxed p-2.5 rounded-lg mb-2" style={{ background: 'var(--surface-elevated)', borderLeft: '2px solid var(--risk-high)' }}>
                  {t.killLineExample}
                </div>

                {/* Source */}
                <div className="text-[10px] text-foreground-dim text-center">
                  {t.killLineSource}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div
          className="text-3xl sm:text-4xl md:text-5xl font-bold mono text-risk-high"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          <Counter end={CURRENT_REPLACEMENT_RATE} suffix="%" />
        </div>
      </div>

      {/* Segmented Bar */}
      <div className="relative h-10 sm:h-12 rounded-xl overflow-hidden bg-surface-elevated" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)' }}>
        {/* Stage background segments */}
        {KILL_LINE_STAGES.map((stage) => {
          const left = (stage.start / maxPct) * 100;
          const width = ((stage.end - stage.start) / maxPct) * 100;
          const isPast = displayPct >= stage.end;
          const isCurrent = displayPct >= stage.start && displayPct < stage.end;
          return (
            <div
              key={stage.id}
              className="absolute top-0 bottom-0"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                borderRight: stage.id < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              {/* Stage number / Kill Line watermark */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{
                  fontSize: stage.id === 5 ? '11px' : '28px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  letterSpacing: stage.id === 5 ? '2px' : undefined,
                  textTransform: stage.id === 5 ? 'uppercase' as const : undefined,
                  color: stage.id === 5 ? 'var(--accent-purple)' : 'var(--foreground-dim)',
                  opacity: stage.id === 5 ? 0.18 : (isPast ? 0.06 : isCurrent ? 0.08 : 0.04),
                }}
              >
                {stage.id === 5 ? (lang === 'zh' ? 'AI 斩杀线' : 'AI KILL LINE') : stage.id}
              </div>
            </div>
          );
        })}

        {/* Kill Line boundary marker at 80% */}
        <div
          className="absolute top-0 bottom-0 z-[5] pointer-events-none"
          style={{ left: '80%' }}
        >
          <div className="absolute inset-y-0 w-[2px] -ml-[1px]" style={{
            background: 'var(--accent-purple)',
            opacity: 0.5,
            boxShadow: '0 0 8px 1px var(--accent-purple)',
          }} />
        </div>

        {/* Unfilled area — marching stripes */}
        <div className="absolute inset-0 rounded-xl bar-march-stripes" />

        {/* Filled area */}
        <div className="absolute inset-y-0 left-0 rounded-l-xl overflow-hidden" style={{ width: `${w}%` }}>
          {/* Per-stage color fill */}
          {KILL_LINE_STAGES.map((stage) => {
            if (stage.start >= displayPct) return null;
            const fillEnd = Math.min(stage.end, displayPct);
            const segLeft = (stage.start / displayPct) * 100;
            const segWidth = ((fillEnd - stage.start) / displayPct) * 100;
            return (
              <div
                key={stage.id}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${segLeft}%`,
                  width: `${segWidth}%`,
                  background: stage.color,
                  opacity: 0.75,
                }}
              />
            );
          })}
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-[38%]" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
          }} />
          {/* Shimmer LTR */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
              animation: 'shimmerLTR 2.5s ease-in-out infinite',
            }} />
          </div>
        </div>

        {/* Leading edge — breathing glow */}
        {w > 1 && (
          <motion.div
            className="absolute top-0 bottom-0 z-10"
            style={{
              left: `${w}%`,
              width: '3px',
              marginLeft: '-2px',
              background: activeStage.color,
            }}
            animate={ready ? {
              boxShadow: [
                '0 0 12px 3px rgba(255,87,34,0.7), 0 0 25px 6px rgba(255,87,34,0.25)',
                '0 0 22px 7px rgba(255,87,34,0.9), 0 0 45px 12px rgba(255,87,34,0.4)',
                '0 0 12px 3px rgba(255,87,34,0.7), 0 0 25px 6px rgba(255,87,34,0.25)',
              ],
            } : undefined}
            transition={ready ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
          />
        )}

        {/* Speed tag ON the bar */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-20"
          style={{ left: `${Math.min(w + 1.5, 82)}%` }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: ready ? 1 : 0, x: ready ? 0 : -8 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-risk-high/10 border border-risk-high/20">
            <TrendingUp className="w-3 h-3 text-risk-high" />
            <span className="text-[10px] mono font-semibold text-risk-high whitespace-nowrap">
              {t.killLineSpeed}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Stage labels below bar */}
      <div className="relative flex mt-2">
        {KILL_LINE_STAGES.map((stage) => {
          const width = ((stage.end - stage.start) / maxPct) * 100;
          const isKillLine = stage.id === 5;
          return (
            <div
              key={stage.id}
              className="flex flex-col items-center text-center px-0.5"
              style={{ width: `${width}%` }}
            >
              {/* Tick */}
              <div style={{
                width: isKillLine ? '2px' : '1px',
                height: isKillLine ? '10px' : '8px',
                marginBottom: '4px',
                background: stage.color,
                opacity: isKillLine ? 1 : 0.9,
                boxShadow: isKillLine ? `0 0 6px ${stage.color}` : 'none',
              }} />
              {/* Stage name */}
              <span
                className={`leading-tight truncate w-full ${isKillLine ? 'text-[10px] sm:text-[13px] font-black tracking-wide' : 'text-[9px] sm:text-[11px] font-bold'}`}
                style={{
                  color: stage.color,
                  textShadow: isKillLine ? `0 0 12px var(--accent-purple)` : 'none',
                }}
              >
                {isKillLine ? (lang === 'zh' ? 'AI 斩杀线' : 'AI Kill Line') : stage.label[lang]}
              </span>
              {/* Range */}
              <span
                className={`mono mt-0.5 font-semibold ${isKillLine ? 'text-[9px] sm:text-[11px]' : 'text-[8px] sm:text-[10px]'}`}
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  color: stage.color,
                  opacity: isKillLine ? 0.9 : 0.85,
                }}
              >
                {stage.start}–{stage.end}%
              </span>
              {/* Nature / core description */}
              <span
                className="text-[8px] sm:text-[9px] mt-0.5 leading-tight hidden md:block"
                style={{
                  color: stage.color,
                  opacity: isKillLine ? 0.85 : 0.75,
                }}
              >
                {stage.desc[lang]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
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

// 主题类型
type Theme = 'dark' | 'light';

// 语言切换按钮
function LanguageButton({ lang, setLang }: { lang: Language; setLang: (lang: Language) => void }) {
  return (
    <motion.button
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      className="z-50 flex items-center justify-center bg-surface-elevated hover:bg-risk-high/80 text-foreground hover:text-white w-10 h-10 rounded-lg border border-surface-elevated transition-all card-hover lang-toggle-btn"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={lang === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      <Languages className="w-5 h-5" />
    </motion.button>
  );
}

// 主题切换按钮
function ThemeButton({ theme, setTheme }: { theme: Theme; setTheme: (theme: Theme) => void }) {
  return (
    <motion.button
      onClick={() => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('jobless-theme', next);
      }}
      className="z-50 flex items-center justify-center w-10 h-10 bg-surface-elevated hover:bg-brand-accent/80 text-foreground hover:text-white rounded-lg border border-surface-elevated transition-all theme-toggle-btn"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </motion.button>
  );
}

// 首屏
function HeroSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden py-20">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-risk-high/40 rounded-full blur-[80px] md:blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-brand-primary/30 rounded-full blur-[60px] md:blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-brand-accent/20 rounded-full blur-[80px] md:blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="absolute inset-0 grid-bg opacity-40"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto hero-glow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Alert badge */}
          <div className="inline-flex items-center gap-2 bg-risk-critical/10 text-risk-critical px-5 py-2.5 rounded-full text-sm font-medium mb-8 border border-risk-critical/20">
            <AlertCircle className="w-4 h-4" />
            <span className="tracking-wide">{t.alertBadge}</span>
          </div>

          {/* Hero title — big and eye-catching */}
          <h1 className="text-3xl sm:text-5xl md:text-8xl font-bold mb-8 leading-tight text-foreground">
            {t.heroTitle}
          </h1>

          <p className="text-xl md:text-2xl text-foreground-muted mb-10 max-w-3xl mx-auto leading-relaxed">
            {t.heroSubtitlePre}{t.heroSubtitlePost}{t.heroSubtitleEnd}
          </p>
        </motion.div>

        {/* Progress bar section */}
        <motion.div
          className="pt-10 border-t border-foreground-dim/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-xl md:text-2xl font-bold mb-8 text-foreground text-left">{t.progressTitle}</h2>

          <AIKillLineBar lang={lang} t={t} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mt-6 py-4 px-5 rounded-lg bg-risk-critical/5 border-l-2 border-risk-critical text-left"
          >
            <p className="text-risk-critical font-medium text-sm">
              <Skull className="w-4 h-4 inline mr-2" />
              {t.icebergWarning}
            </p>
          </motion.div>
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
          <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-risk-low via-risk-medium to-risk-high rounded-full"></div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4 relative">
            {KILL_LINE_STAGES.map((stage, index) => {
              const isCurrent = CURRENT_REPLACEMENT_RATE >= stage.start && CURRENT_REPLACEMENT_RATE < stage.end;
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-center relative ${isCurrent ? 'col-span-2 md:col-span-1' : ''}`}
                >
                  <div className={`w-4 h-4 rounded-full mx-auto mb-4 border-4 border-background z-10 ${
                    isCurrent ? 'bg-risk-high scale-150 animate-pulse-glow' : 'bg-surface-elevated'
                  }`}></div>
                  <div className="text-xs text-foreground-muted mb-1 mono">{stage.start}–{stage.end}%</div>
                  <div className={`font-semibold text-sm mb-1 ${isCurrent ? 'text-risk-high' : ''}`}>{stage.label[lang]}</div>
                  <div className="text-xs text-foreground-muted mb-1">{stage.desc[lang]}</div>
                  <div className="text-[11px] text-foreground-dim">{stage.nature[lang]}</div>
                </motion.div>
              );
            })}
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
                  : period.progress <= CURRENT_REPLACEMENT_RATE
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

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
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

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {highRiskJobs.map((job, index) => {
            const config = modeConfig[job.mode];
            const Icon = config.icon;
            return (
              <motion.div
                key={job.industry.en}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface rounded-xl p-4 border border-surface-elevated"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">{job.industry[lang]}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium`} style={{ backgroundColor: config.color + '20', color: config.color }}>
                    <Icon className="w-3 h-3" />
                    <span>{config.label[lang]}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${job.risk}%` }}
                      viewport={{ once: true }}
                      className="h-full"
                      style={{ backgroundColor: config.color }}
                    />
                  </div>
                  <span className="font-bold mono text-sm" style={{ color: config.color }}>{job.risk}%</span>
                </div>
                <div className="text-sm text-foreground-muted mb-2">{job.jobs[lang]}</div>
                <div className="text-xs text-foreground-muted/70">{job.reason[lang]}</div>
              </motion.div>
            );
          })}
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

// 职业分化章节 - Amy Tam 内容
function CareerDivergenceSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4"
        >
          {t.divergenceTitle}
        </motion.h2>
        <p className="text-center text-foreground-muted mb-4 max-w-2xl mx-auto">
          {t.divergenceSubtitle}
        </p>
        <p className="text-center text-xs text-foreground-muted mb-16">
          {t.divergenceSource}
        </p>

        {/* 技能转移卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 bg-gradient-to-br from-risk-high/10 to-risk-medium/10 rounded-2xl p-8 border border-risk-high/30"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Brain className="w-7 h-7 text-risk-high" />
            {t.skillShiftTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-background/50 rounded-lg p-4 border border-risk-high/20">
              <div className="text-xs text-foreground-muted mb-2">OLD</div>
              <div className="font-semibold text-foreground-muted">{t.skillShiftOld}</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-risk-low/30">
              <div className="text-xs text-foreground-muted mb-2">NEW</div>
              <div className="font-semibold text-risk-low">{t.skillShiftNew}</div>
            </div>
          </div>
          <div className="bg-background/30 rounded-lg p-4">
            <div className="text-sm text-foreground-muted mb-3">{t.skillShiftCapabilities}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-risk-low flex-shrink-0" />
                <span>{t.skillShiftCap1}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-risk-low flex-shrink-0" />
                <span>{t.skillShiftCap2}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-risk-low flex-shrink-0" />
                <span>{t.skillShiftCap3}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-risk-low flex-shrink-0" />
                <span>{t.skillShiftCap4}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 时间对比 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-risk-high" />
            {t.timeComparisonTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-elevated/50 rounded-lg p-5 border border-surface-elevated">
              <div className="text-xs text-foreground-muted mb-2">{t.timeYearAgo}</div>
              <div className="text-sm">{t.timeYearAgoDesc}</div>
            </div>
            <div className="bg-risk-high/20 rounded-lg p-5 border border-risk-high/30">
              <div className="text-xs text-risk-high font-bold mb-2">{t.timeNow}</div>
              <div className="text-sm text-foreground">{t.timeNowDesc}</div>
            </div>
            <div className="bg-risk-medium/20 rounded-lg p-5 border border-risk-medium/30">
              <div className="text-xs text-risk-medium font-bold mb-2">{t.timeGap}</div>
              <div className="text-sm">{t.timeGapDesc}</div>
            </div>
          </div>
        </motion.div>

        {/* 舒适陷阱 & 被动杠杆 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-surface rounded-lg p-6 border border-surface-elevated"
          >
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-risk-high" />
              {t.comfortTrapTitle}
            </h4>
            <p className="text-sm text-foreground-muted mb-4">{t.comfortTrapDesc}</p>
            <div className="bg-background/50 rounded p-3 border-l-4 border-risk-high">
              <p className="text-sm italic text-foreground-muted">"{t.comfortTrapQuote}"</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-surface rounded-lg p-6 border border-surface-elevated"
          >
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-risk-low" />
              {t.passiveLeverageTitle}
            </h4>
            <p className="text-sm text-foreground-muted mb-4">{t.passiveLeverageDesc}</p>
            <div className="bg-background/50 rounded p-3 border-l-4 border-risk-low">
              <p className="text-sm italic text-foreground-muted">"{t.passiveLeverageQuote}"</p>
            </div>
          </motion.div>
        </div>

        {/* 赢家公司特征 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mb-12 bg-risk-low/10 rounded-lg p-6 border border-risk-low/30"
        >
          <h4 className="font-bold text-lg mb-4">{t.winningCompaniesTitle}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <ArrowUpRight className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
              <span className="text-sm">{t.winningComp1}</span>
            </div>
            <div className="flex items-start gap-3">
              <ArrowUpRight className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
              <span className="text-sm">{t.winningComp2}</span>
            </div>
            <div className="flex items-start gap-3">
              <ArrowUpRight className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
              <span className="text-sm">{t.winningComp3}</span>
            </div>
            <div className="flex items-start gap-3">
              <ArrowUpRight className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
              <span className="text-sm">{t.winningComp4}</span>
            </div>
          </div>
        </motion.div>

        {/* 声望 vs 亲近度 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mb-12 bg-surface rounded-lg p-6 border border-surface-elevated"
        >
          <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-data-blue" />
            {t.prestigeProximityTitle}
          </h4>
          <p className="text-sm text-foreground-muted mb-4">{t.prestigeProximityDesc}</p>
          <div className="bg-background/50 rounded p-3 border-l-4 border-data-blue">
            <p className="text-sm italic text-foreground-muted">"{t.prestigeQuote}"</p>
          </div>
        </motion.div>

        {/* 关键洞察 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-risk-high/20 via-risk-medium/20 to-risk-high/20 rounded-lg p-6 border border-risk-high/30 text-center"
        >
          <p className="text-sm text-foreground-muted mb-2">{t.divergenceInsight}</p>
          <p className="text-lg font-bold text-risk-high">{t.divergenceInsightText}</p>
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
        <div className="relative">
          <div className="flex justify-between text-xs text-foreground-muted mb-1">
            <span>{lowLabel}</span>
            <span>{highLabel}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="calc-slider"
            style={{
              background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, var(--surface-elevated) ${value}%, var(--surface-elevated) 100%)`
            }}
          />
          {/* 数值标签 - 跟随滑块位置, clamped at edges */}
          <div
            className="absolute -top-1 text-xs font-bold px-2 py-0.5 rounded text-white whitespace-nowrap transition-all duration-75"
            style={{
              left: `clamp(1rem, ${value}%, calc(100% - 1rem))`,
              transform: 'translateX(-50%) translateY(-100%)',
              backgroundColor: color
            }}
          >
            {Math.round(value)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// 数字跳动动画组件
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <>{display}{suffix}</>;
}

// 职业预设数据
const PROFESSION_PRESETS: Record<string, {
  name: { en: string; zh: string };
  industry: string;
  dimensions: {
    dataOpenness: number;
    workDataDigitalization: number;
    processStandardization: number;
    currentAIAdoption: number;
  };
  protections: {
    creativeRequirement: number;
    humanInteraction: number;
    physicalOperation: number;
  };
}> = {
  // 客服/行政类 - 高风险
  'customer-service': {
    name: { en: 'Customer Service / Admin', zh: '客服/行政' },
    industry: 'customerService',
    dimensions: {
      dataOpenness: 70,
      workDataDigitalization: 90,
      processStandardization: 85,
      currentAIAdoption: 60,
    },
    protections: {
      creativeRequirement: 15,
      humanInteraction: 60,
      physicalOperation: 5,
    },
  },

  // 技术/开发类 - 中等风险
  'tech': {
    name: { en: 'Developer / Tech', zh: '程序员/技术' },
    industry: 'tech',
    dimensions: {
      dataOpenness: 70,
      workDataDigitalization: 100,
      processStandardization: 50,
      currentAIAdoption: 50,
    },
    protections: {
      creativeRequirement: 70,
      humanInteraction: 55,
      physicalOperation: 5,
    },
  },

  // 创意/设计类 - 中高风险
  'creative': {
    name: { en: 'Creative / Designer', zh: '创意/设计' },
    industry: 'marketing',
    dimensions: {
      dataOpenness: 75,
      workDataDigitalization: 100,
      processStandardization: 55,
      currentAIAdoption: 55,
    },
    protections: {
      creativeRequirement: 70,
      humanInteraction: 50,
      physicalOperation: 5,
    },
  },

  // 金融/分析类 - 中等风险
  'finance': {
    name: { en: 'Finance / Analyst', zh: '金融/分析' },
    industry: 'finance',
    dimensions: {
      dataOpenness: 60,
      workDataDigitalization: 95,
      processStandardization: 70,
      currentAIAdoption: 45,
    },
    protections: {
      creativeRequirement: 40,
      humanInteraction: 50,
      physicalOperation: 5,
    },
  },

  // 销售/管理类 - 低风险
  'sales': {
    name: { en: 'Sales / Management', zh: '销售/管理' },
    industry: 'sales',
    dimensions: {
      dataOpenness: 50,
      workDataDigitalization: 75,
      processStandardization: 50,
      currentAIAdoption: 30,
    },
    protections: {
      creativeRequirement: 50,
      humanInteraction: 80,
      physicalOperation: 10,
    },
  },

  // 医疗/教育类 - 低风险
  'healthcare-edu': {
    name: { en: 'Healthcare / Education', zh: '医疗/教育' },
    industry: 'healthcare',
    dimensions: {
      dataOpenness: 40,
      workDataDigitalization: 60,
      processStandardization: 40,
      currentAIAdoption: 25,
    },
    protections: {
      creativeRequirement: 65,
      humanInteraction: 95,
      physicalOperation: 50,
    },
  },

  // 体力/手工类 - 极低风险
  'manual': {
    name: { en: 'Manual / Skilled Trade', zh: '体力/技术工种' },
    industry: 'manufacturing',
    dimensions: {
      dataOpenness: 30,
      workDataDigitalization: 30,
      processStandardization: 45,
      currentAIAdoption: 10,
    },
    protections: {
      creativeRequirement: 45,
      humanInteraction: 45,
      physicalOperation: 95,
    },
  },

  // 内容/写作类 - 中高风险
  'writer': {
    name: { en: 'Writer / Content', zh: '写作/内容' },
    industry: 'marketing',
    dimensions: {
      dataOpenness: 80,
      workDataDigitalization: 100,
      processStandardization: 60,
      currentAIAdoption: 70,
    },
    protections: {
      creativeRequirement: 60,
      humanInteraction: 40,
      physicalOperation: 5,
    },
  },
};

// 生存指数测试 V2
function SurvivalIndexSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const [showOptional, setShowOptional] = useState(false);
  const [result, setResult] = useState<RiskOutputResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);

  // 分享功能
  const getShareText = () => {
    if (!result) return '';
    const levelText = result.riskLevel === 'very-low' ? (lang === 'en' ? 'Very Low' : '极低') :
      result.riskLevel === 'low' ? (lang === 'en' ? 'Low' : '低') :
      result.riskLevel === 'medium' ? (lang === 'en' ? 'Medium' : '中等') :
      result.riskLevel === 'high' ? (lang === 'en' ? 'High' : '高') :
      (lang === 'en' ? 'Critical' : '极高');
    return t.shareText
      .replace('{level}', levelText)
      .replace('{prob}', String(result.replacementProbability))
      .replace('{year}', String(result.predictedReplacementYear));
  };

  const handleCopyLink = async () => {
    const text = getShareText() + '\n' + window.location.href;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareText() + '\n' + window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareWeibo = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(window.location.href);
    window.open(`https://service.weibo.com/share/share.php?title=${text}&url=${url}`, '_blank');
  };

  const handleDownloadImage = () => {
    if (!result) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, '#050507');
    grad.addColorStop(0.4, '#0d0b10');
    grad.addColorStop(1, '#15121a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // Glow effects
    const glow1 = ctx.createRadialGradient(200, 150, 0, 200, 150, 200);
    glow1.addColorStop(0, 'rgba(213,0,249,0.12)');
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 400, 350);

    const riskColor = RISK_LEVEL_INFO[result.riskLevel].color;

    // Title
    ctx.fillStyle = '#8a8595';
    ctx.font = '600 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JOBLESS - AI Replacement Risk Assessment', 600, 60);

    // Risk level
    ctx.fillStyle = riskColor;
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText(
      result.riskLevel === 'very-low' ? (lang === 'en' ? 'VERY LOW' : '极低风险') :
      result.riskLevel === 'low' ? (lang === 'en' ? 'LOW RISK' : '低风险') :
      result.riskLevel === 'medium' ? (lang === 'en' ? 'MEDIUM' : '中等风险') :
      result.riskLevel === 'high' ? (lang === 'en' ? 'HIGH RISK' : '高风险') :
      (lang === 'en' ? 'CRITICAL' : '极高风险'),
      600, 180
    );

    // Metrics boxes
    const metrics = [
      { value: `${result.replacementProbability}%`, label: lang === 'en' ? 'Replacement Probability' : '替代概率', color: '#ff1744' },
      { value: `${result.predictedReplacementYear}`, label: lang === 'en' ? 'AI Kill Line' : 'AI 斩杀线', color: '#ff5722' },
      { value: `${result.currentReplacementDegree}%`, label: lang === 'en' ? 'Current Degree' : '当前程度', color: '#d500f9' },
    ];

    metrics.forEach((m, i) => {
      const x = 150 + i * 340;
      const y = 240;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(x, y, 280, 160, 16);
      ctx.fill();
      ctx.strokeStyle = m.color + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, 280, 160, 16);
      ctx.stroke();
      ctx.fillStyle = m.color;
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.value, x + 140, y + 80);
      ctx.fillStyle = '#8a8595';
      ctx.font = '500 16px sans-serif';
      ctx.fillText(m.label, x + 140, y + 120);
    });

    // Confidence interval
    ctx.fillStyle = '#fafafa';
    ctx.font = '500 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${lang === 'en' ? 'Range' : '预测范围'}: ${result.confidenceInterval.earliest} — ${result.confidenceInterval.latest}`,
      600, 470
    );

    // CTA
    ctx.fillStyle = '#00e5ff';
    ctx.font = '500 20px sans-serif';
    ctx.fillText(lang === 'en' ? 'Calculate your risk → jobless.wiki' : '计算你的风险 → jobless.wiki', 600, 560);

    // Top accent bar
    const barGrad = ctx.createLinearGradient(0, 0, 1200, 0);
    barGrad.addColorStop(0, riskColor);
    barGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, 1200, 4);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-risk-result.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // 核心维度状态
  const [dimensions, setDimensions] = useState({
    dataOpenness: 50,
    workDataDigitalization: 50,
    processStandardization: 50,
    currentAIAdoption: 50,
  });

  // 可选保护因素状态
  const [protections, setProtections] = useState({
    creativeRequirement: 50,
    humanInteraction: 50,
    physicalOperation: 50,
  });

  // 职业选择状态
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('other');

  const updateDimension = (key: string, value: number) => {
    setDimensions(prev => ({ ...prev, [key]: value }));
  };

  const updateProtection = (key: string, value: number) => {
    setProtections(prev => ({ ...prev, [key]: value }));
  };

  // 应用职业预设
  const applyProfessionPreset = (professionKey: string | null) => {
    if (professionKey && PROFESSION_PRESETS[professionKey]) {
      const preset = PROFESSION_PRESETS[professionKey];
      setDimensions(preset.dimensions);
      setProtections({
        creativeRequirement: preset.protections.creativeRequirement,
        humanInteraction: preset.protections.humanInteraction,
        physicalOperation: preset.protections.physicalOperation,
      });
      setSelectedIndustry(preset.industry);
      setSelectedProfession(professionKey);
    } else {
      setSelectedProfession(null);
    }
  };

  // Restore last input state from localStorage on mount (but not result,
  // so user always sees the input form first with presets visible)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-risk-last-result');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dimensions) setDimensions(parsed.dimensions);
        if (parsed.protections) setProtections(parsed.protections);
        if (parsed.industry) setSelectedIndustry(parsed.industry);
        if (parsed.profession) setSelectedProfession(parsed.profession);
      }
    } catch { /* ignore parse errors */ }
  }, []);

  const calculateRisk = () => {
    const inputData: RiskInputData = {
      jobTitle: 'User',
      industry: selectedIndustry,
      yearsOfExperience: 5,
      ...dimensions,
      ...protections,
    };
    const assessment = calculateAIRisk(inputData, lang);
    setResult(assessment);
    try {
      localStorage.setItem('ai-risk-last-result', JSON.stringify({
        result: assessment, dimensions, protections,
        industry: selectedIndustry, profession: selectedProfession,
      }));
    } catch { /* quota errors */ }
  };

  const resetCalculator = () => {
    setResult(null);
    setDimensions({
      dataOpenness: 50,
      workDataDigitalization: 50,
      processStandardization: 50,
      currentAIAdoption: 50,
    });
    setProtections({
      creativeRequirement: 50,
      humanInteraction: 50,
      physicalOperation: 50,
    });
    setSelectedProfession(null);
    setSelectedIndustry('other');
    try { localStorage.removeItem('ai-risk-last-result'); } catch { /* ignore */ }
  };

  return (
    <section className="py-24 px-4 md:px-6 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-background pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Title with distinctive styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
            <Target className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-medium text-brand-primary">{t.survivalBadge}</span>
          </div>
          <h2 className="calc-title text-2xl sm:text-4xl md:text-6xl lg:text-7xl mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground-muted bg-clip-text text-transparent">
            {t.survivalTitle}
          </h2>
          <p className="text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto">
            {t.survivalSubtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="calc-container rounded-3xl p-6 md:p-10 relative"
        >
          {!result ? (
            <div className="space-y-8">
              {/* 职业快速预设 - Redesigned */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t.selectProfession}</h3>
                    <p className="text-sm text-foreground-muted">{t.selectProfessionDesc}</p>
                  </div>
                </div>

                {/* 职业按钮网格 - with risk badge */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {Object.entries(PROFESSION_PRESETS).map(([profKey, prof], index) => {
                    const isSelected = selectedProfession === profKey;
                    const previewResult = calculateAIRisk({
                      jobTitle: '', industry: prof.industry, yearsOfExperience: 5,
                      ...prof.dimensions, ...prof.protections,
                    }, lang);
                    const badgeColor = RISK_LEVEL_INFO[previewResult.riskLevel].color;
                    return (
                      <motion.button
                        key={profKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => applyProfessionPreset(isSelected ? null : profKey)}
                        className={`profession-btn relative px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                          isSelected
                            ? 'selected text-white border-transparent'
                            : 'bg-surface-card border-white/8'
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: badgeColor }} />
                          {prof.name[lang]}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* 当前选择提示 - Enhanced */}
                {selectedProfession && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20">
                      <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                      <span className="text-sm">
                        <span className="text-foreground-muted">
                          {lang === 'en' ? 'Preset: ' : '预设：'}
                        </span>
                        <span className="font-semibold text-white ml-1">
                          {PROFESSION_PRESETS[selectedProfession].name[lang]}
                        </span>
                        <span className="text-foreground-muted ml-1">
                          {lang === 'en' ? '— adjust below' : '— 可在下方微调'}
                        </span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 四个核心维度 - Redesigned */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-risk-critical to-risk-high flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">{t.coreDimensions}</h3>
                </div>
                <div className="space-y-5">
                  <DimensionSlider
                    title={t.dim1Title}
                    desc={t.dim1Desc}
                    detail={t.dim1Detail}
                    value={dimensions.dataOpenness}
                    onChange={(v) => updateDimension('dataOpenness', v)}
                    lowLabel={t.dim1Low}
                    highLabel={t.dim1High}
                    icon={Database}
                    color="#7c4dff"
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
                    color="#b388ff"
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
                    color="#64ffda"
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
                    color="#ff6e40"
                  />
                </div>
              </div>

              {/* 可选保护因素切换按钮 - Enhanced */}
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="w-full py-3 px-4 bg-surface-elevated/50 hover:bg-surface-elevated rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-surface-elevated"
              >
                {showOptional ? <ChevronRight className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4" />}
                {showOptional ? t.toggleRequired : t.toggleOptional}
              </button>

              {/* 可选保护因素 - Enhanced */}
              {showOptional && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 rounded-xl bg-surface border border-surface-elevated">
                    <div className="flex items-center gap-2 mb-5">
                      <Shield className="w-5 h-5 text-risk-low" />
                      <h4 className="font-semibold">{t.protectiveFactors}</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs text-foreground-muted mb-2">
                          <span>{t.ctx1Title}</span>
                          <span className="data-value text-risk-safe">{Math.round(protections.creativeRequirement)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={protections.creativeRequirement}
                          onChange={(e) => updateProtection('creativeRequirement', parseFloat(e.target.value))}
                          className="calc-slider"
                          style={{
                            background: `linear-gradient(to right, var(--risk-safe) 0%, var(--risk-safe) ${protections.creativeRequirement}%, var(--surface-elevated) ${protections.creativeRequirement}%, var(--surface-elevated) 100%)`
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-foreground-muted mb-2">
                          <span>{t.ctx2Title}</span>
                          <span className="data-value text-risk-safe">{Math.round(protections.humanInteraction)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={protections.humanInteraction}
                          onChange={(e) => updateProtection('humanInteraction', parseFloat(e.target.value))}
                          className="calc-slider"
                          style={{
                            background: `linear-gradient(to right, var(--risk-safe) 0%, var(--risk-safe) ${protections.humanInteraction}%, var(--surface-elevated) ${protections.humanInteraction}%, var(--surface-elevated) 100%)`
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-foreground-muted mb-2">
                          <span>{t.ctx3Title}</span>
                          <span className="data-value text-risk-safe">{Math.round(protections.physicalOperation)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={protections.physicalOperation}
                          onChange={(e) => updateProtection('physicalOperation', parseFloat(e.target.value))}
                          className="calc-slider"
                          style={{
                            background: `linear-gradient(to right, var(--risk-safe) 0%, var(--risk-safe) ${protections.physicalOperation}%, var(--surface-elevated) ${protections.physicalOperation}%, var(--surface-elevated) 100%)`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Calculate button - Enhanced */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculateRisk}
                className="calc-btn-primary w-full text-white py-5 rounded-xl font-semibold flex items-center justify-center gap-3 text-lg"
              >
                <BarChart3 className="w-6 h-6" />
                {t.calculate}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Risk Level Display - Bold Typography */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="result-card rounded-2xl p-8 text-center relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: `linear-gradient(90deg, ${RISK_LEVEL_INFO[result.riskLevel].color}, transparent)` }}
                />
                <div className="relative z-10">
                  <div className="text-sm text-foreground-muted uppercase tracking-wider mb-3">{t.riskLevel}</div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3"
                    style={{ color: RISK_LEVEL_INFO[result.riskLevel].color, fontFamily: 'var(--font-display)' }}
                  >
                    {result.riskLevel === 'very-low' ? t.riskVeryLow :
                     result.riskLevel === 'low' ? t.riskLow :
                     result.riskLevel === 'medium' ? t.riskMedium :
                     result.riskLevel === 'high' ? t.riskHigh : t.riskCritical}
                  </motion.div>
                  <div className="text-sm text-foreground-muted">{RISK_LEVEL_INFO[result.riskLevel].description[lang]}</div>
                </div>
              </motion.div>

              {/* Three Metrics - Clean Number Display */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="result-card rounded-xl p-6 text-center group hover-lift"
                >
                  <div className="metric-value text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: 'var(--risk-critical)' }}>
                    <AnimatedNumber value={result.replacementProbability} suffix="%" />
                  </div>
                  <div className="text-xs text-foreground-muted uppercase tracking-wider">{t.metric1Title}</div>
                  <div className="text-xs text-foreground-muted/60 mt-1">{t.metric1Desc}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="result-card rounded-xl p-6 text-center group hover-lift"
                >
                  <div className="metric-value text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: 'var(--risk-high)' }}>
                    <AnimatedNumber value={result.predictedReplacementYear} />
                  </div>
                  <div className="text-xs text-foreground-muted uppercase tracking-wider">{t.metric2Title}</div>
                  <div className="text-xs text-foreground-muted/60 mt-1">{lang === 'en' ? 'Projected' : '预计年份'}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="result-card rounded-xl p-6 text-center group hover-lift"
                >
                  <div className="metric-value text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: 'var(--brand-primary)' }}>
                    <AnimatedNumber value={result.currentReplacementDegree} suffix="%" />
                  </div>
                  <div className="text-xs text-foreground-muted uppercase tracking-wider">{t.metric3Title}</div>
                  <div className="text-xs text-foreground-muted/60 mt-1">{t.metric3Desc}</div>
                </motion.div>
              </div>

              {/* Confidence Interval - Sleek Bar */}
              <div className="result-card rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-foreground-muted">{t.yearRange}</span>
                <span className="font-mono font-bold text-lg">
                  {result.confidenceInterval.earliest} — {result.confidenceInterval.latest}
                </span>
              </div>

              {/* Insights - Modern Tags */}
              <div className="result-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h5 className="font-semibold">{t.insights}</h5>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-foreground-muted">{t.primaryDriver}:</span>
                    <span className="insight-tag px-3 py-1 rounded-full font-medium">{result.insights.primaryDriver}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.insights.secondaryFactors.map((factor, i) => (
                      <span key={i} className="insight-tag px-3 py-1 rounded-full text-xs font-medium">{factor}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.insights.protectionFactors.map((factor, i) => (
                      <span key={i} className="px-3 py-1 bg-risk-low/20 text-risk-low rounded-full text-xs font-medium border border-risk-low/30">{factor}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations - Modern List */}
              <div className="result-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-risk-low to-brand-accent flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <h5 className="font-semibold">{t.recommendations}</h5>
                </div>
                <div className="space-y-3">
                  {result.insights.recommendations.slice(0, 4).map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-start gap-3 text-sm p-3 rounded-lg bg-surface-card/50 border border-white/5"
                    >
                      <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Reality Check - Alert Style */}
              <div className="rounded-xl p-5 bg-gradient-to-r from-risk-critical/10 to-risk-high/10 border border-risk-critical/20">
                <p className="text-sm">
                  <Flame className="w-5 h-5 inline text-risk-critical mr-2 align-middle" />
                  <span className="font-semibold text-foreground">{t.realityCheck}</span>
                </p>
                <p className="text-sm text-foreground-muted mt-2 leading-relaxed">{t.realityCheckText}</p>
              </div>

              {/* Social Sharing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="result-card rounded-xl p-6"
                style={{ borderColor: RISK_LEVEL_INFO[result.riskLevel].color + '30', borderWidth: 1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: RISK_LEVEL_INFO[result.riskLevel].color + '20' }}>
                    <Share2 className="w-4 h-4" style={{ color: RISK_LEVEL_INFO[result.riskLevel].color }} />
                  </div>
                  <div>
                    <h5 className="font-semibold">{t.shareTitle}</h5>
                    <p className="text-xs text-foreground-muted">{t.shareSubtitle}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-white/10 text-sm font-medium transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? t.shareCopied : t.shareCopyLink}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShareTwitter}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 text-sm font-medium text-[#1DA1F2] transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t.shareTwitter}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      const text = getShareText() + '\n' + window.location.href;
                      await navigator.clipboard.writeText(text);
                      setWechatCopied(true);
                      setTimeout(() => setWechatCopied(false), 3000);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#07C160]/10 hover:bg-[#07C160]/20 border border-[#07C160]/20 text-sm font-medium text-[#07C160] transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    {wechatCopied
                      ? (lang === 'en' ? 'Copied! Paste in WeChat' : '已复制，去微信粘贴')
                      : t.shareWeChat}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShareWeibo}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#E6162D]/10 hover:bg-[#E6162D]/20 border border-[#E6162D]/20 text-sm font-medium text-[#E6162D] transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t.shareWeibo}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadImage}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 text-sm font-medium text-brand-primary transition-all"
                  >
                    <Download className="w-4 h-4" />
                    {t.shareDownload}
                  </motion.button>
                </div>
              </motion.div>

              {/* Recalculate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetCalculator}
                className="w-full bg-surface-elevated hover:bg-surface-elevated/80 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <RefreshCw className="w-5 h-5" />
                {t.recalculate}
              </motion.button>
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

// 数据威胁板块（精简版，完整版在 /data-protection）
function DataThreatSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-risk-critical/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-brand-primary/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-risk-critical/10 border border-risk-critical/20 mb-6">
            <Lock className="w-4 h-4 text-risk-critical" />
            <span className="text-sm font-medium text-risk-critical">DATA THREAT</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {t.dataThreatTitle}
          </h2>
          <p className="text-foreground-muted max-w-3xl mx-auto text-lg">
            {t.dataThreatSubtitle}
          </p>
        </motion.div>

        {/* Collapsible Last Mile Concept */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="result-card rounded-2xl p-8 border border-surface-elevated">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">{t.lastMileTitle}</h3>
              </div>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-foreground-muted" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-foreground-muted mb-8 mt-6">{t.lastMileDesc}</p>

                  {/* Visual Flow */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-xl p-5 text-center">
                      <Cpu className="w-8 h-8 text-brand-accent mx-auto mb-3" />
                      <div className="font-semibold text-sm">{t.lastMileStep1}</div>
                      <div className="text-xs text-foreground-muted mt-1">{t.lastMileStep1Desc}</div>
                    </div>

                    <div className="hidden md:flex flex-col items-center">
                      <div className="text-xs text-foreground-muted mb-1">{t.lastMileArrow1}</div>
                      <div className="text-2xl text-risk-high">→</div>
                    </div>

                    <div className="bg-risk-high/10 border-2 border-risk-high/40 rounded-xl p-5 text-center relative">
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-risk-critical rounded-full animate-pulse" />
                      <Database className="w-8 h-8 text-risk-high mx-auto mb-3" />
                      <div className="font-semibold text-sm text-risk-high">{t.lastMileStep2}</div>
                      <div className="text-xs text-foreground-muted mt-1">{t.lastMileStep2Desc}</div>
                    </div>

                    <div className="hidden md:flex flex-col items-center">
                      <div className="text-xs text-foreground-muted mb-1">{t.lastMileArrow2}</div>
                      <div className="text-2xl text-risk-critical">→</div>
                    </div>

                    <div className="bg-risk-critical/10 border border-risk-critical/30 rounded-xl p-5 text-center">
                      <Skull className="w-8 h-8 text-risk-critical mx-auto mb-3" />
                      <div className="font-semibold text-sm text-risk-critical">{t.lastMileStep3}</div>
                      <div className="text-xs text-foreground-muted mt-1">{t.lastMileStep3Desc}</div>
                    </div>
                  </div>

                  {/* Mobile arrows */}
                  <div className="flex md:hidden flex-col items-center gap-2 my-4">
                    <div className="text-foreground-muted text-lg">↓</div>
                  </div>

                  {/* Warning */}
                  <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-risk-critical/10 to-risk-high/10 border border-risk-critical/20">
                    <p className="text-sm font-semibold text-center">
                      <AlertTriangle className="w-4 h-4 inline text-risk-critical mr-2 align-middle" />
                      {t.lastMileWarning}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* CTA to full data protection page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-foreground-muted mb-4">{t.viewFullDetailsCta}</p>
          <Link
            href="/data-protection"
            className="inline-flex items-center gap-2 bg-risk-critical hover:bg-risk-critical/80 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all card-hover"
          >
            <Shield className="w-5 h-5" />
            {t.viewFullDetails}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// 深度分析链接板块
function AnalysisLinkSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const linkText = {
    en: {
      title: 'Want Deeper Analysis?',
      subtitle: 'Explore detailed data on high-risk jobs, layoff cases, industry impacts, and career trends.',
      buttonText: 'View Full Analysis →',
    },
    zh: {
      title: '想要更深入的分析？',
      subtitle: '探索详细数据：高风险职业、裁员案例、行业影响、职业趋势。',
      buttonText: '查看完整分析 →',
    },
  };

  const text = linkText[lang];

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-surface to-background">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-4xl font-bold mb-4"
        >
          {text.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-foreground-muted mb-8 max-w-2xl mx-auto"
        >
          {text.subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/analysis"
            className="inline-flex items-center gap-2 bg-risk-high hover:bg-risk-high/80 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all card-hover"
          >
            {text.buttonText}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem('jobless-theme') as Theme | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <LanguageButton lang={lang} setLang={setLang} />
      <ThemeButton theme={theme} setTheme={setTheme} />
      <HeroSection lang={lang} t={t} />
      <SurvivalIndexSection lang={lang} t={t} />
      <DataThreatSection lang={lang} t={t} />
      <InteractiveTimeline lang={lang} theme={theme} />
      <AnalysisLinkSection lang={lang} t={t} />
      <Footer lang={lang} t={t} />
    </main>
  );
}
