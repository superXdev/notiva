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

export default function PrivacyPage() {
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
                  Privacy Policy
               </h1>
               <p className="text-muted-foreground text-center">
                  Last updated: {new Date().toLocaleDateString()}
               </p>
            </div>

            <Card>
               <CardContent className="prose prose-lg max-w-none dark:prose-invert p-8">
                  <h2>1. Information We Collect</h2>
                  <p>
                     We collect information you provide directly to us, such as
                     when you create an account, create notes, or contact us for
                     support.
                  </p>

                  <h3>Account Information</h3>
                  <ul>
                     <li>
                        Email address (for authentication and communication)
                     </li>
                     <li>Name and profile information (if provided)</li>
                     <li>
                        Authentication tokens from third-party providers
                        (Google)
                     </li>
                  </ul>

                  <h3>Content and Usage Data</h3>
                  <ul>
                     <li>Notes, folders, and labels you create</li>
                     <li>AI enhancement requests and responses</li>
                     <li>Usage patterns and preferences</li>
                     <li>Device and browser information</li>
                  </ul>

                  <h2>2. How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul>
                     <li>Provide, maintain, and improve our services</li>
                     <li>Process your AI enhancement requests</li>
                     <li>Send you important updates and notifications</li>
                     <li>Respond to your support requests</li>
                     <li>Ensure the security and integrity of our service</li>
                     <li>Comply with legal obligations</li>
                  </ul>

                  <h2>3. Information Sharing</h2>
                  <p>
                     We do not sell, trade, or otherwise transfer your personal
                     information to third parties, except in the following
                     circumstances:
                  </p>
                  <ul>
                     <li>
                        <strong>Service Providers:</strong> We may share data
                        with trusted third-party services that help us operate
                        our service (e.g., hosting providers, AI services)
                     </li>
                     <li>
                        <strong>Legal Requirements:</strong> We may disclose
                        information if required by law or to protect our rights
                        and safety
                     </li>
                     <li>
                        <strong>Business Transfers:</strong> In the event of a
                        merger or acquisition, user information may be
                        transferred
                     </li>
                  </ul>

                  <h2>4. Data Security</h2>
                  <p>
                     We implement appropriate security measures to protect your
                     personal information:
                  </p>
                  <ul>
                     <li>Encryption of data in transit and at rest</li>
                     <li>Regular security assessments and updates</li>
                     <li>Access controls and authentication</li>
                     <li>Secure data centers and infrastructure</li>
                  </ul>

                  <h2>5. AI and Content Processing</h2>
                  <p>
                     When you use our AI enhancement features, your content is
                     processed by third-party AI services to provide
                     improvements. This processing is done securely and in
                     accordance with our data protection standards.
                  </p>

                  <h2>6. Data Retention</h2>
                  <p>
                     We retain your information for as long as your account is
                     active or as needed to provide services. You may request
                     deletion of your account and associated data at any time.
                  </p>

                  <h2>7. Your Rights</h2>
                  <p>You have the right to:</p>
                  <ul>
                     <li>Access and download your personal data</li>
                     <li>Correct inaccurate information</li>
                     <li>Request deletion of your account and data</li>
                     <li>Opt out of certain communications</li>
                     <li>Export your notes and content</li>
                  </ul>

                  <h2>8. Cookies and Tracking</h2>
                  <p>
                     We use cookies and similar technologies to improve your
                     experience, analyze usage, and provide personalized
                     features. You can control cookie settings through your
                     browser preferences.
                  </p>

                  <h2>9. Children's Privacy</h2>
                  <p>
                     Our service is not intended for children under 13 years of
                     age. We do not knowingly collect personal information from
                     children under 13.
                  </p>

                  <h2>10. International Data Transfers</h2>
                  <p>
                     Your information may be transferred to and processed in
                     countries other than your own. We ensure appropriate
                     safeguards are in place to protect your data.
                  </p>

                  <h2>11. Changes to This Policy</h2>
                  <p>
                     We may update this Privacy Policy from time to time. We
                     will notify you of significant changes via email or through
                     the service.
                  </p>

                  <h2>12. Contact Us</h2>
                  <p>
                     If you have any questions about this Privacy Policy or our
                     data practices, please contact us at{" "}
                     <a
                        href="mailto:privacy@notiva.app"
                        className="text-primary hover:underline"
                     >
                        privacy@notiva.app
                     </a>
                  </p>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
