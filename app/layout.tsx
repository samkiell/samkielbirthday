import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "samkiel turns 20 · Another Year. Another Chapter.",
  description:
    "A personal digital journal for October 11, 2026. Another year older. Still becoming.",
  openGraph: {
    title: "samkiel turns 20 · Another Year. Another Chapter.",
    description: "Another year older. Still becoming. October 11, 2026.",
    url: "https://birthday.samkiel.dev",
    siteName: "birthday.samkiel.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "samkiel turns 20 · Another Year. Another Chapter.",
    description: "Another year older. Still becoming. October 11, 2026.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F3EE" },
    { media: "(prefers-color-scheme: dark)", color: "#121210" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink antialiased flex flex-col selection:bg-accent selection:text-paper">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />

          <main className="flex-1 pt-14">{children}</main>

          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "var(--paper)",
                color: "var(--ink)",
                border: "1px solid var(--hairline)",
                fontFamily: "var(--font-geist-sans)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
