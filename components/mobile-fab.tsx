"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNotes } from "@/contexts/notes-context";
import { useMobileNavigation } from "@/contexts/mobile-navigation-context";
import { cn } from "@/lib/utils";

interface MobileFabProps {
   className?: string;
}

export function MobileFab({ className }: MobileFabProps) {
   const { createNote, selectedFolder } = useNotes();
   const { navigateToNoteEditor } = useMobileNavigation();

   const handleCreateNote = async () => {
      try {
         const title = `Note ${Date.now()}`;
         const newNote = await createNote(title, "", selectedFolder?.id);
         navigateToNoteEditor();
      } catch (error) {
         console.error("Error creating note:", error);
      }
   };

   return (
      <Button
         onClick={handleCreateNote}
         className={cn(
            "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "flex items-center justify-center p-0",
            "md:hidden", // Only show on mobile devices
            className
         )}
         size="lg"
      >
         <Plus className="h-6 w-6" />
      </Button>
   );
}
