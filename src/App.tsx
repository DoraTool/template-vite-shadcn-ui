import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "./App.css";
import ButtonShowcase from "./components/ui/button.stories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/specai-page/Index" element={<Index />} />
          <Route path="/specai-page/NotFound" element={<NotFound />} />
          <Route path="/specai-component/button" element={<ButtonShowcase />} />

          <Route path="/" element={<Index data-dora-id="1" />} />
          {/* Place all custom routes above the catch-all "*" route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
