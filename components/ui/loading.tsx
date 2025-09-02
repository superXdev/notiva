import { Loader2 } from "lucide-react";

export function Loading() {
   return (
      <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
         </div>
      </div>
   );
}
