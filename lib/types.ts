export interface Note {
  id: string
  title: string
  content: string
  folderId?: string
  labels: string[]
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  createdAt: string
}

export interface Label {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface AppState {
  notes: Note[]
  folders: Folder[]
  labels: Label[]
  selectedNoteId?: string
  selectedFolderId?: string
}
