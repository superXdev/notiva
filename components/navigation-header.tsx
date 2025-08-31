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
} from "lucide-react";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/(auth)/actions";

export function NavigationHeader() {
   return (
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
         <div className="flex items-center justify-between h-full px-4">
            {/* Left side - Logo and mobile menu */}
            <div className="flex items-center gap-3">
               <div className="md:hidden">
                  <MobileSidebar />
               </div>
               <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-lg hidden sm:block">
                     Markdown Notes
                  </span>
               </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-3">
               <ThemeToggle />

               <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
               </Button>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-3"
                     >
                        <Avatar className="h-7 w-7">
                           <AvatarFallback className="text-xs bg-primary/10">
                              <User className="h-4 w-4" />
                           </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block text-sm">User</span>
                        <ChevronDown className="h-4 w-4" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                     <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                     </DropdownMenuItem>
                     <DropdownMenuItem className="sm:hidden">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help
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
