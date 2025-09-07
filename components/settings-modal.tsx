"use client";

import { useState } from "react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
   X,
   User,
   Bell,
   Palette,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
   isOpen: boolean;
   onClose: () => void;
}

type SettingsSection =
   | "general"
   | "api"
   | "backup"
   | "notifications"
   | "appearance";

const settingsSections = [
   {
      id: "general" as SettingsSection,
      title: "General",
      icon: Settings,
      description: "Basic settings and preferences",
   },
   {
      id: "api" as SettingsSection,
      title: "API Keys",
      icon: Key,
      description: "Manage your API keys",
   },
   {
      id: "backup" as SettingsSection,
      title: "Backup & Sync",
      icon: Cloud,
      description: "Backup and sync settings",
   },
   {
      id: "notifications" as SettingsSection,
      title: "Notifications",
      icon: Bell,
      description: "Notification preferences",
   },
   {
      id: "appearance" as SettingsSection,
      title: "Appearance",
      icon: Palette,
      description: "Theme and display settings",
   },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
   const [activeSection, setActiveSection] =
      useState<SettingsSection>("general");
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

   const renderSectionContent = () => {
      switch (activeSection) {
         case "general":
            return (
               <div className="space-y-6">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <User className="h-5 w-5" />
                           Profile Settings
                        </CardTitle>
                        <CardDescription>
                           Manage your profile information
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="display-name">Display Name</Label>
                           <Input
                              id="display-name"
                              placeholder="Enter your display name"
                              defaultValue="User"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="email">Email</Label>
                           <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              defaultValue="user@example.com"
                              disabled
                           />
                        </div>
                        <Button>Save Changes</Button>
                     </CardContent>
                  </Card>
               </div>
            );

         case "api":
            return (
               <div className="space-y-6">
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
                              Your Notes API key is encrypted and stored
                              securely. Never share it with others. This key
                              will be used to authenticate API requests to your
                              notes.
                           </AlertDescription>
                        </Alert>

                        <Alert>
                           <Database className="h-4 w-4" />
                           <AlertDescription>
                              <strong>Coming Soon:</strong> Notes API
                              integration is currently in development. This
                              feature will allow you to access your notes
                              programmatically via REST API endpoints.
                           </AlertDescription>
                        </Alert>
                     </CardContent>
                  </Card>
               </div>
            );

         case "backup":
            return (
               <div className="space-y-6">
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
                           <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                              <div className="space-y-1">
                                 <p className="text-sm font-medium">
                                    Last Backup
                                 </p>
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

                        <Alert>
                           <Database className="h-4 w-4" />
                           <AlertDescription>
                              <strong>Coming Soon:</strong> Google Drive
                              integration is currently in development. This
                              feature will allow you to automatically backup and
                              sync your notes across devices.
                           </AlertDescription>
                        </Alert>
                     </CardContent>
                  </Card>
               </div>
            );

         case "notifications":
            return (
               <div className="space-y-6">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Bell className="h-5 w-5" />
                           Notification Preferences
                        </CardTitle>
                        <CardDescription>
                           Configure how you receive notifications
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-medium">
                                    Email Notifications
                                 </p>
                                 <p className="text-sm text-muted-foreground">
                                    Receive notifications via email
                                 </p>
                              </div>
                              <Button variant="outline" size="sm">
                                 Enable
                              </Button>
                           </div>
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-medium">
                                    Browser Notifications
                                 </p>
                                 <p className="text-sm text-muted-foreground">
                                    Show browser notifications
                                 </p>
                              </div>
                              <Button variant="outline" size="sm">
                                 Enable
                              </Button>
                           </div>
                        </div>
                        <Alert>
                           <Bell className="h-4 w-4" />
                           <AlertDescription>
                              <strong>Coming Soon:</strong> Notification system
                              is currently in development. You'll be able to
                              configure various notification preferences here.
                           </AlertDescription>
                        </Alert>
                     </CardContent>
                  </Card>
               </div>
            );

         case "appearance":
            return (
               <div className="space-y-6">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Palette className="h-5 w-5" />
                           Theme & Appearance
                        </CardTitle>
                        <CardDescription>
                           Customize the look and feel of the application
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-medium">Theme</p>
                                 <p className="text-sm text-muted-foreground">
                                    Choose your preferred theme
                                 </p>
                              </div>
                              <Button variant="outline" size="sm">
                                 System
                              </Button>
                           </div>
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-medium">
                                    Font Size
                                 </p>
                                 <p className="text-sm text-muted-foreground">
                                    Adjust the text size
                                 </p>
                              </div>
                              <Button variant="outline" size="sm">
                                 Medium
                              </Button>
                           </div>
                        </div>
                        <Alert>
                           <Palette className="h-4 w-4" />
                           <AlertDescription>
                              <strong>Coming Soon:</strong> Advanced theming
                              options are currently in development. You'll be
                              able to customize colors, fonts, and layouts.
                           </AlertDescription>
                        </Alert>
                     </CardContent>
                  </Card>
               </div>
            );

         default:
            return null;
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-7xl w-[95vw] sm:w-[90vw] sm:max-w-7xl md:w-[85vw] lg:w-[80vw] xl:w-[75vw] 2xl:w-[70vw] h-[90vh] p-0" showCloseButton={false}>
            <div className="flex flex-col sm:flex-row h-full">
               {/* Sidebar */}
               <div className="w-full sm:w-64 md:w-72 lg:w-80 border-b sm:border-b-0 sm:border-r border-border bg-muted/30 flex flex-col">
                  <div className="p-6 border-b border-border">
                     <DialogTitle className="text-xl font-semibold">
                        Settings
                     </DialogTitle>
                  </div>
                  <ScrollArea className="flex-1">
                     <div className="p-4 space-y-1">
                        {settingsSections.map((section) => {
                           const Icon = section.icon;
                           return (
                              <Button
                                 key={section.id}
                                 variant={
                                    activeSection === section.id
                                       ? "secondary"
                                       : "ghost"
                                 }
                                 className={cn(
                                    "w-full justify-start h-auto p-3",
                                    activeSection === section.id &&
                                       "bg-secondary"
                                 )}
                                 onClick={() => setActiveSection(section.id)}
                              >
                                 <div className="flex items-center gap-3">
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    <div className="text-left min-w-0">
                                       <div className="font-medium text-sm">
                                          {section.title}
                                       </div>
                                       <div className="text-xs text-muted-foreground hidden sm:block">
                                          {section.description}
                                       </div>
                                    </div>
                                 </div>
                              </Button>
                           );
                        })}
                     </div>
                  </ScrollArea>
               </div>

               {/* Main Content */}
               <div className="flex-1 flex flex-col">
                  <div className="p-6 border-b border-border">
                     <div className="flex items-center justify-between">
                        <div>
                           <h2 className="text-2xl font-semibold">
                              {
                                 settingsSections.find(
                                    (s) => s.id === activeSection
                                 )?.title
                              }
                           </h2>
                           <p className="text-muted-foreground">
                              {
                                 settingsSections.find(
                                    (s) => s.id === activeSection
                                 )?.description
                              }
                           </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                           <X className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
                  <ScrollArea className="flex-1">
                     <div className="p-6">{renderSectionContent()}</div>
                  </ScrollArea>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}
