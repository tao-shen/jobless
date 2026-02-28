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
    <div className={className ?? 'space-y-6'}>
      <div className="result-card rounded-2xl p-8 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />
        <div className="relative z-10">
          {headingMode === 'title' ? (
            <div className="text-sm text-foreground-muted uppercase tracking-wider mb-2">
              {isZh ? '你的 AI 风险结果' : 'YOUR AI RISK RESULT'}
            </div>
          ) : (
            <div className="text-sm text-foreground-muted uppercase tracking-wider mb-3">
              {isZh ? '你的 AI 风险' : 'YOUR AI RISK'}
            </div>
          )}
          <div
            className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3"
            style={{ color: accent, fontFamily: 'var(--font-display)' }}
          >
            {riskLabel(data.riskLevel, isZh)}
          </div>
          <div className="text-sm text-foreground-muted">{riskDescription(data.riskLevel, isZh)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="result-card rounded-xl p-6 text-center">
          <div className="metric-value text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: 'var(--risk-critical)' }}>
            {data.replacementProbability}%
          </div>
          <div className="text-xs text-foreground-muted uppercase tracking-wider">
            {isZh ? '替代概率' : 'REPLACEMENT PROBABILITY'}
          </div>
          <div className="text-xs text-foreground-muted/60 mt-1">
            {isZh ? '你的岗位被 AI 替代可能性' : 'Likelihood AI will replace your job'}
          </div>
        </div>
        <div className="result-card rounded-xl p-6 text-center">
          <div className="metric-value text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: 'var(--risk-high)' }}>
            {data.predictedReplacementYear}
          </div>
          <div className="text-xs text-foreground-muted uppercase tracking-wider">
            {isZh ? 'AI 斩杀线（年份）' : 'AI KILL LINE (YEAR)'}
          </div>
          <div className="text-xs text-foreground-muted/60 mt-1">{isZh ? '预计年份' : 'Projected'}</div>
        </div>
        <div className="result-card rounded-xl p-6 text-center">
          <div className="metric-value text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: '#ff6e40' }}>
            {data.currentReplacementDegree}%
          </div>
          <div className="text-xs text-foreground-muted uppercase tracking-wider">
            {isZh ? '当前程度' : 'CURRENT DEGREE'}
          </div>
          <div className="text-xs text-foreground-muted/60 mt-1">
            {isZh ? 'AI 当前可完成程度' : 'How much AI can already do now'}
          </div>
        </div>
      </div>

      <div className="result-card rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-foreground-muted">{isZh ? '预测范围' : 'Prediction Range'}</span>
        <span className="font-mono font-bold text-lg">
          {data.earliestYear} — {data.latestYear}
        </span>
      </div>

      <div className="result-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <h5 className="font-semibold">{isZh ? '关键洞察' : 'Key Insights'}</h5>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-foreground-muted">{isZh ? '主要风险驱动：' : 'Primary Risk Driver:'}</span>
            <span className="insight-tag px-3 py-1 rounded-full font-medium">{insights.primaryDriver}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.secondaryFactors.map((factor, index) => (
              <span key={index} className="insight-tag px-3 py-1 rounded-full text-xs font-medium">
                {factor}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.protectionFactors.map((factor, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-risk-low/20 text-risk-low rounded-full text-xs font-medium border border-risk-low/30"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="result-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h5 className="font-semibold">{isZh ? '建议行动' : 'Recommendations'}</h5>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-3 text-sm p-3 rounded-lg bg-surface-card/50 border border-white/5"
            >
              <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
