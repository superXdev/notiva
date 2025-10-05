"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

interface AIEnhancementButtonProps {
   content: string;
   onEnhance: (enhancedContent: string) => void;
   disabled?: boolean;
}

const enhancementOptions = [
   {
      type: "improve",
      label: "Improve Writing",
      description: "Fix grammar, improve clarity and readability",
   },
   {
      type: "expand",
      label: "Expand Content",
      description: "Add more detail and context",
   },
   {
      type: "summarize",
      label: "Summarize",
      description: "Create a concise summary",
   },
   {
      type: "format",
      label: "Format Markdown",
      description: "Add proper markdown structure",
   },
];

export function AIEnhancementButton({
   content,
   onEnhance,
   disabled = false,
}: AIEnhancementButtonProps) {
   const [isEnhancing, setIsEnhancing] = useState(false);
   const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean | null>(
      null
   );
   const [isCheckingConfig, setIsCheckingConfig] = useState(true);
   const { toast } = useToast();

   // Check if Lunos API key is configured on component mount
   useEffect(() => {
      const checkApiKeyConfig = async () => {
         try {
            const response = await fetch("/api/ai/config");
            const data = await response.json();
            setIsApiKeyConfigured(data.configured);
         } catch (error) {
            console.error("Failed to check API key configuration:", error);
            setIsApiKeyConfigured(false);
         } finally {
            setIsCheckingConfig(false);
         }
      };

      checkApiKeyConfig();
   }, []);

   const handleEnhance = async (enhancementType: string) => {
      if (!content.trim()) {
         toast({
            title: "No content to enhance",
            description: "Please add some content to your note first.",
            variant: "destructive",
         });
         return;
      }

      if (!isApiKeyConfigured) {
         toast({
            title: "AI Enhancement Unavailable",
            description:
               "Lunos API key is not configured. Please set the LUNOS_API_KEY environment variable.",
            variant: "destructive",
         });
         return;
      }

      setIsEnhancing(true);
      try {
         const response = await fetch("/api/ai/enhance", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               content,
               enhancementType,
            }),
         });

         if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to enhance content");
         }

         const { enhancedContent } = await response.json();
         onEnhance(enhancedContent);

         const option = enhancementOptions.find(
            (opt) => opt.type === enhancementType
         );
         toast({
            title: "Content enhanced!",
            description: `Your note has been ${option?.label.toLowerCase()}.`,
         });
      } catch (error) {
         console.error("Enhancement error:", error);
         toast({
            title: "Enhancement failed",
            description:
               error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
         });
      } finally {
         setIsEnhancing(false);
      }
   };

   // Show loading state while checking configuration
   if (isCheckingConfig) {
      return (
         <Button
            variant="default"
            size="sm"
            disabled
            className="gap-2 bg-gray-400 text-white border-gray-400"
         >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
         </Button>
      );
   }

   // Show disabled button with warning if API key is not configured
   if (!isApiKeyConfigured) {
      return (
         <Button
            variant="default"
            size="sm"
            disabled
            className="gap-2 bg-gray-400 text-white border-gray-400"
            title="Lunos API key not configured. Please set LUNOS_API_KEY environment variable."
         >
            <AlertCircle className="h-4 w-4" />
            Enhance
         </Button>
      );
   }

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button
               variant="default"
               size="sm"
               disabled={disabled || isEnhancing}
               className="gap-2 bg-blue-700 hover:bg-blue-700 text-white border-blue-700 hover:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-700 dark:text-white dark:border-blue-700 dark:hover:border-blue-700"
            >
               {isEnhancing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                  <Sparkles className="h-4 w-4" />
               )}
               {isEnhancing ? "Enhancing..." : "Enhance"}
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="w-56">
            {enhancementOptions.map((option) => (
               <DropdownMenuItem
                  key={option.type}
                  onClick={() => handleEnhance(option.type)}
                  disabled={isEnhancing}
                  className="flex flex-col items-start gap-1 p-3"
               >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                     {option.description}
                  </div>
               </DropdownMenuItem>
            ))}
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
