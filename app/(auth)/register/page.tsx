import type { Metadata } from "next";
import RegisterPageClient from "./register-client";

export const metadata: Metadata = {
   title: "Sign Up | Notiva",
   description:
      "Create your Notiva account - Join the modern markdown note-taking platform with AI enhancement and professional publishing features.",
   openGraph: {
      title: "Sign Up | Notiva",
      description:
         "Create your Notiva account - Join the modern markdown note-taking platform with AI enhancement and professional publishing features.",
      type: "website",
      siteName: "Notiva",
      images: [
         {
            url: "/og-login.png",
            width: 1200,
            height: 630,
            alt: "Notiva - Sign Up",
         },
      ],
   },
   twitter: {
      card: "summary_large_image",
      title: "Sign Up | Notiva",
      description:
         "Create your Notiva account - Join the modern markdown note-taking platform with AI enhancement and professional publishing features.",
      images: ["/og-login.png"],
   },
};

export default function RegisterPage() {
   return <RegisterPageClient />;
}
