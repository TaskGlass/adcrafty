"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, History, Settings, LogOut, LogIn } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, isAnonymous, signOut } = useAuth()

  // Log the authentication state for debugging
  console.log("Dashboard Nav - Auth State:", {
    isAnonymous,
    hasUser: !!user,
    userEmail: user?.email,
  })

  // Common routes for all users
  const routes = [
    {
      href: "/dashboard",
      label: "Create Ad",
      icon: <PlusCircle className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/library",
      label: "Ad Library",
      icon: <History className="mr-2 h-4 w-4" />,
    },
  ]

  // Add settings route only for authenticated users
  if (!isAnonymous) {
    routes.push({
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    })
  }

  return (
    <nav className="grid gap-2 text-sm">
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button
            variant={pathname === route.href ? "secondary" : "ghost"}
            className={`w-full justify-start ${pathname === route.href ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
          >
            {route.icon}
            {route.label}
          </Button>
        </Link>
      ))}
      <div className="mt-auto">
        {isAnonymous ? (
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
    </nav>
  )
}
