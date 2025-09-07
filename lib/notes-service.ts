import { createClient } from "@/utils/supabase/client";
import type { Note, Folder, Label } from "@/lib/types";

const supabase = createClient();

// Transform database row to frontend format
const transformNote = (note: any): Note => ({
   id: note.id,
   title: note.title,
   content: note.content,
   folderId: note.folder_id,
   labels: note.labels || [],
   published: note.published,
   publishedAt: note.published_at,
   createdAt: note.created_at,
   updatedAt: note.updated_at,
   userId: note.user_id,
});

const transformFolder = (folder: any): Folder => ({
   id: folder.id,
   name: folder.name,
   parentId: folder.parent_id,
   createdAt: folder.created_at,
   userId: folder.user_id,
});

const transformLabel = (label: any): Label => ({
   id: label.id,
   name: label.name,
   color: label.color,
   createdAt: label.created_at,
   userId: label.user_id,
});

// Transform frontend format to database format
const transformNoteForDB = (note: Partial<Note>) => {
   const dbNote: any = {};
   if (note.title !== undefined) dbNote.title = note.title;
   if (note.content !== undefined) dbNote.content = note.content;
   if (note.folderId !== undefined) dbNote.folder_id = note.folderId;
   if (note.labels !== undefined) dbNote.labels = note.labels;
   if (note.published !== undefined) {
      dbNote.published = note.published;
      if (note.published) {
         dbNote.published_at = new Date().toISOString();
      } else {
         dbNote.published_at = null;
      }
   }
   return dbNote;
};

export class NotesService {
   // Note operations
   static async getNotes(
      page = 1,
      limit = 10
   ): Promise<{ data: Note[]; count: number }> {
      const offset = (page - 1) * limit;

      const {
         data: notes,
         error,
         count,
      } = await supabase
         .from("notes")
         .select("*", { count: "exact" })
         .order("updated_at", { ascending: false })
         .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
         data: (notes || []).map(transformNote),
         count: count || 0,
      };
   }

   static async getNote(id: string): Promise<Note> {
      const { data: note, error } = await supabase
         .from("notes")
         .select("*")
         .eq("id", id)
         .single();

      if (error) throw error;
      return transformNote(note);
   }

   // Get all note titles for search purposes (lightweight query)
   static async getAllNoteTitles(): Promise<
      Array<{
         id: string;
         title: string;
         folderId?: string;
         labels: string[];
         updatedAt: string;
      }>
   > {
      const { data: notes, error } = await supabase
         .from("notes")
         .select("id, title, folder_id, labels, updated_at")
         .order("updated_at", { ascending: false });

      if (error) throw error;

      return (notes || []).map((note: any) => ({
         id: note.id,
         title: note.title || "",
         folderId: note.folder_id || undefined,
         labels: note.labels || [],
         updatedAt: note.updated_at,
      }));
   }

   static async createNote(
      title: string,
      content = "",
      folderId?: string
   ): Promise<Note> {
      // Check if user is authenticated
      const {
         data: { user },
         error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
         throw new Error("User not authenticated");
      }

      const { data: note, error } = await supabase
         .from("notes")
         .insert({
            title,
            content,
            folder_id: folderId || null,
            labels: [],
            published: false,
            user_id: user.id,
         })
         .select()
         .single();

      if (error) throw error;
      return transformNote(note);
   }

   static async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
      const updateData = {
         ...transformNoteForDB(updates),
         updated_at: new Date().toISOString(),
      };

      const { data: note, error } = await supabase
         .from("notes")
         .update(updateData)
         .eq("id", id)
         .select()
         .single();

      if (error) throw error;
      return transformNote(note);
   }

   static async deleteNote(id: string): Promise<void> {
      const { error } = await supabase.from("notes").delete().eq("id", id);

      if (error) throw error;
   }

   static async getNoteCount(folderId?: string): Promise<number> {
      // Check if user is authenticated
      const {
         data: { user },
         error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
         throw new Error("User not authenticated");
      }

      let query = supabase
         .from("notes")
         .select("*", { count: "exact", head: true })
         .eq("user_id", user.id);

      if (folderId) {
         query = query.eq("folder_id", folderId);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
   }

   // Folder operations
   static async getFolders(): Promise<Folder[]> {
      const { data: folders, error } = await supabase
         .from("folders")
         .select("*")
         .order("name");

      if (error) throw error;
      return (folders || []).map(transformFolder);
   }

   static async createFolder(name: string, parentId?: string): Promise<Folder> {
      // Check if user is authenticated
      const {
         data: { user },
         error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
         throw new Error("User not authenticated");
      }

      const { data: folder, error } = await supabase
         .from("folders")
         .insert({
            name,
            parent_id: parentId || null,
            user_id: user.id, // Add the user_id field
         })
         .select()
         .single();

      if (error) throw error;
      return transformFolder(folder);
   }

   static async updateFolder(
      id: string,
      updates: Partial<Folder>
   ): Promise<Folder> {
      const { data: folder, error } = await supabase
         .from("folders")
         .update(updates)
         .eq("id", id)
         .select()
         .single();

      if (error) throw error;
      return transformFolder(folder);
   }

   static async deleteFolder(id: string): Promise<void> {
      const { error } = await supabase.from("folders").delete().eq("id", id);

      if (error) throw error;
   }

   // Label operations
   static async getLabels(): Promise<Label[]> {
      const { data: labels, error } = await supabase
         .from("labels")
         .select("*")
         .order("name");

      if (error) throw error;
      return (labels || []).map(transformLabel);
   }

   static async createLabel(name: string, color: string): Promise<Label> {
      // Check if user is authenticated
      const {
         data: { user },
         error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
         throw new Error("User not authenticated");
      }

      const { data: label, error } = await supabase
         .from("labels")
         .insert({
            name,
            color,
            user_id: user.id, // Add the user_id field
         })
         .select()
         .single();

      if (error) throw error;
      return transformLabel(label);
   }

   static async updateLabel(
      id: string,
      updates: Partial<Label>
   ): Promise<Label> {
      const { data: label, error } = await supabase
         .from("labels")
         .update(updates)
         .eq("id", id)
         .select()
         .single();

      if (error) throw error;
      return transformLabel(label);
   }

   static async deleteLabel(id: string): Promise<void> {
      const { error } = await supabase.from("labels").delete().eq("id", id);

      if (error) throw error;
   }

   // Batch operations for better performance
   static async getNoteCounts(
      folderIds: string[]
   ): Promise<Record<string, number>> {
      const counts: Record<string, number> = {};

      // Check if user is authenticated
      const {
         data: { user },
         error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
         throw new Error("User not authenticated");
      }

      // Get all notes for the current user and count by folder
      const { data: notes, error } = await supabase
         .from("notes")
         .select("folder_id")
         .eq("user_id", user.id);

      if (error) throw error;

      // Count notes per folder
      folderIds.forEach((folderId) => {
         counts[folderId] = (notes || []).filter(
            (note) => note.folder_id === folderId
         ).length;
      });

      return counts;
   }

   static async getLabelCounts(
      labelNames: string[]
   ): Promise<Record<string, number>> {
      const counts: Record<string, number> = {};

      // Check if user is authenticated
      const {
         data: { user },
         error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
         throw new Error("User not authenticated");
      }

      // Get all notes for the current user and count by label
      const { data: notes, error } = await supabase
         .from("notes")
         .select("labels")
         .eq("user_id", user.id);

      if (error) throw error;

      // Count notes per label
      labelNames.forEach((labelName) => {
         counts[labelName] = (notes || []).filter(
            (note) => note.labels && note.labels.includes(labelName)
         ).length;
      });

      return counts;
   }
}
