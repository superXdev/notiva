"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   ContextMenu,
   ContextMenuContent,
   ContextMenuItem,
   ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import {
   Plus,
   Search,
   Folder,
   FileText,
   Tag,
   MoreHorizontal,
   Trash2,
   ChevronLeft,
   ChevronRight,
   Download,
   HelpCircle,
   Edit,
} from "lucide-react";
import { useNotes } from "@/contexts/notes-context";
import { cn } from "@/lib/utils";
import {
   NoteSkeleton,
   FolderSkeleton,
   LabelSkeleton,
} from "@/components/ui/skeleton";
import { exportToPDF } from "@/lib/pdf-export";

interface SidebarProps {
   onNoteSelect?: () => void;
}

export function Sidebar({ onNoteSelect }: SidebarProps) {
   const {
      notes,
      folders,
      labels,
      selectedNote,
      selectedFolder,
      selectedLabel,
      filteredNotes,
      pagination,
      noteCounts,
      isLoading,
      createNote,
      createFolder,
      updateFolder,
      createLabel,
      deleteFolder,
      deleteLabel,
      deleteNote,
      selectNote,
      selectFolder,
      selectLabel,
      loadNextPage,
      loadPrevPage,
      refreshNoteCounts,
   } = useNotes();

   const [searchQuery, setSearchQuery] = useState("");
   const [newFolderName, setNewFolderName] = useState("");
   const [newLabelName, setNewLabelName] = useState("");
   const [newLabelColor, setNewLabelColor] = useState("#3b82f6");
   const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
   const [isCreateLabelOpen, setIsCreateLabelOpen] = useState(false);
   const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
   const [folderToRename, setFolderToRename] = useState<{
      id: string;
      name: string;
   } | null>(null);
   const [renameFolderName, setRenameFolderName] = useState("");

   const handleCreateNote = async () => {
      try {
         const title = `Note ${notes.length + 1}`;
         await createNote(title, "", selectedFolder?.id);
         onNoteSelect?.();
      } catch (error) {
         console.error("Error creating note:", error);
         // You might want to show a toast or alert here
      }
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

   const handleRenameFolder = () => {
      if (folderToRename && renameFolderName.trim()) {
         updateFolder(folderToRename.id, { name: renameFolderName.trim() });
         setRenameFolderName("");
         setFolderToRename(null);
         setIsRenameFolderOpen(false);
      }
   };

   const openRenameDialog = (folder: { id: string; name: string }) => {
      setFolderToRename(folder);
      setRenameFolderName(folder.name);
      setIsRenameFolderOpen(true);
   };

   const handleNoteSelect = (noteId: string) => {
      selectNote(noteId);
      onNoteSelect?.();
   };

   const handleDeleteNote = async (note: any) => {
      if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
         await deleteNote(note.id);
      }
   };

   const handleExportPDF = async (note: any) => {
      try {
         await exportToPDF({
            title: note.title,
            content: note.content,
            labels: note.labels,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
         });
      } catch (error) {
         console.error("Error exporting PDF:", error);
         alert("Failed to export PDF. Please try again.");
      }
   };

   const searchedNotes = filteredNotes.filter(
      (note) =>
         note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         note.content.toLowerCase().includes(searchQuery.toLowerCase())
   );

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

   return (
      <div className="w-full md:w-80 border-r border-border bg-card flex flex-col h-full">
         {/* Header */}
         <div className="p-3 md:p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3 md:mb-4">
               <h1 className="text-lg md:text-xl font-semibold">Notes</h1>
               <Button
                  size="sm"
                  onClick={handleCreateNote}
                  className="text-xs md:text-sm"
               >
                  <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="hidden sm:inline">New Note</span>
                  <span className="sm:hidden">New</span>
               </Button>
            </div>

            {/* Search */}
            <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
               />
            </div>
         </div>

         <ScrollArea className="flex-1">
            {/* Folders Section */}
            <div className="p-3 md:p-4">
               <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
                     Folders
                  </h3>
                  <Dialog
                     open={isCreateFolderOpen}
                     onOpenChange={setIsCreateFolderOpen}
                  >
                     <DialogTrigger asChild>
                        <Button
                           variant="ghost"
                           size="sm"
                           className="h-6 w-6 p-0"
                        >
                           <Plus className="h-3 w-3" />
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

                  {/* Rename Folder Dialog */}
                  <Dialog
                     open={isRenameFolderOpen}
                     onOpenChange={setIsRenameFolderOpen}
                  >
                     <DialogContent className="w-[90vw] max-w-md">
                        <DialogHeader>
                           <DialogTitle>Rename Folder</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                           <Input
                              placeholder="Folder name"
                              value={renameFolderName}
                              onChange={(e) =>
                                 setRenameFolderName(e.target.value)
                              }
                              onKeyDown={(e) =>
                                 e.key === "Enter" && handleRenameFolder()
                              }
                           />
                           <Button
                              onClick={handleRenameFolder}
                              className="w-full"
                           >
                              Rename Folder
                           </Button>
                        </div>
                     </DialogContent>
                  </Dialog>
               </div>

               {/* Scrollable folders container - height for at least 3 items (3 * 32px + 4px spacing = 100px) */}
               <div className="h-[130px] overflow-y-auto scrollbar-thin">
                  <div className="space-y-1">
                     <Button
                        variant={!selectedFolder ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm h-8"
                        onClick={() => selectFolder()}
                     >
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                           All Notes ({noteCounts.all})
                        </span>
                     </Button>

                     {isLoading
                        ? // Show skeleton loading for folders
                          Array.from({ length: 3 }).map((_, index) => (
                             <FolderSkeleton key={index} className="h-8" />
                          ))
                        : folders.map((folder) => (
                             <div
                                key={folder.id}
                                className="flex items-center group"
                             >
                                <Button
                                   variant={
                                      selectedFolder?.id === folder.id
                                         ? "secondary"
                                         : "ghost"
                                   }
                                   className="flex-1 justify-start text-sm h-8 min-w-0"
                                   onClick={() => selectFolder(folder.id)}
                                >
                                   <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                                   <span className="truncate">
                                      {folder.name} (
                                      {noteCounts.byFolder[folder.id] || 0})
                                   </span>
                                </Button>
                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button
                                         variant="ghost"
                                         size="sm"
                                         className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 flex-shrink-0"
                                      >
                                         <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent>
                                      <DropdownMenuItem
                                         onClick={() =>
                                            openRenameDialog(folder)
                                         }
                                      >
                                         <Edit className="h-4 w-4 mr-2" />
                                         Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                         onClick={() => deleteFolder(folder.id)}
                                         className="text-destructive"
                                      >
                                         <Trash2 className="h-4 w-4 mr-2" />
                                         Delete
                                      </DropdownMenuItem>
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </div>
                          ))}
                  </div>
               </div>
            </div>

            <Separator />

            {/* Labels Section */}
            <div className="p-3 md:p-4">
               <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
                     Labels{" "}
                     {selectedLabel &&
                        `(${noteCounts.byLabel[selectedLabel.id] || 0} notes)`}
                  </h3>
                  <Dialog
                     open={isCreateLabelOpen}
                     onOpenChange={setIsCreateLabelOpen}
                  >
                     <DialogTrigger asChild>
                        <Button
                           variant="ghost"
                           size="sm"
                           className="h-6 w-6 p-0"
                        >
                           <Plus className="h-3 w-3" />
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

               <div className="flex flex-wrap gap-1.5">
                  {isLoading
                     ? // Show skeleton loading for labels
                       Array.from({ length: 4 }).map((_, index) => (
                          <LabelSkeleton key={index} />
                       ))
                     : labels.map((label) => (
                          <div key={label.id} className="group relative">
                             <Badge
                                variant={
                                   selectedLabel?.id === label.id
                                      ? "default"
                                      : "secondary"
                                }
                                style={{
                                   backgroundColor:
                                      selectedLabel?.id === label.id
                                         ? label.color
                                         : label.color + "20",
                                   color:
                                      selectedLabel?.id === label.id
                                         ? "white"
                                         : label.color,
                                }}
                                className="cursor-pointer text-xs hover:opacity-80 transition-all"
                                onClick={() =>
                                   selectLabel(
                                      selectedLabel?.id === label.id
                                         ? undefined
                                         : label.id
                                   )
                                }
                             >
                                <Tag className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[80px]">
                                   {label.name}
                                </span>
                             </Badge>
                             <Button
                                variant="ghost"
                                size="sm"
                                className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full text-xs"
                                onClick={(e) => {
                                   e.stopPropagation();
                                   deleteLabel(label.id);
                                }}
                             >
                                ×
                             </Button>
                          </div>
                       ))}
               </div>
            </div>

            <Separator />

            {/* Notes List */}
            <div className="p-3 md:p-4">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                     <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
                        {selectedLabel
                           ? `Label: ${selectedLabel.name}`
                           : selectedFolder
                           ? selectedFolder.name
                           : "All Notes"}{" "}
                        (
                        {selectedLabel
                           ? filteredNotes.length
                           : selectedFolder
                           ? noteCounts.byFolder[selectedFolder.id] || 0
                           : noteCounts.all}
                        )
                     </h3>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                           >
                              <HelpCircle className="h-3 w-3" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Right-click on notes for more options</p>
                        </TooltipContent>
                     </Tooltip>
                     {(selectedLabel || selectedFolder) && (
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => {
                              selectLabel();
                              selectFolder();
                           }}
                           className="h-6 px-2 text-xs"
                        >
                           Clear
                        </Button>
                     )}
                  </div>

                  {/* Pagination Controls */}
                  {pagination.notes.totalPages > 1 && (
                     <div className="flex items-center space-x-1">
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => loadPrevPage("notes")}
                           disabled={!pagination.notes.hasPrevPage}
                           className="h-6 w-6 p-0"
                        >
                           <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground px-1">
                           {pagination.notes.page}/{pagination.notes.totalPages}
                        </span>
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => loadNextPage("notes")}
                           disabled={!pagination.notes.hasNextPage}
                           className="h-6 w-6 p-0"
                        >
                           <ChevronRight className="h-3 w-3" />
                        </Button>
                     </div>
                  )}
               </div>

               {/* Scrollable notes container - height for at least 4 items (4 * ~80px + 8px spacing = ~328px) */}
               <div className="h-[398px] overflow-y-auto scrollbar-thin">
                  <div className="space-y-2">
                     {isLoading ? (
                        // Show skeleton loading for notes
                        Array.from({ length: 10 }).map((_, index) => (
                           <NoteSkeleton key={index} />
                        ))
                     ) : (
                        <>
                           {searchedNotes.map((note) => (
                              <ContextMenu key={note.id}>
                                 <ContextMenuTrigger asChild>
                                    <div
                                       className={cn(
                                          "p-2 md:p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent hover:shadow-sm group",
                                          selectedNote?.id === note.id &&
                                             "bg-accent border-accent-foreground/20 shadow-sm"
                                       )}
                                       onClick={() => handleNoteSelect(note.id)}
                                    >
                                       {/* Folder Path */}
                                       {note.folderId && (
                                          <div className="flex items-center text-xs text-muted-foreground mb-1">
                                             {getFolderPath(note.folderId).map(
                                                (folder, index) => (
                                                   <span
                                                      key={folder.id}
                                                      className="flex items-center"
                                                   >
                                                      {index > 0 && (
                                                         <ChevronRight className="h-3 w-3 mx-1" />
                                                      )}
                                                      <span className="truncate">
                                                         {folder.name}
                                                      </span>
                                                   </span>
                                                )
                                             )}
                                             <ChevronRight className="h-3 w-3 mx-1" />
                                          </div>
                                       )}

                                       <h4 className="font-medium text-sm mb-1 truncate">
                                          {note.title}
                                       </h4>
                                       {note.labels.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                             {note.labels
                                                .slice(0, 2)
                                                .map((labelName) => {
                                                   const label = labels.find(
                                                      (l) =>
                                                         l.name === labelName
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
                                             {note.labels.length > 2 && (
                                                <Badge
                                                   variant="secondary"
                                                   className="text-xs px-1.5 py-0.5"
                                                >
                                                   +{note.labels.length - 2}
                                                </Badge>
                                             )}
                                          </div>
                                       )}
                                       <div className="text-xs text-muted-foreground mt-2">
                                          {new Date(
                                             note.updatedAt
                                          ).toLocaleDateString()}
                                       </div>
                                    </div>
                                 </ContextMenuTrigger>
                                 <ContextMenuContent>
                                    <ContextMenuItem
                                       onClick={() => handleDeleteNote(note)}
                                       className="text-red-600 dark:text-red-400"
                                    >
                                       <Trash2 className="h-4 w-4 mr-2" />
                                       Delete Note
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                       onClick={() => handleExportPDF(note)}
                                    >
                                       <Download className="h-4 w-4 mr-2" />
                                       Export as PDF
                                    </ContextMenuItem>
                                 </ContextMenuContent>
                              </ContextMenu>
                           ))}

                           {searchedNotes.length === 0 && (
                              <div className="text-center py-6 md:py-8 text-muted-foreground">
                                 <FileText className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                                 <p className="text-sm">No notes found</p>
                                 {searchQuery && (
                                    <p className="text-xs mt-1">
                                       Try adjusting your search
                                    </p>
                                 )}
                              </div>
                           )}
                        </>
                     )}
                  </div>
               </div>
            </div>
         </ScrollArea>
      </div>
   );
}
