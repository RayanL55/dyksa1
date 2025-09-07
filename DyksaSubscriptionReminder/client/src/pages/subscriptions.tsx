import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/bottom-nav";
import SubscriptionCard from "@/components/subscription-card";
import FloatingFab from "@/components/floating-fab";
import { 
  ArrowLeft, 
  Calendar, 
  Plus,
  Search,
  Filter
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Subscription } from "@shared/schema";

export default function Subscriptions() {
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

  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const goBack = () => {
    window.location.href = "/";
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getTotalMonthlySpend = () => {
    if (!subscriptions) return 0;
    return subscriptions
      .filter(sub => sub.billingPeriod === 'monthly')
      .reduce((sum, sub) => sum + parseFloat(sub.amount), 0);
  };

  const groupSubscriptionsByStatus = () => {
    if (!subscriptions) return { active: [], upcoming: [] };
    
    const now = new Date();
    const upcoming = subscriptions.filter(sub => {
      const paymentDate = new Date(sub.nextPaymentDate);
      const diffTime = paymentDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    });

    const active = subscriptions.filter(sub => {
      const paymentDate = new Date(sub.nextPaymentDate);
      const diffTime = paymentDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7 || diffDays < 0;
    });

    return { active, upcoming };
  };

  const { active, upcoming } = groupSubscriptionsByStatus();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="pt-12 pb-6 px-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">My Subscriptions</h1>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" className="rounded-full" data-testid="button-search">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full" data-testid="button-filter">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Active</span>
                </div>
                {subscriptionsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-xl font-bold text-foreground" data-testid="text-total-subscriptions">
                    {subscriptions?.length || 0}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Monthly Cost</span>
                </div>
                {subscriptionsLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold text-foreground" data-testid="text-monthly-cost">
                    {formatCurrency(getTotalMonthlySpend().toString())}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {subscriptionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
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
          ) : subscriptions && subscriptions.length > 0 ? (
            <>
              {/* Upcoming Payments */}
              {upcoming.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Due This Week ({upcoming.length})
                  </h2>
                  <div className="space-y-3" data-testid="list-upcoming-subscriptions">
                    {upcoming.map((subscription) => (
                      <SubscriptionCard 
                        key={subscription.id} 
                        subscription={subscription}
                        showDueDate
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Subscriptions */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  All Subscriptions ({active.length})
                </h2>
                <div className="space-y-3" data-testid="list-all-subscriptions">
                  {active.map((subscription) => (
                    <SubscriptionCard 
                      key={subscription.id} 
                      subscription={subscription}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No subscriptions yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Start tracking your subscriptions to never miss a payment again.
              </p>
              <Button onClick={() => window.location.href = "/add-subscription"} data-testid="button-add-first-subscription">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Subscription
              </Button>
            </div>
          )}
        </div>
      </div>

      <FloatingFab />
      <BottomNav activeTab="subscriptions" />
    </div>
  );
}