import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'JOBLESS - AI Job Impact Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #050507 0%, #0d0b10 40%, #15121a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(213,0,249,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,23,68,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            background: 'linear-gradient(90deg, #d500f9, #ff4081, #00e5ff)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 20,
            display: 'flex',
          }}
        >
          JOBLESS
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#fafafa',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          How Fast Is AI Replacing Human Jobs?
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: 60,
            alignItems: 'center',
          }}
        >
          {/* MIT stat */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              borderRadius: 16,
              border: '1px solid rgba(255,23,68,0.3)',
              background: 'rgba(255,23,68,0.08)',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, color: '#ff1744', display: 'flex' }}>
              11.7%
            </div>
            <div style={{ fontSize: 16, color: '#8a8595', marginTop: 8, display: 'flex' }}>
              MIT: Replaceable Now
            </div>
          </div>

          {/* Arrow */}
          <div style={{ fontSize: 40, color: '#ff4081', display: 'flex' }}>→</div>

          {/* McKinsey stat */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              borderRadius: 16,
              border: '1px solid rgba(255,87,34,0.3)',
              background: 'rgba(255,87,34,0.08)',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, color: '#ff5722', display: 'flex' }}>
              57%
            </div>
            <div style={{ fontSize: 16, color: '#8a8595', marginTop: 8, display: 'flex' }}>
              McKinsey: Technical Ceiling
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 40,
            fontSize: 20,
            color: '#00e5ff',
            display: 'flex',
          }}
        >
          Calculate Your AI Replacement Risk →
        </div>
      </div>
    ),
    { ...size }
  );
}
