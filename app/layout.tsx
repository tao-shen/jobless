import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JOBLESS - AI's Impact on Jobs: Displacement, Creation, and Your Future",
  description: "Comprehensive data-driven insights on AI's impact on employment. View job displacement AND creation, industry analysis, and personalized risk assessment with action recommendations.",
  keywords: ["AI", "employment", "jobs", "automation", "replacement risk", "job creation", "WEF", "PwC", "MIT"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
