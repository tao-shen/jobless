export type ShareLang = 'en' | 'zh';

export type SharePayload = {
  v: 1;
  riskLevel: 'very-low' | 'low' | 'medium' | 'high' | 'critical';
  replacementProbability: number;
  predictedReplacementYear: number;
  currentReplacementDegree: number;
  earliestYear: number;
  latestYear: number;
  lang: ShareLang;
};

const RISK_LEVELS: SharePayload['riskLevel'][] = ['very-low', 'low', 'medium', 'high', 'critical'];
const LANGS: ShareLang[] = ['en', 'zh'];

function toBase64Url(input: string): string {
  if (typeof window === 'undefined' && typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf8').toString('base64url');
  }
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): string | null {
  try {
    if (typeof window === 'undefined' && typeof Buffer !== 'undefined') {
      return Buffer.from(input, 'base64url').toString('utf8');
    }
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function isValidPayloadValue(payload: Partial<SharePayload>): payload is SharePayload {
  return (
    payload.v === 1 &&
    typeof payload.riskLevel === 'string' &&
    RISK_LEVELS.includes(payload.riskLevel as SharePayload['riskLevel']) &&
    typeof payload.replacementProbability === 'number' &&
    Number.isFinite(payload.replacementProbability) &&
    typeof payload.predictedReplacementYear === 'number' &&
    Number.isFinite(payload.predictedReplacementYear) &&
    typeof payload.currentReplacementDegree === 'number' &&
    Number.isFinite(payload.currentReplacementDegree) &&
    typeof payload.earliestYear === 'number' &&
    Number.isFinite(payload.earliestYear) &&
    typeof payload.latestYear === 'number' &&
    Number.isFinite(payload.latestYear) &&
    typeof payload.lang === 'string' &&
    LANGS.includes(payload.lang as ShareLang)
  );
}

export function encodeSharePayload(payload: Omit<SharePayload, 'v'>): string {
  const normalized: SharePayload = {
    v: 1,
    riskLevel: payload.riskLevel,
    replacementProbability: clampInt(payload.replacementProbability, 0, 100),
    predictedReplacementYear: clampInt(payload.predictedReplacementYear, 2024, 2100),
    currentReplacementDegree: clampInt(payload.currentReplacementDegree, 0, 100),
    earliestYear: clampInt(payload.earliestYear, 2024, 2100),
    latestYear: clampInt(payload.latestYear, 2024, 2100),
    lang: payload.lang,
  };
  return toBase64Url(JSON.stringify(normalized));
}

export function decodeSharePayload(payload: string): SharePayload | null {
  const decoded = fromBase64Url(payload);
  if (!decoded) return null;

  let parsed: Partial<SharePayload>;
  try {
    parsed = JSON.parse(decoded) as Partial<SharePayload>;
  } catch {
    return null;
  }
  if (!isValidPayloadValue(parsed)) return null;
  if (parsed.latestYear < parsed.earliestYear) return null;
  return {
    ...parsed,
    replacementProbability: clampInt(parsed.replacementProbability, 0, 100),
    predictedReplacementYear: clampInt(parsed.predictedReplacementYear, 2024, 2100),
    currentReplacementDegree: clampInt(parsed.currentReplacementDegree, 0, 100),
    earliestYear: clampInt(parsed.earliestYear, 2024, 2100),
    latestYear: clampInt(parsed.latestYear, 2024, 2100),
  };
}
