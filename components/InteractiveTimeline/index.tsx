'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { X, Zap, Brain, Cpu, Sparkles, ChevronRight, ChevronDown, Flame, Settings } from 'lucide-react';

// ============================================
// TYPES & DATA
// ============================================
type Language = 'en' | 'zh';

interface Milestone {
  id: string;
  year: number;
  name: { en: string; zh: string };
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  gradient: string;
  impact: { en: string; zh: string };
  isProjected?: boolean;
  details: {
    description: { en: string; zh: string };
    significance: { en: string; zh: string };
    jobsAffected?: { en: string; zh: string };
    sources?: string[];
  };
  inventions?: { year: number; name: { en: string; zh: string }; impact: { en: string; zh: string } }[];
  jobDisplacement?: {
    category: { en: string; zh: string };
    rate: number;
    newJobs: { en: string; zh: string };
  }[];
  socialImpact?: {
    gdp?: string;
    productivity?: string;
  };
}

const WE_ARE_HERE_MILESTONE: Milestone = {
  id: 'we-are-here',
  year: new Date().getFullYear(),
  name: { en: 'We Are Here', zh: '我们在这里' },
  icon: Flame,
  color: '#ef4444',
  gradient: 'from-red-500 to-red-600',
  impact: { en: 'AI already replacing 21.37% of jobs — and accelerating', zh: 'AI 已替代 21.37% 的岗位——且在加速' },
  details: {
    description: {
      en: 'We stand at the inflection point. AI has moved from demo to deployment. Companies are writing AI into layoff announcements. 89% of HR leaders admit AI is affecting headcount decisions.',
      zh: '我们正站在拐点上。AI 已从演示走向部署。企业正将 AI 写入裁员公告。89% 的 HR 高管承认 AI 正在影响人员决策。'
    },
    significance: {
      en: 'Unlike past revolutions that took decades, this one moves in quarters. The window to adapt is measured in months, not years.',
      zh: '不同于过去需要数十年的革命，这次以季度为单位推进。适应的窗口以月计算，而不是年。'
    },
    jobsAffected: {
      en: '21.37% replaceable now (task-aligned estimate). McKinsey: 57% of hours technically automatable.',
      zh: '目前 21.37% 可被替代（任务对齐估计）。麦肯锡：57% 的工时理论上可自动化。'
    },
    sources: [
      'Task-aligned GDPval × O*NET pipeline (2026)',
      'McKinsey Global Institute (2025)',
      'World Economic Forum Future of Jobs Report (2025)',
    ]
  },
  jobDisplacement: [
    { category: { en: 'Customer Service', zh: '客服' }, rate: 95, newJobs: { en: 'AI Trainers, Conversation Designers', zh: 'AI 训练师、对话设计师' } },
    { category: { en: 'Admin / Support', zh: '行政/文秘' }, rate: 90, newJobs: { en: 'Process Automation Specialists', zh: '流程自动化专家' } },
    { category: { en: 'Content Writers', zh: '内容写手' }, rate: 70, newJobs: { en: 'AI Editors, Content Strategists', zh: 'AI 编辑、内容策略师' } },
    { category: { en: 'Junior Developers', zh: '初级程序员' }, rate: 45, newJobs: { en: 'AI Architects, Code Reviewers', zh: 'AI 架构师、代码审查员' } },
  ],
  socialImpact: { gdp: '+7% (projected)', productivity: '+300% for AI users' }
};

const MILESTONES: Milestone[] = [
  {
    id: 'steam-engine',
    year: 1769,
    name: { en: 'Steam Engine', zh: '蒸汽机' },
    icon: Settings,
    color: '#94a3b8',
    gradient: 'from-slate-400 to-slate-500',
    impact: { en: 'Machines learned to move, replacing physical labor', zh: '机器学会运动，替代体力劳动' },
    details: {
      description: {
        en: 'James Watt\'s improved steam engine powered the Industrial Revolution, transforming manufacturing and transportation forever.',
        zh: '詹姆斯·瓦特改良的蒸汽机驱动了工业革命，永远改变了制造业和交通运输。'
      },
      significance: {
        en: 'First time in history, humans were no longer the primary source of power.',
        zh: '人类历史上第一次，我们不再是主要动力来源。'
      },
      jobsAffected: { en: '60% of hand weavers disappeared → but factory jobs emerged', zh: '60%手工纺织工消失 → 但工厂工作涌现' },
      sources: ['Economic History Review, Crafts (1985)', 'The Cambridge Economic History of Modern Britain']
    },
    inventions: [
      { year: 1769, name: { en: 'Steam Engine', zh: '蒸汽机' }, impact: { en: 'Powered factories and trains', zh: '为工厂和火车提供动力' } },
      { year: 1764, name: { en: 'Spinning Jenny', zh: '珍妮纺纱机' }, impact: { en: 'Revolutionized textile production', zh: '革命性地改变纺织生产' } },
      { year: 1804, name: { en: 'Steam Locomotive', zh: '蒸汽火车' }, impact: { en: 'Transformed transportation', zh: '彻底改变运输' } },
    ],
    jobDisplacement: [
      { category: { en: 'Textile Workers', zh: '纺织工人' }, rate: 80, newJobs: { en: 'Factory Operators, Machine Maintenance', zh: '工厂操作员、机器维修工' } },
      { category: { en: 'Craftsmen', zh: '手工艺人' }, rate: 60, newJobs: { en: 'Industrial Designers, Foremen', zh: '工业设计师、工头' } },
    ],
    socialImpact: { gdp: '+300%', productivity: '+500%' }
  },
  {
    id: 'electricity',
    year: 1879,
    name: { en: 'Electricity', zh: '电力革命' },
    icon: Zap,
    color: '#fbbf24',
    gradient: 'from-yellow-400 to-amber-500',
    impact: { en: 'Power distributed everywhere, factories ran 24/7', zh: '动力随处可得，工厂24/7运转' },
    details: {
      description: {
        en: 'Edison\'s light bulb and electric grid brought power to every factory and home, enabling continuous operation.',
        zh: '爱迪生的灯泡和电网将动力带给每个工厂和家庭，实现持续运转。'
      },
      significance: { en: 'Energy could be transmitted anywhere, not just generated on-site.', zh: '能源可以传输到任何地方，而不仅仅是现场发电。' },
      jobsAffected: { en: 'Gas lamp lighters → electricians, power plant workers', zh: '煤气灯工人 → 电工、发电厂工人' },
      sources: ['Historical Statistics of the United States', 'Electrifying America, David Nye (1990)']
    },
    inventions: [
      { year: 1879, name: { en: 'Electric Light', zh: '电灯' }, impact: { en: 'Enabled 24/7 factory operations', zh: '使工厂能够24/7运营' } },
      { year: 1913, name: { en: 'Assembly Line', zh: '流水线' }, impact: { en: 'Reduced assembly from 12hrs to 93mins', zh: '将组装从12小时减少到93分钟' } },
      { year: 1876, name: { en: 'Telephone', zh: '电话' }, impact: { en: 'Instant communication', zh: '即时通信' } },
    ],
    jobDisplacement: [
      { category: { en: 'Skilled Artisans', zh: '熟练工匠' }, rate: 70, newJobs: { en: 'Assembly Line Workers, Foremen', zh: '流水线工人、工头' } },
      { category: { en: 'Gas Light Workers', zh: '煤气灯工人' }, rate: 90, newJobs: { en: 'Electricians, Power Plant Operators', zh: '电工、发电厂操作员' } },
    ],
    socialImpact: { gdp: '+400%', productivity: '+800%' }
  },
  {
    id: 'deep-learning',
    year: 2012,
    name: { en: 'Deep Learning', zh: '深度学习' },
    icon: Brain,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    impact: { en: 'Neural networks achieved human-level performance', zh: '神经网络达到人类水平表现' },
    details: {
      description: {
        en: 'AlexNet breakthrough showed deep neural networks could learn patterns better than any previous method.',
        zh: 'AlexNet突破表明深度神经网络能比以往任何方法更好地学习模式。'
      },
      significance: { en: 'AI moved from rules-based systems to learning from data.', zh: 'AI从基于规则的系统转向从数据中学习。' },
      jobsAffected: { en: 'Tasks automated, not jobs — yet', zh: '任务被自动化，而非工作——暂时' },
      sources: ['ImageNet Large Scale Visual Recognition Challenge (2012)', 'Krizhevsky et al., NeurIPS 2012']
    },
    inventions: [
      { year: 2012, name: { en: 'AlexNet Breakthrough', zh: 'AlexNet突破' }, impact: { en: 'Human-level image recognition', zh: '人类水平的图像识别' } },
      { year: 2011, name: { en: 'Voice Assistants', zh: '语音助手' }, impact: { en: 'Natural language interaction', zh: '自然语言交互' } },
    ],
    jobDisplacement: [
      { category: { en: 'Travel Agents', zh: '旅行社代理' }, rate: 80, newJobs: { en: 'Travel Consultants, Experience Designers', zh: '旅行顾问、体验设计师' } },
      { category: { en: 'Bank Tellers', zh: '银行柜员' }, rate: 65, newJobs: { en: 'Financial Advisors, Customer Success', zh: '财务顾问、客户成功经理' } },
    ],
    socialImpact: { gdp: '+200%', productivity: '+300%' }
  },
  {
    id: 'chatgpt',
    year: 2022,
    name: { en: 'ChatGPT', zh: 'ChatGPT' },
    icon: Sparkles,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    impact: { en: '100M users in 2 months — AI goes mainstream', zh: '2个月1亿用户 — AI进入主流' },
    details: {
      description: {
        en: 'GPT-3.5\'s chat interface made AI accessible to everyone. No coding needed.',
        zh: 'GPT-3.5的聊天界面让每个人都能使用AI。无需编程。'
      },
      significance: { en: 'The fastest technology adoption in human history.', zh: '人类历史上最快的技术采用速度。' },
      jobsAffected: { en: '21.37% of work currently replaceable (task-aligned estimate)', zh: '目前21.37%的工作可被替代（任务对齐估计）' },
      sources: ['Task-aligned GDPval × O*NET pipeline (2026)', 'OpenAI Usage Statistics', 'Goldman Sachs Economic Research (2023)']
    },
    inventions: [
      { year: 2022, name: { en: 'ChatGPT Launch', zh: 'ChatGPT发布' }, impact: { en: '100M users in 2 months', zh: '2个月1亿用户' } },
      { year: 2023, name: { en: 'GPT-4 Multimodal', zh: 'GPT-4多模态' }, impact: { en: 'AI sees, hears, understands', zh: 'AI能看、能听、能理解' } },
    ],
    jobDisplacement: [
      { category: { en: 'Customer Service', zh: '客服' }, rate: 95, newJobs: { en: 'AI Trainers, Conversation Designers', zh: 'AI训练师、对话设计师' } },
      { category: { en: 'Content Writers', zh: '内容写手' }, rate: 70, newJobs: { en: 'AI Editors, Content Strategists', zh: 'AI编辑、内容策略师' } },
    ],
    socialImpact: { gdp: '+7%', productivity: '+300% for AI users' }
  },
  {
    id: 'ai-agents',
    year: 2025,
    name: { en: 'AI Agents', zh: 'AI智能体' },
    icon: Cpu,
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    impact: { en: 'AI works autonomously, completing complex tasks', zh: 'AI自主工作，完成复杂任务' },
    details: {
      description: {
        en: 'AI agents can plan, execute, and iterate on multi-step workflows without human intervention.',
        zh: 'AI智能体可以在没有人类干预的情况下规划、执行和迭代多步骤工作流。'
      },
      significance: { en: 'From chatbot to coworker — AI takes initiative.', zh: '从聊天机器人到同事 — AI开始主动行动。' },
      jobsAffected: { en: 'Knowledge workers face new reality', zh: '知识工作者面临新现实' },
      sources: ['World Economic Forum Future of Jobs Report (2025)', 'McKinsey Global Institute (2024)']
    },
    inventions: [
      { year: 2024, name: { en: 'AI Agent Frameworks', zh: 'AI智能体框架' }, impact: { en: 'End-to-end workflow automation', zh: '端到端工作流自动化' } },
    ],
    jobDisplacement: [
      { category: { en: 'Junior Developers', zh: '初级程序员' }, rate: 45, newJobs: { en: 'AI Architects, Code Reviewers', zh: 'AI架构师、代码审查员' } },
      { category: { en: 'Data Entry Clerks', zh: '数据录入员' }, rate: 90, newJobs: { en: 'Data Analysts, AI Trainers', zh: '数据分析师、AI训练师' } },
    ],
    socialImpact: { gdp: 'Growing', productivity: '+500% for expert users' }
  },
  {
    id: 'agi',
    year: 2030,
    name: { en: 'AGI', zh: '通用人工智能' },
    icon: Flame,
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    impact: { en: 'Human-level AI intelligence across all domains', zh: '全领域达到人类水平的AI智能' },
    details: {
      description: {
        en: 'Artificial General Intelligence achieves human-level capability across all cognitive tasks, marking a fundamental shift in human-AI relationship.',
        zh: '人工通用智能在所有认知任务上达到人类水平，标志着人机关系的根本转变。'
      },
      significance: { en: 'The question becomes: What makes us uniquely human?', zh: '根本问题变成：什么让我们成为独特的人类？' },
      jobsAffected: { en: 'Most knowledge work potentially automatable', zh: '大多数知识工作可能可被自动化' },
      sources: ['Timeline and impact are speculative — projections vary widely across researchers']
    },
    inventions: [
      { year: 2030, name: { en: 'AGI Emergence', zh: 'AGI诞生' }, impact: { en: 'Human-level general intelligence', zh: '人类水平的通用智能' } },
      { year: 2030, name: { en: 'Universal Reasoning', zh: '通用推理' }, impact: { en: 'AI matches human experts in all domains', zh: 'AI在所有领域匹敌人类专家' } },
    ],
    jobDisplacement: [
      { category: { en: 'Most Knowledge Workers', zh: '大多数知识工作者' }, rate: 60, newJobs: { en: 'Uncertain — historical patterns may not apply', zh: '不确定 — 历史模式可能不再适用' } },
    ],
    socialImpact: { gdp: 'Unknown — Massive', productivity: 'Unknown — Transformational' }
  }
];

// ============================================
// POSITION HELPER — interpolates for any year
// ============================================
const KNOWN_POSITIONS: [number, number][] = [
  [1769, 3], [1879, 16], [2012, 28],
  [2022, 46], [2025, 62], [2026, 76], [2030, 93],
];

function getPosition(year: number): number {
  const exact = KNOWN_POSITIONS.find(([y]) => y === year);
  if (exact) return exact[1];
  if (year <= KNOWN_POSITIONS[0][0]) return KNOWN_POSITIONS[0][1];
  if (year >= KNOWN_POSITIONS[KNOWN_POSITIONS.length - 1][0]) return KNOWN_POSITIONS[KNOWN_POSITIONS.length - 1][1];
  for (let i = 0; i < KNOWN_POSITIONS.length - 1; i++) {
    const [y1, p1] = KNOWN_POSITIONS[i];
    const [y2, p2] = KNOWN_POSITIONS[i + 1];
    if (year >= y1 && year <= y2) {
      return Math.round(p1 + ((year - y1) / (y2 - y1)) * (p2 - p1));
    }
  }
  return 50;
}

const MOBILE_INLINE_DETAIL_TRANSITION = { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const };

// ============================================
// MAIN COMPONENT
// ============================================
export default function ModernTimeline({ lang, theme = 'dark' }: { lang: Language; theme?: 'dark' | 'light' }) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const syncViewport = () => setIsDesktop(desktopQuery.matches);
    syncViewport();

    if (typeof desktopQuery.addEventListener === 'function') {
      desktopQuery.addEventListener('change', syncViewport);
      return () => {
        desktopQuery.removeEventListener('change', syncViewport);
      };
    }

    desktopQuery.addListener(syncViewport);
    return () => {
      desktopQuery.removeListener(syncViewport);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedMilestone(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleSelect = useCallback((m: Milestone) => {
    if (!isDesktop) {
      const shouldOpen = selectedMilestone?.id !== m.id;
      setSelectedMilestone(shouldOpen ? m : null);
      return;
    }

    const shouldOpen = selectedMilestone?.id !== m.id;
    setSelectedMilestone(shouldOpen ? m : null);
    if (!shouldOpen) return;
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }, [isDesktop, selectedMilestone]);

  const t = {
    title: lang === 'en' ? 'From Steam to AGI' : '从蒸汽机到AGI',
    subtitle: lang === 'en' ? '250 years of accelerating change. Where do you stand?' : '250年加速变革。你站在哪里？',
    weAreHere: lang === 'en' ? 'We Are Here' : '我们在这里',
    close: lang === 'en' ? 'Close' : '关闭',
    significance: lang === 'en' ? 'Why This Matters' : '为什么重要',
    jobsAffected: lang === 'en' ? 'Jobs Affected' : '受影响职业',
    clickToExplore: lang === 'en' ? 'Click to explore' : '点击探索',
    tapForDetails: lang === 'en' ? 'Tap for details' : '点击查看详情',
    projected: lang === 'en' ? 'Projected' : '预测',
    sources: lang === 'en' ? 'Sources' : '数据来源',
    aiEra: lang === 'en' ? 'AI Era' : 'AI 时代',
    openDetails: lang === 'en' ? 'Open' : '展开',
    closeDetails: lang === 'en' ? 'Close' : '收起',
    mobileHint: lang === 'en' ? 'Tap card for focused detail panel' : '点击卡片打开详情面板',
  };

  return (
    <section className="no-contain relative min-h-screen overflow-hidden" aria-label={t.title}
      onClick={(e) => {
        if (!isDesktop) return;
        if ((e.target as HTMLElement).closest('[data-milestone], [data-detail-panel]') === null) setSelectedMilestone(null);
      }}
>
      <TimelineBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }} className="inline-block mb-6">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-red-500/20 border border-white/10">
              <span className="text-sm font-medium bg-gradient-to-r from-amber-400 via-emerald-400 to-red-400 bg-clip-text text-transparent">
                {lang === 'en' ? '6 Milestones That Changed Everything' : '改变一切的6个里程碑'}
              </span>
            </div>
          </motion.div>
          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl mb-6 section-title">
              {t.title}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto section-subtitle">{t.subtitle}</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <TimelineTrack milestones={MILESTONES} selectedMilestone={selectedMilestone}
            onSelectMilestone={handleSelect} mounted={mounted} lang={lang} t={t} isDesktop={isDesktop}
          />
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedMilestone && isDesktop && (
            <div ref={detailRef} data-detail-panel>
              <DetailPanel milestone={selectedMilestone} onClose={() => setSelectedMilestone(null)} lang={lang} t={t} />
            </div>
          )}
        </AnimatePresence>
      </div>

    </section>
  );
}

// ============================================
// BACKGROUND
// ============================================
function TimelineBackground() {
  return null;
}

function MobileInlineDetail({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={MOBILE_INLINE_DETAIL_TRANSITION}
          className="overflow-hidden [contain:layout_paint]"
          style={{ willChange: 'height, opacity', overflowAnchor: 'none' }}
        >
          <div data-detail-panel className="pt-2 pb-3">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// TIMELINE TRACK
// ============================================
function TimelineTrack({ milestones, selectedMilestone, onSelectMilestone, mounted, lang, t, isDesktop }: {
  milestones: Milestone[];
  selectedMilestone: Milestone | null;
  onSelectMilestone: (m: Milestone) => void;
  mounted: boolean;
  lang: Language;
  t: Record<string, string>;
  isDesktop: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const currentPos = getPosition(currentYear);
  const desktopTrackRef = useRef<HTMLDivElement>(null);
  const labelSlotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [desktopLabelLayout, setDesktopLabelLayout] = useState<{
    compact: boolean;
    stagger: boolean;
    rows: Record<string, 0 | 1>;
  }>({ compact: false, stagger: false, rows: {} });

  const timelineGradient = (() => {
    const stops = milestones.map((m) => ({ pos: getPosition(m.year), color: m.color })).sort((a, b) => a.pos - b.pos);
    return `linear-gradient(90deg, ${stops.map((s) => `${s.color} ${s.pos}%`).join(', ')})`;
  })();

  const recomputeDesktopLabelLayout = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (window.innerWidth < 768) {
      setDesktopLabelLayout((prev) => (prev.compact || prev.stagger || Object.keys(prev.rows).length
        ? { compact: false, stagger: false, rows: {} }
        : prev));
      return;
    }

    const cards = milestones
      .map((milestone) => {
        const slot = labelSlotRefs.current[milestone.id];
        if (!slot) return null;
        const rect = slot.getBoundingClientRect();
        return {
          id: milestone.id,
          center: (rect.left + rect.right) / 2,
          bubbleWidth: rect.width,
        };
      })
      .filter((card): card is { id: string; center: number; bubbleWidth: number } => card !== null)
      .sort((a, b) => a.center - b.center);

    if (cards.length < 2) return;

    const getMinGap = (input: { center: number; bubbleWidth: number }[]) => {
      let minGap = Number.POSITIVE_INFINITY;
      for (let i = 0; i < input.length - 1; i += 1) {
        const current = input[i];
        const next = input[i + 1];
        const currentRight = current.center + current.bubbleWidth / 2;
        const nextLeft = next.center - next.bubbleWidth / 2;
        minGap = Math.min(minGap, nextLeft - currentRight);
      }
      return Number.isFinite(minGap) ? minGap : 999;
    };

    setDesktopLabelLayout((prev) => {
      const minGapNatural = getMinGap(cards);
      const compact = prev.compact ? minGapNatural < 26 : minGapNatural < 16;
      const layoutCards = compact
        ? cards.map((card) => ({ ...card, bubbleWidth: Math.min(card.bubbleWidth, 112) }))
        : cards;
      const minGapEffective = getMinGap(layoutCards);
      const stagger = prev.stagger ? minGapEffective < 6 : minGapEffective < 0;

      const rows: Record<string, 0 | 1> = {};
      if (stagger) {
        const rowRight: [number, number] = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
        for (const card of layoutCards) {
          const left = card.center - card.bubbleWidth / 2;
          const right = card.center + card.bubbleWidth / 2;
          const minRowGap = 6;
          const canUseRow0 = left - rowRight[0] >= minRowGap;
          const canUseRow1 = left - rowRight[1] >= minRowGap;
          const row: 0 | 1 = canUseRow0 ? 0 : canUseRow1 ? 1 : (rowRight[0] <= rowRight[1] ? 0 : 1);
          rows[card.id] = row;
          rowRight[row] = right;
        }
      }

      const sameRows = (() => {
        const prevKeys = Object.keys(prev.rows);
        const nextKeys = Object.keys(rows);
        if (prevKeys.length !== nextKeys.length) return false;
        return nextKeys.every((key) => prev.rows[key] === rows[key]);
      })();

      if (prev.compact === compact && prev.stagger === stagger && sameRows) return prev;
      return { compact: compact || stagger, stagger, rows };
    });
  }, [milestones]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frame: number | null = null;
    const schedule = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = null;
        recomputeDesktopLabelLayout();
      });
    };

    schedule();
    const settleTimer = window.setTimeout(schedule, 250);
    window.addEventListener('resize', schedule);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && desktopTrackRef.current) {
      observer = new ResizeObserver(schedule);
      observer.observe(desktopTrackRef.current);
    }

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
    };
  }, [recomputeDesktopLabelLayout, lang]);

  const isCompactDesktop = desktopLabelLayout.compact;
  const isStaggerDesktop = desktopLabelLayout.stagger;

  return (
    <>
      {/* ====== Desktop: Horizontal (md+) ====== */}
      <div ref={desktopTrackRef} className={`relative hidden md:block ${isStaggerDesktop ? 'py-24' : 'py-20'}`}>
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
          <div className="absolute inset-0 timeline-track rounded-full" />
          <motion.div initial={{ width: 0 }} animate={{ width: `${currentPos}%` }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: timelineGradient, boxShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)' }} />
          <motion.div initial={{ left: '-10%' }} animate={{ left: '110%' }}
            transition={{ duration: 2, ease: 'easeInOut', delay: 1.5 }}
            className="absolute top-1/2 -translate-y-1/2 w-32 h-2"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
        </div>

        {/* AI Era divider — vertical line down from Deep Learning node */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute top-1/2 pointer-events-none"
          style={{ left: `${getPosition(2012)}%` }}
        >
          <div className="absolute left-0 -translate-x-1/2 w-px"
            style={{ top: '16px', height: '48px', background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.6), rgba(139, 92, 246, 0.15))' }} />
        </motion.div>

        {/* "We Are Here" node — clickable like milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${currentPos}%` }}
          data-milestone
          onClick={() => onSelectMilestone(WE_ARE_HERE_MILESTONE)}
          role="button" tabIndex={0}
          aria-label={t.weAreHere}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectMilestone(WE_ARE_HERE_MILESTONE); } }}
        >
          {/* Year above */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-3xl md:text-4xl font-bold tabular-nums text-red-400" style={{ textShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}>
              {currentYear}
            </span>
          </div>
          {/* Node circle */}
          <motion.div className="relative -translate-x-1/2" whileHover={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
            {(selectedMilestone === null || selectedMilestone?.id === 'we-are-here') && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-red-500"
                style={{ filter: 'blur(8px)' }}
              />
            )}
            <div className="relative w-8 h-8 rounded-full border-3 border-red-500 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #ef444480)',
                boxShadow: (selectedMilestone === null || selectedMilestone?.id === 'we-are-here')
                  ? '0 0 20px rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(255,255,255,0.2)'
                  : 'inset 0 0 10px rgba(255,255,255,0.2)',
              }}>
              <Flame className="w-4 h-4 text-white" />
            </div>
          </motion.div>
          {/* Label below */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <motion.div
              animate={{ y: selectedMilestone?.id === 'we-are-here' ? -3 : 0, scale: selectedMilestone?.id === 'we-are-here' ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="px-4 py-2 rounded-xl backdrop-blur-md border border-red-500/40 transition-all"
              style={{
                background: selectedMilestone?.id === 'we-are-here' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                boxShadow: selectedMilestone?.id === 'we-are-here' ? '0 0 30px rgba(239, 68, 68, 0.3)' : '0 4px 20px rgba(0,0,0,0.3)'
              }}>
              <span className="text-base font-semibold text-red-400">{t.weAreHere}</span>
            </motion.div>
          </div>
          {/* Hover hint */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            <span className="text-[10px]" style={{ color: 'var(--timeline-text-dim)' }}>{t.clickToExplore}</span>
          </div>
        </motion.div>

        {/* Milestone nodes */}
        {milestones.map((milestone, idx) => {
          const position = getPosition(milestone.year);
          const isSelected = selectedMilestone?.id === milestone.id;
          const Icon = milestone.icon;
          const labelRow = isStaggerDesktop ? (desktopLabelLayout.rows[milestone.id] ?? 0) : 0;
          const labelTop = labelRow === 0 ? 40 : 76;
          return (
            <motion.div key={milestone.id} data-milestone
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mounted ? idx * 0.15 : 0, duration: 0.6 }}
              className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${position}%` }}
              onClick={() => onSelectMilestone(milestone)}
              role="button" tabIndex={0}
              aria-label={`${milestone.year} - ${milestone.name[lang]}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectMilestone(milestone); } }}
            >
              {/* Year */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap flex flex-col items-center gap-0.5">
                {milestone.isProjected && (
                  <span className="text-[8px] font-mono uppercase tracking-wider px-1 py-0.5 rounded"
                    style={{ color: milestone.color, border: `1px dashed ${milestone.color}60` }}>{t.projected}</span>
                )}
                <span className="text-xl md:text-2xl font-bold tabular-nums"
                  style={{ color: milestone.color, textShadow: isSelected ? `0 0 20px ${milestone.color}40` : 'none' }}>{milestone.year}</span>
              </div>

              {/* Node circle */}
              <motion.div className="relative -translate-x-1/2" whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                {isSelected && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: milestone.color, filter: 'blur(6px)', opacity: 0.42, transform: 'scale(1.16)' }}
                  />
                )}
                <div className="relative w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}80)`,
                    borderColor: milestone.color,
                    borderStyle: milestone.isProjected ? 'dashed' : 'solid',
                    boxShadow: isSelected ? `0 0 14px ${milestone.color}60, inset 0 0 8px rgba(255,255,255,0.2)` : 'inset 0 0 8px rgba(255,255,255,0.2)',
                  }}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/40 rounded-full blur-[1px]" />
              </motion.div>

              {/* Name card */}
              <div
                ref={(el) => { labelSlotRefs.current[milestone.id] = el; }}
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: `${labelTop}px` }}
              >
                <motion.div animate={{ y: isSelected ? -3 : 0, scale: isSelected ? 1.05 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all"
                  style={{
                    background: isSelected ? `${milestone.color}20` : 'var(--timeline-card-bg)',
                    borderColor: isSelected ? milestone.color : 'var(--timeline-card-border)',
                    boxShadow: isSelected ? `0 0 30px ${milestone.color}30` : '0 4px 20px rgba(0,0,0,0.3)',
                    whiteSpace: isCompactDesktop ? 'normal' : 'nowrap',
                    maxWidth: isCompactDesktop ? '112px' : undefined,
                    textAlign: 'center',
                  }}>
                  <div className="text-xs font-semibold" style={{ color: 'var(--timeline-text)' }}>{milestone.name[lang]}</div>
                </motion.div>
              </div>

              {/* Hover hint */}
              {!isCompactDesktop && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  <span className="text-[10px]" style={{ color: 'var(--timeline-text-dim)' }}>{t.clickToExplore}</span>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Era labels — same row at bottom */}
        <div className="absolute left-0 right-0 px-4" style={{ bottom: isStaggerDesktop ? '-3rem' : '-2rem' }}>
          <span className="text-xs font-mono text-[--timeline-text-dim]">{lang === 'en' ? 'Industrial Age' : '工业时代'}</span>
          <span className="absolute text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded whitespace-nowrap -translate-x-1/2"
            style={{ left: `${getPosition(2012)}%`, color: 'rgba(139, 92, 246, 0.7)', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            {t.aiEra} →
          </span>
        </div>
      </div>

      {/* ====== Mobile: Vertical (<md) ====== */}
      <div className="md:hidden relative pl-12" style={{ overflowAnchor: 'none' }}>
        <p className="text-[11px] mb-4 text-[--timeline-text-dim]">{t.mobileHint}</p>

        {/* Vertical track line */}
        <div className="absolute left-[13.5px] w-[3px] rounded-full"
          style={{ top: '18px', bottom: '18px',
            background: `linear-gradient(to bottom, ${milestones.map((m) => m.color).join(', ')})`, opacity: 0.3 }} />

        {milestones.map((milestone, idx) => {
          const isSelected = selectedMilestone?.id === milestone.id;
          const isCurrent = milestone.year <= currentYear && (idx === milestones.length - 1 || milestones[idx + 1].year > currentYear);
          const Icon = milestone.icon;
          return (
            <div key={milestone.id} className="pb-2 last:pb-0">
              <motion.div data-milestone initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="relative cursor-pointer"
                onClick={() => onSelectMilestone(milestone)}
                role="button" tabIndex={0}
                aria-label={`${milestone.year} - ${milestone.name[lang]}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectMilestone(milestone); } }}
              >
                {/* Node */}
                <div className="absolute -left-12 top-3 flex items-center justify-center">
                  {isSelected && (
                    <div
                      className="absolute rounded-full"
                      style={{ width: 24, height: 24, background: milestone.color, opacity: 0.22 }}
                    />
                  )}
                  <div className="relative w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}80)`,
                      borderColor: milestone.color,
                      borderStyle: milestone.isProjected ? 'dashed' : 'solid',
                      boxShadow: isSelected ? `0 0 12px ${milestone.color}60` : 'none'
                    }}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Card */}
                <div className="rounded-xl p-4 border transition-colors duration-200"
                  style={{
                    background: isSelected ? `${milestone.color}10` : 'var(--timeline-card-bg)',
                    borderColor: isSelected ? `${milestone.color}60` : 'var(--timeline-panel-detail-border)',
                    borderStyle: milestone.isProjected ? 'dashed' : 'solid',
                    boxShadow: isSelected ? `0 0 20px ${milestone.color}20` : '0 6px 18px rgba(15, 23, 42, 0.12)'
                  }}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xl font-bold tabular-nums" style={{ color: milestone.color }}>{milestone.year}</span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--timeline-text)' }}>{milestone.name[lang]}</span>
                        {milestone.isProjected && (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ color: milestone.color, border: `1px dashed ${milestone.color}60` }}>{t.projected}</span>
                        )}
                      </div>
                      <p className="text-xs text-[--timeline-text-muted] leading-relaxed">{milestone.impact[lang]}</p>
                    </div>

                    <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <motion.div animate={{ rotate: isSelected ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4" style={{ color: milestone.color }} />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <MobileInlineDetail open={isSelected && !isDesktop}>
                <DetailPanel
                  milestone={milestone}
                  onClose={() => onSelectMilestone(milestone)}
                  lang={lang}
                  t={t}
                  className="mt-0 mb-0"
                  variant="mobileInline"
                />
              </MobileInlineDetail>

              {/* "We Are Here" — between current and next milestone, clickable */}
              {isCurrent && (
                <>
                  <motion.div data-milestone className="relative my-2 cursor-pointer"
                    onClick={() => onSelectMilestone(WE_ARE_HERE_MILESTONE)}
                    role="button" tabIndex={0}
                    aria-label={t.weAreHere}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectMilestone(WE_ARE_HERE_MILESTONE); } }}
                  >
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-[30px] flex justify-center">
                        <div
                          className="w-3 h-3 rounded-full bg-red-500"
                          style={(selectedMilestone === null || selectedMilestone?.id === 'we-are-here')
                            ? { boxShadow: '0 0 12px rgba(239, 68, 68, 0.45)' }
                            : undefined}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/30 transition-colors duration-200"
                      style={{
                        background: selectedMilestone?.id === 'we-are-here' ? 'rgba(239, 68, 68, 0.2)' : undefined,
                        borderColor: selectedMilestone?.id === 'we-are-here' ? 'rgba(239, 68, 68, 0.6)' : undefined,
                      }}>
                      <span className="text-xs font-bold text-red-400">{t.weAreHere}</span>
                      <span className="text-[10px] text-red-400/60 font-mono">{currentYear}</span>
                      <ChevronDown
                        className="w-3 h-3 text-red-400/70 ml-auto"
                        style={{
                          transform: selectedMilestone?.id === WE_ARE_HERE_MILESTONE.id ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>
                  </motion.div>

                  <MobileInlineDetail open={selectedMilestone?.id === WE_ARE_HERE_MILESTONE.id && !isDesktop}>
                    <DetailPanel
                      milestone={WE_ARE_HERE_MILESTONE}
                      onClose={() => onSelectMilestone(WE_ARE_HERE_MILESTONE)}
                      lang={lang}
                      t={t}
                      className="mt-0 mb-0"
                      variant="mobileInline"
                    />
                  </MobileInlineDetail>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

type MobileSheetSection = 'overview' | 'inventions' | 'jobs' | 'impact' | 'sources';

function MobileDetailSheet({ milestone, onClose, lang, t }: {
  milestone: Milestone;
  onClose: () => void;
  lang: Language;
  t: Record<string, string>;
}) {
  const Icon = milestone.icon;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dockIdleTimerRef = useRef<number | null>(null);
  const activeLockRef = useRef(false);
  const activeLockTimerRef = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState<MobileSheetSection>('overview');
  const [dockActive, setDockActive] = useState(false);

  const hasInventions = Boolean(milestone.inventions?.length);
  const hasJobs = Boolean(milestone.jobDisplacement?.length);
  const hasImpact = Boolean(milestone.socialImpact);
  const hasSources = Boolean(milestone.details.sources?.length);

  const navSections = [
    { id: 'overview' as const, label: lang === 'en' ? 'Overview' : '概览', enabled: true },
    { id: 'inventions' as const, label: lang === 'en' ? 'Inventions' : '发明', enabled: hasInventions },
    { id: 'jobs' as const, label: lang === 'en' ? 'Jobs' : '岗位', enabled: hasJobs },
    { id: 'impact' as const, label: lang === 'en' ? 'Impact' : '影响', enabled: hasImpact },
    { id: 'sources' as const, label: lang === 'en' ? 'Sources' : '来源', enabled: hasSources },
  ];
  const getSectionElement = useCallback((sectionId: MobileSheetSection) => {
    const scroller = scrollerRef.current;
    if (!scroller) return null;
    return scroller.querySelector<HTMLElement>(`[data-sheet-section="${sectionId}"]`);
  }, []);

  const syncActiveSection = useCallback(() => {
    if (activeLockRef.current) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const sectionIds: MobileSheetSection[] = [
      'overview',
      ...(hasInventions ? ['inventions' as const] : []),
      ...(hasJobs ? ['jobs' as const] : []),
      ...(hasImpact ? ['impact' as const] : []),
      ...(hasSources ? ['sources' as const] : []),
    ];

    // Choose the section whose heading is nearest to the reading anchor.
    const scrollerTop = scroller.getBoundingClientRect().top;
    const anchorY = scrollerTop + Math.min(180, scroller.clientHeight * 0.24);
    let next: MobileSheetSection = 'overview';
    let minDistance = Number.POSITIVE_INFINITY;
    sectionIds.forEach((sectionId) => {
      const node = getSectionElement(sectionId);
      if (!node) return;
      const distance = Math.abs(node.getBoundingClientRect().top - anchorY);
      if (distance < minDistance) {
        minDistance = distance;
        next = sectionId;
      }
    });
    setActiveSection((prev) => (prev === next ? prev : next));
  }, [hasInventions, hasJobs, hasImpact, hasSources, getSectionElement]);

  const scheduleDockFade = () => {
    if (dockIdleTimerRef.current !== null) {
      window.clearTimeout(dockIdleTimerRef.current);
      dockIdleTimerRef.current = null;
    }
    setDockActive(true);
    dockIdleTimerRef.current = window.setTimeout(() => {
      setDockActive(false);
      dockIdleTimerRef.current = null;
    }, 900);
  };

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => syncActiveSection());
    return () => window.cancelAnimationFrame(frameId);
  }, [milestone.id, syncActiveSection]);

  useEffect(() => {
    return () => {
      if (dockIdleTimerRef.current !== null) window.clearTimeout(dockIdleTimerRef.current);
      if (activeLockTimerRef.current !== null) window.clearTimeout(activeLockTimerRef.current);
    };
  }, []);

  const onScroll: React.UIEventHandler<HTMLDivElement> = () => {
    syncActiveSection();
    scheduleDockFade();
  };

  const jumpToSection = (sectionId: MobileSheetSection) => {
    const target = getSectionElement(sectionId);
    if (!target) return;
    activeLockRef.current = true;
    if (activeLockTimerRef.current !== null) window.clearTimeout(activeLockTimerRef.current);
    activeLockTimerRef.current = window.setTimeout(() => {
      activeLockRef.current = false;
      activeLockTimerRef.current = null;
      syncActiveSection();
    }, 520);
    setActiveSection(sectionId);
    scheduleDockFade();

    const scroller = scrollerRef.current;
    if (!scroller) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = Math.max(0, scroller.scrollTop + (targetRect.top - scrollerRect.top) - 8);
    scroller.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  return (
    <motion.div className="md:hidden fixed inset-0 z-[130]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" onClick={onClose} aria-label={t.close}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex flex-col"
        style={{ background: 'var(--timeline-bg-via)' }}
        data-detail-panel
        role="dialog"
        aria-modal="true"
        aria-label={`${milestone.name[lang]} — ${milestone.year}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="border-b px-4 pb-3 backdrop-blur-xl"
          style={{
            paddingTop: 'calc(var(--safe-top) + 0.5rem)',
            borderColor: 'var(--timeline-panel-detail-border)',
            background: 'color-mix(in srgb, var(--timeline-bg-via) 92%, transparent)',
          }}
        >
          <div className="w-12 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--timeline-text-dim)' }} />
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0"
              style={{ borderColor: `${milestone.color}50`, background: `${milestone.color}22` }}>
              <Icon className="w-5 h-5" style={{ color: milestone.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tabular-nums" style={{ color: milestone.color }}>{milestone.year}</span>
                {milestone.isProjected && (
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ color: milestone.color, border: `1px dashed ${milestone.color}60` }}>{t.projected}</span>
                )}
              </div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--timeline-text)' }}>{milestone.name[lang]}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--timeline-text-muted)' }}>{milestone.impact[lang]}</p>
            </div>
            <button onClick={onClose} aria-label={t.close}
              className="min-h-[44px] min-w-[44px] rounded-full border flex items-center justify-center"
              style={{ borderColor: 'var(--timeline-panel-detail-border)', background: 'var(--timeline-close-bg)' }}>
              <X className="w-4 h-4" style={{ color: 'var(--timeline-text-muted)' }} />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto px-4 pt-4 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(var(--safe-bottom) + 5.5rem)' }}
        >
          <section data-sheet-section="overview" className="mb-4">
            <div className="rounded-2xl border p-4"
              style={{ borderColor: `${milestone.color}35`, background: `${milestone.color}10` }}>
              <h4 className="text-sm font-semibold mb-2" style={{ color: milestone.color }}>
                {lang === 'en' ? 'What happened' : '发生了什么'}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--timeline-panel-text)' }}>{milestone.details.description[lang]}</p>
            </div>
            <div className="rounded-2xl border p-4 mt-3"
              style={{ borderColor: 'var(--timeline-panel-detail-border)', background: 'var(--timeline-panel-detail-bg)' }}>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--timeline-text)' }}>{t.significance}</h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--timeline-panel-text)' }}>{milestone.details.significance[lang]}</p>
            </div>
          </section>

          {milestone.inventions && milestone.inventions.length > 0 && (
            <section data-sheet-section="inventions" className="mb-4">
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--timeline-text)' }}>
                {lang === 'en' ? 'Key Inventions' : '关键发明'}
              </h4>
              <div className="space-y-2">
                {milestone.inventions.map((inv, idx) => (
                  <div key={idx} className="rounded-xl border p-3"
                    style={{ borderColor: 'var(--timeline-panel-detail-border)', background: 'var(--timeline-panel-detail-bg)' }}>
                    <div className="text-[11px] font-mono mb-1" style={{ color: 'var(--timeline-text-dim)' }}>{inv.year}</div>
                    <div className="text-sm font-medium" style={{ color: 'var(--timeline-text)' }}>{inv.name[lang]}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--timeline-text-muted)' }}>{inv.impact[lang]}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {milestone.jobDisplacement && milestone.jobDisplacement.length > 0 && (
            <section data-sheet-section="jobs" className="mb-4">
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--timeline-text)' }}>{t.jobsAffected}</h4>
              <div className="space-y-2">
                {milestone.jobDisplacement.map((job, idx) => (
                  <div key={idx} className="rounded-xl border p-3"
                    style={{ borderColor: 'var(--timeline-panel-detail-border)', background: 'var(--timeline-panel-detail-bg)' }}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--timeline-text)' }}>{job.category[lang]}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: job.rate >= 70 ? '#f87171' : '#34d399', background: job.rate >= 70 ? 'rgba(239,68,68,0.18)' : 'rgba(16,185,129,0.18)' }}>
                        {job.rate}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--timeline-track-bg)' }}>
                      <div className="h-full rounded-full" style={{ width: `${job.rate}%`, background: milestone.color }} />
                    </div>
                    <div className="text-xs" style={{ color: 'var(--timeline-text-dim)' }}>→ {job.newJobs[lang]}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {milestone.socialImpact && (
            <section data-sheet-section="impact" className="mb-4">
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--timeline-text)' }}>
                {lang === 'en' ? 'Social Impact' : '社会影响'}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {milestone.socialImpact.gdp && (
                  <div className="rounded-xl border p-3"
                    style={{ borderColor: 'var(--timeline-panel-detail-border)', background: 'var(--timeline-panel-detail-bg)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--timeline-text-dim)' }}>GDP</div>
                    <div className="text-sm font-semibold text-green-400">{milestone.socialImpact.gdp}</div>
                  </div>
                )}
                {milestone.socialImpact.productivity && (
                  <div className="rounded-xl border p-3"
                    style={{ borderColor: 'var(--timeline-panel-detail-border)', background: 'var(--timeline-panel-detail-bg)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--timeline-text-dim)' }}>
                      {lang === 'en' ? 'Productivity' : '生产力'}
                    </div>
                    <div className="text-sm font-semibold text-blue-400">{milestone.socialImpact.productivity}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {milestone.details.sources && milestone.details.sources.length > 0 && (
            <section data-sheet-section="sources" className="mb-4">
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--timeline-text)' }}>{t.sources}</h4>
              <div className="rounded-xl border p-3 space-y-1"
                style={{ borderColor: 'var(--timeline-panel-detail-border)', background: 'var(--timeline-panel-detail-bg)' }}>
                {milestone.details.sources.map((source, idx) => (
                  <div key={idx} className="text-xs leading-relaxed" style={{ color: 'var(--timeline-text-dim)' }}>
                    * {source}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 px-3"
          style={{ bottom: 'calc(var(--safe-bottom) + 0.45rem)' }}
          animate={{ y: dockActive ? 0 : 8, scale: dockActive ? 1 : 0.985 }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
        >
          <div
            className="pointer-events-auto rounded-2xl border p-1.5 backdrop-blur-xl overflow-x-auto scrollbar-hide"
            style={{
              borderColor: 'rgba(255,255,255,0.12)',
              background: dockActive
                ? 'color-mix(in srgb, var(--surface) 92%, transparent)'
                : 'color-mix(in srgb, var(--surface) 72%, transparent)',
              boxShadow: dockActive ? '0 14px 30px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.14)',
            }}
          >
            <div className="flex gap-1 min-w-max">
              {navSections.filter((section) => section.enabled).map((section) => {
                const active = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => jumpToSection(section.id)}
                    className="min-h-[40px] px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                    style={{
                      color: active ? '#fff' : 'var(--timeline-text-muted)',
                      background: active
                        ? `linear-gradient(135deg, ${milestone.color}, ${milestone.color}CC)`
                        : 'color-mix(in srgb, var(--surface) 45%, transparent)',
                      border: active ? `1px solid ${milestone.color}99` : '1px solid transparent',
                      boxShadow: active ? `0 8px 18px ${milestone.color}45` : 'none',
                      opacity: active ? 1 : 0.9,
                    }}
                  >
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// DETAIL PANEL
// ============================================
function DetailPanel({ milestone, onClose, lang, t, className, variant = 'default' }: {
  milestone: Milestone;
  onClose: () => void;
  lang: Language;
  t: Record<string, string>;
  className?: string;
  variant?: 'default' | 'mobileSheet' | 'mobileInline';
}) {
  const Icon = milestone.icon;
  const isMobileSheet = variant === 'mobileSheet';
  const isMobileInline = variant === 'mobileInline';
  const compactMode = isMobileSheet || isMobileInline;
  const disableNestedMotion = isMobileInline;

  const panelMotion = isMobileInline
    ? {
      initial: { opacity: 1, y: 0, scale: 1 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.01 },
    }
    : {
      initial: { opacity: 0, y: 40, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    };

  return (
    <motion.div
      initial={panelMotion.initial}
      animate={panelMotion.animate}
      exit={panelMotion.exit}
      transition={panelMotion.transition}
      className={`relative ${className ?? 'mt-6 md:mt-10'}`} role="dialog" aria-label={`${milestone.name[lang]} — ${milestone.year}`}>
      {!compactMode && <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15" style={{ background: milestone.color }} />}
      <MotionConfig reducedMotion={disableNestedMotion ? 'always' : 'never'}>
        <div className={`relative overflow-hidden border ${compactMode ? 'rounded-2xl' : 'rounded-2xl'}`}
          style={{
            background: 'var(--timeline-panel-bg)', borderColor: `${milestone.color}30`,
            borderStyle: milestone.isProjected ? 'dashed' : 'solid',
            boxShadow: isMobileInline
              ? `0 4px 16px ${milestone.color}12, inset 0 1px 0 rgba(255,255,255,0.06)`
              : compactMode
              ? `0 10px 30px ${milestone.color}16, inset 0 1px 0 rgba(255,255,255,0.08)`
              : `0 0 40px ${milestone.color}12, inset 0 1px 0 rgba(255,255,255,0.06)`,
            maxWidth: compactMode ? undefined : '56rem',
            margin: compactMode ? undefined : '0 auto',
          }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${milestone.color}80, transparent)` }} />
          <button onClick={onClose} aria-label={t.close}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-[--timeline-card-border] timeline-close-btn"
            style={{ background: 'var(--timeline-close-bg)' }}>
            <X className="w-4 h-4" style={{ color: 'var(--timeline-text-muted)' }} />
          </button>

          <div className={compactMode ? 'p-5 pt-6' : 'p-5 md:p-6'}>
          {/* Header row */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${milestone.color}25, ${milestone.color}08)`, border: `1px ${milestone.isProjected ? 'dashed' : 'solid'} ${milestone.color}30` }}>
              <Icon className="w-5 h-5" style={{ color: milestone.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-lg font-bold tabular-nums" style={{ color: milestone.color }}>{milestone.year}</span>
                {milestone.isProjected && (
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ color: milestone.color, border: `1px dashed ${milestone.color}50` }}>{t.projected}</span>
                )}
              </div>
              <h3 className="text-base font-bold leading-snug" style={{ color: 'var(--timeline-text)' }}>{milestone.name[lang]}</h3>
              <p className="text-xs text-[--timeline-text-muted] mt-0.5">{milestone.impact[lang]}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[--timeline-panel-text] leading-relaxed mb-4">{milestone.details.description[lang]}</p>

          {/* Significance callout */}
          <div className="px-3 py-2.5 rounded-lg mb-4" style={{ background: `${milestone.color}08`, border: `1px solid ${milestone.color}20` }}>
            <div className="text-[10px] font-semibold text-[--timeline-text-muted] mb-1 uppercase tracking-wider">{t.significance}</div>
            <p className="text-sm font-medium" style={{ color: 'var(--timeline-text)' }}>{milestone.details.significance[lang]}</p>
          </div>

          {/* Two-column grid for inventions + jobs on desktop */}
          {!compactMode && (milestone.inventions?.length || milestone.jobDisplacement?.length) ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {milestone.inventions && milestone.inventions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[--timeline-text-muted] mb-2 uppercase tracking-wider">
                    {lang === 'en' ? 'Key Inventions' : '关键发明'}
                  </h4>
                  <div className="space-y-2">
                    {milestone.inventions.map((inv, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="p-2.5 rounded-lg border"
                        style={{ background: 'var(--timeline-panel-detail-bg)', borderColor: 'var(--timeline-panel-detail-border)' }}>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] text-[--timeline-text-dim] font-mono shrink-0">{inv.year}</span>
                          <span className="text-xs font-medium text-[--timeline-text]">{inv.name[lang]}</span>
                        </div>
                        <div className="text-[11px] text-[--timeline-text-dim] mt-0.5">{inv.impact[lang]}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              {milestone.jobDisplacement && milestone.jobDisplacement.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[--timeline-text-muted] mb-2 uppercase tracking-wider">{t.jobsAffected}</h4>
                  <div className="space-y-2">
                    {milestone.jobDisplacement.map((job, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 + 0.15 }}
                        className="p-2.5 rounded-lg"
                        style={{ background: 'var(--timeline-panel-detail-bg)', border: `1px solid var(--timeline-panel-detail-border)` }}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-medium text-[--timeline-text]">{job.category[lang]}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: job.rate >= 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: job.rate >= 70 ? '#f87171' : '#34d399' }}>
                            {job.rate}%
                          </span>
                        </div>
                        <div className="w-full rounded-full h-1 mb-1.5 overflow-hidden" style={{ background: 'var(--timeline-track-bg)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${job.rate}%` }}
                            transition={{ duration: 0.8, delay: 0.4 }} className="h-full rounded-full"
                            style={{ background: milestone.color }} />
                        </div>
                        <div className="text-[11px] text-[--timeline-text-dim]">→ {job.newJobs[lang]}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {milestone.inventions && milestone.inventions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-[--timeline-text-muted] mb-2 uppercase tracking-wider">
                    {lang === 'en' ? 'Key Inventions' : '关键发明'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {milestone.inventions.map((inv, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="p-2.5 rounded-lg border"
                        style={{ background: 'var(--timeline-panel-detail-bg)', borderColor: 'var(--timeline-panel-detail-border)' }}>
                        <div className="text-[10px] text-[--timeline-text-dim] mb-0.5 font-mono">{inv.year}</div>
                        <div className="text-xs font-medium text-[--timeline-text]">{inv.name[lang]}</div>
                        <div className="text-[11px] text-[--timeline-text-dim] mt-0.5">{inv.impact[lang]}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {milestone.jobDisplacement && milestone.jobDisplacement.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-[--timeline-text-muted] mb-2 uppercase tracking-wider">{t.jobsAffected}</h4>
                  <div className="space-y-2">
                    {milestone.jobDisplacement.map((job, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 + 0.15 }}
                        className="p-2.5 rounded-lg"
                        style={{ background: 'var(--timeline-panel-detail-bg)', border: `1px solid var(--timeline-panel-detail-border)` }}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-medium text-[--timeline-text]">{job.category[lang]}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: job.rate >= 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: job.rate >= 70 ? '#f87171' : '#34d399' }}>
                            {job.rate}%
                          </span>
                        </div>
                        <div className="w-full rounded-full h-1 mb-1.5 overflow-hidden" style={{ background: 'var(--timeline-track-bg)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${job.rate}%` }}
                            transition={{ duration: 0.8, delay: 0.4 }} className="h-full rounded-full"
                            style={{ background: milestone.color }} />
                        </div>
                        <div className="text-[11px] text-[--timeline-text-dim]">→ {job.newJobs[lang]}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {milestone.socialImpact && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-[--timeline-text-muted] mb-2 uppercase tracking-wider">
                {lang === 'en' ? 'Social Impact' : '社会影响'}
              </h4>
              <div className="flex gap-2 flex-wrap">
                {milestone.socialImpact.gdp && (
                  <div className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--timeline-panel-detail-bg)' }}>
                    <div className="text-[10px] text-[--timeline-text-dim]">GDP</div>
                    <div className="text-sm font-bold text-green-400">{milestone.socialImpact.gdp}</div>
                  </div>
                )}
                {milestone.socialImpact.productivity && (
                  <div className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--timeline-panel-detail-bg)' }}>
                    <div className="text-[10px] text-[--timeline-text-dim]">{lang === 'en' ? 'Productivity' : '生产力'}</div>
                    <div className="text-sm font-bold text-blue-400">{milestone.socialImpact.productivity}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {milestone.details.sources && milestone.details.sources.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[10px] font-semibold text-[--timeline-text-muted] mb-1.5 uppercase tracking-wider">{t.sources}</h4>
              <div className="text-[11px] text-[--timeline-text-dim] space-y-0.5">
                {milestone.details.sources.map((source, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="mt-0.5 opacity-40">*</span><span>{source}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

          {!compactMode && (
            <div className="px-5 pb-4">
              <button onClick={onClose}
                className="flex items-center gap-1.5 text-xs transition-colors min-h-[36px] min-w-[36px]"
                style={{ color: 'var(--timeline-text-muted)' }}>
                <X className="w-3.5 h-3.5" /><span>{t.close}</span>
              </button>
            </div>
          )}
        </div>
      </MotionConfig>
    </motion.div>
  );
}
