"use client"

import type React from "react"

import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, User } from "lucide-react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export default function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  const { user, isAnonymous, signOut } = useAuth()

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U"

    const firstName = user.user_metadata?.first_name || ""
    const lastName = user.user_metadata?.last_name || ""

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    } else if (user.email) {
      return user.email[0].toUpperCase()
    }

    return "U"
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="font-heading text-xl font-bold md:text-2xl">{heading}</h1>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}

        {!isAnonymous && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email || "User"} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email}</p>
                  {user.user_metadata?.company_name && (
                    <p className="text-xs leading-none text-primary">{user.user_metadata?.company_name}</p>
                  )}
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button size="sm" className="gap-1">
              <User className="h-4 w-4" />
              <span>Login</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
