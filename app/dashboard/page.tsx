import DashboardHeader from "@/components/dashboard-header"
import DashboardShell from "@/components/dashboard-shell"
import { AdTypeSelector } from "@/components/ad-type-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Sparkles } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Create New Ad" text="Generate professional ads with AI" />

      <Card className="mb-8 bg-primary/10 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <CardTitle>New: Ad Performance Analyzer</CardTitle>
          </div>
          <CardDescription>
            Our AI now analyzes your ads and provides a performance score out of 100, with detailed feedback to help you
            improve your ads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Create an ad or go to your Ad Library to analyze existing ads.</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8">
        <AdTypeSelector />
      </div>
    </DashboardShell>
  )
}
