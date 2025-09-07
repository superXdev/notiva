"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export type MobileViewState = 
  | "folder-list"     // Initial state: showing folders/labels list
  | "note-list"       // Showing filtered notes for selected folder/label
  | "note-editor";    // Showing note editor

interface MobileNavigationContextType {
  // State
  isMobile: boolean;
  currentView: MobileViewState;
  showingSidebar: boolean;
  selectedFolderForMobile?: string;
  selectedLabelForMobile?: string;
  
  // Actions
  navigateToFolderList: () => void;
  navigateToNoteList: (folderId?: string, labelId?: string) => void;
  navigateToNoteEditor: () => void;
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
  goBack: () => void;
}

const MobileNavigationContext = createContext<MobileNavigationContextType | undefined>(undefined);

export function MobileNavigationProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<MobileViewState>("folder-list");
  const [showingSidebar, setShowingSidebar] = useState(false);
  const [selectedFolderForMobile, setSelectedFolderForMobile] = useState<string>();
  const [selectedLabelForMobile, setSelectedLabelForMobile] = useState<string>();

  // Reset to folder-list view when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setCurrentView("folder-list");
      setShowingSidebar(false);
    }
  }, [isMobile]);

  const navigateToFolderList = useCallback(() => {
    setCurrentView("folder-list");
    setSelectedFolderForMobile(undefined);
    setSelectedLabelForMobile(undefined);
  }, []);

  const navigateToNoteList = useCallback((folderId?: string, labelId?: string) => {
    setCurrentView("note-list");
    setSelectedFolderForMobile(folderId);
    setSelectedLabelForMobile(labelId);
  }, []);

  const navigateToNoteEditor = useCallback(() => {
    setCurrentView("note-editor");
  }, []);

  const toggleSidebar = useCallback(() => {
    setShowingSidebar(prev => !prev);
  }, []);

  const setSidebarVisible = useCallback((visible: boolean) => {
    setShowingSidebar(visible);
  }, []);

  const goBack = useCallback(() => {
    if (currentView === "note-editor") {
      setCurrentView("note-list");
    } else if (currentView === "note-list") {
      navigateToFolderList();
    }
  }, [currentView, navigateToFolderList]);

  const value: MobileNavigationContextType = {
    // State
    isMobile,
    currentView,
    showingSidebar,
    selectedFolderForMobile,
    selectedLabelForMobile,
    
    // Actions
    navigateToFolderList,
    navigateToNoteList,
    navigateToNoteEditor,
    toggleSidebar,
    setSidebarVisible,
    goBack,
  };

  return (
    <MobileNavigationContext.Provider value={value}>
      {children}
    </MobileNavigationContext.Provider>
  );
}

export function useMobileNavigation() {
  const context = useContext(MobileNavigationContext);
  if (context === undefined) {
    throw new Error("useMobileNavigation must be used within a MobileNavigationProvider");
  }
  return context;
}