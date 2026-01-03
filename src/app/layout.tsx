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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#667eea',
          colorBackground: '#0a0a0a',
          colorInputBackground: '#1a1a1a',
          colorInputText: '#ffffff',
        },
        elements: {
          card: 'bg-gray-900/50 backdrop-blur-sm border-gray-800',
          navbar: 'bg-gray-900/50 backdrop-blur-sm border-gray-800',
          navbarButton: 'bg-gray-800 hover:bg-gray-700',
          primaryButton: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700',
          secondaryButton: 'bg-gray-800 hover:bg-gray-700',
          socialButtonsBlockButton: 'bg-gray-800 hover:bg-gray-700 border-gray-700',
          formFieldInput: 'bg-gray-800 border-gray-700',
          footer: 'bg-gray-900/50 backdrop-blur-sm',
        },
      }}
    >
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
