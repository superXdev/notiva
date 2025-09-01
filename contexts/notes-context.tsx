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
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { NotesService } from "@/lib/notes-service";

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
   selectedLabel: Label | undefined;
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
      byLabel: Record<string, number>;
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
   selectLabel: (id?: string) => void;
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
      selectedLabelId: undefined,
   });
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [noteCounts, setNoteCounts] = useState<{
      all: number;
      byFolder: Record<string, number>;
      byLabel: Record<string, number>;
   }>({
      all: 0,
      byFolder: {},
      byLabel: {},
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
         return await NotesService.getNoteCount(folderId);
      } catch (err) {
         console.error("Failed to get note count:", err);
         return 0;
      }
   }, []);

   const refreshNoteCountsWithFolders = useCallback(
      async (folders: Folder[], labels: Label[]) => {
         try {
            console.log("Refreshing note counts with folders...");

            // Get total count
            const allCount = await getNoteCount();
            console.log("Total count:", allCount);

            // Get counts for all folders in batch
            const folderIds = folders.map((f) => f.id);
            const folderCounts = await NotesService.getNoteCounts(folderIds);

            // Get counts for each label
            const labelNames = labels.map((l) => l.name);
            const labelCounts = await NotesService.getLabelCounts(labelNames);

            // Transform label counts to use label IDs as keys
            const labelCountsById: Record<string, number> = {};
            labels.forEach((label) => {
               labelCountsById[label.id] = labelCounts[label.name] || 0;
            });

            setNoteCounts({
               all: allCount,
               byFolder: folderCounts,
               byLabel: labelCountsById,
            });

            console.log("Note counts updated:", {
               all: allCount,
               byFolder: folderCounts,
               byLabel: labelCountsById,
            });
         } catch (err) {
            console.error("Failed to refresh note counts:", err);
            // Set default values on error
            setNoteCounts({
               all: 0,
               byFolder: {},
               byLabel: {},
            });
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

         // Get current state values to avoid stale closures
         const currentFolders = state.folders;
         const currentLabels = state.labels;

         // Get counts for all folders in batch
         const folderIds = currentFolders.map((f) => f.id);
         const folderCounts = await NotesService.getNoteCounts(folderIds);

         // Get counts for each label
         const labelNames = currentLabels.map((l) => l.name);
         const labelCounts = await NotesService.getLabelCounts(labelNames);

         // Transform label counts to use label IDs as keys
         const labelCountsById: Record<string, number> = {};
         currentLabels.forEach((label) => {
            labelCountsById[label.id] = labelCounts[label.name] || 0;
         });

         setNoteCounts({
            all: allCount,
            byFolder: folderCounts,
            byLabel: labelCountsById,
         });

         console.log("Note counts updated:", {
            all: allCount,
            byFolder: folderCounts,
            byLabel: labelCountsById,
         });
      } catch (err) {
         console.error("Failed to refresh note counts:", err);
         // Set default values on error
         setNoteCounts({
            all: 0,
            byFolder: {},
            byLabel: {},
         });
      }
   }, [getNoteCount]);

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

   // Note: Removed automatic refreshNoteCounts useEffect to prevent infinite loops
   // Note counts are now refreshed manually when needed (after CRUD operations)

   // Debug: Monitor noteCounts changes (commented out to reduce console noise)
   // useEffect(() => {
   //    console.log("noteCounts state changed:", noteCounts);
   // }, [noteCounts]);

   const loadData = useCallback(
      async (page = 1) => {
         try {
            setIsLoading(true);
            setError(null);

            // Load notes, folders, and labels in parallel
            const [notesResult, folders, labels] = await Promise.all([
               NotesService.getNotes(page, 10),
               NotesService.getFolders(),
               NotesService.getLabels(),
            ]);

            setState({
               notes: notesResult.data,
               folders,
               labels,
            });

            // Calculate pagination info
            const totalPages = Math.ceil(notesResult.count / 10);
            setPagination({
               notes: {
                  page,
                  limit: 10,
                  totalCount: notesResult.count,
                  totalPages,
                  hasNextPage: page < totalPages,
                  hasPrevPage: page > 1,
               },
               folders: {
                  page: 1,
                  limit: 5,
                  totalCount: folders.length,
                  totalPages: 1,
                  hasNextPage: false,
                  hasPrevPage: false,
               },
               labels: {
                  page: 1,
                  limit: 5,
                  totalCount: labels.length,
                  totalPages: 1,
                  hasNextPage: false,
                  hasPrevPage: false,
               },
            });

            // Refresh note counts after loading data
            await refreshNoteCountsWithFolders(folders, labels);
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to load data"
            );
         } finally {
            setIsLoading(false);
         }
      },
      [] // Empty dependency array since we're not using any external values
   );

   // Load data after authentication is available
   useEffect(() => {
      const supabase = createSupabaseClient();

      let hasLoaded = false;

      const init = async () => {
         try {
            const {
               data: { session },
            } = await supabase.auth.getSession();
            if (session && !hasLoaded) {
               hasLoaded = true;
               await loadData();
            }
         } catch {}
      };

      init();

      const { data } = supabase.auth.onAuthStateChange((event) => {
         if (
            (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
            !hasLoaded
         ) {
            hasLoaded = true;
            loadData();
         }
      });

      return () => {
         try {
            data.subscription.unsubscribe();
         } catch {}
      };
   }, []); // Empty dependency array to prevent infinite loops

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
            if (type === "notes") {
               const notesResult = await NotesService.getNotes(page, 10);
               const totalPages = Math.ceil(notesResult.count / 10);

               setState((prev) => ({
                  ...prev,
                  notes: notesResult.data,
               }));

               setPagination((prev) => ({
                  ...prev,
                  notes: {
                     page,
                     limit: 10,
                     totalCount: notesResult.count,
                     totalPages,
                     hasNextPage: page < totalPages,
                     hasPrevPage: page > 1,
                  },
               }));
            } else if (type === "folders") {
               const folders = await NotesService.getFolders();
               setState((prev) => ({
                  ...prev,
                  folders,
               }));
               await refreshNoteCountsWithFolders(folders, state.labels);
            } else if (type === "labels") {
               const labels = await NotesService.getLabels();
               setState((prev) => ({
                  ...prev,
                  labels,
               }));
            }
         } catch (err) {
            setError(
               err instanceof Error ? err.message : `Failed to load ${type}`
            );
         }
      },
      [] // Empty dependency array since we're not using any external values
   );

   // Note operations
   const createNote = useCallback(
      async (title: string, content = "", folderId?: string) => {
         try {
            const newNote = await NotesService.createNote(
               title,
               content,
               folderId
            );

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
      [] // Empty dependency array to prevent recreation
   );

   const updateNote = useCallback(
      async (id: string, updates: Partial<Note>) => {
         try {
            const updatedNote = await NotesService.updateNote(id, updates);

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
            await NotesService.deleteNote(id);

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
            const newFolder = await NotesService.createFolder(name, parentId);
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
            const updatedFolder = await NotesService.updateFolder(id, updates);
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
            await NotesService.deleteFolder(id);

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
         const newLabel = await NotesService.createLabel(name, color);
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
            const updatedLabel = await NotesService.updateLabel(id, updates);
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

            await NotesService.deleteLabel(id);

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

   const selectFolder = useCallback(async (id?: string) => {
      setState((prev) => ({
         ...prev,
         selectedFolderId: id,
         selectedLabelId: undefined,
      }));

      // Note: Removed refreshNoteCounts call as it's not needed when just selecting a folder
      // Counts should only be refreshed when notes are actually created, updated, or deleted
   }, []);

   const selectLabel = useCallback(async (id?: string) => {
      setState((prev) => ({
         ...prev,
         selectedLabelId: id,
         selectedFolderId: undefined,
      }));

      // Note: Removed refreshNoteCounts call as it's not needed when just selecting a label
      // Counts should only be refreshed when notes are actually created, updated, or deleted
   }, []);

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

   const selectedLabel = useMemo(
      () => state.labels.find((label) => label.id === state.selectedLabelId),
      [state.labels, state.selectedLabelId]
   );

   const filteredNotes = useMemo(() => {
      let notes = state.notes;
      if (state.selectedFolderId) {
         notes = notes.filter(
            (note) => note.folderId === state.selectedFolderId
         );
      }
      if (state.selectedLabelId) {
         const selectedLabel = state.labels.find(
            (label) => label.id === state.selectedLabelId
         );
         if (selectedLabel) {
            notes = notes.filter((note) =>
               note.labels.includes(selectedLabel.name)
            );
         }
      }
      return notes;
   }, [
      state.notes,
      state.selectedFolderId,
      state.selectedLabelId,
      state.labels,
   ]);

   const value: NotesContextType = {
      // State
      notes: state.notes,
      folders: state.folders,
      labels: state.labels,
      selectedNote,
      selectedFolder,
      selectedLabel,
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
      selectLabel,
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
