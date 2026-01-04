import type { Metadata, Viewport } from "next";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTrack Pro",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F6F6", // Fresh Lime (Whitesmoke Background)
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
          colorPrimary: '#22C55E', // Forest Green
        },
        elements: {
          card: 'bg-white shadow-xl border-gray-100 rounded-[20px]',
          navbar: 'bg-white/80 backdrop-blur-sm border-gray-100',
          navbarButton: 'hover:bg-gray-100',
          primaryButton: 'bg-[#22C55E] text-white hover:bg-[#16a34a] shadow-sm', // Use darker green for hover
          secondaryButton: 'bg-[#F6F6F6] hover:bg-gray-200 text-black',
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
          {children}
          <Toaster />
          <ServiceWorkerRegistration />
        </body>
      </html>
    </ClerkProvider>
  );
}
