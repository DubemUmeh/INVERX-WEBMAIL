"use client";

import React, { useState } from "react";
import { Mail, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { domainsApi } from "@/lib/api/domains";
import { toast } from "sonner";

interface CreateAddressDialogProps {
  domainId: string;
  domainName: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function CreateAddressDialog({ domainId, domainName, onSuccess, trigger }: CreateAddressDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localPart, setLocalPart] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPart) return;

    try {
      setIsLoading(true);
      await domainsApi.createAddress(domainId, {
        localPart,
        domainId
      });
      toast.success("Address created successfully");
      setOpen(false);
      setLocalPart("");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-blue-600 text-white">
            <Plus size={16} className="mr-2" />
            Create Address
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-surface-dark border-surface-border text-white">
        <DialogHeader>
          <DialogTitle>Create Address</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Create a new email address for {domainName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <div className="flex items-center">
              <Input
                id="email"
                placeholder="contact"
                value={localPart}
                onChange={(e) => setLocalPart(e.target.value)}
                className="bg-background-dark border-surface-border text-white rounded-r-none focus-visible:ring-primary"
                autoFocus
              />
              <div className="bg-surface-light border border-l-0 border-surface-border px-3 py-2 text-sm text-text-secondary rounded-r-md h-10 flex items-center">
                @{domainName}
              </div>
            </div>
            <p className="text-xs text-text-secondary">
              This address will be able to send and receive emails.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-surface-border text-white hover:bg-surface-hover"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-blue-600 text-white"
              disabled={isLoading || !localPart}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
