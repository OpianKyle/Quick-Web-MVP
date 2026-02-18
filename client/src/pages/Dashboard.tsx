import { useEffect, useState } from "react";
import { useSmeProfile, useRedeemVoucher, useCreateSmeProfile, useAdminStats } from "@/hooks/use-sme";
import { useAuth } from "@/hooks/use-auth";
import { 
  Loader2, CheckCircle, Ticket, Store, MapPin, Phone, Mail, 
  Share2, FileText, ShieldAlert, ShieldCheck, Briefcase,
  TrendingUp, Users, Activity, Scale, FileCheck, AlertCircle
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats } from "@/components/DashboardStats";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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

      <div className="space-y-10 pb-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-slate-200/60">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">
              Good morning, <span className="text-blue-600">{user?.firstName || "Partner"}</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium">
              {admin ? "System administration and ecosystem oversight." : "Your business growth overview and digital tools."}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {admin ? (
               <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl font-bold shadow-sm ring-1 ring-blue-200/50">
                 <ShieldCheck className="w-5 h-5" />
                 Platform Admin
               </div>
            ) : profile?.subscriptionStatus === "active" ? (
               <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold shadow-sm ring-1 ring-emerald-200/50">
                 <CheckCircle className="w-5 h-5" />
                 Premium Verified
               </div>
            ) : (
              <VoucherRedemptionCard />
            )}
          </div>
        </div>

        {/* Analytics Section */}
        {stats && (
          <div className="space-y-10">
            <DashboardStats 
              totalSmes={stats.totalSmes}
              activeSubscriptions={stats.activeSubscriptions}
              redeemedVouchers={stats.redeemedVouchers}
            />
            
            <div className="grid lg:grid-cols-3 gap-10">
              <Card className="lg:col-span-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-8">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      Monthly Registrations
                    </CardTitle>
                    <CardDescription className="text-base text-slate-500">Business growth over time</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="h-[340px] p-8 pt-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyRegistrations} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="month" 
                        tickLine={false} 
                        axisLine={false} 
                        fontSize={13} 
                        tick={{ fill: '#64748B', fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        fontSize={13} 
                        tick={{ fill: '#64748B', fontWeight: 600 }}
                      />
                      <Tooltip 
                        cursor={{ fill: '#F8FAFC' }}
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                          padding: '16px'
                        }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-8">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Activity className="w-6 h-6 text-amber-600" />
                    </div>
                    Industry Mix
                  </CardTitle>
                  <CardDescription className="text-base text-slate-500">Business sector distribution</CardDescription>
                </CardHeader>
                <CardContent className="h-[340px] p-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.industryDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.industryDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-10">
            {admin && (
              <Card className="border-blue-100 shadow-[0_20px_50px_rgba(59,130,246,0.05)] overflow-hidden bg-white rounded-3xl">
                <div className="h-2.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl font-bold text-slate-900">Enterprise Control</CardTitle>
                  <CardDescription className="text-lg font-medium text-slate-500">Centralized ecosystem management and oversight</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-8 p-8 pt-0">
                  <Link href="/admin">
                    <div className="group p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                      <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-2xl text-slate-900">Governance</h3>
                      <p className="text-base text-slate-500 mt-3 leading-relaxed">System-wide auditing, user validation, and voucher lifecycle management.</p>
                    </div>
                  </Link>
                  <Link href="/tenders">
                    <div className="group p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                      <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                        <Briefcase className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-2xl text-slate-900">Opportunities</h3>
                      <p className="text-base text-slate-500 mt-3 leading-relaxed">Strategic tender pipeline management and corporate partnership alignment.</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {profile && (
              <Card className="border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white rounded-3xl">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                  <CardTitle className="text-3xl font-bold text-slate-900">Digital Suite</CardTitle>
                  <CardDescription className="text-lg font-medium text-slate-500">Advanced professional tools to scale your operations</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-8 p-10">
                  <Link href="/website">
                    <div className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer text-center shadow-sm hover:shadow-lg">
                      <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-5 group-hover:rotate-6 transition-transform shadow-inner">
                        <Store className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl text-slate-900">Web</h3>
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Storefront</p>
                    </div>
                  </Link>
                  
                  <Link href="/social">
                    <div className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer text-center shadow-sm hover:shadow-lg">
                      <div className="h-16 w-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-5 group-hover:rotate-6 transition-transform shadow-inner">
                        <Share2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl text-slate-900">Social</h3>
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Presence</p>
                    </div>
                  </Link>

                  <Link href="/invoices">
                    <div className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer text-center shadow-sm hover:shadow-lg">
                      <div className="h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5 group-hover:rotate-6 transition-transform shadow-inner">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl text-slate-900">Finance</h3>
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Invoicing</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-10">
            {!admin && <DevAdminPromotion />}

            {profile && (
              <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-slate-900">Tax & Compliance</CardTitle>
                    <Scale className="w-5 h-5 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <FileCheck className={`w-5 h-5 ${profile.complianceStatus === 'compliant' ? 'text-emerald-500' : 'text-amber-500'}`} />
                      <span className="font-bold text-slate-700">SARS Status</span>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded ${profile.complianceStatus === 'compliant' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {profile.complianceStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">B-BBEE Level</div>
                      <div className="text-lg font-bold text-slate-900">{profile.beeLevel || "Not Set"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CSD Reg</div>
                      <div className="text-lg font-bold text-slate-900 truncate">{profile.csdNumber ? "Registered" : "Pending"}</div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full font-bold border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl shadow-sm">
                    Update Documents
                  </Button>
                </CardContent>
              </Card>
            )}

            {profile && (
              <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
                  <CardTitle className="text-xl font-bold text-slate-900">Corporate Identity</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="h-20 w-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-200">
                      {profile.businessName.charAt(0)}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-2xl text-slate-900 leading-tight">{profile.businessName}</h3>
                      <div className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest">
                        {profile.industry}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-5 pt-8 border-t border-slate-100">
                    <div className="flex items-start gap-4 group">
                      <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
                        <MapPin className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <span className="text-slate-600 font-semibold pt-2 leading-relaxed">{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
                        <Phone className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <span className="text-slate-600 font-semibold">{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
                        <Mail className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <span className="text-slate-600 font-semibold truncate">{profile.email}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-10 font-bold h-12 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl shadow-sm">
                    Modify Profile
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