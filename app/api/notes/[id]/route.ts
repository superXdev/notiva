import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const supabase = await createClient();

      // Get current user
      const {
         data: { user },
         error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get specific note
      const { data: note, error } = await supabase
         .from("notes")
         .select("*")
         .eq("id", id)
         .eq("user_id", user.id)
         .single();

      if (error) {
         if (error.code === "PGRST116") {
            return NextResponse.json(
               { error: "Note not found" },
               { status: 404 }
            );
         }
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

      return NextResponse.json(transformedNote);
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}

export async function PUT(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
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
      const { title, content, folderId, labels } = body;

      // Build update object with only provided fields
      const updateData: any = {
         updated_at: new Date().toISOString(),
      };

      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (folderId !== undefined) updateData.folder_id = folderId || null;
      if (labels !== undefined) updateData.labels = labels;

      // Update note
      const { data: note, error } = await supabase
         .from("notes")
         .update(updateData)
         .eq("id", id)
         .eq("user_id", user.id)
         .select()
         .single();

      if (error) {
         if (error.code === "PGRST116") {
            return NextResponse.json(
               { error: "Note not found" },
               { status: 404 }
            );
         }
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

      return NextResponse.json(transformedNote);
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}

export async function DELETE(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const { id } = await params;
      const supabase = await createClient();

      // Get current user
      const {
         data: { user },
         error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Delete note
      const { error } = await supabase
         .from("notes")
         .delete()
         .eq("id", id)
         .eq("user_id", user.id);

      if (error) {
         return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
