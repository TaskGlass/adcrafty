export type AnonymousAd = {
  id: string
  title: string
  prompt: string
  imageUrl: string
  aspectRatio: string
  createdAt: string
}

const STORAGE_KEY = "anonymousAds"

export function saveAnonymousAd(ad: Omit<AnonymousAd, "id" | "createdAt">): AnonymousAd {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error("localStorage is not available")
    }

    const existingAds = getAnonymousAds()

    const newAd: AnonymousAd = {
      ...ad,
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

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
