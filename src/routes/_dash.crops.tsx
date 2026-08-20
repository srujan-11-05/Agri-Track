import { createFileRoute } from "@tanstack/react-router";
import { Wheat } from "lucide-react";

import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import { num, shortDate, today } from "@/lib/format";

export const Route = createFileRoute("/_dash/crops")({
  head: () => ({
    meta: [
      { title: "Crop planning — AgriTrack" },
      {
        name: "description",
        content: "Plan crops by season, track sowing and harvest dates and expected yield.",
      },
      { property: "og:title", content: "Crop planning — AgriTrack" },
      {
        property: "og:description",
        content: "Plan crops by season and track sowing, harvest and yield.",
      },
    ],
  }),
  component: () => (
    <CrudPage
      table="crops"
      title="Crop planning"
      singular="Crop"
      description="Plan each season's crops with sowing dates, expected harvest and yield targets."
      icon={<Wheat className="size-5" />}
      orderBy={{ column: "sowing_date" }}
      searchKeys={["name", "variety", "season", "status"]}
      fields={[
        { name: "name", label: "Crop", type: "text", required: true },
        { name: "variety", label: "Variety", type: "text" },
        {
          name: "farm_id",
          label: "Farm",
          type: "select",
          optionsFrom: { table: "farms", labelKey: "name" },
        },
        {
          name: "season",
          label: "Season",
          type: "select",
          options: ["Kharif", "Rabi", "Zaid", "Perennial"],
          defaultValue: "Kharif",
        },
        { name: "area", label: "Area planted", type: "number" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["planned", "sown", "growing", "harvested", "failed"],
          defaultValue: "planned",
        },
        { name: "sowing_date", label: "Sowing date", type: "date", defaultValue: today() },
        { name: "expected_harvest_date", label: "Expected harvest", type: "date" },
        { name: "expected_yield", label: "Expected yield", type: "number" },
        {
          name: "yield_unit",
          label: "Yield unit",
          type: "select",
          options: ["quintal", "kg", "tonne", "bag"],
          defaultValue: "quintal",
        },
      ]}
      columns={[
        {
          key: "name",
          label: "Crop",
          render: (r) => (
            <div>
              <p className="font-medium">{r["name"]}</p>
              {r["variety"] && <p className="text-xs text-muted-foreground">{r["variety"]}</p>}
            </div>
          ),
        },
        { key: "season", label: "Season" },
        { key: "area", label: "Area", align: "right", render: (r) => num(r["area"]) },
        { key: "sowing_date", label: "Sown", render: (r) => shortDate(r["sowing_date"]) },
        {
          key: "expected_harvest_date",
          label: "Harvest",
          render: (r) => shortDate(r["expected_harvest_date"]),
        },
        {
          key: "expected_yield",
          label: "Yield",
          align: "right",
          render: (r) =>
            r["expected_yield"] ? `${num(r["expected_yield"])} ${r["yield_unit"]}` : "—",
        },
        {
          key: "status",
          label: "Status",
          render: (r) => (
            <Badge
              variant={
                r["status"] === "harvested"
                  ? "default"
                  : r["status"] === "failed"
                    ? "destructive"
                    : "secondary"
              }
            >
              {r["status"]}
            </Badge>
          ),
        },
      ]}
      summary={(rows) => [
        { label: "Crops tracked", value: String(rows.length) },
        {
          label: "Active in field",
          value: String(
            rows.filter((r) => ["sown", "growing"].includes(String(r["status"]))).length,
          ),
        },
        {
          label: "Area planted",
          value: num(rows.reduce((s, r) => s + Number(r["area"] ?? 0), 0)),
        },
        {
          label: "Harvested",
          value: String(rows.filter((r) => r["status"] === "harvested").length),
        },
      ]}
    />
  ),
});
