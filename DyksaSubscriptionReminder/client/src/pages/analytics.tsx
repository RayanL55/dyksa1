import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/bottom-nav";
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  PieChart,
  BarChart3,
  CreditCard 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Subscription } from "@shared/schema";

interface Stats {
  totalSubscriptions: number;
  monthlySpend: number;
  yearlySpend: number;
}

export default function Analytics() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const goBack = () => {
    window.location.href = "/";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getBillingPeriodStats = () => {
    if (!subscriptions) return [];
    
    const periods = subscriptions.reduce((acc, sub) => {
      const period = sub.billingPeriod;
      if (!acc[period]) {
        acc[period] = { count: 0, amount: 0 };
      }
      acc[period].count++;
      acc[period].amount += parseFloat(sub.amount);
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return Object.entries(periods).map(([period, data]) => ({
      period: period.charAt(0).toUpperCase() + period.slice(1),
      count: data.count,
      amount: data.amount
    }));
  };

  const getAverageSpend = () => {
    if (!stats || stats.totalSubscriptions === 0) return 0;
    return stats.monthlySpend / stats.totalSubscriptions;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="pt-12 pb-6 px-6 border-b border-border">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Total Active
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {statsLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-subscriptions">
                    {stats?.totalSubscriptions || 0}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monthly Spend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid="text-monthly-spend">
                    {formatCurrency(stats?.monthlySpend || 0)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Yearly Spend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid="text-yearly-spend">
                    {formatCurrency(stats?.yearlySpend || 0)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Average Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid="text-average-spend">
                    {formatCurrency(getAverageSpend())}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Billing Period Breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Billing Period Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : getBillingPeriodStats().length > 0 ? (
                <div className="space-y-3">
                  {getBillingPeriodStats().map((period) => (
                    <div key={period.period} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        <span className="text-sm font-medium text-foreground">{period.period}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {period.count} subscription{period.count !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(period.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No subscription data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Savings Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Monthly Budget Impact</p>
                  <p className="text-xs text-muted-foreground">
                    Your subscriptions account for {formatCurrency(stats?.monthlySpend || 0)} of your monthly spending
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Annual Savings Opportunity</p>
                  <p className="text-xs text-muted-foreground">
                    Consider reviewing subscriptions you use less frequently to potentially save money
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav activeTab="analytics" />
    </div>
  );
}