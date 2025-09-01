"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

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
   const { toast } = useToast();

   const handleEnhance = async (enhancementType: string) => {
      if (!content.trim()) {
         toast({
            title: "No content to enhance",
            description: "Please add some content to your note first.",
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
               {isEnhancing ? "Enhancing..." : "AI Enhance"}
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
