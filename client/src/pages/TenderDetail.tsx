import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { isAdminUser } from "@/lib/rbac";
import { useAdminTenderBids, useAdminUpdateBidStatus, useMyTenderBid, useSubmitTenderBid, useTender } from "@/hooks/use-tenders";
import type { TenderBid } from "@shared/schema";

function formatMoney(cents: number | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);
}

export default function TenderDetail({ params }: { params: { id: string } }) {
  const tenderId = Number(params.id);
  const { user } = useAuth();
  const admin = isAdminUser(user);

  const { data: tender, isLoading } = useTender(Number.isFinite(tenderId) ? tenderId : undefined);

  // Business bidding
  const { data: myBid } = useMyTenderBid(!admin && Number.isFinite(tenderId) ? tenderId : undefined);
  const submitMutation = useSubmitTenderBid(tenderId);
  const [amountZar, setAmountZar] = useState("");
  const [proposal, setProposal] = useState("");

  useEffect(() => {
    if (!myBid) return;
    setProposal(myBid.proposal ?? "");
    setAmountZar(myBid.amountCents != null ? String(myBid.amountCents / 100) : "");
  }, [myBid]);

  const onSubmitBid = async () => {
    const amountCents =
      amountZar.trim() === "" ? undefined : Math.max(1, Math.round(Number(amountZar) * 100));
    await submitMutation.mutateAsync({ amountCents, proposal });
  };

  // Admin review
  const { data: adminBids, isLoading: bidsLoading } = useAdminTenderBids(admin && Number.isFinite(tenderId) ? tenderId : undefined);
  const updateBidMutation = useAdminUpdateBidStatus();
  const [bidStatusDraft, setBidStatusDraft] = useState<Record<number, TenderBid["status"]>>({});

  const bidStatusOptions: Array<TenderBid["status"]> = useMemo(
    () => ["submitted", "shortlisted", "accepted", "rejected", "withdrawn"],
    []
  );

  if (!Number.isFinite(tenderId)) {
    return (
      <Layout>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Invalid tender id.</CardContent>
        </Card>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading tender…
        </div>
      </Layout>
    );
  }

  if (!tender) {
    return (
      <Layout>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Tender not found.</CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">{tender.title}</h1>
            <p className="text-muted-foreground mt-1">
              Status: <span className="font-medium text-foreground">{tender.status}</span>
              {tender.deadlineAt ? (
                <>
                  {" "}· Deadline:{" "}
                  <span className="font-medium text-foreground">{new Date(tender.deadlineAt).toLocaleDateString()}</span>
                </>
              ) : null}
            </p>
          </div>
          <Link href="/tenders">
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tender details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap">{tender.description}</p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <div className="font-medium">{tender.category ?? "—"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Location</span>
                  <div className="font-medium">{tender.location ?? "—"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget</span>
                  <div className="font-medium">{formatMoney(tender.budgetCents ?? null)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!admin && (
            <Card>
              <CardHeader>
                <CardTitle>Your bid</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tender.status !== "open" && (
                  <div className="text-sm text-muted-foreground">
                    This tender is not open for bidding.
                  </div>
                )}

                {myBid && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Current status:</span>{" "}
                    <span className="font-medium">{myBid.status}</span>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Bid amount (ZAR, optional)</Label>
                  <Input value={amountZar} onChange={(e) => setAmountZar(e.target.value)} placeholder="e.g. 15000" />
                </div>

                <div className="grid gap-2">
                  <Label>Proposal</Label>
                  <Textarea value={proposal} onChange={(e) => setProposal(e.target.value)} placeholder="Explain how you will deliver, timelines, references…" className="min-h-[140px]" />
                </div>

                <Button
                  className="w-full"
                  onClick={onSubmitBid}
                  disabled={submitMutation.isPending || tender.status !== "open" || proposal.trim().length < 20}
                >
                  {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {myBid ? "Update bid" : "Submit bid"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {admin && (
          <Card>
            <CardHeader>
              <CardTitle>Bids</CardTitle>
            </CardHeader>
            <CardContent>
              {bidsLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading bids…
                </div>
              )}

              {!bidsLoading && (!adminBids || adminBids.length === 0) && (
                <div className="text-sm text-muted-foreground py-6 text-center">No bids yet.</div>
              )}

              {!bidsLoading && adminBids && adminBids.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="min-w-[360px]">Proposal</TableHead>
                        <TableHead className="w-[160px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminBids.map(({ bid, profile }) => (
                        <TableRow key={bid.id}>
                          <TableCell>
                            <div className="font-medium">{profile.businessName}</div>
                            <div className="text-xs text-muted-foreground">{profile.email}</div>
                          </TableCell>
                          <TableCell>{formatMoney(bid.amountCents ?? null)}</TableCell>
                          <TableCell>
                            <Select
                              value={bidStatusDraft[bid.id] ?? bid.status}
                              onValueChange={(v) =>
                                setBidStatusDraft((prev) => ({ ...prev, [bid.id]: v as TenderBid["status"] }))
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {bidStatusOptions.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm whitespace-pre-wrap">{bid.proposal}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateBidMutation.mutateAsync({
                                  bidId: bid.id,
                                  status: bidStatusDraft[bid.id] ?? bid.status,
                                })
                              }
                              disabled={updateBidMutation.isPending}
                            >
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

