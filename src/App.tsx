import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { RoleProvider } from "@/contexts/RoleContext";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/shared/DashboardPage";
import ProjectsPage from "./pages/shared/ProjectsPage";
import InventoryPage from "./pages/shared/InventoryPage";
import PricingPage from "./pages/shared/PricingPage";
import BillingPage from "./pages/shared/BillingPage";
import PaymentsPage from "./pages/shared/PaymentsPage";
import SupplyChainPage from "./pages/shared/SupplyChainPage";
import OcrPage from "./pages/shared/OcrPage";
import ReportsPage from "./pages/shared/ReportsPage";
import QuotationsPage from "./pages/shared/QuotationsPage";
import FabricatorsPage from "./pages/shared/FabricatorsPage";
import NotFound from "./pages/shared/NotFound";

import AdminPage from "./pages/admin/AdminPage";
import BatchPage from "./pages/admin/BatchPage";

import OptimizationPage from "./pages/fabricator/OptimizationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fabricators" element={<FabricatorsPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/supply-chain" element={<SupplyChainPage />} />
            <Route path="/ocr" element={<OcrPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/batch" element={<BatchPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/optimization" element={<OptimizationPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
