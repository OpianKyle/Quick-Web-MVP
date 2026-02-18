import { Layout } from "@/components/Layout";
import { useAdminStats, useSmeProfile } from "@/hooks/use-sme";
import { DashboardStats } from "@/components/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Download } from "lucide-react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { isAdminUser } from "@/lib/rbac";

export default function Admin() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useAdminStats();
  const { toast } = useToast();
  const [voucherCount, setVoucherCount] = useState(10);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  // Simple admin check
  if (user && !isAdminUser(user)) {
    return <Redirect to="/" />;
  }

  const generateMutation = useMutation({
    mutationFn: async (count: number) => {
      const res = await fetch(api.vouchers.generate.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return api.vouchers.generate.responses[201].parse(await res.json());
    },
    onSuccess: (codes) => {
      setGeneratedCodes(codes);
      toast({ title: "Generated", description: `${codes.length} vouchers created.` });
    }
  });

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  const chartData = [
    { name: 'Mon', signups: 12 },
    { name: 'Tue', signups: 19 },
    { name: 'Wed', signups: 35 },
    { name: 'Thu', signups: 22 },
    { name: 'Fri', signups: 45 },
    { name: 'Sat', signups: 10 },
    { name: 'Sun', signups: 5 },
  ];

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform growth and manage vouchers.</p>
        </div>

        {stats && (
          <DashboardStats 
            totalSmes={stats.totalSmes}
            activeSubscriptions={stats.activeSubscriptions}
            redeemedVouchers={stats.redeemedVouchers}
          />
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f4f4f5' }} />
                  <Bar dataKey="signups" fill="#007A4D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voucher Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={voucherCount} 
                  onChange={(e) => setVoucherCount(parseInt(e.target.value))}
                  min={1} 
                  max={100}
                />
                <Button 
                  onClick={() => generateMutation.mutate(voucherCount)}
                  disabled={generateMutation.isPending}
                >
                  Generate Vouchers
                </Button>
              </div>

              {generatedCodes.length > 0 && (
                <div className="bg-muted p-4 rounded-lg max-h-[200px] overflow-y-auto">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm">Generated Codes:</h4>
                    <Button variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(generatedCodes.join('\n'));
                      toast({ title: "Copied to clipboard" });
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {generatedCodes.join('\n')}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
