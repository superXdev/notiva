export interface Note {
   id: string;
   title: string;
   content: string;
   folderId?: string;
   labels: string[];
   createdAt: string;
   updatedAt: string;
   userId: string;
}

export interface Folder {
   id: string;
   name: string;
   parentId?: string;
   createdAt: string;
   userId: string;
}

export interface Label {
   id: string;
   name: string;
   color: string;
   createdAt: string;
   userId: string;
}

export interface AppState {
   notes: Note[];
   folders: Folder[];
   labels: Label[];
   selectedNoteId?: string;
   selectedFolderId?: string;
   selectedLabelId?: string;
}

// Supabase Database Types
export interface Database {
   public: {
      Tables: {
         notes: {
            Row: {
               id: string;
               title: string;
               content: string;
               folder_id: string | null;
               labels: string[];
               created_at: string;
               updated_at: string;
               user_id: string;
            };
            Insert: {
               id?: string;
               title: string;
               content?: string;
               folder_id?: string | null;
               labels?: string[];
               created_at?: string;
               updated_at?: string;
               user_id: string;
            };
            Update: {
               id?: string;
               title?: string;
               content?: string;
               folder_id?: string | null;
               labels?: string[];
               created_at?: string;
               updated_at?: string;
               user_id?: string;
            };
         };
         folders: {
            Row: {
               id: string;
               name: string;
               parent_id: string | null;
               created_at: string;
               user_id: string;
            };
            Insert: {
               id?: string;
               name: string;
               parent_id?: string | null;
               created_at?: string;
               user_id: string;
            };
            Update: {
               id?: string;
               name?: string;
               parent_id?: string | null;
               created_at?: string;
               user_id?: string;
            };
         };
         labels: {
            Row: {
               id: string;
               name: string;
               color: string;
               created_at: string;
               user_id: string;
            };
            Insert: {
               id?: string;
               name: string;
               color: string;
               created_at?: string;
               user_id: string;
            };
            Update: {
               id?: string;
               name?: string;
               color?: string;
               created_at?: string;
               user_id?: string;
            };
         };
      };
   };
}
