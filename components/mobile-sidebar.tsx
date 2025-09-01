"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
   Sheet,
   SheetContent,
   SheetTrigger,
   SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function MobileSidebar() {
   const [open, setOpen] = useState(false);

   return (
      <Sheet open={open} onOpenChange={setOpen}>
         <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
               <Menu className="h-5 w-5" />
            </Button>
         </SheetTrigger>
         <SheetContent side="left" className="p-0 w-80">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar onNoteSelect={() => setOpen(false)} />
         </SheetContent>
      </Sheet>
   );
}
