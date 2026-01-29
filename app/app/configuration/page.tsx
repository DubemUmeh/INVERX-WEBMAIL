"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ActivityShell from "@/components/layout/activity-shell";
import { 
  Save, 
  Server, 
  Mail, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Info
} from 'lucide-react';
import { smtpApi, SmtpConfig, SmtpEncryption, CreateSmtpConfigDto } from "@/lib/api/smtp";
import { toast } from "sonner";

export default function ConfigurationPage() {
  // SMTP configurations list
  const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state for add/edit
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: 587,
    username: "",
    password: "",
    encryption: "STARTTLS" as SmtpEncryption,
    requireTls: true,
    timeoutSeconds: 30,
    fromEmail: "",
    fromName: "",
    isDefault: false,
  });
  
  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  
  // Email defaults
  const [openTracking, setOpenTracking] = useState(true);
  const [clickTracking, setClickTracking] = useState(true);

  useEffect(() => {
    fetchSmtpConfigs();
  }, []);

  const fetchSmtpConfigs = async () => {
    try {
      setIsLoading(true);
      const configs = await smtpApi.getAll();
      setSmtpConfigs(configs);
    } catch (error) {
      console.error("Failed to fetch SMTP configs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      host: "",
      port: 587,
      username: "",
      password: "",
      encryption: "STARTTLS",
      requireTls: true,
      timeoutSeconds: 30,
      fromEmail: "",
      fromName: "",
      isDefault: false,
    });
    setEditingId(null);
    setIsEditing(false);
    setShowAddForm(false);
  };

  const handleEditConfig = (config: SmtpConfig) => {
    setFormData({
      name: config.name,
      host: config.host,
      port: config.port,
      username: config.username || "",
      password: "", // Don't prefill password
      encryption: config.encryption,
      requireTls: config.requireTls,
      timeoutSeconds: config.timeoutSeconds,
      fromEmail: config.fromEmail,
      fromName: config.fromName || "",
      isDefault: config.isDefault,
    });
    setEditingId(config.id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleSaveConfig = async () => {
    // Basic validation
    if (!formData.name || !formData.host || !formData.port || !formData.fromEmail) {
      toast.error("Please fill in all required fields (Name, Host, Port, From Email)");
      return;
    }
    if (formData.timeoutSeconds < 5 || formData.timeoutSeconds > 120) {
      toast.error("Timeout must be between 5 and 120 seconds");
      return;
    }

    setIsSaving(true);

    const promise = (async () => {
      if (editingId) {
        // Update existing
        const updateData: any = {
          name: formData.name,
          host: formData.host,
          port: formData.port,
          username: formData.username || undefined,
          encryption: formData.encryption,
          requireTls: formData.requireTls,
          timeoutSeconds: formData.timeoutSeconds,
          fromEmail: formData.fromEmail,
          fromName: formData.fromName || undefined,
          isDefault: formData.isDefault,
        };
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        await smtpApi.update(editingId, updateData);
      } else {
        // Create new
        const createData: CreateSmtpConfigDto = {
          name: formData.name,
          host: formData.host,
          port: formData.port,
          username: formData.username || undefined,
          password: formData.password || undefined,
          encryption: formData.encryption,
          requireTls: formData.requireTls,
          timeoutSeconds: formData.timeoutSeconds,
          fromEmail: formData.fromEmail,
          fromName: formData.fromName || undefined,
          isDefault: formData.isDefault,
        };
        await smtpApi.create(createData);
      }
      resetForm();
      fetchSmtpConfigs();
    })();

    toast.promise(promise, {
      loading: isEditing ? 'Updating configuration...' : 'Creating configuration...',
      success: isEditing ? 'SMTP configuration updated' : 'SMTP configuration created',
      error: (err: any) => {
        // Handle specific API errors
        // Axios error structure: err.response.data.message or err.message
        const errorMessage = err.response?.data?.message || err.message || "Failed to save configuration";
        
        // If it's an array of messages (class-validator), join them
        if (Array.isArray(errorMessage)) {
          return errorMessage.join(', ');
        }
        return errorMessage;
      },
    });

    try {
      await promise;
    } catch (error) {
      // Error is handled by toast.promise
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      await smtpApi.delete(id);
      toast.success("SMTP configuration deleted");
      fetchSmtpConfigs();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete configuration");
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const result = await smtpApi.testConnection(id);
      if (result.success) {
        toast.success("Connection successful!");
      } else {
        toast.error(result.message || "Connection failed");
      }
      fetchSmtpConfigs(); // Refresh to get updated test result
    } catch (error: any) {
      toast.error(error.message || "Connection test failed");
    } finally {
      setTestingId(null);
    }
  };

  const handleEncryptionChange = (value: SmtpEncryption) => {
    setFormData({
      ...formData,
      encryption: value,
      port: smtpApi.getRecommendedPort(value),
    });
  };

  // Different background styles for view vs edit mode
  const inputBgClass = showAddForm 
    ? "bg-[#0a0a0a] border-primary/30" 
    : "bg-[#111111] border-border-dark";

  return (
    <ActivityShell>
      <header className="shrink-0 border-b border-border-dark bg-background-dark z-10 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mx-5">
          <div>
            <h2 className="text-white text-2xl font-bold tracking-tight mb-1">Configuration</h2>
            <p className="text-text-secondary text-sm">System-wide settings and preferences.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* SMTP Settings */}
        <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 border-b border-border-dark pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Server size={22} />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">SMTP Configuration</h3>
                <p className="text-text-secondary text-sm">Configure your outbound mail server settings.</p>
              </div>
            </div>
            {!showAddForm && (
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="bg-primary hover:bg-primary/90 text-accent"
              >
                <Plus size={16} className="mr-2" />
                Add SMTP
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-lg border border-border-dark bg-[#0a0a0a]">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Existing Configurations List */}
              {smtpConfigs.length > 0 && !showAddForm && (
                <div className="space-y-3 mb-6">
                  {smtpConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border-dark bg-[#111111] hover:bg-[#151515] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${config.lastTestResult === 'success' ? 'bg-green-500/10 text-green-400' : config.lastTestResult === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-neutral-500/10 text-neutral-400'}`}>
                          {config.lastTestResult === 'success' ? <Wifi size={18} /> : config.lastTestResult === 'failed' ? <WifiOff size={18} /> : <Server size={18} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{config.name}</h4>
                            {config.isDefault && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-text-secondary text-sm">{config.fromEmail}</p>
                          <p className="text-text-secondary text-xs">{config.host}:{config.port} • {config.encryption}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestConnection(config.id)}
                          disabled={testingId === config.id}
                          className="text-text-secondary hover:text-white"
                        >
                          {testingId === config.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              <Wifi size={16} className="mr-1" />
                              Test
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditConfig(config)}
                          className="text-text-secondary hover:text-white"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete SMTP Configuration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{config.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteConfig(config.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Form */}
              {showAddForm && (
                <div className={`p-5 rounded-lg border ${isEditing ? 'border-primary/40 bg-primary/5' : 'border-border-dark bg-[#0a0a0a]'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">
                      {isEditing ? 'Edit SMTP Configuration' : 'New SMTP Configuration'}
                    </h4>
                    <Button variant="ghost" size="sm" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">Configuration Name</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">A friendly name to identify this server configuration (e.g., "Company Gmail", "Marketing Server").</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <input
                          type="text"
                          className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${inputBgClass}`}
                          placeholder="My SMTP Server"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      {/* From Email */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">From Email Address</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">The email address you will be sending from. Must match your SMTP credentials.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <input
                          type="email"
                          className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${inputBgClass}`}
                          placeholder="noreply@yourdomain.com"
                          value={formData.fromEmail}
                          onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                        />
                      </div>

                      {/* From Name */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">From Display Name</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">The name recipients will see as the sender (e.g., "Acme Support").</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <input
                          type="text"
                          className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${inputBgClass}`}
                          placeholder="Your Company"
                          value={formData.fromName}
                          onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                        />
                      </div>

                      {/* Host */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">SMTP Host</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">The address of your SMTP server (e.g., smtp.gmail.com, mail.example.com).</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <input
                          type="text"
                          className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${inputBgClass}`}
                          placeholder="smtp.yourdomain.com"
                          value={formData.host}
                          onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        />
                      </div>

                      {/* Port */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">Port</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">Connection port. 587 (STARTTLS) or 465 (SSL/TLS) are recommended.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <input
                          type="number"
                          className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${inputBgClass}`}
                          value={formData.port}
                          onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 587 })}
                        />
                      </div>

                      {/* Encryption */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">Encryption</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">Security protocol. STARTTLS upgrades an insecure connection, SSL/TLS is secure from the start.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={formData.encryption} onValueChange={handleEncryptionChange}>
                          <SelectTrigger className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm focus:ring-primary focus:ring-offset-0 h-auto ${inputBgClass}`}>
                            <SelectValue placeholder="Select Encryption" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STARTTLS">STARTTLS (Recommended)</SelectItem>
                            <SelectItem value="SSL_TLS">SSL/TLS</SelectItem>
                            <SelectItem value="NONE">None (Unsafe)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Username */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">Username</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">Your SMTP username, usually your full email address.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <input
                          type="text"
                          className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${inputBgClass}`}
                          placeholder="your-username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">
                            Password {isEditing && <span className="text-neutral-500">(leave blank to keep current)</span>}
                          </label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">Your SMTP password. If using Gmail or similar, you need to generate an App Password.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <input
                          type="password"
                          className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${inputBgClass}`}
                          placeholder={isEditing ? "••••••••" : "Enter password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>

                      {/* Timeout */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">Timeout (seconds)</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">Maximum time to wait for the server to connect or respond before failing.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <input
                          type="number"
                          min={5}
                          max={120}
                          className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${inputBgClass}`}
                          value={formData.timeoutSeconds}
                          onChange={(e) => setFormData({ ...formData, timeoutSeconds: parseInt(e.target.value) || 30 })}
                        />
                        <p className="text-xs text-text-secondary mt-1">Min: 5s, Max: 120s</p>
                      </div>

                      {/* Require TLS & Default */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={formData.requireTls}
                            onCheckedChange={(checked) => setFormData({ ...formData, requireTls: checked })}
                          />
                          <span className="text-sm text-text-secondary">Require TLS</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">Enforce strict TLS security. Only disable if your server has certificate issues (not recommended).</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={formData.isDefault}
                            onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                          />
                          <span className="text-sm text-text-secondary">Set as Default</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={12} className="text-neutral-500 cursor-help hover:text-neutral-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">Automatically use this SMTP configuration for all outbound emails.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>

                  {/* Security Warning for NONE encryption */}
                  {formData.encryption === 'NONE' && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                      <AlertTriangle className="text-red-400 mt-0.5" size={18} />
                      <div>
                        <p className="text-red-400 text-sm font-medium">Security Warning</p>
                        <p className="text-red-300/70 text-xs">Sending without encryption exposes your credentials and email content. Only use for internal/testing environments.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-dark">
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveConfig}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90 text-accent"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          {isEditing ? 'Save Changes' : 'Create Configuration'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {smtpConfigs.length === 0 && !showAddForm && (
                <div className="text-center py-12">
                  <Server className="mx-auto text-neutral-500 mb-4" size={48} />
                  <h4 className="text-white font-medium mb-2">No SMTP Configurations</h4>
                  <p className="text-text-secondary text-sm mb-4">Add an SMTP server to send emails directly without AWS SES.</p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-primary hover:bg-primary/90 text-accent"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Your First SMTP
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Email Defaults */}
        <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-border-dark pb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="text-white text-lg font-bold">Email Defaults</h3>
              <p className="text-text-secondary text-sm">Default settings for new messages and tracking.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-border-dark">
              <div>
                <h4 className="text-white text-sm font-medium">Open Tracking</h4>
                <p className="text-text-secondary text-xs mt-0.5">Automatically track email opens.</p>
              </div>
              <Switch checked={openTracking} onCheckedChange={setOpenTracking} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-border-dark">
              <div>
                <h4 className="text-white text-sm font-medium">Click Tracking</h4>
                <p className="text-text-secondary text-xs mt-0.5">Track clicks on links within your emails.</p>
              </div>
              <Switch checked={clickTracking} onCheckedChange={setClickTracking} />
            </div>
          </div>
        </section>
      </div>
    </ActivityShell>
  );
}
