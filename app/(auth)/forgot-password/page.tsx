"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { resetPassword } from "../actions";
import { Logo } from "@/components/ui/logo";

export default function ForgotPasswordPage() {
   return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
         <div className="w-full max-w-md space-y-6">
            {/* Logo and Title */}
            <div className="text-center space-y-2">
               <div className="flex items-center justify-center gap-2 mb-4">
                  <Logo width={32} height={32} />
                  <span className="text-2xl font-bold">Notiva</span>
               </div>
               <h1 className="text-2xl font-semibold tracking-tight">
                  Forgot your password?
               </h1>
               <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you a reset link
               </p>
            </div>

            <Card>
               <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Reset password</CardTitle>
                  <CardDescription>
                     Enter your email to receive a password reset link
                  </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <form action={resetPassword} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                           <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                           <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="m@example.com"
                              className="pl-10"
                              required
                           />
                        </div>
                     </div>
                     <Button type="submit" className="w-full" size="lg">
                        Send reset link
                     </Button>
                  </form>
               </CardContent>
            </Card>

            {/* Back to Login */}
            <div className="text-center">
               <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-primary hover:underline"
               >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
               </Link>
            </div>
         </div>
      </div>
   );
}
