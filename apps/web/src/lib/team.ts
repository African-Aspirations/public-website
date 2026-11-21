/** Page that holds every leader's full bio; the About page modal loads bios from it. */
export const LEADERSHIP_PATH = "/about/leadership";

/** Stable anchor id for a team member, e.g. "Cleland Goffie Bruce Jnr" → "cleland-goffie-bruce-jnr". */
export const memberSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
