import type { Metadata } from 'next';
import Link from 'next/link';
import { decodeSharePayload, type SharePayload } from '@/lib/share_payload';

type SharePageProps = {
  params: Promise<{ payload: string }>;
};

function riskLabel(payload: SharePayload): string {
  const isZh = payload.lang === 'zh';
  if (payload.riskLevel === 'very-low') return isZh ? '极低风险' : 'Very Low Risk';
  if (payload.riskLevel === 'low') return isZh ? '低风险' : 'Low Risk';
  if (payload.riskLevel === 'medium') return isZh ? '中等风险' : 'Medium Risk';
  if (payload.riskLevel === 'high') return isZh ? '高风险' : 'High Risk';
  return isZh ? '极高风险' : 'Critical Risk';
}

function riskDescription(payload: SharePayload): string {
  const isZh = payload.lang === 'zh';
  return isZh
    ? `我的 AI 替代风险：${riskLabel(payload)}（${payload.replacementProbability}%），AI 斩杀线：${payload.predictedReplacementYear} 年。`
    : `My AI replacement risk is ${riskLabel(payload)} (${payload.replacementProbability}%), with an AI kill line around ${payload.predictedReplacementYear}.`;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { payload } = await params;
  const decoded = decodeSharePayload(payload);

  if (!decoded) {
    const title = 'JOBLESS - Shared AI Risk Result';
    const description = 'Open this result in JOBLESS to calculate and compare your AI replacement risk.';
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/opengraph-image'],
      },
    };
  }

  const title = decoded.lang === 'zh' ? `AI 风险结果：${riskLabel(decoded)}` : `AI Risk Result: ${riskLabel(decoded)}`;
  const description = riskDescription(decoded);
  const shareImageUrl = `/share/${payload}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: shareImageUrl, width: 1200, height: 630, alt: 'JOBLESS share card' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImageUrl],
    },
  };
}

export default async function ShareResultPage({ params }: SharePageProps) {
  const { payload } = await params;
  const result = decodeSharePayload(payload);

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full rounded-2xl border border-surface-elevated bg-surface/70 p-8 text-center">
          <h1 className="text-2xl font-bold">Invalid Share Link</h1>
          <p className="mt-3 text-foreground-muted">
            This result link is incomplete or expired. Open JOBLESS to create a new one.
          </p>
          <Link
            href="/#risk-calculator"
            className="inline-flex mt-6 rounded-xl bg-risk-high px-5 py-2.5 text-white font-semibold hover:bg-risk-high/85 transition-colors"
          >
            Open Calculator
          </Link>
        </div>
      </main>
    );
  }

  const isZh = result.lang === 'zh';

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full rounded-2xl border border-surface-elevated bg-surface/70 p-8">
        <div className="text-sm text-foreground-muted">
          {isZh ? '来自 JOBLESS 的分享结果' : 'Shared from JOBLESS'}
        </div>
        <h1 className="mt-2 text-3xl font-bold">{riskLabel(result)}</h1>
        <p className="mt-3 text-foreground-muted">{riskDescription(result)}</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-surface-elevated p-4">
            <div className="text-xs text-foreground-muted">{isZh ? '替代概率' : 'Replacement Probability'}</div>
            <div className="mt-1 text-2xl font-bold">{result.replacementProbability}%</div>
          </div>
          <div className="rounded-xl border border-surface-elevated p-4">
            <div className="text-xs text-foreground-muted">{isZh ? 'AI 斩杀线' : 'AI Kill Line'}</div>
            <div className="mt-1 text-2xl font-bold">{result.predictedReplacementYear}</div>
          </div>
          <div className="rounded-xl border border-surface-elevated p-4">
            <div className="text-xs text-foreground-muted">{isZh ? '当前程度' : 'Current Degree'}</div>
            <div className="mt-1 text-2xl font-bold">{result.currentReplacementDegree}%</div>
          </div>
        </div>

        <p className="mt-5 text-sm text-foreground-muted">
          {isZh
            ? `预测范围：${result.earliestYear} — ${result.latestYear}`
            : `Prediction range: ${result.earliestYear} — ${result.latestYear}`}
        </p>

        <Link
          href="/#risk-calculator"
          className="inline-flex mt-7 rounded-xl bg-risk-high px-5 py-2.5 text-white font-semibold hover:bg-risk-high/85 transition-colors"
        >
          {isZh ? '打开计算器' : 'Open Calculator'}
        </Link>
      </div>
    </main>
  );
}
