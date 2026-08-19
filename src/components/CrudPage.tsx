import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Inbox } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";

export type Row = Record<string, any>;

export type CrudField = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "switch";
  options?: string[];
  required?: boolean;
  defaultValue?: string | number | boolean;
  placeholder?: string;
  span?: 1 | 2;
  optionsFrom?: { table: string; labelKey: string };
};

export type CrudColumn = {
  key: string;
  label: string;
  render?: (row: Row) => ReactNode;
  align?: "left" | "right";
};

type Props = {
  table: string;
  title: string;
  description: string;
  singular: string;
  icon: ReactNode;
  fields: CrudField[];
  columns: CrudColumn[];
  orderBy: { column: string; ascending?: boolean };
  searchKeys: string[];
  derive?: (values: Row) => Row;
  summary?: (rows: Row[]) => { label: string; value: string }[];
  readOnly?: boolean;
  readOnlyNote?: string;
};

function emptyValues(fields: CrudField[]): Row {
  const out: Row = {};
  for (const f of fields) {
    out[f.name] =
      f.defaultValue !== undefined
        ? f.defaultValue
        : f.type === "switch"
          ? false
          : f.type === "number"
            ? ""
            : "";
  }
  return out;
}

export function CrudPage({
  table,
  title,
  description,
  singular,
  icon,
  fields,
  columns,
  orderBy,
  searchKeys,
  derive,
  summary,
  readOnly = false,
  readOnlyNote,
}: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [values, setValues] = useState<Row>(() => emptyValues(fields));
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: [table, orderBy.column],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as never)
        .select("*")
        .order(orderBy.column, { ascending: orderBy.ascending ?? false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const relationField = fields.find((f) => f.optionsFrom);
  const { data: relationRows = [] } = useQuery({
    queryKey: ["relation", relationField?.optionsFrom?.table],
    enabled: Boolean(relationField),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(relationField!.optionsFrom!.table as never)
        .select("*");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: Row) => {
      if (editing) {
        const { error } = await supabase
          .from(table as never)
          .update(payload as never)
          .eq("id", editing["id"]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table as never)
          .insert({ ...payload, ...(user ? { user_id: user["id"] } : {}) } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(editing ? `${singular} updated` : `${singular} added`);
      setOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`${singular} deleted`);
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)),
    );
  }, [rows, search, searchKeys]);

  const startCreate = () => {
    setEditing(null);
    setValues(emptyValues(fields));
    setOpen(true);
  };

  const startEdit = (row: Row) => {
    setEditing(row);
    const next: Row = {};
    for (const f of fields) next[f.name] = row[f.name] ?? emptyValues([f])[f.name];
    setValues(next);
    setOpen(true);
  };

  const submit = () => {
    const payload: Row = {};
    for (const f of fields) {
      const raw = values[f.name];
      if (f.required && (raw === "" || raw === null || raw === undefined)) {
        toast.error(`${f.label} is required`);
        return;
      }
      if (f.type === "number") payload[f.name] = raw === "" ? 0 : Number(raw);
      else if (f.type === "switch") payload[f.name] = Boolean(raw);
      else payload[f.name] = raw === "" ? null : raw;
    }
    save.mutate(derive ? { ...payload, ...derive(payload) } : payload);
  };

  const cards = summary?.(rows) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={icon}
        title={title}
        description={description}
        action={
          readOnly ? undefined : (
            <Button onClick={startCreate}>
              <Plus className="size-4" /> Add {singular}
            </Button>
          )
        }
      />

      {cards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-lg border bg-card p-4 shadow-soft">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-1 font-display text-2xl text-foreground">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-52">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              className="pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} record{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        {readOnly && readOnlyNote && (
          <p className="border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            {readOnlyNote}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="size-8 text-muted-foreground" />
            <p className="font-display text-lg">Nothing here yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {readOnly
                ? "Records will appear here once they are published."
                : `Add your first ${singular.toLowerCase()} to start tracking it.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.key} className={c.align === "right" ? "text-right" : ""}>
                      {c.label}
                    </TableHead>
                  ))}
                  {!readOnly && <TableHead className="w-24 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row["id"]}>
                    {columns.map((c) => (
                      <TableCell
                        key={c.key}
                        className={c.align === "right" ? "text-right" : undefined}
                      >
                        {c.render ? c.render(row) : (row[c.key] ?? "—")}
                      </TableCell>
                    ))}
                    {!readOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${singular}`}
                            onClick={() => startEdit(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${singular}`}
                            onClick={() => setDeleteId(row["id"])}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? `Edit ${singular}` : `Add ${singular}`}
            </DialogTitle>
            <DialogDescription>Fields marked required must be filled in.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.span === 2 ? "sm:col-span-2" : undefined}>
                <Label htmlFor={f.name}>
                  {f.label}
                  {f.required && <span className="text-destructive"> *</span>}
                </Label>
                <div className="mt-1.5">
                  {f.type === "textarea" ? (
                    <Textarea
                      id={f.name}
                      value={values[f.name] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    />
                  ) : f.type === "switch" ? (
                    <Switch
                      id={f.name}
                      checked={Boolean(values[f.name])}
                      onCheckedChange={(c) => setValues((v) => ({ ...v, [f.name]: c }))}
                    />
                  ) : f.type === "select" ? (
                    <Select
                      value={values[f.name] ? String(values[f.name]) : ""}
                      onValueChange={(val) => setValues((v) => ({ ...v, [f.name]: val }))}
                    >
                      <SelectTrigger id={f.name}>
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {f.optionsFrom
                          ? relationRows.map((r) => (
                              <SelectItem key={r["id"]} value={r["id"]}>
                                {r[f.optionsFrom!.labelKey]}
                              </SelectItem>
                            ))
                          : (f.options ?? []).map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={f.name}
                      type={f.type}
                      step={f.type === "number" ? "any" : undefined}
                      value={values[f.name] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the record from your farm data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && remove.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
