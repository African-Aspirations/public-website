/** Appearance preference, stored in a cookie so the server renders the right theme. */
export const THEME_COOKIE = "theme";
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
export const isTheme = (v: unknown): v is Theme => THEMES.includes(v as Theme);
