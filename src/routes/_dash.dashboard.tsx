import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Wheat,
  PackageX,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { money, num, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_dash/dashboard")({
  head: () => ({
    meta: [
      { title: "Farm dashboard — AgriTrack" },
      {
        name: "description",
        content:
          "Revenue, expenses, crop status, stock alerts and market prices in a single farm dashboard.",
      },
      { property: "og:title", content: "Farm dashboard — AgriTrack" },
      {
        property: "og:description",
        content: "Revenue, expenses, crops, stock alerts and market prices at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [sales, purchases, transactions, crops, inventory, activities, prices] =
        await Promise.all([
          supabase.from("sales").select("*"),
          supabase.from("purchases").select("*"),
          supabase.from("transactions").select("*"),
          supabase.from("crops").select("*"),
          supabase.from("inventory_items").select("*"),
          supabase.from("crop_activities").select("*").eq("completed", false),
          supabase.from("market_prices").select("*").order("commodity"),
        ]);
      return {
        sales: sales.data ?? [],
        purchases: purchases.data ?? [],
        transactions: transactions.data ?? [],
        crops: crops.data ?? [],
        inventory: inventory.data ?? [],
        activities: activities.data ?? [],
        prices: prices.data ?? [],
      };
    },
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={<LayoutDashboard className="size-5" />}
          title="Farm dashboard"
          description="Loading your latest farm figures…"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const salesTotal = data.sales.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
  const purchaseTotal = data.purchases.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
  const extraIncome = data.transactions
    .filter((t) => t.kind === "income")
    .reduce((s, t) => s + Number(t.amount ?? 0), 0);
  const extraExpense = data.transactions
    .filter((t) => t.kind === "expense")
    .reduce((s, t) => s + Number(t.amount ?? 0), 0);

  const income = salesTotal + extraIncome;
  const expense = purchaseTotal + extraExpense;
  const net = income - expense;

  const lowStock = data.inventory.filter(
    (i) => Number(i.quantity ?? 0) <= Number(i.reorder_level ?? 0),
  );
  const activeCrops = data.crops.filter((c) => ["sown", "growing"].includes(String(c.status)));

  const monthly = buildMonthly(data.sales, data.purchases, data.transactions);
  const expenseByCategory = Object.entries(
    data.transactions
      .filter((t) => t.kind === "expense")
      .reduce<Record<string, number>>((acc, t) => {
        const key = String(t.category ?? "other");
        acc[key] = (acc[key] ?? 0) + Number(t.amount ?? 0);
        return acc;
      }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const stats = [
    {
      label: "Total revenue",
      value: money(income),
      icon: TrendingUp,
      tone: "text-primary",
      note: `${data.sales.length} sale${data.sales.length === 1 ? "" : "s"} recorded`,
    },
    {
      label: "Total costs",
      value: money(expense),
      icon: TrendingDown,
      tone: "text-destructive",
      note: `${data.purchases.length} purchase${data.purchases.length === 1 ? "" : "s"}`,
    },
    {
      label: "Net position",
      value: money(net),
      icon: net >= 0 ? TrendingUp : TrendingDown,
      tone: net >= 0 ? "text-primary" : "text-destructive",
      note: net >= 0 ? "Profitable so far" : "Running at a loss",
    },
    {
      label: "Crops in field",
      value: String(activeCrops.length),
      icon: Wheat,
      tone: "text-accent-foreground",
      note: `${num(activeCrops.reduce((s, c) => s + Number(c.area ?? 0), 0))} area under crop`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LayoutDashboard className="size-5" />}
        title="Farm dashboard"
        description="Revenue, costs, crop status, stock alerts and today's mandi rates."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <s.icon className={`size-4 ${s.tone}`} />
            </div>
            <p className="mt-2 font-display text-2xl">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-soft lg:col-span-2">
          <h2 className="font-display text-lg">Income vs costs by month</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Sales and other income against purchases and expenses.
          </p>
          {monthly.length === 0 ? (
            <p className="py-24 text-center text-sm text-muted-foreground">
              Record a sale, purchase or expense to see your monthly trend here.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" width={70} />
                  <Tooltip
                    formatter={(v: number) => money(v)}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="var(--color-chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="cost" name="Costs" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>

        <div className="rounded-lg border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg">Top expense categories</h2>
          <p className="mb-4 text-sm text-muted-foreground">From your income &amp; expense log.</p>
          {expenseByCategory.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No expense entries yet.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {expenseByCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => money(v)}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <PackageX className="size-4 text-destructive" />
            <h2 className="font-display text-lg">Stock alerts</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">All stock is above reorder level.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {lowStock.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{i.name}</span>
                  <Badge variant="destructive">
                    {num(i.quantity)} {i.unit}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/inventory"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Manage inventory <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            <h2 className="font-display text-lg">Upcoming activities</h2>
          </div>
          {data.activities.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No pending field activities.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {[...data.activities]
                .sort((a, b) => String(a.scheduled_date).localeCompare(String(b.scheduled_date)))
                .slice(0, 5)
                .map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{a.activity_type}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {shortDate(a.scheduled_date)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
          <Link
            to="/activities"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View schedule <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <h2 className="font-display text-lg">Today's mandi rates</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {data.prices.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{p.commodity}</span>
                <span className="shrink-0 font-medium">
                  {money(p.price)}
                  <span className="text-xs font-normal text-muted-foreground">/{p.unit}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/market"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            All market prices <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

type Rec = Record<string, unknown>;

function buildMonthly(sales: Rec[], purchases: Rec[], transactions: Rec[]) {
  const buckets = new Map<string, { month: string; income: number; cost: number }>();
  const key = (value: unknown) => {
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 7);
  };
  const touch = (k: string) => {
    if (!buckets.has(k)) {
      const [y, m] = k.split("-");
      const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      buckets.set(k, { month: label, income: 0, cost: 0 });
    }
    return buckets.get(k)!;
  };

  for (const s of sales) {
    const k = key(s["sale_date"]);
    if (k) touch(k).income += Number(s["total_amount"] ?? 0);
  }
  for (const p of purchases) {
    const k = key(p["purchase_date"]);
    if (k) touch(k).cost += Number(p["total_amount"] ?? 0);
  }
  for (const t of transactions) {
    const k = key(t["occurred_on"]);
    if (!k) continue;
    const bucket = touch(k);
    if (t["kind"] === "income") bucket.income += Number(t["amount"] ?? 0);
    else bucket.cost += Number(t["amount"] ?? 0);
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([, v]) => v);
}
