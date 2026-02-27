import { Language, translations } from '@/lib/translations';

// Footer
function Footer({ lang, t }: { lang: Language; t: typeof translations.en }) {
  return (
    <footer className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-2">{t.title}</h3>
            <p className="text-foreground-muted text-sm">{t.tagline}</p>
          </div>
          <div className="text-sm text-foreground-muted">
            <p className="font-semibold mb-2">{t.dataSources}</p>
            <p>{t.sources}</p>
            <p>{t.sources2}</p>
          </div>
        </div>
        <div className="text-center text-xs text-foreground-muted pt-6">
          <p>⚠️ {t.disclaimer}</p>
          <p className="mt-1">{t.disclaimer2}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
