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
         .from("labels")
         .select("*", { count: "exact", head: true })
         .eq("user_id", user.id);

      // Get labels for the user with pagination
      const { data: labels, error } = await supabase
         .from("labels")
         .select("*")
         .eq("user_id", user.id)
         .order("created_at", { ascending: false })
         .range(offset, offset + limit - 1);

      if (error) {
         return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Transform data to match frontend format
      const transformedLabels = (labels || []).map((label) => ({
         id: label.id,
         name: label.name,
         color: label.color,
         createdAt: label.created_at,
         userId: label.user_id,
      }));

      // Calculate pagination metadata
      const totalPages = Math.ceil((totalCount || 0) / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
         data: transformedLabels,
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
      const { name, color } = body;

      if (!name || !color) {
         return NextResponse.json(
            { error: "Name and color are required" },
            { status: 400 }
         );
      }

      // Create label
      const { data: label, error } = await supabase
         .from("labels")
         .insert({
            name,
            color,
            user_id: user.id,
         })
         .select()
         .single();

      if (error) {
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

      return NextResponse.json(transformedLabel, { status: 201 });
   } catch (error) {
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
