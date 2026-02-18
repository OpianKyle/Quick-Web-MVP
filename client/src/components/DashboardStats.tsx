import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Ticket, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface StatsProps {
  totalSmes: number;
  activeSubscriptions: number;
  redeemedVouchers: number;
}

export function DashboardStats({ totalSmes, activeSubscriptions, redeemedVouchers }: StatsProps) {
  const stats = [
    {
      title: "Registered SMMEs",
      value: totalSmes,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions,
      icon: Activity,
      color: "text-secondary",
      bg: "bg-secondary/10"
    },
    {
      title: "Vouchers Redeemed",
      value: redeemedVouchers,
      icon: Ticket,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      title: "Adoption Rate",
      value: `${Math.round((redeemedVouchers / (totalSmes || 1)) * 100)}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-100"
    }
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
        >
          <Card className="group relative overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border-none bg-white rounded-3xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} opacity-20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
              <CardTitle className="text-sm font-black tracking-[0.15em] uppercase text-slate-400">
                {stat.title}
              </CardTitle>
              <div className={`p-3.5 rounded-2xl ${stat.bg} group-hover:rotate-12 transition-all duration-500 shadow-sm shadow-black/5`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black font-display tracking-tight text-slate-900 mb-3">{stat.value}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">+24.5%</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Growth Trend</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
