import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { FileText, AlertTriangle } from "lucide-react";

export default function ErrorPage() {
   return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
         <div className="w-full max-w-md space-y-6">
            {/* Logo and Title */}
            <div className="text-center space-y-2">
               <div className="flex items-center justify-center gap-2 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold">Notiva</span>
               </div>
               <h1 className="text-2xl font-semibold tracking-tight">
                  Authentication Error
               </h1>
               <p className="text-sm text-muted-foreground">
                  There was an error with your authentication
               </p>
            </div>

            <Card>
               <CardHeader className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                     <AlertTriangle className="h-5 w-5 text-destructive" />
                     Error
                  </CardTitle>
                  <CardDescription>
                     Something went wrong with your authentication
                  </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                     Please try signing in again or contact support if the
                     problem persists.
                  </p>
                  <div className="flex gap-2">
                     <Button asChild className="flex-1">
                        <Link href="/login">Go to Login</Link>
                     </Button>
                     <Button variant="outline" asChild className="flex-1">
                        <Link href="/">Go Home</Link>
                     </Button>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
