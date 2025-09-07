import { Sidebar } from "@/components/sidebar";
import { NoteEditor } from "@/components/note-editor";
import { NavigationHeader } from "@/components/navigation-header";
import { MobileMainContent } from "@/components/mobile-main-content";
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
         <NavigationHeader user={user} />
         <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:block w-80 flex-shrink-0">
               <Sidebar />
            </div>
            {/* Desktop: Always show NoteEditor */}
            <div className="hidden md:block flex-1 min-h-0">
               <NoteEditor key="note-editor" />
            </div>
            {/* Mobile: Show different content based on navigation state */}
            <div className="md:hidden flex-1">
               <MobileMainContent />
            </div>
         </div>
      </div>
   );
}
