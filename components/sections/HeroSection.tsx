'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, Zap, TrendingDown, ExternalLink, ChevronDown } from 'lucide-react';
import { Language, translations } from '@/lib/translations';
import Counter from '@/components/Counter';
import AIKillLineBar from '@/components/AIKillLineBar';

function HeroSection({ lang, t }: { lang: Language; t: typeof translations.en }) {
  const [activeStat, setActiveStat] = useState<number | null>(null);

  return (
    <section className="no-contain relative z-40 min-h-[100dvh] flex items-center justify-center py-12 sm:py-20">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-risk-high/40 rounded-full blur-[80px] md:blur-[120px] hero-bg-pulse-once"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-brand-primary/30 rounded-full blur-[60px] md:blur-[100px] hero-bg-pulse-once" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-brand-accent/20 rounded-full blur-[80px] md:blur-[150px] hero-bg-pulse-once" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      <div className="relative z-30 text-center px-4 sm:px-6 max-w-6xl mx-auto hero-glow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Alert badge */}
          <div className="inline-flex items-center gap-2 bg-risk-critical/10 text-risk-critical px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-risk-critical/20">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="tracking-wide">{t.alertBadge}</span>
          </div>

          {/* Hero title — big and eye-catching */}
          <h1 className="calc-title text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-6 sm:mb-8 section-title" style={{ fontFamily: 'var(--font-display)' }}>
            {t.heroTitle}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed section-subtitle">
            {t.heroSubtitlePre}{t.heroSubtitlePost}{t.heroSubtitleEnd}
          </p>
        </motion.div>

        {/* Progress bar section */}
        <motion.div
          className="pt-8 sm:pt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative z-20 calc-container rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10" style={{ overflow: 'visible' }}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-foreground text-left">{t.progressTitle}</h2>
            <AIKillLineBar lang={lang} t={t} />

            {/* Stat cards — unified card on mobile, 3-col on sm+ */}
            {(() => {
              const stats = [
                { value: <Counter end={43.64} suffix="%" />, color: 'var(--risk-high)', icon: Eye, label: t.exposureLabel, desc: t.exposureDesc, source: t.exposureSource, url: t.exposureUrl },
                { value: <Counter end={49.75} suffix="%" />, color: 'var(--brand-accent)', icon: Zap, label: t.proficiencyLabel, desc: t.proficiencyDesc, source: t.proficiencySource, url: t.proficiencyUrl },
                { value: <>92M</>, color: 'var(--risk-critical)', icon: TrendingDown, label: t.jobsBy2030, desc: t.jobsBy2030Desc, source: t.jobsBy2030Source, url: t.jobsBy2030Url },
              ] as const;

              return (
                <>
                  {/* Mobile: single unified card with divide-y */}
                  <div className="sm:hidden mt-4 rounded-xl bg-surface border border-surface-elevated divide-y divide-surface-elevated">
                    {stats.map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={i}
                          className="px-4 py-3 cursor-pointer transition-colors active:bg-surface-elevated/50"
                          onClick={() => setActiveStat(activeStat === i ? null : i)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}>
                                <Icon className="w-4 h-4" style={{ color: stat.color }} />
                              </div>
                              <span className="text-xs text-foreground-muted font-medium">{stat.label}</span>
                            </div>
                            <span
                              className="inline-flex items-center rounded-md px-2 py-0.5 text-sm mono font-semibold leading-none flex-shrink-0"
                              style={{
                                fontVariantNumeric: 'tabular-nums',
                                color: stat.color,
                                backgroundColor: `color-mix(in srgb, ${stat.color} 10%, transparent)`,
                              }}
                            >
                              {stat.value}
                            </span>
                          </div>
                          <AnimatePresence>
                            {activeStat === i && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-2.5 mt-2.5 text-left" style={{ borderTop: `1px solid color-mix(in srgb, ${stat.color} 15%, transparent)` }}>
                                  <div className="text-xs text-foreground-muted leading-relaxed mb-2">{stat.desc}</div>
                                  <a href={stat.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium transition-colors" style={{ color: stat.color }}>
                                    <ExternalLink className="w-3 h-3" />
                                    {stat.source}
                                  </a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop: 3-column grid */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {stats.map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className="group relative rounded-xl p-4 bg-surface border border-surface-elevated">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}>
                                <Icon className="w-4 h-4" style={{ color: stat.color }} />
                              </div>
                              <span className="hero-stat-label text-sm text-foreground-muted font-medium">{stat.label}</span>
                            </div>
                            <span
                              className="inline-flex items-center rounded-md px-2 py-0.5 text-base mono font-semibold leading-none flex-shrink-0"
                              style={{
                                fontVariantNumeric: 'tabular-nums',
                                color: stat.color,
                                backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                                border: `1px solid color-mix(in srgb, ${stat.color} 30%, transparent)`,
                              }}
                            >
                              {stat.value}
                            </span>
                          </div>
                          {/* Desktop: hover tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-30 w-max max-w-[260px]">
                            <div className="px-3 py-3 rounded-xl"
                              style={{ background: 'var(--surface-card)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}
                            >
                              <div className="text-[11px] text-foreground-muted leading-relaxed mb-2">{stat.desc}</div>
                              <a href={stat.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-medium transition-colors" style={{ color: stat.color }}>
                                <ExternalLink className="w-3 h-3" />
                                {stat.source}
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </motion.div>

        {/* CTA — scroll to calculator, outside the card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-10 flex justify-center"
        >
          <button
            onClick={() => document.getElementById('risk-calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="group flex items-center gap-1.5 cursor-pointer"
          >
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-4 h-4 text-foreground-muted" />
            </motion.div>
            <span className="text-sm font-medium text-foreground-muted">
              {t.transitionCta}
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
