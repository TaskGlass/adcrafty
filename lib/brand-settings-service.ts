import { supabase } from "./supabase"

export type BrandSettings = {
  id?: string
  userId: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  brandTone?: string
  brandVoice?: string
  createdAt?: string
  updatedAt?: string
}

export async function getBrandSettings(userId: string): Promise<BrandSettings | null> {
  try {
    const { data, error } = await supabase.from("brand_settings").select("*").eq("user_id", userId).single()

    if (error) {
      // If no record found, return null instead of throwing an error
      if (error.code === "PGRST116") {
        return null
      }

      // If the table doesn't exist, return null instead of throwing an error
      if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        console.warn("Brand settings table does not exist yet. Please run migrations.")
        return null
      }

      throw error
    }

    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      accentColor: data.accent_color,
      brandTone: data.brand_tone,
      brandVoice: data.brand_voice,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error("Error fetching brand settings:", error)
    return null
  }
}

export async function saveBrandSettings(settings: BrandSettings): Promise<BrandSettings | null> {
  try {
    // Check if record exists
    const { data: existingData, error: checkError } = await supabase
      .from("brand_settings")
      .select("id")
      .eq("user_id", settings.userId)
      .single()

    // If there's an error because the table doesn't exist, return null
    if (
      checkError &&
      (checkError.code === "42P01" ||
        checkError.message?.includes("relation") ||
        checkError.message?.includes("does not exist"))
    ) {
      console.warn("Brand settings table does not exist yet. Please run migrations.")
      return null
    }

    let result

    if (!existingData) {
      // Insert new record
      result = await supabase
        .from("brand_settings")
        .insert({
          user_id: settings.userId,
          logo_url: settings.logoUrl,
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          accent_color: settings.accentColor,
          brand_tone: settings.brandTone,
          brand_voice: settings.brandVoice,
        })
        .select()
    } else {
      // Update existing record
      result = await supabase
        .from("brand_settings")
        .update({
          logo_url: settings.logoUrl,
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          accent_color: settings.accentColor,
          brand_tone: settings.brandTone,
          brand_voice: settings.brandVoice,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", settings.userId)
        .select()
    }

    if (result.error) {
      // If there's an error because the table doesn't exist, return null
      if (
        result.error.code === "42P01" ||
        result.error.message?.includes("relation") ||
        result.error.message?.includes("does not exist")
      ) {
        console.warn("Brand settings table does not exist yet. Please run migrations.")
        return null
      }
      throw result.error
    }

    const updatedData = result.data[0]

    return {
      id: updatedData.id,
      userId: updatedData.user_id,
      logoUrl: updatedData.logo_url,
      primaryColor: updatedData.primary_color,
      secondaryColor: updatedData.secondary_color,
      accentColor: updatedData.accent_color,
      brandTone: updatedData.brand_tone,
      brandVoice: updatedData.brand_voice,
      createdAt: updatedData.created_at,
      updatedAt: updatedData.updated_at,
    }
  } catch (error) {
    console.error("Error saving brand settings:", error)
    return null
  }
}

export async function uploadLogo(userId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/logo-${Date.now()}.${fileExt}`
    const filePath = `brand-assets/${fileName}`

    const { error: uploadError } = await supabase.storage.from("brand-assets").upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from("brand-assets").getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error uploading logo:", error)
    return null
  }
}
