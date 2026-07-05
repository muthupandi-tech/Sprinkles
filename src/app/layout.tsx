import Head from "next/head";
import CleanBodyAttributes from "@/components/CleanBodyAttributes";
import "./globals.css";
import type { Metadata } from "next";

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
      <Head>
        <script dangerouslySetInnerHTML={{ __html: "document.body.removeAttribute('data-new-gr-c-s-check-loaded');document.body.removeAttribute('data-gr-ext-installed');" }} />
      </Head>
      <body className="bg-background-app flex min-h-full flex-col text-gray-900 font-sans"><CleanBodyAttributes />
        <main className="flex flex-grow flex-col">{children}</main>
      </body>
    </html>
  );
}
