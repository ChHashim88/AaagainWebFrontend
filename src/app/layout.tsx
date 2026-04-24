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
  metadataBase: new URL('https://bazarbeats.com'),
  title: {
    default: "Bazar Beats | Buy Premium Authentic Sneakers & Shoes Online",
    template: "%s | Bazar Beats"
  },
  description: "Shop the largest collection of 100% authentic premium sneakers, sports shoes, and limited edition footwear at Bazar Beats. Fast delivery, trusted quality, and exclusive releases.",
  keywords: ["buy sneakers online", "authentic shoes", "premium footwear", "Bazar Beats", "sneaker store", "limited edition shoes", "sports shoes", "branded sneakers", "where to buy shoes"],
  authors: [{ name: "Bazar Beats" }],
  creator: "Bazar Beats",
  publisher: "Bazar Beats",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Bazar Beats | Authentic Sneakers & Premium Footwear",
    description: "Discover a curated collection of ultra-premium footwear, limited edition releases, and exclusive trending sneakers at Bazar Beats.",
    siteName: "Bazar Beats",
    locale: "en_US",
    type: "website",
    url: "https://bazarbeats.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bazar Beats Premium Sneakers",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Bazar Beats | Authentic Sneakers",
    description: "Shop the most exclusive, high-end sneakers meticulously curated for style and authenticity.",
  },
  alternates: {
    canonical: "/",
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
