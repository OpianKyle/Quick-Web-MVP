import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LogOut, 
  LayoutDashboard, 
  Briefcase,
  Globe, 
  Share2, 
  FileText, 
  ShieldCheck,
  User as UserIcon,
  ChevronUp
} from "lucide-react";
import { isAdminUser } from "@/lib/rbac";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Tenders", href: "/tenders", icon: Briefcase },
    { label: "Website Builder", href: "/website", icon: Globe },
    { label: "Social Media", href: "/social", icon: Share2 },
    { label: "Invoices", href: "/invoices", icon: FileText },
  ];

  const adminItems = [
    { label: "Admin Dashboard", href: "/admin", icon: ShieldCheck },
  ];

  const isAdmin = isAdminUser(user);

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-6 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_South_Africa_%281932-2000%29.svg/359px-Coat_of_arms_of_South_Africa_%281932-2000%29.svg.png')] bg-contain bg-no-repeat bg-center" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">RSA</span>
            <span className="text-xs font-display font-bold text-primary leading-none">SMME Digital</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location === item.href} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={location === item.href} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {user?.firstName?.[0] || <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col items-start text-sm truncate">
                      <span className="font-medium truncate">{user?.firstName || "User"}</span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                    <ChevronUp className="ml-auto h-4 w-4" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
