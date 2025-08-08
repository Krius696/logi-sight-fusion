import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export type N8NWorkflowKey =
  | "transportTracking"
  | "costAnalysis"
  | "inventoryOptimization"
  | "aiRecommendations";

export type N8NConfig = {
  token?: string;
  webhooks: Partial<Record<N8NWorkflowKey, string>>;
};

const TOKEN_KEY = "n8n:token";
const WEBHOOKS_KEY = "n8n:webhooks";

function readConfig(): N8NConfig {
  const token = localStorage.getItem(TOKEN_KEY) || undefined;
  let webhooks: Record<string, string> = {};
  try {
    webhooks = JSON.parse(localStorage.getItem(WEBHOOKS_KEY) || "{}");
  } catch {}
  return { token, webhooks };
}

function writeConfig(next: N8NConfig) {
  if (typeof next.token === "string") {
    localStorage.setItem(TOKEN_KEY, next.token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(next.webhooks || {}));
}

export function useN8N() {
  const { toast } = useToast();
  const [config, setConfig] = useState<N8NConfig>(() => readConfig());

  const saveConfig = useCallback((partial: Partial<N8NConfig>) => {
    const merged: N8NConfig = {
      token: partial.token !== undefined ? partial.token : config.token,
      webhooks: { ...(config.webhooks || {}), ...(partial.webhooks || {}) },
    };
    writeConfig(merged);
    setConfig(merged);
    toast({ title: "Gespeichert", description: "n8n-Einstellungen aktualisiert." });
  }, [config, toast]);

  const triggerByKey = useCallback(
    async (key: N8NWorkflowKey, payload: unknown) => {
      const url = config.webhooks?.[key];
      if (!url) {
        toast({
          title: "Webhook fehlt",
          description: `Bitte URL für ${key} in den n8n-Einstellungen hinterlegen.`,
          variant: "destructive",
        });
        return;
      }

      try {
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
          },
          mode: "no-cors",
          body: JSON.stringify({
            _source: window.location.origin,
            _sentAt: new Date().toISOString(),
            ...((payload as object) || {}),
          }),
        });
        toast({
          title: "Anfrage gesendet",
          description: "Request an n8n ausgelöst. Prüfe n8n-Execution-Log.",
        });
      } catch (error) {
        console.error("n8n trigger error", error);
        toast({
          title: "Fehler",
          description: "Konnte n8n nicht erreichen. Prüfe URL/Token & CORS.",
          variant: "destructive",
        });
      }
    },
    [config, toast]
  );

  const getConfig = useCallback(() => readConfig(), []);

  return useMemo(() => ({ config, saveConfig, triggerByKey, getConfig }), [config, saveConfig, triggerByKey, getConfig]);
}
