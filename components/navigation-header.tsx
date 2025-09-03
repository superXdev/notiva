"use client";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
   FileText,
   Settings,
   HelpCircle,
   LogOut,
   User,
   ChevronDown,
   Mail,
} from "lucide-react";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/(auth)/actions";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

interface NavigationHeaderProps {
   user: SupabaseUser;
}

export function NavigationHeader({ user }: NavigationHeaderProps) {
   // Get user initials for avatar
   const getUserInitials = (email: string) => {
      const name = email.split("@")[0];
      return name.substring(0, 2).toUpperCase();
   };

   return (
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
         <div className="flex items-center justify-between h-full px-4">
            {/* Left side - Logo and mobile menu */}
            <div className="flex items-center gap-3">
               <div className="md:hidden">
                  <MobileSidebar />
               </div>
               <div className="flex items-center gap-2">
                  <Logo width={24} height={24} />
                  <span className="font-semibold text-lg hidden sm:block">
                     Notiva
                  </span>
               </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-3">
               <ThemeToggle />

               <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
                  <Link href="/help">
                     <HelpCircle className="h-4 w-4 mr-2" />
                     Help
                  </Link>
               </Button>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-3"
                     >
                        <Avatar className="h-7 w-7">
                           <AvatarFallback className="text-xs bg-primary/10">
                              {getUserInitials(user.email || "")}
                           </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block text-sm">
                           {user.email}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                     <DropdownMenuItem className="flex items-center gap-2 py-3">
                        <Mail className="h-4 w-4" />
                        <div className="flex flex-col">
                           <span className="text-sm font-medium">
                              {user.email}
                           </span>
                           <span className="text-xs text-muted-foreground">
                              Signed in with Google
                           </span>
                        </div>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                        <Link
                           href="/settings"
                           className="flex items-center w-full"
                        >
                           <Settings className="h-4 w-4 mr-2" />
                           Settings
                        </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem className="sm:hidden" asChild>
                        <Link href="/help" className="flex items-center w-full">
                           <HelpCircle className="h-4 w-4 mr-2" />
                           Help
                        </Link>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <form action={signOut}>
                        <DropdownMenuItem
                           className="text-red-600 dark:text-red-400"
                           asChild
                        >
                           <button
                              type="submit"
                              className="w-full flex items-center"
                           >
                              <LogOut className="h-4 w-4 mr-2" />
                              Sign out
                           </button>
                        </DropdownMenuItem>
                     </form>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>
      </header>
   );
}
