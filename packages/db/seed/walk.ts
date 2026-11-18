import type { AssetRef, RowRef } from "./types";

export const isAsset = (v: unknown): v is AssetRef =>
  typeof v === "object" && v !== null && "$asset" in v;
export const isRowRef = (v: unknown): v is RowRef =>
  typeof v === "object" && v !== null && "$ref" in v;

/** Every distinct legacy asset path referenced anywhere in the seed, with its first alt text. */
export function collectAssets(root: unknown): Map<string, string> {
  const found = new Map<string, string>();
  const visit = (v: unknown) => {
    if (isAsset(v)) {
      if (!found.has(v.$asset) || (!found.get(v.$asset) && v.alt)) found.set(v.$asset, v.alt);
    } else if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === "object") Object.values(v).forEach(visit);
  };
  visit(root);
  return found;
}

/** Deep-replace placeholders. `asset` → media id, `ref` → row id. */
export function resolve(
  v: unknown,
  mediaId: (a: AssetRef) => string,
  rowId: (r: RowRef) => string,
): unknown {
  if (isAsset(v)) return mediaId(v);
  if (isRowRef(v)) return rowId(v);
  if (Array.isArray(v)) return v.map((x) => resolve(x, mediaId, rowId));
  if (v && typeof v === "object")
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x, mediaId, rowId)]));
  return v;
}
