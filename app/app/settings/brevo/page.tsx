"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw, Trash2, Globe, Mail, AlertTriangle, Copy, Check, Loader2, Settings, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { brevoApi, BrevoConnectionStatus, BrevoDomain, BrevoSender, BrevoDnsMode, BrevoAccountDomain, BrevoAccountSender, AvailableDomain } from "@/lib/api/brevo";
import { VerificationRequired } from "@/components/auth/VerificationRequired";

// Types
interface DnsRecordCardProps {
  record: {
    host: string;
    value: string;
    verified: boolean;
  } | null;
  title: string;
  type: "CNAME" | "TXT";
  recordId: string;
  copiedRecord: string | null;
  onCopyHost: () => void;
  onCopyValue: () => void;
}

function handleBrevoError(error: any, defaultMessage: string) {
  const message = error.message || defaultMessage;
  if (message.includes("Brevo IP Restricted")) {
    toast.error("IP Authorization Required", {
      description: "Access blocked. Please authorize this IP in Brevo settings, You might also want to Deactivate IP blocking in that section!",
      action: {
        label: "Authorize IP",
        onClick: () => window.open("https://app.brevo.com/security/authorised_ips", "_blank")
      },
      duration: 10000,
    });
  } else {
    toast.error(message);
  }
}

// DNS Record Card Component
function DnsRecordCard({ 
  record, 
  title, 
  type,
  recordId,
  copiedRecord,
  onCopyHost,
  onCopyValue 
}: DnsRecordCardProps) {
  if (!record) return null;

  return (
    <div className={`border rounded-lg p-3 space-y-2 ${
      record.verified 
        ? 'border-green-200 bg-green-500/5' 
        : 'border-red-200 bg-red-500/5'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          <Badge variant="outline" className="text-xs">{type}</Badge>
        </div>
        {record.verified ? (
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        ) : (
          <Badge className="bg-red-500/10 text-red-600 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Not Found
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground min-w-[40px]">Host:</span>
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
            {record.host}
          </code>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={onCopyHost}
            title="Copy host"
            aria-label={`Copy ${title} host`}
          >
            {copiedRecord === `${recordId}-host` ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground min-w-[40px]">Value:</span>
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {record.value.length > 50 ? `${record.value.substring(0, 50)}...` : record.value}
          </code>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={onCopyValue}
            title="Copy value"
            aria-label={`Copy ${title} value`}
          >
            {copiedRecord === `${recordId}-value` ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
      {record.verified ? (
        <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
          <CheckCircle2 className="w-3 h-3" />
          This record has been found and verified in your domain&apos;s DNS.
        </p>
      ) : (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
          <XCircle className="w-3 h-3" />
          This record needs to be added to your domain&apos;s DNS settings.
        </p>
      )}
    </div>
  );
}

export default function BrevoSettingsPage() {
  // Session
  const { data: session } = useSession();
  const isVerified = session?.user?.emailVerified;

  // Consolidated state
  const [state, setState] = useState({
    status: null as BrevoConnectionStatus | null,
    domains: [] as BrevoDomain[],
    brevoAccountDomains: [] as BrevoAccountDomain[],
    brevoAccountSenders: [] as BrevoAccountSender[],
    availableDomains: [] as AvailableDomain[],
    senders: {} as Record<string, BrevoSender[]>,
    selectedDomain: null as BrevoDomain | null,
    configDomain: null as BrevoAccountDomain | null,
    domainToDelete: null as BrevoDomain | null,
    senderToDelete: null as { sender: BrevoSender; domainId: string } | null,
  });

  // Loading states
  const [loading, setLoading] = useState({
    initial: true,
    accountData: false,
    availableDomains: false,
    configDialog: false,
    checkingConfig: false,
    connecting: false,
    disconnecting: false,
    addingDomain: false,
    addingSender: false,
  });

  // Dialog states
  const [dialogs, setDialogs] = useState({
    connect: false,
    disconnect: false,
    addDomain: false,
    addSender: false,
    deleteDomain: false,
    deleteSender: false,
    dnsConfig: false,
  });

  // Form states
  const [form, setForm] = useState({
    apiKey: "",
    domainName: "",
    dnsMode: "manual" as BrevoDnsMode,
    senderEmail: "",
    senderName: "",
    selectedExistingDomain: "",
  });

  // Clipboard state
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      const statusData = await brevoApi.getStatus();
      setState(prev => ({ ...prev, status: statusData }));

      if (statusData.connected) {
        const domainsData = await brevoApi.listDomains();
        setState(prev => ({ ...prev, domains: domainsData }));
        
        // Load Brevo account data
        loadBrevoAccountData();

        // Auto-verify pending domains
        const pendingDomains = domainsData.filter(
          (d) => d.status === "verifying" || d.status === "pending_dns"
        );
        for (const domain of pendingDomains) {
          try {
            const result = await brevoApi.verifyDomain(domain.id);
            if (result.verified) {
              const refreshed = await brevoApi.listDomains();
              setState(prev => ({ ...prev, domains: refreshed }));
              toast.success(`Domain ${domain.domainName} verified!`);
            }
          } catch {
            // Silent fail for auto-verify
          }
        }
      }
    } catch {
      toast.error("Failed to load Brevo settings");
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }

  async function handleConnect() {
    if (!form.apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, connecting: true }));
      await brevoApi.connect({ apiKey: form.apiKey });
      toast.success("Brevo account connected!");
      setDialogs(prev => ({ ...prev, connect: false }));
      setForm(prev => ({ ...prev, apiKey: "" }));
      await loadData();
    } catch (error: any) {
      handleBrevoError(error, "Failed to connect to Brevo");
      setForm(prev => ({ ...prev, apiKey: "" }));
    } finally {
      setLoading(prev => ({ ...prev, connecting: false }));
    }
  }

  async function handleDisconnect() {
    try {
      setLoading(prev => ({ ...prev, disconnecting: true }));
      await brevoApi.disconnect();
      toast.success("Brevo account disconnected");
      setDialogs(prev => ({ ...prev, disconnect: false }));
      setState(prev => ({ 
        ...prev, 
        status: { connected: false },
        domains: [],
        brevoAccountDomains: [],
        brevoAccountSenders: [],
      }));
    } catch (error: any) {
      handleBrevoError(error, "Failed to disconnect");
    } finally {
      setLoading(prev => ({ ...prev, disconnecting: false }));
    }
  }

  async function handleAddDomain() {
    const isExistingDomain = form.selectedExistingDomain && form.selectedExistingDomain !== "new_domain";
    const targetDomainName = isExistingDomain
      ? state.availableDomains.find(d => d.id === form.selectedExistingDomain)?.name || ""
      : form.domainName.trim();

    if (!targetDomainName) {
      toast.error("Please select or enter a domain name");
      return;
    }

    const isManualDns = !isExistingDomain && form.dnsMode === "manual";

    // Optimistic update
    const tempDomain: BrevoDomain = {
      id: `temp-${Date.now()}`,
      domainName: targetDomainName,
      status: "pending_dns",
      dnsMode: isExistingDomain ? "cloudflare-managed" : form.dnsMode,
      dkimVerified: false,
      spfVerified: false,
      dmarcVerified: false,
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({ 
      ...prev, 
      domains: [...prev.domains, tempDomain] 
    }));

    try {
      setLoading(prev => ({ ...prev, addingDomain: true }));
      const domain = await brevoApi.addDomain({ 
        domainName: targetDomainName, 
        dnsMode: isExistingDomain ? "cloudflare-managed" : form.dnsMode,
        existingDomainId: isExistingDomain ? form.selectedExistingDomain : undefined
      });
      
      toast.success(`Domain ${targetDomainName} added!`);
      
      // Replace temp with real domain
      setState(prev => ({ 
        ...prev, 
        domains: prev.domains.map(d => d.id === tempDomain.id ? domain : d)
      }));
      
      setDialogs(prev => ({ ...prev, addDomain: false }));
      setForm(prev => ({ 
        ...prev, 
        domainName: "",
        selectedExistingDomain: "",
      }));

      // If manual DNS mode, refresh account data and open DNS config dialog
      if (isManualDns) {
        const accountDomains = await brevoApi.getAccountDomains();
        const newDomain = accountDomains.find(d => d.domainName === targetDomainName);
        if (newDomain) {
          setState(prev => ({ 
            ...prev, 
            brevoAccountDomains: accountDomains,
            configDomain: newDomain 
          }));
          setDialogs(prev => ({ ...prev, dnsConfig: true }));
        }
      }
    } catch (error: any) {
      // Remove temp domain on error
      setState(prev => ({ 
        ...prev, 
        domains: prev.domains.filter(d => d.id !== tempDomain.id)
      }));
      handleBrevoError(error, "Failed to add domain");
    } finally {
      setLoading(prev => ({ ...prev, addingDomain: false }));
    }
  }

  async function loadAvailableDomains() {
    setLoading(prev => ({ ...prev, availableDomains: true }));
    try {
      const data = await brevoApi.getAvailableDomains();
      setState(prev => ({ ...prev, availableDomains: data }));
    } catch (error: any) {
      console.error("Failed to load available domains", error);
      if (error.message?.includes("Brevo IP Restricted")) {
        handleBrevoError(error, "Failed to load available domains");
      }
    } finally {
      setLoading(prev => ({ ...prev, availableDomains: false }));
    }
  }

  async function handleVerifyDomain(domain: BrevoDomain) {
    try {
      const result = await brevoApi.verifyDomain(domain.id);
      toast.success(result.verified ? "Domain verified!" : "Verification in progress");
      await loadData();
    } catch (error: any) {
      handleBrevoError(error, "Verification failed");
    }
  }

  async function loadSenders(domainId: string) {
    try {
      const sendersData = await brevoApi.listSenders(domainId);
      setState(prev => ({ 
        ...prev, 
        senders: { ...prev.senders, [domainId]: sendersData }
      }));
    } catch (error: any) {
      console.error("Failed to load senders", error);
      if (error.message?.includes("Brevo IP Restricted")) {
        handleBrevoError(error, "Failed to load senders");
      }
    }
  }

  async function handleAddSender() {
    if (!state.selectedDomain || !form.senderEmail.trim()) {
      toast.error("Please enter sender email");
      return;
    }

    const fullEmail = `${form.senderEmail.trim()}@${state.selectedDomain.domainName}`;

    try {
      setLoading(prev => ({ ...prev, addingSender: true }));
      await brevoApi.createSender({
        domainId: state.selectedDomain.id,
        email: fullEmail,
        name: form.senderName || undefined,
      });
      toast.success(`Sender ${fullEmail} created!`);
      setDialogs(prev => ({ ...prev, addSender: false }));
      setForm(prev => ({ 
        ...prev, 
        senderEmail: "",
        senderName: "",
      }));
      await loadSenders(state.selectedDomain.id);
    } catch (error: any) {
      handleBrevoError(error, "Failed to create sender");
    } finally {
      setLoading(prev => ({ ...prev, addingSender: false }));
    }
  }

  async function confirmDeleteDomain() {
    if (!state.domainToDelete) return;
    
    const identifier = state.domainToDelete.id;
    
    try {
      await brevoApi.deleteDomain(identifier);
      toast.success(`Domain ${state.domainToDelete.domainName} deleted`);
      
      setState(prev => ({
        ...prev,
        domains: prev.domains.filter(d => 
          d.id !== identifier && d.domainName !== state.domainToDelete!.domainName
        ),
        brevoAccountDomains: prev.brevoAccountDomains.filter(d => 
          String(d.id) !== identifier && d.domainName !== state.domainToDelete!.domainName
        ),
        domainToDelete: null,
      }));
      
      setDialogs(prev => ({ ...prev, deleteDomain: false }));
    } catch (error: any) {
      handleBrevoError(error, "Failed to delete domain");
    }
  }

  async function confirmDeleteSender() {
    if (!state.senderToDelete) return;
    const { sender, domainId } = state.senderToDelete;
    
    try {
      await brevoApi.deleteSender(sender.id);
      toast.success(`Sender ${sender.email} deleted`);
      
      if (domainId === "account-overview") {
        setState(prev => ({
          ...prev,
          brevoAccountSenders: prev.brevoAccountSenders.filter(s => String(s.id) !== sender.id),
          senderToDelete: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          senders: {
            ...prev.senders,
            [domainId]: prev.senders[domainId]?.filter(s => s.id !== sender.id) || []
          },
          brevoAccountSenders: prev.brevoAccountSenders.filter(s => String(s.id) !== sender.id),
          senderToDelete: null,
        }));
      }
      
      setDialogs(prev => ({ ...prev, deleteSender: false }));
    } catch (error: any) {
      handleBrevoError(error, "Failed to delete sender");
    }
  }

  function copyToClipboard(text: string, recordId: string) {
    navigator.clipboard.writeText(text);
    setCopiedRecord(recordId);
    setTimeout(() => setCopiedRecord(null), 2000);
    toast.success("Copied to clipboard");
  }

  async function loadBrevoAccountData() {
    try {
      setLoading(prev => ({ ...prev, accountData: true }));
      const [accountDomains, accountSenders] = await Promise.all([
        brevoApi.getAccountDomains().catch(() => []),
        brevoApi.getAccountSenders().catch(() => [])
      ]);
      setState(prev => ({ 
        ...prev, 
        brevoAccountDomains: accountDomains,
        brevoAccountSenders: accountSenders 
      }));
    } catch (error: any) {
      console.error("Failed to load account data", error);
      if (error.message?.includes("Brevo IP Restricted")) {
        handleBrevoError(error, "Failed to load account data");
      }
    } finally {
      setLoading(prev => ({ ...prev, accountData: false }));
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Verified</Badge>;
      case "verifying":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Verifying</Badge>;
      case "pending_dns":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Pending DNS</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  async function openDnsConfigDialog(domain: BrevoAccountDomain) {
    setState(prev => ({ ...prev, configDomain: domain }));
    setDialogs(prev => ({ ...prev, dnsConfig: true }));
    setLoading(prev => ({ ...prev, configDialog: true }));
    
    try {
      const accountDomains = await brevoApi.getAccountDomains();
      const freshDomain = accountDomains.find(d => d.domainName === domain.domainName);
      if (freshDomain) {
        setState(prev => ({ 
          ...prev, 
          configDomain: freshDomain,
          brevoAccountDomains: accountDomains 
        }));
      }
    } catch (error: any) {
      console.error("Failed to fetch DNS records:", error);
    } finally {
      setLoading(prev => ({ ...prev, configDialog: false }));
    }
  }

  async function checkDomainConfig() {
    if (!state.configDomain) return;
    
    try {
      setLoading(prev => ({ ...prev, checkingConfig: true }));
      const accountDomains = await brevoApi.getAccountDomains();
      
      const updatedDomain = accountDomains.find(
        d => d.domainName === state.configDomain!.domainName
      );
      
      if (updatedDomain) {
        setState(prev => ({ 
          ...prev, 
          configDomain: updatedDomain,
          brevoAccountDomains: accountDomains 
        }));
        
        if (updatedDomain.authenticated) {
          toast.success("Domain is fully authenticated!");
        } else {
          toast.info("DNS records are still being verified. This can take up to 48 hours.");
        }
      }
    } catch (error: any) {
      handleBrevoError(error, "Failed to check domain configuration");
    } finally {
      setLoading(prev => ({ ...prev, checkingConfig: false }));
    }
  }

  if (loading.initial) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVerified && !loading.initial) {
    return <VerificationRequired />;
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            {state.status?.connected ? "Your Brevo account is connected" : "Connect your Brevo API key to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.status?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div>
                    <p className="font-medium">Connected</p>
                    <p className="text-sm text-muted-foreground">{state.status.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{state.status.sendingTier} tier</Badge>
                  <Badge variant="outline">{state.status.dailySendCount || 0} sends today</Badge>
                </div>
              </div>

              <AlertDialog open={dialogs.disconnect} onOpenChange={(open) => setDialogs(prev => ({ ...prev, disconnect: open }))}>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setDialogs(prev => ({ ...prev, disconnect: true }))}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Disconnect Brevo?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will archive your connection and all associated domains/senders. 
                      You won&apos;t be able to send emails until you reconnect.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading.disconnecting}>
                      Cancel
                    </AlertDialogCancel>
                    <Button 
                      variant="destructive" 
                      onClick={handleDisconnect} 
                      disabled={loading.disconnecting}
                    >
                      {loading.disconnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Disconnect
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        onClick={() => isVerified && setDialogs(prev => ({ ...prev, connect: true }))} 
                        disabled={!isVerified}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Connect Brevo Account
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!isVerified && (
                    <TooltipContent>
                      <p>Verification required to connect account</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              
              <Dialog open={dialogs.connect} onOpenChange={(open) => setDialogs(prev => ({ ...prev, connect: open }))}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect Brevo</DialogTitle>
                    <DialogDescription>
                      Enter your Brevo API key. You can find this in your Brevo dashboard under SMTP & API.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="xkeysib-..."
                        value={form.apiKey}
                        onChange={(e) => setForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogs(prev => ({ ...prev, connect: false }))}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleConnect} disabled={loading.connecting}>
                      {loading.connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Connect
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>

      {/* Brevo Account Overview */}
      {state.status?.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Brevo Account Overview
            </CardTitle>
            <CardDescription>
              Domains registered in your Brevo account (fetched directly from Brevo API)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading.accountData ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Domains ({state.brevoAccountDomains.length})</p>
                  </div>
                  {state.brevoAccountDomains.length === 0 ? (
                    <div className="text-center py-8">
                      <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">No domains found in your Brevo account</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...state.brevoAccountDomains]
                        .sort((a, b) => {
                          if (a.authenticated === b.authenticated) {
                            return (a.domainName || '').localeCompare(b.domainName || '');
                          }
                          return a.authenticated ? -1 : 1;
                        })
                        .map((domain, index) => (
                        <div 
                          key={domain.domainName || index} 
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-medium">{domain.domainName || "Unknown Domain"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {domain.authenticated ? (
                              <Badge className="bg-green-500/10 text-green-600 border-green-200">Verified</Badge>
                            ) : (
                              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pending</Badge>
                            )}
                            {domain.dnsRecords?.dkimRecord?.verified && (
                              <Badge variant="outline" className="text-xs hidden sm:inline-flex">DKIM ✓</Badge>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => openDnsConfigDialog(domain)}
                              title="Configure DNS"
                              aria-label={`Configure DNS for ${domain.domainName}`}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setState(prev => ({ 
                                  ...prev, 
                                  domainToDelete: { 
                                    id: domain.domainName, 
                                    domainName: domain.domainName 
                                  } as any
                                }));
                                setDialogs(prev => ({ ...prev, deleteDomain: true }));
                              }}
                              aria-label={`Delete ${domain.domainName}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={loadBrevoAccountData}>
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Domains Section */}
      {state.status?.connected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Domains
              </CardTitle>
              <CardDescription>
                Manage your verified sending domains
              </CardDescription>
            </div>
            <Dialog 
              open={dialogs.addDomain} 
              onOpenChange={(open) => {
                setDialogs(prev => ({ ...prev, addDomain: open }));
                if (open) {
                  setForm(prev => ({ 
                    ...prev, 
                    domainName: "",
                    selectedExistingDomain: "",
                  }));
                }
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (isVerified) {
                            setDialogs(prev => ({ ...prev, addDomain: true }));
                            loadAvailableDomains();
                          }
                        }}
                        disabled={!isVerified}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Domain
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!isVerified && (
                    <TooltipContent>
                      <p>Verification required to add domains</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Domain</DialogTitle>
                  <DialogDescription>
                    Add a domain to use for sending emails
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {(loading.availableDomains || state.availableDomains.length > 0) && (
                    <div className="space-y-2">
                      <Label>Use Existing Domain</Label>
                      {loading.availableDomains ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select 
                          value={form.selectedExistingDomain} 
                          onValueChange={(v) => {
                            setForm(prev => ({ 
                              ...prev, 
                              selectedExistingDomain: v,
                              domainName: v && v !== "new_domain" ? "" : prev.domainName
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an existing domain (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new_domain">Enter new domain manually</SelectItem>
                            {state.availableDomains.map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Select from your Cloudflare-managed domains for automatic DNS setup
                      </p>
                    </div>
                  )}
                  
                  {(!form.selectedExistingDomain || form.selectedExistingDomain === "new_domain") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="domainName">Domain Name</Label>
                        <Input
                          id="domainName"
                          placeholder="example.com"
                          value={form.domainName}
                          onChange={(e) => setForm(prev => ({ ...prev, domainName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dnsMode">DNS Management</Label>
                        <Select 
                          value={form.dnsMode} 
                          onValueChange={(v) => setForm(prev => ({ ...prev, dnsMode: v as BrevoDnsMode }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual DNS</SelectItem>
                            <SelectItem value="cloudflare-managed">Cloudflare Managed</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {form.dnsMode === "cloudflare-managed" 
                            ? "We'll automatically configure DNS records via Cloudflare"
                            : "You'll need to manually add DNS records"}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {form.selectedExistingDomain && form.selectedExistingDomain !== "new_domain" && (
                    <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                      DNS records will be automatically added to your Cloudflare zone
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogs(prev => ({ ...prev, addDomain: false }))}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddDomain} disabled={loading.addingDomain}>
                    {loading.addingDomain && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Domain
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {state.domains.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-2">No domains yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first domain to start sending emails
                </p>
                <Button 
                  onClick={() => {
                    if (isVerified) {
                      setDialogs(prev => ({ ...prev, addDomain: true }));
                      loadAvailableDomains();
                    }
                  }}
                  disabled={!isVerified}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Domain
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.domains.filter((domain) => domain.status === "verified").map((domain) => (
                  <div key={domain.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{domain.domainName}</p>
                          <p className="text-sm text-muted-foreground">
                            {domain.dnsMode === "cloudflare-managed" ? "Cloudflare Managed" : "Manual DNS"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(domain.status)}
                        {domain.status !== "verified" && (
                          <Button size="sm" variant="outline" onClick={() => handleVerifyDomain(domain)}>
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Verify
                          </Button>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setState(prev => ({ ...prev, domainToDelete: domain }));
                            setDialogs(prev => ({ ...prev, deleteDomain: true }));
                          }}
                          aria-label={`Delete ${domain.domainName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {domain.status === "pending_dns" && domain.dnsRecords && (
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium">Add these DNS records:</p>
                        {domain.dnsRecords.map((record, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-background p-2 rounded text-xs font-mono">
                            <div className="flex-1 overflow-hidden">
                              <span className="text-muted-foreground">{record.type}: </span>
                              <span className="truncate">{record.host} → {record.value}</span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 shrink-0"
                              onClick={() => copyToClipboard(record.value, `${domain.id}-${idx}`)}
                              aria-label={`Copy ${record.type} record value`}
                            >
                              {copiedRecord === `${domain.id}-${idx}` ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {domain.status === "verified" && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Senders</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      if (isVerified) {
                                        setState(prev => ({ ...prev, selectedDomain: domain }));
                                        loadSenders(domain.id);
                                        setDialogs(prev => ({ ...prev, addSender: true }));
                                      }
                                    }}
                                    disabled={!isVerified}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Sender
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!isVerified && (
                                <TooltipContent>
                                  <p>Verification required to add senders</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {state.senders[domain.id]?.length ? (
                          <div className="space-y-2">
                            {state.senders[domain.id].map((sender) => (
                              <div key={sender.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{sender.email}</span>
                                  {sender.name && <span className="text-xs text-muted-foreground">({sender.name})</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  {sender.isDisabled ? (
                                    <Badge variant="destructive">Disabled</Badge>
                                  ) : sender.isVerified ? (
                                    <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                                  ) : (
                                    <Badge variant="outline">Pending</Badge>
                                  )}
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      setState(prev => ({ 
                                        ...prev, 
                                        senderToDelete: { sender, domainId: domain.id }
                                      }));
                                      setDialogs(prev => ({ ...prev, deleteSender: true }));
                                    }}
                                    aria-label={`Delete sender ${sender.email}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => loadSenders(domain.id)}>
                            Load senders
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Sender Dialog */}
      <Dialog 
        open={dialogs.addSender} 
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, addSender: open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sender</DialogTitle>
            <DialogDescription>
              Create a sender email for {state.selectedDomain?.domainName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Email Address</Label>
              <div className="flex items-center">
                <Input
                  id="senderEmail"
                  placeholder="hello"
                  value={form.senderEmail}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    senderEmail: e.target.value.replace(/@.*$/, '')
                  }))}
                  className="rounded-r-none border-r-0"
                />
                <span className="inline-flex items-center px-3 h-10 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                  @{state.selectedDomain?.domainName || "example.com"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderName">Name (optional)</Label>
              <Input
                id="senderName"
                placeholder="Your Company"
                value={form.senderName}
                onChange={(e) => setForm(prev => ({ ...prev, senderName: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogs(prev => ({ ...prev, addSender: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSender} disabled={loading.addingSender}>
              {loading.addingSender && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Sender
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Domain Alert Dialog */}
      <AlertDialog 
        open={dialogs.deleteDomain} 
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, deleteDomain: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{state.domainToDelete?.domainName}</strong> from both INVERX and your Brevo account. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteDomain} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Sender Alert Dialog */}
      <AlertDialog 
        open={dialogs.deleteSender} 
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, deleteSender: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove sender <strong>{state.senderToDelete?.sender.email}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSender} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DNS Configuration Dialog */}
      <Dialog 
        open={dialogs.dnsConfig} 
        onOpenChange={(open) => setDialogs(prev => ({ ...prev, dnsConfig: open }))}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              DNS Configuration
            </DialogTitle>
            <DialogDescription>
              Configure DNS records for <strong>{state.configDomain?.domainName}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {loading.configDialog ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Domain Status</span>
              {state.configDomain?.authenticated ? (
                <Badge className="bg-green-500/10 text-green-600 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Authenticated
                </Badge>
              ) : (
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Pending Verification
                </Badge>
              )}
            </div>

            <div className="space-y-3 overflow-y-scroll">
              <p className="text-sm font-medium">DNS Records</p>
              
              <DnsRecordCard
                record={state.configDomain?.dnsRecords?.dkim1Record || null}
                title="DKIM Record 1"
                type="CNAME"
                recordId="dkim1"
                copiedRecord={copiedRecord}
                onCopyHost={() => copyToClipboard(state.configDomain!.dnsRecords!.dkim1Record!.host, 'dkim1-host')}
                onCopyValue={() => copyToClipboard(state.configDomain!.dnsRecords!.dkim1Record!.value, 'dkim1-value')}
              />

              <DnsRecordCard
                record={state.configDomain?.dnsRecords?.dkim2Record || null}
                title="DKIM Record 2"
                type="CNAME"
                recordId="dkim2"
                copiedRecord={copiedRecord}
                onCopyHost={() => copyToClipboard(state.configDomain!.dnsRecords!.dkim2Record!.host, 'dkim2-host')}
                onCopyValue={() => copyToClipboard(state.configDomain!.dnsRecords!.dkim2Record!.value, 'dkim2-value')}
              />

              <DnsRecordCard
                record={state.configDomain?.dnsRecords?.brevoCode || null}
                title="Brevo Code"
                type="TXT"
                recordId="brevo"
                copiedRecord={copiedRecord}
                onCopyHost={() => copyToClipboard(state.configDomain!.dnsRecords!.brevoCode!.host, 'brevo-host')}
                onCopyValue={() => copyToClipboard(state.configDomain!.dnsRecords!.brevoCode!.value, 'brevo-value')}
              />

              <DnsRecordCard
                record={state.configDomain?.dnsRecords?.dmarc_record || null}
                title="DMARC Record"
                type="TXT"
                recordId="dmarc"
                copiedRecord={copiedRecord}
                onCopyHost={() => copyToClipboard(state.configDomain!.dnsRecords!.dmarc_record!.host, 'dmarc-host')}
                onCopyValue={() => copyToClipboard(state.configDomain!.dnsRecords!.dmarc_record!.value, 'dmarc-value')}
              />

              {!state.configDomain?.dnsRecords?.dkimRecord && 
                !state.configDomain?.dnsRecords?.dkim1Record && 
                !state.configDomain?.dnsRecords?.dkim2Record && 
                !state.configDomain?.dnsRecords?.brevoCode && 
                !state.configDomain?.dnsRecords?.dmarc_record && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    No DNS records available yet.
                  </p>
                  <Button variant="outline" onClick={checkDomainConfig}>
                    Fetch DNS Records
                  </Button>
                </div>
              )}
            </div>

            {!state.configDomain?.authenticated && (
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-blue-700 dark:text-blue-400">
                  Add the DNS records above to your domain provider. Verification can take up to 48 hours.
                </p>
              </div>
            )}
          </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDialogs(prev => ({ ...prev, dnsConfig: false }))}
            >
              Close
            </Button>
            <Button onClick={checkDomainConfig} disabled={loading.checkingConfig}>
              {loading.checkingConfig && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}