import DashboardHeader from "@/components/dashboard-header"
import DashboardShell from "@/components/dashboard-shell"
import { AdTypeSelector } from "@/components/ad-type-selector"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Create New Ad" text="Generate professional ads with AI" />
      <div className="grid gap-8">
        <AdTypeSelector />
      </div>
    </DashboardShell>
  )
}
