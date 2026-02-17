/**
 * AI替代风险评估模型 V2
 *
 * 新的评估维度：
 * 1. 数据的开放程度 - 工作相关数据的可获取性
 * 2. 工作数据的开放程度 - 工作成果/过程数据的数字化程度
 * 3. 流程的标准化程度 - 工作流程是否标准化、可重复
 * 4. AI在实际工作中能解决问题的占比 - 当前AI能替代的工作比例
 *
 * 输出三个指标：
 * 1. 被AI替代的概率 (0-100%)
 * 2. 预测被AI替代的年份
 * 3. 当前被AI替代的程度 (0-100%)
 */

export type Language = 'en' | 'zh';

export interface RiskInputData {
  // 基础信息
  jobTitle: string;
  industry: string;
  yearsOfExperience: number;

  // 新的四个核心维度
  dataOpenness: number;           // 数据的开放程度 (0-100)
  workDataDigitalization: number;  // 工作数据的开放程度/数字化程度 (0-100)
  processStandardization: number;  // 流程的标准化程度 (0-100)
  currentAIAdoption: number;       // 当前AI能解决问题的占比 (0-100)

  // 额外上下文信息（可选）
  creativeRequirement?: number;    // 创造性要求 (0-100)
  humanInteraction?: number;       // 人际交互需求 (0-100)
  physicalOperation?: number;      // 物理操作需求 (0-100)
}

export interface RiskOutputResult {
  // 三个核心指标
  replacementProbability: number;      // 被AI替代的概率 (0-100%)
  predictedReplacementYear: number;    // 预测被AI替代的年份
  currentReplacementDegree: number;    // 当前被AI替代的程度 (0-100%)

  // 风险等级
  riskLevel: 'very-low' | 'low' | 'medium' | 'high' | 'critical';

  // 置信区间
  confidenceInterval: {
    earliest: number;
    latest: number;
  };

  // 详细分析
  detailedAnalysis: {
    automationPotential: number;       // 自动化潜力
    technicalFeasibility: number;      // 技术可行性
    economicViability: number;         // 经济可行性
    timelineAcceleration: number;      // 时间加速因子
  };

  // 关键洞察
  insights: {
    primaryDriver: string;             // 主要驱动因素
    secondaryFactors: string[];        // 次要因素
    protectionFactors: string[];       // 保护因素
    recommendations: string[];         // 建议
  };
}

// Localization strings
const DIMENSION_NAMES = {
  dataOpenness: { en: 'Data Openness', zh: '数据开放程度' },
  workDataDigitalization: { en: 'Work Data Digitalization', zh: '工作数据数字化' },
  processStandardization: { en: 'Process Standardization', zh: '流程标准化' },
  currentAIAdoption: { en: 'Current AI Adoption', zh: '当前AI采用' },
};

const PROTECTION_FACTORS = {
  highCreative: { en: 'High creative requirements', zh: '高创造性要求' },
  highInteraction: { en: 'Strong human interaction needs', zh: '强人际交互需求' },
  highPhysical: { en: 'Essential physical operation', zh: '必要物理操作' },
  noProtection: { en: 'No obvious protection factors - strengthen human-unique skills', zh: '无明显保护因素 - 需要加强人类独有技能' },
};

const RECOMMENDATIONS = {
  highDataOpenness: {
    en: '🎯 Your work data is highly open, consider: Develop advanced data processing and interpretation skills',
    zh: '🎯 你的工作数据高度开放，建议：培养数据处理和解读的高级能力'
  },
  digitalNotAdopted: {
    en: '⚡ Work is highly digitized but AI adoption is low, consider: Proactively learn AI tools, become an early adopter',
    zh: '⚡ 工作已高度数字化但AI采用率低，建议：主动学习AI工具，成为early adopter'
  },
  highStandardization: {
    en: '🔄 High process standardization, consider: Shift to process design, monitoring, optimization and other high-level work',
    zh: '🔄 工作流程标准化程度高，建议：转向流程设计、监控、优化等高阶工作'
  },
  lowCreative: {
    en: '💡 Low creative requirements, consider: Proactively take on tasks requiring creativity and judgment',
    zh: '💡 创造性要求较低，建议：主动承担需要创意和判断的任务'
  },
  generic1: {
    en: '🤖 Learn to collaborate with AI, become an "AI + Human" super individual',
    zh: '🤖 学会与AI协作，成为"AI+人类"的超级个体'
  },
  generic2: {
    en: '🌐 Build personal brand and trust relationships - AI cannot replace human networks',
    zh: '🌐 建立个人品牌和信任关系 - AI无法替代人际网络'
  },
  generic3: {
    en: '📚 Continuously monitor industry AI tool developments - Learn proactively, don\'t adapt passively',
    zh: '📚 持续关注行业AI工具发展 - 主动学习而非被动适应'
  },
};

/**
 * AI能力进化基准数据
 */
const AI_EVOLUTION_BENCHMARKS = {
  baselineGrowthRate: 15,
  accelerationFactor: 1.2,
  currentYear: new Date().getFullYear(),
};

/**
 * 行业风险系数
 */
const INDUSTRY_RISK_FACTORS: Record<string, {
  dataOpennessWeight: number;
  automationTrend: number;
  adoptionSpeed: number;
}> = {
  'tech': { dataOpennessWeight: 0.9, automationTrend: 0.8, adoptionSpeed: 0.9 },
  'finance': { dataOpennessWeight: 0.85, automationTrend: 0.75, adoptionSpeed: 0.8 },
  'marketing': { dataOpennessWeight: 0.7, automationTrend: 0.7, adoptionSpeed: 0.85 },
  'customerService': { dataOpennessWeight: 0.8, automationTrend: 0.9, adoptionSpeed: 0.95 },
  'admin': { dataOpennessWeight: 0.85, automationTrend: 0.85, adoptionSpeed: 0.9 },
  'manufacturing': { dataOpennessWeight: 0.6, automationTrend: 0.8, adoptionSpeed: 0.7 },
  'healthcare': { dataOpennessWeight: 0.4, automationTrend: 0.5, adoptionSpeed: 0.5 },
  'education': { dataOpennessWeight: 0.5, automationTrend: 0.4, adoptionSpeed: 0.5 },
  'legal': { dataOpennessWeight: 0.6, automationTrend: 0.5, adoptionSpeed: 0.6 },
  'sales': { dataOpennessWeight: 0.65, automationTrend: 0.6, adoptionSpeed: 0.7 },
  'other': { dataOpennessWeight: 0.5, automationTrend: 0.5, adoptionSpeed: 0.5 },
};

function calculateReplacementProbability(data: RiskInputData): number {
  const { dataOpenness, workDataDigitalization, processStandardization, currentAIAdoption } = data;

  const weights = {
    dataOpenness: 0.25,
    workDataDigitalization: 0.30,
    processStandardization: 0.25,
    currentAIAdoption: 0.20,
  };

  const industryFactor = INDUSTRY_RISK_FACTORS[data.industry] || INDUSTRY_RISK_FACTORS['other'];

  let baseProbability = (
    dataOpenness * weights.dataOpenness +
    workDataDigitalization * weights.workDataDigitalization +
    processStandardization * weights.processStandardization +
    currentAIAdoption * weights.currentAIAdoption
  );

  baseProbability *= (0.8 + industryFactor.dataOpennessWeight * 0.2);

  const protectionFactors = {
    creative: (data.creativeRequirement || 50) / 100,
    interaction: (data.humanInteraction || 50) / 100,
    physical: (data.physicalOperation || 50) / 100,
  };

  const protectionScore = (
    protectionFactors.creative * 0.4 +
    protectionFactors.interaction * 0.4 +
    protectionFactors.physical * 0.2
  );

  baseProbability *= (1 - protectionScore * 0.3);

  return Math.min(100, Math.max(0, baseProbability));
}

function predictReplacementYear(data: RiskInputData, probability: number): {
  year: number;
  confidenceInterval: { earliest: number; latest: number };
} {
  const currentYear = AI_EVOLUTION_BENCHMARKS.currentYear;

  if (probability < 20) {
    return {
      year: currentYear + 20,
      confidenceInterval: { earliest: currentYear + 15, latest: currentYear + 30 }
    };
  }

  if (probability > 80) {
    return {
      year: currentYear + 2,
      confidenceInterval: { earliest: currentYear + 1, latest: currentYear + 4 }
    };
  }

  const remainingToFull = 100 - data.currentAIAdoption;
  const dataAccelerator = 1 + (data.dataOpenness / 100) * 0.5;
  const deploymentAccelerator = 1 + (data.processStandardization / 100) * 0.3;
  const totalAccelerator = dataAccelerator * deploymentAccelerator * AI_EVOLUTION_BENCHMARKS.accelerationFactor;
  const baseGrowthRate = AI_EVOLUTION_BENCHMARKS.baselineGrowthRate * totalAccelerator;
  const growthSlowdown = 1 + Math.log(100 / (remainingToFull + 1)) * 0.2;
  const effectiveGrowthRate = baseGrowthRate / growthSlowdown;
  const estimatedYears = Math.max(1, Math.ceil(remainingToFull / effectiveGrowthRate));
  const predictedYear = currentYear + estimatedYears;

  const uncertainty = 0.4;
  const earliest = currentYear + Math.ceil(estimatedYears * (1 - uncertainty));
  const latest = currentYear + Math.ceil(estimatedYears * (1 + uncertainty));

  return {
    year: predictedYear,
    confidenceInterval: { earliest, latest }
  };
}

function calculateCurrentReplacementDegree(data: RiskInputData): number {
  const { currentAIAdoption, workDataDigitalization, processStandardization } = data;

  const reportedDegree = currentAIAdoption;
  const adoptionEfficiency = 0.7;
  const dataEffectiveness = workDataDigitalization / 100;
  const processCoverage = processStandardization / 100;
  const actualDegree = reportedDegree * adoptionEfficiency * dataEffectiveness * processCoverage;

  return Math.min(100, Math.max(0, actualDegree));
}

function determineRiskLevel(probability: number): RiskOutputResult['riskLevel'] {
  if (probability >= 80) return 'critical';
  if (probability >= 60) return 'high';
  if (probability >= 40) return 'medium';
  if (probability >= 20) return 'low';
  return 'very-low';
}

function generateInsights(data: RiskInputData, probability: number, currentDegree: number, lang: Language): RiskOutputResult['insights'] {
  const { dataOpenness, workDataDigitalization, processStandardization, currentAIAdoption } = data;

  // 识别主要驱动因素 - 使用本地化名称
  const factors = [
    { key: 'dataOpenness' as const, name: DIMENSION_NAMES.dataOpenness[lang], value: dataOpenness, weight: 0.25 },
    { key: 'workDataDigitalization' as const, name: DIMENSION_NAMES.workDataDigitalization[lang], value: workDataDigitalization, weight: 0.30 },
    { key: 'processStandardization' as const, name: DIMENSION_NAMES.processStandardization[lang], value: processStandardization, weight: 0.25 },
    { key: 'currentAIAdoption' as const, name: DIMENSION_NAMES.currentAIAdoption[lang], value: currentAIAdoption, weight: 0.20 },
  ];

  factors.sort((a, b) => (b.value * b.weight) - (a.value * a.weight));

  const primaryDriver = factors[0].name;
  const secondaryFactors = factors.slice(1, 3).map(f => f.name);

  // 识别保护因素 - 使用本地化文本
  const protectionFactors: string[] = [];
  if (data.creativeRequirement && data.creativeRequirement > 60) {
    protectionFactors.push(PROTECTION_FACTORS.highCreative[lang]);
  }
  if (data.humanInteraction && data.humanInteraction > 60) {
    protectionFactors.push(PROTECTION_FACTORS.highInteraction[lang]);
  }
  if (data.physicalOperation && data.physicalOperation > 60) {
    protectionFactors.push(PROTECTION_FACTORS.highPhysical[lang]);
  }

  if (protectionFactors.length === 0) {
    protectionFactors.push(PROTECTION_FACTORS.noProtection[lang]);
  }

  // 生成建议 - 使用本地化文本
  const recommendations: string[] = [];

  // 针对不同风险等级和情境的建议
  if (probability >= 40 && probability <= 70) {
    // 中等风险：考虑协作路径
    recommendations.push(
      lang === 'en'
        ? '🔄 Consider "human-AI collaboration" path - Work with AI to enhance efficiency'
        : '🔄 考虑"人机协作"路径 - 与AI协同提升效率'
    );
    recommendations.push(
      lang === 'en'
        ? '📈 Pay attention to "augmentation-type" job transformation opportunities in your industry'
        : '📈 关注行业中的"增强型"岗位转型机会'
    );
  }

  // 计算保护因素得分
  const protectionScore = (
    ((data.creativeRequirement || 50) / 100) * 0.4 +
    ((data.humanInteraction || 50) / 100) * 0.4 +
    ((data.physicalOperation || 50) / 100) * 0.2
  );

  // 对于有保护因素的用户
  if (protectionScore > 0.5) {
    recommendations.push(
      lang === 'en'
        ? '💪 Your protection factors are strong - AI is more likely to be an assistant than a replacement'
        : '💪 你的保护因素较强，AI更可能是助手而非替代者'
    );
  }

  // 基于维度的具体建议
  if (dataOpenness > 70) {
    recommendations.push(RECOMMENDATIONS.highDataOpenness[lang]);
  }
  if (workDataDigitalization > 70 && currentAIAdoption < 30) {
    recommendations.push(RECOMMENDATIONS.digitalNotAdopted[lang]);
  }
  if (processStandardization > 70) {
    recommendations.push(RECOMMENDATIONS.highStandardization[lang]);
  }
  if (data.creativeRequirement && data.creativeRequirement < 40) {
    recommendations.push(RECOMMENDATIONS.lowCreative[lang]);
  }

  // 通用建议
  recommendations.push(
    RECOMMENDATIONS.generic1[lang],
    RECOMMENDATIONS.generic2[lang],
    RECOMMENDATIONS.generic3[lang]
  );

  return {
    primaryDriver,
    secondaryFactors,
    protectionFactors,
    recommendations: recommendations.slice(0, 6)
  };
}

/**
 * 主函数：计算AI替代风险
 * @param data 输入数据
 * @param lang 语言 ('en' | 'zh')
 */
export function calculateAIRisk(data: RiskInputData, lang: Language = 'en'): RiskOutputResult {
  const replacementProbability = calculateReplacementProbability(data);
  const { year, confidenceInterval } = predictReplacementYear(data, replacementProbability);
  const currentReplacementDegree = calculateCurrentReplacementDegree(data);
  const riskLevel = determineRiskLevel(replacementProbability);

  const detailedAnalysis = {
    automationPotential: Math.min(100, (
      data.workDataDigitalization * 0.4 +
      data.processStandardization * 0.4 +
      data.dataOpenness * 0.2
    )),
    technicalFeasibility: Math.min(100, (
      data.currentAIAdoption * 0.5 +
      data.processStandardization * 0.3 +
      data.workDataDigitalization * 0.2
    )),
    economicViability: Math.min(100, (
      data.processStandardization * 0.5 +
      data.workDataDigitalization * 0.3 +
      (100 - (data.creativeRequirement || 50)) * 0.2
    )),
    timelineAcceleration: Math.min(200, (
      (data.dataOpenness / 100) * 50 +
      (data.processStandardization / 100) * 30 +
      (data.workDataDigitalization / 100) * 20 +
      100
    )),
  };

  const insights = generateInsights(data, replacementProbability, currentReplacementDegree, lang);

  return {
    replacementProbability: Math.round(replacementProbability),
    predictedReplacementYear: year,
    currentReplacementDegree: Math.round(currentReplacementDegree),
    riskLevel,
    confidenceInterval,
    detailedAnalysis,
    insights
  };
}

/**
 * 风险等级对应的显示信息
 */
export const RISK_LEVEL_INFO = {
  'very-low': {
    label: { en: 'Very Low Risk', zh: '极低风险' },
    color: '#30d158',
    description: { en: 'Your job has strong protection against AI replacement', zh: '你的工作具有较强的AI替代防御能力' }
  },
  'low': {
    label: { en: 'Low Risk', zh: '低风险' },
    color: '#64d2ff',
    description: { en: 'Low probability of AI replacement in the near term', zh: '短期内AI替代概率较低' }
  },
  'medium': {
    label: { en: 'Medium Risk', zh: '中等风险' },
    color: '#ff9500',
    description: { en: 'Some parts of your job may be automated', zh: '你的工作部分内容可能被自动化' }
  },
  'high': {
    label: { en: 'High Risk', zh: '高风险' },
    color: '#ff6b35',
    description: { en: 'Significant risk of AI replacement', zh: '存在显著的AI替代风险' }
  },
  'critical': {
    label: { en: 'Critical Risk', zh: '极高风险' },
    color: '#ff2d37',
    description: { en: 'Very high probability of AI replacement', zh: 'AI替代概率极高' }
  }
};
