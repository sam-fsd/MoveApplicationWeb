import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

/**
 * Fonts are self-hosted at build time by next/font, so the demo needs no
 * network at runtime — the Stitch exports load these from Google Fonts, which
 * would break an offline presentation.
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MoveApp Kenya",
    template: "%s — MoveApp Kenya",
  },
  description:
    "Find your next rental in Kenya without walking estate to estate. Admin-verified landlords and agents across Nairobi. Zero phantom listings, zero viewing fees.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
