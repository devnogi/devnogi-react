import { NextRequest, NextResponse } from "next/server";
import { createServerAxios } from "@/lib/api/server";

export async function GET(request: NextRequest) {
  const serverAxios = createServerAxios(request);
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const day = searchParams.get("day") || "7";

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "userId is required" },
      { status: 400 }
    );
  }

  try {
    const response = await serverAxios.get(
      `/dcs/api/notices?userId=${userId}&day=${day}`
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}
