import { useEffect, useState } from "react";
import { useSmeProfile, useRedeemVoucher, useCreateSmeProfile, useAdminStats } from "@/hooks/use-sme";
import { useAuth } from "@/hooks/use-auth";
import { 
  Loader2, CheckCircle, Ticket, Store, MapPin, Phone, Mail, 
  Share2, FileText, ShieldAlert, ShieldCheck, Briefcase,
  TrendingUp, Users, Activity
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSmeProfileSchema, type InsertSmeProfile } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isAdminUser } from "@/lib/rbac";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats } from "@/components/DashboardStats";

function DevAdminPromotion() {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const promote = async () => {
    setIsPending(true);
    try {
      await apiRequest("POST", "/api/admin/promote");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "You have been promoted to Admin for testing purposes.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote to admin.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  if (import.meta.env.PROD) return null;

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
          <ShieldAlert className="w-4 h-4" />
          Developer Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-red-600 dark:text-red-300 mb-3">
          Use this button to grant yourself Admin privileges for testing.
        </p>
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full"
          onClick={promote}
          disabled={isPending}
        >
          {isPending ? "Promoting..." : "Become Admin"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile } = useSmeProfile();
  const { data: stats } = useAdminStats();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const admin = isAdminUser(user);

  useEffect(() => {
    if (!isLoadingProfile && !profile && !admin) {
      setShowOnboarding(true);
    }
  }, [profile, isLoadingProfile, admin]);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const chartData = [
    { name: 'Mon', usage: 40 },
    { name: 'Tue', usage: 30 },
    { name: 'Wed', usage: 65 },
    { name: 'Thu', usage: 45 },
    { name: 'Fri', usage: 90 },
    { name: 'Sat', usage: 35 },
    { name: 'Sun', usage: 25 },
  ];

  return (
    <>
      <OnboardingDialog open={showOnboarding} onOpenChange={setShowOnboarding} />

      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
              Welcome back, <span className="text-primary">{user?.firstName || "Entrepreneur"}</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {admin ? "System administration and platform oversight." : "Monitor your business growth and digital presence."}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {admin ? (
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold shadow-sm">
                 <ShieldCheck className="w-5 h-5" />
                 Administrator
               </div>
            ) : profile?.subscriptionStatus === "active" ? (
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold shadow-sm">
                 <CheckCircle className="w-5 h-5" />
                 Premium Member
               </div>
            ) : (
              <VoucherRedemptionCard />
            )}
          </div>
        </div>

        {/* Analytics Section */}
        {stats && (
          <div className="space-y-8">
            <DashboardStats 
              totalSmes={stats.totalSmes}
              activeSubscriptions={stats.activeSubscriptions}
              redeemedVouchers={stats.redeemedVouchers}
            />
            
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 shadow-sm border-border/50 bg-white/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 pb-4">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Platform Performance
                    </CardTitle>
                    <CardDescription>Daily engagement metrics for the current week</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="font-semibold shadow-sm">View Detailed Report</Button>
                </CardHeader>
                <CardContent className="h-[300px] pt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false} 
                        fontSize={12} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        fontSize={12} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: '1px solid hsl(var(--border))', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          padding: '12px'
                        }}
                      />
                      <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50 bg-white/50 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/5 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-secondary" />
                    Key Performance Indicators
                  </CardTitle>
                  <CardDescription>Critical business health markers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white border border-border/50 shadow-sm transition-all hover:border-primary/20">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">Voucher Conversion</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Successful redemptions</div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((stats.redeemedVouchers / (stats.totalSmes || 1)) * 100)}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white border border-border/50 shadow-sm transition-all hover:border-primary/20">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">Platform Stability</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">System uptime status</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 uppercase tracking-tighter">Optimal</div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white border border-border/50 shadow-sm transition-all hover:border-primary/20">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">Network Growth</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">New signups (24h)</div>
                    </div>
                    <div className="text-2xl font-bold text-secondary">+12</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {admin && (
              <Card className="border-primary/20 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <div className="h-2 bg-primary" />
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Administrative Console</CardTitle>
                  <CardDescription className="text-base">High-level management of the SME ecosystem</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6 pb-8">
                  <Link href="/admin">
                    <div className="group p-6 rounded-2xl border border-border bg-white hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer shadow-sm hover:shadow-md">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-xl text-foreground">Governance Portal</h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">Oversee vouchers, user auditing, and strategic tender placements.</p>
                    </div>
                  </Link>
                  <Link href="/tenders">
                    <div className="group p-6 rounded-2xl border border-border bg-white hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer shadow-sm hover:shadow-md">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-xl text-foreground">Tender Pipeline</h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">Facilitate economic growth by managing public and private sector opportunities.</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {profile && (
              <Card className="border-border shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-muted/10 border-b p-6">
                  <CardTitle className="text-2xl font-bold">Digital Enablement Suite</CardTitle>
                  <CardDescription className="text-base font-medium">Professional tools to scale your business operations</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-6 p-8">
                  <Link href="/website">
                    <div className="group p-6 rounded-2xl border border-border bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer text-center shadow-sm">
                      <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform shadow-inner">
                        <Store className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">Web Presence</h3>
                      <p className="text-xs text-muted-foreground mt-2 font-semibold uppercase tracking-tighter">Manage storefront</p>
                    </div>
                  </Link>
                  
                  <Link href="/social">
                    <div className="group p-6 rounded-2xl border border-border bg-white hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer text-center shadow-sm">
                      <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform shadow-inner">
                        <Share2 className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">Social Connect</h3>
                      <p className="text-xs text-muted-foreground mt-2 font-semibold uppercase tracking-tighter">Marketing reach</p>
                    </div>
                  </Link>

                  <Link href="/invoices">
                    <div className="group p-6 rounded-2xl border border-border bg-white hover:border-amber-400 hover:bg-amber-50/50 transition-all cursor-pointer text-center shadow-sm">
                      <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform shadow-inner">
                        <FileText className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">Finance Hub</h3>
                      <p className="text-xs text-muted-foreground mt-2 font-semibold uppercase tracking-tighter">Smart billing</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            {!admin && <DevAdminPromotion />}

            {profile && (
              <Card className="shadow-sm border-border bg-white/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b bg-muted/10 p-5">
                  <CardTitle className="text-lg font-bold">Verified Business Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                      {profile.businessName.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl leading-tight">{profile.businessName}</h3>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                        {profile.industry}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-start gap-3 text-sm group">
                      <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                        <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-muted-foreground font-medium pt-1 leading-tight">{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm group">
                      <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                        <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-muted-foreground font-medium">{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm group">
                      <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                        <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-muted-foreground font-medium truncate">{profile.email}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4 font-bold h-11 border-border/60 hover:bg-muted hover:border-border shadow-sm">
                    Manage Corporate Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function OnboardingDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { mutate: createProfile, isPending } = useCreateSmeProfile();
  const { user } = useAuth();
  
  const form = useForm<InsertSmeProfile>({
    resolver: zodResolver(insertSmeProfileSchema),
    defaultValues: {
      businessName: "",
      ownerName: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
      phone: "",
      email: user?.email || "",
      location: "",
      industry: "",
      productsServices: "",
      popiaConsent: false,
    }
  });

  const onSubmit = (data: InsertSmeProfile) => {
    createProfile(data, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isPending) onOpenChange(val);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">Register Your Business</DialogTitle>
          <DialogDescription>
            Complete your profile to unlock the digital enablement tools.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input {...form.register("businessName")} placeholder="e.g. Soweto Bakery" />
              {form.formState.errors.businessName && <p className="text-xs text-destructive">{form.formState.errors.businessName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Owner Name</Label>
              <Input {...form.register("ownerName")} />
              {form.formState.errors.ownerName && <p className="text-xs text-destructive">{form.formState.errors.ownerName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input {...form.register("phone")} placeholder="082 123 4567" />
              {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input {...form.register("email")} />
              {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Location / City</Label>
              <Input {...form.register("location")} placeholder="e.g. Pretoria" />
              {form.formState.errors.location && <p className="text-xs text-destructive">{form.formState.errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input {...form.register("industry")} placeholder="e.g. Retail, Construction" />
              {form.formState.errors.industry && <p className="text-xs text-destructive">{form.formState.errors.industry.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Products & Services</Label>
            <Textarea {...form.register("productsServices")} placeholder="Briefly describe what you sell..." />
            {form.formState.errors.productsServices && <p className="text-xs text-destructive">{form.formState.errors.productsServices.message}</p>}
          </div>

          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox 
              id="popia" 
              checked={form.watch("popiaConsent")}
              onCheckedChange={(c) => form.setValue("popiaConsent", c as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="popia"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                POPIA Consent
              </label>
              <p className="text-xs text-muted-foreground">
                I consent to the processing of my personal information for the purpose of the SMME Digital Enablement programme.
              </p>
              {form.formState.errors.popiaConsent && <p className="text-xs text-destructive">{form.formState.errors.popiaConsent.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 text-lg" disabled={isPending}>
            {isPending ? "Registering..." : "Complete Registration"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VoucherRedemptionCard() {
  const [code, setCode] = useState("");
  const { mutate: redeem, isPending } = useRedeemVoucher();

  return (
    <Card className="border-secondary/20 bg-secondary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Ticket className="w-4 h-4 text-secondary" />
          Activate Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Input 
          placeholder="Enter Voucher Code" 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          className="bg-white"
        />
        <Button 
          onClick={() => redeem(code)} 
          disabled={!code || isPending}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {isPending ? "..." : "Redeem"}
        </Button>
      </CardContent>
    </Card>
  );
}
