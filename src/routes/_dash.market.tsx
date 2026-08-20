import { createFileRoute } from "@tanstack/react-router";
import { LineChart } from "lucide-react";

import { CrudPage } from "@/components/CrudPage";
import { useAuth } from "@/hooks/useAuth";
import { money, shortDate, today } from "@/lib/format";

export const Route = createFileRoute("/_dash/market")({
  head: () => ({
    meta: [
      { title: "Market prices — AgriTrack" },
      {
        name: "description",
        content: "Latest mandi commodity prices to help you decide when and where to sell.",
      },
      { property: "og:title", content: "Market prices — AgriTrack" },
      {
        property: "og:description",
        content: "Latest mandi commodity prices to time your selling decisions.",
      },
    ],
  }),
  component: MarketPage,
});

function MarketPage() {
  const { isAdmin } = useAuth();

  return (
    <CrudPage
      table="market_prices"
      title="Market prices"
      singular="Price"
      description="Reference mandi rates by commodity and market, updated by the platform admin."
      icon={<LineChart className="size-5" />}
      orderBy={{ column: "recorded_on" }}
      searchKeys={["commodity", "market_name"]}
      readOnly={!isAdmin}
      readOnlyNote="Market rates are published centrally. Contact an administrator to add or correct a price."
      fields={[
        { name: "commodity", label: "Commodity", type: "text", required: true },
        { name: "market_name", label: "Market / mandi", type: "text", required: true },
        { name: "price", label: "Price (₹)", type: "number", required: true },
        {
          name: "unit",
          label: "Unit",
          type: "select",
          defaultValue: "quintal",
          options: ["quintal", "kg", "tonne", "bag"],
        },
        { name: "recorded_on", label: "Recorded on", type: "date", defaultValue: today() },
      ]}
      columns={[
        { key: "commodity", label: "Commodity" },
        { key: "market_name", label: "Market" },
        {
          key: "price",
          label: "Price",
          align: "right",
          render: (r) => (
            <span className="font-semibold">
              {money(r["price"])}
              <span className="ml-1 text-xs font-normal text-muted-foreground">/{r["unit"]}</span>
            </span>
          ),
        },
        { key: "recorded_on", label: "Updated", render: (r) => shortDate(r["recorded_on"]) },
      ]}
      summary={(rows) => [
        { label: "Commodities listed", value: String(new Set(rows.map((r) => r["commodity"])).size) },
        { label: "Markets covered", value: String(new Set(rows.map((r) => r["market_name"])).size) },
        { label: "Price records", value: String(rows.length) },
      ]}
    />
  );
}
