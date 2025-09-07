"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
   Save,
   MoreHorizontal,
   Trash2,
   Tag,
   Eye,
   Edit,
   Download,
   ChevronRight,
   Globe,
   Link,
   Undo2,
   Copy,
   Check,
} from "lucide-react";
import { useNotes } from "@/contexts/notes-context";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { exportToPDF } from "@/lib/pdf-export";

import { MarkdownNavigation } from "./markdown-navigation";
import { FolderMoveDropdown } from "./folder-move-dropdown";
import { AIEnhancementButton } from "./ai-enhancement-button";

export function NoteEditor() {
   const {
      selectedNote,
      labels,
      folders,
      updateNote,
      deleteNote,
      selectNote,
      refreshFolderCount,
      refreshNoteCounts,
   } = useNotes();
   const { toast } = useToast();

   const [title, setTitle] = useState("");
   const [content, setContent] = useState("");
   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
   const [isExportingPDF, setIsExportingPDF] = useState(false);
   const [isPublishing, setIsPublishing] = useState(false);
   const [currentTab, setCurrentTab] = useState("edit");
   const [contentHistory, setContentHistory] = useState<string[]>([]);
   const [historyIndex, setHistoryIndex] = useState(-1);
   const [isCopied, setIsCopied] = useState(false);

   useEffect(() => {
      if (selectedNote) {
         setTitle(selectedNote.title || "");
         setContent(selectedNote.content || "");
         setHasUnsavedChanges(false);
         // Reset history when switching to a new note
         setContentHistory([]);
         setHistoryIndex(-1);
      } else {
         setTitle("");
         setContent("");
         setHasUnsavedChanges(false);
         setContentHistory([]);
         setHistoryIndex(-1);
      }
   }, [
      selectedNote?.id,
      selectedNote?.title,
      selectedNote?.content,
      selectedNote?.updatedAt,
   ]);

   useEffect(() => {
      if (selectedNote) {
         const hasChanges =
            title !== (selectedNote.title || "") ||
            content !== (selectedNote.content || "");
         setHasUnsavedChanges(hasChanges);
      } else {
         setHasUnsavedChanges(false);
      }
   }, [
      title,
      content,
      selectedNote?.title,
      selectedNote?.content,
      selectedNote?.updatedAt,
   ]);

   const handleSave = useCallback(async () => {
      if (selectedNote && hasUnsavedChanges) {
         try {
            const updatedNote = await updateNote(selectedNote.id, {
               title,
               content,
            });
            setHasUnsavedChanges(false);
            // Force a re-render by updating the local state with the server response
            if (updatedNote) {
               setTitle(updatedNote.title || "");
               setContent(updatedNote.content || "");
            }
         } catch (error) {
            console.error("Failed to save note:", error);
         }
      }
   }, [selectedNote, hasUnsavedChanges, title, content, updateNote]);

   const handleDelete = async () => {
      if (selectedNote) {
         try {
            await deleteNote(selectedNote.id);
         } catch (error) {
            console.error("Failed to delete note:", error);
         }
      }
   };

   const handleExportPDF = async () => {
      if (!selectedNote) return;

      setIsExportingPDF(true);
      try {
         await exportToPDF({
            title: title || "Untitled Note",
            content: content,
            labels: selectedNote.labels,
            createdAt: selectedNote.createdAt,
            updatedAt: selectedNote.updatedAt,
         });
      } catch (error) {
         console.error("Failed to export PDF:", error);
      } finally {
         setIsExportingPDF(false);
      }
   };

   const handlePublish = async () => {
      if (!selectedNote) return;

      setIsPublishing(true);
      try {
         await updateNote(selectedNote.id, {
            published: !selectedNote.published,
         });

         toast({
            title: selectedNote.published
               ? "Note unpublished"
               : "Note published",
            description: selectedNote.published
               ? "Your note is no longer publicly accessible."
               : "Your note is now publicly accessible.",
         });
      } catch (error) {
         console.error("Failed to publish note:", error);
         toast({
            title: "Failed to publish note",
            description: "Please try again.",
            variant: "destructive",
         });
      } finally {
         setIsPublishing(false);
      }
   };

   const getPublishedUrl = () => {
      if (!selectedNote?.published) return null;
      return `${window.location.origin}/published/${selectedNote.id}`;
   };

   const handleAddLabel = async (labelName: string) => {
      if (selectedNote && !selectedNote.labels.includes(labelName)) {
         try {
            await updateNote(selectedNote.id, {
               labels: [...selectedNote.labels, labelName],
            });
         } catch (error) {
            console.error("Failed to add label:", error);
         }
      }
   };

   const handleRemoveLabel = async (labelName: string) => {
      if (selectedNote) {
         try {
            await updateNote(selectedNote.id, {
               labels: selectedNote.labels.filter((l) => l !== labelName),
            });
         } catch (error) {
            console.error("Failed to remove label:", error);
         }
      }
   };

   const handleMoveToFolder = async (folderId?: string) => {
      if (selectedNote) {
         try {
            const oldFolderId = selectedNote.folderId;
            console.log(
               `Moving note from folder ${oldFolderId} to folder ${folderId}`
            );

            // Update the note first
            const updatedNote = await updateNote(selectedNote.id, {
               folderId: folderId,
            });

            console.log("Note updated:", updatedNote);

            // Force a complete refresh of all counts to ensure accuracy
            console.log("Forcing complete count refresh after move...");
            await refreshNoteCounts();
            console.log("Complete count refresh finished");
         } catch (error) {
            console.error("Failed to move note:", error);
         }
      }
   };

   const handleAIEnhance = (enhancedContent: string) => {
      // Save current content to history before enhancing
      addToHistory(content);
      setContent(enhancedContent);
      setHasUnsavedChanges(true);
   };

   const handleCopyContent = async () => {
      try {
         await navigator.clipboard.writeText(content);
         setIsCopied(true);
         toast({
            title: "Content copied!",
            description: "The note content has been copied to your clipboard.",
         });

         // Reset the copied state after 2 seconds
         setTimeout(() => {
            setIsCopied(false);
         }, 2000);
      } catch (error) {
         toast({
            title: "Failed to copy content",
            description: "Please try again or copy the content manually.",
            variant: "destructive",
         });
      }
   };

   const addToHistory = (currentContent: string) => {
      setContentHistory((prev) => {
         const newHistory = prev.slice(0, historyIndex + 1);
         newHistory.push(currentContent);
         // Keep only last 10 entries to prevent memory issues
         return newHistory.slice(-10);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 9));
   };

   const handleUndo = () => {
      if (historyIndex > 0) {
         const newIndex = historyIndex - 1;
         setHistoryIndex(newIndex);
         setContent(contentHistory[newIndex]);
         setHasUnsavedChanges(true);
      }
   };

   const canUndo = historyIndex > 0;

   // Debounced function to add content to history
   useEffect(() => {
      const timeoutId = setTimeout(() => {
         if (content && selectedNote) {
            addToHistory(content);
         }
      }, 1000); // Wait 1 second after user stops typing

      return () => clearTimeout(timeoutId);
   }, [content, selectedNote?.id]);

   const getFolderPath = (folderId?: string) => {
      if (!folderId) return [];

      const path = [];
      let current = folders.find((f) => f.id === folderId);

      while (current) {
         path.unshift(current);
         current = current.parentId
            ? folders.find((f) => f.id === current.parentId) || undefined
            : undefined;
      }

      return path;
   };

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            handleSave();
         }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
   }, [handleSave]);

   // NoteEditor render

   if (!selectedNote) {
      return (
         <div className="flex-1 flex flex-col bg-background h-full">
            <div className="md:hidden border-b border-border p-3 flex items-center justify-center">
               <h1 className="text-lg font-semibold">Notes</h1>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-0">
               <div className="text-center px-4">
                  <Edit className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No note selected</h3>
                  <p className="text-muted-foreground text-sm">
                     Select a note from the sidebar to start editing
                  </p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="flex-1 flex flex-col bg-background min-w-0 h-full">
         <div className="border-b border-border flex-shrink-0">
            {/* Mobile Header */}
            <div className="md:hidden p-3">
               <div className="flex items-center justify-between mb-2">
                  <h1 className="text-lg font-semibold truncate flex-1">
                     {title || "Untitled Note"}
                  </h1>
                  <div className="flex items-center space-x-1">
                     {hasUnsavedChanges && (
                        <Button onClick={handleSave} size="sm">
                           <Save className="h-4 w-4" />
                        </Button>
                     )}
                     <FolderMoveDropdown
                        currentFolderId={selectedNote.folderId}
                        onMove={handleMoveToFolder}
                     />
                  </div>
               </div>

               {/* Mobile Folder Path */}
               {selectedNote.folderId && (
                  <div className="flex items-center text-xs text-muted-foreground px-3">
                     {getFolderPath(selectedNote.folderId).map(
                        (folder, index) => (
                           <span key={folder.id} className="flex items-center">
                              {index > 0 && (
                                 <ChevronRight className="h-3 w-3 mx-1" />
                              )}
                              <span className="truncate">{folder.name}</span>
                           </span>
                        )
                     )}
                     <ChevronRight className="h-3 w-3 mx-1" />
                  </div>
               )}
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block p-4">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 min-w-0">
                     {/* Folder Path */}
                     {selectedNote.folderId && (
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                           {getFolderPath(selectedNote.folderId).map(
                              (folder, index) => (
                                 <span
                                    key={folder.id}
                                    className="flex items-center"
                                 >
                                    {index > 0 && (
                                       <ChevronRight className="h-3 w-3 mx-1" />
                                    )}
                                    <span className="truncate">
                                       {folder.name}
                                    </span>
                                 </span>
                              )
                           )}
                           <ChevronRight className="h-3 w-3 mx-1" />
                        </div>
                     )}

                     {/* Note Title */}
                     <div className="flex items-center space-x-2">
                        <Input
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           className="text-lg font-semibold border-none bg-transparent p-0 focus-visible:ring-0"
                           placeholder="Untitled note"
                        />
                        {selectedNote.published && (
                           <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Published
                           </Badge>
                        )}
                     </div>
                  </div>

                  <div className="flex items-center space-x-2">
                     {hasUnsavedChanges && (
                        <Button onClick={handleSave} size="sm">
                           <Save className="h-4 w-4 mr-1" />
                           Save
                        </Button>
                     )}

                     <FolderMoveDropdown
                        currentFolderId={selectedNote.folderId}
                        onMove={handleMoveToFolder}
                     />

                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                           <DropdownMenuItem
                              onClick={handlePublish}
                              disabled={isPublishing}
                           >
                              {selectedNote.published ? (
                                 <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {isPublishing
                                       ? "Unpublishing..."
                                       : "Unpublish"}
                                 </>
                              ) : (
                                 <>
                                    <Globe className="h-4 w-4 mr-2" />
                                    {isPublishing ? "Publishing..." : "Publish"}
                                 </>
                              )}
                           </DropdownMenuItem>
                           {selectedNote.published && (
                              <DropdownMenuItem
                                 onClick={async () => {
                                    const url = getPublishedUrl();
                                    if (url) {
                                       try {
                                          await navigator.clipboard.writeText(
                                             url
                                          );
                                          toast({
                                             title: "Link copied!",
                                             description:
                                                "The published note link has been copied to your clipboard.",
                                          });
                                       } catch (error) {
                                          toast({
                                             title: "Failed to copy link",
                                             description:
                                                "Please try again or copy the link manually.",
                                             variant: "destructive",
                                          });
                                       }
                                    }
                                 }}
                              >
                                 <Link className="h-4 w-4 mr-2" />
                                 Copy Link
                              </DropdownMenuItem>
                           )}
                           <DropdownMenuItem
                              onClick={handleExportPDF}
                              disabled={isExportingPDF}
                           >
                              <Download className="h-4 w-4 mr-2" />
                              {isExportingPDF
                                 ? "Exporting..."
                                 : "Export as PDF"}
                           </DropdownMenuItem>
                           <DropdownMenuItem
                              onClick={handleDelete}
                              className="text-destructive"
                           >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Note
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
               </div>

               {/* Labels - Desktop only */}
               <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <div className="flex flex-wrap gap-2">
                     {selectedNote.labels.map((labelName) => {
                        const label = labels.find((l) => l.name === labelName);
                        return (
                           <Badge
                              key={labelName}
                              variant="secondary"
                              className="cursor-pointer"
                              style={
                                 label
                                    ? {
                                         backgroundColor: label.color + "20",
                                         color: label.color,
                                      }
                                    : {}
                              }
                              onClick={() => handleRemoveLabel(labelName)}
                           >
                              <Tag className="h-3 w-3 mr-1" />
                              {labelName}
                              <span className="ml-1 text-xs opacity-70">×</span>
                           </Badge>
                        );
                     })}
                  </div>

                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                           <Tag className="h-4 w-4 mr-1" />
                           Add Label
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent>
                        {labels
                           .filter(
                              (label) =>
                                 !selectedNote.labels.includes(label.name)
                           )
                           .map((label) => (
                              <DropdownMenuItem
                                 key={label.id}
                                 onClick={() => handleAddLabel(label.name)}
                              >
                                 <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: label.color }}
                                 />
                                 {label.name}
                              </DropdownMenuItem>
                           ))}
                        {labels.filter(
                           (label) => !selectedNote.labels.includes(label.name)
                        ).length === 0 && (
                           <DropdownMenuItem disabled>
                              No available labels
                           </DropdownMenuItem>
                        )}
                     </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>
         </div>

         {/* Editor */}
         <div className="flex-1 min-h-0 overflow-hidden">
            <Tabs
               defaultValue="edit"
               value={currentTab}
               onValueChange={setCurrentTab}
               className="h-full flex flex-col"
            >
               <div className="mx-3 md:mx-4 mt-3 md:mt-4 flex items-center justify-between flex-shrink-0">
                  <TabsList className="w-fit">
                     <TabsTrigger value="edit" className="text-sm">
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                     </TabsTrigger>
                     <TabsTrigger value="preview" className="text-sm">
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Preview</span>
                     </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center space-x-2">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className="gap-2"
                     >
                        <Undo2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Undo</span>
                     </Button>
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyContent}
                        disabled={!content.trim()}
                        className={`gap-2 transition-colors ${
                           isCopied ? "text-green-600 dark:text-green-400" : ""
                        }`}
                     >
                        {isCopied ? (
                           <Check className="h-4 w-4" />
                        ) : (
                           <Copy className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">
                           {isCopied ? "Copied!" : "Copy"}
                        </span>
                     </Button>
                     <AIEnhancementButton
                        content={content}
                        onEnhance={handleAIEnhance}
                        disabled={!content.trim()}
                     />
                     <MarkdownNavigation
                        content={content}
                        isPreviewMode={currentTab === "preview"}
                     />
                  </div>
               </div>

               <TabsContent
                  value="edit"
                  className="flex-1 m-0 p-3 md:p-4 flex flex-col min-h-0"
               >
                  <div className="md:hidden mb-3 flex-shrink-0">
                     <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-base font-semibold"
                        placeholder="Untitled note"
                     />
                  </div>

                  <div className="flex-1 min-h-0">
                     <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing your note in Markdown..."
                        className="w-full h-full resize-none border-none bg-transparent focus-visible:ring-0 font-mono text-sm leading-relaxed"
                        style={{
                           wordWrap: "break-word",
                           overflowWrap: "break-word",
                           whiteSpace: "pre-wrap",
                        }}
                     />
                  </div>
               </TabsContent>

               <TabsContent
                  value="preview"
                  className="flex-1 m-0 p-3 md:p-4 overflow-auto"
                  id="preview-container"
               >
                  <div
                     className="prose prose-sm dark:prose-invert max-w-none 
                        prose-headings:text-foreground prose-headings:font-semibold
                        prose-h1:text-2xl prose-h1:border-b prose-h1:border-border prose-h1:pb-2
                        prose-h2:text-xl prose-h2:border-b prose-h2:border-border prose-h2:pb-1
                        prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-sm
                        prose-p:text-foreground prose-p:leading-relaxed
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-em:text-foreground prose-em:italic
                        prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                        prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
                        prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                        prose-code:before:content-none prose-code:after:content-none
                        prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-0
                        prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground
                        prose-hr:border-border prose-hr:my-6
                        prose-img:rounded-lg prose-img:border prose-img:border-border"
                  >
                     <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                           code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                           }) {
                              const match = /language-(\w+)/.exec(
                                 className || ""
                              );
                              return !inline && match ? (
                                 <div className="not-prose my-4">
                                    <SyntaxHighlighter
                                       style={{
                                          ...oneDark,
                                          'pre[class*="language-"]': {
                                             ...oneDark[
                                                'pre[class*="language-"]'
                                             ],
                                             background: "transparent",
                                          },
                                          'code[class*="language-"]': {
                                             ...oneDark[
                                                'code[class*="language-"]'
                                             ],
                                             background: "transparent",
                                          },
                                       }}
                                       language={match[1]}
                                       PreTag="div"
                                       className="rounded-lg border border-border overflow-hidden"
                                       customStyle={{
                                          margin: 0,
                                          padding: "1rem",
                                          background: "transparent",
                                          fontSize: "0.875rem",
                                          lineHeight: "1.5",
                                       }}
                                       {...props}
                                    >
                                       {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                 </div>
                              ) : (
                                 <code
                                    className="text-foreground px-1.5 py-0.5 rounded text-sm font-mono"
                                    {...props}
                                 >
                                    {children}
                                 </code>
                              );
                           },
                           table({ children }) {
                              return (
                                 <div className="not-prose my-6 overflow-x-auto">
                                    <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                                       {children}
                                    </table>
                                 </div>
                              );
                           },
                           thead({ children }) {
                              return (
                                 <thead className="bg-muted">{children}</thead>
                              );
                           },
                           th({ children }) {
                              return (
                                 <th className="border-r border-border last:border-r-0 px-4 py-3 text-left font-semibold text-foreground">
                                    {children}
                                 </th>
                              );
                           },
                           td({ children }) {
                              return (
                                 <td className="border-r border-border border-t last:border-r-0 px-4 py-3 text-foreground">
                                    {children}
                                 </td>
                              );
                           },
                           blockquote({ children }) {
                              return (
                                 <blockquote className="not-prose border-l-4 border-primary bg-muted/50 pl-4 pr-4 py-3 my-4 rounded-r italic text-muted-foreground">
                                    {children}
                                 </blockquote>
                              );
                           },
                           ul({ children }) {
                              return (
                                 <ul className="list-disc list-outside space-y-0.5 ml-6 my-1">
                                    {children}
                                 </ul>
                              );
                           },
                           ol({ children }) {
                              return (
                                 <ol className="list-decimal list-outside space-y-0.5 ml-6 my-1">
                                    {children}
                                 </ol>
                              );
                           },
                           li({ children, ...props }) {
                              // Handle task list items
                              if (
                                 typeof children === "object" &&
                                 Array.isArray(children)
                              ) {
                                 const firstChild = children[0];
                                 if (
                                    firstChild &&
                                    typeof firstChild === "object" &&
                                    "type" in firstChild &&
                                    firstChild.type === "input"
                                 ) {
                                    return (
                                       <li
                                          className="flex items-start space-x-2 list-none ml-0"
                                          {...props}
                                       >
                                          {children}
                                       </li>
                                    );
                                 }
                              }
                              return (
                                 <li
                                    className="text-foreground leading-relaxed"
                                    {...props}
                                 >
                                    {children}
                                 </li>
                              );
                           },
                           input({ type, checked, ...props }) {
                              if (type === "checkbox") {
                                 return (
                                    <input
                                       type="checkbox"
                                       checked={checked}
                                       readOnly
                                       className="mt-1 accent-primary cursor-default"
                                       {...props}
                                    />
                                 );
                              }
                              return <input type={type} {...props} />;
                           },
                           h1({ children }) {
                              const text = String(children);
                              const id = `heading-${text
                                 .toLowerCase()
                                 .replace(/[^a-z0-9]+/g, "-")}`;
                              return (
                                 <h1
                                    id={id}
                                    className="text-2xl font-semibold border-b border-border pb-2 mb-4"
                                 >
                                    {children}
                                 </h1>
                              );
                           },
                           h2({ children }) {
                              const text = String(children);
                              const id = `heading-${text
                                 .toLowerCase()
                                 .replace(/[^a-z0-9]+/g, "-")}`;
                              return (
                                 <h2
                                    id={id}
                                    className="text-xl font-semibold border-b border-border pb-1 mb-3 mt-6"
                                 >
                                    {children}
                                 </h2>
                              );
                           },
                           h3({ children }) {
                              const text = String(children);
                              const id = `heading-${text
                                 .toLowerCase()
                                 .replace(/[^a-z0-9]+/g, "-")}`;
                              return (
                                 <h3
                                    id={id}
                                    className="text-lg font-semibold mb-2 mt-5"
                                 >
                                    {children}
                                 </h3>
                              );
                           },
                           h4({ children }) {
                              const text = String(children);
                              const id = `heading-${text
                                 .toLowerCase()
                                 .replace(/[^a-z0-9]+/g, "-")}`;
                              return (
                                 <h4
                                    id={id}
                                    className="text-base font-semibold mb-2 mt-4"
                                 >
                                    {children}
                                 </h4>
                              );
                           },
                           h5({ children }) {
                              const text = String(children);
                              const id = `heading-${text
                                 .toLowerCase()
                                 .replace(/[^a-z0-9]+/g, "-")}`;
                              return (
                                 <h5
                                    id={id}
                                    className="text-sm font-semibold mb-1 mt-3"
                                 >
                                    {children}
                                 </h5>
                              );
                           },
                           h6({ children }) {
                              const text = String(children);
                              const id = `heading-${text
                                 .toLowerCase()
                                 .replace(/[^a-z0-9]+/g, "-")}`;
                              return (
                                 <h6
                                    id={id}
                                    className="text-sm font-semibold mb-1 mt-3 text-muted-foreground"
                                 >
                                    {children}
                                 </h6>
                              );
                           },
                           hr() {
                              return <hr className="border-border my-6" />;
                           },
                           p({ children }) {
                              return (
                                 <p className="leading-relaxed mb-4 text-foreground">
                                    {children}
                                 </p>
                              );
                           },
                           a({ href, children }) {
                              return (
                                 <a
                                    href={href}
                                    className="text-primary underline hover:text-primary/80 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                 >
                                    {children}
                                 </a>
                              );
                           },
                        }}
                     >
                        {content || "*No content to preview*"}
                     </ReactMarkdown>
                  </div>
               </TabsContent>
            </Tabs>
         </div>

         {/* Status Bar */}
         <div className="border-t border-border px-3 md:px-4 py-2 text-xs text-muted-foreground flex justify-between items-center flex-shrink-0">
            <div className="flex items-center space-x-4">
               <span>{hasUnsavedChanges ? "Unsaved changes" : "Saved"}</span>
               <span className="hidden sm:inline">
                  Last updated:{" "}
                  {new Date(selectedNote.updatedAt).toLocaleString()}
               </span>
            </div>

            <div className="md:hidden flex items-center space-x-2">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     <DropdownMenuItem
                        onClick={handlePublish}
                        disabled={isPublishing}
                     >
                        {selectedNote.published ? (
                           <>
                              <Eye className="h-4 w-4 mr-2" />
                              {isPublishing ? "Unpublishing..." : "Unpublish"}
                           </>
                        ) : (
                           <>
                              <Globe className="h-4 w-4 mr-2" />
                              {isPublishing ? "Publishing..." : "Publish"}
                           </>
                        )}
                     </DropdownMenuItem>
                     {selectedNote.published && (
                        <DropdownMenuItem
                           onClick={async () => {
                              const url = getPublishedUrl();
                              if (url) {
                                 try {
                                    await navigator.clipboard.writeText(url);
                                    toast({
                                       title: "Link copied!",
                                       description:
                                          "The published note link has been copied to your clipboard.",
                                    });
                                 } catch (error) {
                                    toast({
                                       title: "Failed to copy link",
                                       description:
                                          "Please try again or copy the link manually.",
                                       variant: "destructive",
                                    });
                                 }
                              }
                           }}
                        >
                           <Link className="h-4 w-4 mr-2" />
                           Copy Link
                        </DropdownMenuItem>
                     )}
                     <DropdownMenuItem
                        onClick={handleExportPDF}
                        disabled={isExportingPDF}
                     >
                        <Download className="h-4 w-4 mr-2" />
                        {isExportingPDF ? "Exporting..." : "Export as PDF"}
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive"
                     >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Note
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>
      </div>
   );
}
