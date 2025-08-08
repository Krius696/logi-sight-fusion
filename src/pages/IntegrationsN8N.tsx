import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useN8N, type N8NConfig } from "@/hooks/useN8N";
import { useToast } from "@/hooks/use-toast";
import { Check, Link as LinkIcon, Shield, TestTube2, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const IntegrationsN8N = () => {
  const { config, saveConfig, triggerByKey, getConfig } = useN8N();
  const { toast } = useToast();
  const [form, setForm] = useState<N8NConfig>(() => ({ token: config.token, webhooks: { ...config.webhooks } }));
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = "n8n Integration | Dashboard";
  }, []);

  const handleSave = () => {
    saveConfig(form);
  };

  const handleTest = async (key: keyof N8NConfig["webhooks"]) => {
    setTesting((s) => ({ ...s, [key]: true }));
    await triggerByKey(key as any, { test: true, message: "Ping von Dashboard" });
    setTesting((s) => ({ ...s, [key]: false }));
  };

  const updateWebhook = (key: keyof N8NConfig["webhooks"], value: string) => {
    setForm((f) => ({ ...f, webhooks: { ...(f.webhooks || {}), [key]: value } }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Start</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>n8n</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold text-foreground">n8n-Integration</h1>
            <p className="text-sm text-muted-foreground">Konfiguriere Token und Webhook-URLs. Wir senden Bearer-Token im Authorization-Header.</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sicherheit</CardTitle>
            <CardDescription>Token wird im Browser (localStorage) gespeichert. Für produktive Nutzung empfehlen wir die Supabase-Proxy-/Edge-Funktion.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="token" className="flex items-center gap-2"><Shield className="w-4 h-4" /> Webhook-Token (Bearer)</Label>
              <Input id="token" type="password" placeholder="z.B. eyJhbGci..." value={form.token || ""} onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh1" className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Transport-Tracking Webhook</Label>
              <div className="flex gap-2">
                <Input id="wh1" placeholder="https://n8n.example.com/webhook/transport" value={form.webhooks?.transportTracking || ""} onChange={(e) => updateWebhook("transportTracking", e.target.value)} />
                <Button type="button" variant="secondary" onClick={() => handleTest("transportTracking")} disabled={testing["transportTracking"]}>
                  {testing["transportTracking"] ? <TestTube2 className="w-4 h-4 animate-pulse" /> : <Check className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh2" className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Kostenanalyse Webhook</Label>
              <div className="flex gap-2">
                <Input id="wh2" placeholder="https://n8n.example.com/webhook/cost" value={form.webhooks?.costAnalysis || ""} onChange={(e) => updateWebhook("costAnalysis", e.target.value)} />
                <Button type="button" variant="secondary" onClick={() => handleTest("costAnalysis")} disabled={testing["costAnalysis"]}>
                  {testing["costAnalysis"] ? <TestTube2 className="w-4 h-4 animate-pulse" /> : <Check className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh3" className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Bestandsoptimierung Webhook</Label>
              <div className="flex gap-2">
                <Input id="wh3" placeholder="https://n8n.example.com/webhook/inventory" value={form.webhooks?.inventoryOptimization || ""} onChange={(e) => updateWebhook("inventoryOptimization", e.target.value)} />
                <Button type="button" variant="secondary" onClick={() => handleTest("inventoryOptimization")} disabled={testing["inventoryOptimization"]}>
                  {testing["inventoryOptimization"] ? <TestTube2 className="w-4 h-4 animate-pulse" /> : <Check className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh4" className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> KI-Empfehlungen Webhook</Label>
              <div className="flex gap-2">
                <Input id="wh4" placeholder="https://n8n.example.com/webhook/ai" value={form.webhooks?.aiRecommendations || ""} onChange={(e) => updateWebhook("aiRecommendations", e.target.value)} />
                <Button type="button" variant="secondary" onClick={() => handleTest("aiRecommendations")} disabled={testing["aiRecommendations"]}>
                  {testing["aiRecommendations"] ? <TestTube2 className="w-4 h-4 animate-pulse" /> : <Check className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default IntegrationsN8N;
