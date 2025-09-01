import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
   const { searchParams } = new URL(request.url);
   const title = searchParams.get("title") || "Untitled Note";
   const description =
      searchParams.get("description") || "A published note from Notiva";

   return new ImageResponse(
      (
         <div
            style={{
               height: "100%",
               width: "100%",
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               justifyContent: "center",
               backgroundColor: "#0f0f23",
               backgroundImage:
                  "radial-gradient(circle at 25px 25px, #1a1a2e 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1a2e 2%, transparent 0%)",
               backgroundSize: "100px 100px",
            }}
         >
            {/* Logo/Brand */}
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "40px",
               }}
            >
               <div
                  style={{
                     fontSize: "32px",
                     fontWeight: "bold",
                     color: "#6366f1",
                     marginRight: "12px",
                  }}
               >
                  ✨
               </div>
               <div
                  style={{
                     fontSize: "32px",
                     fontWeight: "bold",
                     color: "#ffffff",
                  }}
               >
                  Notiva
               </div>
            </div>

            {/* Title */}
            <div
               style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  textAlign: "center",
                  maxWidth: "900px",
                  marginBottom: "24px",
                  lineHeight: "1.2",
               }}
            >
               {title}
            </div>

            {/* Description */}
            <div
               style={{
                  fontSize: "24px",
                  color: "#a1a1aa",
                  textAlign: "center",
                  maxWidth: "800px",
                  lineHeight: "1.4",
               }}
            >
               {description}
            </div>

            {/* Footer */}
            <div
               style={{
                  position: "absolute",
                  bottom: "40px",
                  fontSize: "18px",
                  color: "#71717a",
                  display: "flex",
                  alignItems: "center",
               }}
            >
               <span>Published with Notiva</span>
            </div>
         </div>
      ),
      {
         width: 1200,
         height: 630,
      }
   );
}
