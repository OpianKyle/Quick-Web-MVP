import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertSmeProfile, type InsertInvoice } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// SME Profile Hooks
export function useSmeProfile() {
  return useQuery({
    queryKey: [api.sme.get.path],
    queryFn: async () => {
      const res = await fetch(api.sme.get.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.sme.get.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useCreateSmeProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertSmeProfile) => {
      const res = await fetch(api.sme.create.path, {
        method: api.sme.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create profile");
      }
      return api.sme.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sme.get.path] });
      toast({ title: "Success", description: "Profile created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: [api.sme.stats.path],
    queryFn: async () => {
      const res = await fetch(api.sme.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.sme.stats.responses[200].parse(await res.json());
    },
  });
}

// Voucher Hooks
export function useRedeemVoucher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(api.vouchers.redeem.path, {
        method: api.vouchers.redeem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to redeem voucher");
      }
      return api.vouchers.redeem.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sme.get.path] }); // Profile might update subscription status
      toast({ title: "Success", description: "Voucher redeemed! Your subscription is active." });
    },
    onError: (error: Error) => {
      toast({ title: "Redemption Failed", description: error.message, variant: "destructive" });
    },
  });
}

// Website Hooks
export function useWebsiteDraft() {
  return useQuery({
    queryKey: [api.website.get.path],
    queryFn: async () => {
      const res = await fetch(api.website.get.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch draft");
      return api.website.get.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateWebsite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (style: string) => {
      const res = await fetch(api.website.generate.path, {
        method: api.website.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to generate website");
      return api.website.generate.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.website.get.path] });
      toast({ title: "Success", description: "Website draft generated!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function usePublishWebsite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(api.website.publish.path, {
        method: api.website.publish.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to publish website");
      return api.website.publish.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.website.get.path] });
      toast({ title: "Live!", description: "Your website is now published to the world." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// Social Hooks
export function useSocialPosts() {
  return useQuery({
    queryKey: [api.social.list.path],
    queryFn: async () => {
      const res = await fetch(api.social.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return api.social.list.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateSocialPosts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.social.generate.path, {
        method: api.social.generate.method,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to generate posts");
      return api.social.generate.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.social.list.path] });
      toast({ title: "Success", description: "Social media posts drafted!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// Invoice Hooks
export function useInvoices() {
  return useQuery({
    queryKey: [api.invoices.list.path],
    queryFn: async () => {
      const res = await fetch(api.invoices.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return api.invoices.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInvoice) => {
      const res = await fetch(api.invoices.create.path, {
        method: api.invoices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create invoice");
      return api.invoices.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] });
      toast({ title: "Success", description: "Invoice created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
