'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Zap, Skull, Flame, Cpu, Database, FileText, RefreshCw, Info, Lock, CheckCircle2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { platformAgreements, dataProtectionTranslations } from '@/lib/data-protection';
import type { Language } from '@/lib/data-protection';

function LanguageButton({ lang, setLang }: { lang: Language; setLang: (lang: Language) => void }) {
  return (
    <motion.button
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      className="z-50 flex items-center gap-2 bg-surface-elevated hover:bg-risk-high/80 text-foreground hover:text-white px-3 py-2 rounded-lg border border-surface-elevated transition-all card-hover lang-toggle-btn"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="font-medium">{lang === 'en' ? '中文' : 'EN'}</span>
    </motion.button>
  );
}

function LastMileSection({ lang, t }: { lang: Language; t: typeof dataProtectionTranslations.en }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="result-card rounded-2xl p-8 border border-surface-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">{t.lastMileTitle}</h3>
            </div>
            <p className="text-foreground-muted mb-8">{t.lastMileDesc}</p>

            {/* Visual Flow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-brand-accent/10 border border-brand-accent/20 rounded-xl p-5 text-center"
              >
                <Cpu className="w-8 h-8 text-brand-accent mx-auto mb-3" />
                <div className="font-semibold text-sm">{t.lastMileStep1}</div>
                <div className="text-xs text-foreground-muted mt-1">{t.lastMileStep1Desc}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="hidden md:flex flex-col items-center"
              >
                <div className="text-xs text-foreground-muted mb-1">{t.lastMileArrow1}</div>
                <div className="text-2xl text-risk-high">→</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-risk-high/10 border-2 border-risk-high/40 rounded-xl p-5 text-center relative"
              >
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-risk-critical rounded-full animate-pulse" />
                <Database className="w-8 h-8 text-risk-high mx-auto mb-3" />
                <div className="font-semibold text-sm text-risk-high">{t.lastMileStep2}</div>
                <div className="text-xs text-foreground-muted mt-1">{t.lastMileStep2Desc}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="hidden md:flex flex-col items-center"
              >
                <div className="text-xs text-foreground-muted mb-1">{t.lastMileArrow2}</div>
                <div className="text-2xl text-risk-critical">→</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-risk-critical/10 border border-risk-critical/30 rounded-xl p-5 text-center"
              >
                <Skull className="w-8 h-8 text-risk-critical mx-auto mb-3" />
                <div className="font-semibold text-sm text-risk-critical">{t.lastMileStep3}</div>
                <div className="text-xs text-foreground-muted mt-1">{t.lastMileStep3Desc}</div>
              </motion.div>
            </div>

            {/* Mobile arrows */}
            <div className="flex md:hidden flex-col items-center gap-2 my-4">
              <div className="text-foreground-muted text-lg">↓</div>
            </div>

            {/* Warning */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-4 rounded-xl bg-gradient-to-r from-risk-critical/10 to-risk-high/10 border border-risk-critical/20"
            >
              <p className="text-sm font-semibold text-center">
                <AlertTriangle className="w-4 h-4 inline text-risk-critical mr-2 align-middle" />
                {t.lastMileWarning}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PlatformAgreementsSection({ lang, t }: { lang: Language; t: typeof dataProtectionTranslations.en }) {
  const riskColors = {
    high: { bg: 'bg-risk-critical/15', border: 'border-risk-critical/30', text: 'text-risk-critical' },
    medium: { bg: 'bg-risk-high/15', border: 'border-risk-high/30', text: 'text-risk-high' },
    low: { bg: 'bg-risk-low/15', border: 'border-risk-low/30', text: 'text-risk-low' },
  };

  const riskLabels = {
    high: t.platformRiskHigh,
    medium: t.platformRiskMedium,
    low: t.platformRiskLow,
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="result-card rounded-2xl p-8 border border-surface-elevated">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-risk-critical to-risk-high flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">{t.platformTitle}</h3>
            </div>
            <p className="text-foreground-muted mb-6 text-sm">{t.platformSubtitle}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-elevated">
                    <th className="text-left py-3 px-4 text-foreground-muted font-semibold">{t.platformName}</th>
                    <th className="text-left py-3 px-4 text-foreground-muted font-semibold">{t.platformClause}</th>
                    <th className="text-left py-3 px-4 text-foreground-muted font-semibold">{t.platformRisk}</th>
                    <th className="text-left py-3 px-4 text-foreground-muted font-semibold">{t.platformTrains}</th>
                  </tr>
                </thead>
                <tbody>
                  {platformAgreements.map((platform, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-surface-elevated/50 hover:bg-surface-elevated/30 transition-colors"
                    >
                      <td className="py-4 px-4 font-semibold whitespace-nowrap">{platform.name}</td>
                      <td className="py-4 px-4 text-foreground-muted">{platform.clause[lang]}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${riskColors[platform.risk].bg} ${riskColors[platform.risk].border} ${riskColors[platform.risk].text} border`}>
                          {riskLabels[platform.risk]}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-foreground-muted text-xs">{platform.trains[lang]}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeedbackLoopSection({ lang, t }: { lang: Language; t: typeof dataProtectionTranslations.en }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="result-card rounded-2xl p-8 border-2 border-risk-critical/20 bg-gradient-to-br from-risk-critical/5 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-risk-critical/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-risk-critical" />
              </div>
              <h3 className="text-xl font-bold">{t.feedbackLoopTitle}</h3>
            </div>

            {/* Loop Visualization */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-sm">
              {t.feedbackLoopDesc.split('→').map((step, i, arr) => (
                <span key={i} className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-lg bg-surface-elevated border border-surface-elevated font-medium">
                    {step.trim()}
                  </span>
                  {i < arr.length - 1 && <span className="text-risk-critical text-lg">→</span>}
                </span>
              ))}
            </div>

            <div className="bg-surface-card rounded-xl p-5 mb-4 border border-white/5">
              <p className="text-sm text-foreground-muted">
                <Info className="w-4 h-4 inline text-brand-accent mr-2 align-middle" />
                {t.feedbackLoopExample}
              </p>
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-risk-critical">
                <Flame className="w-5 h-5 inline mr-2 align-middle" />
                {t.feedbackLoopStat}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProtectionChecklistSection({ lang, t }: { lang: Language; t: typeof dataProtectionTranslations.en }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="result-card rounded-2xl p-8 border border-risk-low/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-risk-low to-brand-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">{t.protectionTitle}</h3>
            </div>
            <p className="text-foreground-muted mb-6 text-sm">{t.protectionSubtitle}</p>

            <div className="space-y-3">
              {[t.protection1, t.protection2, t.protection3, t.protection4, t.protection5].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-surface-card/50 border border-white/5"
                >
                  <CheckCircle2 className="w-5 h-5 text-risk-low flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function DataProtectionPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = dataProtectionTranslations[lang];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LanguageButton lang={lang} setLang={setLang} />

      {/* Page Header */}
      <section className="py-20 px-6 bg-gradient-to-br from-surface to-background border-b border-surface-elevated relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-risk-critical/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors">
              <span>{t.backToHome}</span>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-risk-critical/10 border border-risk-critical/20 mb-6"
          >
            <Lock className="w-4 h-4 text-risk-critical" />
            <span className="text-sm font-medium text-risk-critical">DATA THREAT</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t.dataThreatTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-foreground-muted max-w-3xl mx-auto"
          >
            {t.dataThreatSubtitle}
          </motion.p>
        </div>
      </section>

      <LastMileSection lang={lang} t={t} />
      <PlatformAgreementsSection lang={lang} t={t} />
      <FeedbackLoopSection lang={lang} t={t} />
      <ProtectionChecklistSection lang={lang} t={t} />

      {/* Back to Home Footer */}
      <section className="py-12 px-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-lg"
        >
          {t.backToHome}
        </Link>
      </section>
    </main>
  );
}
