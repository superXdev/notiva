"use client";

import { useState, useEffect } from "react";
import { Hash, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeadingItem {
   id: string;
   text: string;
   level: number;
}

interface PublishedNavigationProps {
   content: string;
}

export function PublishedNavigation({ content }: PublishedNavigationProps) {
   const [headings, setHeadings] = useState<HeadingItem[]>([]);
   const [activeHeading, setActiveHeading] = useState<string>("");

   useEffect(() => {
      const lines = content.split("\n");
      const headingItems: HeadingItem[] = [];

      lines.forEach((line) => {
         const match = line.match(/^(#{1,6})\s+(.+)$/);
         if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = `heading-${text
               .toLowerCase()
               .replace(/[^a-z0-9]+/g, "-")}`;

            headingItems.push({
               id,
               text,
               level,
            });
         }
      });

      setHeadings(headingItems);
   }, [content]);

   useEffect(() => {
      const handleScroll = () => {
         const headingElements = headings
            .map((h) => document.getElementById(h.id))
            .filter(Boolean);

         if (headingElements.length === 0) return;

         const scrollPosition = window.scrollY + 100; // Offset for header

         let currentActive = "";
         for (let i = headingElements.length - 1; i >= 0; i--) {
            const element = headingElements[i] as HTMLElement;
            if (element.offsetTop <= scrollPosition) {
               currentActive = element.id;
               break;
            }
         }

         setActiveHeading(currentActive);
      };

      if (headings.length > 0) {
         window.addEventListener("scroll", handleScroll);
         handleScroll(); // Initial check
      }

      return () => window.removeEventListener("scroll", handleScroll);
   }, [headings]);

   const scrollToHeading = (headingId: string) => {
      const element = document.getElementById(headingId);
      if (element) {
         const headerOffset = 100;
         const elementPosition = element.getBoundingClientRect().top;
         const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

         window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
         });
      }
   };

   if (headings.length === 0) {
      return null;
   }

   return (
      <>
         {/* Desktop Sidebar Navigation */}
         <nav className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
               <div className="text-sm font-semibold text-foreground mb-3 px-4">
                  On this page
               </div>
               <ul className="space-y-1">
                  {headings.map((heading, index) => (
                     <li key={`${heading.id}-${index}`}>
                        <button
                           onClick={() => scrollToHeading(heading.id)}
                           className={cn(
                              "w-full text-left px-4 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                              "flex items-center gap-2",
                              activeHeading === heading.id &&
                                 "bg-accent text-accent-foreground font-medium",
                              heading.level > 2 && "text-muted-foreground"
                           )}
                           style={{
                              paddingLeft: `${
                                 Math.min(heading.level, 3) * 12 + 16
                              }px`,
                           }}
                        >
                           <Hash className="h-3 w-3 flex-shrink-0" />
                           <span className="truncate">{heading.text}</span>
                        </button>
                     </li>
                  ))}
               </ul>
            </div>
         </nav>

         {/* Mobile Dropdown Navigation */}
         <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button
                     size="sm"
                     className="rounded-full w-12 h-12 shadow-lg"
                  >
                     <List className="h-4 w-4" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent
                  align="end"
                  className="w-64 max-h-80 overflow-y-auto"
               >
                  <div className="text-sm font-semibold text-foreground mb-2 px-2">
                     On this page
                  </div>
                  {headings.map((heading, index) => (
                     <DropdownMenuItem
                        key={`${heading.id}-${index}`}
                        onClick={() => scrollToHeading(heading.id)}
                        className="flex items-start py-2 cursor-pointer"
                     >
                        <div className="flex items-center w-full">
                           <Hash className="h-3 w-3 mr-2 text-muted-foreground flex-shrink-0" />
                           <div
                              className="text-sm truncate"
                              style={{
                                 paddingLeft: `${
                                    Math.min(heading.level, 3) * 8
                                 }px`,
                                 opacity: heading.level > 2 ? 0.8 : 1,
                              }}
                           >
                              {heading.text}
                           </div>
                        </div>
                     </DropdownMenuItem>
                  ))}
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </>
   );
}
