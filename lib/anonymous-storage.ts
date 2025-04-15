export interface AnonymousAd {
  title: string
  prompt: string
  imageUrl: string
  aspectRatio: string
  type?: "image" | "video"
  id: string
  createdAt: string
  adCopy?: any
}

const STORAGE_KEY = "anonymousAds"

export function saveAnonymousAd(ad: Omit<AnonymousAd, "id" | "createdAt">): AnonymousAd {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error("localStorage is not available")
    }

    const adWithType = {
      ...ad,
      type: ad.type || "image",
    }

    const existingAds = getAnonymousAds()

    const newAd: AnonymousAd = {
      ...adWithType,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }

    const updatedAds = [newAd, ...existingAds]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAds))

    return newAd
  } catch (error) {
    console.error("Error saving anonymous ad:", error)
    throw error
  }
}

export function getAnonymousAds(): AnonymousAd[] {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return []
    }

    const adsJson = localStorage.getItem(STORAGE_KEY)
    return adsJson ? JSON.parse(adsJson) : []
  } catch (error) {
    console.error("Error getting anonymous ads:", error)
    return []
  }
}

export function deleteAnonymousAd(id: string): boolean {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return false
    }

    const existingAds = getAnonymousAds()
    const updatedAds = existingAds.filter((ad) => ad.id !== id)

    if (updatedAds.length === existingAds.length) {
      return false // No ad was deleted
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAds))
    return true
  } catch (error) {
    console.error("Error deleting anonymous ad:", error)
    return false
  }
}

export function getAnonymousAdCount(): number {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return 0
    }

    return getAnonymousAds().length
  } catch (error) {
    console.error("Error getting anonymous ad count:", error)
    return 0
  }
}

// New function to get usage count by aspect ratio
export function getAnonymousAdCountByAspectRatio(aspectRatio: string): number {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return 0
    }

    const ads = getAnonymousAds()
    return ads.filter((ad) => ad.aspectRatio === aspectRatio).length
  } catch (error) {
    console.error("Error getting anonymous ad count by aspect ratio:", error)
    return 0
  }
}

// Add a function to get anonymous ads by type
export function getAnonymousAdsByType(type: "image" | "video"): AnonymousAd[] {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return []
    }

    const ads = getAnonymousAds()
    return ads.filter((ad) => ad.type === type || (!ad.type && type === "image"))
  } catch (error) {
    console.error("Error getting anonymous ads by type:", error)
    return []
  }
}

// Add these functions to track anonymous downloads

const DOWNLOAD_STORAGE_KEY = "anonymousDownloads"

export function getAnonymousDownloadCount(): number {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return 0
    }

    const count = localStorage.getItem(DOWNLOAD_STORAGE_KEY)
    return count ? Number.parseInt(count, 10) : 0
  } catch (error) {
    console.error("Error getting anonymous download count:", error)
    return 0
  }
}

export function incrementAnonymousDownloadCount(): void {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return
    }

    const currentCount = getAnonymousDownloadCount()
    localStorage.setItem(DOWNLOAD_STORAGE_KEY, (currentCount + 1).toString())
  } catch (error) {
    console.error("Error incrementing anonymous download count:", error)
  }
}

// Add a function to reset download count at the beginning of each month
export function checkAndResetMonthlyCounters(): void {
  try {
    if (typeof window === "undefined") {
      return
    }

    const lastResetMonth = localStorage.getItem("lastResetMonth")
    const currentMonth = new Date().getMonth()

    // If we haven't reset this month or it's a new month
    if (!lastResetMonth || Number.parseInt(lastResetMonth, 10) !== currentMonth) {
      // Reset download counter
      localStorage.setItem(DOWNLOAD_STORAGE_KEY, "0")
      // Update the last reset month
      localStorage.setItem("lastResetMonth", currentMonth.toString())
    }
  } catch (error) {
    console.error("Error checking monthly counters:", error)
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
