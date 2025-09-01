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

      // Validate folderId format if provided
      if (folderId && folderId.trim() !== "") {
         // Basic UUID validation
         const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
         if (!uuidRegex.test(folderId)) {
            return NextResponse.json(
               {
                  error: "Invalid folder ID format",
                  details:
                     "The provided folder ID is not in the correct format",
               },
               { status: 400 }
            );
         }
      }

      // Build query
      let query = supabase
         .from("notes")
         .select("*", { count: "exact", head: true })
         .eq("user_id", user.id);

      // Apply folder filter if specified
      if (folderId && folderId.trim() !== "") {
         query = query.eq("folder_id", folderId);
      } else {
         // If no folder specified, get all notes (including those without folders)
         query = query.or("folder_id.is.null,folder_id.not.is.null");
      }

      const { count, error } = await query;

      if (error) {
         return NextResponse.json(
            {
               error: error.message,
               details: error.details || "Unknown database error",
            },
            { status: 500 }
         );
      }

      return NextResponse.json({ count: count || 0 });
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
