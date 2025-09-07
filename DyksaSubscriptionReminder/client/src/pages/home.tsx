import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/bottom-nav";
import FloatingFab from "@/components/floating-fab";
import SubscriptionCard from "@/components/subscription-card";
import { Calendar, TrendingUp, User, CheckCircle, Plus } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Subscription } from "@shared/schema";

interface Stats {
  totalSubscriptions: number;
  monthlySpend: number;
  yearlySpend: number;
}

export default function Home() {
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

  const { data: upcomingSubscriptions, isLoading: subscriptionsLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions/upcoming"],
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.firstName || "there";
    
    if (hour < 12) return `Good morning, ${name}! 👋`;
    if (hour < 18) return `Good afternoon, ${name}! 👋`;
    return `Good evening, ${name}! 👋`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="pt-12 pb-6 px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-greeting">
                {getGreeting()}
              </h1>
              <p className="text-muted-foreground">Here are your upcoming subscriptions</p>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={() => window.location.href = '/settings'}
              data-testid="button-profile"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">This Month</span>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid="text-monthly-spend">
                    {formatCurrency(stats?.monthlySpend || 0)}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Active</span>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-active">
                    {stats?.totalSubscriptions || 0}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Reminders Section */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Next Reminders</h2>
            <Button variant="link" className="text-primary p-0 h-auto">
              View All
            </Button>
          </div>

          {subscriptionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingSubscriptions && upcomingSubscriptions.length > 0 ? (
            <div className="space-y-3" data-testid="list-upcoming-subscriptions">
              {upcomingSubscriptions.map((subscription) => (
                <SubscriptionCard 
                  key={subscription.id} 
                  subscription={subscription}
                  showDueDate
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No upcoming subscriptions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first subscription to get started
                </p>
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = "/add-subscription"}
                  data-testid="button-add-first-subscription"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscription
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="px-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Welcome to Dyksa!</p>
                    <p className="text-xs text-muted-foreground">Start by adding your first subscription</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FloatingFab />
      <BottomNav activeTab="home" />
    </div>
  );
}
