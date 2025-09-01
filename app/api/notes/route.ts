import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/lib/types";

type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

export async function GET(request: NextRequest) {
   try {
      const supabase = await createClient();

      // Get current user
      const {
         data: { user },
         error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get pagination parameters from query string
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const offset = (page - 1) * limit;

      // Get total count for pagination metadata
      const { count: totalCount } = await supabase
         .from("notes")
         .select("*", { count: "exact", head: true })
         .eq("user_id", user.id);

      // Get notes for the user with pagination
      const { data: notes, error } = await supabase
         .from("notes")
         .select("*")
         .eq("user_id", user.id)
         .order("updated_at", { ascending: false })
         .range(offset, offset + limit - 1);

      if (error) {
         return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Transform data to match frontend format
      const transformedNotes = ((notes as NoteRow[]) || []).map((note) => ({
         id: note.id,
         title: note.title,
         content: note.content,
         folderId: note.folder_id,
         labels: note.labels,
         createdAt: note.created_at,
         updatedAt: note.updated_at,
         userId: note.user_id,
      }));

      // Calculate pagination metadata
      const totalPages = Math.ceil((totalCount || 0) / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
         data: transformedNotes,
         pagination: {
            page,
            limit,
            totalCount: totalCount || 0,
            totalPages,
            hasNextPage,
            hasPrevPage,
         },
      });
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}

export async function POST(request: NextRequest) {
   try {
      const supabase = await createClient();

      // Get current user
      const {
         data: { user },
         error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await request.json();
      const { title, content = "", folderId } = body;

      if (!title) {
         return NextResponse.json(
            { error: "Title is required" },
            { status: 400 }
         );
      }

      // Create note
      const { data: note, error } = await (supabase
         .from("notes")
         .insert({
            title,
            content,
            folder_id: folderId || null,
            labels: [],
            user_id: user.id,
         })
         .select()
         .single() as any);

      if (error) {
         return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Transform data to match frontend format
      const transformedNote = {
         id: note.id,
         title: note.title,
         content: note.content,
         folderId: note.folder_id,
         labels: note.labels,
         createdAt: note.created_at,
         updatedAt: note.updated_at,
         userId: note.user_id,
      };

      return NextResponse.json(transformedNote, { status: 201 });
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
