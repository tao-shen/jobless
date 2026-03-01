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
  if (level === 'low') return '#00d66b';
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
          <span style={{ fontSize: 72, fontWeight: 800 }}>JOBLESS</span>
          <span style={{ fontSize: 30, opacity: 0.85, marginTop: 10 }}>Shared AI Risk Result</span>
        </div>
      ),
      { ...size },
    );
  }

  const isZh = data.lang === 'zh';
  const color = riskColor(data.riskLevel);
  const label = riskLabel(data);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #05070d 0%, #0f1322 52%, #18121f 100%)',
          color: '#f7f9ff',
          fontFamily: 'sans-serif',
          padding: '30px 34px',
          gap: '20px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            display: 'flex',
            background: `linear-gradient(90deg, #00dbff 0%, ${color} 60%, #ff3d99 100%)`,
          }}
        />

        <div
          style={{
            width: '56%',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'linear-gradient(140deg, rgba(8,14,31,0.9), rgba(14,20,38,0.78))',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: 18, opacity: 0.78, letterSpacing: 1.1 }}>JOBLESS · {isZh ? '风险预览' : 'RISK PREVIEW'}</span>
          <div
            style={{
              marginTop: 14,
              borderRadius: 18,
              border: `1.2px solid ${color}66`,
              background: 'linear-gradient(140deg, rgba(8,14,31,0.92), rgba(13,19,35,0.84))',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: 14, opacity: 0.7, letterSpacing: 1.2 }}>{isZh ? '你的 AI 风险结果' : 'YOUR AI RISK RESULT'}</span>
            <span style={{ marginTop: 8, fontSize: 54, fontWeight: 900, color, lineHeight: 1 }}>{label}</span>
            <span style={{ marginTop: 8, fontSize: 20, opacity: 0.82 }}>
              {isZh ? '替代概率与时间区间预估' : 'Replacement probability and timeline estimate'}
            </span>
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                borderRadius: 14,
                border: '1px solid rgba(255,47,103,0.45)',
                background: 'rgba(10,14,25,0.72)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 16, opacity: 0.78 }}>{isZh ? '替代概率' : 'Replacement Probability'}</span>
              <span style={{ fontSize: 32, color: '#ff2f67', fontWeight: 800 }}>{`${data.replacementProbability}%`}</span>
            </div>
            <div
              style={{
                borderRadius: 14,
                border: '1px solid rgba(87,217,239,0.45)',
                background: 'rgba(10,14,25,0.72)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 16, opacity: 0.78 }}>{isZh ? '当前程度' : 'Current Degree'}</span>
              <span style={{ fontSize: 32, color: '#57d9ef', fontWeight: 800 }}>{`${data.currentReplacementDegree}%`}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            width: '44%',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'linear-gradient(140deg, rgba(8,14,31,0.9), rgba(14,20,38,0.78))',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: 16, opacity: 0.78, letterSpacing: 1 }}>{isZh ? '风险摘要' : 'RISK SNAPSHOT'}</span>
          <span style={{ marginTop: 10, fontSize: 58, fontWeight: 900, color, lineHeight: 1 }}>{label}</span>

          <div
            style={{
              marginTop: 14,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(10,14,24,0.66)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: 15, opacity: 0.74 }}>{isZh ? 'AI 斩杀线年份' : 'AI Kill Line Year'}</span>
            <span style={{ marginTop: 8, fontSize: 52, fontWeight: 800 }}>{`${data.predictedReplacementYear}`}</span>
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(10,14,24,0.66)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: 15, opacity: 0.74 }}>{isZh ? '预测范围' : 'Prediction Range'}</span>
            <span style={{ marginTop: 8, fontSize: 34, fontWeight: 700, fontFamily: 'monospace' }}>{`${data.earliestYear} — ${data.latestYear}`}</span>
          </div>

          <span style={{ marginTop: 'auto', fontSize: 18, opacity: 0.82 }}>
            {isZh ? '打开链接查看完整 AI 风险评估' : 'Open link for full AI risk result'}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
