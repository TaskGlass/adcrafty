"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Check, CreditCard, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const { user, isAnonymous, subscription, updateSubscription } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [usageCount, setUsageCount] = useState(0)
  const [isTableAvailable, setIsTableAvailable] = useState(true)

  // Load user data when component mounts
  useEffect(() => {
    async function loadUserData() {
      try {
        // If user is anonymous, don't try to load data
        if (isAnonymous) {
          setIsLoading(false)
          return
        }

        // If we have a user, load their data
        if (user) {
          // Set form data
          setFormData({
            firstName: user.user_metadata?.first_name || "",
            lastName: user.user_metadata?.last_name || "",
            email: user.email || "",
          })

          // Fetch usage count
          try {
            const { count, error } = await supabase
              .from("ads")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)

            if (!error) {
              setUsageCount(count || 0)
            }
          } catch (error) {
            console.error("Error fetching usage count:", error)
          }

          // Check if subscriptions table exists
          try {
            const { error } = await supabase.from("subscriptions").select("count").limit(1).single()
            setIsTableAvailable(!error || error.code !== "42P01")
          } catch (error) {
            console.error("Error checking subscriptions table:", error)
            setIsTableAvailable(false)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user, isAnonymous])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscriptionChange = async (plan) => {
    setIsUpdatingSubscription(true)
    try {
      await updateSubscription(plan)
    } finally {
      setIsUpdatingSubscription(false)
    }
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Settings" text="Loading your settings..." />
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  // If anonymous, show login prompt
  if (isAnonymous) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Settings" text="Please log in to access settings" />
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <p>You need to be logged in to access your settings.</p>
          <Button onClick={() => router.push("/login?from=/dashboard/settings")}>Log in</Button>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your account preferences and settings" />

      <Tabs defaultValue={tabParam === "subscription" ? "subscription" : "profile"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          <Card className="bg-secondary border border-border/40">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      className="bg-background"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      className="bg-background"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="bg-background"
                    value={formData.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 mt-4" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-8">
          <Card className="bg-secondary border border-border/40">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isTableAvailable && (
                <Alert className="bg-yellow-500/10 border-yellow-500/20 mb-4">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription>
                    The subscription system is currently being set up. You are on the free plan by default. Please check
                    back later.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                {/* Free Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 rounded-lg border ${subscription.status === "free" ? "border-primary bg-primary/10" : "border-border/40 bg-background"}`}
                >
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="font-medium">Free Plan</h3>
                      <p className="text-2xl font-bold mt-2">$0</p>
                      <p className="text-sm text-muted-foreground">Forever free</p>

                      <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>5 ad generations</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Basic aspect ratios</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Ad library access</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-auto pt-4">
                      <Button
                        variant={subscription.status === "free" ? "secondary" : "outline"}
                        className="w-full"
                        disabled={subscription.status === "free" || isUpdatingSubscription || !isTableAvailable}
                        onClick={() => handleSubscriptionChange("free")}
                      >
                        {subscription.status === "free" ? (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Current Plan
                          </>
                        ) : isUpdatingSubscription ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          "Downgrade"
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 rounded-lg border relative ${subscription.status === "pro" ? "border-primary bg-primary/10" : "border-border/40 bg-background"}`}
                >
                  {subscription.status !== "pro" && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
                    </div>
                  )}
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="font-medium">Pro Plan</h3>
                      <p className="text-2xl font-bold mt-2">$19</p>
                      <p className="text-sm text-muted-foreground">Per month</p>

                      <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Unlimited ad generations</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>All aspect ratios</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Priority support</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-auto pt-4">
                      <Button
                        variant={subscription.status === "pro" ? "secondary" : "default"}
                        className={`w-full ${subscription.status !== "pro" ? "bg-primary hover:bg-primary/90" : ""}`}
                        disabled={subscription.status === "pro" || isUpdatingSubscription || !isTableAvailable}
                        onClick={() => handleSubscriptionChange("pro")}
                      >
                        {subscription.status === "pro" ? (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Current Plan
                          </>
                        ) : isUpdatingSubscription ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" /> Upgrade
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Business Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 rounded-lg border ${subscription.status === "business" ? "border-primary bg-primary/10" : "border-border/40 bg-background"}`}
                >
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="font-medium">Business Plan</h3>
                      <p className="text-2xl font-bold mt-2">$49</p>
                      <p className="text-sm text-muted-foreground">Per month</p>

                      <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Everything in Pro</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Team collaboration</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>API access</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-auto pt-4">
                      <Button
                        variant={subscription.status === "business" ? "secondary" : "default"}
                        className={`w-full ${subscription.status !== "business" ? "bg-primary hover:bg-primary/90" : ""}`}
                        disabled={subscription.status === "business" || isUpdatingSubscription || !isTableAvailable}
                        onClick={() => handleSubscriptionChange("business")}
                      >
                        {subscription.status === "business" ? (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Current Plan
                          </>
                        ) : isUpdatingSubscription ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" /> Upgrade
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Usage</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Ad generations used</p>
                  <p className="text-sm font-medium">
                    {subscription.status === "free" ? `${usageCount} of 5` : `${usageCount} (Unlimited)`}
                  </p>
                </div>
              </div>

              <div className="bg-background p-4 rounded-lg border border-border/40">
                <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {subscription.status === "free"
                    ? "No payment method required for the free plan."
                    : "Your subscription will be billed monthly."}
                </p>
                {subscription.status !== "free" && (
                  <Button variant="outline" size="sm" disabled={!isTableAvailable}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Payment Methods
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
