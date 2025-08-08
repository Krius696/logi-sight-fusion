import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TransportTracking from "./pages/TransportTracking";
import CostAnalysis from "./pages/CostAnalysis";
import InventoryOptimization from "./pages/InventoryOptimization";
import AIRecommendations from "./pages/AIRecommendations";
import IntegrationsN8N from "./pages/IntegrationsN8N";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/transport-tracking" element={<TransportTracking />} />
          <Route path="/cost-analysis" element={<CostAnalysis />} />
          <Route path="/inventory-optimization" element={<InventoryOptimization />} />
          <Route path="/ai-recommendations" element={<AIRecommendations />} />
          <Route path="/integrations/n8n" element={<IntegrationsN8N />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
