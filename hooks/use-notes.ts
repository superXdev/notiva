"use client";

import { useState, useEffect, useMemo } from "react";
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

export function useNotes() {
   const [state, setState] = useState<AppState>({
      notes: [],
      folders: [],
      labels: [],
      selectedNoteId: undefined,
      selectedFolderId: undefined,
   });
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [pagination, setPagination] = useState<{
      notes: PaginationInfo;
      folders: PaginationInfo;
      labels: PaginationInfo;
   }>({
      notes: {
         page: 1,
         limit: 5,
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

   // Load data on mount
   useEffect(() => {
      loadData();
   }, []);

   const loadData = async (page = 1) => {
      try {
         setIsLoading(true);
         setError(null);

         // Load notes, folders, and labels in parallel with pagination
         const [notesResponse, foldersResponse, labelsResponse] =
            await Promise.all([
               fetch(`/api/notes?page=${page}&limit=5`),
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
      } catch (err) {
         setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
         setIsLoading(false);
      }
   };

   // Pagination functions
   const loadNextPage = async (type: "notes" | "folders" | "labels") => {
      const currentPage = pagination[type].page;
      if (pagination[type].hasNextPage) {
         await loadDataByType(type, currentPage + 1);
      }
   };

   const loadPrevPage = async (type: "notes" | "folders" | "labels") => {
      const currentPage = pagination[type].page;
      if (pagination[type].hasPrevPage) {
         await loadDataByType(type, currentPage - 1);
      }
   };

   const loadDataByType = async (
      type: "notes" | "folders" | "labels",
      page: number
   ) => {
      try {
         const response = await fetch(`/api/${type}?page=${page}&limit=5`);
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
      } catch (err) {
         setError(
            err instanceof Error ? err.message : `Failed to load ${type}`
         );
      }
   };

   // Note operations
   const createNote = async (
      title: string,
      content = "",
      folderId?: string
   ) => {
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

         return newNote;
      } catch (err) {
         setError(err instanceof Error ? err.message : "Failed to create note");
         throw err;
      }
   };

   const updateNote = async (id: string, updates: Partial<Note>) => {
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
         setState((prev) => {
            const updatedNotes = prev.notes.map((note) =>
               note.id === id ? updatedNote : note
            );
            return {
               ...prev,
               notes: updatedNotes,
            };
         });

         return updatedNote;
      } catch (err) {
         setError(err instanceof Error ? err.message : "Failed to update note");
         throw err;
      }
   };

   const deleteNote = async (id: string) => {
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
      } catch (err) {
         setError(err instanceof Error ? err.message : "Failed to delete note");
         throw err;
      }
   };

   // Folder operations
   const createFolder = async (name: string, parentId?: string) => {
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

         return newFolder;
      } catch (err) {
         setError(
            err instanceof Error ? err.message : "Failed to create folder"
         );
         throw err;
      }
   };

   const updateFolder = async (id: string, updates: Partial<Folder>) => {
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
   };

   const deleteFolder = async (id: string) => {
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
               prev.selectedFolderId === id ? undefined : prev.selectedFolderId,
         }));
      } catch (err) {
         setError(
            err instanceof Error ? err.message : "Failed to delete folder"
         );
         throw err;
      }
   };

   // Label operations
   const createLabel = async (name: string, color: string) => {
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
   };

   const updateLabel = async (id: string, updates: Partial<Label>) => {
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
   };

   const deleteLabel = async (id: string) => {
      try {
         const response = await fetch(`/api/labels/${id}`, {
            method: "DELETE",
         });

         if (!response.ok) {
            throw new Error("Failed to delete label");
         }

         const labelToDelete = state.labels.find((label) => label.id === id);
         if (!labelToDelete) return;

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
      } catch (err) {
         setError(
            err instanceof Error ? err.message : "Failed to delete label"
         );
         throw err;
      }
   };

   // Selection operations
   const selectNote = (id: string) => {
      setState((prev) => ({ ...prev, selectedNoteId: id }));
   };

   const selectFolder = (id?: string) => {
      setState((prev) => ({ ...prev, selectedFolderId: id }));
   };

   // Computed values
   const selectedNote = useMemo(() => {
      return state.notes.find((note) => note.id === state.selectedNoteId);
   }, [state.notes, state.selectedNoteId]);
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

   return {
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
      loadData, // Expose for manual refresh
      loadNextPage,
      loadPrevPage,
      loadDataByType,
   };
}
