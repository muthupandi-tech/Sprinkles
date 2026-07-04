import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sprinkles | AI Personal Communication & Spoken English Coach",
  description:
    "Master spoken English, boost conversation confidence, enhance vocabulary, and prepare for interviews with Sprinkles—your personal AI communication mentor.",
  metadataBase: new URL("https://sprinkles.vercel.app"),
  openGraph: {
    title: "Sprinkles | AI Personal Communication Coach",
    description:
      "Boost spoken English fluency, pronunciation, and vocabulary with personalized learning paths.",
    url: "https://sprinkles.vercel.app",
    siteName: "Sprinkles",
    locale: "en_US",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="bg-background-app flex min-h-full flex-col text-gray-900">
        <Navbar />
        <main className="flex flex-grow flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
