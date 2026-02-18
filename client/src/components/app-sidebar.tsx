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
    { label: "Tax & Compliance", href: "/tax", icon: ShieldCheck },
  ];

  const adminItems = [
    { label: "Admin Dashboard", href: "/admin", icon: ShieldCheck },
  ];

  const isAdmin = isAdminUser(user);

  return (
    <Sidebar className="border-r border-slate-200/60 bg-white shadow-sm">
      <SidebarHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center gap-4">
          <div className="h-10 w-8 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_South_Africa_%281932-2000%29.svg/359px-Coat_of_arms_of_South_Africa_%281932-2000%29.svg.png')] bg-contain bg-no-repeat bg-center drop-shadow-sm" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Republic</span>
            <span className="text-sm font-black text-slate-900 leading-none">SMME DIGITAL</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Systems</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href} 
                    tooltip={item.label}
                    className="h-11 rounded-xl px-4 transition-all data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-100 hover:bg-slate-50"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-bold">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Oversight</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.href} 
                      tooltip={item.label}
                      className="h-11 rounded-xl px-4 transition-all data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-100 hover:bg-slate-50"
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-bold">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3 px-1 w-full">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-100">
                      {user?.firstName?.[0] || <UserIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col items-start text-sm truncate flex-1">
                      <span className="font-black text-slate-900 truncate leading-none mb-1">{user?.firstName || "User"}</span>
                      <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">{user?.email}</span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
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
