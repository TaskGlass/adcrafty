import type { Metadata } from "next"
import DashboardHeader from "@/components/dashboard-header"
import DashboardShell from "@/components/dashboard-shell"
import AdLibrary from "@/components/ad-library"

export const metadata: Metadata = {
  title: "Ad Library - AdCreatify",
  description: "View your image and video ad creation history",
}

export default function LibraryPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Ad Library" text="View and manage your image and video ad creation history" />
      <div className="grid gap-8">
        <AdLibrary />
      </div>
    </DashboardShell>
  )
}
