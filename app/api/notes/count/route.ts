import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

      // Get folder filter from query string
      const { searchParams } = new URL(request.url);
      const folderId = searchParams.get("folderId");

      console.log(
         `API: Counting notes for user ${user.id}, folderId: ${folderId}`
      );

      // Build query
      let query = supabase
         .from("notes")
         .select("*", { count: "exact", head: true })
         .eq("user_id", user.id);

      // Apply folder filter if specified
      if (folderId) {
         query = query.eq("folder_id", folderId);
         console.log(`API: Filtering by folder_id = ${folderId}`);
      } else {
         // If no folder specified, get all notes (including those without folders)
         query = query.or("folder_id.is.null,folder_id.not.is.null");
         console.log(`API: Getting all notes (with and without folders)`);
      }

      const { count, error } = await query;

      if (error) {
         console.error(`API: Error counting notes:`, error);
         return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`API: Count result: ${count || 0} notes`);
      return NextResponse.json({ count: count || 0 });
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
