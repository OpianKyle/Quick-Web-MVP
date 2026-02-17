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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="hover:shadow-md transition-all border-l-4 border-l-primary/20 hover:border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
