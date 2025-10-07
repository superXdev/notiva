"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, FileText, ChevronDown } from "lucide-react";
import { useNotes } from "@/contexts/notes-context";
import { useMobileNavigation } from "@/contexts/mobile-navigation-context";
import { cn } from "@/lib/utils";
import { Note } from "@/lib/types";

interface MobileNoteListProps {
   onNoteSelect?: (noteId: string) => void;
}

export function MobileNoteList({ onNoteSelect }: MobileNoteListProps) {
   const {
      filteredNotes,
      selectedNote,
      selectedFolder,
      selectedLabel,
      folders,
      labels,
      pagination,
      isLoading,
      selectNote,
      loadNextPage,
      loadPrevPage,
   } = useNotes();

   const {
      navigateToNoteEditor,
      goBack,
      selectedFolderForMobile,
      selectedLabelForMobile,
   } = useMobileNavigation();

   const handleNoteSelect = (noteId: string) => {
      selectNote(noteId);
      navigateToNoteEditor();
      onNoteSelect?.(noteId);
   };

   const getTitle = () => {
      if (selectedLabelForMobile) {
         const label = labels.find((l) => l.id === selectedLabelForMobile);
         return label ? `Label: ${label.name}` : "Label";
      }
      if (selectedFolderForMobile) {
         const folder = folders.find((f) => f.id === selectedFolderForMobile);
         return folder ? folder.name : "Folder";
      }
      return "All Notes";
   };

   const getFolderPath = (folderId?: string) => {
      if (!folderId) return [];

      const path = [];
      let current = folders.find((f) => f.id === folderId);

      while (current) {
         path.unshift(current);
         const parentId = current?.parentId;
         current = parentId
            ? folders.find((f) => f.id === parentId) || undefined
            : undefined;
      }

      return path;
   };

   if (isLoading) {
      return (
         <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
               <p className="text-muted-foreground">Loading notes...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="flex-1 flex flex-col h-full min-h-0">
         {/* Header with Back Button - Only show when used as main content */}
         {!onNoteSelect && (
            <div className="border-b border-border p-4 flex-shrink-0">
               <div className="flex items-center mb-2">
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={goBack}
                     className="mr-3 px-2"
                  >
                     <ChevronLeft className="h-4 w-4 mr-1" />
                     Back
                  </Button>
                  <h1 className="text-lg font-semibold truncate flex-1">
                     {getTitle()}
                  </h1>
               </div>

               <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{filteredNotes.length} notes</span>

                  {/* Pagination Controls */}
                  {pagination.notes.totalPages > 1 && (
                     <div className="flex items-center space-x-2">
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => loadPrevPage("notes")}
                           disabled={!pagination.notes.hasPrevPage}
                           className="h-8 w-8 p-0"
                        >
                           <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-xs">
                           {pagination.notes.page}/{pagination.notes.totalPages}
                        </span>
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => loadNextPage("notes")}
                           disabled={!pagination.notes.hasNextPage}
                           className="h-8 w-8 p-0"
                        >
                           <ChevronRight className="h-3 w-3" />
                        </Button>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Notes List */}
         <ScrollArea className="flex-1 min-h-0">
            <div
               className={cn(
                  "p-3 pr-1",
                  onNoteSelect ? "p-3 pr-1" : "p-4 pr-1"
               )}
            >
               {filteredNotes.length === 0 ? (
                  <div className="text-center py-8">
                     <FileText className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                     <p className="text-sm text-muted-foreground">
                        No notes found
                     </p>
                  </div>
               ) : (
                  <div className="space-y-2">
                     {filteredNotes.map((note) => (
                        <div
                           key={note.id}
                           className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent hover:shadow-sm",
                              selectedNote?.id === note.id &&
                                 "bg-accent border-accent-foreground/20 shadow-sm",
                              onNoteSelect && "p-2" // Smaller padding when in sidebar
                           )}
                           onClick={() => handleNoteSelect(note.id)}
                        >
                           {/* Note Title */}
                           <h3
                              className={cn(
                                 "font-medium mb-2 truncate",
                                 onNoteSelect
                                    ? "text-sm mb-1"
                                    : "text-base mb-3"
                              )}
                           >
                              {note.title}
                           </h3>

                           {/* Date */}
                           <div className="text-xs text-muted-foreground">
                              {new Date(note.updatedAt).toLocaleDateString()}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </ScrollArea>

         {/* Bottom Pagination - Only show when used as main content */}
         {!onNoteSelect && pagination.notes.totalPages > 1 && (
            <div className="border-t border-border p-4 flex-shrink-0">
               <div className="flex items-center justify-center space-x-2">
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => loadPrevPage("notes")}
                     disabled={!pagination.notes.hasPrevPage}
                     className="flex items-center"
                  >
                     <ChevronLeft className="h-4 w-4 mr-1" />
                     Previous
                  </Button>
                  <span className="text-sm text-muted-foreground mx-4">
                     Page {pagination.notes.page} of{" "}
                     {pagination.notes.totalPages}
                  </span>
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => loadNextPage("notes")}
                     disabled={!pagination.notes.hasNextPage}
                     className="flex items-center"
                  >
                     Next
                     <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
               </div>
            </div>
         )}
      </div>
   );
}
