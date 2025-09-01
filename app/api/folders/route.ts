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

      // Get pagination parameters from query string
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "5");
      const offset = (page - 1) * limit;

      // Get total count for pagination metadata
      const { count: totalCount } = await supabase
         .from("folders")
         .select("*", { count: "exact", head: true })
         .eq("user_id", user.id);

      // Get folders for the user with pagination
      const { data: folders, error } = await supabase
         .from("folders")
         .select("*")
         .eq("user_id", user.id)
         .order("created_at", { ascending: false })
         .range(offset, offset + limit - 1);

      if (error) {
         return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Transform data to match frontend format
      const transformedFolders = (folders || []).map((folder) => ({
         id: folder.id,
         name: folder.name,
         parentId: folder.parent_id,
         createdAt: folder.created_at,
         userId: folder.user_id,
      }));

      // Calculate pagination metadata
      const totalPages = Math.ceil((totalCount || 0) / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
         data: transformedFolders,
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
      const { name, parentId } = body;

      if (!name) {
         return NextResponse.json(
            { error: "Name is required" },
            { status: 400 }
         );
      }

      // Create folder
      const { data: folder, error } = await supabase
         .from("folders")
         .insert({
            name,
            parent_id: parentId || null,
            user_id: user.id,
         })
         .select()
         .single();

      if (error) {
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

      return NextResponse.json(transformedFolder, { status: 201 });
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
