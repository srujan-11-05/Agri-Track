import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";

import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import { money, num, shortDate, today } from "@/lib/format";

export const Route = createFileRoute("/_dash/purchases")({
  head: () => ({
    meta: [
      { title: "Purchase records — AgriTrack" },
      {
        name: "description",
        content: "Track input purchases from suppliers with quantity, rate and payment status.",
      },
      { property: "og:title", content: "Purchase records — AgriTrack" },
      {
        property: "og:description",
        content: "Track supplier purchases with quantity, rate and payment status.",
      },
    ],
  }),
  component: () => (
    <CrudPage
      table="purchases"
      title="Purchase records"
      singular="Purchase"
      description="Inputs bought from suppliers — seeds, fertilizers, equipment and services."
      icon={<Truck className="size-5" />}
      orderBy={{ column: "purchase_date" }}
      searchKeys={["item_name", "supplier", "payment_status"]}
      fields={[
        { name: "item_name", label: "Item purchased", type: "text", required: true },
        { name: "supplier", label: "Supplier", type: "text" },
        { name: "quantity", label: "Quantity", type: "number", required: true },
        {
          name: "unit",
          label: "Unit",
          type: "select",
          defaultValue: "kg",
          options: ["kg", "litre", "bag", "packet", "piece", "quintal"],
        },
        { name: "unit_price", label: "Rate per unit (₹)", type: "number", required: true },
        { name: "purchase_date", label: "Purchase date", type: "date", defaultValue: today() },
        {
          name: "payment_status",
          label: "Payment",
          type: "select",
          defaultValue: "paid",
          options: ["paid", "partial", "pending"],
        },
      ]}
      derive={(v) => ({
        total_amount: Number(v["quantity"] ?? 0) * Number(v["unit_price"] ?? 0),
      })}
      columns={[
        { key: "purchase_date", label: "Date", render: (r) => shortDate(r["purchase_date"]) },
        { key: "item_name", label: "Item" },
        { key: "supplier", label: "Supplier" },
        {
          key: "quantity",
          label: "Qty",
          align: "right",
          render: (r) => `${num(r["quantity"])} ${r["unit"]}`,
        },
        { key: "unit_price", label: "Rate", align: "right", render: (r) => money(r["unit_price"]) },
        {
          key: "total_amount",
          label: "Total",
          align: "right",
          render: (r) => <span className="font-semibold">{money(r["total_amount"])}</span>,
        },
        {
          key: "payment_status",
          label: "Payment",
          render: (r) => (
            <Badge
              variant={
                r["payment_status"] === "paid"
                  ? "default"
                  : r["payment_status"] === "pending"
                    ? "destructive"
                    : "secondary"
              }
            >
              {r["payment_status"]}
            </Badge>
          ),
        },
      ]}
      summary={(rows) => [
        { label: "Purchases", value: String(rows.length) },
        {
          label: "Total spend",
          value: money(rows.reduce((s, r) => s + Number(r["total_amount"] ?? 0), 0)),
        },
        {
          label: "Unpaid dues",
          value: money(
            rows
              .filter((r) => r["payment_status"] !== "paid")
              .reduce((s, r) => s + Number(r["total_amount"] ?? 0), 0),
          ),
        },
      ]}
    />
  ),
});
