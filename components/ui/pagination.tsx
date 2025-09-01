import React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
   currentPage: number;
   totalPages: number;
   hasNextPage: boolean;
   hasPrevPage: boolean;
   onNextPage: () => void;
   onPrevPage: () => void;
   onPageChange?: (page: number) => void;
   className?: string;
}

export function Pagination({
   currentPage,
   totalPages,
   hasNextPage,
   hasPrevPage,
   onNextPage,
   onPrevPage,
   onPageChange,
   className = "",
}: PaginationProps) {
   const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
         // Show all pages if total is small
         for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
         }
      } else {
         // Show pages around current page
         let start = Math.max(1, currentPage - 2);
         let end = Math.min(totalPages, currentPage + 2);

         if (end - start < 4) {
            if (start === 1) {
               end = Math.min(totalPages, start + 4);
            } else {
               start = Math.max(1, end - 4);
            }
         }

         for (let i = start; i <= end; i++) {
            pages.push(i);
         }
      }

      return pages;
   };

   if (totalPages <= 1) {
      return null;
   }

   return (
      <div className={`flex items-center justify-between ${className}`}>
         <div className="flex items-center space-x-2">
            <Button
               variant="outline"
               size="sm"
               onClick={onPrevPage}
               disabled={!hasPrevPage}
            >
               <ChevronLeft className="h-4 w-4" />
               Previous
            </Button>

            <div className="flex items-center space-x-1">
               {renderPageNumbers().map((page) => (
                  <Button
                     key={page}
                     variant={page === currentPage ? "default" : "outline"}
                     size="sm"
                     onClick={() => onPageChange?.(page)}
                     className="w-8 h-8 p-0"
                  >
                     {page}
                  </Button>
               ))}
            </div>

            <Button
               variant="outline"
               size="sm"
               onClick={onNextPage}
               disabled={!hasNextPage}
            >
               Next
               <ChevronRight className="h-4 w-4" />
            </Button>
         </div>

         <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
         </div>
      </div>
   );
}
