import { supabase } from "./supabase"

export type Ad = {
  id?: string
  title: string
  prompt: string
  imageUrl: string
  aspectRatio: string
  userId: string
  createdAt?: string
}

export async function createAd(ad: Ad) {
  const { data, error } = await supabase
    .from("ads")
    .insert([
      {
        title: ad.title || "Untitled Ad",
        prompt: ad.prompt,
        image_url: ad.imageUrl,
        aspect_ratio: ad.aspectRatio,
        user_id: ad.userId,
      },
    ])
    .select()

  if (error) {
    throw error
  }

  return data[0]
}

export async function getUserAds(userId: string) {
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data.map((ad) => ({
    id: ad.id,
    title: ad.title,
    prompt: ad.prompt,
    imageUrl: ad.image_url,
    aspectRatio: ad.aspect_ratio,
    createdAt: ad.created_at,
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
