import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import { money, shortDate, today } from "@/lib/format";

export const Route = createFileRoute("/_dash/finance")({
  head: () => ({
    meta: [
      { title: "Income & expenses — AgriTrack" },
      {
        name: "description",
        content: "Log farm income and expenses by category and see net position at a glance.",
      },
      { property: "og:title", content: "Income & expenses — AgriTrack" },
      {
        property: "og:description",
        content: "Log farm income and expenses by category and see your net position.",
      },
    ],
  }),
  component: () => (
    <CrudPage
      table="transactions"
      title="Income & expenses"
      singular="Entry"
      description="Every rupee in and out — labour, fuel, subsidies, rent and more."
      icon={<Wallet className="size-5" />}
      orderBy={{ column: "occurred_on" }}
      searchKeys={["category", "description", "kind"]}
      fields={[
        {
          name: "kind",
          label: "Type",
          type: "select",
          defaultValue: "expense",
          options: ["expense", "income"],
          required: true,
        },
        {
          name: "category",
          label: "Category",
          type: "select",
          defaultValue: "labour",
          options: [
            "labour",
            "seeds",
            "fertilizer",
            "pesticide",
            "irrigation",
            "fuel",
            "machinery",
            "transport",
            "land rent",
            "loan",
            "produce sale",
            "subsidy",
            "other",
          ],
        },
        { name: "amount", label: "Amount (₹)", type: "number", required: true },
        { name: "occurred_on", label: "Date", type: "date", defaultValue: today() },
        { name: "description", label: "Description", type: "textarea", span: 2 },
      ]}
      columns={[
        { key: "occurred_on", label: "Date", render: (r) => shortDate(r["occurred_on"]) },
        {
          key: "kind",
          label: "Type",
          render: (r) => (
            <Badge variant={r["kind"] === "income" ? "default" : "secondary"}>{r["kind"]}</Badge>
          ),
        },
        { key: "category", label: "Category" },
        { key: "description", label: "Description" },
        {
          key: "amount",
          label: "Amount",
          align: "right",
          render: (r) => (
            <span
              className={
                r["kind"] === "income" ? "font-semibold text-primary" : "font-semibold text-foreground"
              }
            >
              {r["kind"] === "income" ? "+" : "−"} {money(r["amount"])}
            </span>
          ),
        },
      ]}
      summary={(rows) => {
        const income = rows
          .filter((r) => r["kind"] === "income")
          .reduce((s, r) => s + Number(r["amount"] ?? 0), 0);
        const expense = rows
          .filter((r) => r["kind"] === "expense")
          .reduce((s, r) => s + Number(r["amount"] ?? 0), 0);
        return [
          { label: "Total income", value: money(income) },
          { label: "Total expenses", value: money(expense) },
          { label: "Net position", value: money(income - expense) },
          { label: "Entries", value: String(rows.length) },
        ];
      }}
    />
  ),
});
