import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["700"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "TradePro | Professional Trading Platform",
  description: "Experience the future of trading with our AI-powered platform. Real-time analytics, TradingView integration, and intelligent trading assistance at your fingertips.",
  keywords: ["trading", "forex", "cryptocurrency", "stocks", "AI trading", "portfolio analytics", "TradingView"],
  authors: [{ name: "TradePro" }],
  openGraph: {
    title: "TradePro | Professional Trading Platform",
    description: "Experience the future of trading with our AI-powered platform.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradePro | Professional Trading Platform",
    description: "Experience the future of trading with our AI-powered platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-primary text-white`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
