'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Target, Zap, Eye, Shield, Lock, Share2, Download, Copy, ExternalLink,
  CheckCircle2, ChevronDown, ChevronRight, TrendingUp, AlertTriangle, Brain, Activity, Send,
  Database, FileText, Workflow, Bot, BarChart3, Flame, RefreshCw,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { Language, translations } from '@/lib/translations';
import { calculateAIRisk, RISK_LEVEL_INFO, RiskInputData, RiskOutputResult } from '@/lib/ai_risk_calculator_v2';
import { encodeSharePayload } from '@/lib/share_payload';

function DimensionSlider({
  title,
  desc,
  detail,
  value,
  onChange,
  lowLabel,
  highLabel,
  icon: Icon,
  color
}: {
  title: string;
  desc: string;
  detail: string;
  value: number;
  onChange: (val: number) => void;
  lowLabel: string;
  highLabel: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-surface-elevated">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold mb-1">{title}</h4>
          <p className="text-xs text-foreground-muted mb-1">{desc}</p>
          <p className="text-xs text-foreground-muted opacity-70">{detail}</p>
        </div>
      </div>

      <div className="space-y-2 pt-6">
        <div className="relative">
          <div className="flex justify-between text-xs text-foreground-muted mb-1">
            <span>{lowLabel}</span>
            <span>{highLabel}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="calc-slider"
            style={{
              background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, var(--surface-elevated) ${value}%, var(--surface-elevated) 100%)`
            }}
          />
          {/* 数值标签 - 跟随滑块位置, clamped at edges */}
          <div
            className="absolute -top-2 text-xs font-bold px-2 py-1 rounded text-white whitespace-nowrap transition-all duration-75"
            style={{
              left: `clamp(1rem, ${value}%, calc(100% - 1rem))`,
              transform: 'translateX(-50%) translateY(-100%)',
              backgroundColor: color
            }}
          >
            {Math.round(value)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <>{display}{suffix}</>;
}

const PROFESSION_PRESETS: Record<string, {
  name: { en: string; zh: string };
  shortName?: { en: string; zh: string };
  industry: string;
  dimensions: {
    dataOpenness: number;
    workDataDigitalization: number;
    processStandardization: number;
    currentAIAdoption: number;
  };
  protections: {
    creativeRequirement: number;
    humanInteraction: number;
    physicalOperation: number;
  };
}> = {
  // 数据口径：analysis/iceberg_exposure/output/industry_ai_replacement_risk_top_model_task_aligned.csv
  // + gdpval_complete_data.json(by_occupation, GPT-5.2) 中对应职业样本
  // 客服/行政类（参考：行业暴露 43.84%，有效Win 49.92%，风险 21.89%）
  'customer-service': {
    name: { en: 'Customer Service / Admin', zh: '客服/行政' },
    shortName: { en: 'Customer Support', zh: '客服支持' },
    industry: 'customerService',
    dimensions: {
      dataOpenness: 60,
      workDataDigitalization: 74,
      processStandardization: 71,
      currentAIAdoption: 53,
    },
    protections: {
      creativeRequirement: 18,
      humanInteraction: 72,
      physicalOperation: 8,
    },
  },

  // 技术/开发类（参考：PSTS 行业暴露 48.78%，有效Win 47.30%；软件开发职业Win样本偏高）
  'tech': {
    name: { en: 'Developer / Tech', zh: '程序员/技术' },
    shortName: { en: 'Developer', zh: '开发' },
    industry: 'tech',
    dimensions: {
      dataOpenness: 72,
      workDataDigitalization: 94,
      processStandardization: 67,
      currentAIAdoption: 65,
    },
    protections: {
      creativeRequirement: 75,
      humanInteraction: 45,
      physicalOperation: 5,
    },
  },

  // 创意/设计类（参考：Information 行业暴露 48.99%，有效Win 53.34%）
  'creative': {
    name: { en: 'Creative / Designer', zh: '创意/设计' },
    shortName: { en: 'Creative Designer', zh: '创意设计' },
    industry: 'marketing',
    dimensions: {
      dataOpenness: 68,
      workDataDigitalization: 90,
      processStandardization: 63,
      currentAIAdoption: 58,
    },
    protections: {
      creativeRequirement: 78,
      humanInteraction: 52,
      physicalOperation: 5,
    },
  },

  // 金融/分析类（参考：行业暴露 54.71%，有效Win 50.92%，风险 27.86%）
  'finance': {
    name: { en: 'Finance / Analyst', zh: '金融/分析' },
    shortName: { en: 'Finance Analyst', zh: '金融分析' },
    industry: 'finance',
    dimensions: {
      dataOpenness: 71,
      workDataDigitalization: 86,
      processStandardization: 76,
      currentAIAdoption: 56,
    },
    protections: {
      creativeRequirement: 45,
      humanInteraction: 58,
      physicalOperation: 5,
    },
  },

  // 销售/管理类（参考：Retail/Wholesale 合并口径，风险区间约 23%-27%）
  'sales': {
    name: { en: 'Sales / Management', zh: '销售/管理' },
    shortName: { en: 'Sales Lead', zh: '销售管理' },
    industry: 'sales',
    dimensions: {
      dataOpenness: 56,
      workDataDigitalization: 72,
      processStandardization: 61,
      currentAIAdoption: 50,
    },
    protections: {
      creativeRequirement: 58,
      humanInteraction: 82,
      physicalOperation: 12,
    },
  },

  // 医疗/教育类（参考：Healthcare 风险 15.88%，Education 风险 16.55%）
  'healthcare-edu': {
    name: { en: 'Healthcare / Education', zh: '医疗/教育' },
    shortName: { en: 'Healthcare / Edu', zh: '医教行业' },
    industry: 'healthcare',
    dimensions: {
      dataOpenness: 40,
      workDataDigitalization: 55,
      processStandardization: 42,
      currentAIAdoption: 38,
    },
    protections: {
      creativeRequirement: 70,
      humanInteraction: 95,
      physicalOperation: 55,
    },
  },

  // 体力/手工类（参考：Manufacturing 风险 17.75%，但物理操作保护强）
  'manual': {
    name: { en: 'Manual / Skilled Trade', zh: '体力/技术工种' },
    shortName: { en: 'Skilled Trade', zh: '技术工种' },
    industry: 'manufacturing',
    dimensions: {
      dataOpenness: 28,
      workDataDigitalization: 32,
      processStandardization: 48,
      currentAIAdoption: 24,
    },
    protections: {
      creativeRequirement: 48,
      humanInteraction: 45,
      physicalOperation: 95,
    },
  },

  // 内容/写作类（参考：Information 行业 + Editors/Journalists 职业样本）
  'writer': {
    name: { en: 'Writer / Content', zh: '写作/内容' },
    shortName: { en: 'Content Writer', zh: '内容写作' },
    industry: 'marketing',
    dimensions: {
      dataOpenness: 74,
      workDataDigitalization: 96,
      processStandardization: 67,
      currentAIAdoption: 65,
    },
    protections: {
      creativeRequirement: 66,
      humanInteraction: 42,
      physicalOperation: 5,
    },
  },
};

type DimensionKey = 'dataOpenness' | 'workDataDigitalization' | 'processStandardization' | 'currentAIAdoption';
type ProtectionKey = 'creativeRequirement' | 'humanInteraction' | 'physicalOperation';

// 生存指数测试 V2
function SurvivalIndexSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const [showOptional, setShowOptional] = useState(false);
  const [result, setResult] = useState<RiskOutputResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [telegramShareState, setTelegramShareState] = useState<'idle' | 'sending' | 'sent' | 'fallback'>('idle');
  const posterCaptureRef = useRef<HTMLDivElement>(null);

  // 分享功能
  const getShareText = () => {
    if (!result) return '';
    const levelText = result.riskLevel === 'very-low' ? (lang === 'en' ? 'Very Low' : '极低') :
      result.riskLevel === 'low' ? (lang === 'en' ? 'Low' : '低') :
      result.riskLevel === 'medium' ? (lang === 'en' ? 'Medium' : '中等') :
      result.riskLevel === 'high' ? (lang === 'en' ? 'High' : '高') :
      (lang === 'en' ? 'Critical' : '极高');
    return t.shareText
      .replace('{level}', levelText)
      .replace('{prob}', String(result.replacementProbability))
      .replace('{year}', String(result.predictedReplacementYear));
  };

  const getShareUrl = (options?: { includeBypass?: boolean; usePublicBase?: boolean }) => {
    if (!result) return window.location.href;
    const payload = encodeSharePayload({
      riskLevel: result.riskLevel,
      replacementProbability: result.replacementProbability,
      predictedReplacementYear: result.predictedReplacementYear,
      currentReplacementDegree: result.currentReplacementDegree,
      earliestYear: result.confidenceInterval.earliest,
      latestYear: result.confidenceInterval.latest,
      lang,
    });

    const runtimeOrigin = window.location.origin;
    const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;
    const configuredBase = (process.env.NEXT_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
    const fallbackBase = 'https://jobless.democra.ai';
    const usePublicBase = options?.usePublicBase ?? false;
    const includeBypass = options?.includeBypass ?? true;
    const baseOrigin = usePublicBase
      ? (configuredBase || fallbackBase)
      : localhostPattern.test(runtimeOrigin)
        ? (configuredBase || fallbackBase)
        : runtimeOrigin;

    const shareUrl = new URL(`/share/${payload}`, baseOrigin);
    if (includeBypass) {
      const pageParams = new URLSearchParams(window.location.search);
      const bypassTokenFromUrl = pageParams.get('x-vercel-protection-bypass');
      const bypassTokenFromEnv = (process.env.NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET || '').trim();
      const bypassToken = bypassTokenFromUrl || bypassTokenFromEnv;
      if (bypassToken) {
        shareUrl.searchParams.set('x-vercel-protection-bypass', bypassToken);
        shareUrl.searchParams.set('x-vercel-set-bypass-cookie', 'true');
      }
    }
    return shareUrl.toString();
  };

  const copyText = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback below for older browsers or blocked clipboard access
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copiedByCommand = document.execCommand('copy');
      document.body.removeChild(textarea);
      return copiedByCommand;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async () => {
    const didCopy = await copyText(getShareUrl());
    if (!didCopy) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyForWechat = async () => {
    const text = getShareText() + '\n' + getShareUrl();
    const didCopy = await copyText(text);
    if (!didCopy) return;
    setWechatCopied(true);
    setTimeout(() => setWechatCopied(false), 3000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareWeibo = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://service.weibo.com/share/share.php?title=${text}&url=${url}`, '_blank');
  };

  const buildShareImageBlob = async (): Promise<Blob | null> => {
    if (!result) return null;
    const shareUrl = getShareUrl();
    const qrShareUrl = getShareUrl({ includeBypass: true, usePublicBase: true });
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('image load failed'));
        image.src = src;
      });

    const roundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    };

    const truncateText = (text: string, maxWidth: number) => {
      if (ctx.measureText(text).width <= maxWidth) return text;
      let trimmed = text;
      while (trimmed.length > 0 && ctx.measureText(`${trimmed}...`).width > maxWidth) {
        trimmed = trimmed.slice(0, -1);
      }
      return `${trimmed}...`;
    };

    const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
    bg.addColorStop(0, '#060a12');
    bg.addColorStop(0.6, '#0c1220');
    bg.addColorStop(1, '#18121f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    const captureNode = posterCaptureRef.current;
    if (!captureNode) return null;

    let contentBottom = 1500;
    try {
      const snapshot = await html2canvas(captureNode, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const drawX = 48;
      const drawY = 42;
      const drawW = 984;
      const drawH = Math.min(1490, (snapshot.height / snapshot.width) * drawW);
      ctx.save();
      roundedRect(drawX, drawY, drawW, drawH, 30);
      ctx.clip();
      ctx.drawImage(snapshot, drawX, drawY, drawW, drawH);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5;
      roundedRect(drawX, drawY, drawW, drawH, 30);
      ctx.stroke();
      contentBottom = drawY + drawH + 20;
    } catch {
      contentBottom = 1500;
    }

    const footerY = Math.max(1640, contentBottom);
    const footerH = 230;
    roundedRect(48, footerY, 984, footerH, 28);
    const footerGrad = ctx.createLinearGradient(48, footerY, 1032, footerY + footerH);
    footerGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
    footerGrad.addColorStop(1, 'rgba(255,255,255,0.03)');
    ctx.fillStyle = footerGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1.5;
    roundedRect(48, footerY, 984, footerH, 28);
    ctx.stroke();

    const qrSize = 236;
    const qrBox = qrSize + 16;
    const qrX = 48 + 984 - qrBox - 28;
    const qrY = footerY + (footerH - qrBox) / 2;
    roundedRect(qrX, qrY, qrBox, qrBox, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    try {
      const qrDataUrl = await QRCode.toDataURL(qrShareUrl, {
        errorCorrectionLevel: 'L',
        margin: 1,
        width: qrSize,
        color: { dark: '#0c1322', light: '#ffffff' },
      });
      const qrImage = await loadImage(qrDataUrl);
      ctx.drawImage(qrImage, qrX + 8, qrY + 8, qrSize, qrSize);
    } catch {
      ctx.fillStyle = '#0a1020';
      ctx.font = '700 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR', qrX + qrBox / 2, qrY + qrBox / 2 + 8);
      ctx.textAlign = 'left';
    }

    const shortUrl = shareUrl.replace(/^https?:\/\//, '');
    const textX = 76;
    const textMax = qrX - textX - 16;
    ctx.fillStyle = '#eef2ff';
    ctx.font = '700 52px sans-serif';
    ctx.fillText(lang === 'en' ? 'Calculate your AI risk' : '测测你的 AI 风险', textX, footerY + 78);
    ctx.fillStyle = 'rgba(183,191,210,0.86)';
    ctx.font = '500 33px sans-serif';
    ctx.fillText(lang === 'en' ? 'Scan the QR code to view this page' : '扫码查看结果页', textX, footerY + 124);
    ctx.fillStyle = 'rgba(238,242,255,0.88)';
    ctx.font = '600 28px sans-serif';
    ctx.fillText(truncateText(shortUrl, textMax), textX, footerY + 164);
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '500 22px sans-serif';
    ctx.fillText('Generated by JOBLESS', textX, footerY + 200);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const handleShareTelegram = async () => {
    const shareText = getShareText();
    const shareUrl = getShareUrl({ includeBypass: true, usePublicBase: true });
    const fallbackUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`;
    const deepLinkUrl = `tg://msg_url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

    try {
      setTelegramShareState('sending');
      const imageBlob = await buildShareImageBlob();
      if (imageBlob) {
        const photoForm = new FormData();
        photoForm.append('photo', imageBlob, 'jobless-risk-poster.png');
        photoForm.append('caption', `${shareText}\n${shareUrl}`);

        const photoResponse = await fetch('/api/share/telegram/photo', {
          method: 'POST',
          body: photoForm,
        });

        if (photoResponse.ok) {
          setTelegramShareState('sent');
          setTimeout(() => setTelegramShareState('idle'), 2600);
          return;
        }
      }

      const textResponse = await fetch('/api/share/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: shareText, url: shareUrl }),
      });

      if (textResponse.ok) {
        setTelegramShareState('sent');
        setTimeout(() => setTelegramShareState('idle'), 2600);
        return;
      }
    } catch {
      // Fallback to Telegram Web share if API call fails
    }

    const isMobileBrowser = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobileBrowser) {
      // Try app deep link first; if it fails, fall back to Telegram web share.
      window.location.href = deepLinkUrl;
      window.setTimeout(() => {
        window.location.href = fallbackUrl;
      }, 900);
    } else {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
    setTelegramShareState('fallback');
    setTimeout(() => setTelegramShareState('idle'), 3200);
  };

  const handleDownloadImage = async () => {
    const blob = await buildShareImageBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobless-risk-poster.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 核心维度状态
  const [dimensions, setDimensions] = useState({
    dataOpenness: 50,
    workDataDigitalization: 50,
    processStandardization: 50,
    currentAIAdoption: 50,
  });

  // 可选保护因素状态
  const [protections, setProtections] = useState({
    creativeRequirement: 50,
    humanInteraction: 50,
    physicalOperation: 50,
  });

  // 职业选择状态
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('other');
  const professionGridRef = useRef<HTMLDivElement>(null);
  const [professionDensity, setProfessionDensity] = useState<'regular' | 'compact' | 'tight'>('regular');

  const updateDimension = useCallback((key: DimensionKey, value: number) => {
    setDimensions(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateProtection = useCallback((key: ProtectionKey, value: number) => {
    setProtections(prev => ({ ...prev, [key]: value }));
  }, []);

  const dimensionHandlers = useMemo(
    () => ({
      dataOpenness: (value: number) => updateDimension('dataOpenness', value),
      workDataDigitalization: (value: number) => updateDimension('workDataDigitalization', value),
      processStandardization: (value: number) => updateDimension('processStandardization', value),
      currentAIAdoption: (value: number) => updateDimension('currentAIAdoption', value),
    }),
    [updateDimension],
  );

  const protectionHandlers = useMemo(
    () => ({
      creativeRequirement: (value: number) => updateProtection('creativeRequirement', value),
      humanInteraction: (value: number) => updateProtection('humanInteraction', value),
      physicalOperation: (value: number) => updateProtection('physicalOperation', value),
    }),
    [updateProtection],
  );

  const professionPreviewBadgeColors = useMemo(() => {
    const entries = Object.entries(PROFESSION_PRESETS).map(([profKey, prof]) => {
      const previewResult = calculateAIRisk({
        jobTitle: '',
        industry: prof.industry,
        yearsOfExperience: 5,
        ...prof.dimensions,
        ...prof.protections,
      }, lang);
      return [profKey, RISK_LEVEL_INFO[previewResult.riskLevel].color] as const;
    });
    return Object.fromEntries(entries) as Record<string, string>;
  }, [lang]);

  // 应用职业预设
  const applyProfessionPreset = (professionKey: string | null) => {
    if (professionKey && PROFESSION_PRESETS[professionKey]) {
      const preset = PROFESSION_PRESETS[professionKey];
      setDimensions(preset.dimensions);
      setProtections({
        creativeRequirement: preset.protections.creativeRequirement,
        humanInteraction: preset.protections.humanInteraction,
        physicalOperation: preset.protections.physicalOperation,
      });
      setSelectedIndustry(preset.industry);
      setSelectedProfession(professionKey);
    } else {
      setSelectedProfession(null);
    }
  };

  const syncProfessionDensity = useCallback(() => {
    const grid = professionGridRef.current;
    if (!grid) return;
    const labels = Array.from(grid.querySelectorAll<HTMLElement>('.profession-btn-label'));
    if (!labels.length) return;

    let maxLines = 1;
    let minButtonWidth = Number.POSITIVE_INFINITY;
    labels.forEach((label) => {
      const computed = window.getComputedStyle(label);
      const lineHeight = Number.parseFloat(computed.lineHeight || '0') || 16;
      const lines = label.getBoundingClientRect().height / lineHeight;
      maxLines = Math.max(maxLines, lines);
      const button = label.closest('.profession-btn');
      if (button instanceof HTMLElement) minButtonWidth = Math.min(minButtonWidth, button.clientWidth);
    });

    // Only allow downward transitions (regular → compact → tight) to
    // avoid oscillation: switching density changes the displayed text
    // (long name ↔ short name), which changes line counts, creating an
    // infinite feedback loop that causes the UI to flash.
    setProfessionDensity((prev) => {
      if (prev === 'regular') {
        if (maxLines > 1.56 || minButtonWidth < 140) return 'compact';
        return prev;
      }
      if (prev === 'compact') {
        if (maxLines > 1.96 || minButtonWidth < 122) return 'tight';
        return prev;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    let frame: number | null = null;
    const schedule = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = null;
        syncProfessionDensity();
      });
    };

    schedule();
    const settleTimer = window.setTimeout(schedule, 280);
    window.addEventListener('resize', schedule);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && professionGridRef.current) {
      observer = new ResizeObserver(schedule);
      observer.observe(professionGridRef.current);
    }

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
    };
  }, [syncProfessionDensity, lang]);

  // Restore last input state from localStorage on mount (but not result,
  // so user always sees the input form first with presets visible)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-risk-last-result');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dimensions) setDimensions(parsed.dimensions);
        if (parsed.protections) setProtections(parsed.protections);
        if (parsed.industry) setSelectedIndustry(parsed.industry);
        if (parsed.profession) setSelectedProfession(parsed.profession);
      }
    } catch { /* ignore parse errors */ }
  }, []);

  const calculateRisk = () => {
    const inputData: RiskInputData = {
      jobTitle: 'User',
      industry: selectedIndustry,
      yearsOfExperience: 5,
      ...dimensions,
      ...protections,
    };
    const assessment = calculateAIRisk(inputData, lang);
    setResult(assessment);
    setSharePanelOpen(false);
    setTelegramShareState('idle');
    setCopied(false);
    setWechatCopied(false);
    try {
      localStorage.setItem('ai-risk-last-result', JSON.stringify({
        result: assessment, dimensions, protections,
        industry: selectedIndustry, profession: selectedProfession,
      }));
    } catch { /* quota errors */ }
  };

  const resetCalculator = () => {
    setResult(null);
    setSharePanelOpen(false);
    setTelegramShareState('idle');
    setCopied(false);
    setWechatCopied(false);
    setDimensions({
      dataOpenness: 50,
      workDataDigitalization: 50,
      processStandardization: 50,
      currentAIAdoption: 50,
    });
    setProtections({
      creativeRequirement: 50,
      humanInteraction: 50,
      physicalOperation: 50,
    });
    setSelectedProfession(null);
    setSelectedIndustry('other');
    try { localStorage.removeItem('ai-risk-last-result'); } catch { /* ignore */ }
  };

  return (
    <section
      id="risk-calculator"
      data-mobile-section="risk"
      data-lang={lang}
      className="py-12 sm:py-24 px-4 md:px-6 relative z-30 overflow-hidden scroll-mt-8 responsive-copy-scope"
    >

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Title with distinctive styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-white/10">
            <Target className="w-4 h-4" style={{ stroke: 'url(#badge-gradient)' }} />
            <svg width="0" height="0"><defs><linearGradient id="badge-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="50%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#fb7185" /></linearGradient></defs></svg>
            <span className="text-sm font-medium bg-gradient-to-r from-sky-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">{t.survivalBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl mb-4 section-title">
            {t.survivalTitle}
          </h2>
          <p className="section-subtitle text-lg md:text-xl max-w-2xl mx-auto">
            {t.survivalSubtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="calc-container rounded-3xl p-6 md:p-10 relative"
        >
          {!result ? (
            <div className="space-y-8">
              {/* 职业快速预设 - Redesigned */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t.selectProfession}</h3>
                    <p className="text-sm text-foreground-muted">{t.selectProfessionDesc}</p>
                  </div>
                </div>

                {/* 职业按钮网格 - with risk badge */}
                <div
                  ref={professionGridRef}
                  data-density={professionDensity}
                  className="profession-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-4"
                >
                  {Object.entries(PROFESSION_PRESETS).map(([profKey, prof], index) => {
                    const isSelected = selectedProfession === profKey;
                    const displayName = professionDensity === 'regular'
                      ? prof.name[lang]
                      : (prof.shortName?.[lang] ?? prof.name[lang]);
                    const badgeColor = professionPreviewBadgeColors[profKey];
                    return (
                      <motion.button
                        key={profKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => applyProfessionPreset(isSelected ? null : profKey)}
                        className={`profession-btn relative px-3 sm:px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium border transition-all ${
                          isSelected
                            ? 'selected text-white border-transparent'
                            : 'bg-surface-card border-white/8'
                        }`}
                      >
                        <span className="profession-btn-content relative z-10">
                          <span className="profession-btn-dot w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: badgeColor }} />
                          <span className="profession-btn-label">{displayName}</span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* 当前选择提示 - Enhanced */}
                {selectedProfession && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20">
                      <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                      <span className="profession-summary-copy text-sm">
                        <span className="text-foreground-muted shrink-0">
                          {lang === 'en' ? 'Preset: ' : '预设：'}
                        </span>
                        <span className="font-semibold text-white">
                          {PROFESSION_PRESETS[selectedProfession].name[lang]}
                        </span>
                        <span className="text-foreground-muted">
                          {lang === 'en' ? '— adjust below' : '— 可在下方微调'}
                        </span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 四个核心维度 - Redesigned */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">{t.coreDimensions}</h3>
                </div>
                <div className="space-y-5">
                  <DimensionSlider
                    title={t.dim1Title}
                    desc={t.dim1Desc}
                    detail={t.dim1Detail}
                    value={dimensions.dataOpenness}
                    onChange={dimensionHandlers.dataOpenness}
                    lowLabel={t.dim1Low}
                    highLabel={t.dim1High}
                    icon={Database}
                    color="#7c4dff"
                  />
                  <DimensionSlider
                    title={t.dim2Title}
                    desc={t.dim2Desc}
                    detail={t.dim2Detail}
                    value={dimensions.workDataDigitalization}
                    onChange={dimensionHandlers.workDataDigitalization}
                    lowLabel={t.dim2Low}
                    highLabel={t.dim2High}
                    icon={FileText}
                    color="#b388ff"
                  />
                  <DimensionSlider
                    title={t.dim3Title}
                    desc={t.dim3Desc}
                    detail={t.dim3Detail}
                    value={dimensions.processStandardization}
                    onChange={dimensionHandlers.processStandardization}
                    lowLabel={t.dim3Low}
                    highLabel={t.dim3High}
                    icon={Workflow}
                    color="#64ffda"
                  />
                  <DimensionSlider
                    title={t.dim4Title}
                    desc={t.dim4Desc}
                    detail={t.dim4Detail}
                    value={dimensions.currentAIAdoption}
                    onChange={dimensionHandlers.currentAIAdoption}
                    lowLabel={t.dim4Low}
                    highLabel={t.dim4High}
                    icon={Bot}
                    color="#ff6e40"
                  />
                </div>
              </div>

              {/* 可选保护因素切换按钮 - Enhanced */}
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="w-full py-3 px-4 bg-surface-elevated/50 hover:bg-surface-elevated rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-surface-elevated"
              >
                {showOptional ? <ChevronRight className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4" />}
                {showOptional ? t.toggleRequired : t.toggleOptional}
              </button>

              {/* 可选保护因素 - Enhanced */}
              {showOptional && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 rounded-xl bg-surface border border-surface-elevated">
                    <div className="flex items-center gap-2 mb-5">
                      <Shield className="w-5 h-5 text-risk-low" />
                      <h4 className="font-semibold">{t.protectiveFactors}</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs text-foreground-muted mb-2">
                          <span>{t.ctx1Title}</span>
                          <span className="data-value text-risk-safe">{Math.round(protections.creativeRequirement)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={protections.creativeRequirement}
                          onChange={(e) => protectionHandlers.creativeRequirement(parseFloat(e.target.value))}
                          className="calc-slider"
                          style={{
                            background: `linear-gradient(to right, var(--risk-safe) 0%, var(--risk-safe) ${protections.creativeRequirement}%, var(--surface-elevated) ${protections.creativeRequirement}%, var(--surface-elevated) 100%)`
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-foreground-muted mb-2">
                          <span>{t.ctx2Title}</span>
                          <span className="data-value text-risk-safe">{Math.round(protections.humanInteraction)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={protections.humanInteraction}
                          onChange={(e) => protectionHandlers.humanInteraction(parseFloat(e.target.value))}
                          className="calc-slider"
                          style={{
                            background: `linear-gradient(to right, var(--risk-safe) 0%, var(--risk-safe) ${protections.humanInteraction}%, var(--surface-elevated) ${protections.humanInteraction}%, var(--surface-elevated) 100%)`
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-foreground-muted mb-2">
                          <span>{t.ctx3Title}</span>
                          <span className="data-value text-risk-safe">{Math.round(protections.physicalOperation)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={protections.physicalOperation}
                          onChange={(e) => protectionHandlers.physicalOperation(parseFloat(e.target.value))}
                          className="calc-slider"
                          style={{
                            background: `linear-gradient(to right, var(--risk-safe) 0%, var(--risk-safe) ${protections.physicalOperation}%, var(--surface-elevated) ${protections.physicalOperation}%, var(--surface-elevated) 100%)`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Calculate button - Enhanced */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculateRisk}
                className="calc-btn-primary w-full text-white py-5 rounded-xl font-semibold flex items-center justify-center gap-3 text-lg"
              >
                <BarChart3 className="w-6 h-6" />
                {t.calculate}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div data-testid="share-result-capture" className="space-y-6">
                {/* Main Risk Level Display - Bold Typography */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="result-card rounded-2xl p-8 text-center relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: `linear-gradient(90deg, ${RISK_LEVEL_INFO[result.riskLevel].color}, transparent)` }}
                  />
                  <div className="relative z-10">
                    <div className="text-sm text-foreground-muted uppercase tracking-wider mb-3">{t.riskLevel}</div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3"
                      style={{ color: RISK_LEVEL_INFO[result.riskLevel].color, fontFamily: 'var(--font-display)' }}
                    >
                      {result.riskLevel === 'very-low' ? t.riskVeryLow :
                       result.riskLevel === 'low' ? t.riskLow :
                       result.riskLevel === 'medium' ? t.riskMedium :
                       result.riskLevel === 'high' ? t.riskHigh : t.riskCritical}
                    </motion.div>
                    <div className="text-sm text-foreground-muted">{RISK_LEVEL_INFO[result.riskLevel].description[lang]}</div>
                  </div>
                </motion.div>

                {/* Three Metrics - Clean Number Display */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="result-card rounded-xl p-6 text-center group hover-lift"
                  >
                    <div className="metric-value text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: 'var(--risk-critical)' }}>
                      <AnimatedNumber value={result.replacementProbability} suffix="%" />
                    </div>
                    <div className="text-xs text-foreground-muted uppercase tracking-wider">{t.metric1Title}</div>
                    <div className="text-xs text-foreground-muted/60 mt-1">{t.metric1Desc}</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="result-card rounded-xl p-6 text-center group hover-lift"
                  >
                    <div className="metric-value text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: 'var(--risk-high)' }}>
                      <AnimatedNumber value={result.predictedReplacementYear} />
                    </div>
                    <div className="text-xs text-foreground-muted uppercase tracking-wider">{t.metric2Title}</div>
                    <div className="text-xs text-foreground-muted/60 mt-1">{lang === 'en' ? 'Projected' : '预计年份'}</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="result-card rounded-xl p-6 text-center group hover-lift"
                  >
                    <div className="metric-value text-3xl sm:text-4xl md:text-5xl mb-2" style={{ color: 'var(--brand-primary)' }}>
                      <AnimatedNumber value={result.currentReplacementDegree} suffix="%" />
                    </div>
                    <div className="text-xs text-foreground-muted uppercase tracking-wider">{t.metric3Title}</div>
                    <div className="text-xs text-foreground-muted/60 mt-1">{t.metric3Desc}</div>
                  </motion.div>
                </div>

                {/* Confidence Interval - Sleek Bar */}
                <div className="result-card rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">{t.yearRange}</span>
                  <span className="font-mono font-bold text-lg">
                    {result.confidenceInterval.earliest} — {result.confidenceInterval.latest}
                  </span>
                </div>

                {/* Insights - Modern Tags */}
                <div className="result-card rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-semibold">{t.insights}</h5>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-foreground-muted">{t.primaryDriver}:</span>
                      <span className="insight-tag px-3 py-1 rounded-full font-medium">{result.insights.primaryDriver}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.insights.secondaryFactors.map((factor, i) => (
                        <span key={i} className="insight-tag px-3 py-1 rounded-full text-xs font-medium">{factor}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.insights.protectionFactors.map((factor, i) => (
                        <span key={i} className="px-3 py-1 bg-risk-low/20 text-risk-low rounded-full text-xs font-medium border border-risk-low/30">{factor}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations - Modern List */}
                <div className="result-card rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-semibold">{t.recommendations}</h5>
                  </div>
                  <div className="space-y-3">
                    {result.insights.recommendations.slice(0, 4).map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-start gap-3 text-sm p-3 rounded-lg bg-surface-card/50 border border-white/5"
                      >
                        <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Reality Check - Alert Style */}
                <div className="rounded-xl p-5 bg-gradient-to-r from-risk-critical/10 to-risk-high/10 border border-risk-critical/20">
                  <p className="text-sm">
                    <Flame className="w-5 h-5 inline text-risk-critical mr-2 align-middle" />
                    <span className="font-semibold text-foreground">{t.realityCheck}</span>
                  </p>
                  <p className="text-sm text-foreground-muted mt-2 leading-relaxed">{t.realityCheckText}</p>
                </div>
              </div>

              <div
                aria-hidden="true"
                style={{
                  position: 'fixed',
                  left: '-99999px',
                  top: '0',
                  width: '880px',
                  padding: '26px',
                  background: 'linear-gradient(145deg, #040811 0%, #0b1020 58%, #1a1320 100%)',
                  borderRadius: '28px',
                  boxSizing: 'border-box',
                  color: '#eef2ff',
                  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                }}
              >
                <div ref={posterCaptureRef} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'linear-gradient(90deg, rgba(0,219,255,0.12), rgba(255,61,153,0.1))',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '22px', letterSpacing: '0.6px', fontWeight: 700 }}>JOBLESS</span>
                    <span style={{ fontSize: '16px', opacity: 0.74 }}>{lang === 'en' ? 'AI Risk Share' : 'AI 风险分享'}</span>
                  </div>

                  <div
                    style={{
                      borderRadius: '24px',
                      border: `1.5px solid ${RISK_LEVEL_INFO[result.riskLevel].color}66`,
                      background: 'linear-gradient(140deg, rgba(8,14,31,0.9), rgba(14,20,38,0.78))',
                      padding: '24px',
                    }}
                  >
                    <div style={{ fontSize: '12px', letterSpacing: '1.5px', opacity: 0.72 }}>
                      {lang === 'en' ? 'YOUR AI RISK RESULT' : '你的 AI 风险结果'}
                    </div>
                    <div
                      style={{
                        marginTop: '10px',
                        fontSize: '72px',
                        fontWeight: 800,
                        lineHeight: 1,
                        color: RISK_LEVEL_INFO[result.riskLevel].color,
                      }}
                    >
                      {result.riskLevel === 'very-low' ? (lang === 'en' ? 'VERY LOW' : '极低风险') :
                       result.riskLevel === 'low' ? (lang === 'en' ? 'LOW RISK' : '低风险') :
                       result.riskLevel === 'medium' ? (lang === 'en' ? 'MEDIUM RISK' : '中等风险') :
                       result.riskLevel === 'high' ? (lang === 'en' ? 'HIGH RISK' : '高风险') :
                       (lang === 'en' ? 'CRITICAL RISK' : '极高风险')}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '22px', opacity: 0.84 }}>
                      {RISK_LEVEL_INFO[result.riskLevel].description[lang]}
                    </div>
                  </div>

                  {[
                    {
                      value: `${result.replacementProbability}%`,
                      label: lang === 'en' ? 'Replacement Probability' : '替代概率',
                      desc: lang === 'en' ? 'Likelihood AI will replace your job' : '你的岗位被 AI 替代可能性',
                      color: '#ff2f67',
                    },
                    {
                      value: `${result.predictedReplacementYear}`,
                      label: lang === 'en' ? 'AI Kill Line Year' : 'AI 斩杀线年份',
                      desc: lang === 'en' ? 'Projected' : '预计年份',
                      color: '#ff9e1f',
                    },
                    {
                      value: `${result.currentReplacementDegree}%`,
                      label: lang === 'en' ? 'Current Degree' : '当前程度',
                      desc: lang === 'en' ? 'How much AI can already do now' : 'AI 当前可完成程度',
                      color: '#57d9ef',
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      style={{
                        borderRadius: '22px',
                        border: `1.2px solid ${metric.color}66`,
                        background: 'linear-gradient(140deg, rgba(8,14,31,0.9), rgba(14,20,38,0.78))',
                        padding: '20px 24px',
                      }}
                    >
                      <div style={{ fontSize: '62px', fontWeight: 800, lineHeight: 1, color: metric.color }}>{metric.value}</div>
                      <div style={{ marginTop: '8px', fontSize: '38px', fontWeight: 700, lineHeight: 1.1 }}>{metric.label}</div>
                      <div style={{ marginTop: '6px', fontSize: '24px', opacity: 0.72 }}>{metric.desc}</div>
                    </div>
                  ))}

                  <div
                    style={{
                      borderRadius: '22px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'linear-gradient(140deg, rgba(8,14,31,0.9), rgba(14,20,38,0.78))',
                      padding: '20px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '40px', opacity: 0.82 }}>{lang === 'en' ? 'Range' : '预测范围'}</span>
                    <span style={{ fontSize: '52px', fontWeight: 700, fontFamily: 'monospace' }}>
                      {result.confidenceInterval.earliest} — {result.confidenceInterval.latest}
                    </span>
                  </div>

                  <div
                    style={{
                      borderRadius: '22px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'linear-gradient(140deg, rgba(8,14,31,0.9), rgba(14,20,38,0.78))',
                      padding: '20px 24px',
                    }}
                  >
                    <div style={{ fontSize: '52px', fontWeight: 700 }}>{lang === 'en' ? 'Key Insights' : '关键洞察'}</div>
                    <div style={{ marginTop: '10px', fontSize: '26px', opacity: 0.78 }}>
                      {lang === 'en' ? 'Primary Risk Driver:' : '主要风险驱动：'} {result.insights.primaryDriver}
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {result.insights.secondaryFactors.slice(0, 2).map((factor, idx) => (
                        <span
                          key={idx}
                          style={{
                            borderRadius: '999px',
                            border: '1px solid rgba(132,145,255,0.65)',
                            background: 'rgba(35,46,86,0.45)',
                            padding: '6px 14px',
                            fontSize: '24px',
                          }}
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: '22px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'linear-gradient(140deg, rgba(8,14,31,0.9), rgba(14,20,38,0.78))',
                      padding: '20px 24px',
                    }}
                  >
                    <div style={{ fontSize: '46px', fontWeight: 700 }}>{lang === 'en' ? 'Recommendations' : '建议行动'}</div>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {result.insights.recommendations.slice(0, 2).map((rec, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(8,12,24,0.66)',
                            padding: '8px 12px',
                            fontSize: '20px',
                            lineHeight: 1.35,
                          }}
                        >
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Sharing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="result-card rounded-xl p-6"
                style={{ borderColor: RISK_LEVEL_INFO[result.riskLevel].color + '30', borderWidth: 1 }}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: RISK_LEVEL_INFO[result.riskLevel].color + '20' }}>
                    <Share2 className="w-4 h-4" style={{ color: RISK_LEVEL_INFO[result.riskLevel].color }} />
                  </div>
                  <div>
                    <h5 className="font-semibold">{t.shareTitle}</h5>
                    <p className="text-xs text-foreground-muted">{t.shareSubtitle}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSharePanelOpen((prev) => !prev)}
                    data-testid="share-trigger"
                    className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-surface-elevated/70 hover:bg-surface-elevated text-sm font-medium transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    {sharePanelOpen ? t.shareClose : t.shareOpen}
                  </motion.button>
                </div>
                <AnimatePresence initial={false}>
                  {sharePanelOpen && (
                    <motion.div
                      key="share-panel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      data-testid="share-panel"
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDownloadImage}
                          data-testid="share-download-btn"
                          className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/40 text-sm font-semibold text-brand-primary transition-all"
                        >
                          <Download className="w-4 h-4" />
                          {t.shareDownload}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopyLink}
                          data-testid="share-copy-btn"
                          className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-white/10 text-sm font-medium transition-all"
                        >
                          <Copy className="w-4 h-4" />
                          {copied ? t.shareCopied : t.shareCopyLink}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleShareTwitter}
                          data-testid="share-twitter-btn"
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 text-sm font-medium text-[#1DA1F2] transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {t.shareTwitter}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopyForWechat}
                          data-testid="share-wechat-btn"
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#07C160]/10 hover:bg-[#07C160]/20 border border-[#07C160]/20 text-sm font-medium text-[#07C160] transition-all"
                        >
                          <Copy className="w-4 h-4" />
                          {wechatCopied ? t.shareWeChatCopied : t.shareWeChat}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleShareTelegram}
                          data-testid="share-telegram-btn"
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/20 text-sm font-medium text-[#229ED9] transition-all"
                        >
                          <Send className="w-4 h-4" />
                          {telegramShareState === 'sending'
                            ? t.shareSending
                            : telegramShareState === 'sent'
                              ? t.shareSent
                              : telegramShareState === 'fallback'
                                ? t.shareTelegramFallback
                                : t.shareTelegram}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleShareWeibo}
                          data-testid="share-weibo-btn"
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#E6162D]/10 hover:bg-[#E6162D]/20 border border-[#E6162D]/20 text-sm font-medium text-[#E6162D] transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {t.shareWeibo}
                        </motion.button>
                      </div>
                      <p className="text-xs text-foreground-muted">{t.shareTelegramHint}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Recalculate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetCalculator}
                className="w-full bg-surface-elevated hover:bg-surface-elevated/80 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <RefreshCw className="w-5 h-5" />
                {t.recalculate}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default SurvivalIndexSection;
