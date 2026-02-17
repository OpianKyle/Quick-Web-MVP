import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Briefcase,
  Globe, 
  Share2, 
  FileText, 
  Settings,
  ShieldCheck,
  User as UserIcon
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { isAdminUser } from "@/lib/rbac";

// Static asset for Crest placeholder - using a generic shield icon if image fails
// For production, use actual SA Crest
const SaCrest = () => (
  <div className="h-10 w-auto flex items-center gap-3">
    <div className="h-10 w-8 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_South_Africa_%281932-2000%29.svg/359px-Coat_of_arms_of_South_Africa_%281932-2000%29.svg.png')] bg-contain bg-no-repeat bg-center opacity-90" />
    <div className="hidden md:flex flex-col justify-center border-l-2 border-primary/20 pl-3">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Republic of South Africa</span>
      <span className="text-sm font-display font-bold text-primary leading-none">SMME Digital Enablement</span>
    </div>
  </div>
);

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simplified navigation items
  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Tenders", href: "/tenders", icon: Briefcase },
    { label: "Website Builder", href: "/website", icon: Globe },
    { label: "Social Media", href: "/social", icon: Share2 },
    { label: "Invoices", href: "/invoices", icon: FileText },
  ];

  // Admin items
  const adminItems = [
    { label: "Admin Dashboard", href: "/admin", icon: ShieldCheck },
  ];

  const currentNav = isAdminUser(user) ? [...navItems, ...adminItems] : navItems;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar - Government Style */}
      <div className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <SaCrest />
            </div>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-1">
                {currentNav.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                      location === item.href 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}>
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="h-6 w-px bg-border mx-2" />

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.firstName?.[0] || <UserIcon className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">
                    {user.firstName || "User"}
                  </span>
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden bg-white border-b border-border p-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2">
            {currentNav.map((item) => (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "px-4 py-3 rounded-md text-sm font-medium flex items-center gap-3",
                    location === item.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <button 
              onClick={() => logout()}
              className="w-full px-4 py-3 rounded-md text-sm font-medium flex items-center gap-3 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-foreground">Republic of South Africa</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
