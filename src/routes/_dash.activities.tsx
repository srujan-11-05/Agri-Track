import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";

import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import { money, shortDate, today } from "@/lib/format";

export const Route = createFileRoute("/_dash/activities")({
  head: () => ({
    meta: [
      { title: "Seasonal activities — AgriTrack" },
      {
        name: "description",
        content: "Schedule irrigation, spraying, weeding and harvest tasks against each crop.",
      },
      { property: "og:title", content: "Seasonal activities — AgriTrack" },
      {
        property: "og:description",
        content: "Schedule and cost farm tasks against each crop.",
      },
    ],
  }),
  component: () => (
    <CrudPage
      table="crop_activities"
      title="Seasonal activities"
      singular="Activity"
      description="Schedule field operations, mark them complete and record what each one cost."
      icon={<CalendarCheck className="size-5" />}
      orderBy={{ column: "scheduled_date" }}
      searchKeys={["activity_type", "description"]}
      fields={[
        {
          name: "activity_type",
          label: "Activity",
          type: "select",
          required: true,
          options: [
            "Land preparation",
            "Sowing",
            "Irrigation",
            "Fertiliser application",
            "Pest control",
            "Weeding",
            "Harvesting",
            "Other",
          ],
        },
        {
          name: "crop_id",
          label: "Crop",
          type: "select",
          optionsFrom: { table: "crops", labelKey: "name" },
        },
        { name: "scheduled_date", label: "Scheduled date", type: "date", defaultValue: today() },
        { name: "cost", label: "Cost (₹)", type: "number" },
        { name: "completed", label: "Completed", type: "switch" },
        { name: "description", label: "Notes", type: "textarea", span: 2 },
      ]}
      columns={[
        { key: "activity_type", label: "Activity" },
        { key: "scheduled_date", label: "Date", render: (r) => shortDate(r["scheduled_date"]) },
        { key: "description", label: "Notes" },
        { key: "cost", label: "Cost", align: "right", render: (r) => money(r["cost"]) },
        {
          key: "completed",
          label: "Status",
          render: (r) => (
            <Badge variant={r["completed"] ? "default" : "secondary"}>
              {r["completed"] ? "Done" : "Pending"}
            </Badge>
          ),
        },
      ]}
      summary={(rows) => [
        { label: "Total activities", value: String(rows.length) },
        { label: "Pending", value: String(rows.filter((r) => !r["completed"]).length) },
        {
          label: "Activity cost",
          value: money(rows.reduce((s, r) => s + Number(r["cost"] ?? 0), 0)),
        },
      ]}
    />
  ),
});
