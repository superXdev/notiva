import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/lib/types";

type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const supabase = await createClient();
      const noteId = params.id;

      // Use the database function to get the published note
      // This is more secure as it uses SECURITY DEFINER and only returns published notes
      const { data: note, error } = await supabase.rpc("get_public_note", {
         note_uuid: noteId,
      });

      if (error || !note || note.length === 0) {
         return NextResponse.json(
            { error: "Note not found or not published" },
            { status: 404 }
         );
      }

      // The function returns a table, so we get the first (and only) row
      const noteData = Array.isArray(note) ? note[0] : note;

      // Transform data to match frontend format
      const transformedNote = {
         id: noteData.id,
         title: noteData.title,
         content: noteData.content,
         folderId: noteData.folder_id,
         labels: noteData.labels,
         published: noteData.published,
         publishedAt: noteData.published_at,
         createdAt: noteData.created_at,
         updatedAt: noteData.updated_at,
         userId: noteData.user_id,
      };

      return NextResponse.json(transformedNote);
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
