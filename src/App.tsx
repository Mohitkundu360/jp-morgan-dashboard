import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import StockDetail from "./pages/StockDetail";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { Header } from "@/components/Header";

const queryClient = new QueryClient();

// Read environment variables from .env
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

console.log("API URL:", API_URL);
console.log("API KEY:", API_KEY);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Toasters */}
        <Toaster />
        <Sonner />

        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Header />

          {/* Pass API info as props if needed */}
          <Routes>
            <Route path="/auth" element={<Auth apiUrl={API_URL} apiKey={API_KEY} />} />
            <Route path="/" element={<Index apiUrl={API_URL} apiKey={API_KEY} />} />
            <Route path="/portfolio" element={<Portfolio apiUrl={API_URL} apiKey={API_KEY} />} />
            <Route path="/analytics" element={<Analytics apiUrl={API_URL} apiKey={API_KEY} />} />
            <Route path="/settings" element={<Settings apiUrl={API_URL} apiKey={API_KEY} />} />
            <Route path="/stock/:symbol" element={<StockDetail apiUrl={API_URL} apiKey={API_KEY} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
