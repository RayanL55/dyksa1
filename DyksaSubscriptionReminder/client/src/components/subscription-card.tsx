import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Subscription } from "@shared/schema";

interface SubscriptionCardProps {
  subscription: Subscription;
  showDueDate?: boolean;
  onClick?: () => void;
}

export default function SubscriptionCard({ 
  subscription, 
  showDueDate = false, 
  onClick 
}: SubscriptionCardProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription.currency || 'USD',
    }).format(parseFloat(amount));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDueText = () => {
    const now = new Date();
    const paymentDate = new Date(subscription.nextPaymentDate);
    const diffTime = paymentDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Overdue", urgent: true };
    } else if (diffDays === 0) {
      return { text: "Due today", urgent: true };
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", urgent: true };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, urgent: false };
    } else {
      return { text: `Due in ${Math.ceil(diffDays / 7)} week${diffDays > 14 ? 's' : ''}`, urgent: false };
    }
  };

  const getServiceColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];
    
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const dueInfo = showDueDate ? getDueText() : null;

  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
        dueInfo?.urgent ? 'border-l-4 border-l-destructive' : 'border-l-4 border-l-accent'
      }`}
      onClick={onClick}
      data-testid={`card-subscription-${subscription.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${getServiceColor(subscription.name)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
              {getInitials(subscription.name)}
            </div>
            <div>
              <h3 className="font-medium text-foreground" data-testid={`text-subscription-name-${subscription.id}`}>
                {subscription.name}
              </h3>
              {showDueDate && dueInfo && (
                <p className={`text-sm ${dueInfo.urgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {dueInfo.text}
                </p>
              )}
              {!showDueDate && (
                <p className="text-sm text-muted-foreground">
                  {subscription.billingPeriod.charAt(0).toUpperCase() + subscription.billingPeriod.slice(1)}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground" data-testid={`text-subscription-amount-${subscription.id}`}>
              {formatCurrency(subscription.amount)}
            </p>
            {!showDueDate && (
              <p className="text-sm text-muted-foreground">
                {subscription.billingPeriod.charAt(0).toUpperCase() + subscription.billingPeriod.slice(1)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
