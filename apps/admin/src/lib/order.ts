import "server-only";

type Row = { id: string };

/**
 * Move one row up or down among its siblings, then renumber them 0..n so gaps and
 * duplicates from older data disappear. `siblings` must be in display order.
 */
export async function move(
  siblings: Row[],
  id: string,
  dir: "up" | "down",
  setOrder: (id: string, order: number) => Promise<unknown>,
) {
  const i = siblings.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= siblings.length) return false;
  const next = [...siblings];
  [next[i], next[j]] = [next[j] as Row, next[i] as Row];
  await Promise.all(next.map((r, n) => setOrder(r.id, n)));
  return true;
}
