import { ImageResponse } from 'next/og';
import { decodeSharePayload, type SharePayload } from '@/lib/share_payload';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };
export const alt = 'JOBLESS Share Result';

type ShareOgProps = {
  params: Promise<{ payload: string }>;
};

function riskLabel(payload: SharePayload): string {
  const isZh = payload.lang === 'zh';
  if (payload.riskLevel === 'very-low') return isZh ? '极低风险' : 'VERY LOW';
  if (payload.riskLevel === 'low') return isZh ? '低风险' : 'LOW RISK';
  if (payload.riskLevel === 'medium') return isZh ? '中等风险' : 'MEDIUM';
  if (payload.riskLevel === 'high') return isZh ? '高风险' : 'HIGH RISK';
  return isZh ? '极高风险' : 'CRITICAL';
}

function riskColor(level: SharePayload['riskLevel']): string {
  if (level === 'very-low') return '#22c55e';
  if (level === 'low') return '#84cc16';
  if (level === 'medium') return '#f59e0b';
  if (level === 'high') return '#f97316';
  return '#ff1744';
}

export default async function Image({ params }: ShareOgProps) {
  const { payload } = await params;
  const data = decodeSharePayload(payload);

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #050507 0%, #0d0b10 40%, #15121a 100%)',
            color: '#fafafa',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 800 }}>JOBLESS</div>
          <div style={{ fontSize: 30, opacity: 0.85, marginTop: 10 }}>Shared AI Risk Result</div>
        </div>
      ),
      { ...size },
    );
  }

  const color = riskColor(data.riskLevel);
  const label = riskLabel(data);
  const isZh = data.lang === 'zh';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #050507 0%, #0d0b10 40%, #15121a 100%)',
          color: '#fafafa',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '44px 64px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -70,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -90,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,229,255,0.16) 0%, transparent 72%)',
          }}
        />

        <div style={{ fontSize: 28, opacity: 0.8, letterSpacing: 1.2 }}>JOBLESS · AI Risk Result</div>
        <div style={{ marginTop: 22, fontSize: 76, fontWeight: 900, color }}>{label}</div>

        <div style={{ marginTop: 26, display: 'flex', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.16)', minWidth: 260 }}>
            <div style={{ fontSize: 18, opacity: 0.76 }}>{isZh ? '替代概率' : 'Replacement Probability'}</div>
            <div style={{ marginTop: 10, fontSize: 54, fontWeight: 800, color }}>{data.replacementProbability}%</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.16)', minWidth: 260 }}>
            <div style={{ fontSize: 18, opacity: 0.76 }}>{isZh ? 'AI 斩杀线' : 'AI Kill Line'}</div>
            <div style={{ marginTop: 10, fontSize: 54, fontWeight: 800 }}>{data.predictedReplacementYear}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.16)', minWidth: 260 }}>
            <div style={{ fontSize: 18, opacity: 0.76 }}>{isZh ? '当前程度' : 'Current Degree'}</div>
            <div style={{ marginTop: 10, fontSize: 54, fontWeight: 800 }}>{data.currentReplacementDegree}%</div>
          </div>
        </div>

        <div style={{ marginTop: 28, fontSize: 28, opacity: 0.88 }}>
          {isZh ? '预测范围' : 'Prediction Range'}: {data.earliestYear} — {data.latestYear}
        </div>
      </div>
    ),
    { ...size },
  );
}
