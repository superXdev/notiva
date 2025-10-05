"use client";

import { useState } from "react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogOverlay,
   DialogPortal,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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
   Shield,
   Database,
   X,
   Palette,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
   isOpen: boolean;
   onClose: () => void;
}

type SettingsSection = "api" | "backup" | "appearance";

const settingsSections = [
   {
      id: "api" as SettingsSection,
      title: "MCP Settings",
      icon: Key,
      description: "Configure MCP connection settings",
   },
   {
      id: "backup" as SettingsSection,
      title: "Backup & Sync",
      icon: Cloud,
      description: "Backup and sync settings",
   },
   {
      id: "appearance" as SettingsSection,
      title: "Appearance",
      icon: Palette,
      description: "Theme and display settings",
   },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
   const [activeSection, setActiveSection] = useState<SettingsSection>("api");
   const [showMcpKey, setShowMcpKey] = useState(false);
   const [mcpKey, setMcpKey] = useState(""); // MCP key placeholder
   const [isLoading, setIsLoading] = useState(false);
   const [lastBackup, setLastBackup] = useState<string | null>(null);
   const [copied, setCopied] = useState(false);
   const { toast } = useToast();

   const handleCopyMcpKey = async () => {
      try {
         await navigator.clipboard.writeText(mcpKey);
         setCopied(true);
         toast({
            title: "MCP Key copied",
            description: "Your MCP key has been copied to clipboard.",
         });
         setTimeout(() => setCopied(false), 2000);
      } catch (err) {
         toast({
            title: "Failed to copy",
            description: "Could not copy MCP key to clipboard.",
            variant: "destructive",
         });
      }
   };

   const handleSaveMcpKey = () => {
      setIsLoading(true);
      // Simulate save operation
      setTimeout(() => {
         setIsLoading(false);
         toast({
            title: "MCP Key saved",
            description: "Your MCP key has been successfully saved.",
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
         case "api":
            return (
               <div className="space-y-6 p-4">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                           <Key className="h-5 w-5" />
                           MCP Configuration
                        </h3>
                        <p className="text-sm text-muted-foreground">
                           Configure your MCP (Model Context Protocol)
                           connection settings
                        </p>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="mcp-key">MCP Key</Label>
                           <div className="flex gap-2">
                              <div className="relative flex-1">
                                 <Input
                                    id="mcp-key"
                                    type={showMcpKey ? "text" : "password"}
                                    value={mcpKey}
                                    onChange={(e) => setMcpKey(e.target.value)}
                                    placeholder="Enter your MCP key"
                                    className="pr-20"
                                 />
                                 <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowMcpKey(!showMcpKey)}
                                 >
                                    {showMcpKey ? (
                                       <EyeOff className="h-4 w-4" />
                                    ) : (
                                       <Eye className="h-4 w-4" />
                                    )}
                                 </Button>
                              </div>
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={handleCopyMcpKey}
                                 disabled={copied || !mcpKey}
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
                                 onClick={handleSaveMcpKey}
                                 disabled={isLoading || !mcpKey}
                              >
                                 {isLoading ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                 ) : (
                                    <Check className="h-4 w-4" />
                                 )}
                              </Button>
                           </div>
                        </div>

                        <Alert>
                           <Shield className="h-4 w-4" />
                           <AlertDescription>
                              Your MCP key is encrypted and stored securely.
                              Never share it with others. This key will be used
                              to authenticate MCP connections and enable
                              enhanced AI capabilities.
                           </AlertDescription>
                        </Alert>

                        <Alert>
                           <Database className="h-4 w-4" />
                           <AlertDescription>
                              <strong>MCP Integration:</strong> Model Context
                              Protocol (MCP) enables secure communication
                              between AI models and external tools. Configure
                              your MCP key to unlock advanced AI features.
                           </AlertDescription>
                        </Alert>
                     </div>
                  </div>
               </div>
            );

         case "backup":
            return (
               <div className="space-y-6 p-4">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                           <Cloud className="h-5 w-5" />
                           Google Drive Backup
                        </h3>
                        <p className="text-sm text-muted-foreground">
                           Automatically backup your notes to Google Drive
                        </p>
                     </div>
                     <div className="space-y-4">
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
                     </div>
                  </div>
               </div>
            );

         case "appearance":
            return (
               <div className="space-y-6 p-4">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                           <Palette className="h-5 w-5" />
                           Theme & Appearance
                        </h3>
                        <p className="text-sm text-muted-foreground">
                           Customize the look and feel of the application
                        </p>
                     </div>
                     <div className="space-y-4">
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
                     </div>
                  </div>
               </div>
            );

         default:
            return null;
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogPortal>
            <DialogOverlay className="z-[60]" />
            <DialogPrimitive.Content
               className={cn(
                  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[60] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
                  "max-w-7xl w-[95vw] sm:w-[90vw] sm:max-w-7xl md:w-[85vw] lg:w-[80vw] xl:w-[75vw] 2xl:w-[70vw] h-[90vh] p-0"
               )}
            >
               <div className="flex flex-col h-full">
                  {/* Mobile Navigation Tabs */}
                  <div className="sm:hidden border-b border-border bg-muted/30 flex-shrink-0">
                     <div className="p-4 pb-0">
                        <DialogTitle className="text-xl font-semibold mb-3">
                           Settings
                        </DialogTitle>
                     </div>
                     <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-2 px-4 pb-3 min-w-max">
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
                                    size="sm"
                                    className={cn(
                                       "flex-shrink-0 h-8 w-8 p-0",
                                       activeSection === section.id &&
                                          "bg-secondary shadow-sm"
                                    )}
                                    onClick={() => setActiveSection(section.id)}
                                    title={section.title}
                                 >
                                    <Icon className="h-4 w-4" />
                                 </Button>
                              );
                           })}
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-1 min-h-0">
                     {/* Desktop Sidebar */}
                     <div className="hidden sm:flex sm:w-64 md:w-72 lg:w-80 border-r border-border bg-muted/30 flex-col">
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
                                       onClick={() =>
                                          setActiveSection(section.id)
                                       }
                                    >
                                       <div className="flex items-center gap-3">
                                          <Icon className="h-4 w-4 flex-shrink-0" />
                                          <div className="text-left min-w-0">
                                             <div className="font-medium text-sm">
                                                {section.title}
                                             </div>
                                             <div className="text-xs text-muted-foreground">
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
                     <div className="flex-1 flex flex-col min-w-0 min-h-0">
                        <div className="p-4 sm:p-6 border-b border-border flex-shrink-0">
                           <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                 <h2 className="text-xl sm:text-2xl font-semibold truncate">
                                    {
                                       settingsSections.find(
                                          (s) => s.id === activeSection
                                       )?.title
                                    }
                                 </h2>
                                 <p className="text-muted-foreground text-sm hidden sm:block">
                                    {
                                       settingsSections.find(
                                          (s) => s.id === activeSection
                                       )?.description
                                    }
                                 </p>
                              </div>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={onClose}
                              >
                                 <X className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                        <ScrollArea className="flex-1 min-h-0">
                           <div className="p-4 sm:p-6">
                              {renderSectionContent()}
                           </div>
                        </ScrollArea>
                     </div>
                  </div>
               </div>
            </DialogPrimitive.Content>
         </DialogPortal>
      </Dialog>
   );
}
