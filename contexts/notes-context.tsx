"use client";

import React, {
   createContext,
   useContext,
   useState,
   useEffect,
   useMemo,
   useCallback,
} from "react";
import type { Note, Folder, Label, AppState } from "@/lib/types";

interface PaginationInfo {
   page: number;
   limit: number;
   totalCount: number;
   totalPages: number;
   hasNextPage: boolean;
   hasPrevPage: boolean;
}

interface PaginatedResponse<T> {
   data: T[];
   pagination: PaginationInfo;
}

interface NotesContextType {
   // State
   notes: Note[];
   folders: Folder[];
   labels: Label[];
   selectedNote: Note | undefined;
   selectedFolder: Folder | undefined;
   filteredNotes: Note[];
   isLoading: boolean;
   error: string | null;
   pagination: {
      notes: PaginationInfo;
      folders: PaginationInfo;
      labels: PaginationInfo;
   };
   noteCounts: {
      all: number;
      byFolder: Record<string, number>;
   };

   // Actions
   createNote: (
      title: string,
      content?: string,
      folderId?: string
   ) => Promise<Note>;
   updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
   deleteNote: (id: string) => Promise<void>;
   createFolder: (name: string, parentId?: string) => Promise<Folder>;
   updateFolder: (id: string, updates: Partial<Folder>) => Promise<Folder>;
   deleteFolder: (id: string) => Promise<void>;
   createLabel: (name: string, color: string) => Promise<Label>;
   updateLabel: (id: string, updates: Partial<Label>) => Promise<Label>;
   deleteLabel: (id: string) => Promise<void>;
   selectNote: (id: string) => void;
   selectFolder: (id?: string) => void;
   loadData: (page?: number) => Promise<void>;
   loadNextPage: (type: "notes" | "folders" | "labels") => Promise<void>;
   loadPrevPage: (type: "notes" | "folders" | "labels") => Promise<void>;
   loadDataByType: (
      type: "notes" | "folders" | "labels",
      page: number
   ) => Promise<void>;
   getNoteCount: (folderId?: string) => Promise<number>;
   refreshNoteCounts: () => Promise<void>;
   refreshFolderCount: (folderId: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
   const [state, setState] = useState<AppState>({
      notes: [],
      folders: [],
      labels: [],
      selectedNoteId: undefined,
      selectedFolderId: undefined,
   });
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [noteCounts, setNoteCounts] = useState<{
      all: number;
      byFolder: Record<string, number>;
   }>({
      all: 0,
      byFolder: {},
   });
   const [pagination, setPagination] = useState<{
      notes: PaginationInfo;
      folders: PaginationInfo;
      labels: PaginationInfo;
   }>({
      notes: {
         page: 1,
         limit: 10,
         totalCount: 0,
         totalPages: 0,
         hasNextPage: false,
         hasPrevPage: false,
      },
      folders: {
         page: 1,
         limit: 5,
         totalCount: 0,
         totalPages: 0,
         hasNextPage: false,
         hasPrevPage: false,
      },
      labels: {
         page: 1,
         limit: 5,
         totalCount: 0,
         totalPages: 0,
         hasNextPage: false,
         hasPrevPage: false,
      },
   });

   // Note count functions
   const getNoteCount = useCallback(async (folderId?: string) => {
      try {
         const url = folderId
            ? `/api/notes/count?folderId=${folderId}`
            : "/api/notes/count";

         const response = await fetch(url);
         if (!response.ok) {
            throw new Error("Failed to get note count");
         }

         const { count } = await response.json();
         return count || 0;
      } catch (err) {
         console.error("Failed to get note count:", err);
         return 0;
      }
   }, []);

   const refreshNoteCountsWithFolders = useCallback(
      async (folders: Folder[]) => {
         try {
            console.log("Refreshing note counts with folders...");

            // Get total count
            const allCount = await getNoteCount();
            console.log("Total count:", allCount);

            // Get counts for each folder
            const folderCounts: Record<string, number> = {};
            for (const folder of folders) {
               const count = await getNoteCount(folder.id);
               folderCounts[folder.id] = count;
               console.log(
                  `Folder "${folder.name}" (${folder.id}): ${count} notes`
               );
            }

            setNoteCounts({
               all: allCount,
               byFolder: folderCounts,
            });

            console.log("Note counts updated:", {
               all: allCount,
               byFolder: folderCounts,
            });
         } catch (err) {
            console.error("Failed to refresh note counts:", err);
         }
      },
      [getNoteCount]
   );

   const refreshNoteCounts = useCallback(async () => {
      try {
         console.log("Refreshing note counts...");

         // Get total count
         const allCount = await getNoteCount();
         console.log("Total count:", allCount);

         // Get counts for each folder
         const folderCounts: Record<string, number> = {};
         for (const folder of state.folders) {
            const count = await getNoteCount(folder.id);
            folderCounts[folder.id] = count;
            console.log(
               `Folder "${folder.name}" (${folder.id}): ${count} notes`
            );
         }

         setNoteCounts({
            all: allCount,
            byFolder: folderCounts,
         });

         console.log("Note counts updated:", {
            all: allCount,
            byFolder: folderCounts,
         });
      } catch (err) {
         console.error("Failed to refresh note counts:", err);
      }
   }, [state.folders, getNoteCount]);

   const refreshFolderCount = useCallback(
      async (folderId: string) => {
         try {
            console.log(`Refreshing count for folder ${folderId}...`);
            const count = await getNoteCount(folderId);
            console.log(`Folder ${folderId} count: ${count}`);

            setNoteCounts((prev) => {
               const newState = {
                  ...prev,
                  byFolder: {
                     ...prev.byFolder,
                     [folderId]: count,
                  },
               };
               console.log(
                  `Updated noteCounts state for folder ${folderId}:`,
                  newState
               );
               return newState;
            });
         } catch (err) {
            console.error("Failed to refresh folder count:", err);
         }
      },
      [getNoteCount]
   );

   // Load data on mount
   useEffect(() => {
      loadData();
   }, []);

   // Refresh note counts when folders are loaded
   useEffect(() => {
      if (state.folders.length > 0) {
         refreshNoteCounts();
      }
   }, [state.folders, refreshNoteCounts]);

   // Debug: Monitor noteCounts changes
   useEffect(() => {
      console.log("noteCounts state changed:", noteCounts);
   }, [noteCounts]);

   const loadData = useCallback(async (page = 1) => {
      try {
         setIsLoading(true);
         setError(null);

         // Load notes, folders, and labels in parallel with pagination
         const [notesResponse, foldersResponse, labelsResponse] =
            await Promise.all([
               fetch(`/api/notes?page=${page}&limit=10`),
               fetch(`/api/folders?page=${page}&limit=5`),
               fetch(`/api/labels?page=${page}&limit=5`),
            ]);

         if (!notesResponse.ok || !foldersResponse.ok || !labelsResponse.ok) {
            throw new Error("Failed to load data");
         }

         const [notesData, foldersData, labelsData]: [
            PaginatedResponse<Note>,
            PaginatedResponse<Folder>,
            PaginatedResponse<Label>
         ] = await Promise.all([
            notesResponse.json(),
            foldersResponse.json(),
            labelsResponse.json(),
         ]);

         setState({
            notes: notesData.data,
            folders: foldersData.data,
            labels: labelsData.data,
         });

         setPagination({
            notes: notesData.pagination,
            folders: foldersData.pagination,
            labels: labelsData.pagination,
         });

         // Refresh note counts after loading data with the new folders
         await refreshNoteCountsWithFolders(foldersData.data);
      } catch (err) {
         setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
         setIsLoading(false);
      }
   }, []);

   // Pagination functions
   const loadNextPage = useCallback(
      async (type: "notes" | "folders" | "labels") => {
         const currentPage = pagination[type].page;
         if (pagination[type].hasNextPage) {
            await loadDataByType(type, currentPage + 1);
         }
      },
      [pagination]
   );

   const loadPrevPage = useCallback(
      async (type: "notes" | "folders" | "labels") => {
         const currentPage = pagination[type].page;
         if (pagination[type].hasPrevPage) {
            await loadDataByType(type, currentPage - 1);
         }
      },
      [pagination]
   );

   const loadDataByType = useCallback(
      async (type: "notes" | "folders" | "labels", page: number) => {
         try {
            const limit = type === "notes" ? 10 : 5;
            const response = await fetch(
               `/api/${type}?page=${page}&limit=${limit}`
            );
            if (!response.ok) {
               throw new Error(`Failed to load ${type}`);
            }

            const data: PaginatedResponse<any> = await response.json();

            setState((prev) => ({
               ...prev,
               [type]: data.data,
            }));

            setPagination((prev) => ({
               ...prev,
               [type]: data.pagination,
            }));

            // If folders were loaded, refresh note counts
            if (type === "folders") {
               await refreshNoteCountsWithFolders(data.data);
            }
         } catch (err) {
            setError(
               err instanceof Error ? err.message : `Failed to load ${type}`
            );
         }
      },
      [refreshNoteCountsWithFolders]
   );

   // Note operations
   const createNote = useCallback(
      async (title: string, content = "", folderId?: string) => {
         try {
            const response = await fetch("/api/notes", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ title, content, folderId }),
            });

            if (!response.ok) {
               throw new Error("Failed to create note");
            }

            const newNote = await response.json();
            setState((prev) => ({
               ...prev,
               notes: [newNote, ...prev.notes],
               selectedNoteId: newNote.id,
            }));

            // Refresh note counts after creating a note
            await refreshNoteCounts();

            return newNote;
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to create note"
            );
            throw err;
         }
      },
      [refreshNoteCounts]
   );

   const updateNote = useCallback(
      async (id: string, updates: Partial<Note>) => {
         try {
            const response = await fetch(`/api/notes/${id}`, {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(updates),
            });

            if (!response.ok) {
               throw new Error("Failed to update note");
            }

            const updatedNote = await response.json();

            // Update state and return a promise that resolves when state is updated
            return new Promise<Note>((resolve) => {
               setState((prev) => {
                  const updatedNotes = prev.notes.map((note) =>
                     note.id === id ? updatedNote : note
                  );
                  const newState = {
                     ...prev,
                     notes: updatedNotes,
                  };

                  // Resolve the promise after state update
                  setTimeout(() => resolve(updatedNote), 0);

                  return newState;
               });
            });

            // Refresh note counts if folder was changed
            if (updates.folderId !== undefined) {
               await refreshNoteCounts();
            }
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to update note"
            );
            throw err;
         }
      },
      [refreshNoteCounts]
   );

   const deleteNote = useCallback(
      async (id: string) => {
         try {
            const response = await fetch(`/api/notes/${id}`, {
               method: "DELETE",
            });

            if (!response.ok) {
               throw new Error("Failed to delete note");
            }

            setState((prev) => ({
               ...prev,
               notes: prev.notes.filter((note) => note.id !== id),
               selectedNoteId:
                  prev.selectedNoteId === id ? undefined : prev.selectedNoteId,
            }));

            // Refresh note counts after deleting a note
            await refreshNoteCounts();
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to delete note"
            );
            throw err;
         }
      },
      [refreshNoteCounts]
   );

   // Folder operations
   const createFolder = useCallback(
      async (name: string, parentId?: string) => {
         try {
            const response = await fetch("/api/folders", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ name, parentId }),
            });

            if (!response.ok) {
               throw new Error("Failed to create folder");
            }

            const newFolder = await response.json();
            setState((prev) => ({
               ...prev,
               folders: [newFolder, ...prev.folders],
            }));

            // Refresh note counts after creating a folder
            await refreshNoteCounts();

            return newFolder;
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to create folder"
            );
            throw err;
         }
      },
      [refreshNoteCounts]
   );

   const updateFolder = useCallback(
      async (id: string, updates: Partial<Folder>) => {
         try {
            const response = await fetch(`/api/folders/${id}`, {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(updates),
            });

            if (!response.ok) {
               throw new Error("Failed to update folder");
            }

            const updatedFolder = await response.json();
            setState((prev) => ({
               ...prev,
               folders: prev.folders.map((folder) =>
                  folder.id === id ? updatedFolder : folder
               ),
            }));

            return updatedFolder;
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to update folder"
            );
            throw err;
         }
      },
      []
   );

   const deleteFolder = useCallback(
      async (id: string) => {
         try {
            const response = await fetch(`/api/folders/${id}`, {
               method: "DELETE",
            });

            if (!response.ok) {
               throw new Error("Failed to delete folder");
            }

            setState((prev) => ({
               ...prev,
               folders: prev.folders.filter((folder) => folder.id !== id),
               notes: prev.notes.map((note) =>
                  note.folderId === id ? { ...note, folderId: undefined } : note
               ),
               selectedFolderId:
                  prev.selectedFolderId === id
                     ? undefined
                     : prev.selectedFolderId,
            }));

            // Refresh note counts after deleting a folder
            await refreshNoteCounts();
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to delete folder"
            );
            throw err;
         }
      },
      [refreshNoteCounts]
   );

   // Label operations
   const createLabel = useCallback(async (name: string, color: string) => {
      try {
         const response = await fetch("/api/labels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, color }),
         });

         if (!response.ok) {
            throw new Error("Failed to create label");
         }

         const newLabel = await response.json();
         setState((prev) => ({
            ...prev,
            labels: [newLabel, ...prev.labels],
         }));

         return newLabel;
      } catch (err) {
         setError(
            err instanceof Error ? err.message : "Failed to create label"
         );
         throw err;
      }
   }, []);

   const updateLabel = useCallback(
      async (id: string, updates: Partial<Label>) => {
         try {
            const response = await fetch(`/api/labels/${id}`, {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(updates),
            });

            if (!response.ok) {
               throw new Error("Failed to update label");
            }

            const updatedLabel = await response.json();
            setState((prev) => ({
               ...prev,
               labels: prev.labels.map((label) =>
                  label.id === id ? updatedLabel : label
               ),
            }));

            return updatedLabel;
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to update label"
            );
            throw err;
         }
      },
      []
   );

   const deleteLabel = useCallback(
      async (id: string) => {
         try {
            console.log(`Attempting to delete label with id: ${id}`);

            const response = await fetch(`/api/labels/${id}`, {
               method: "DELETE",
            });

            if (!response.ok) {
               const errorText = await response.text();
               console.error(
                  `Label deletion failed: ${response.status} - ${errorText}`
               );
               throw new Error(
                  `Failed to delete label: ${response.status} - ${errorText}`
               );
            }

            const result = await response.json();
            console.log("Label deletion successful:", result);

            const labelToDelete = state.labels.find((label) => label.id === id);
            if (!labelToDelete) {
               console.warn("Label to delete not found in state");
               return;
            }

            console.log(
               `Removing label "${labelToDelete.name}" from state and notes`
            );

            setState((prev) => ({
               ...prev,
               labels: prev.labels.filter((label) => label.id !== id),
               notes: prev.notes.map((note) => ({
                  ...note,
                  labels: note.labels.filter(
                     (labelName) => labelName !== labelToDelete.name
                  ),
               })),
            }));

            console.log("Label deletion completed successfully");
         } catch (err) {
            console.error("Label deletion error:", err);
            setError(
               err instanceof Error ? err.message : "Failed to delete label"
            );
            throw err;
         }
      },
      [state.labels]
   );

   // Selection operations
   const selectNote = useCallback((id: string) => {
      setState((prev) => ({ ...prev, selectedNoteId: id }));
   }, []);

   const selectFolder = useCallback(
      async (id?: string) => {
         setState((prev) => ({ ...prev, selectedFolderId: id }));

         // Refresh note counts when folder selection changes
         await refreshNoteCounts();
      },
      [refreshNoteCounts]
   );

   // Computed values
   const selectedNote = useMemo(
      () => state.notes.find((note) => note.id === state.selectedNoteId),
      [state.notes, state.selectedNoteId]
   );

   const selectedFolder = useMemo(
      () =>
         state.folders.find((folder) => folder.id === state.selectedFolderId),
      [state.folders, state.selectedFolderId]
   );

   const filteredNotes = useMemo(
      () =>
         state.notes.filter((note) => {
            if (state.selectedFolderId) {
               return note.folderId === state.selectedFolderId;
            }
            return true;
         }),
      [state.notes, state.selectedFolderId]
   );

   const value: NotesContextType = {
      // State
      notes: state.notes,
      folders: state.folders,
      labels: state.labels,
      selectedNote,
      selectedFolder,
      filteredNotes,
      isLoading,
      error,
      pagination,
      noteCounts,

      // Actions
      createNote,
      updateNote,
      deleteNote,
      createFolder,
      updateFolder,
      deleteFolder,
      createLabel,
      updateLabel,
      deleteLabel,
      selectNote,
      selectFolder,
      loadData,
      loadNextPage,
      loadPrevPage,
      loadDataByType,
      getNoteCount,
      refreshNoteCounts,
      refreshFolderCount,
   };

   return (
      <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
   );
}

export function useNotes() {
   const context = useContext(NotesContext);
   if (context === undefined) {
      throw new Error("useNotes must be used within a NotesProvider");
   }
   return context;
}
