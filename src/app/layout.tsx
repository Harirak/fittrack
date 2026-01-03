import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "./sw-registration";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FitTrack Pro - Fitness Tracking PWA",
  description: "Track your workouts, generate AI-powered fitness plans, and achieve your goals with FitTrack Pro.",
  manifest: "/manifest.json",
  themeColor: "#667eea",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTrack Pro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
          <Toaster />
          <ServiceWorkerRegistration />
        </body>
      </html>
    </ClerkProvider>
  );
}
