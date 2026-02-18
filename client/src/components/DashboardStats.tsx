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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="group hover:shadow-lg transition-all border-none bg-white/50 backdrop-blur-sm ring-1 ring-border/50 hover:ring-primary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform shadow-sm`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+20.1%</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
