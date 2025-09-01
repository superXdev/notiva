import { NavigationHeader } from "@/components/navigation-header";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const supabase = await createClient();
   const {
      data: { user },
      error,
   } = await supabase.auth.getUser();

   if (error || !user) {
      redirect("/login");
   }

   return (
      <div className="min-h-screen bg-background">
         <NavigationHeader user={user} />
         <main className="pt-14">{children}</main>
      </div>
   );
}
