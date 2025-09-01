import React from "react";
import { useNotes } from "@/contexts/notes-context";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardSkeleton } from "@/components/ui/skeleton";

export function PaginationExample() {
   const {
      notes,
      folders,
      labels,
      pagination,
      loadNextPage,
      loadPrevPage,
      loadDataByType,
      isLoading,
      error,
   } = useNotes();

   if (isLoading) {
      return (
         <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Pagination Example</h1>
            
            <Tabs defaultValue="notes" className="w-full">
               <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="notes" disabled>
                     Notes (0)
                  </TabsTrigger>
                  <TabsTrigger value="folders" disabled>
                     Folders (0)
                  </TabsTrigger>
                  <TabsTrigger value="labels" disabled>
                     Labels (0)
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="notes" className="space-y-4">
                  <div className="grid gap-4">
                     {Array.from({ length: 5 }).map((_, index) => (
                        <CardSkeleton key={index} />
                     ))}
                  </div>
               </TabsContent>

               <TabsContent value="folders" className="space-y-4">
                  <div className="grid gap-4">
                     {Array.from({ length: 3 }).map((_, index) => (
                        <CardSkeleton key={index} />
                     ))}
                  </div>
               </TabsContent>

               <TabsContent value="labels" className="space-y-4">
                  <div className="grid gap-4">
                     {Array.from({ length: 4 }).map((_, index) => (
                        <CardSkeleton key={index} />
                     ))}
                  </div>
               </TabsContent>
            </Tabs>
         </div>
      );
   }

   if (error) {
      return <div className="p-4 text-red-500">Error: {error}</div>;
   }

   return (
      <div className="p-4 space-y-6">
         <h1 className="text-2xl font-bold">Pagination Example</h1>

         <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
               <TabsTrigger value="notes">
                  Notes ({pagination.notes.totalCount})
               </TabsTrigger>
               <TabsTrigger value="folders">
                  Folders ({pagination.folders.totalCount})
               </TabsTrigger>
               <TabsTrigger value="labels">
                  Labels ({pagination.labels.totalCount})
               </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="space-y-4">
               <div className="grid gap-4">
                  {notes.map((note) => (
                     <Card key={note.id}>
                        <CardHeader>
                           <CardTitle className="text-lg">
                              {note.title}
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">
                              {note.content.substring(0, 100)}...
                           </p>
                           <p className="text-xs text-muted-foreground mt-2">
                              Updated:{" "}
                              {new Date(note.updatedAt).toLocaleDateString()}
                           </p>
                        </CardContent>
                     </Card>
                  ))}
               </div>

               {pagination.notes.totalPages > 1 && (
                  <Pagination
                     currentPage={pagination.notes.page}
                     totalPages={pagination.notes.totalPages}
                     hasNextPage={pagination.notes.hasNextPage}
                     hasPrevPage={pagination.notes.hasPrevPage}
                     onNextPage={() => loadNextPage("notes")}
                     onPrevPage={() => loadPrevPage("notes")}
                     onPageChange={(page) => loadDataByType("notes", page)}
                  />
               )}
            </TabsContent>

            <TabsContent value="folders" className="space-y-4">
               <div className="grid gap-4">
                  {folders.map((folder) => (
                     <Card key={folder.id}>
                        <CardHeader>
                           <CardTitle className="text-lg">
                              {folder.name}
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-xs text-muted-foreground">
                              Created:{" "}
                              {new Date(folder.createdAt).toLocaleDateString()}
                           </p>
                        </CardContent>
                     </Card>
                  ))}
               </div>

               {pagination.folders.totalPages > 1 && (
                  <Pagination
                     currentPage={pagination.folders.page}
                     totalPages={pagination.folders.totalPages}
                     hasNextPage={pagination.folders.hasNextPage}
                     hasPrevPage={pagination.folders.hasPrevPage}
                     onNextPage={() => loadNextPage("folders")}
                     onPrevPage={() => loadPrevPage("folders")}
                     onPageChange={(page) => loadDataByType("folders", page)}
                  />
               )}
            </TabsContent>

            <TabsContent value="labels" className="space-y-4">
               <div className="grid gap-4">
                  {labels.map((label) => (
                     <Card key={label.id}>
                        <CardHeader>
                           <CardTitle className="text-lg flex items-center gap-2">
                              <div
                                 className="w-4 h-4 rounded-full"
                                 style={{ backgroundColor: label.color }}
                              />
                              {label.name}
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-xs text-muted-foreground">
                              Created:{" "}
                              {new Date(label.createdAt).toLocaleDateString()}
                           </p>
                        </CardContent>
                     </Card>
                  ))}
               </div>

               {pagination.labels.totalPages > 1 && (
                  <Pagination
                     currentPage={pagination.labels.page}
                     totalPages={pagination.labels.totalPages}
                     hasNextPage={pagination.labels.hasNextPage}
                     hasPrevPage={pagination.labels.hasPrevPage}
                     onNextPage={() => loadNextPage("labels")}
                     onPrevPage={() => loadPrevPage("labels")}
                     onPageChange={(page) => loadDataByType("labels", page)}
                  />
               )}
            </TabsContent>
         </Tabs>

         <div className="mt-8 p-4 bg-muted rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
               Pagination Information
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
               <div>
                  <h3 className="font-medium">Notes</h3>
                  <p>
                     Page {pagination.notes.page} of{" "}
                     {pagination.notes.totalPages}
                  </p>
                  <p>Total: {pagination.notes.totalCount}</p>
               </div>
               <div>
                  <h3 className="font-medium">Folders</h3>
                  <p>
                     Page {pagination.folders.page} of{" "}
                     {pagination.folders.totalPages}
                  </p>
                  <p>Total: {pagination.folders.totalCount}</p>
               </div>
               <div>
                  <h3 className="font-medium">Labels</h3>
                  <p>
                     Page {pagination.labels.page} of{" "}
                     {pagination.labels.totalPages}
                  </p>
                  <p>Total: {pagination.labels.totalCount}</p>
               </div>
            </div>
         </div>
      </div>
   );
}
