import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <div
         data-slot="skeleton"
         className={cn("bg-accent animate-pulse rounded-md", className)}
         {...props}
      />
   );
}

// Note skeleton component
function NoteSkeleton({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <div className={cn("p-2 md:p-3 rounded-lg border", className)} {...props}>
         {/* Title skeleton */}
         <Skeleton className="h-4 w-3/4 mb-2" />
         {/* Date skeleton */}
         <Skeleton className="h-3 w-20" />
      </div>
   );
}

// Folder skeleton component
function FolderSkeleton({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <div className={cn("flex items-center", className)} {...props}>
         <Skeleton className="h-4 w-4 mr-2 flex-shrink-0" />
         <Skeleton className="h-4 w-24 flex-1" />
      </div>
   );
}

// Label skeleton component
function LabelSkeleton({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <Skeleton className={cn("h-6 w-16 rounded-full", className)} {...props} />
   );
}

// Card skeleton component
function CardSkeleton({ className, ...props }: React.ComponentProps<"div">) {
   return (
      <div className={cn("p-4 rounded-lg border", className)} {...props}>
         <Skeleton className="h-5 w-3/4 mb-3" />
         <Skeleton className="h-4 w-full mb-2" />
         <Skeleton className="h-4 w-2/3 mb-3" />
         <Skeleton className="h-3 w-24" />
      </div>
   );
}

export { Skeleton, NoteSkeleton, FolderSkeleton, LabelSkeleton, CardSkeleton };
