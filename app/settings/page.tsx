"use client";

import { useState } from "react";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
   Key,
   Eye,
   EyeOff,
   Copy,
   Check,
   RefreshCw,
   Cloud,
   Download,
   Upload,
   Settings,
   Shield,
   Database,
   FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function SettingsPage() {
   const [showApiKey, setShowApiKey] = useState(false);
   const [apiKey, setApiKey] = useState("nt_..."); // Placeholder
   const [isLoading, setIsLoading] = useState(false);

   const [lastBackup, setLastBackup] = useState<string | null>(null);
   const [copied, setCopied] = useState(false);
   const { toast } = useToast();

   const handleCopyApiKey = async () => {
      try {
         await navigator.clipboard.writeText(apiKey);
         setCopied(true);
         toast({
            title: "API Key copied",
            description: "Your API key has been copied to clipboard.",
         });
         setTimeout(() => setCopied(false), 2000);
      } catch (err) {
         toast({
            title: "Failed to copy",
            description: "Could not copy API key to clipboard.",
            variant: "destructive",
         });
      }
   };

   const handleRegenerateApiKey = () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
         setApiKey("nt_" + Math.random().toString(36).substring(2, 15));
         setIsLoading(false);
         toast({
            title: "API Key regenerated",
            description:
               "Your Notes API key has been successfully regenerated.",
         });
      }, 1000);
   };

   const handleBackupNow = () => {
      setIsLoading(true);
      // Simulate backup process
      setTimeout(() => {
         setLastBackup(new Date().toISOString());
         setIsLoading(false);
         toast({
            title: "Backup completed",
            description: "Your notes have been backed up to Google Drive.",
         });
      }, 2000);
   };

   const handleRestoreBackup = () => {
      setIsLoading(true);
      // Simulate restore process
      setTimeout(() => {
         setIsLoading(false);
         toast({
            title: "Restore completed",
            description:
               "Your notes have been restored from the latest backup.",
         });
      }, 2000);
   };

   return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
         {/* Breadcrumb and Back Button */}
         <div className="flex items-center justify-between mb-6">
            <nav>
               <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <li>
                     <Link
                        href="/"
                        className="hover:text-foreground transition-colors"
                     >
                        Home
                     </Link>
                  </li>
                  <li>/</li>
                  <li className="text-foreground">Settings</li>
               </ol>
            </nav>
            <Button asChild variant="outline" size="sm">
               <Link href="/">
                  <FileText className="h-4 w-4 mr-2" />
                  Back to Notes
               </Link>
            </Button>
         </div>

         <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
               <Settings className="h-8 w-8" />
               Settings
            </h1>
            <p className="text-muted-foreground mt-2">
               Manage your API keys and backup preferences
            </p>
         </div>

         <div className="space-y-6">
            {/* API Key Management */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Key className="h-5 w-5" />
                     API Key Management
                  </CardTitle>
                  <CardDescription>
                     Manage your API key for accessing the Notes API
                  </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="api-key">Notes API Key</Label>
                     <div className="flex gap-2">
                        <div className="relative flex-1">
                           <Input
                              id="api-key"
                              type={showApiKey ? "text" : "password"}
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder="Enter your Notes API key"
                              className="pr-20"
                           />
                           <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowApiKey(!showApiKey)}
                           >
                              {showApiKey ? (
                                 <EyeOff className="h-4 w-4" />
                              ) : (
                                 <Eye className="h-4 w-4" />
                              )}
                           </Button>
                        </div>
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={handleCopyApiKey}
                           disabled={copied}
                        >
                           {copied ? (
                              <Check className="h-4 w-4" />
                           ) : (
                              <Copy className="h-4 w-4" />
                           )}
                        </Button>
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={handleRegenerateApiKey}
                           disabled={isLoading}
                        >
                           {isLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                           ) : (
                              <RefreshCw className="h-4 w-4" />
                           )}
                        </Button>
                     </div>
                  </div>

                  <Alert>
                     <Shield className="h-4 w-4" />
                     <AlertDescription>
                        Your Notes API key is encrypted and stored securely.
                        Never share it with others. This key will be used to
                        authenticate API requests to your notes.
                     </AlertDescription>
                  </Alert>

                  <Alert>
                     <Database className="h-4 w-4" />
                     <AlertDescription>
                        <strong>Coming Soon:</strong> Notes API integration is
                        currently in development. This feature will allow you to
                        access your notes programmatically via REST API
                        endpoints.
                     </AlertDescription>
                  </Alert>
               </CardContent>
            </Card>

            {/* Google Drive Backup */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Cloud className="h-5 w-5" />
                     Google Drive Backup
                  </CardTitle>
                  <CardDescription>
                     Automatically backup your notes to Google Drive
                  </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="space-y-4">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                           <div className="space-y-1">
                              <p className="text-sm font-medium">Last Backup</p>
                              <p className="text-sm text-muted-foreground">
                                 {lastBackup
                                    ? new Date(lastBackup).toLocaleString()
                                    : "No backup yet"}
                              </p>
                           </div>
                           <Badge
                              variant={lastBackup ? "default" : "secondary"}
                           >
                              {lastBackup ? "Available" : "Not available"}
                           </Badge>
                        </div>

                        <div className="flex gap-2">
                           <Button
                              onClick={handleBackupNow}
                              disabled={isLoading}
                              className="flex-1"
                           >
                              {isLoading ? (
                                 <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                 <Upload className="h-4 w-4 mr-2" />
                              )}
                              Backup Now
                           </Button>
                           <Button
                              variant="outline"
                              onClick={handleRestoreBackup}
                              disabled={isLoading || !lastBackup}
                           >
                              {isLoading ? (
                                 <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                 <Download className="h-4 w-4 mr-2" />
                              )}
                              Restore
                           </Button>
                        </div>
                     </div>
                  </div>

                  <Alert>
                     <Database className="h-4 w-4" />
                     <AlertDescription>
                        <strong>Coming Soon:</strong> Google Drive integration
                        is currently in development. This feature will allow you
                        to automatically backup and sync your notes across
                        devices.
                     </AlertDescription>
                  </Alert>
               </CardContent>
            </Card>

            <Separator />

            {/* Feature Status */}
            <Card>
               <CardHeader>
                  <CardTitle>Feature Status</CardTitle>
                  <CardDescription>
                     Current status of planned features
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Key className="h-4 w-4" />
                           <span>Notes API Key Management</span>
                        </div>
                        <Badge variant="secondary">Coming Soon</Badge>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Cloud className="h-4 w-4" />
                           <span>Google Drive Backup</span>
                        </div>
                        <Badge variant="secondary">Planned</Badge>
                     </div>

                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Settings className="h-4 w-4" />
                           <span>Custom Themes</span>
                        </div>
                        <Badge variant="secondary">Planned</Badge>
                     </div>
                  </div>
               </CardContent>
            </Card>

         </div>
      </div>
   );
}
