import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Search, Home, FileText, HelpCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import {
   GoBackButton,
   NotFoundSearch,
} from "@/components/not-found-interactive";

export const metadata: Metadata = {
   title: "404 - Page Not Found | Notiva",
   description:
      "The page you're looking for doesn't exist. Explore Notiva's note-taking platform with markdown editing, AI enhancement, and publishing features.",
   robots: {
      index: false,
      follow: true,
   },
   openGraph: {
      title: "404 - Page Not Found | Notiva",
      description:
         "The page you're looking for doesn't exist. Explore Notiva's note-taking platform instead.",
      type: "website",
      siteName: "Notiva",
   },
   twitter: {
      card: "summary",
      title: "404 - Page Not Found | Notiva",
      description:
         "The page you're looking for doesn't exist. Explore Notiva's note-taking platform instead.",
   },
   alternates: {
      canonical: "/not-found",
   },
};

export default function NotFound() {
   const suggestions = [
      {
         title: "Start Taking Notes",
         description: "Create and organize your ideas with our markdown editor",
         href: "/",
         icon: FileText,
      },
      {
         title: "Explore Published Notes",
         description: "Discover publicly shared notes from the community",
         href: "/published",
         icon: Search,
      },
      {
         title: "Learn More",
         description: "Get help and learn about Notiva's features",
         href: "/help",
         icon: HelpCircle,
      },
   ];

   return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
         <div className="w-full max-w-2xl space-y-8">
            {/* Header with Logo */}
            <div className="text-center space-y-4">
               <div className="flex items-center justify-center gap-2 mb-6">
                  <Logo width={40} height={40} />
                  <span className="text-3xl font-bold">Notiva</span>
               </div>

               {/* 404 Number */}
               <div className="text-8xl font-bold text-muted-foreground/30 leading-none">
                  404
               </div>

               <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                     Page Not Found
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                     The page you're looking for doesn't exist or has been moved
                     to a different location.
                  </p>
               </div>
            </div>

            {/* Action Cards */}
            <div className="grid gap-4 md:grid-cols-2">
               {/* Primary Actions */}
               <Card className="md:col-span-2">
                  <CardContent className="p-6">
                     <div className="flex gap-3">
                        <Button asChild size="lg" className="flex-1">
                           <Link href="/" className="flex items-center gap-2">
                              <Home className="h-5 w-5" />
                              Go to Dashboard
                           </Link>
                        </Button>
                        <GoBackButton />
                     </div>
                  </CardContent>
               </Card>

               {/* Search */}
               <Card className="md:col-span-2">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-lg">
                        <Search className="h-5 w-5" />
                        Search Notiva
                     </CardTitle>
                     <CardDescription>
                        Try searching for what you need
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <NotFoundSearch />
                  </CardContent>
               </Card>
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
               <h2 className="text-xl font-semibold text-center">
                  What would you like to do instead?
               </h2>
               <div className="grid gap-4 md:grid-cols-3">
                  {suggestions.map((suggestion) => (
                     <Card
                        key={suggestion.href}
                        className="group hover:shadow-md transition-shadow cursor-pointer"
                     >
                        <Link href={suggestion.href}>
                           <CardHeader className="text-center pb-2">
                              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                 <suggestion.icon className="h-6 w-6 text-primary" />
                              </div>
                              <CardTitle className="text-base">
                                 {suggestion.title}
                              </CardTitle>
                           </CardHeader>
                           <CardContent className="text-center pt-0">
                              <CardDescription className="text-sm">
                                 {suggestion.description}
                              </CardDescription>
                           </CardContent>
                        </Link>
                     </Card>
                  ))}
               </div>
            </div>

            {/* Footer Info */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
               <p>
                  If you believe this is an error, please{" "}
                  <Link
                     href="/contact"
                     className="underline hover:text-foreground"
                  >
                     contact support
                  </Link>
               </p>
               <div className="flex items-center justify-center gap-4 pt-2">
                  <Link href="/terms" className="hover:text-foreground">
                     Terms
                  </Link>
                  <span>•</span>
                  <Link href="/privacy" className="hover:text-foreground">
                     Privacy
                  </Link>
                  <span>•</span>
                  <Link href="/help" className="hover:text-foreground">
                     Help
                  </Link>
               </div>
            </div>

            {/* Structured Data for SEO */}
            <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                     "@context": "https://schema.org",
                     "@type": "WebPage",
                     name: "404 - Page Not Found",
                     description:
                        "The requested page could not be found on Notiva.",
                     url:
                        typeof window !== "undefined"
                           ? window.location.href
                           : "",
                     mainEntity: {
                        "@type": "Organization",
                        name: "Notiva",
                        description:
                           "Modern note-taking platform with markdown editing and AI enhancement",
                        url:
                           process.env.NEXT_PUBLIC_SITE_URL ||
                           "https://notiva.net",
                     },
                  }),
               }}
            />
         </div>
      </div>
   );
}
