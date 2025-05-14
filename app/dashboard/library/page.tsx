import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard-header"
import DashboardShell from "@/components/dashboard-shell"
import AdLibrary from "@/components/ad-library"

export const metadata: Metadata = {
  title: "Library - AdCreatify",
  description: "View your content creation history",
}

export default function LibraryPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Library" text="View and manage your content creation history" />
      <div className="grid gap-8">
        <AdLibrary />
      </div>
    </DashboardShell>
  )
}
