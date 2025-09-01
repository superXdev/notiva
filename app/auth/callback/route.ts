import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
   const { searchParams, origin } = new URL(request.url);
   const code = searchParams.get("code");
   const next = searchParams.get("next") ?? "/";

   if (code) {
      try {
         const supabase = await createClient();
         const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
         );

         if (error) {
            return NextResponse.redirect(
               `${origin}/login?message=Authentication failed`
            );
         }

         if (data.user) {
            // Redirect to the home page or the specified next URL
            const redirectUrl = `${origin}${next}`;
            return NextResponse.redirect(redirectUrl);
         } else {
            return NextResponse.redirect(
               `${origin}/login?message=Authentication failed`
            );
         }
      } catch (error) {
         return NextResponse.redirect(
            `${origin}/login?message=Authentication failed`
         );
      }
   }

   // No code found
   return NextResponse.redirect(
      `${origin}/login?message=No authorization code received`
   );
}
