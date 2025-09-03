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
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
   FileText, 
   Folder, 
   Tag, 
   Download, 
   Globe, 
   Wand2, 
   Search,
   Home,
   Mail,
   ExternalLink 
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
   title: "Help & Support | Notiva",
   description: "Get help with Notiva's note-taking platform. Learn about markdown editing, AI enhancement, publishing, PDF export, and more features.",
   openGraph: {
      title: "Help & Support | Notiva",
      description: "Get help with Notiva's note-taking platform. Learn about features and get support.",
      type: "website",
      siteName: "Notiva",
   },
   twitter: {
      card: "summary",
      title: "Help & Support | Notiva",
      description: "Get help with Notiva's note-taking platform features and support.",
   },
};

const features = [
   {
      icon: FileText,
      title: "Markdown Editing",
      description: "Rich text editing with markdown syntax support and live preview"
   },
   {
      icon: Folder,
      title: "Organization",
      description: "Organize notes with nested folders and color-coded labels"
   },
   {
      icon: Wand2,
      title: "AI Enhancement",
      description: "Improve, expand, and format your content with AI assistance"
   },
   {
      icon: Download,
      title: "PDF Export",
      description: "Export notes as professionally formatted PDF documents"
   },
   {
      icon: Globe,
      title: "Publishing",
      description: "Share notes publicly with SEO-optimized web pages"
   },
   {
      icon: Search,
      title: "Search",
      description: "Find notes quickly with powerful search functionality"
   },
];

const faqs = [
   {
      question: "How do I create my first note?",
      answer: "After logging in, click the 'New Note' button in the sidebar or use the '+' icon. You can start typing immediately - Notiva automatically saves your work as you type."
   },
   {
      question: "How do I organize my notes with folders and labels?",
      answer: "Create folders by right-clicking in the sidebar and selecting 'New Folder'. You can drag notes between folders. Add labels by clicking the tag icon in the note editor and typing label names. Labels can be color-coded for better organization."
   },
   {
      question: "What markdown features are supported?",
      answer: "Notiva supports standard markdown including headers, bold/italic text, lists, links, images, code blocks, tables, and more. The editor provides live preview so you can see formatting in real-time."
   },
   {
      question: "How does AI enhancement work?",
      answer: "Select text in your note and click the AI enhancement button. Choose from options like 'Improve', 'Expand', 'Summarize', or 'Format'. The AI will process your content and suggest improvements while maintaining your original meaning."
   },
   {
      question: "Can I export my notes?",
      answer: "Yes! You can export individual notes or entire folders as PDF files. The export maintains markdown formatting, headers, lists, and styling for professional-looking documents."
   },
   {
      question: "How do I publish a note publicly?",
      answer: "In the note editor, click the 'More' menu (three dots) and select 'Publish'. This creates a public URL that anyone can access. Published notes are SEO-optimized and can be shared on social media."
   },
   {
      question: "Is my data secure?",
      answer: "Yes. Notiva uses enterprise-grade security with Row Level Security (RLS) ensuring you can only access your own data. All connections are encrypted, and we never share your personal notes."
   },
   {
      question: "Can I search through my notes?",
      answer: "Absolutely! Use the search bar at the top of the sidebar to search through note titles and content. You can also filter by folders and labels to quickly find specific notes."
   },
   {
      question: "Does Notiva work offline?",
      answer: "Notiva requires an internet connection for full functionality, including AI features and synchronization. However, you can continue editing notes that are already loaded, and changes will sync when you're back online."
   },
   {
      question: "How do I delete or restore notes?",
      answer: "Click the 'More' menu (three dots) in the note editor and select 'Delete'. Deleted notes are moved to a trash folder where they can be restored or permanently deleted."
   }
];

export default function HelpPage() {
   return (
      <div className="min-h-screen bg-background">
         <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
               <div className="flex items-center justify-center gap-2 mb-4">
                  <Logo width={32} height={32} />
                  <span className="text-2xl font-bold">Notiva</span>
               </div>
               <h1 className="text-3xl font-bold">Help & Support</h1>
               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Learn how to make the most of Notiva's features and get answers to common questions.
               </p>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3 mb-12">
               <Card className="text-center">
                  <CardHeader>
                     <Home className="h-8 w-8 mx-auto text-primary" />
                     <CardTitle className="text-lg">Get Started</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                        New to Notiva? Start taking notes right away.
                     </p>
                     <Button asChild className="w-full">
                        <Link href="/">Go to Dashboard</Link>
                     </Button>
                  </CardContent>
               </Card>

               <Card className="text-center">
                  <CardHeader>
                     <Mail className="h-8 w-8 mx-auto text-primary" />
                     <CardTitle className="text-lg">Contact Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                        Need personal assistance? We're here to help.
                     </p>
                     <Button variant="outline" asChild className="w-full">
                        <Link href="mailto:support@notiva.app">
                           Email Support
                        </Link>
                     </Button>
                  </CardContent>
               </Card>

               <Card className="text-center">
                  <CardHeader>
                     <ExternalLink className="h-8 w-8 mx-auto text-primary" />
                     <CardTitle className="text-lg">Documentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                        Detailed guides and API documentation.
                     </p>
                     <Button variant="outline" asChild className="w-full">
                        <Link href="/docs" target="_blank">
                           View Docs
                        </Link>
                     </Button>
                  </CardContent>
               </Card>
            </div>

            {/* Features Overview */}
            <section className="mb-12">
               <h2 className="text-2xl font-bold mb-6">Key Features</h2>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature) => (
                     <Card key={feature.title} className="group hover:shadow-md transition-shadow">
                        <CardHeader>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                 <feature.icon className="h-5 w-5 text-primary" />
                              </div>
                              <CardTitle className="text-base">{feature.title}</CardTitle>
                           </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                           <p className="text-sm text-muted-foreground">
                              {feature.description}
                           </p>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-12">
               <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
               <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                     <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                           {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                           {faq.answer}
                        </AccordionContent>
                     </AccordionItem>
                  ))}
               </Accordion>
            </section>

            {/* Getting Started Guide */}
            <section className="mb-12">
               <h2 className="text-2xl font-bold mb-6">Quick Start Guide</h2>
               <Card>
                  <CardContent className="p-6">
                     <ol className="space-y-4">
                        <li className="flex items-start gap-3">
                           <Badge variant="outline" className="mt-1 min-w-fit">1</Badge>
                           <div>
                              <p className="font-medium">Create Your Account</p>
                              <p className="text-sm text-muted-foreground">
                                 Sign up with email or Google to get started with Notiva.
                              </p>
                           </div>
                        </li>
                        <li className="flex items-start gap-3">
                           <Badge variant="outline" className="mt-1 min-w-fit">2</Badge>
                           <div>
                              <p className="font-medium">Create Your First Note</p>
                              <p className="text-sm text-muted-foreground">
                                 Click "New Note" and start typing. Use markdown for formatting.
                              </p>
                           </div>
                        </li>
                        <li className="flex items-start gap-3">
                           <Badge variant="outline" className="mt-1 min-w-fit">3</Badge>
                           <div>
                              <p className="font-medium">Organize with Folders</p>
                              <p className="text-sm text-muted-foreground">
                                 Create folders to group related notes and add labels for tagging.
                              </p>
                           </div>
                        </li>
                        <li className="flex items-start gap-3">
                           <Badge variant="outline" className="mt-1 min-w-fit">4</Badge>
                           <div>
                              <p className="font-medium">Enhance with AI</p>
                              <p className="text-sm text-muted-foreground">
                                 Select text and use AI to improve, expand, or format your content.
                              </p>
                           </div>
                        </li>
                        <li className="flex items-start gap-3">
                           <Badge variant="outline" className="mt-1 min-w-fit">5</Badge>
                           <div>
                              <p className="font-medium">Export & Share</p>
                              <p className="text-sm text-muted-foreground">
                                 Export as PDF or publish online to share your notes with others.
                              </p>
                           </div>
                        </li>
                     </ol>
                  </CardContent>
               </Card>
            </section>

            {/* Footer */}
            <footer className="text-center text-sm text-muted-foreground space-y-2 pt-8 border-t border-border">
               <p>Still need help? We're here to support you.</p>
               <div className="flex items-center justify-center gap-4">
                  <Link href="mailto:support@notiva.app" className="hover:text-foreground">
                     Contact Support
                  </Link>
                  <span>•</span>
                  <Link href="/terms" className="hover:text-foreground">
                     Terms of Service
                  </Link>
                  <span>•</span>
                  <Link href="/privacy" className="hover:text-foreground">
                     Privacy Policy
                  </Link>
               </div>
               <div className="pt-2 border-t border-border/50 mt-4">
                  <p className="text-xs">
                     Presented by{" "}
                     <Link 
                        href="https://lunos.tech" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                     >
                        lunos.tech
                     </Link>
                  </p>
               </div>
            </footer>
         </div>
      </div>
   );
}