import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import { money, num, shortDate, today } from "@/lib/format";

export const Route = createFileRoute("/_dash/sales")({
  head: () => ({
    meta: [
      { title: "Sales records — AgriTrack" },
      {
        name: "description",
        content: "Record produce sales with buyer, quantity, rate and payment status.",
      },
      { property: "og:title", content: "Sales records — AgriTrack" },
      {
        property: "og:description",
        content: "Record produce sales with buyer, rate and payment status.",
      },
    ],
  }),
  component: () => (
    <CrudPage
      table="sales"
      title="Sales records"
      singular="Sale"
      description="Every sale of produce, with buyer details, rate and payment status."
      icon={<ShoppingCart className="size-5" />}
      orderBy={{ column: "sale_date" }}
      searchKeys={["item_name", "buyer", "payment_status"]}
      fields={[
        { name: "item_name", label: "Produce sold", type: "text", required: true },
        { name: "buyer", label: "Buyer / trader", type: "text" },
        { name: "quantity", label: "Quantity", type: "number", required: true },
        {
          name: "unit",
          label: "Unit",
          type: "select",
          defaultValue: "quintal",
          options: ["kg", "quintal", "tonne", "bag", "piece"],
        },
        { name: "unit_price", label: "Rate per unit (₹)", type: "number", required: true },
        { name: "sale_date", label: "Sale date", type: "date", defaultValue: today() },
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
        { key: "sale_date", label: "Date", render: (r) => shortDate(r["sale_date"]) },
        { key: "item_name", label: "Produce" },
        { key: "buyer", label: "Buyer" },
        {
          key: "quantity",
          label: "Qty",
          align: "right",
          render: (r) => `${num(r["quantity"])} ${r["unit"]}`,
        },
        {
          key: "unit_price",
          label: "Rate",
          align: "right",
          render: (r) => money(r["unit_price"]),
        },
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
        { label: "Sales recorded", value: String(rows.length) },
        {
          label: "Total revenue",
          value: money(rows.reduce((s, r) => s + Number(r["total_amount"] ?? 0), 0)),
        },
        {
          label: "Awaiting payment",
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
