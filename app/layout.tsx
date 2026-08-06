import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Atomica",
  description: "Your intelligent companion for chemistry mastery.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/brand/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
