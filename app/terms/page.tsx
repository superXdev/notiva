import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function TermsPage() {
   return (
      <div className="min-h-screen bg-background p-4">
         <div className="container mx-auto max-w-4xl py-8">
            {/* Header */}
            <div className="mb-8">
               <Button variant="ghost" asChild className="mb-4">
                  <Link href="/login" className="inline-flex items-center">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back to Login
                  </Link>
               </Button>

               <div className="flex items-center justify-center gap-2 mb-6">
                  <Logo width={32} height={32} />
                  <span className="text-2xl font-bold">Notiva</span>
               </div>

               <h1 className="text-3xl font-bold text-center mb-2">
                  Terms of Service
               </h1>
               <p className="text-muted-foreground text-center">
                  Last updated: {new Date().toLocaleDateString()}
               </p>
            </div>

            <Card>
               <CardContent className="prose prose-lg max-w-none dark:prose-invert p-8">
                  <h2>1. Acceptance of Terms</h2>
                  <p>
                     By accessing and using Notiva ("the Service"), you accept
                     and agree to be bound by the terms and provision of this
                     agreement.
                  </p>

                  <h2>2. Description of Service</h2>
                  <p>
                     Notiva is a markdown note-taking application that allows
                     users to create, edit, organize, and share notes. The
                     Service includes features such as AI-powered content
                     enhancement, folder organization, and collaborative
                     sharing.
                  </p>

                  <h2>3. User Accounts</h2>
                  <p>
                     You are responsible for maintaining the confidentiality of
                     your account credentials and for all activities that occur
                     under your account. You must notify us immediately of any
                     unauthorized use of your account.
                  </p>

                  <h2>4. Acceptable Use</h2>
                  <p>You agree not to use the Service to:</p>
                  <ul>
                     <li>Violate any applicable laws or regulations</li>
                     <li>Infringe upon the rights of others</li>
                     <li>
                        Upload or share harmful, offensive, or inappropriate
                        content
                     </li>
                     <li>Attempt to gain unauthorized access to the Service</li>
                     <li>
                        Interfere with the proper functioning of the Service
                     </li>
                  </ul>

                  <h2>5. Content Ownership</h2>
                  <p>
                     You retain ownership of all content you create using the
                     Service. By using the Service, you grant us a limited
                     license to store, process, and display your content solely
                     for the purpose of providing the Service to you.
                  </p>

                  <h2>6. Privacy</h2>
                  <p>
                     Your privacy is important to us. Please review our{" "}
                     <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                     >
                        Privacy Policy
                     </Link>
                     , which also governs your use of the Service.
                  </p>

                  <h2>7. Service Availability</h2>
                  <p>
                     We strive to maintain high availability of the Service, but
                     we do not guarantee uninterrupted access. We may
                     temporarily suspend the Service for maintenance or updates.
                  </p>

                  <h2>8. Limitation of Liability</h2>
                  <p>
                     To the maximum extent permitted by law, Notiva shall not be
                     liable for any indirect, incidental, special,
                     consequential, or punitive damages resulting from your use
                     of the Service.
                  </p>

                  <h2>9. Changes to Terms</h2>
                  <p>
                     We reserve the right to modify these terms at any time. We
                     will notify users of significant changes via email or
                     through the Service. Continued use of the Service after
                     changes constitutes acceptance of the new terms.
                  </p>

                  <h2>10. Contact Information</h2>
                  <p>
                     If you have any questions about these Terms of Service,
                     please contact us at{" "}
                     <a
                        href="mailto:support@notiva.app"
                        className="text-primary hover:underline"
                     >
                        support@notiva.app
                     </a>
                  </p>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
