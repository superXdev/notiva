"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import {
   Sheet,
   SheetContent,
   SheetTrigger,
   SheetTitle,
} from "@/components/ui/sheet";
import { Menu, ChevronLeft, FileText } from "lucide-react";
import { Sidebar } from "./sidebar";
import { SearchModal } from "./search-modal";
import { useMobileNavigation } from "@/contexts/mobile-navigation-context";
import { MobileNoteList } from "./mobile-note-list";
import { useNotes } from "@/contexts/notes-context";

export function MobileSidebar() {
   const [open, setOpen] = useState(false);
   const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
   const { 
      isMobile, 
      currentView, 
      goBack,
      selectedFolderForMobile,
      selectedLabelForMobile,
   } = useMobileNavigation();
   
   const {
      createNote,
      selectedFolder,
      selectedLabel,
      folders,
      labels,
   } = useNotes();

   const handleNoteSelect = () => {
      setOpen(false);
   };

   const handleSearchNoteSelect = () => {
      setIsSearchModalOpen(false);
      setOpen(false);
   };

   const handleCreateNote = async () => {
      try {
         const title = `Note ${Date.now()}`;
         await createNote(title, "", selectedFolder?.id);
         setOpen(false);
      } catch (error) {
         console.error("Error creating note:", error);
      }
   };

   const getSelectedContext = () => {
      if (selectedLabelForMobile) {
         const label = labels.find(l => l.id === selectedLabelForMobile);
         return label ? `Label: ${label.name}` : "Label";
      }
      if (selectedFolderForMobile) {
         const folder = folders.find(f => f.id === selectedFolderForMobile);
         return folder ? folder.name : "Folder";
      }
      return "All Notes";
   };

   const renderSidebarContent = () => {
      // On mobile, show different content based on current view
      if (isMobile) {
         if (currentView === "note-list" || currentView === "note-editor") {
            return (
               <div className="flex flex-col h-full">
                  {/* Mobile Header with Back Button */}
                  <div className="p-3 border-b border-border">
                     <div className="flex items-center justify-between mb-3">
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={goBack}
                           className="px-2"
                        >
                           <ChevronLeft className="h-4 w-4 mr-1" />
                           Back
                        </Button>
                        <Button
                           size="sm"
                           onClick={handleCreateNote}
                           className="text-xs"
                        >
                           <Plus className="h-3 w-3 mr-1" />
                           New
                        </Button>
                     </div>
                     
                     {/* Search Input */}
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                           placeholder="Search notes..."
                           className="pl-9 text-sm cursor-pointer"
                           onClick={() => setIsSearchModalOpen(true)}
                           readOnly
                        />
                     </div>
                  </div>

                  {/* Context Title */}
                  <div className="px-3 py-2 border-b border-border bg-muted/20">
                     <h3 className="text-sm font-medium text-muted-foreground">
                        {getSelectedContext()}
                     </h3>
                  </div>

                  {/* Note List for Mobile Sidebar */}
                  <MobileNoteList onNoteSelect={handleNoteSelect} />
               </div>
            );
         }
         
         // Mobile folder-list view: show only add note button and search
         return (
            <div className="flex flex-col h-full">
               {/* Simple Mobile Header */}
               <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                     <h1 className="text-lg font-semibold">Notes</h1>
                     <Button
                        size="sm"
                        onClick={handleCreateNote}
                        className="text-xs"
                     >
                        <Plus className="h-3 w-3 mr-1" />
                        New
                     </Button>
                  </div>
                  
                  {/* Search Input */}
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                        placeholder="Search notes..."
                        className="pl-9 text-sm cursor-pointer"
                        onClick={() => setIsSearchModalOpen(true)}
                        readOnly
                     />
                  </div>
               </div>

               {/* Empty space or minimal content */}
               <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center text-muted-foreground">
                     <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                     <p className="text-sm">Select a folder or label</p>
                     <p className="text-xs">to view your notes</p>
                  </div>
               </div>
            </div>
         );
      }

      // Desktop: show regular sidebar
      return <Sidebar onNoteSelect={handleNoteSelect} />;
   };

   return (
      <>
         <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
               <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
               </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
               {renderSidebarContent()}
            </SheetContent>
         </Sheet>
         
         {/* Search Modal */}
         <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            onNoteSelect={handleSearchNoteSelect}
         />
      </>
   );
}
