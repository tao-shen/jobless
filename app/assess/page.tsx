'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Calendar, AlertTriangle, Shield, Target, Sparkles,
  Clock, BarChart3, CheckCircle2, ChevronRight, Database, FileText,
  Workflow, Bot, TrendingUp, Eye, Info, Zap, Brain, Activity
} from 'lucide-react';
import Link from 'next/link';
import { calculateAIRisk, RISK_LEVEL_INFO, RiskInputData, RiskOutputResult } from '@/lib/ai_risk_calculator_v2';

// 翻译类型
type Language = 'en' | 'zh';

const translations = {
  en: {
    title: 'AI Replacement Risk Assessment V2',
    subtitle: 'Data-driven prediction of AI impact on your career',
    backHome: '← Back to Home',

    // 步骤
    step1Title: 'Basic Information',
    step1Desc: 'Tell us about your work',
    step2Title: 'Four Core Dimensions',
    step2Desc: 'Assess your AI exposure factors',
    step3Title: 'Additional Context',
    step3Desc: 'Optional protective factors',
    step4Title: 'Assessment Result',
    step4Desc: 'Your three key metrics',

    // 基础信息
    jobTitle: 'Job Title',
    jobTitlePlaceholder: 'e.g., Software Engineer, Marketing Manager',
    industry: 'Industry',
    industryPlaceholder: 'Select your industry',
    yearsExp: 'Years of Experience',

    // 行业选项
    industries: {
      tech: 'Technology',
      finance: 'Finance & Banking',
      healthcare: 'Healthcare',
      education: 'Education',
      marketing: 'Marketing & Media',
      sales: 'Sales',
      customerService: 'Customer Service',
      admin: 'Administration',
      manufacturing: 'Manufacturing',
      legal: 'Legal',
      other: 'Other'
    },

    // 四个核心维度
    coreDimensions: 'Four Core Dimensions of AI Replacement Risk',
    coreDimensionsDesc: 'These dimensions determine how quickly and effectively AI can replace your work',

    dimension1: {
      title: 'Data Openness',
      desc: 'How accessible is the data needed for your work?',
      icon: 'database',
      low: 'Closed/Proprietary',
      high: 'Open/Public',
      detail: 'Training data availability determines AI learning speed'
    },
    dimension2: {
      title: 'Work Data Digitalization',
      desc: 'How digitized is your work input/output?',
      icon: 'file-text',
      low: 'Mostly Physical',
      high: 'Fully Digital',
      detail: 'Digital work is easier for AI to process'
    },
    dimension3: {
      title: 'Process Standardization',
      desc: 'How standardized and repeatable are your work processes?',
      icon: 'workflow',
      low: 'Highly Variable',
      high: 'Standardized',
      detail: 'Standardized processes are easier to automate'
    },
    dimension4: {
      title: 'Current AI Problem-Solving',
      desc: 'What percentage of your work can AI already handle?',
      icon: 'bot',
      low: '0%',
      high: '100%',
      detail: 'Current adoption shows proven AI capability'
    },

    // 额外上下文
    additionalContext: 'Additional Context (Optional)',
    additionalContextDesc: 'These factors can protect against AI replacement',

    context1: {
      title: 'Creative Requirement',
      desc: 'How much creativity does your work require?',
      low: 'Routine',
      high: 'Highly Creative'
    },
    context2: {
      title: 'Human Interaction',
      desc: 'How much person-to-person interaction is needed?',
      low: 'Minimal',
      high: 'Extensive'
    },
    context3: {
      title: 'Physical Operation',
      desc: 'Does your work require physical manipulation?',
      low: 'Fully Digital',
      high: 'Physical Work'
    },

    // 按钮
    nextStep: 'Next Step →',
    calculate: 'Calculate My Risk',
    startOver: 'Start Over',

    // 三个核心指标
    threeMetrics: 'Your Three Core Metrics',
    metric1: {
      title: 'Replacement Probability',
      desc: 'The likelihood that AI will replace your job',
      value: 'probability'
    },
    metric2: {
      title: 'Predicted Replacement Year',
      desc: 'When AI is likely to significantly impact your job',
      value: 'year'
    },
    metric3: {
      title: 'Current Replacement Degree',
      desc: 'How much of your work AI can already do',
      value: 'current'
    },

    // 详细分析
    detailedAnalysis: 'Detailed Analysis',
    automationPotential: 'Automation Potential',
    technicalFeasibility: 'Technical Feasibility',
    economicViability: 'Economic Viability',

    // 洞察
    insights: 'Key Insights',
    primaryDriver: 'Primary Risk Driver',
    secondaryFactors: 'Contributing Factors',
    protectionFactors: 'Protective Factors',
    recommendations: 'Recommendations',

    riskLevels: {
      'very-low': 'Very Low Risk',
      'low': 'Low Risk',
      'medium': 'Medium Risk',
      'high': 'High Risk',
      'critical': 'Critical Risk'
    }
  },
  zh: {
    title: 'AI替代风险评估 V2',
    subtitle: '基于数据驱动的职业AI影响预测',
    backHome: '← 返回首页',

    // 步骤
    step1Title: '基础信息',
    step1Desc: '告诉我们你的工作情况',
    step2Title: '四个核心维度',
    step2Desc: '评估你的AI暴露因素',
    step3Title: '额外上下文',
    step3Desc: '可选的保护因素',
    step4Title: '评估结果',
    step4Desc: '你的三个核心指标',

    // 基础信息
    jobTitle: '职位名称',
    jobTitlePlaceholder: '例如：软件工程师、市场经理',
    industry: '行业',
    industryPlaceholder: '选择你的行业',
    yearsExp: '工作年限',

    // 行业选项
    industries: {
      tech: '科技/互联网',
      finance: '金融/银行',
      healthcare: '医疗健康',
      education: '教育',
      marketing: '营销/媒体',
      sales: '销售',
      customerService: '客服',
      admin: '行政/文秘',
      manufacturing: '制造业',
      legal: '法律',
      other: '其他'
    },

    // 四个核心维度
    coreDimensions: 'AI替代风险的四个核心维度',
    coreDimensionsDesc: '这些维度决定了AI能多快、多有效地替代你的工作',

    dimension1: {
      title: '数据开放程度',
      desc: '你工作所需的数据可获取性如何？',
      icon: 'database',
      low: '封闭/私有',
      high: '开放/公开',
      detail: '训练数据的可获得性决定AI学习速度'
    },
    dimension2: {
      title: '工作数据数字化程度',
      desc: '你的工作输入/输出数字化程度如何？',
      icon: 'file-text',
      low: '主要依赖实体',
      high: '完全数字化',
      detail: '数字化工作更容易被AI处理'
    },
    dimension3: {
      title: '流程标准化程度',
      desc: '你的工作流程标准化和可重复程度如何？',
      icon: 'workflow',
      low: '高度变化',
      high: '标准化',
      detail: '标准化流程更容易自动化'
    },
    dimension4: {
      title: '当前AI解决问题占比',
      desc: 'AI目前已经能处理你工作的百分之多少？',
      icon: 'bot',
      low: '0%',
      high: '100%',
      detail: '当前采用率反映已验证的AI能力'
    },

    // 额外上下文
    additionalContext: '额外上下文（可选）',
    additionalContextDesc: '这些因素可以防御AI替代',

    context1: {
      title: '创造性要求',
      desc: '你的工作需要多少创造力？',
      low: '常规性',
      high: '高度创造性'
    },
    context2: {
      title: '人际交互',
      desc: '需要多少人与人之间的互动？',
      low: '极少',
      high: '大量'
    },
    context3: {
      title: '物理操作',
      desc: '你的工作是否需要物理操作？',
      low: '全数字化',
      high: '物理工作'
    },

    // 按钮
    nextStep: '下一步 →',
    calculate: '计算我的风险',
    startOver: '重新评估',

    // 三个核心指标
    threeMetrics: '你的三个核心指标',
    metric1: {
      title: '被AI替代的概率',
      desc: 'AI替代你工作的可能性',
      value: 'probability'
    },
    metric2: {
      title: '预测被AI替代的年份',
      desc: 'AI可能显著影响你工作的时间',
      value: 'year'
    },
    metric3: {
      title: '当前被AI替代的程度',
      desc: 'AI目前能完成你工作的比例',
      value: 'current'
    },

    // 详细分析
    detailedAnalysis: '详细分析',
    automationPotential: '自动化潜力',
    technicalFeasibility: '技术可行性',
    economicViability: '经济可行性',

    // 洞察
    insights: '关键洞察',
    primaryDriver: '主要风险驱动因素',
    secondaryFactors: '次要因素',
    protectionFactors: '保护因素',
    recommendations: '行动建议',

    riskLevels: {
      'very-low': '极低风险',
      'low': '低风险',
      'medium': '中等风险',
      'high': '高风险',
      'critical': '极高风险'
    }
  }
};

// 维度滑块组件
function DimensionSlider({
  title,
  desc,
  detail,
  value,
  onChange,
  lowLabel,
  highLabel,
  icon,
  color
}: {
  title: string;
  desc: string;
  detail: string;
  value: number;
  onChange: (val: number) => void;
  lowLabel: string;
  highLabel: string;
  icon: 'database' | 'file-text' | 'workflow' | 'bot';
  color: string;
}) {
  const icons = {
    database: Database,
    'file-text': FileText,
    workflow: Workflow,
    bot: Bot
  };
  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl p-6 border border-surface-elevated hover:border-opacity-50 transition-all"
      style={{ borderColor: color }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-foreground-muted text-sm mb-2">{desc}</p>
          <p className="text-xs text-foreground-muted opacity-70">{detail}</p>
        </div>
      </div>

      <div className="space-y-3">
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
          className="w-full h-3 bg-surface-elevated rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, var(--surface-elevated) ${value}%, var(--surface-elevated) 100%)`
          }}
        />
      </div>
    </motion.div>
  );
}

// 步骤指示器
function StepIndicator({ currentStep, totalSteps, lang }: { currentStep: number; totalSteps: number; lang: Language }) {
  const t = translations[lang];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
            i < currentStep ? 'bg-risk-high text-white' :
            i === currentStep ? 'bg-risk-high text-white scale-110 shadow-lg shadow-risk-high/30' :
            'bg-surface-elevated text-foreground-muted'
          }`}>
            {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-8 h-0.5 mx-0.5 rounded ${i < currentStep ? 'bg-risk-high' : 'bg-surface-elevated'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// 指标卡片组件
function MetricCard({
  title,
  desc,
  value,
  unit,
  color,
  icon: Icon
}: {
  title: string;
  desc: string;
  value: string | number;
  unit?: string;
  color: string;
  icon: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface rounded-2xl p-6 border-2 border-surface-elevated relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: `radial-gradient(circle at top right, ${color}, transparent)` }} />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <h3 className="font-bold text-sm">{title}</h3>
          <p className="text-xs text-foreground-muted">{desc}</p>
        </div>
      </div>

      <div className="text-center py-4">
        <div className="text-4xl md:text-5xl font-bold" style={{ color }}>
          {value}
          {unit && <span className="text-lg ml-1">{unit}</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default function AssessPage() {
  const [lang, setLang] = useState<Language>('zh');
  const t = translations[lang];
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<RiskOutputResult | null>(null);

  const [formData, setFormData] = useState<RiskInputData>({
    jobTitle: '',
    industry: '',
    yearsOfExperience: 0,

    // 四个核心维度
    dataOpenness: 50,
    workDataDigitalization: 50,
    processStandardization: 50,
    currentAIAdoption: 20,

    // 额外上下文
    creativeRequirement: 50,
    humanInteraction: 50,
    physicalOperation: 50
  });

  const updateDimension = (field: keyof RiskInputData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const assessment = calculateAIRisk(formData);
    setResult(assessment);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-surface-elevated">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>{t.backHome}</span>
          </Link>
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="px-3 py-1.5 rounded-lg bg-surface-elevated text-sm font-medium hover:bg-surface-elevated/80 transition-colors"
          >
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-risk-high/20 text-risk-high px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              <span>V2.0 新模型</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">
              {t.title}
            </h1>
            <p className="text-foreground-muted">
              {t.subtitle}
            </p>
          </motion.div>

          {/* 步骤指示器 */}
          <StepIndicator currentStep={step} totalSteps={4} lang={lang} />

          {/* 步骤1: 基础信息 */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface rounded-2xl p-8 border border-surface-elevated"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-risk-high/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-risk-high" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t.step1Title}</h2>
                  <p className="text-foreground-muted text-sm">{t.step1Desc}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.jobTitle}</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder={t.jobTitlePlaceholder}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-surface-elevated focus:border-risk-high focus:ring-1 focus:ring-risk-high outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.industry}</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-surface-elevated focus:border-risk-high focus:ring-1 focus:ring-risk-high outline-none transition-all"
                  >
                    <option value="">{t.industryPlaceholder}</option>
                    {Object.entries(t.industries).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.yearsExp}</label>
                  <select
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-surface-elevated focus:border-risk-high focus:ring-1 focus:ring-risk-high outline-none transition-all"
                  >
                    <option value="0">0-1年</option>
                    <option value="2">1-3年</option>
                    <option value="4">3-5年</option>
                    <option value="7">5-10年</option>
                    <option value="10">10年以上</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.jobTitle || !formData.industry}
                className="w-full mt-8 bg-risk-high hover:bg-risk-high/90 disabled:bg-surface-elevated disabled:text-foreground-muted text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {t.nextStep}
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* 步骤2: 四个核心维度 */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface rounded-2xl p-6 border border-surface-elevated text-center mb-6">
                <Brain className="w-8 h-8 text-risk-high mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-2">{t.coreDimensions}</h2>
                <p className="text-foreground-muted text-sm">{t.coreDimensionsDesc}</p>
              </div>

              <DimensionSlider
                title={t.dimension1.title}
                desc={t.dimension1.desc}
                detail={t.dimension1.detail}
                value={formData.dataOpenness}
                onChange={(v) => updateDimension('dataOpenness', v)}
                lowLabel={t.dimension1.low}
                highLabel={t.dimension1.high}
                icon="database"
                color="#6366f1"
              />

              <DimensionSlider
                title={t.dimension2.title}
                desc={t.dimension2.desc}
                detail={t.dimension2.detail}
                value={formData.workDataDigitalization}
                onChange={(v) => updateDimension('workDataDigitalization', v)}
                lowLabel={t.dimension2.low}
                highLabel={t.dimension2.high}
                icon="file-text"
                color="#8b5cf6"
              />

              <DimensionSlider
                title={t.dimension3.title}
                desc={t.dimension3.desc}
                detail={t.dimension3.detail}
                value={formData.processStandardization}
                onChange={(v) => updateDimension('processStandardization', v)}
                lowLabel={t.dimension3.low}
                highLabel={t.dimension3.high}
                icon="workflow"
                color="#ec4899"
              />

              <DimensionSlider
                title={t.dimension4.title}
                desc={t.dimension4.desc}
                detail={t.dimension4.detail}
                value={formData.currentAIAdoption}
                onChange={(v) => updateDimension('currentAIAdoption', v)}
                lowLabel={t.dimension4.low}
                highLabel={t.dimension4.high}
                icon="bot"
                color="#f43f5e"
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-surface-elevated hover:bg-surface-elevated/80 py-4 rounded-xl font-semibold transition-all"
                >
                  ← {lang === 'en' ? 'Previous' : '上一步'}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-risk-high hover:bg-risk-high/90 text-white py-4 rounded-xl font-semibold transition-all"
                >
                  {t.nextStep}
                  <ChevronRight className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 步骤3: 额外上下文 */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface rounded-2xl p-6 border border-surface-elevated text-center mb-6">
                <Shield className="w-8 h-8 text-risk-low mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-2">{t.additionalContext}</h2>
                <p className="text-foreground-muted text-sm">{t.additionalContextDesc}</p>
              </div>

              <DimensionSlider
                title={t.context1.title}
                desc={t.context1.desc}
                detail=""
                value={formData.creativeRequirement!}
                onChange={(v) => updateDimension('creativeRequirement', v)}
                lowLabel={t.context1.low}
                highLabel={t.context1.high}
                icon="workflow"
                color="#30d158"
              />

              <DimensionSlider
                title={t.context2.title}
                desc={t.context2.desc}
                detail=""
                value={formData.humanInteraction!}
                onChange={(v) => updateDimension('humanInteraction', v)}
                lowLabel={t.context2.low}
                highLabel={t.context2.high}
                icon="file-text"
                color="#30d158"
              />

              <DimensionSlider
                title={t.context3.title}
                desc={t.context3.desc}
                detail=""
                value={formData.physicalOperation!}
                onChange={(v) => updateDimension('physicalOperation', v)}
                lowLabel={t.context3.low}
                highLabel={t.context3.high}
                icon="database"
                color="#30d158"
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-surface-elevated hover:bg-surface-elevated/80 py-4 rounded-xl font-semibold transition-all"
                >
                  ← {lang === 'en' ? 'Previous' : '上一步'}
                </button>
                <button
                  onClick={handleCalculate}
                  className="flex-1 bg-gradient-to-r from-risk-high to-risk-medium hover:from-risk-high/90 hover:to-risk-medium/90 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  {t.calculate}
                </button>
              </div>
            </motion.div>
          )}

          {/* 步骤4: 结果 */}
          {step === 4 && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* 风险等级 */}
              <div className="bg-surface rounded-2xl p-6 border-2 text-center" style={{ borderColor: RISK_LEVEL_INFO[result.riskLevel].color }}>
                <div className="text-sm text-foreground-muted mb-2">{formData.jobTitle}</div>
                <div className="text-2xl font-bold mb-1" style={{ color: RISK_LEVEL_INFO[result.riskLevel].color }}>
                  {t.riskLevels[result.riskLevel]}
                </div>
                <p className="text-xs text-foreground-muted">{RISK_LEVEL_INFO[result.riskLevel].description[lang]}</p>
              </div>

              {/* 三个核心指标 */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-risk-high" />
                  {t.threeMetrics}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    title={t.metric1.title}
                    desc={t.metric1.desc}
                    value={result.replacementProbability}
                    unit="%"
                    color="#f43f5e"
                    icon={Activity}
                  />
                  <MetricCard
                    title={t.metric2.title}
                    desc={t.metric2.desc}
                    value={result.predictedReplacementYear}
                    color="#f59e0b"
                    icon={Calendar}
                  />
                  <MetricCard
                    title={t.metric3.title}
                    desc={t.metric3.desc}
                    value={result.currentReplacementDegree}
                    unit="%"
                    color="#6366f1"
                    icon={Bot}
                  />
                </div>
              </div>

              {/* 置信区间 */}
              <div className="bg-surface rounded-xl p-4 border border-surface-elevated">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">
                    {lang === 'en' ? 'Prediction Range:' : '预测范围:'}
                  </span>
                  <span className="font-mono font-bold">
                    {result.confidenceInterval.earliest} - {result.confidenceInterval.latest}
                  </span>
                </div>
              </div>

              {/* 洞察 */}
              <div className="bg-surface rounded-2xl p-6 border border-surface-elevated">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-data-blue" />
                  {t.insights}
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-foreground-muted mb-1">{t.primaryDriver}</div>
                    <div className="font-semibold text-risk-high">{result.insights.primaryDriver}</div>
                  </div>

                  <div>
                    <div className="text-xs text-foreground-muted mb-1">{t.secondaryFactors}</div>
                    <div className="flex flex-wrap gap-2">
                      {result.insights.secondaryFactors.map((factor, i) => (
                        <span key={i} className="px-2 py-1 bg-risk-high/10 text-risk-high text-xs rounded">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-foreground-muted mb-1">{t.protectionFactors}</div>
                    <div className="flex flex-wrap gap-2">
                      {result.insights.protectionFactors.map((factor, i) => (
                        <span key={i} className="px-2 py-1 bg-risk-low/20 text-risk-low text-xs rounded">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 建议 */}
              <div className="bg-surface rounded-2xl p-6 border border-surface-elevated">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-data-blue" />
                  {t.recommendations}
                </h3>
                <div className="space-y-2">
                  {result.insights.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 重新开始 */}
              <button
                onClick={() => {
                  setStep(1);
                  setResult(null);
                  setFormData({
                    jobTitle: '',
                    industry: '',
                    yearsOfExperience: 0,
                    dataOpenness: 50,
                    workDataDigitalization: 50,
                    processStandardization: 50,
                    currentAIAdoption: 20,
                    creativeRequirement: 50,
                    humanInteraction: 50,
                    physicalOperation: 50
                  });
                }}
                className="w-full bg-surface-elevated hover:bg-surface-elevated/80 py-4 rounded-xl font-semibold transition-all"
              >
                {t.startOver}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
