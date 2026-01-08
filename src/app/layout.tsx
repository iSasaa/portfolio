import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://joansasanedas.dev"),
  title: {
    default: "Joan Sasanedas | Software Engineer",
    template: "%s | Joan Sasanedas",
  },
  description:
    "Software Engineer & UX/UI Designer Portfolio. Specializing in Python, Next.js, and Cloud Infrastructure.",
  keywords: [
    "Software Engineer",
    "Python",
    "Next.js",
    "Cloud Infrastructure",
    "Portfolio",
    "Joan Sasanedas",
    "Web Development",
  ],
  authors: [{ name: "Joan Sasanedas" }],
  openGraph: {
    title: "Joan Sasanedas | Software Engineer",
    description:
      "Software Engineer & UX/UI Designer Portfolio. Specializing in Python, Next.js, and Cloud Infrastructure.",
    url: "/",
    siteName: "Joan Sasanedas Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joan Sasanedas | Software Engineer",
    description:
      "Software Engineer & UX/UI Designer Portfolio. Specializing in Python, Next.js, and Cloud Infrastructure.",
    creator: "@joansasanedas",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NavBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
