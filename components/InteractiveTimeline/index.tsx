'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Zap, Brain, Cpu, Sparkles, ChevronRight, Lightbulb, Flame, Settings } from 'lucide-react';

// ============================================
// TYPES & DATA
// ============================================
type Language = 'en' | 'zh';

interface Milestone {
  id: string;
  year: number;
  name: { en: string; zh: string };
  nameEn: string;
  nameZh: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  gradient: string;
  impact: { en: string; zh: string };
  impactEn: string;
  impactZh: string;
  details: {
    description: { en: string; zh: string };
    significance: { en: string; zh: string };
    jobsAffected?: { en: string; zh: string };
  };
  // Additional era data
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

const MILESTONES: Milestone[] = [
  {
    id: 'steam-engine',
    year: 1769,
    nameEn: 'Steam Engine',
    nameZh: '蒸汽机',
    name: { en: 'Steam Engine', zh: '蒸汽机' },
    icon: Settings,
    color: '#94a3b8',
    gradient: 'from-slate-400 to-slate-500',
    impactEn: 'Machines learned to move, replacing physical labor',
    impactZh: '机器学会运动，替代体力劳动',
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
      jobsAffected: {
        en: '60% of hand weavers disappeared → but factory jobs emerged',
        zh: '60%手工纺织工消失 → 但工厂工作涌现'
      }
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
    nameEn: 'Electricity',
    nameZh: '电力革命',
    name: { en: 'Electricity', zh: '电力革命' },
    icon: Zap,
    color: '#fbbf24',
    gradient: 'from-yellow-400 to-amber-500',
    impactEn: 'Power distributed everywhere, factories ran 24/7',
    impactZh: '动力随处可得，工厂24/7运转',
    impact: { en: 'Power distributed everywhere, factories ran 24/7', zh: '动力随处可得，工厂24/7运转' },
    details: {
      description: {
        en: 'Edison\'s light bulb and electric grid brought power to every factory and home, enabling continuous operation.',
        zh: '爱迪生的灯泡和电网将动力带给每个工厂和家庭，实现持续运转。'
      },
      significance: {
        en: 'Energy could be transmitted anywhere, not just generated on-site.',
        zh: '能源可以传输到任何地方，而不仅仅是现场发电。'
      },
      jobsAffected: {
        en: 'Gas lamp lighters → electricians, power plant workers',
        zh: '煤气灯工人 → 电工、发电厂工人'
      }
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
    year: 2015,
    nameEn: 'Deep Learning',
    nameZh: '深度学习',
    name: { en: 'Deep Learning', zh: '深度学习' },
    icon: Brain,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    impactEn: 'Neural networks achieved human-level performance',
    impactZh: '神经网络达到人类水平表现',
    impact: { en: 'Neural networks achieved human-level performance', zh: '神经网络达到人类水平表现' },
    details: {
      description: {
        en: 'AlexNet breakthrough showed deep neural networks could learn patterns better than any previous method.',
        zh: 'AlexNet突破表明深度神经网络能比以往任何方法更好地学习模式。'
      },
      significance: {
        en: 'AI moved from rules-based systems to learning from data.',
        zh: 'AI从基于规则的系统转向从数据中学习。'
      },
      jobsAffected: {
        en: 'Tasks automated, not jobs — yet',
        zh: '任务被自动化，而非工作——暂时'
      }
    },
    inventions: [
      { year: 2012, name: { en: 'Deep Learning Breakthrough', zh: '深度学习突破' }, impact: { en: 'Human-level image recognition', zh: '人类水平的图像识别' } },
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
    nameEn: 'ChatGPT',
    nameZh: 'ChatGPT',
    name: { en: 'ChatGPT', zh: 'ChatGPT' },
    icon: Sparkles,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    impactEn: '100M users in 2 months — AI goes mainstream',
    impactZh: '2个月1亿用户 — AI进入主流',
    impact: { en: '100M users in 2 months — AI goes mainstream', zh: '2个月1亿用户 — AI进入主流' },
    details: {
      description: {
        en: 'GPT-3.5\'s chat interface made AI accessible to everyone. No coding needed.',
        zh: 'GPT-3.5的聊天界面让每个人都能使用AI。无需编程。'
      },
      significance: {
        en: 'The fastest technology adoption in human history.',
        zh: '人类历史上最快的技术采用速度。'
      },
      jobsAffected: {
        en: '11.7% of work currently replaceable (MIT)',
        zh: '目前11.7%的工作可被替代(MIT)'
      }
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
    nameEn: 'AI Agents',
    nameZh: 'AI智能体',
    name: { en: 'AI Agents', zh: 'AI智能体' },
    icon: Cpu,
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    impactEn: 'AI works autonomously, completing complex tasks',
    impactZh: 'AI自主工作，完成复杂任务',
    impact: { en: 'AI works autonomously, completing complex tasks', zh: 'AI自主工作，完成复杂任务' },
    details: {
      description: {
        en: 'AI agents can plan, execute, and iterate on multi-step workflows without human intervention.',
        zh: 'AI智能体可以在没有人类干预的情况下规划、执行和迭代多步骤工作流。'
      },
      significance: {
        en: 'From chatbot to coworker — AI takes initiative.',
        zh: '从聊天机器人到同事 — AI开始主动行动。'
      },
      jobsAffected: {
        en: 'Knowledge workers face new reality',
        zh: '知识工作者面临新现实'
      }
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
    nameEn: 'AGI',
    nameZh: '通用人工智能',
    name: { en: 'AGI', zh: '通用人工智能' },
    icon: Flame,
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    impactEn: 'Human-level AI intelligence across all domains',
    impactZh: '全领域达到人类水平的AI智能',
    impact: { en: 'Human-level AI intelligence across all domains', zh: '全领域达到人类水平的AI智能' },
    details: {
      description: {
        en: 'Artificial General Intelligence achieves human-level capability across all cognitive tasks, marking a fundamental shift in human-AI relationship.',
        zh: '人工通用智能在所有认知任务上达到人类水平，标志着人机关系的根本转变。'
      },
      significance: {
        en: 'The question becomes: What makes us uniquely human?',
        zh: '根本问题变成：什么让我们成为独特的人类？'
      },
      jobsAffected: {
        en: 'Most knowledge work potentially automatable',
        zh: '大多数知识工作可能可被自动化'
      }
    },
    inventions: [
      { year: 2030, name: { en: 'AGI Emergence', zh: 'AGI诞生' }, impact: { en: 'Human-level general intelligence', zh: '人类水平的通用智能' } },
      { year: 2030, name: { en: 'Universal Reasoning', zh: '通用推理' }, impact: { en: 'AI matches human experts in all domains', zh: 'AI在所有领域匹敌人类专家' } },
    ],
    jobDisplacement: [
      { category: { en: 'Most Knowledge Workers', zh: '大多数知识工作者' }, rate: 60, newJobs: { en: 'AI Supervisors, Ethicists, Experience Creators', zh: 'AI监督员、伦理学家、体验创造者' } },
    ],
    socialImpact: { gdp: 'Unknown - Massive', productivity: 'Unknown - Transformational' }
  }
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function ModernTimeline({ lang, theme = 'dark' }: { lang: Language; theme?: 'dark' | 'light' }) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = {
    title: lang === 'en' ? 'From Steam to AGI' : '从蒸汽机到AGI',
    subtitle: lang === 'en'
      ? '250 years of accelerating change. Where do you stand?'
      : '250年加速变革。你站在哪里？',
    weAreHere: lang === 'en' ? 'We Are Here' : '我们在这里',
    close: lang === 'en' ? 'Close' : '关闭',
    significance: lang === 'en' ? 'Why This Matters' : '为什么重要',
    jobsAffected: lang === 'en' ? 'Jobs Affected' : '受影响职业',
  };

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: `linear-gradient(to bottom, var(--timeline-bg-from), var(--timeline-bg-via), var(--timeline-bg-to))` }}>
      {/* Background Effects */}
      <TimelineBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-red-500/20 border border-white/10">
              <span className="text-sm font-medium bg-gradient-to-r from-amber-400 via-emerald-400 to-red-400 bg-clip-text text-transparent">
                {lang === 'en' ? '6 Milestones That Changed Everything' : '改变一切的6个里程碑'}
              </span>
            </div>
          </motion.div>
          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, var(--timeline-text), var(--timeline-text-muted))` }}>
              {t.title}
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--timeline-text-muted)' }}>
            {t.subtitle}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <TimelineTrack
            milestones={MILESTONES}
            selectedMilestone={selectedMilestone}
            onSelectMilestone={setSelectedMilestone}
            mounted={mounted}
            lang={lang}
            weAreHereText={t.weAreHere}
          />
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedMilestone && (
            <DetailPanel
              milestone={selectedMilestone}
              onClose={() => setSelectedMilestone(null)}
              lang={lang}
              t={t}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ============================================
// BACKGROUND EFFECTS
// ============================================
function TimelineBackground() {
  return (
    <>
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 -left-16 md:-left-32 w-48 h-48 md:w-96 md:h-96 bg-amber-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/2 -right-16 md:-right-32 w-48 h-48 md:w-96 md:h-96 bg-emerald-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 left-1/2 w-48 h-48 md:w-96 md:h-96 bg-red-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(90deg, var(--timeline-grid-color) 1px, transparent 1px),
          linear-gradient(var(--timeline-grid-color) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
    </>
  );
}

// ============================================
// TIMELINE TRACK
// ============================================
function TimelineTrack({
  milestones,
  selectedMilestone,
  onSelectMilestone,
  mounted,
  lang,
  weAreHereText
}: {
  milestones: Milestone[];
  selectedMilestone: Milestone | null;
  onSelectMilestone: (m: Milestone) => void;
  mounted: boolean;
  lang: Language;
  weAreHereText: string;
}) {
  // Custom positions - left 1/3 for history, right 2/3 for AI era
  const getPosition = (year: number) => {
    const positions: Record<number, number> = {
      1769: 8,   // Steam Engine - left edge
      1879: 20,  // Electricity - historical
      2015: 30,  // Deep Learning - end of left 1/3
      2022: 55,  // ChatGPT - AI goes mainstream
      2025: 72,  // AI Agents - autonomous AI
      2026: 84,  // Current position (We Are Here)
      2030: 94,  // AGI - future vision
    };
    return positions[year] ?? 50;
  };

  const currentYear = new Date().getFullYear();
  const currentPos = getPosition(currentYear);

  // 时间轴渐变：与各里程碑图标颜色一致，按位置分布
  const timelineGradient = (() => {
    const stops = milestones
      .map((m) => ({ pos: getPosition(m.year), color: m.color }))
      .sort((a, b) => a.pos - b.pos);
    const parts = stops.map((s) => `${s.color} ${s.pos}%`).join(', ');
    return `linear-gradient(90deg, ${parts})`;
  })();

  return (
    <>
      {/* Desktop: Horizontal timeline (md+) */}
      <div className="relative py-20 hidden md:block">
        {/* Main timeline track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
          <div className="absolute inset-0 timeline-track rounded-full" />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentPos}%` }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              background: timelineGradient,
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)'
            }}
          />
          <motion.div
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 -translate-y-1/2 w-32 h-2"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
          />
        </div>

        {/* "We Are Here" indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{ left: `${currentPos}%` }}
        >
          <div className="absolute -translate-x-1/2 flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <div className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50">
                <span className="text-xs font-bold text-red-400">{weAreHereText}</span>
              </div>
              <div className="w-0.5 h-8 bg-gradient-to-b from-red-500 to-transparent" />
            </motion.div>
          </div>
        </motion.div>

        {/* Milestone nodes */}
        {milestones.map((milestone, idx) => {
          const position = getPosition(milestone.year);
          const isSelected = selectedMilestone?.id === milestone.id;
          const Icon = milestone.icon;

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mounted ? idx * 0.15 : 0, duration: 0.6 }}
              className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${position}%` }}
              onClick={() => onSelectMilestone(milestone)}
            >
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-3xl md:text-4xl font-bold tabular-nums"
                  style={{
                    color: milestone.color,
                    textShadow: `0 0 30px ${milestone.color}40`
                  }}
                >
                  {milestone.year}
                </span>
              </div>

              <motion.div
                className="relative -translate-x-1/2"
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <motion.div
                  animate={{
                    scale: isSelected ? [1, 1.3, 1] : [1, 1.1, 1],
                    opacity: isSelected ? 0.6 : 0.3
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: milestone.color, filter: 'blur(8px)' }}
                />
                <div
                  className="relative w-8 h-8 rounded-full border-3 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}80)`,
                    borderColor: milestone.color,
                    boxShadow: `0 0 20px ${milestone.color}60, inset 0 0 10px rgba(255,255,255,0.2)`
                  }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full blur-[1px]" />
              </motion.div>

              <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <motion.div
                  animate={{
                    y: isSelected ? -4 : 0,
                    scale: isSelected ? 1.05 : 1
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="px-4 py-2 rounded-xl backdrop-blur-md border transition-all"
                  style={{
                    background: isSelected ? `${milestone.color}20` : 'var(--timeline-card-bg)',
                    borderColor: isSelected ? milestone.color : 'var(--timeline-card-border)',
                    boxShadow: isSelected ? `0 0 30px ${milestone.color}30` : '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="text-base font-semibold" style={{ color: 'var(--timeline-text)' }}>
                    {lang === 'en' ? milestone.nameEn : milestone.nameZh}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isSelected ? 1 : 0, y: isSelected ? 0 : 10 }}
                className="absolute top-28 left-1/2 -translate-x-1/2 whitespace-nowrap w-48 text-center"
              >
                <div className="text-xs text-[--timeline-text-muted] line-clamp-2">
                  {lang === 'en' ? milestone.impactEn : milestone.impactZh}
                </div>
              </motion.div>
            </motion.div>
          );
        })}

        {/* Era labels */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-4">
          <span className="text-xs font-mono text-[--timeline-text-dim]">1769</span>
          <span className="text-xs font-mono text-[--timeline-text-dim]">2012</span>
          <span className="text-xs font-mono text-[--timeline-text-dim]">2030</span>
        </div>
      </div>

      {/* Mobile: Vertical timeline (< md) */}
      <div className="md:hidden relative pl-8">
        {/* Vertical track line */}
        <div className="absolute top-0 bottom-0 left-[15px] w-0.5 timeline-track" />

        {milestones.map((milestone, idx) => {
          const isSelected = selectedMilestone?.id === milestone.id;
          const isCurrent = milestone.year === 2025;
          const Icon = milestone.icon;

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative mb-6 last:mb-0 cursor-pointer"
              onClick={() => onSelectMilestone(milestone)}
            >
              {/* Node dot on the vertical line */}
              <div className="absolute -left-8 top-1 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: isSelected ? [1, 1.2, 1] : 1,
                    opacity: isSelected ? 0.6 : 0.3
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute rounded-full"
                  style={{ width: 24, height: 24, background: milestone.color, filter: 'blur(6px)' }}
                />
                <div
                  className="relative w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}80)`,
                    borderColor: milestone.color,
                    boxShadow: `0 0 12px ${milestone.color}60`
                  }}
                >
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* "We Are Here" badge */}
              {isCurrent && (
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -left-8 -top-7"
                >
                  <div className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/50">
                    <span className="text-[10px] font-bold text-red-400">{weAreHereText}</span>
                  </div>
                </motion.div>
              )}

              {/* Card content */}
              <div
                className="rounded-xl p-4 border transition-all"
                style={{
                  background: isSelected ? `${milestone.color}10` : 'var(--timeline-card-bg)',
                  borderColor: isSelected ? `${milestone.color}60` : 'var(--timeline-panel-detail-border)',
                  boxShadow: isSelected ? `0 0 20px ${milestone.color}20` : 'none'
                }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl font-bold tabular-nums" style={{ color: milestone.color }}>
                    {milestone.year}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--timeline-text)' }}>
                    {lang === 'en' ? milestone.nameEn : milestone.nameZh}
                  </span>
                </div>
                <p className="text-xs text-[--timeline-text-muted] leading-relaxed">
                  {lang === 'en' ? milestone.impactEn : milestone.impactZh}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

// ============================================
// DETAIL PANEL
// ============================================
function DetailPanel({
  milestone,
  onClose,
  lang,
  t
}: {
  milestone: Milestone;
  onClose: () => void;
  lang: Language;
  t: any;
}) {
  const Icon = milestone.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="mt-16 relative"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
        style={{ background: milestone.color }}
      />

      {/* Card */}
      <div
        className="relative rounded-3xl overflow-hidden border"
        style={{
          background: 'var(--timeline-panel-bg)',
          borderColor: `${milestone.color}40`,
          boxShadow: `0 0 60px ${milestone.color}20, inset 0 1px 0 rgba(255,255,255,0.1)`
        }}
      >
        {/* Header gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${milestone.color}, ${milestone.color}80, ${milestone.color})`
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-[--timeline-card-border]"
          style={{ background: 'var(--timeline-close-bg)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--timeline-close-bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--timeline-close-bg)'}
        >
          <X className="w-5 h-5" style={{ color: 'var(--timeline-text-muted)' }} />
        </button>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${milestone.color}30, ${milestone.color}10)`,
                border: `1px solid ${milestone.color}40`
              }}
            >
              <Icon className="w-8 h-8" style={{ color: milestone.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="text-2xl md:text-3xl font-bold tabular-nums"
                  style={{ color: milestone.color }}
                >
                  {milestone.year}
                </span>
              </div>
              <h3
                className="text-xl md:text-2xl font-bold mb-1" style={{ color: 'var(--timeline-text)' }}
              >
                {lang === 'en' ? milestone.nameEn : milestone.nameZh}
              </h3>
              <p className="text-sm text-[--timeline-text-muted]">
                {lang === 'en' ? milestone.impactEn : milestone.impactZh}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-[--timeline-panel-text] leading-relaxed mb-6">
            {lang === 'en' ? milestone.details.description.en : milestone.details.description.zh}
          </p>

          {/* Significance */}
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              background: `${milestone.color}10`,
              border: `1px solid ${milestone.color}30`
            }}
          >
            <div className="text-xs font-semibold text-[--timeline-text-muted] mb-2 uppercase tracking-wider">
              {t.significance}
            </div>
            <p className="font-medium" style={{ color: 'var(--timeline-text)' }}>
              {lang === 'en' ? milestone.details.significance.en : milestone.details.significance.zh}
            </p>
          </div>

          {/* Inventions */}
          {milestone.inventions && milestone.inventions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[--timeline-text-muted] mb-3 uppercase tracking-wider">
                {lang === 'en' ? 'Key Inventions' : '关键发明'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {milestone.inventions.map((inv, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg border"
                    style={{ background: 'var(--timeline-panel-detail-bg)', borderColor: 'var(--timeline-panel-detail-border)' }}
                  >
                    <div className="text-xs text-[--timeline-text-dim] mb-1 font-mono">{inv.year}</div>
                    <div className="text-sm font-medium text-[--timeline-text]">
                      {lang === 'en' ? inv.name.en : inv.name.zh}
                    </div>
                    <div className="text-xs text-[--timeline-text-dim] mt-1">
                      {lang === 'en' ? inv.impact.en : inv.impact.zh}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Job Displacement */}
          {milestone.jobDisplacement && milestone.jobDisplacement.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[--timeline-text-muted] mb-3 uppercase tracking-wider">
                {lang === 'en' ? 'Jobs Affected' : '受影响职业'}
              </h4>
              <div className="space-y-3">
                {milestone.jobDisplacement.map((job, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className="p-3 rounded-lg"
                    style={{ background: 'var(--timeline-panel-detail-bg)', border: `1px solid var(--timeline-panel-detail-border)` }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[--timeline-text]">
                        {lang === 'en' ? job.category.en : job.category.zh}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: job.rate >= 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: job.rate >= 70 ? '#f87171' : '#34d399'
                        }}
                      >
                        {job.rate}%
                      </span>
                    </div>
                    <div className="w-full rounded-full h-1.5 mb-2 overflow-hidden" style={{ background: 'var(--timeline-track-bg)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${job.rate}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: milestone.color }}
                      />
                    </div>
                    <div className="text-xs text-[--timeline-text-dim]">
                      → {lang === 'en' ? job.newJobs.en : job.newJobs.zh}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Social Impact */}
          {milestone.socialImpact && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[--timeline-text-muted] mb-3 uppercase tracking-wider">
                {lang === 'en' ? 'Social Impact' : '社会影响'}
              </h4>
              <div className="flex gap-3 flex-wrap">
                {milestone.socialImpact.gdp && (
                  <div className="px-4 py-2 rounded-lg" style={{ background: 'var(--timeline-panel-detail-bg)' }}>
                    <div className="text-xs text-[--timeline-text-dim]">GDP</div>
                    <div className="font-bold text-green-400">{milestone.socialImpact.gdp}</div>
                  </div>
                )}
                {milestone.socialImpact.productivity && (
                  <div className="px-4 py-2 rounded-lg" style={{ background: 'var(--timeline-panel-detail-bg)' }}>
                    <div className="text-xs text-[--timeline-text-dim]">{lang === 'en' ? 'Productivity' : '生产力'}</div>
                    <div className="font-bold text-blue-400">{milestone.socialImpact.productivity}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action hint */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--timeline-text-muted)' }}
          >
            <span>{t.close}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
