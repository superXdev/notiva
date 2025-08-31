"use client"

import { useState, useEffect } from "react"
import type { Note, Folder, Label, AppState } from "@/lib/types"
import { storage } from "@/lib/storage"

export function useNotes() {
  const [state, setState] = useState<AppState>({ notes: [], folders: [], labels: [] })
  const [isLoading, setIsLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    const appState = storage.getAppState()
    setState(appState)
    setIsLoading(false)
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      storage.saveAppState(state)
    }
  }, [state, isLoading])

  // Note operations
  const createNote = (title: string, content = "", folderId?: string) => {
    const newNote: Note = {
      id: storage.generateId(),
      title,
      content,
      folderId,
      labels: [],
      createdAt: storage.getCurrentTimestamp(),
      updatedAt: storage.getCurrentTimestamp(),
    }

    setState((prev) => ({
      ...prev,
      notes: [...prev.notes, newNote],
      selectedNoteId: newNote.id,
    }))

    return newNote
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: storage.getCurrentTimestamp() } : note,
      ),
    }))
  }

  const deleteNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((note) => note.id !== id),
      selectedNoteId: prev.selectedNoteId === id ? undefined : prev.selectedNoteId,
    }))
  }

  // Folder operations
  const createFolder = (name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: storage.generateId(),
      name,
      parentId,
      createdAt: storage.getCurrentTimestamp(),
    }

    setState((prev) => ({
      ...prev,
      folders: [...prev.folders, newFolder],
    }))

    return newFolder
  }

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.map((folder) => (folder.id === id ? { ...folder, ...updates } : folder)),
    }))
  }

  const deleteFolder = (id: string) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.filter((folder) => folder.id !== id),
      notes: prev.notes.map((note) => (note.folderId === id ? { ...note, folderId: undefined } : note)),
      selectedFolderId: prev.selectedFolderId === id ? undefined : prev.selectedFolderId,
    }))
  }

  // Label operations
  const createLabel = (name: string, color: string) => {
    const newLabel: Label = {
      id: storage.generateId(),
      name,
      color,
      createdAt: storage.getCurrentTimestamp(),
    }

    setState((prev) => ({
      ...prev,
      labels: [...prev.labels, newLabel],
    }))

    return newLabel
  }

  const deleteLabel = (id: string) => {
    const labelToDelete = state.labels.find((label) => label.id === id)
    if (!labelToDelete) return

    setState((prev) => ({
      ...prev,
      labels: prev.labels.filter((label) => label.id !== id),
      notes: prev.notes.map((note) => ({
        ...note,
        labels: note.labels.filter((labelName) => labelName !== labelToDelete.name),
      })),
    }))
  }

  // Selection operations
  const selectNote = (id: string) => {
    setState((prev) => ({ ...prev, selectedNoteId: id }))
  }

  const selectFolder = (id?: string) => {
    setState((prev) => ({ ...prev, selectedFolderId: id }))
  }

  // Computed values
  const selectedNote = state.notes.find((note) => note.id === state.selectedNoteId)
  const selectedFolder = state.folders.find((folder) => folder.id === state.selectedFolderId)

  const filteredNotes = state.notes.filter((note) => {
    if (state.selectedFolderId) {
      return note.folderId === state.selectedFolderId
    }
    return true
  })

  return {
    // State
    notes: state.notes,
    folders: state.folders,
    labels: state.labels,
    selectedNote,
    selectedFolder,
    filteredNotes,
    isLoading,

    // Actions
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    updateFolder,
    deleteFolder,
    createLabel,
    deleteLabel,
    selectNote,
    selectFolder,
  }
}
