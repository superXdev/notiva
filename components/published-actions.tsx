"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { exportToPDF } from "@/lib/pdf-export";
import { useToast } from "@/hooks/use-toast";

interface PublishedActionsProps {
  note: {
    id: string;
    title: string;
    content: string;
    labels: string[];
    created_at: string;
    updated_at: string;
    published_at: string;
  };
}

export function PublishedActions({ note }: PublishedActionsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handlePDFExport = async () => {
    try {
      setIsExporting(true);
      await exportToPDF({
        title: note.title || "Untitled Note",
        content: note.content,
        labels: note.labels,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      });
      
      toast({
        title: "PDF exported successfully",
        description: "Your note has been downloaded as a PDF file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      setIsCopied(true);
      
      toast({
        title: "Markdown copied",
        description: "The note content has been copied to your clipboard.",
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "There was an error copying the content. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handlePDFExport}
        disabled={isExporting}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Download PDF"}
      </Button>
      
      <Button
        onClick={handleCopyMarkdown}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {isCopied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Markdown
          </>
        )}
      </Button>
    </div>
  );
}