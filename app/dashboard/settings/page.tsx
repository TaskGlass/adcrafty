"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { Loader2, Check, CreditCard, AlertTriangle, Upload, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { ColorPicker } from "@/components/ui/color-picker"
import { getBrandSettings, saveBrandSettings, uploadLogo, type BrandSettings } from "@/lib/brand-settings-service"
import { PasswordReset } from "@/components/auth/password-reset"

export default function SettingsPage() {
  const { user, isAnonymous, subscription, updateSubscription, session } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false)
  const [isSavingBrand, setIsSavingBrand] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    website: "",
    jobTitle: "",
  })
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    userId: "",
    logoUrl: "",
    primaryColor: "#3B82F6", // Default blue
    secondaryColor: "#1E293B", // Default dark blue/gray
    accentColor: "#10B981", // Default green
    brandTone: "",
    brandVoice: "",
  })
  const [usageCount, setUsageCount] = useState(0)
  const [isTableAvailable, setIsTableAvailable] = useState(true)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  // Calculate prices and savings
  const prices = {
    pro: {
      monthly: 79,
      yearly: 79 * 12 * 0.8, // 20% off
    },
    business: {
      monthly: 149,
      yearly: 149 * 12 * 0.8, // 20% off
    },
  }

  const savings = {
    pro: {
      percentage: 20,
      amount: prices.pro.monthly * 12 - prices.pro.yearly,
    },
    business: {
      percentage: 20,
      amount: prices.business.monthly * 12 - prices.business.yearly,
    },
  }

  // Load user data when component mounts
  useEffect(() => {
    async function loadUserData() {
      try {
        // If user is anonymous or not available yet, don't try to load data
        if (isAnonymous || !user) {
          setIsLoading(false)
          return
        }

        // Set form data
        setFormData({
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
          email: user.email || "",
          companyName: user.user_metadata?.company_name || "",
          website: user.user_metadata?.website || "",
          jobTitle: user.user_metadata?.job_title || "",
        })

        // Fetch brand settings
        try {
          const settings = await getBrandSettings(user.id)
          if (settings) {
            setBrandSettings(settings)
          } else {
            // Initialize with default settings
            setBrandSettings({
              userId: user.id,
              logoUrl: "",
              primaryColor: "#3B82F6", // Default blue
              secondaryColor: "#1E293B", // Default dark blue/gray
              accentColor: "#10B981", // Default green
              brandTone: "",
              brandVoice: "",
            })
          }
        } catch (error) {
          console.error("Error fetching brand settings:", error)
        }

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

        // Check current billing cycle if subscription exists
        try {
          const { data, error } = await supabase
            .from("subscriptions")
            .select("billing_cycle")
            .eq("user_id", user.id)
            .single()

          if (!error && data && data.billing_cycle) {
            setBillingCycle(data.billing_cycle)
          }
        } catch (error) {
          console.error("Error fetching billing cycle:", error)
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

  const handleBrandChange = (e) => {
    const { name, value } = e.target
    setBrandSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleColorChange = (colorName: string, value: string) => {
    setBrandSettings((prev) => ({
      ...prev,
      [colorName]: value,
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const file = e.target.files[0]

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or SVG file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo file must be less than 2MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingLogo(true)

    try {
      const logoUrl = await uploadLogo(user.id, file)

      setBrandSettings((prev) => ({
        ...prev,
        logoUrl,
      }))

      toast({
        title: "Logo uploaded",
        description: "Your brand logo has been successfully uploaded.",
      })
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingLogo(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveLogo = () => {
    setBrandSettings((prev) => ({
      ...prev,
      logoUrl: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          company_name: formData.companyName,
          website: formData.website,
          job_title: formData.jobTitle,
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

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingBrand(true)

    try {
      if (!user) throw new Error("User not authenticated")

      await saveBrandSettings({
        ...brandSettings,
        userId: user.id,
      })

      toast({
        title: "Brand settings saved",
        description: "Your brand settings have been successfully saved.",
      })
    } catch (error) {
      console.error("Error saving brand settings:", error)
      toast({
        title: "Error",
        description: "Failed to save brand settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingBrand(false)
    }
  }

  const handleSubscriptionChange = async (plan, cycle = billingCycle) => {
    setIsUpdatingSubscription(true)
    try {
      // Update the subscription with the plan and billing cycle
      const { error } = await supabase.from("subscriptions").upsert({
        user_id: user.id,
        plan,
        billing_cycle: cycle,
        is_active: true,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      // Update local state
      await updateSubscription(plan)
      setBillingCycle(cycle)

      toast({
        title: "Subscription updated",
        description: `Your subscription has been updated to ${plan.toUpperCase()} with ${cycle} billing.`,
      })
    } catch (error) {
      console.error("Error updating subscription:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingSubscription(false)
    }
  }

  // Update the loading state to be more user-friendly
  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Settings" text="Loading your settings..." />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your settings...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Make the anonymous user message more helpful
  if (isAnonymous || !user) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Settings" text="Please log in to access settings" />
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Account Required</h2>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to access your settings. Create an account to save your preferences and manage
              your subscription.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/login?from=/dashboard/settings")}>Log in</Button>
              <Button variant="outline" onClick={() => router.push("/signup?from=/dashboard/settings")}>
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your account preferences and settings" />

      <Tabs
        defaultValue={tabParam === "subscription" ? "subscription" : tabParam === "brand" ? "brand" : "profile"}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
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

                <div className="space-y-2 mt-4">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    className="bg-background"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      className="bg-background"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job title</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      className="bg-background"
                      value={formData.jobTitle}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Button className="bg-primary hover:bg-primary/90 mt-6" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>

              <div className="border-t border-border/40 pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Password</h3>
                <PasswordReset />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="space-y-8">
          <Card className="bg-secondary border border-border/40">
            <CardHeader>
              <CardTitle>Brand Settings</CardTitle>
              <CardDescription>Customize your brand identity for consistent ad generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleBrandSubmit}>
                {/* Logo Upload Section */}
                <div className="space-y-4">
                  <Label>Brand Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border border-border/40 rounded-md bg-background flex items-center justify-center overflow-hidden">
                      {brandSettings.logoUrl ? (
                        <img
                          src={brandSettings.logoUrl || "/placeholder.svg"}
                          alt="Brand Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-muted-foreground text-xs text-center p-2">No logo uploaded</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingLogo}
                        >
                          {isUploadingLogo ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" /> Upload Logo
                            </>
                          )}
                        </Button>
                        {brandSettings.logoUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveLogo}
                            disabled={isUploadingLogo}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Upload a PNG, JPG, or SVG file (max 2MB)</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Brand Colors Section */}
                <div className="space-y-4">
                  <Label>Brand Colors</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor" className="text-sm">
                        Primary Color
                      </Label>
                      <div className="flex items-center gap-3">
                        <ColorPicker
                          color={brandSettings.primaryColor || "#3B82F6"}
                          onChange={(color) => handleColorChange("primaryColor", color)}
                        />
                        <Input
                          id="primaryColor"
                          value={brandSettings.primaryColor || ""}
                          onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                          className="bg-background font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor" className="text-sm">
                        Secondary Color
                      </Label>
                      <div className="flex items-center gap-3">
                        <ColorPicker
                          color={brandSettings.secondaryColor || "#1E293B"}
                          onChange={(color) => handleColorChange("secondaryColor", color)}
                        />
                        <Input
                          id="secondaryColor"
                          value={brandSettings.secondaryColor || ""}
                          onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                          className="bg-background font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accentColor" className="text-sm">
                        Accent Color
                      </Label>
                      <div className="flex items-center gap-3">
                        <ColorPicker
                          color={brandSettings.accentColor || "#10B981"}
                          onChange={(color) => handleColorChange("accentColor", color)}
                        />
                        <Input
                          id="accentColor"
                          value={brandSettings.accentColor || ""}
                          onChange={(e) => handleColorChange("accentColor", e.target.value)}
                          className="bg-background font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    These colors will be used to guide the AI when generating your ads
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Brand Voice Section */}
                <div className="space-y-4">
                  <Label>Brand Voice & Tone</Label>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="brandTone" className="text-sm">
                        Brand Tone
                      </Label>
                      <Input
                        id="brandTone"
                        name="brandTone"
                        placeholder="e.g., Professional, Friendly, Casual, Authoritative"
                        className="bg-background"
                        value={brandSettings.brandTone || ""}
                        onChange={handleBrandChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brandVoice" className="text-sm">
                        Brand Voice Description
                      </Label>
                      <Textarea
                        id="brandVoice"
                        name="brandVoice"
                        placeholder="Describe your brand's voice and personality in detail..."
                        className="bg-background min-h-[100px]"
                        value={brandSettings.brandVoice || ""}
                        onChange={handleBrandChange}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your brand voice and tone will help the AI generate ad copy that matches your brand's personality
                  </p>
                </div>

                <Button className="bg-primary hover:bg-primary/90 mt-6" type="submit" disabled={isSavingBrand}>
                  {isSavingBrand ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Brand Settings"
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

              {/* Billing cycle toggle */}
              <div className="flex justify-center mb-6">
                <Tabs
                  value={billingCycle}
                  className="w-full max-w-md"
                  onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                    <TabsTrigger value="yearly">
                      Yearly Billing
                      <span className="ml-2 bg-green-500/20 text-green-500 text-xs px-2 py-0.5 rounded-full">
                        Save 20%
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

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

                      {/* Free Plan features - UPDATED */}
                      <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>3 ad generations per month</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>3 downloads per month</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Basic aspect ratios (1:1, 9:16)</span>
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
                  className={`p-4 rounded-lg border relative ${subscription.status === "pro" && billingCycle === "monthly" ? "border-primary bg-primary/10" : "border-border/40 bg-background"}`}
                >
                  {subscription.status !== "pro" && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
                    </div>
                  )}
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="font-medium">Pro Plan</h3>
                      <p className="text-2xl font-bold mt-2">
                        ${billingCycle === "monthly" ? prices.pro.monthly : Math.round(prices.pro.yearly / 12)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Per {billingCycle === "monthly" ? "month" : "month, billed annually"}
                      </p>
                      {billingCycle === "yearly" && (
                        <div className="mt-2 text-sm text-green-500 flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Save ${Math.round(savings.pro.amount)} per year
                        </div>
                      )}

                      {/* Pro Plan features - UPDATED */}
                      <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>50 ad generations per month</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>50 downloads per month</span>
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
                        variant={
                          subscription.status === "pro" && billingCycle === billingCycle ? "secondary" : "default"
                        }
                        className={`w-full ${subscription.status !== "pro" || billingCycle !== billingCycle ? "bg-primary hover:bg-primary/90" : ""}`}
                        disabled={
                          (subscription.status === "pro" && billingCycle === billingCycle) ||
                          isUpdatingSubscription ||
                          !isTableAvailable
                        }
                        onClick={() => handleSubscriptionChange("pro", billingCycle)}
                      >
                        {subscription.status === "pro" && billingCycle === billingCycle ? (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Current Plan
                          </>
                        ) : isUpdatingSubscription ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />{" "}
                            {subscription.status === "pro" ? "Switch Billing" : "Upgrade"}
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
                  className={`p-4 rounded-lg border ${subscription.status === "business" && billingCycle === billingCycle ? "border-primary bg-primary/10" : "border-border/40 bg-background"}`}
                >
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="font-medium">Business Plan</h3>
                      <p className="text-2xl font-bold mt-2">
                        $
                        {billingCycle === "monthly" ? prices.business.monthly : Math.round(prices.business.yearly / 12)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Per {billingCycle === "monthly" ? "month" : "month, billed annually"}
                      </p>
                      {billingCycle === "yearly" && (
                        <div className="mt-2 text-sm text-green-500 flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Save ${Math.round(savings.business.amount)} per year
                        </div>
                      )}

                      {/* Business Plan features - UPDATED */}
                      <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Everything in Pro</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Unlimited ad generations</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                          <span>Unlimited downloads</span>
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
                        variant={
                          subscription.status === "business" && billingCycle === billingCycle ? "secondary" : "default"
                        }
                        className={`w-full ${subscription.status !== "business" || billingCycle !== billingCycle ? "bg-primary hover:bg-primary/90" : ""}`}
                        disabled={
                          (subscription.status === "business" && billingCycle === billingCycle) ||
                          isUpdatingSubscription ||
                          !isTableAvailable
                        }
                        onClick={() => handleSubscriptionChange("business", billingCycle)}
                      >
                        {subscription.status === "business" && billingCycle === billingCycle ? (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Current Plan
                          </>
                        ) : isUpdatingSubscription ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />{" "}
                            {subscription.status === "business" ? "Switch Billing" : "Upgrade"}
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
                {/* Usage display - UPDATED */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Ad generations used</p>
                  <p className="text-sm font-medium">
                    {subscription.status === "free"
                      ? `${usageCount} of 3`
                      : subscription.status === "pro"
                        ? `${usageCount} of 50`
                        : `${usageCount} (Unlimited)`}
                  </p>
                </div>
              </div>

              <div className="bg-background p-4 rounded-lg border border-border/40">
                <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {subscription.status === "free"
                    ? "No payment method required for the free plan."
                    : `Your subscription will be billed ${billingCycle}.`}
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
