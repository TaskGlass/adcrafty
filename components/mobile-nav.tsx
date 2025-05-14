"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, PlusCircle, History, Settings, LogOut, LogIn } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { isAnonymous, signOut } = useAuth()

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background border-r border-border/40 p-0">
        <div className="flex h-16 items-center border-b border-border/40 px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setOpen(false)}>
            <span className="text-primary text-2xl">AdCrafty</span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <nav className="grid gap-2 p-4 text-sm">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} onClick={() => setOpen(false)}>
              <Button
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={`w-full justify-start ${pathname === route.href ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
              >
                {route.icon}
                {route.label}
              </Button>
            </Link>
          ))}
          <div className="mt-auto pt-4">
            {isAnonymous ? (
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  setOpen(false)
                  signOut()
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
