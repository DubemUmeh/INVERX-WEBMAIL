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
  AlertDialogTrigger
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

export default function BrevoSettingsPage() {
  // State
  const [status, setStatus] = useState<BrevoConnectionStatus | null>(null);
  const [domains, setDomains] = useState<BrevoDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isVerified = session?.user?.emailVerified;
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Dialogs
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [addDomainDialogOpen, setAddDomainDialogOpen] = useState(false);
  const [addSenderDialogOpen, setAddSenderDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<BrevoDomain | null>(null);

  // Form state
  const [apiKey, setApiKey] = useState("");
  const [domainName, setDomainName] = useState("");
  const [dnsMode, setDnsMode] = useState<BrevoDnsMode>("manual");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");

  // Senders state
  const [senders, setSenders] = useState<Record<string, BrevoSender[]>>({});

  // Clipboard state
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);

  // Brevo Account Data state (from Brevo API directly)
  const [brevoAccountDomains, setBrevoAccountDomains] = useState<BrevoAccountDomain[]>([]);
  const [brevoAccountSenders, setBrevoAccountSenders] = useState<BrevoAccountSender[]>([]);
  const [loadingAccountData, setLoadingAccountData] = useState(false);

  // Available domains for Brevo (from Domain Management)
  const [availableDomains, setAvailableDomains] = useState<AvailableDomain[]>([]);
  const [selectedExistingDomain, setSelectedExistingDomain] = useState<string>("");
  const [loadingAvailableDomains, setLoadingAvailableDomains] = useState(false);

  // Delete Dialog State
  const [deleteDomainDialogOpen, setDeleteDomainDialogOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<BrevoDomain | null>(null);
  const [deleteSenderDialogOpen, setDeleteSenderDialogOpen] = useState(false);

  // DNS Config Dialog State
  const [dnsConfigDialogOpen, setDnsConfigDialogOpen] = useState(false);
  const [configDomain, setConfigDomain] = useState<BrevoAccountDomain | null>(null);
  const [checkingConfig, setCheckingConfig] = useState(false);
  const [loadingConfigDialog, setLoadingConfigDialog] = useState(false);
  const [senderToDelete, setSenderToDelete] = useState<{ sender: BrevoSender, domainId: string } | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const statusData = await brevoApi.getStatus();
      setStatus(statusData);

      if (statusData.connected) {
        const domainsData = await brevoApi.listDomains();
        setDomains(domainsData);
        // Load Brevo account data
        loadBrevoAccountData();

        // Auto-verify domains that are still pending verification
        const pendingDomains = domainsData.filter(
          (d) => d.status === "verifying" || d.status === "pending_dns"
        );
        for (const domain of pendingDomains) {
          try {
            const result = await brevoApi.verifyDomain(domain.id);
            if (result.verified) {
              // Refresh domains to get updated status
              const refreshed = await brevoApi.listDomains();
              setDomains(refreshed);
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
      setLoading(false);
    }
  }

  async function handleConnect() {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }
    
    try {
      setConnecting(true);
      await brevoApi.connect({ apiKey });
      toast.success("Brevo account connected!");
      setConnectDialogOpen(false);
      setApiKey("");
      await loadData();
    } catch (error: any) {
      handleBrevoError(error, "Failed to connect to Brevo");
      setApiKey("");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      setDisconnecting(true);
      await brevoApi.disconnect();
      toast.success("Brevo account disconnected");
      setDisconnectDialogOpen(false);
      setStatus({ connected: false });
      setDomains([]);
    } catch (error: any) {
      handleBrevoError(error, "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleAddDomain() {
    // Determine domain name from selection or input
    const isExistingDomain = selectedExistingDomain && selectedExistingDomain !== "new_domain";
    const targetDomainName = isExistingDomain
      ? availableDomains.find(d => d.id === selectedExistingDomain)?.name || ""
      : domainName.trim();

    if (!targetDomainName) {
      toast.error("Please select or enter a domain name");
      return;
    }

    const isManualDns = !isExistingDomain && dnsMode === "manual";

    try {
      const domain = await brevoApi.addDomain({ 
        domainName: targetDomainName, 
        dnsMode: isExistingDomain ? "cloudflare-managed" : dnsMode,
        existingDomainId: isExistingDomain ? selectedExistingDomain : undefined
      });
      toast.success(`Domain ${targetDomainName} added!`);
      setAddDomainDialogOpen(false);
      setDomainName("");
      setSelectedExistingDomain("");
      setDomains([...domains, domain]);

      // If manual DNS mode, refresh account data and open DNS config dialog
      if (isManualDns) {
        const accountDomains = await brevoApi.getAccountDomains();
        setBrevoAccountDomains(accountDomains);
        const newDomain = accountDomains.find(d => d.domainName === targetDomainName);
        if (newDomain) {
          setConfigDomain(newDomain);
          setDnsConfigDialogOpen(true);
        }
      }
    } catch (error: any) {
      handleBrevoError(error, "Failed to add domain");
    }
  }

  async function loadAvailableDomains() {
    setLoadingAvailableDomains(true);
    try {
      const data = await brevoApi.getAvailableDomains();
      setAvailableDomains(data);
    } catch (error: any) {
      console.error("Failed to load available domains", error);
      // Only show toast if it's the specific IP error to avoid noise
      if (error.message?.includes("Brevo IP Restricted")) {
        handleBrevoError(error, "Failed to load available domains");
      }
    } finally {
      setLoadingAvailableDomains(false);
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
      setSenders(prev => ({ ...prev, [domainId]: sendersData }));
    } catch (error: any) {
      console.error("Failed to load senders", error);
      if (error.message?.includes("Brevo IP Restricted")) {
        handleBrevoError(error, "Failed to load senders");
      }
    }
  }

  async function handleAddSender() {
    if (!selectedDomain || !senderEmail.trim()) {
      toast.error("Please enter sender email");
      return;
    }

    // Construct full email by appending domain
    const fullEmail = `${senderEmail.trim()}@${selectedDomain.domainName}`;

    try {
      await brevoApi.createSender({
        domainId: selectedDomain.id,
        email: fullEmail,
        name: senderName || undefined,
      });
      toast.success(`Sender ${fullEmail} created!`);
      setAddSenderDialogOpen(false);
      setSenderEmail("");
      setSenderName("");
      await loadSenders(selectedDomain.id);
    } catch (error: any) {
      handleBrevoError(error, "Failed to create sender");
    }
  }

  function handleDeleteDomain(domain: BrevoDomain) {
    setDomainToDelete(domain);
    setDeleteDomainDialogOpen(true);
  }

  async function confirmDeleteDomain() {
    if (!domainToDelete) return;
    
    // We can use the domainName as identifier for robust deletion (both local and Brevo)
    const identifier = domainToDelete.id; 
    
    try {
      await brevoApi.deleteDomain(identifier);
      toast.success(`Domain ${domainToDelete.domainName} deleted`);
      
      // Update both local and account lists
      setDomains(domains.filter(d => d.id !== identifier && d.domainName !== domainToDelete.domainName));
      setBrevoAccountDomains(brevoAccountDomains.filter(d => String(d.id) !== identifier && d.domainName !== domainToDelete.domainName));
      
      setDeleteDomainDialogOpen(false);
      setDomainToDelete(null);
    } catch (error: any) {
      handleBrevoError(error, "Failed to delete domain");
    }
  }

  function handleDeleteSender(sender: BrevoSender, domainId: string) {
    setSenderToDelete({ sender, domainId });
    setDeleteSenderDialogOpen(true);
  }

  async function handleDeleteAccountDomain(domain: BrevoAccountDomain) {
    setDomainToDelete({ 
      id: domain.domainName, // Use domain name as identifier
      domainName: domain.domainName 
    } as any);
    setDeleteDomainDialogOpen(true);
  }

  async function handleDeleteAccountSender(sender: BrevoAccountSender) {
    setSenderToDelete({ 
      sender: { 
        id: String(sender.id), 
        email: sender.email 
      } as any, 
      domainId: "account-overview" // Flag to indicate account-level
    });
    setDeleteSenderDialogOpen(true);
  }

  async function confirmDeleteSender() {
    if (!senderToDelete) return;
    const { sender, domainId } = senderToDelete;
    
    try {
      await brevoApi.deleteSender(sender.id);
      toast.success(`Sender ${sender.email} deleted`);
      
      if (domainId === "account-overview") {
        setBrevoAccountSenders(brevoAccountSenders.filter(s => String(s.id) !== sender.id));
      } else {
        setSenders(prev => ({
          ...prev,
          [domainId]: prev[domainId]?.filter(s => s.id !== sender.id) || []
        }));
        // Also update account senders list for consistency
        setBrevoAccountSenders(brevoAccountSenders.filter(s => String(s.id) !== sender.id));
      }
      
      setDeleteSenderDialogOpen(false);
      setSenderToDelete(null);
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
      setLoadingAccountData(true);
      const [accountDomains, accountSenders] = await Promise.all([
        brevoApi.getAccountDomains().catch(() => []),
        brevoApi.getAccountSenders().catch(() => [])
      ]);
      setBrevoAccountDomains(accountDomains);
      setBrevoAccountSenders(accountSenders);
    } catch (error: any) {
      console.error("Failed to load account data", error);
      if (error.message?.includes("Brevo IP Restricted")) {
        handleBrevoError(error, "Failed to load account data");
      }
    } finally {
      setLoadingAccountData(false);
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
    setConfigDomain(domain);
    setDnsConfigDialogOpen(true);
    setLoadingConfigDialog(true);
    
    try {
      // Fetch fresh DNS records data
      const accountDomains = await brevoApi.getAccountDomains();
      const freshDomain = accountDomains.find(d => d.domainName === domain.domainName);
      if (freshDomain) {
        setConfigDomain(freshDomain);
        setBrevoAccountDomains(accountDomains);
      }
    } catch (error: any) {
      console.error("Failed to fetch DNS records:", error);
      // Keep using the existing domain data
    } finally {
      setLoadingConfigDialog(false);
    }
  }

  async function checkDomainConfig() {
    if (!configDomain) return;
    
    try {
      setCheckingConfig(true);
      // Re-fetch account domains to get updated verification status
      const accountDomains = await brevoApi.getAccountDomains();
      setBrevoAccountDomains(accountDomains);
      
      // Update the configDomain with fresh data
      const updatedDomain = accountDomains.find(
        d => d.domainName === configDomain.domainName
      );
      if (updatedDomain) {
        setConfigDomain(updatedDomain);
        if (updatedDomain.authenticated) {
          toast.success("Domain is fully authenticated!");
        } else {
          toast.info("DNS records are still being verified. This can take up to 48 hours.");
        }
      }
    } catch (error: any) {
      handleBrevoError(error, "Failed to check domain configuration");
    } finally {
      setCheckingConfig(false);
    }
  }

  if (loading) {
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

  if (!isVerified && !loading) {
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
            {status?.connected ? "Your Brevo account is connected" : "Connect your Brevo API key to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div>
                    <p className="font-medium">Connected</p>
                    <p className="text-sm text-muted-foreground">{status.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{status.sendingTier} tier</Badge>
                  <Badge variant="outline">{status.dailySendCount || 0} sends today</Badge>
                </div>
              </div>

              <AlertDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
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
                    <AlertDialogCancel disabled={disconnecting}>
                      Cancel
                    </AlertDialogCancel>
                    <Button 
                      variant="destructive" 
                      onClick={handleDisconnect} 
                      disabled={disconnecting}
                    >
                      {disconnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
                      <Button onClick={() => isVerified && setConnectDialogOpen(true)} disabled={!isVerified}>
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
              <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
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
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConnect} disabled={connecting}>
                      {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Connect
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>

      {/* Brevo Account Overview - shows domains/senders from Brevo API */}
      {status?.connected && (
        <Card>
          <CardHeader>
            {/* console.log("Brevo Account Domains:", brevoAccountDomains) */}
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Brevo Account Overview
            </CardTitle>
            <CardDescription>
              Domains registered in your Brevo account (fetched directly from Brevo API)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* DEBUG: Inspect data structure */}
            {/* <pre className="text-xs bg-slate-950 text-white p-4 rounded overflow-auto max-h-40 mb-4">
              {JSON.stringify(brevoAccountDomains, null, 2)}
            </pre> */}
            {loadingAccountData ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Account Domains */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Domains ({brevoAccountDomains.length})</p>
                  </div>
                  {brevoAccountDomains.length === 0 ? (
                    <p className="text-sm text-muted-foreground pl-6">No domains found in your Brevo account</p>
                  ) : (
                    <div className="space-y-2">
                      {[...brevoAccountDomains]
                        .sort((a, b) => {
                          // Sort verified first, then by name
                          if (a.authenticated === b.authenticated) {
                            return (a.domainName || '').localeCompare(b.domainName || '');
                          }
                          return a.authenticated ? -1 : 1;
                        })
                        .map((domain, index) => (
                        <div key={domain.domainName || index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors">
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
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteAccountDomain(domain)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Senders
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Senders ({brevoAccountSenders.length})</p>
                  </div>
                  {brevoAccountSenders.length === 0 ? (
                    <p className="text-sm text-muted-foreground pl-6">No senders found in your Brevo account</p>
                  ) : (
                    <div className="space-y-2 pl-6">
                      {brevoAccountSenders.map((sender) => (
                        <div key={sender.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{sender.email}</span>
                              {sender.name && <span className="text-xs text-muted-foreground ml-2">({sender.name})</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {sender.active ? (
                              <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteAccountSender(sender)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div> */}

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
      {status?.connected && (
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
            <Dialog open={addDomainDialogOpen} onOpenChange={(open) => {
              setAddDomainDialogOpen(open);
              if (open) {
                // loadAvailableDomains(); // Moved to onClick of button
                setDomainName("");
                setSelectedExistingDomain("");
              }
            }}>
              <DialogTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            if (isVerified) {
                              setAddDomainDialogOpen(true);
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
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Domain</DialogTitle>
                  <DialogDescription>
                    Add a domain to use for sending emails
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Existing Domain Selection */}
                  {(loadingAvailableDomains || availableDomains.length > 0) && (
                    <div className="space-y-2">
                      <Label>Use Existing Domain</Label>
                      {loadingAvailableDomains ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select 
                          value={selectedExistingDomain} 
                          onValueChange={(v) => {
                            setSelectedExistingDomain(v);
                            if (v && v !== "new_domain") setDomainName(""); // Clear manual input if selecting existing
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an existing domain (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new_domain">Enter new domain manually</SelectItem>
                            {availableDomains.map(d => (
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
                  
                  {/* Manual Domain Input - only show if no existing domain selected */}
                  {(!selectedExistingDomain || selectedExistingDomain === "new_domain") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="domainName">Domain Name</Label>
                        <Input
                          id="domainName"
                          placeholder="example.com"
                          value={domainName}
                          onChange={(e) => setDomainName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dnsMode">DNS Management</Label>
                        <Select value={dnsMode} onValueChange={(v) => setDnsMode(v as BrevoDnsMode)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual DNS</SelectItem>
                            <SelectItem value="cloudflare-managed">Cloudflare Managed</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {dnsMode === "cloudflare-managed" 
                            ? "We'll automatically configure DNS records via Cloudflare"
                            : "You'll need to manually add DNS records"}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {/* Info for existing domain */}
                  {selectedExistingDomain && selectedExistingDomain !== "new_domain" && (
                    <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                      DNS records will be automatically added to your Cloudflare zone
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDomainDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDomain}>Add Domain</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {domains.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No domains yet. Add your first domain to start sending.
              </p>
            ) : (
              <div className="space-y-4">
                {domains.filter((domain) => domain.status === "verified").map((domain) => {
                  // console.log('verified domains', domains)
                  return (
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
                            onClick={() => handleDeleteDomain(domain)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* DNS Records */}
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

                      {/* Senders Section for verified domains */}
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
                                          setSelectedDomain(domain);
                                          loadSenders(domain.id);
                                          setAddSenderDialogOpen(true);
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
                          {senders[domain.id]?.length ? (
                            <div className="space-y-2">
                              {senders[domain.id].map((sender) => (
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
                                      onClick={() => handleDeleteSender(sender, domain.id)}
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
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Sender Dialog */}
      <Dialog open={addSenderDialogOpen} onOpenChange={setAddSenderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sender</DialogTitle>
            <DialogDescription>
              Create a sender email for {selectedDomain?.domainName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Email Address</Label>
              <div className="flex items-center">
                <Input
                  id="senderEmail"
                  placeholder="hello"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value.replace(/@.*$/, ''))}
                  className="rounded-r-none border-r-0"
                />
                <span className="inline-flex items-center px-3 h-10 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                  @{selectedDomain?.domainName || "example.com"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderName">Name (optional)</Label>
              <Input
                id="senderName"
                placeholder="Your Company"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSenderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSender}>Add Sender</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Domain Alert Dialog */}
      <AlertDialog open={deleteDomainDialogOpen} onOpenChange={setDeleteDomainDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{domainToDelete?.domainName}</strong> from both INVERX and your Brevo account. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDomain} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Sender Alert Dialog */}
      <AlertDialog open={deleteSenderDialogOpen} onOpenChange={setDeleteSenderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove sender <strong>{senderToDelete?.sender.email}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSender} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DNS Configuration Dialog */}
      <Dialog open={dnsConfigDialogOpen} onOpenChange={setDnsConfigDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              DNS Configuration
            </DialogTitle>
            <DialogDescription>
              Configure DNS records for <strong>{configDomain?.domainName}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {loadingConfigDialog ? (
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
            {/* Domain Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Domain Status</span>
              {configDomain?.authenticated ? (
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

            {/* DNS Records */}
            <div className="space-y-3">
              <p className="text-sm font-medium">DNS Records</p>
              
              {/* DKIM Record 1 */}
              {configDomain?.dnsRecords?.dkim1Record && (
                <div className={`border rounded-lg p-3 space-y-2 ${configDomain.dnsRecords.dkim1Record.verified ? 'border-green-200 bg-green-500/5' : 'border-red-200 bg-red-500/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">DKIM Record 1</span>
                      <Badge variant="outline" className="text-xs">CNAME</Badge>
                    </div>
                    {configDomain.dnsRecords.dkim1Record.verified ? (
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
                        {configDomain.dnsRecords.dkim1Record.host}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(configDomain.dnsRecords!.dkim1Record!.host, 'dkim1-host')}
                        title="Copy host"
                      >
                        {copiedRecord === 'dkim1-host' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground min-w-[40px]">Value:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {configDomain.dnsRecords.dkim1Record.value.substring(0, 50)}...
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(configDomain.dnsRecords!.dkim1Record!.value, 'dkim1-value')}
                        title="Copy value"
                      >
                        {copiedRecord === 'dkim1-value' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* DKIM Record 2 */}
              {configDomain?.dnsRecords?.dkim2Record && (
                <div className={`border rounded-lg p-3 space-y-2 ${configDomain.dnsRecords.dkim2Record.verified ? 'border-green-200 bg-green-500/5' : 'border-red-200 bg-red-500/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">DKIM Record 2</span>
                      <Badge variant="outline" className="text-xs">CNAME</Badge>
                    </div>
                    {configDomain.dnsRecords.dkim2Record.verified ? (
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
                        {configDomain.dnsRecords.dkim2Record.host}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(configDomain.dnsRecords!.dkim2Record!.host, 'dkim2-host')}
                        title="Copy host"
                      >
                        {copiedRecord === 'dkim2-host' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground min-w-[40px]">Value:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {configDomain.dnsRecords.dkim2Record.value.substring(0, 50)}...
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(configDomain.dnsRecords!.dkim2Record!.value, 'dkim2-value')}
                        title="Copy value"
                      >
                        {copiedRecord === 'dkim2-value' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Brevo Code Record */}
              {configDomain?.dnsRecords?.brevoCode && (
                <div className={`border rounded-lg p-3 space-y-2 ${configDomain.dnsRecords.brevoCode.verified ? 'border-green-200 bg-green-500/5' : 'border-red-200 bg-red-500/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Brevo Code</span>
                      <Badge variant="outline" className="text-xs">TXT</Badge>
                    </div>
                    {configDomain.dnsRecords.brevoCode.verified ? (
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
                        {configDomain.dnsRecords.brevoCode.host}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(configDomain.dnsRecords!.brevoCode!.host, 'brevo-host')}
                        title="Copy host"
                      >
                        {copiedRecord === 'brevo-host' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground min-w-[40px]">Value:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                        {configDomain.dnsRecords.brevoCode.value}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(configDomain.dnsRecords!.brevoCode!.value, 'brevo-value')}
                        title="Copy value"
                      >
                        {copiedRecord === 'brevo-value' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* Status message */}
                  {configDomain.dnsRecords.brevoCode.verified ? (
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
              )}

              {/* DMARC Record */}
              {configDomain?.dnsRecords?.dmarc_record && (
                <div className={`border rounded-lg p-3 space-y-2 ${configDomain.dnsRecords.dmarc_record.verified ? 'border-green-200 bg-green-500/5' : 'border-red-200 bg-red-500/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">DMARC Record</span>
                      <Badge variant="outline" className="text-xs">TXT</Badge>
                    </div>
                    {configDomain.dnsRecords.dmarc_record.verified ? (
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
                        {configDomain.dnsRecords.dmarc_record.host}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(configDomain.dnsRecords!.dmarc_record!.host, 'dmarc-host')}
                        title="Copy host"
                      >
                        {copiedRecord === 'dmarc-host' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground min-w-[40px]">Value:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                        {configDomain.dnsRecords.dmarc_record.value}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(configDomain.dnsRecords!.dmarc_record!.value, 'dmarc-value')}
                        title="Copy value"
                      >
                        {copiedRecord === 'dmarc-value' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* Status message */}
                  {configDomain.dnsRecords.dmarc_record.verified ? (
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
              )}

              {/* No records message */}
              {/* No records message */}
              {!configDomain?.dnsRecords?.dkimRecord && 
               !configDomain?.dnsRecords?.dkim1Record && 
               !configDomain?.dnsRecords?.dkim2Record && 
               !configDomain?.dnsRecords?.brevoCode && 
               !configDomain?.dnsRecords?.dmarc_record && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No DNS records available for this domain.
                </div>
              )}
            </div>

            {/* Info message */}
            {!configDomain?.authenticated && (
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
            <Button variant="outline" onClick={() => setDnsConfigDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={checkDomainConfig} disabled={checkingConfig}>
              {checkingConfig && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}