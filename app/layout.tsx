import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JOBLESS - How fast is AI replacing human jobs?",
  description: "Data-driven insights on AI's replacement of human jobs. View job risk rankings, global impact data, and future predictions.",
  keywords: ["AI", "employment", "jobs", "automation", "replacement risk", "data visualization"],
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
