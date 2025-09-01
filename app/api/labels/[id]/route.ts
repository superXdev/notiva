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
      const { name, color } = body;

      if (!name || !color) {
         return NextResponse.json(
            { error: "Name and color are required" },
            { status: 400 }
         );
      }

      // Update label
      const { data: label, error } = await supabase
         .from("labels")
         .update({
            name,
            color,
         })
         .eq("id", id)
         .eq("user_id", user.id)
         .select()
         .single();

      if (error) {
         if (error.code === "PGRST116") {
            return NextResponse.json(
               { error: "Label not found" },
               { status: 404 }
            );
         }
         return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Transform data to match frontend format
      const transformedLabel = {
         id: label.id,
         name: label.name,
         color: label.color,
         createdAt: label.created_at,
         userId: label.user_id,
      };

      return NextResponse.json(transformedLabel);
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

      // Get the label to find its name
      const { data: label, error: labelError } = await supabase
         .from("labels")
         .select("name")
         .eq("id", id)
         .eq("user_id", user.id)
         .single();

      if (labelError) {
         return NextResponse.json(
            { error: "Label not found" },
            { status: 404 }
         );
      }

      // Remove this label from all notes
      // First, get all notes that contain this label
      const { data: notesWithLabel, error: fetchError } = await supabase
         .from("notes")
         .select("id, labels")
         .eq("user_id", user.id)
         .contains("labels", [label.name]);

      if (fetchError) {
         return NextResponse.json(
            { error: fetchError.message },
            { status: 500 }
         );
      }

      // Update each note to remove the label
      for (const note of notesWithLabel || []) {
         const updatedLabels = note.labels.filter(
            (l: string) => l !== label.name
         );

         const { error: updateError } = await supabase
            .from("notes")
            .update({ labels: updatedLabels })
            .eq("id", note.id)
            .eq("user_id", user.id);

         if (updateError) {
            return NextResponse.json(
               { error: updateError.message },
               { status: 500 }
            );
         }
      }

      // Delete label
      const { error } = await supabase
         .from("labels")
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
