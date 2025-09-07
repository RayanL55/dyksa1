import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/bottom-nav";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Smartphone, 
  Moon, 
  DollarSign, 
  Download, 
  HelpCircle, 
  Shield, 
  LogOut,
  Mail,
  BarChart
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { UserSettings } from "@shared/schema";

interface Stats {
  totalSubscriptions: number;
  monthlySpend: number;
  yearlySpend: number;
}

export default function Settings() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: settings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      const response = await apiRequest("PUT", "/api/settings", newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
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

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || "User";
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
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-6 py-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground" data-testid="text-user-initials">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground" data-testid="text-user-name">
                    {getDisplayName()}
                  </h3>
                  <p className="text-muted-foreground" data-testid="text-user-email">
                    {user?.email || "No email"}
                  </p>
                </div>
                <Button variant="outline" size="sm" data-testid="button-edit-profile">
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-subscriptions">
                      {stats?.totalSubscriptions || 0}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Subscriptions</p>
                </div>
                <div className="text-center">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="text-monthly-spend">
                      {formatCurrency(stats?.monthlySpend || 0).replace('.00', '')}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </div>
                <div className="text-center">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="text-yearly-spend">
                      {formatCurrency(stats?.yearlySpend || 0).replace('.00', '')}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Yearly</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Configuration */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">Get reminders via email</p>
                      </div>
                    </div>
                    {settingsLoading ? (
                      <Skeleton className="w-11 h-6 rounded-full" />
                    ) : (
                      <Switch
                        checked={settings?.emailNotifications ?? true}
                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                        data-testid="switch-email-notifications"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Push Notifications</h3>
                        <p className="text-sm text-muted-foreground">Get alerts on your device</p>
                      </div>
                    </div>
                    {settingsLoading ? (
                      <Skeleton className="w-11 h-6 rounded-full" />
                    ) : (
                      <Switch
                        checked={settings?.pushNotifications ?? true}
                        onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                        data-testid="switch-push-notifications"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <BarChart className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Weekly Summary</h3>
                        <p className="text-sm text-muted-foreground">Weekly spending summary</p>
                      </div>
                    </div>
                    {settingsLoading ? (
                      <Skeleton className="w-11 h-6 rounded-full" />
                    ) : (
                      <Switch
                        checked={settings?.weeklySummary ?? false}
                        onCheckedChange={(checked) => updateSetting('weeklySummary', checked)}
                        data-testid="switch-weekly-summary"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* App Preferences */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">App Preferences</h2>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Moon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Dark Mode</h3>
                        <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                      </div>
                    </div>
                    {settingsLoading ? (
                      <Skeleton className="w-11 h-6 rounded-full" />
                    ) : (
                      <Switch
                        checked={settings?.darkMode ?? false}
                        onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                        data-testid="switch-dark-mode"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full justify-between h-auto p-0" data-testid="button-currency-settings">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-foreground">Default Currency</h3>
                    <p className="text-sm text-muted-foreground">
                      {settings?.defaultCurrency || "USD"} ($)
                    </p>
                  </div>
                </div>
                <div className="pr-4">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-between h-auto p-0" data-testid="button-export-data">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-foreground">Export Data</h3>
                    <p className="text-sm text-muted-foreground">Download your subscription data</p>
                  </div>
                </div>
                <div className="pr-4">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                </div>
              </Button>
            </div>
          </div>

          {/* Account Management */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between h-auto p-0" data-testid="button-help">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-foreground">Help & Support</h3>
                    <p className="text-sm text-muted-foreground">Get help with Dyksa</p>
                  </div>
                </div>
                <div className="pr-4">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-between h-auto p-0" data-testid="button-privacy">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-foreground">Privacy Policy</h3>
                    <p className="text-sm text-muted-foreground">How we handle your data</p>
                  </div>
                </div>
                <div className="pr-4">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full h-auto p-0 border-destructive/20 bg-destructive/5 hover:bg-destructive/10" 
                onClick={handleSignOut}
                data-testid="button-sign-out"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-destructive">Sign Out</h3>
                    <p className="text-sm text-destructive/70">Sign out of your account</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav activeTab="settings" />
    </div>
  );
}
