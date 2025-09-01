import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface PublishedNotePageProps {
   params: {
      id: string;
   };
}

export async function generateMetadata({
   params,
}: PublishedNotePageProps): Promise<Metadata> {
   const { id } = await params;
   const supabase = await createClient();

   const { data: note, error } = (await supabase
      .from("notes")
      .select("title, content, labels, published_at, updated_at")
      .eq("id", id)
      .eq("published", true)
      .single()) as {
      data: {
         title: string;
         content: string;
         labels: string[];
         published_at: string;
         updated_at: string;
      } | null;
      error: any;
   };

   if (error || !note) {
      return {
         title: "Note Not Found",
         description: "This note is not available or has not been published.",
      };
   }

   // Create a description from the content (first 160 characters)
   const description = note.content
      ? note.content.replace(/[#*`]/g, "").substring(0, 160) + "..."
      : "A published note from Notiva";

   return {
      title: note.title || "Untitled Note",
      description,
      openGraph: {
         title: note.title || "Untitled Note",
         description,
         type: "article",
         url: `${
            process.env.NEXT_PUBLIC_SITE_URL || "https://notiva.app"
         }/published/${id}`,
         siteName: "Notiva",
         locale: "en_US",
         publishedTime: note.published_at || note.updated_at,
         modifiedTime: note.updated_at,
         authors: ["Notiva"],
         tags: note.labels || [],
         images: [
            {
               url: `${
                  process.env.NEXT_PUBLIC_SITE_URL || "https://notiva.app"
               }/api/og?title=${encodeURIComponent(
                  note.title || "Untitled Note"
               )}&description=${encodeURIComponent(description)}`,
               width: 1200,
               height: 630,
               alt: note.title || "Untitled Note",
            },
         ],
      },
      twitter: {
         card: "summary_large_image",
         title: note.title || "Untitled Note",
         description,
         images: [
            `${
               process.env.NEXT_PUBLIC_SITE_URL || "https://notiva.app"
            }/api/og?title=${encodeURIComponent(
               note.title || "Untitled Note"
            )}&description=${encodeURIComponent(description)}`,
         ],
         creator: "@notiva",
         site: "@notiva",
      },
      alternates: {
         canonical: `${
            process.env.NEXT_PUBLIC_SITE_URL || "https://notiva.app"
         }/published/${id}`,
      },
      robots: {
         index: true,
         follow: true,
         googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
         },
      },
   };
}

export default async function PublishedNotePage({
   params,
}: PublishedNotePageProps) {
   const { id } = await params;
   const supabase = await createClient();

   // Get the published note
   const { data: note, error } = (await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .single()) as { data: any; error: any };

   if (error || !note) {
      notFound();
   }

   // Generate structured data for SEO
   const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: note.title || "Untitled Note",
      description: note.content.replace(/[#*`]/g, "").substring(0, 160) + "...",
      author: {
         "@type": "Organization",
         name: "Notiva",
      },
      publisher: {
         "@type": "Organization",
         name: "Notiva",
         logo: {
            "@type": "ImageObject",
            url: `${
               process.env.NEXT_PUBLIC_SITE_URL || "https://notiva.app"
            }/placeholder-logo.png`,
         },
      },
      datePublished: note.published_at || note.updated_at,
      dateModified: note.updated_at,
      mainEntityOfPage: {
         "@type": "WebPage",
         "@id": `${
            process.env.NEXT_PUBLIC_SITE_URL || "https://notiva.app"
         }/published/${id}`,
      },
      keywords: note.labels.join(", "),
      articleSection: "Notes",
      inLanguage: "en-US",
   };

   return (
      <div className="min-h-screen bg-background">
         <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
               __html: JSON.stringify(structuredData),
            }}
         />
         <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <header className="mb-8">
               <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-foreground">
                     {note.title}
                  </h1>
                  <div className="text-sm text-muted-foreground">
                     Published{" "}
                     {formatDistanceToNow(
                        new Date(note.published_at || note.updated_at),
                        { addSuffix: true }
                     )}
                  </div>
               </div>

               {/* Labels */}
               {note.labels && note.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                     {note.labels.map((label: string) => (
                        <Badge key={label} variant="secondary">
                           {label}
                        </Badge>
                     ))}
                  </div>
               )}

               <div className="w-full h-px bg-border" />
            </header>

            {/* Content */}
            <article className="prose prose-lg max-w-none dark:prose-invert">
               <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                     code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                     }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                           <div className="not-prose my-4">
                              <SyntaxHighlighter
                                 style={{
                                    ...oneDark,
                                    'pre[class*="language-"]': {
                                       ...oneDark['pre[class*="language-"]'],
                                       background: "transparent",
                                    },
                                    'code[class*="language-"]': {
                                       ...oneDark['code[class*="language-"]'],
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
                           <code className={className} {...props}>
                              {children}
                           </code>
                        );
                     },
                  }}
               >
                  {note.content}
               </ReactMarkdown>
            </article>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-border">
               <div className="text-center text-sm text-muted-foreground">
                  <p>Published with Notiva</p>
                  <p className="mt-1">
                     Last updated{" "}
                     {formatDistanceToNow(new Date(note.updated_at), {
                        addSuffix: true,
                     })}
                  </p>
               </div>
            </footer>
         </div>
      </div>
   );
}
