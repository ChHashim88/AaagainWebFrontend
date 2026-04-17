import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageWrapper from "@/components/PageWrapper";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bazar Beats | Premium Exclusives & Limited Editions",
  description: "Discover a curated collection of ultra-premium footwear, limited edition releases, and exclusive trending sneakers at Bazar Beats.",
  keywords: ["premium sneakers", "limited edition shoes", "exclusive footwear", "Bazar Beats", "sneaker store"],
  openGraph: {
    title: "Bazar Beats | Premium Footwear Collection",
    description: "Shop the most exclusive, high-end sneakers meticulously curated for style and authenticity.",
    siteName: "Bazar Beats",
    locale: "en_US",
    type: "website",
  },
  verification: {
    google: "dxK72rOV5_Mn6S2kwyVSKGUCH84pYPUj9Va_EiHPo-I",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <PageWrapper>
          {children}
        </PageWrapper>
        <Footer />
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
