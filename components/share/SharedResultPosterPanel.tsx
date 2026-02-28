import type { CSSProperties } from 'react';
import { CheckCircle2, Eye, Target } from 'lucide-react';
import type { SharePayload } from '@/lib/share_payload';

type SharedResultPosterPanelProps = {
  data: Pick<
    SharePayload,
    | 'lang'
    | 'riskLevel'
    | 'replacementProbability'
    | 'predictedReplacementYear'
    | 'currentReplacementDegree'
    | 'earliestYear'
    | 'latestYear'
  > & {
    insights?: {
      primaryDriver: string;
      secondaryFactors: string[];
      protectionFactors: string[];
    };
    recommendations?: string[];
  };
  className?: string;
  headingMode?: 'label' | 'title';
};

function riskColor(level: SharePayload['riskLevel']): string {
  if (level === 'very-low') return '#22c55e';
  if (level === 'low') return '#00d66b';
  if (level === 'medium') return '#f59e0b';
  if (level === 'high') return '#f97316';
  return '#ff1744';
}

function riskLabel(level: SharePayload['riskLevel'], isZh: boolean): string {
  if (level === 'very-low') return isZh ? '极低风险' : 'Very Low Risk';
  if (level === 'low') return isZh ? '低风险' : 'Low Risk';
  if (level === 'medium') return isZh ? '中等风险' : 'Medium Risk';
  if (level === 'high') return isZh ? '高风险' : 'High Risk';
  return isZh ? '极高风险' : 'Critical Risk';
}

function riskDescription(level: SharePayload['riskLevel'], isZh: boolean): string {
  if (isZh) {
    if (level === 'very-low' || level === 'low') return '短期内被 AI 替代的概率较低';
    if (level === 'medium') return '处于可替代与转型并行的阶段';
    if (level === 'high') return '未来几年需快速完成能力升级';
    return '高风险区间，建议立即重构你的工作优势';
  }
  if (level === 'very-low' || level === 'low') return 'Low probability of AI replacement in the near term';
  if (level === 'medium') return 'Entering a transition phase with meaningful AI pressure';
  if (level === 'high') return 'Upskilling is needed quickly in the next few years';
  return 'High replacement pressure, act now to rebuild your advantage';
}

function fallbackInsights(level: SharePayload['riskLevel'], isZh: boolean) {
  if (isZh) {
    return {
      primaryDriver: level === 'very-low' || level === 'low' ? '人类协作与情境判断' : '流程标准化与数据化程度',
      secondaryFactors: ['数据开放度', '流程标准化'],
      protectionFactors: ['提升人类独特技能'],
    };
  }
  return {
    primaryDriver: level === 'very-low' || level === 'low' ? 'Human collaboration and context judgment' : 'Process standardization and data exposure',
    secondaryFactors: ['Data openness', 'Process standardization'],
    protectionFactors: ['Strengthen human-unique skills'],
  };
}

function fallbackRecommendations(level: SharePayload['riskLevel'], isZh: boolean): string[] {
  if (isZh) {
    const base = [
      '🤖 学会与 AI 协作，成为 “AI + Human” 复合型人才',
      '🌐 建立个人品牌和可信关系网络，强化不可替代性',
      '📚 持续跟踪行业 AI 工具，主动学习而不是被动适应',
    ];
    if (level === 'high' || level === 'critical') {
      base.unshift('⚡ 优先重构可重复工作环节，把时间转向高判断力任务');
    }
    return base.slice(0, 4);
  }
  const base = [
    '🤖 Learn to collaborate with AI and become an “AI + Human” contributor',
    '🌐 Build trust networks and a personal brand that tools cannot replace',
    '📚 Track new AI tools continuously and upskill proactively',
  ];
  if (level === 'high' || level === 'critical') {
    base.unshift('⚡ Redesign repetitive tasks first and shift to high-judgment work');
  }
  return base.slice(0, 4);
}

const panelStyle: CSSProperties = {
  background: 'linear-gradient(130deg, rgba(7,10,22,0.86), rgba(13,18,33,0.76))',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
};

function MetricCard({
  value,
  label,
  desc,
  color,
}: {
  value: string;
  label: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="rounded-3xl p-6" style={{ ...panelStyle, borderColor: `${color}66` }}>
      <div className="text-6xl font-bold mb-1" style={{ color, fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
      <div className="text-[15px] tracking-wide uppercase" style={{ color: 'rgba(223,227,240,0.82)' }}>
        {label}
      </div>
      <div className="text-sm mt-1" style={{ color: 'rgba(186,192,208,0.7)' }}>
        {desc}
      </div>
    </div>
  );
}

export default function SharedResultPosterPanel({
  data,
  className,
  headingMode = 'label',
}: SharedResultPosterPanelProps) {
  const isZh = data.lang === 'zh';
  const accent = riskColor(data.riskLevel);
  const insights = data.insights ?? fallbackInsights(data.riskLevel, isZh);
  const recommendations =
    data.recommendations && data.recommendations.length
      ? data.recommendations.slice(0, 4)
      : fallbackRecommendations(data.riskLevel, isZh);

  return (
    <div className={className ?? 'space-y-5'}>
      <div className="rounded-3xl p-7 text-left relative overflow-hidden" style={panelStyle}>
        <div
          className="absolute top-0 left-0 right-0 h-[4px]"
          style={{ background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.06))` }}
        />
        <div className="relative z-10">
          <div className="text-sm uppercase tracking-widest mb-3" style={{ color: 'rgba(196,201,214,0.78)' }}>
            {headingMode === 'title'
              ? isZh
                ? '你的 AI 风险结果'
                : 'YOUR AI RISK RESULT'
              : isZh
                ? '你的 AI 风险'
                : 'YOUR AI RISK'}
          </div>
          <div className="text-7xl font-bold leading-none mb-3" style={{ color: accent, fontFamily: 'var(--font-display)' }}>
            {riskLabel(data.riskLevel, isZh).toUpperCase()}
          </div>
          <div className="text-2xl" style={{ color: 'rgba(187,193,207,0.82)' }}>
            {riskDescription(data.riskLevel, isZh)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <MetricCard
          value={`${data.replacementProbability}%`}
          label={isZh ? '替代概率' : 'Replacement Probability'}
          desc={isZh ? '你的岗位被 AI 替代可能性' : 'Likelihood AI will replace your job'}
          color="#ff2a61"
        />
        <MetricCard
          value={`${data.predictedReplacementYear}`}
          label={isZh ? 'AI 斩杀线（年份）' : 'AI Kill Line Year'}
          desc={isZh ? '预计年份' : 'Projected'}
          color="#ff9e1a"
        />
        <MetricCard
          value={`${data.currentReplacementDegree}%`}
          label={isZh ? '当前程度' : 'Current Degree'}
          desc={isZh ? 'AI 当前可完成程度' : 'How much AI can already do now'}
          color="#55d9ee"
        />
      </div>

      <div className="rounded-3xl p-6 flex items-center justify-between" style={panelStyle}>
        <span className="text-xl" style={{ color: 'rgba(205,211,225,0.8)' }}>
          {isZh ? '预测范围' : 'Range'}
        </span>
        <span className="font-mono text-4xl font-bold" style={{ color: '#f3f5fa' }}>
          {data.earliestYear} — {data.latestYear}
        </span>
      </div>

      <div className="rounded-3xl p-6" style={panelStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)' }}
          >
            <Eye className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <h5 className="font-semibold text-3xl" style={{ color: '#f3f5fa' }}>
            {isZh ? 'Key Insights' : 'Key Insights'}
          </h5>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xl" style={{ color: 'rgba(203,208,222,0.85)' }}>
            <span>{isZh ? '主要风险驱动：' : 'Primary Risk Driver:'}</span>
            <span
              className="px-3 py-1 rounded-full"
              style={{ border: '1px solid rgba(122,126,255,0.55)', background: 'rgba(42,56,110,0.35)', color: '#eef1ff' }}
            >
              {insights.primaryDriver}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.secondaryFactors.map((factor, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-lg"
                style={{ border: '1px solid rgba(122,126,255,0.55)', background: 'rgba(42,56,110,0.28)', color: '#eef1ff' }}
              >
                {factor}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.protectionFactors.map((factor, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-lg"
                style={{ border: '1px solid rgba(40,204,128,0.45)', background: 'rgba(22,100,70,0.35)', color: '#35dd8b' }}
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-6" style={panelStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7, #fb7185)' }}
          >
            <Target className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <h5 className="font-semibold text-3xl" style={{ color: '#f3f5fa' }}>
            {isZh ? 'Recommendations' : 'Recommendations'}
          </h5>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-3 text-xl p-4 rounded-2xl"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,12,24,0.65)', color: '#ecf0fc' }}
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#2ddc89' }} />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
