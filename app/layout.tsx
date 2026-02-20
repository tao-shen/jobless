import type { Metadata } from "next";
import "./globals.css";
import { Syne, Space_Grotesk, JetBrains_Mono } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://jobless.wiki'),
  title: "JOBLESS - AI's Impact on Jobs: Displacement, Creation, and Your Future",
  description: "Comprehensive data-driven insights on AI's impact on employment. Calculate your AI replacement risk, view job displacement data, industry analysis, and personalized action recommendations. Data from MIT, McKinsey, WEF, PwC.",
  keywords: ["AI", "employment", "jobs", "automation", "replacement risk", "job creation", "data protection", "AI training data", "WEF", "PwC", "MIT", "McKinsey"],
  openGraph: {
    title: "JOBLESS - How Fast Is AI Replacing Human Jobs?",
    description: "Calculate your AI replacement risk. MIT: 11.7% replaceable now. McKinsey: 57% technically possible. Your data is training AI to replace you.",
    siteName: "JOBLESS",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "JOBLESS - AI Job Impact Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JOBLESS - How Fast Is AI Replacing Human Jobs?",
    description: "Calculate your AI replacement risk. MIT: 11.7% replaceable now. McKinsey: 57% technically possible.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('jobless-theme');if(t){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased font-body bg-background text-foreground transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
