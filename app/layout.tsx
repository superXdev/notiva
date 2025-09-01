import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NotesProvider } from "@/contexts/notes-context";

export const metadata: Metadata = {
   title: "Notiva - Your Personal Note-Taking Platform",
   description:
      "A powerful markdown note-taking platform with folders, labels, and PDF export",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" suppressHydrationWarning>
         <body
            className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
         >
            <ThemeProvider>
               <NotesProvider>{children}</NotesProvider>
            </ThemeProvider>
         </body>
      </html>
   );
}
