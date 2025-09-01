"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
   const supabase = await createClient();

   // type-cast since FormData values can only be strings
   const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
   };

   const { error } = await supabase.auth.signInWithPassword(data);

   if (error) {
      redirect("/login?message=Could not authenticate user");
   }

   redirect("/");
}

export async function signup(formData: FormData) {
   const supabase = await createClient();

   // type-cast since FormData values can only be strings
   const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
   };

   const { error } = await supabase.auth.signUp(data);

   if (error) {
      redirect("/register?message=Could not authenticate user");
   }

   redirect("/login?message=Check email to continue sign in process");
}

export async function signInWithGoogle() {
   const supabase = await createClient();

   const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
         redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
   });

   if (error) {
      redirect("/login?message=Could not authenticate with Google");
   }

   return data;
}

export async function signOut() {
   const supabase = await createClient();
   await supabase.auth.signOut();
   redirect("/login");
}

export async function resetPassword(formData: FormData) {
   const supabase = await createClient();

   const email = formData.get("email") as string;

   const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
   });

   if (error) {
      redirect("/forgot-password?message=Could not send reset email");
   }

   redirect("/login?message=Check your email for the reset link");
}
