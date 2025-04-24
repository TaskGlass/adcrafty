import { NextResponse } from "next/server"
import { checkAllServices } from "@/lib/environment-check"

export async function GET() {
  try {
    const serviceStatus = await checkAllServices()

    return NextResponse.json({
      success: true,
      status: serviceStatus,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
