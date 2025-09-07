"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogOverlay,
   DialogPortal,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, FileText, ChevronRight } from "lucide-react";
import { useNotes } from "@/contexts/notes-context";
import { cn } from "@/lib/utils";
import { NotesService } from "@/lib/notes-service";
import Fuse from "fuse.js";

interface SearchModalProps {
   isOpen: boolean;
   onClose: () => void;
   onNoteSelect?: () => void;
}

interface SearchResult {
   item: {
      id: string;
      title: string;
      folderId?: string;
      labels: string[];
      updatedAt: string;
   };
   score?: number;
}

export function SearchModal({
   isOpen,
   onClose,
   onNoteSelect,
}: SearchModalProps) {
   const { folders, labels, selectNote } = useNotes();
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedIndex, setSelectedIndex] = useState(0);
   const [searchableNotes, setSearchableNotes] = useState<
      Array<{
         id: string;
         title: string;
         folderId?: string;
         labels: string[];
         updatedAt: string;
      }>
   >([]);
   const [isLoadingSearchData, setIsLoadingSearchData] = useState(false);
   const inputRef = useRef<HTMLInputElement>(null);
   const resultsRef = useRef<HTMLDivElement>(null);

   // Load all note titles for search when modal opens
   useEffect(() => {
      if (isOpen) {
         const loadSearchData = async () => {
            try {
               setIsLoadingSearchData(true);
               const allNotes = await NotesService.getAllNoteTitles();
               setSearchableNotes(allNotes);
            } catch (error) {
               console.error("Failed to load search data:", error);
            } finally {
               setIsLoadingSearchData(false);
            }
         };
         loadSearchData();
      }
   }, [isOpen]);

   // Refresh search data when modal closes and reopens (to get latest changes)
   useEffect(() => {
      if (!isOpen) {
         setSearchableNotes([]);
      }
   }, [isOpen]);

   // Configure Fuse.js for fuzzy search
   const fuse = useMemo(() => {
      return new Fuse(searchableNotes, {
         keys: ["title"],
         threshold: 0.4, // Lower threshold means more strict matching
         includeScore: true,
         minMatchCharLength: 1,
         ignoreLocation: true, // Search anywhere in the string
         findAllMatches: true, // Find all matches, not just the first one
      });
   }, [searchableNotes]);

   // Perform fuzzy search or show recent notes
   const searchResults = useMemo(() => {
      if (isLoadingSearchData) {
         return [];
      }

      if (!searchQuery.trim()) {
         // Show recent notes when no search query
         return searchableNotes
            .sort(
               (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
            )
            .slice(0, 4)
            .map((note) => ({ item: note }));
      }

      const results = fuse.search(searchQuery);
      return results.slice(0, 4); // Limit to 4 results
   }, [fuse, searchQuery, searchableNotes, isLoadingSearchData]);

   // Reset selected index when search query changes
   useEffect(() => {
      setSelectedIndex(0);
   }, [searchQuery]);

   // Focus input when modal opens
   useEffect(() => {
      if (isOpen && inputRef.current) {
         setTimeout(() => {
            inputRef.current?.focus();
         }, 100);
      }
   }, [isOpen]);

   // Handle keyboard navigation
   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
         onClose();
      } else if (e.key === "ArrowDown") {
         e.preventDefault();
         setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : prev
         );
      } else if (e.key === "ArrowUp") {
         e.preventDefault();
         setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && searchResults.length > 0) {
         e.preventDefault();
         handleNoteSelect(searchResults[selectedIndex].item.id);
      }
   };

   // Handle note selection
   const handleNoteSelect = (noteId: string) => {
      selectNote(noteId);
      onNoteSelect?.();
      onClose();
      setSearchQuery("");
   };

   // Get folder path for display
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

   // Clear search and close modal
   const handleClose = () => {
      setSearchQuery("");
      setSelectedIndex(0);
      onClose();
   };

   return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
         <DialogPortal>
            <DialogOverlay className="z-[55]" />
            <DialogPrimitive.Content
               className={cn(
                  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[55] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
                  "w-[90vw] max-w-2xl max-h-[80vh] p-0"
               )}
               onKeyDown={handleKeyDown}
            >
               <DialogHeader className="p-6 pb-4">
                  <DialogTitle className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Notes
                     </div>
                     <div className="text-xs text-muted-foreground">
                        Press{" "}
                        <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">
                           ⌘K
                        </kbd>{" "}
                        to open
                     </div>
                  </DialogTitle>
               </DialogHeader>

               <div className="px-6 pb-4">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                        ref={inputRef}
                        placeholder="Search note titles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-10"
                        onKeyDown={handleKeyDown}
                     />
                     {searchQuery && (
                        <Button
                           variant="ghost"
                           size="sm"
                           className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                           onClick={() => setSearchQuery("")}
                        >
                           <X className="h-3 w-3" />
                        </Button>
                     )}
                  </div>
               </div>

               <div className="px-6 pb-6">
                  {isLoadingSearchData ? (
                     <div className="border rounded-lg">
                        <div className="p-8 text-center text-muted-foreground">
                           <div className="animate-spin h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full mx-auto mb-2"></div>
                           <p className="text-sm">Loading all notes...</p>
                        </div>
                     </div>
                  ) : searchQuery || searchResults.length > 0 ? (
                     <div className="border rounded-lg">
                        {!searchQuery && searchResults.length > 0 && (
                           <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                              Recent notes
                           </div>
                        )}
                        <ScrollArea className="max-h-[300px]">
                           {searchResults.length > 0 ? (
                              <div className="p-2" ref={resultsRef}>
                                 {searchResults.map((result, index) => (
                                    <div
                                       key={result.item.id}
                                       className={cn(
                                          "p-3 rounded-md cursor-pointer transition-colors",
                                          "hover:bg-accent",
                                          selectedIndex === index && "bg-accent"
                                       )}
                                       onClick={() =>
                                          handleNoteSelect(result.item.id)
                                       }
                                       onMouseEnter={() =>
                                          setSelectedIndex(index)
                                       }
                                    >
                                       {/* Folder Path */}
                                       {result.item.folderId && (
                                          <div className="flex items-center text-xs text-muted-foreground mb-1">
                                             {getFolderPath(
                                                result.item.folderId
                                             ).map((folder, folderIndex) => (
                                                <span
                                                   key={folder.id}
                                                   className="flex items-center"
                                                >
                                                   {folderIndex > 0 && (
                                                      <ChevronRight className="h-3 w-3 mx-1" />
                                                   )}
                                                   <span className="truncate">
                                                      {folder.name}
                                                   </span>
                                                </span>
                                             ))}
                                             <ChevronRight className="h-3 w-3 mx-1" />
                                          </div>
                                       )}

                                       <div className="flex items-start justify-between">
                                          <div className="flex-1 min-w-0">
                                             <h4 className="font-medium text-sm mb-1 truncate">
                                                {result.item.title}
                                             </h4>

                                             {/* Labels */}
                                             {result.item.labels.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                   {result.item.labels
                                                      .slice(0, 3)
                                                      .map((labelName) => {
                                                         const label =
                                                            labels.find(
                                                               (l) =>
                                                                  l.name ===
                                                                  labelName
                                                            );
                                                         return (
                                                            <Badge
                                                               key={labelName}
                                                               variant="secondary"
                                                               className="text-xs px-1.5 py-0.5"
                                                               style={
                                                                  label
                                                                     ? {
                                                                          backgroundColor:
                                                                             label.color +
                                                                             "20",
                                                                          color: label.color,
                                                                       }
                                                                     : {}
                                                               }
                                                            >
                                                               {labelName}
                                                            </Badge>
                                                         );
                                                      })}
                                                   {result.item.labels.length >
                                                      3 && (
                                                      <Badge
                                                         variant="secondary"
                                                         className="text-xs px-1.5 py-0.5"
                                                      >
                                                         +
                                                         {result.item.labels
                                                            .length - 3}
                                                      </Badge>
                                                   )}
                                                </div>
                                             )}
                                          </div>

                                          <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                             {new Date(
                                                result.item.updatedAt
                                             ).toLocaleDateString()}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="p-8 text-center text-muted-foreground">
                                 <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                 <p className="text-sm">No notes found</p>
                                 <p className="text-xs mt-1">
                                    Try adjusting your search terms
                                 </p>
                              </div>
                           )}
                        </ScrollArea>
                     </div>
                  ) : (
                     !isLoadingSearchData && (
                        <div className="p-8 text-center text-muted-foreground">
                           <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                           <p className="text-sm">No notes available</p>
                           <p className="text-xs mt-1">
                              Create your first note to get started
                           </p>
                        </div>
                     )
                  )}
               </div>
            </DialogPrimitive.Content>
         </DialogPortal>
      </Dialog>
   );
}
