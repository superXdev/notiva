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
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/ui/google-button";
import { FileText, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { login } from "../actions";
import { AuthMessage } from "@/components/auth-message";

export default function LoginPage() {
   const [showPassword, setShowPassword] = useState(false);

   return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
         <div className="w-full max-w-md space-y-6">
            {/* Logo and Title */}
            <div className="text-center space-y-2">
               <div className="flex items-center justify-center gap-2 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold">Notiva</span>
               </div>
               <h1 className="text-2xl font-semibold tracking-tight">
                  Welcome back
               </h1>
               <p className="text-sm text-muted-foreground">
                  Enter your credentials to access your account
               </p>
            </div>

            <Card>
               <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Sign in</CardTitle>
                  <CardDescription>
                     Choose your preferred sign in method
                  </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <AuthMessage />
                  {/* Google Sign In */}
                  <GoogleButton>Continue with Google</GoogleButton>

                  <div className="relative">
                     <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                     </div>
                     <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                           Or continue with
                        </span>
                     </div>
                  </div>

                  {/* Email/Password Form */}
                  <form action={login} className="space-y-4">
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
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                           <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-10"
                              required
                           />
                           <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                           >
                              {showPassword ? (
                                 <EyeOff className="h-4 w-4" />
                              ) : (
                                 <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                 {showPassword
                                    ? "Hide password"
                                    : "Show password"}
                              </span>
                           </Button>
                        </div>
                     </div>
                     <Button type="submit" className="w-full" size="lg">
                        Sign in
                     </Button>
                  </form>

                  {/* Forgot Password */}
                  <div className="text-center">
                     <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:underline"
                     >
                        Forgot your password?
                     </Link>
                  </div>
               </CardContent>
            </Card>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
               Don't have an account?{" "}
               <Link href="/register" className="text-primary hover:underline">
                  Sign up
               </Link>
            </div>
         </div>
      </div>
   );
}
