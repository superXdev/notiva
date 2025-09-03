import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
   let supabaseResponse = NextResponse.next({
      request,
   });

   const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
         cookies: {
            getAll() {
               return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
               cookiesToSet.forEach(({ name, value, options }) =>
                  request.cookies.set(name, value)
               );
               supabaseResponse = NextResponse.next({
                  request,
               });
               cookiesToSet.forEach(({ name, value, options }) =>
                  supabaseResponse.cookies.set(
                     name,
                     value,
                     options as CookieOptions
                  )
               );
            },
         },
      }
   );

   // IMPORTANT: Avoid writing any logic between createServerClient and
   // supabase.auth.getUser(). A simple mistake could make it very hard to debug
   // issues with users being randomly logged out.

   const {
      data: { user },
   } = await supabase.auth.getUser();

   if (
      !user &&
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/register") &&
      !request.nextUrl.pathname.startsWith("/forgot-password") &&
      !request.nextUrl.pathname.startsWith("/auth/confirm") &&
      !request.nextUrl.pathname.startsWith("/auth/callback") &&
      !request.nextUrl.pathname.startsWith("/published") &&
      !request.nextUrl.pathname.startsWith("/terms") &&
      !request.nextUrl.pathname.startsWith("/privacy") &&
      !request.nextUrl.pathname.startsWith("/api/og")
   ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
   }

   return supabaseResponse;
}
