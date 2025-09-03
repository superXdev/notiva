import type { Metadata } from "next";
import LoginPageClient from "./login-client";

export const metadata: Metadata = {
   title: "Sign In | Notiva",
   description: "Sign in to Notiva - Your modern markdown note-taking platform with AI enhancement and professional publishing features.",
   openGraph: {
      title: "Sign In | Notiva",
      description: "Sign in to Notiva - Your modern markdown note-taking platform with AI enhancement and professional publishing features.",
      type: "website",
      siteName: "Notiva",
      images: [
         {
            url: "/og-login.png",
            width: 1200,
            height: 630,
            alt: "Notiva - Sign In",
         },
      ],
   },
   twitter: {
      card: "summary_large_image",
      title: "Sign In | Notiva",
      description: "Sign in to Notiva - Your modern markdown note-taking platform with AI enhancement and professional publishing features.",
      images: ["/og-login.png"],
   },
};

export default function LoginPage() {
   return <LoginPageClient />;
}
