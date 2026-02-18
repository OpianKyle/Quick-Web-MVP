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
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

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

  // Logged in -> App Routes with Sidebar
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border mx-2" />
            <div className="flex-1">
              <span className="text-sm font-medium text-muted-foreground">
                SMME Digital Enablement Platform
              </span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
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
