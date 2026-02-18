import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useSmeProfile, useRedeemVoucher, useCreateSmeProfile } from "@/hooks/use-sme";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle, CheckCircle, Ticket, Store, MapPin, Phone, Mail } from "lucide-react";
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

import { Share2, FileText, ShieldAlert } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const admin = isAdminUser(user);

  // Effect to show onboarding if no profile exists
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

  return (
    <Layout>
      <OnboardingDialog open={showOnboarding} onOpenChange={setShowOnboarding} />

      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">
              Welcome back, <span className="text-primary">{user?.firstName || "Entrepreneur"}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {admin ? "You are logged in as an administrator." : "Here is what is happening with your business today."}
            </p>
          </div>
          
          {admin ? (
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
               <ShieldCheck className="w-4 h-4" />
               Administrator Access
             </div>
          ) : profile?.subscriptionStatus === "active" ? (
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
               <CheckCircle className="w-4 h-4" />
               Subscription Active
             </div>
          ) : (
            <VoucherRedemptionCard />
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {admin && (
              <Card className="border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle>Administration</CardTitle>
                  <CardDescription>Manage the SME platform</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <Link href="/admin">
                    <div className="group p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-lg">Admin Dashboard</h3>
                      <p className="text-sm text-muted-foreground mt-1">Manage vouchers, users, and tenders</p>
                    </div>
                  </Link>
                  <Link href="/tenders">
                    <div className="group p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-lg">Manage Tenders</h3>
                      <p className="text-sm text-muted-foreground mt-1">Post and review job tenders</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {profile && (
              <Card className="border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle>Your Business Tools</CardTitle>
                  <CardDescription>Access your digital enablement suite</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <Link href="/website">
                    <div className="group p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Store className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-lg">Website Builder</h3>
                      <p className="text-sm text-muted-foreground mt-1">Manage your online presence</p>
                    </div>
                  </Link>
                  
                  <Link href="/social">
                    <div className="group p-4 rounded-xl border border-border hover:border-purple/50 hover:bg-purple-50 transition-all cursor-pointer">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-lg">Social Media</h3>
                      <p className="text-sm text-muted-foreground mt-1">Create engaging posts</p>
                    </div>
                  </Link>

                  <Link href="/invoices">
                    <div className="group p-4 rounded-xl border border-border hover:border-yellow/50 hover:bg-yellow-50 transition-all cursor-pointer">
                      <div className="h-10 w-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-lg">Invoicing</h3>
                      <p className="text-sm text-muted-foreground mt-1">Send professional bills</p>
                    </div>
                  </Link>

                  <div className="p-4 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center text-muted-foreground">
                    <span className="text-sm">More tools coming soon...</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {!admin && <DevAdminPromotion />}

            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{profile.businessName}</h3>
                    <p className="text-sm text-muted-foreground">{profile.industry}</p>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>{profile.email}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2">Edit Profile</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Sub-components

import { Share2, FileText, ShieldCheck, Briefcase } from "lucide-react";
import { isAdminUser } from "@/lib/rbac";

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
      // Prevent closing if submitting or strictly required
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
