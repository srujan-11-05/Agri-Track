import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { shortDate } from "@/lib/format";

export const Route = createFileRoute("/_dash/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — AgriTrack" },
      {
        name: "description",
        content: "Administrator view of registered users, account types and role assignments.",
      },
      { property: "og:title", content: "Admin panel — AgriTrack" },
      {
        property: "og:description",
        content: "Administrator view of registered users and role assignments.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin } = useAuth();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={<ShieldAlert className="size-5" />}
          title="Admin panel"
          description="This area is restricted to platform administrators."
        />
        <div className="rounded-lg border bg-card p-8 text-center shadow-soft">
          <p className="font-display text-lg">You don't have administrator access</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Roles are checked on the server for every request, so this page stays empty unless an
            administrator grants you the admin role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ShieldCheck className="size-5" />}
        title="Admin panel"
        description="Registered users, their account types and assigned roles."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total users</p>
          <p className="mt-1 font-display text-2xl">{profiles.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Administrators</p>
          <p className="mt-1 font-display text-2xl">
            {roles.filter((r) => r.role === "admin").length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Farmers</p>
          <p className="mt-1 font-display text-2xl">
            {profiles.filter((p) => p.account_type === "farmer").length}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-soft">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Account type</TableHead>
                  <TableHead>Farm</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.account_type}</Badge>
                    </TableCell>
                    <TableCell>{p.farm_name || "—"}</TableCell>
                    <TableCell>{p.location || "—"}</TableCell>
                    <TableCell>
                      {roles
                        .filter((r) => r.user_id === p.id)
                        .map((r) => (
                          <Badge key={r.id} className="mr-1" variant={r.role === "admin" ? "default" : "outline"}>
                            {r.role}
                          </Badge>
                        ))}
                    </TableCell>
                    <TableCell>{shortDate(p.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
