import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { decodeSharePayload, type SharePayload } from '@/lib/share_payload';
import SharedResultPosterPanel from '@/components/share/SharedResultPosterPanel';

type SharePageProps = {
  params: Promise<{ payload: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

function pickFirst(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value) && value[0] && value[0].trim()) return value[0].trim();
  return null;
}

async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return process.env.NEXT_PUBLIC_BASE_URL || 'https://jobless.democra.ai';
  const proto = h.get('x-forwarded-proto') ?? (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function bypassSuffix(searchParams: Record<string, string | string[] | undefined> | undefined): string {
  const tokenFromUrl = pickFirst(searchParams?.['x-vercel-protection-bypass']);
  const secret = tokenFromUrl || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  return secret ? `?x-vercel-protection-bypass=${encodeURIComponent(secret)}` : '';
}

export async function generateMetadata({ params, searchParams }: SharePageProps): Promise<Metadata> {
  const { payload } = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const decoded = decodeSharePayload(payload);
  const bypass = bypassSuffix(resolvedSearch);
  const origin = await requestOrigin();

  if (!decoded) {
    const title = 'JOBLESS - Shared AI Risk Result';
    const description = 'Open this result in JOBLESS to calculate and compare your AI replacement risk.';
    const fallbackImage = `${origin}/opengraph-image${bypass}`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: fallbackImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [fallbackImage],
      },
    };
  }

  const title = decoded.lang === 'zh' ? `AI 风险结果：${riskLabel(decoded)}` : `AI Risk Result: ${riskLabel(decoded)}`;
  const description = riskDescription(decoded);
  const shareImageUrl = `${origin}/share/${payload}/opengraph-image${bypass}`;

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
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-12">
      <div className="max-w-[640px] mx-auto">
        <div className="mb-4 text-sm text-foreground-muted text-center">
          {isZh ? '来自 JOBLESS 的分享结果' : 'Shared from JOBLESS'}
        </div>
        <SharedResultPosterPanel
          data={{
            lang: result.lang,
            riskLevel: result.riskLevel,
            replacementProbability: result.replacementProbability,
            predictedReplacementYear: result.predictedReplacementYear,
            currentReplacementDegree: result.currentReplacementDegree,
            earliestYear: result.earliestYear,
            latestYear: result.latestYear,
            insights: result.v === 2 ? result.insights : undefined,
            recommendations: result.v === 2 ? result.recommendations : undefined,
          }}
          headingMode="title"
        />
        <div className="mt-8 flex justify-center">
          <Link
            href="/#risk-calculator"
            className="inline-flex rounded-xl bg-risk-high px-6 py-3 text-white font-semibold hover:bg-risk-high/85 transition-colors"
          >
            {isZh ? '打开计算器' : 'Open Calculator'}
          </Link>
        </div>
      </div>
    </main>
  );
}
