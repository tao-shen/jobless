'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Languages, Sun, Moon, Activity, Target, Shield, Clock } from 'lucide-react';
import { Language, Theme, MobileSection } from '@/lib/translations';

// 语言切换按钮
export function LanguageButton({ lang, setLang }: { lang: Language; setLang: (lang: Language) => void }) {
  return (
    <motion.button
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      className="z-50 flex items-center justify-center bg-surface-elevated hover:bg-risk-high/80 text-foreground hover:text-white w-10 h-10 rounded-lg border border-surface-elevated transition-all card-hover lang-toggle-btn"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={lang === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      <Languages className="w-5 h-5" />
    </motion.button>
  );
}

// 主题切换按钮
export function ThemeButton({ theme, setTheme }: { theme: Theme; setTheme: (theme: Theme) => void }) {
  return (
    <motion.button
      onClick={() => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('jobless-theme', next);
      }}
      className="z-50 flex items-center justify-center w-10 h-10 bg-surface-elevated hover:bg-brand-accent/80 text-foreground hover:text-white rounded-lg border border-surface-elevated transition-all theme-toggle-btn"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </motion.button>
  );
}

export function MobileBottomNav({
  lang,
  activeSection,
  onNavigate,
}: {
  lang: Language;
  activeSection: MobileSection;
  onNavigate: (section: MobileSection) => void;
}) {
  const navItems: Array<{
    id: MobileSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'overview', label: lang === 'zh' ? '概览' : 'Overview', icon: Activity },
    { id: 'risk', label: lang === 'zh' ? '评估' : 'Risk', icon: Target },
    { id: 'threat', label: lang === 'zh' ? '数据威胁' : 'Threat', icon: Shield },
    { id: 'timeline', label: lang === 'zh' ? '时间线' : 'Timeline', icon: Clock },
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<MobileSection, HTMLButtonElement | null>>({
    overview: null,
    risk: null,
    threat: null,
    timeline: null,
  });
  const [pill, setPill] = useState({ x: 0, width: 0, ready: false });

  const syncPill = useCallback(() => {
    const track = trackRef.current;
    const activeButton = buttonRefs.current[activeSection];
    if (!track || !activeButton) return;

    const x = activeButton.offsetLeft;
    const width = activeButton.offsetWidth;
    setPill((prev) => {
      const changed = prev.x !== x || prev.width !== width || !prev.ready;
      if (!changed) return prev;
      return { x, width, ready: true };
    });
  }, [activeSection]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(syncPill);
    const onResize = () => syncPill();
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [syncPill]);

  return (
    <div className="mobile-bottom-nav sm:hidden fixed left-0 right-0 z-[95] px-3" style={{ bottom: 'calc(var(--safe-bottom) + 0.55rem)' }}>
      <nav
        className="rounded-2xl border p-1.5 backdrop-blur-xl"
        style={{
          background: 'color-mix(in srgb, var(--surface) 90%, transparent)',
          borderColor: 'rgba(255,255,255,0.12)',
          boxShadow: '0 16px 36px rgba(0,0,0,0.38)',
        }}
        aria-label={lang === 'zh' ? '移动端导航' : 'Mobile navigation'}
      >
        <div ref={trackRef} className="relative grid grid-cols-4 gap-1">
          <motion.div
            initial={false}
            className="pointer-events-none absolute top-0 bottom-0 rounded-xl"
            animate={{ x: pill.x, width: pill.width, opacity: pill.ready ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,53,0.9), rgba(255,23,68,0.88))',
              boxShadow: '0 8px 18px rgba(255,23,68,0.22)',
            }}
          />
          {navItems.map((item) => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                ref={(el) => { buttonRefs.current[item.id] = el; }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(item.id)}
                className="relative z-10 flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition-all"
                style={{
                  color: active ? '#fff' : 'var(--foreground-muted)',
                }}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" />
                <span className="leading-none whitespace-nowrap">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
