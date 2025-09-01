"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Folder, FolderOpen, ChevronRight, Move } from "lucide-react";
import { useNotes } from "@/contexts/notes-context";
import { cn } from "@/lib/utils";

interface FolderMoveDropdownProps {
   currentFolderId?: string;
   onMove: (folderId?: string) => Promise<void>;
   disabled?: boolean;
}

export function FolderMoveDropdown({
   currentFolderId,
   onMove,
   disabled = false,
}: FolderMoveDropdownProps) {
   const { folders } = useNotes();
   const [isMoving, setIsMoving] = useState(false);

   const currentFolder = folders.find((f) => f.id === currentFolderId);
   const rootFolder = { id: undefined, name: "All Notes" };

   const handleMove = async (folderId?: string) => {
      if (folderId === currentFolderId) return;

      setIsMoving(true);
      try {
         await onMove(folderId);
      } finally {
         setIsMoving(false);
      }
   };

   const getFolderPath = (folderId?: string) => {
      if (!folderId) return [rootFolder];

      const path = [];
      let current = folders.find((f) => f.id === folderId);

      while (current) {
         path.unshift(current);
         current = current.parentId
            ? folders.find((f) => f.id === current.parentId) || undefined
            : undefined;
      }

      return [rootFolder, ...path];
   };

   const currentPath = getFolderPath(currentFolderId);

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button
               variant="ghost"
               size="sm"
               disabled={disabled || isMoving}
               className="flex items-center gap-2"
            >
               <Move className="h-4 w-4" />
               <span className="hidden sm:inline">Move to</span>
               <span className="sm:hidden">Move</span>
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="w-64">
            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b border-border mb-1">
               Current:{" "}
               {currentPath.map((folder, index) => (
                  <span key={folder.id || "root"}>
                     {index > 0 && (
                        <ChevronRight className="h-3 w-3 inline mx-1" />
                     )}
                     <span
                        className={cn(
                           "text-foreground",
                           index === currentPath.length - 1 && "font-semibold"
                        )}
                     >
                        {folder.name}
                     </span>
                  </span>
               ))}
            </div>

            <DropdownMenuSeparator />

            {/* Move to root */}
            <DropdownMenuItem
               onClick={() => handleMove(undefined)}
               disabled={!currentFolderId || isMoving}
               className="flex items-center gap-2"
            >
               <Folder className="h-4 w-4" />
               <span>All Notes</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Available folders */}
            {folders.length === 0 ? (
               <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No folders available
               </div>
            ) : (
               folders.map((folder) => (
                  <DropdownMenuItem
                     key={folder.id}
                     onClick={() => handleMove(folder.id)}
                     disabled={folder.id === currentFolderId || isMoving}
                     className="flex items-center gap-2"
                  >
                     <FolderOpen className="h-4 w-4" />
                     <span className="truncate">{folder.name}</span>
                  </DropdownMenuItem>
               ))
            )}
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
