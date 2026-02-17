import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import SmeRegistration from "@/pages/SmeRegistration";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Tenders from "@/pages/Tenders";
import TenderDetail from "@/pages/TenderDetail";
import WebsiteBuilder from "@/pages/WebsiteBuilder";
import SocialManager from "@/pages/SocialManager";
import Invoices from "@/pages/Invoices";
import NotFound from "@/pages/not-found";
import { useSmeProfile } from "@/hooks/use-sme";
import { isAdminUser } from "@/lib/rbac";

function Router() {
  const { user, isLoading: authLoading } = useAuth();
  
  const admin = isAdminUser(user);
  const { data: profile, isLoading: profileLoading } = useSmeProfile({ enabled: !!user && !admin });

  if (authLoading || (user && !admin && profileLoading)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Not logged in -> Landing Page
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={() => { window.location.href = "/"; return null; }} />
      </Switch>
    );
  }

  // Logged in but no profile -> Registration
  if (!admin && !profile) {
    return (
      <Switch>
        <Route path="/register" component={SmeRegistration} />
        <Route component={() => { window.location.href = "/register"; return null; }} />
      </Switch>
    );
  }

  // Logged in -> App Routes
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/tenders" component={Tenders} />
      <Route path="/tenders/:id" component={TenderDetail} />
      <Route path="/website" component={WebsiteBuilder} />
      <Route path="/social" component={SocialManager} />
      <Route path="/invoices" component={Invoices} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
