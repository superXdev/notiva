"use client";

import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export function AuthMessage() {
   const searchParams = useSearchParams();
   const message = searchParams.get("message");

   if (!message) return null;

   const isError =
      message.toLowerCase().includes("error") ||
      message.toLowerCase().includes("could not") ||
      message.toLowerCase().includes("failed");

   return (
      <Alert className={isError ? "border-destructive" : "border-green-500"}>
         {isError ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
         ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
         )}
         <AlertDescription
            className={isError ? "text-destructive" : "text-green-700"}
         >
            {message}
         </AlertDescription>
      </Alert>
   );
}
