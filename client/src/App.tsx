import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import "@/lib/i18n";

import LandingPage from "@/pages/LandingPage";
import HomePage from "@/pages/HomePage";
import PropertyDetail from "@/pages/PropertyDetail";
import CreateListing from "@/pages/CreateListing";
import FavoritesPage from "@/pages/FavoritesPage";
import ProfilePage from "@/pages/ProfilePage";
import SupportPage from "@/pages/SupportPage";
import AdminSettingsPage from "@/pages/AdminSettingsPage";
import NotFound from "@/pages/not-found";

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? HomePage : LandingPage} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/create" component={CreateListing} />
      <Route path="/edit/:id" component={CreateListing} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AppRoutes />
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
