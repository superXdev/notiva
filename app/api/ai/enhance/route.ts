import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";

const openai = new OpenAI({
   apiKey: process.env.LUNOS_API_KEY,
   baseURL: "https://api.lunos.tech/v1",
   defaultHeaders: {
      "X-App-ID": "Notiva",
   },
});

export async function POST(request: NextRequest) {
   try {
      const { content, enhancementType } = await request.json();

      if (!content) {
         return NextResponse.json(
            { error: "Content is required" },
            { status: 400 }
         );
      }

      if (!process.env.LUNOS_API_KEY) {
         return NextResponse.json(
            { error: "Lunos API key not configured" },
            { status: 500 }
         );
      }

      // Get authenticated user
      const supabase = await createClient();
      const {
         data: { user },
         error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
         return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
         );
      }

      let systemPrompt = "";
      let userPrompt = "";

      switch (enhancementType) {
         case "improve":
            systemPrompt = `You are a helpful writing assistant. Improve the given text by:
- Fixing grammar and spelling errors
- Improving clarity and readability
- Enhancing flow and structure
- Maintaining the original tone and style
- Preserving all markdown formatting

Return only the improved text without any explanations.`;
            userPrompt = `Please improve this text:\n\n${content}`;
            break;

         case "expand":
            systemPrompt = `You are a helpful writing assistant. Expand the given text by:
- Adding more detail and context
- Providing examples where appropriate
- Elaborating on key points
- Maintaining the original structure and tone
- Preserving all markdown formatting

Return only the expanded text without any explanations.`;
            userPrompt = `Please expand this text with more detail:\n\n${content}`;
            break;

         case "summarize":
            systemPrompt = `You are a helpful writing assistant. Summarize the given text by:
- Extracting key points and main ideas
- Maintaining the most important information
- Creating a concise but comprehensive summary
- Preserving markdown formatting where relevant

Return only the summary without any explanations.`;
            userPrompt = `Please summarize this text:\n\n${content}`;
            break;

         case "format":
            systemPrompt = `You are a helpful writing assistant. Format the given text by:
- Adding proper markdown structure
- Organizing content with headers
- Creating lists where appropriate
- Adding emphasis and formatting
- Improving overall readability

Return only the formatted text without any explanations.`;
            userPrompt = `Please format this text with proper markdown:\n\n${content}`;
            break;

         default:
            return NextResponse.json(
               { error: "Invalid enhancement type" },
               { status: 400 }
            );
      }

      const completion = await openai.chat.completions.create({
         model: "openai/gpt-4.1-mini",
         messages: [
            {
               role: "system",
               content: systemPrompt,
            },
            {
               role: "user",
               content: userPrompt,
            },
         ],
         temperature: 0.3,
         max_tokens: 10000,
      });

      const enhancedContent = completion.choices[0]?.message?.content;

      if (!enhancedContent) {
         return NextResponse.json(
            { error: "Failed to generate enhanced content" },
            { status: 500 }
         );
      }

      // Track AI enhancement usage
      try {
         const { error: usageError } = await supabase.rpc(
            "increment_ai_enhancement_usage",
            {
               user_uuid: user.id,
            }
         );

         if (usageError) {
            console.error("Failed to track AI enhancement usage:", usageError);
            // Don't fail the request if usage tracking fails
         }
      } catch (trackingError) {
         console.error("Error tracking AI enhancement usage:", trackingError);
         // Don't fail the request if usage tracking fails
      }

      return NextResponse.json({ enhancedContent });
   } catch (error) {
      console.error("AI enhancement error:", error);
      return NextResponse.json(
         { error: "Failed to enhance content" },
         { status: 500 }
      );
   }
}
