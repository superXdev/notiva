"use client";

import { useMobileNavigation } from "@/contexts/mobile-navigation-context";
import { MobileFolderList } from "@/components/mobile-folder-list";
import { MobileNoteList } from "@/components/mobile-note-list";
import { NoteEditor } from "@/components/note-editor";
import { MobileFab } from "@/components/mobile-fab";

export function MobileMainContent() {
   const { currentView } = useMobileNavigation();

   const renderContent = () => {
      switch (currentView) {
         case "folder-list":
            return (
               <div className="flex flex-col h-full">
                  <div className="border-b border-border p-4">
                     <h1 className="text-xl font-semibold">Notes</h1>
                     <p className="text-sm text-muted-foreground">
                        Select a folder or label to view your notes
                     </p>
                  </div>
                  <MobileFolderList />
               </div>
            );

         case "note-list":
            return <MobileNoteList />;

         case "note-editor":
            return <NoteEditor key="mobile-note-editor" />;

         default:
            return (
               <div className="flex flex-col h-full">
                  <div className="border-b border-border p-4">
                     <h1 className="text-xl font-semibold">Notes</h1>
                     <p className="text-sm text-muted-foreground">
                        Select a folder or label to view your notes
                     </p>
                  </div>
                  <MobileFolderList />
               </div>
            );
      }
   };

   return (
      <div className="relative h-full">
         {renderContent()}
         {/* Show FAB only when no note is selected (folder-list and note-list views) */}
         {currentView !== "note-editor" && <MobileFab />}
      </div>
   );
}
