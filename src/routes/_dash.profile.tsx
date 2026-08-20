import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCog, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_dash/profile")({
  head: () => ({
    meta: [
      { title: "My profile — AgriTrack" },
      {
        name: "description",
        content: "Update your farmer profile, contact details and farm information.",
      },
      { property: "og:title", content: "My profile — AgriTrack" },
      {
        property: "og:description",
        content: "Update your farmer profile, contact details and farm information.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    account_type: "farmer",
    farm_name: "",
    location: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        account_type: profile.account_type ?? "farmer",
        farm_name: profile.farm_name ?? "",
        location: profile.location ?? "",
      });
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user!.id, ...form, account_type: form.account_type as "farmer" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<UserCog className="size-5" />}
        title="My profile"
        description="Your account details and farm information, used across the dashboard."
      />

      <div className="max-w-2xl rounded-lg border bg-card p-6 shadow-soft">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? "Admin" : "Member"}</Badge>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading profile…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                className="mt-1.5"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                className="mt-1.5"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="account_type">Account type</Label>
              <Select
                value={form.account_type}
                onValueChange={(v) => setForm((f) => ({ ...f, account_type: v }))}
              >
                <SelectTrigger id="account_type" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="manager">Agribusiness manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="farm_name">Farm / business name</Label>
              <Input
                id="farm_name"
                className="mt-1.5"
                value={form.farm_name}
                onChange={(e) => setForm((f) => ({ ...f, farm_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="location">Village / district</Label>
              <Input
                id="location"
                className="mt-1.5"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending && <Loader2 className="size-4 animate-spin" />} Save profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
