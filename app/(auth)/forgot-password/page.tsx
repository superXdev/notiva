import type { Metadata } from "next";
import ForgotPasswordPageClient from "./forgot-password-client";
export const metadata: Metadata = {
   title: "Reset Password | Notiva",
   description:
      "Reset your Notiva password - Enter your email to receive a password reset link for your account.",
   openGraph: {
      title: "Reset Password | Notiva",
      description:
         "Reset your Notiva password - Enter your email to receive a password reset link for your account.",
      type: "website",
      siteName: "Notiva",
      images: [
         {
            url: "/og-login.png",
            width: 1200,
            height: 630,
            alt: "Notiva - Reset Password",
         },
      ],
   },
   twitter: {
      card: "summary_large_image",
      title: "Reset Password | Notiva",
      description:
         "Reset your Notiva password - Enter your email to receive a password reset link for your account.",
      images: ["/og-login.png"],
   },
};

export default function ForgotPasswordPage() {
   return <ForgotPasswordPageClient />;
}
