/** "1200000.00" + "USD" → "US$1,200,000". Null/empty → null. */
export function formatMoney(value: string | null, currency: string): string | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString("en-GH")}`;
  }
}
