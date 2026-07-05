import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import "./globals.css";

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
      className="h-full scroll-smooth antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="bg-background-app flex min-h-full flex-col text-gray-900 font-sans">
        <Navbar />
        <main className="flex flex-grow flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
