import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard-header"
import DashboardShell from "@/components/dashboard-shell"
import AdLibrary from "@/components/ad-library"

export const metadata: Metadata = {
  title: "Ad Library - AdCreator AI",
  description: "View your ad creation history",
}

export default function LibraryPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Ad Library" text="View and manage your ad creation history" />
      <div className="grid gap-8">
        <AdLibrary />
      </div>
    </DashboardShell>
  )
}
