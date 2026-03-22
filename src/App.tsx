import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import InventoryPage from "./pages/InventoryPage";
import PricingPage from "./pages/PricingPage";
import BillingPage from "./pages/BillingPage";
import PaymentsPage from "./pages/PaymentsPage";
import SupplyChainPage from "./pages/SupplyChainPage";
import OcrPage from "./pages/OcrPage";
import ReportsPage from "./pages/ReportsPage";
import BatchPage from "./pages/BatchPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
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
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
