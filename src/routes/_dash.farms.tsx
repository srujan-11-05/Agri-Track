import { createFileRoute } from "@tanstack/react-router";
import { Tractor } from "lucide-react";

import { CrudPage } from "@/components/CrudPage";
import { num } from "@/lib/format";

export const Route = createFileRoute("/_dash/farms")({
  head: () => ({
    meta: [
      { title: "Farms — AgriTrack" },
      { name: "description", content: "Record farm land, area, soil type and location details." },
      { property: "og:title", content: "Farms — AgriTrack" },
      { property: "og:description", content: "Record farm land, area, soil type and location." },
    ],
  }),
  component: () => (
    <CrudPage
      table="farms"
      title="Farms"
      singular="Farm"
      description="Keep your land parcels, area and soil information in one register."
      icon={<Tractor className="size-5" />}
      orderBy={{ column: "created_at" }}
      searchKeys={["name", "location", "soil_type"]}
      fields={[
        { name: "name", label: "Farm name", type: "text", required: true },
        { name: "location", label: "Location", type: "text" },
        { name: "total_area", label: "Total area", type: "number" },
        {
          name: "area_unit",
          label: "Area unit",
          type: "select",
          options: ["acres", "hectares", "bigha", "guntha"],
          defaultValue: "acres",
        },
        {
          name: "soil_type",
          label: "Soil type",
          type: "select",
          options: ["Alluvial", "Black", "Red", "Laterite", "Sandy", "Clay", "Loamy"],
        },
        { name: "notes", label: "Notes", type: "textarea", span: 2 },
      ]}
      columns={[
        { key: "name", label: "Farm" },
        { key: "location", label: "Location" },
        {
          key: "total_area",
          label: "Area",
          align: "right",
          render: (r) => `${num(r["total_area"])} ${r["area_unit"]}`,
        },
        { key: "soil_type", label: "Soil" },
      ]}
      summary={(rows) => [
        { label: "Farms registered", value: String(rows.length) },
        {
          label: "Total area",
          value: num(rows.reduce((s, r) => s + Number(r["total_area"] ?? 0), 0)),
        },
      ]}
    />
  ),
});
