import { supabase } from "./supabase"
import { getAnonymousDownloadCount, incrementAnonymousDownloadCount } from "./anonymous-storage"

// Track monthly usage for authenticated users
export async function getMonthlyUsage(userId: string) {
  try {
    // Get the first day of the current month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Query ads created this month
    const { data: adsThisMonth, error: adsError } = await supabase
      .from("ads")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", firstDayOfMonth.toISOString())

    if (adsError) {
      console.error("Error fetching monthly ad usage:", adsError)
      return { generations: 0, downloads: 0 }
    }

    // Query downloads this month
    const { data: downloadsThisMonth, error: downloadsError } = await supabase
      .from("downloads")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", firstDayOfMonth.toISOString())

    // If downloads table doesn't exist yet, return 0 downloads
    if (downloadsError && downloadsError.code === "42P01") {
      return {
        generations: adsThisMonth?.length || 0,
        downloads: 0,
      }
    }

    if (downloadsError) {
      console.error("Error fetching monthly download usage:", downloadsError)
      return {
        generations: adsThisMonth?.length || 0,
        downloads: 0,
      }
    }

    return {
      generations: adsThisMonth?.length || 0,
      downloads: downloadsThisMonth?.length || 0,
    }
  } catch (error) {
    console.error("Error in getMonthlyUsage:", error)
    return { generations: 0, downloads: 0 }
  }
}

// Track download for authenticated users
export async function trackDownload(userId: string, adId: string) {
  try {
    // Check if downloads table exists
    const { error: checkError } = await supabase.from("downloads").select("count").limit(1).single()

    // If table doesn't exist, create it
    if (checkError && checkError.code === "42P01") {
      await supabase.rpc("create_downloads_table", {})
    }

    // Record the download
    const { error } = await supabase.from("downloads").insert({
      user_id: userId,
      ad_id: adId,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error tracking download:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in trackDownload:", error)
    return false
  }
}

// Get usage limits based on subscription status
export function getUsageLimits(subscriptionStatus: string | null) {
  switch (subscriptionStatus) {
    case "business":
      return {
        generations: Number.POSITIVE_INFINITY,
        downloads: Number.POSITIVE_INFINITY,
      }
    case "pro":
      return {
        generations: 50,
        downloads: 50,
      }
    case "free":
    default:
      return {
        generations: 3,
        downloads: 3,
      }
  }
}

// Check if user can download
export async function canUserDownload(userId: string | null, subscriptionStatus: string | null) {
  // For anonymous users
  if (!userId) {
    const downloadCount = getAnonymousDownloadCount()
    const limits = getUsageLimits("free")
    return downloadCount < limits.downloads
  }

  // For authenticated users
  const limits = getUsageLimits(subscriptionStatus)
  const { downloads } = await getMonthlyUsage(userId)

  return downloads < limits.downloads
}

// Track anonymous download
export function trackAnonymousDownload() {
  incrementAnonymousDownloadCount()
}
