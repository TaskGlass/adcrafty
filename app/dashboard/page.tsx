import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard-header"
import DashboardShell from "@/components/dashboard-shell"
import AdCreator from "@/components/ad-creator"

export const metadata: Metadata = {
  title: "Dashboard - AdCreator AI",
  description: "Create and manage your AI-generated ads",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Create New Ad" text="Generate professional static image ads with AI" />
      <div className="grid gap-8">
        <AdCreator />
      </div>
    </DashboardShell>
  )
}
