import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { isAdminUser } from "@/lib/rbac";
import { useAdminCreateTender, useTenders } from "@/hooks/use-tenders";

function formatMoney(cents: number | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);
}

export default function Tenders() {
  const { user } = useAuth();
  const admin = isAdminUser(user);
  const { data: tenders, isLoading } = useTenders();

  const createMutation = useAdminCreateTender();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [budgetZar, setBudgetZar] = useState("");
  const [deadlineDate, setDeadlineDate] = useState(""); // YYYY-MM-DD

  const sorted = useMemo(() => {
    if (!tenders) return [];
    return [...tenders].sort((a, b) => {
      const aOpen = a.status === "open" ? 0 : 1;
      const bOpen = b.status === "open" ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    });
  }, [tenders]);

  const onCreate = async () => {
    const budgetCents =
      budgetZar.trim() === "" ? null : Math.max(0, Math.round(Number(budgetZar) * 100));
    const deadlineAt =
      deadlineDate.trim() === "" ? null : new Date(`${deadlineDate}T00:00:00Z`).toISOString();

    await createMutation.mutateAsync({
      title,
      description,
      category: category.trim() ? category.trim() : null,
      location: location.trim() ? location.trim() : null,
      budgetCents: Number.isFinite(budgetCents) ? budgetCents : null,
      deadlineAt,
    });

    setOpen(false);
    setTitle("");
    setDescription("");
    setCategory("");
    setLocation("");
    setBudgetZar("");
    setDeadlineDate("");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Job Tenders</h1>
            <p className="text-muted-foreground">
              Browse open tenders and submit bids as a registered business.
            </p>
          </div>

          {admin && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Tender
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading tenders…
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No tenders yet.
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {sorted.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3">
                  <span className="line-clamp-2">{t.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    t.status === "open" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                  }`}>
                    {t.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{t.description}</p>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <div className="font-medium">{t.category ?? "—"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location</span>
                    <div className="font-medium">{t.location ?? "—"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget</span>
                    <div className="font-medium">{formatMoney(t.budgetCents ?? null)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deadline</span>
                    <div className="font-medium">
                      {t.deadlineAt ? new Date(t.deadlineAt).toLocaleDateString() : "—"}
                    </div>
                  </div>
                </div>

                <Link href={`/tenders/${t.id}`}>
                  <Button variant="outline" className="w-full">
                    View tender <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => !createMutation.isPending && setOpen(v)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post a new tender</DialogTitle>
            <DialogDescription>
              Admins can post tenders for registered businesses to bid on.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Catering services for event" />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe requirements, timelines, evaluation criteria…" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category (optional)</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Construction" />
              </div>
              <div className="grid gap-2">
                <Label>Location (optional)</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Johannesburg" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Budget (ZAR, optional)</Label>
                <Input value={budgetZar} onChange={(e) => setBudgetZar(e.target.value)} placeholder="e.g. 25000" />
              </div>
              <div className="grid gap-2">
                <Label>Deadline (optional)</Label>
                <Input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={createMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={onCreate}
                disabled={createMutation.isPending || title.trim().length < 3 || description.trim().length < 10}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Post tender
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

