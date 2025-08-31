import type { AppState } from "./types"

const STORAGE_KEY = "markdown-notes-app"

export const storage = {
  // Get all data from localStorage
  getAppState(): AppState {
    if (typeof window === "undefined") {
      return { notes: [], folders: [], labels: [] }
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { notes: [], folders: [], labels: [] }
    }

    try {
      return JSON.parse(stored)
    } catch {
      return { notes: [], folders: [], labels: [] }
    }
  },

  // Save all data to localStorage
  saveAppState(state: AppState): void {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  },

  // Generate unique ID
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // Get current timestamp
  getCurrentTimestamp(): string {
    return new Date().toISOString()
  },
}
