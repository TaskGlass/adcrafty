"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, History, Settings, LogOut, LogIn } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import React from "react"
import { SubscriptionStatus } from "@/components/subscription-status"

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, isAnonymous, signOut } = useAuth()

  // Common routes for all users
  const routes = [
    {
      href: "/dashboard",
      label: "Create",
      icon: <PlusCircle className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/library",
      label: "Library",
      icon: <History className="mr-2 h-4 w-4" />,
    },
  ]

  // Add settings route for all users
  // We'll handle authentication in the settings page itself
  routes.push({
    href: "/dashboard/settings",
    label: "Settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  })

  return (
    <div className="flex flex-col h-full">
      <nav className="grid gap-2 text-sm">
        {routes.map((route, index) => (
          <React.Fragment key={route.href}>
            {index === routes.length - 1 && <div className="my-2 border-t border-border/40"></div>}
            <Link href={route.href} prefetch={true}>
              <Button
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={`w-full justify-start ${pathname === route.href ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
              >
                {route.icon}
                {route.label}
              </Button>
            </Link>
          </React.Fragment>
        ))}
      </nav>

      <div className="mt-auto pt-4">
        {/* Subscription Status */}
        <SubscriptionStatus />

        {isAnonymous || !user ? (
          <Link href="/login">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <LogIn className="mr-2 h-4 w-4" />
              Log in
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        )}
      </div>
    </div>
  )
}
