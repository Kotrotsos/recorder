import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from 'sonner';
import { UISettingsProvider } from '@/contexts/ui-settings-context'
import { LoadingProvider } from '@/contexts/loading-context'
import { LoadingOverlay } from '@/components/ui/loading-overlay'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recordi",
  description: "Record Transcripts, Summarize, and Share"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        suppressHydrationWarning
      >
        <UISettingsProvider>
          <LoadingProvider>
            <LoadingOverlay fullHeight>
              {children}
            </LoadingOverlay>
            <Toaster position="top-center" richColors />
            <SpeedInsights />
          </LoadingProvider>
        </UISettingsProvider>
      </body>
    </html>
  );
}
