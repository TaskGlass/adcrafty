import { supabase } from "./supabase"

// Update the Ad interface to include the new fields
export interface Ad {
  id?: string
  title: string
  prompt: string
  imageUrl: string
  aspectRatio: string
  userId: string
  createdAt?: string
  type?: "image" | "video"
  adCopy?: any
  adTone?: string
  adCta?: string
  adOffer?: string
  adPoints?: string[]
}

// Update the createAd function to handle missing columns
export async function createAd(ad: Ad): Promise<Ad> {
  try {
    // Set default type to 'image' if not provided
    const adWithType = {
      ...ad,
      type: ad.type || "image",
    }

    // Create a base insert object with only the required fields that we know exist
    // This avoids any schema issues with newer fields that might not exist yet
    const basicInsertObj = {
      title: adWithType.title || "Untitled Ad",
      prompt: adWithType.prompt,
      image_url: adWithType.imageUrl,
      aspect_ratio: adWithType.aspectRatio,
      user_id: adWithType.userId,
      type: adWithType.type || "image",
    }

    // First try with just the basic fields that should always exist
    console.log("Inserting ad with basic fields only")
    const { data, error } = await supabase.from("ads").insert([basicInsertObj]).select()

    if (error) {
      console.error("Error inserting ad with basic fields:", error)
      throw error
    }

    return data[0] as Ad
  } catch (error) {
    console.error("Error in createAd:", error)
    throw error
  }
}

// Update the getUserAds function to map the new fields
export async function getUserAds(userId: string) {
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  // Safely map the data, handling missing columns
  return data.map((ad) => ({
    id: ad.id,
    title: ad.title,
    prompt: ad.prompt,
    imageUrl: ad.image_url,
    aspectRatio: ad.aspect_ratio,
    createdAt: ad.created_at,
    type: ad.type || "image",
    // Use optional chaining to safely handle missing columns
    adCopy: ad.ad_copy ?? null,
    adTone: ad.ad_tone ?? null,
    adCta: ad.ad_cta ?? null,
    adOffer: ad.ad_offer ?? null,
    adPoints: ad.ad_points ?? null,
  }))
}

export async function deleteAd(id: string) {
  const { error } = await supabase.from("ads").delete().eq("id", id)

  if (error) {
    throw error
  }

  return true
}

export async function getUserUsageCount(userId: string) {
  const { count, error } = await supabase.from("ads").select("*", { count: "exact", head: true }).eq("user_id", userId)

  if (error) {
    throw error
  }

  return count || 0
}

// New function to get usage count by aspect ratio
export async function getUserUsageCountByAspectRatio(userId: string, aspectRatio: string) {
  const { count, error } = await supabase
    .from("ads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("aspect_ratio", aspectRatio)

  if (error) {
    throw error
  }

  return count || 0
}

// Update the getUserAdsByType function to map the new fields
export async function getUserAdsByType(userId: string, type: "image" | "video") {
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  // Safely map the data, handling missing columns
  return data.map((ad) => ({
    id: ad.id,
    title: ad.title,
    prompt: ad.prompt,
    imageUrl: ad.image_url,
    aspectRatio: ad.aspect_ratio,
    createdAt: ad.created_at,
    type: ad.type,
    adCopy: ad.ad_copy ?? null,
    adTone: ad.ad_tone ?? null,
    adCta: ad.ad_cta ?? null,
    adOffer: ad.ad_offer ?? null,
    adPoints: ad.ad_points ?? null,
  }))
}

// Add a function to get ads by type
export async function getAdsByType(userId: string, type: "image" | "video"): Promise<Ad[]> {
  // Implementation would depend on your database structure
  // For now, we'll filter the ads after fetching them all
  const ads = await getUserAds(userId)
  return ads.filter((ad) => ad.type === type || (!ad.type && type === "image"))
}
