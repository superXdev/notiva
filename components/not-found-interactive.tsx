"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { SearchModal } from "./search-modal";

export function GoBackButton() {
   const handleGoBack = () => {
      if (window.history.length > 1) {
         window.history.back();
      } else {
         window.location.href = "/";
      }
   };

   return (
      <Button variant="outline" size="lg" onClick={handleGoBack}>
         <ArrowLeft className="h-4 w-4 mr-2" />
         Go Back
      </Button>
   );
}

export function NotFoundSearch() {
   const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

   return (
      <>
         <div className="flex gap-2">
            <Input
               placeholder="Search notes, features, or help..."
               className="flex-1 cursor-pointer"
               onClick={() => setIsSearchModalOpen(true)}
               readOnly
            />
            <Button
               variant="outline"
               onClick={() => setIsSearchModalOpen(true)}
            >
               <Search className="h-4 w-4" />
            </Button>
         </div>

         <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
         />
      </>
   );
}
