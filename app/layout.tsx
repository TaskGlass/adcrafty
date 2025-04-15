import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AdCreator AI - Create stunning ads with AI",
  description: "Generate professional static image ads for Meta and Google with AI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if we're in a browser environment and if Supabase env vars are available
  const isMissingEnvVars =
    typeof window !== "undefined" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} antialiased`}>
        {isMissingEnvVars ? (
          <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
            <p className="mb-6 max-w-md">
              Supabase environment variables are missing. Please make sure NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_ANON_KEY are properly configured.
            </p>
          </div>
        ) : (
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
              <div className="min-h-screen flex flex-col">{children}</div>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        )}
      </body>
    </html>
  )
}


import './globals.css'