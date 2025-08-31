import { Sidebar } from "@/components/sidebar";
import { NoteEditor } from "@/components/note-editor";
import { NavigationHeader } from "@/components/navigation-header";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
   const supabase = await createClient();
   const {
      data: { user },
      error,
   } = await supabase.auth.getUser();

   if (error || !user) {
      redirect("/login");
   }

   return (
      <div className="h-screen flex flex-col bg-background">
         <NavigationHeader />
         <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:block">
               <Sidebar />
            </div>
            <NoteEditor />
         </div>
      </div>
   );
}
