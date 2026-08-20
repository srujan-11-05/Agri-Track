import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";

import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import { money, num, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_dash/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — AgriTrack" },
      {
        name: "description",
        content:
          "Track stock of seeds, fertilizers, pesticides and equipment with reorder alerts.",
      },
      { property: "og:title", content: "Inventory — AgriTrack" },
      {
        property: "og:description",
        content: "Track seeds, fertilizers and equipment stock with reorder alerts.",
      },
    ],
  }),
  component: () => (
    <CrudPage
      table="inventory_items"
      title="Inventory"
      singular="Item"
      description="Stock levels for seeds, fertilizers, pesticides and equipment, with reorder alerts."
      icon={<Package className="size-5" />}
      orderBy={{ column: "created_at" }}
      searchKeys={["name", "category", "supplier"]}
      fields={[
        { name: "name", label: "Item name", type: "text", required: true },
        {
          name: "category",
          label: "Category",
          type: "select",
          defaultValue: "seeds",
          options: ["seeds", "fertilizers", "pesticides", "equipment", "fuel", "other"],
        },
        { name: "quantity", label: "Quantity", type: "number" },
        {
          name: "unit",
          label: "Unit",
          type: "select",
          defaultValue: "kg",
          options: ["kg", "litre", "bag", "packet", "piece", "quintal"],
        },
        { name: "unit_cost", label: "Unit cost (₹)", type: "number" },
        { name: "reorder_level", label: "Reorder level", type: "number" },
        { name: "supplier", label: "Supplier", type: "text" },
        { name: "expiry_date", label: "Expiry date", type: "date" },
      ]}
      columns={[
        { key: "name", label: "Item" },
        {
          key: "category",
          label: "Category",
          render: (r) => <Badge variant="secondary">{r["category"]}</Badge>,
        },
        {
          key: "quantity",
          label: "In stock",
          align: "right",
          render: (r) => `${num(r["quantity"])} ${r["unit"]}`,
        },
        {
          key: "unit_cost",
          label: "Stock value",
          align: "right",
          render: (r) => money(Number(r["quantity"] ?? 0) * Number(r["unit_cost"] ?? 0)),
        },
        { key: "supplier", label: "Supplier" },
        { key: "expiry_date", label: "Expiry", render: (r) => shortDate(r["expiry_date"]) },
        {
          key: "reorder_level",
          label: "Alert",
          render: (r) =>
            Number(r["quantity"] ?? 0) <= Number(r["reorder_level"] ?? 0) ? (
              <Badge variant="destructive">Reorder</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">OK</span>
            ),
        },
      ]}
      summary={(rows) => [
        { label: "Items tracked", value: String(rows.length) },
        {
          label: "Stock value",
          value: money(
            rows.reduce((s, r) => s + Number(r["quantity"] ?? 0) * Number(r["unit_cost"] ?? 0), 0),
          ),
        },
        {
          label: "Needs reorder",
          value: String(
            rows.filter((r) => Number(r["quantity"] ?? 0) <= Number(r["reorder_level"] ?? 0))
              .length,
          ),
        },
      ]}
    />
  ),
});
