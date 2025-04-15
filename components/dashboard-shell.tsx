"use client"

import type React from "react"
import { useAuth } from "@/context/auth-context"
import DashboardNav from "@/components/dashboard-nav"
import MobileNav from "@/components/mobile-nav"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { user, isAnonymous, signOut } = useAuth()

  const userName = user?.user_metadata?.full_name || user?.email || "Guest User"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="flex items-center gap-2 font-bold text-xl transition-colors hover:text-primary">
              <motion.span
                className="text-primary text-2xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                AdCreator
              </motion.span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isAnonymous ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Sign up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.div
                  className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">{userName}</span>
                </motion.div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hidden sm:flex" onClick={signOut}>
                  Log out
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex-1 items-start md:grid md:grid-cols-[240px_1fr]">
        <aside className="fixed top-[65px] z-30 hidden h-[calc(100vh-65px)] w-full shrink-0 border-r border-border/40 md:sticky md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <DashboardNav />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <motion.div
            className="container mx-auto flex-1 space-y-8 p-4 sm:p-6 md:p-8 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
