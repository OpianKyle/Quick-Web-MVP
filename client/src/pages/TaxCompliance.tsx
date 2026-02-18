import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  FileCheck, 
  AlertCircle, 
  Download, 
  ExternalLink,
  Info,
  History,
  Scale
} from "lucide-react";

export default function TaxCompliance() {
  const complianceStatus = [
    { label: "CIPC Annual Return", status: "compliant", date: "2026-01-15", icon: FileCheck },
    { label: "SARS Tax Clearance", status: "action_required", date: "Expires in 12 days", icon: ShieldCheck },
    { label: "B-BBEE Certificate", status: "compliant", date: "2025-11-20", icon: Scale },
    { label: "COIDA (Letter of Good Standing)", status: "compliant", date: "2026-02-01", icon: FileCheck },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Tax & Compliance</h1>
        <p className="text-slate-500 font-medium">Manage your regulatory requirements and government certifications.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {complianceStatus.map((item) => (
          <Card key={item.label} className="border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-slate-600" />
              </div>
              <Badge 
                variant={item.status === 'compliant' ? 'outline' : 'destructive'}
                className={item.status === 'compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
              >
                {item.status === 'compliant' ? 'Compliant' : 'Action Required'}
              </Badge>
            </CardHeader>
            <CardContent>
              <h3 className="font-bold text-slate-900 mb-1">{item.label}</h3>
              <p className="text-xs text-slate-500 font-medium">{item.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Recent Compliance Activity
            </CardTitle>
            <CardDescription>Your latest submissions and status updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { event: "Tax Clearance Certificate Issued", date: "Feb 10, 2026", type: "Success" },
              { event: "Annual Return Filed (CIPC)", date: "Jan 15, 2026", type: "Success" },
              { event: "VAT201 Submission Reminder", date: "Jan 05, 2026", type: "Alert" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">{activity.event}</p>
                  <p className="text-xs text-slate-500">{activity.date}</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter">
                  {activity.type}
                </Badge>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-blue-600 font-bold hover:bg-blue-50">
              View Full History
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5" />
              Compliance Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-6xl font-black mb-2 tracking-tighter">92%</div>
              <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Excellent Standing</p>
              <div className="w-full bg-blue-500/30 h-2 rounded-full mt-8 overflow-hidden">
                <div className="bg-white h-full w-[92%]" />
              </div>
            </div>
            <p className="text-sm text-blue-50 font-medium leading-relaxed text-center mt-4">
              Your business is in good standing with major regulatory bodies. Complete the SARS update to reach 100%.
            </p>
            <Button variant="secondary" className="w-full mt-6 font-black h-12 rounded-xl">
              Start SARS Update
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Download Certificates
          </CardTitle>
          <CardDescription>Access and download your official business documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "B-BBEE Certificate",
              "Tax Clearance PIN",
              "VAT Registration Letter",
              "CIPC Registration (COR14.3)",
              "COIDA Letter",
              "Bank Account Confirmation"
            ].map((doc) => (
              <Button key={doc} variant="outline" className="justify-start gap-3 h-14 rounded-xl border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                <FileCheck className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                <span className="font-bold text-slate-700">{doc}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
