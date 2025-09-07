import { Home, List, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: "home" | "subscriptions" | "analytics" | "settings";
}

const navItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "subscriptions", label: "Subscriptions", icon: List, href: "/subscriptions" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
] as const;

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm h-[70px] bg-card border-t border-border flex items-center justify-around px-5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === activeTab;
        
        return (
          <button
            key={item.id}
            onClick={() => window.location.href = item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
            data-testid={`nav-${item.id}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
