"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Copy, Trash2, Calendar, Key, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { apiKeysApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  status: string;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  scopes?: string[];
}

interface CreateApiKeyResponse extends ApiKey {
  key: string; // Full key only shown on creation
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKey, setNewKey] = useState<CreateApiKeyResponse | null>(null);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const data = await apiKeysApi.list();
      setApiKeys(data);
      console.log('api key data', data)
    } catch (error: any) {
      console.error("Failed to fetch API keys:", error);
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    try {
      setIsCreating(true);
      const created = await apiKeysApi.create({ name: keyName.trim() });
      setNewKey(created);
      setShowNewKeyDialog(true);
      setKeyName("");
      await fetchApiKeys();
    } catch (error: any) {
      console.error("Failed to create API key:", error);
      toast.error(error.response?.data?.message || "Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!deleteKeyId) return;

    try {
      setIsDeleting(true);
      await apiKeysApi.delete(deleteKeyId);
      setApiKeys(apiKeys.filter((k) => k.id !== deleteKeyId));
      setDeleteKeyId(null);
      toast.success("API key deleted");
    } catch (error: any) {
      console.error("Failed to delete API key:", error);
      toast.error("Failed to delete API key");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Create and manage API keys for programmatic access to INVERX APIs.
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteKeyId} onOpenChange={(open) => !open && setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The API key will be permanently deleted and any applications using it will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteKey} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Key Created Dialog */}
      {newKey && (
        <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
              <DialogDescription>
                Copy this key and store it securely. You won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Save this key now. You won't see it again.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Key Name</Label>
                <div className="font-mono text-sm bg-muted p-3 rounded-lg text-foreground break-all">
                  {newKey.name}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Full API Key</Label>
                <div className="relative">
                  <div className="font-mono text-sm bg-muted p-3 rounded-lg text-foreground break-all pr-10">
                    {newKey.key}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-8 w-8 p-0"
                    onClick={() => {
                      copyToClipboard(newKey.key);
                      toast.success("API key copied to clipboard!");
                    }}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Usage Example</Label>
                <div className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                  <code>{`curl -H "Authorization: Bearer ${newKey.key}" https://api.inverx.pro/domains`}</code>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowNewKeyDialog(false);
                  setNewKey(null);
                }}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-6">
        {/* Create Key Card */}
        <Card className="bg-surface-dark border-surface-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key size={20} />
              Create New API Key
            </CardTitle>
            <CardDescription>
              Generate a new API key for programmatic access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyName" className="text-white">
                Key Name
              </Label>
              <Input
                id="keyName"
                placeholder="e.g., Testing, Production, CI/CD"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                disabled={isCreating}
                className="bg-background-dark border-surface-border text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateKey();
                }}
              />
            </div>
            <Button
              onClick={handleCreateKey}
              disabled={isCreating || !keyName.trim()}
              className="w-full"
            >
              <Plus size={18} className="mr-2" />
              {isCreating ? "Creating..." : "Create API Key"}
            </Button>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card className="bg-surface-dark border-surface-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key size={20} />
              Your API Keys
            </CardTitle>
            <CardDescription>
              {apiKeys.length} active key{apiKeys.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading API keys...
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No API keys created yet
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 bg-background-dark rounded-lg border border-surface-border/50 hover:border-surface-border transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white truncate">{key.name}</p>
                        <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0">
                          {key.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <p className="font-mono">
                          {key.keyPrefix}...
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            Created: {new Date(key.createdAt).toLocaleDateString()}
                          </div>
                          {key.lastUsedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle size={12} />
                              Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                            </div>
                          )}
                          {key.expiresAt && (
                            <div className="flex items-center gap-1">
                              <AlertCircle size={12} />
                              Expires: {new Date(key.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteKeyId(key.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentation Card */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <AlertCircle size={20} />
              Usage Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-blue-300">
            <p>
              Use your API key to authenticate requests to the INVERX API. Include it in the <code className="bg-blue-500/10 px-2 py-1 rounded">Authorization</code> header:
            </p>
            <div className="bg-background-dark border border-surface-border rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <code>curl -H "Authorization: Bearer YOUR_API_KEY" https://api.inverx.pro/...</code>
            </div>
            <ul className="list-disc list-inside space-y-2">
              <li>API keys are sensitive — treat them like passwords</li>
              <li>Keys starting with <code className="bg-blue-500/10 px-1 rounded">inv_</code> are production keys</li>
              <li>Delete keys you no longer use</li>
              <li>Rotate keys periodically for security</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
