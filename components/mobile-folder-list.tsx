"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import {
   Folder,
   FileText,
   Tag,
   ChevronRight,
   Plus,
   Search,
} from "lucide-react";
import { useNotes } from "@/contexts/notes-context";
import { useMobileNavigation } from "@/contexts/mobile-navigation-context";
import { SearchModal } from "@/components/search-modal";
import { cn } from "@/lib/utils";

export function MobileFolderList() {
   const {
      folders,
      labels,
      noteCounts,
      isLoading,
      selectFolder,
      selectLabel,
      createFolder,
      createLabel,
   } = useNotes();

   const { navigateToNoteList, navigateToNoteEditor } = useMobileNavigation();

   const [newFolderName, setNewFolderName] = useState("");
   const [newLabelName, setNewLabelName] = useState("");
   const [newLabelColor, setNewLabelColor] = useState("#3b82f6");
   const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
   const [isCreateLabelOpen, setIsCreateLabelOpen] = useState(false);
   const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

   const handleFolderSelect = async (folderId?: string) => {
      // Update the notes context
      await selectFolder(folderId);
      // Navigate to note list view
      navigateToNoteList(folderId, undefined);
   };

   const handleLabelSelect = async (labelId: string) => {
      // Update the notes context
      await selectLabel(labelId);
      // Navigate to note list view
      navigateToNoteList(undefined, labelId);
   };

   const handleCreateFolder = () => {
      if (newFolderName.trim()) {
         createFolder(newFolderName.trim());
         setNewFolderName("");
         setIsCreateFolderOpen(false);
      }
   };

   const handleCreateLabel = () => {
      if (newLabelName.trim()) {
         createLabel(newLabelName.trim(), newLabelColor);
         setNewLabelName("");
         setIsCreateLabelOpen(false);
      }
   };

   const handleSearchNoteSelect = () => {
      setIsSearchModalOpen(false);
      navigateToNoteEditor();
   };

   if (isLoading) {
      return (
         <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
               <p className="text-muted-foreground">Loading...</p>
            </div>
         </div>
      );
   }

   return (
      <ScrollArea className="flex-1">
         <div className="p-4">
            {/* Search Input */}
            <div className="mb-4">
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

            {/* All Notes */}
            <div className="mb-3">
               <h2 className="text-lg font-semibold mb-3">All Notes</h2>
               <Button
                  variant="ghost"
                  className="w-full justify-between h-12 text-left"
                  onClick={() => handleFolderSelect()}
               >
                  <div className="flex items-center">
                     <FileText className="h-5 w-5 mr-3" />
                     <span>All Notes</span>
                  </div>
                  <div className="flex items-center">
                     <Badge variant="secondary" className="mr-2">
                        {noteCounts.all}
                     </Badge>
                     <ChevronRight className="h-4 w-4" />
                  </div>
               </Button>
            </div>

            <Separator className="mb-3" />

            {/* Folders */}
            <div className="mb-3">
               <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Folders</h2>
                  <Dialog
                     open={isCreateFolderOpen}
                     onOpenChange={setIsCreateFolderOpen}
                  >
                     <DialogTrigger asChild>
                        <Button
                           variant="ghost"
                           size="sm"
                           className="h-8 w-8 p-0"
                        >
                           <Plus className="h-4 w-4" />
                        </Button>
                     </DialogTrigger>
                     <DialogContent className="w-[90vw] max-w-md">
                        <DialogHeader>
                           <DialogTitle>Create Folder</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                           <Input
                              placeholder="Folder name"
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                              onKeyDown={(e) =>
                                 e.key === "Enter" && handleCreateFolder()
                              }
                           />
                           <Button
                              onClick={handleCreateFolder}
                              className="w-full"
                           >
                              Create Folder
                           </Button>
                        </div>
                     </DialogContent>
                  </Dialog>
               </div>

               {folders.length > 0 ? (
                  <div className="space-y-1">
                     {folders.map((folder) => (
                        <Button
                           key={folder.id}
                           variant="ghost"
                           className="w-full justify-between h-8 text-left"
                           onClick={() => handleFolderSelect(folder.id)}
                        >
                           <div className="flex items-center min-w-0">
                              <Folder className="h-5 w-5 mr-3 flex-shrink-0" />
                              <span className="truncate">{folder.name}</span>
                           </div>
                           <div className="flex items-center">
                              <Badge variant="secondary" className="mr-2">
                                 {noteCounts.byFolder[folder.id] || 0}
                              </Badge>
                              <ChevronRight className="h-4 w-4" />
                           </div>
                        </Button>
                     ))}
                  </div>
               ) : (
                  <p className="text-sm text-muted-foreground">
                     No folders yet
                  </p>
               )}
            </div>

            <Separator className="mb-3" />

            {/* Labels */}
            <div className="mb-3">
               <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Labels</h2>
                  <Dialog
                     open={isCreateLabelOpen}
                     onOpenChange={setIsCreateLabelOpen}
                  >
                     <DialogTrigger asChild>
                        <Button
                           variant="ghost"
                           size="sm"
                           className="h-8 w-8 p-0"
                        >
                           <Plus className="h-4 w-4" />
                        </Button>
                     </DialogTrigger>
                     <DialogContent className="w-[90vw] max-w-md">
                        <DialogHeader>
                           <DialogTitle>Create Label</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                           <Input
                              placeholder="Label name"
                              value={newLabelName}
                              onChange={(e) => setNewLabelName(e.target.value)}
                           />
                           <div className="flex items-center space-x-2">
                              <input
                                 type="color"
                                 value={newLabelColor}
                                 onChange={(e) =>
                                    setNewLabelColor(e.target.value)
                                 }
                                 className="w-8 h-8 rounded border"
                              />
                              <span className="text-sm text-muted-foreground">
                                 Color
                              </span>
                           </div>
                           <Button
                              onClick={handleCreateLabel}
                              className="w-full"
                           >
                              Create Label
                           </Button>
                        </div>
                     </DialogContent>
                  </Dialog>
               </div>

               {labels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                     {labels.map((label) => (
                        <div key={label.id} className="flex items-center">
                           <Badge
                              variant="secondary"
                              style={{
                                 backgroundColor: label.color + "20",
                                 color: label.color,
                              }}
                              className="cursor-pointer text-sm px-1.5 py-1 hover:opacity-80 transition-all flex items-center gap-2"
                              onClick={() => handleLabelSelect(label.id)}
                           >
                              <Tag className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">
                                 {label.name}
                              </span>
                              <Badge
                                 variant="outline"
                                 className="ml-1 text-xs px-1.5 py-0.5"
                                 style={{
                                    borderColor: label.color,
                                    color: label.color,
                                 }}
                              >
                                 {noteCounts.byLabel[label.id] || 0}
                              </Badge>
                           </Badge>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className="text-sm text-muted-foreground">No labels yet</p>
               )}
            </div>
         </div>

         {/* Search Modal */}
         <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            onNoteSelect={handleSearchNoteSelect}
         />
      </ScrollArea>
   );
}
