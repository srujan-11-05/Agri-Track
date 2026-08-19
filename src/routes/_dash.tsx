import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Sprout,
  LayoutDashboard,
  Tractor,
  Wheat,
  CalendarCheck,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
  LineChart,
  UserCog,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dash")({
  component: DashLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/farms", label: "Farms", icon: Tractor },
  { to: "/crops", label: "Crop planning", icon: Wheat },
  { to: "/activities", label: "Activities", icon: CalendarCheck },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/purchases", label: "Purchases", icon: Truck },
  { to: "/finance", label: "Income & expenses", icon: Wallet },
  { to: "/market", label: "Market prices", icon: LineChart },
  { to: "/profile", label: "My profile", icon: UserCog },
] as const;

function DashLayout() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sprout className="size-5 animate-pulse text-primary" />
          <span className="text-sm">Loading your farm data…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <header className="flex items-center justify-between border-b bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 font-display text-lg">
          <Sprout className="size-5 text-sidebar-primary" /> AgriTrack
        </Link>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
          className="rounded-md p-2 hover:bg-sidebar-accent"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      <aside
        className={cn(
          "border-r bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col",
          open ? "block" : "hidden lg:block",
        )}
      >
        <div className="hidden items-center gap-2 px-5 py-6 font-display text-xl lg:flex">
          <Sprout className="size-6 text-sidebar-primary" /> AgriTrack
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
              }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
              }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <ShieldCheck className="size-4" />
              Admin panel
            </Link>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <p className="truncate px-2 pb-2 text-xs text-sidebar-foreground/70">{user.email}</p>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
