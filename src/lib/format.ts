export const money = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const num = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value ?? 0));

export const shortDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const today = () => new Date().toISOString().slice(0, 10);
