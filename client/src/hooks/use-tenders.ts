import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Tender, TenderBid, SmeProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTenders() {
  return useQuery({
    queryKey: [api.tenders.list.path],
    queryFn: async () => {
      const res = await fetch(api.tenders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tenders");
      return api.tenders.list.responses[200].parse(await res.json()) as Tender[];
    },
  });
}

export function useTender(id: number | undefined) {
  return useQuery({
    queryKey: [id ? buildUrl(api.tenders.get.path, { id }) : "tender:missing"],
    enabled: typeof id === "number" && Number.isFinite(id),
    queryFn: async () => {
      const url = buildUrl(api.tenders.get.path, { id: id! });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch tender");
      return api.tenders.get.responses[200].parse(await res.json()) as Tender;
    },
  });
}

export function useMyTenderBid(tenderId: number | undefined) {
  return useQuery({
    queryKey: [tenderId ? buildUrl(api.tenders.myBid.path, { id: tenderId }) : "bid:missing"],
    enabled: typeof tenderId === "number" && Number.isFinite(tenderId),
    queryFn: async () => {
      const url = buildUrl(api.tenders.myBid.path, { id: tenderId! });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch bid");
      return api.tenders.myBid.responses[200].parse(await res.json()) as TenderBid;
    },
  });
}

export function useSubmitTenderBid(tenderId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { amountCents?: number; proposal: string }) => {
      const url = buildUrl(api.tenders.submitBid.path, { id: tenderId });
      const res = await fetch(url, {
        method: api.tenders.submitBid.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit bid");
      }
      return api.tenders.submitBid.responses[201].parse(await res.json()) as TenderBid;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [buildUrl(api.tenders.myBid.path, { id: tenderId })] });
      toast({ title: "Bid submitted", description: "Your bid was submitted for review." });
    },
    onError: (error: Error) => {
      toast({ title: "Bid failed", description: error.message, variant: "destructive" });
    },
  });
}

// Admin-facing hooks
export function useAdminTenders() {
  return useQuery({
    queryKey: [api.adminTenders.list.path],
    queryFn: async () => {
      const res = await fetch(api.adminTenders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin tenders");
      return api.adminTenders.list.responses[200].parse(await res.json()) as Tender[];
    },
  });
}

export function useAdminCreateTender() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category?: string | null;
      location?: string | null;
      budgetCents?: number | null;
      deadlineAt?: string | null;
    }) => {
      const res = await fetch(api.adminTenders.create.path, {
        method: api.adminTenders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create tender");
      }
      return api.adminTenders.create.responses[201].parse(await res.json()) as Tender;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.adminTenders.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.tenders.list.path] });
      toast({ title: "Tender posted", description: "The tender is now visible to businesses." });
    },
    onError: (error: Error) => {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    },
  });
}

export function useAdminTenderBids(tenderId: number | undefined) {
  return useQuery({
    queryKey: [tenderId ? buildUrl(api.adminTenders.bids.path, { id: tenderId }) : "admin-bids:missing"],
    enabled: typeof tenderId === "number" && Number.isFinite(tenderId),
    queryFn: async () => {
      const url = buildUrl(api.adminTenders.bids.path, { id: tenderId! });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch bids");
      type Row = { bid: TenderBid; profile: SmeProfile };
      return api.adminTenders.bids.responses[200].parse(await res.json()) as Row[];
    },
  });
}

export function useAdminUpdateBidStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { bidId: number; status: TenderBid["status"] }) => {
      const url = buildUrl(api.adminTenders.updateBidStatus.path, { id: data.bidId });
      const res = await fetch(url, {
        method: api.adminTenders.updateBidStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: data.status }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update bid");
      }
      return api.adminTenders.updateBidStatus.responses[200].parse(await res.json()) as TenderBid;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.adminTenders.list.path] });
      toast({ title: "Updated", description: "Bid status updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });
}

