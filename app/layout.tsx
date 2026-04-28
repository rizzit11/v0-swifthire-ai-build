import type { Metadata, Viewport } from "next"
import { Inter, Geist, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AnalyticsProvider } from "@/components/app/analytics-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

// Typography per Section 8.2:
// - Headings: Geist (display / font-serif alias for brand titles)
// - Body: Inter (font-sans)
// - Metrics / mono: JetBrains Mono (font-mono)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: {
    default: "SwiftHire AI — AI-native recruitment for candidates and HR",
    template: "%s · SwiftHire AI",
  },
  description:
    "SwiftHire AI pairs candidates and recruiters with explainable AI: resume building, ATS-grade JD matching, AI interview coaching, and bias-aware shortlisting.",
  keywords: [
    "AI recruitment",
    "ATS score",
    "resume builder",
    "AI interview coach",
    "bias detection",
    "HR platform",
  ],
  applicationName: "SwiftHire AI",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "SwiftHire AI — AI-native recruitment",
    description:
      "Explainable AI for recruitment: resumes, JD matching, interviews, and fairness — in one platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftHire AI",
    description:
      "Explainable AI for recruitment: resumes, JD matching, interviews, and fairness.",
  },
}

export const viewport: Viewport = {
  themeColor: "#070B14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geist.variable} ${jetbrainsMono.variable} dark bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <AnalyticsProvider />
        {children}
        <Toaster richColors closeButton position="top-right" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
