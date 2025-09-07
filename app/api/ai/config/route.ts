import { NextResponse } from "next/server";

export async function GET() {
   try {
      const hasApiKey = !!process.env.LUNOS_API_KEY;

      return NextResponse.json({
         configured: hasApiKey,
         message: hasApiKey
            ? "Lunos API key is configured"
            : "Lunos API key is not configured",
      });
   } catch (error) {
      console.error("Error checking API key configuration:", error);
      return NextResponse.json(
         {
            configured: false,
            error: "Failed to check API key configuration",
         },
         { status: 500 }
      );
   }
}
