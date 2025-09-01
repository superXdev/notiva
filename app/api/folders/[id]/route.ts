import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
      const { name, parentId } = body;

      if (!name) {
         return NextResponse.json(
            { error: "Name is required" },
            { status: 400 }
         );
      }

      // Update folder
      const { data: folder, error } = await supabase
         .from("folders")
         .update({
            name,
            parent_id: parentId || null,
         })
         .eq("id", id)
         .eq("user_id", user.id)
         .select()
         .single();

      if (error) {
         if (error.code === "PGRST116") {
            return NextResponse.json(
               { error: "Folder not found" },
               { status: 404 }
            );
         }
         return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Transform data to match frontend format
      const transformedFolder = {
         id: folder.id,
         name: folder.name,
         parentId: folder.parent_id,
         createdAt: folder.created_at,
         userId: folder.user_id,
      };

      return NextResponse.json(transformedFolder);
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

      // First, update all notes in this folder to remove folder_id
      const { error: updateError } = await supabase
         .from("notes")
         .update({ folder_id: null })
         .eq("folder_id", id)
         .eq("user_id", user.id);

      if (updateError) {
         return NextResponse.json(
            { error: updateError.message },
            { status: 500 }
         );
      }

      // Delete folder
      const { error } = await supabase
         .from("folders")
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
