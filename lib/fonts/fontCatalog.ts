/** System stacks (no Google CSS load). Name is persisted on `TextConfig.font`. */
export const SYSTEM_FONTS = [
  { name: "SF Pro Display", cssValue: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" },
  { name: "SF Pro Rounded", cssValue: "'SF Pro Rounded', -apple-system, sans-serif" },
  { name: "Helvetica Neue", cssValue: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { name: "Helvetica", cssValue: "Helvetica, Arial, sans-serif" },
  { name: "Avenir Next", cssValue: "'Avenir Next', Avenir, sans-serif" },
  { name: "Georgia", cssValue: "Georgia, serif" },
  { name: "Arial", cssValue: "Arial, sans-serif" },
  { name: "Times New Roman", cssValue: "'Times New Roman', Times, serif" },
  { name: "Courier New", cssValue: "'Courier New', Courier, monospace" },
  { name: "Verdana", cssValue: "Verdana, sans-serif" },
  { name: "Trebuchet MS", cssValue: "'Trebuchet MS', sans-serif" },
] as const;

/** Curated popular Google families (appscreen-aligned subset). */
export const POPULAR_GOOGLE_FONTS = [
  "Inter",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Lato",
  "Raleway",
  "Nunito",
  "Playfair Display",
  "Oswald",
  "Merriweather",
  "Source Sans 3",
  "PT Sans",
  "Ubuntu",
  "Rubik",
  "Work Sans",
  "Quicksand",
  "Mulish",
  "Barlow",
  "DM Sans",
  "Manrope",
  "Space Grotesk",
  "Plus Jakarta Sans",
  "Outfit",
  "Sora",
  "Lexend",
  "Figtree",
  "Albert Sans",
  "Urbanist",
  "Bebas Neue",
  "Anton",
  "Archivo",
  "Bitter",
  "Cabin",
  "Crimson Text",
  "Dancing Script",
  "Fira Sans",
  "Heebo",
  "IBM Plex Sans",
  "Josefin Sans",
  "Karla",
  "Libre Franklin",
  "Lora",
  "Noto Sans",
  "Nunito Sans",
  "Pacifico",
  "Permanent Marker",
  "Roboto Condensed",
  "Roboto Mono",
  "Roboto Slab",
  "Shadows Into Light",
  "Signika",
  "Source Code Pro",
  "Titillium Web",
  "Varela Round",
  "Zilla Slab",
  "Arimo",
  "Barlow Condensed",
  "Catamaran",
  "Comfortaa",
  "Cormorant Garamond",
  "Dosis",
  "EB Garamond",
  "Exo 2",
  "Fira Code",
  "Hind",
  "Inconsolata",
  "Indie Flower",
  "Jost",
  "Kanit",
  "Libre Baskerville",
  "Maven Pro",
  "Mukta",
  "Nanum Gothic",
  "Oxygen",
  "Philosopher",
  "Play",
  "Prompt",
  "Rajdhani",
  "Red Hat Display",
  "Righteous",
  "Saira",
  "Sen",
  "Spectral",
  "Teko",
  "Vollkorn",
  "Yanone Kaffeesatz",
  "Zeyada",
  "Amatic SC",
  "Archivo Black",
  "Asap",
  "Assistant",
  "Bangers",
  "BioRhyme",
  "Cairo",
  "Cardo",
  "Chivo",
  "Concert One",
  "Cormorant",
  "Cousine",
  "DM Serif Display",
  "DM Serif Text",
  "Dela Gothic One",
  "El Messiri",
  "Encode Sans",
  "Eczar",
  "Fahkwang",
  "Gelasio",
] as const;

const EXTRA_GOOGLE_FONTS = [
  "Aclonica",
  "Acme",
  "Actor",
  "Adamina",
  "Alata",
  "Aleo",
  "Alfa Slab One",
  "Allerta",
  "Amiko",
  "Anaheim",
  "Andada",
  "Antonio",
  "Arbutus Slab",
  "Archivo Narrow",
  "Asap Condensed",
  "Atkinson Hyperlegible",
  "B612",
  "Baskervville",
  "Belleza",
  "BenchNine",
  "Bree Serif",
  "Bungee",
  "Cairo Play",
  "Cantarell",
  "Chakra Petch",
  "Cinzel",
  "Cormorant Infant",
  "Crete Round",
  "Cuprum",
  "Domine",
  "Faustina",
  "Fjalla One",
  "Fraunces",
  "Fredoka",
  "Gentium Plus",
  "Gothic A1",
  "Great Vibes",
  "IBM Plex Mono",
  "IBM Plex Serif",
  "Istok Web",
  "Kalam",
  "Khand",
  "Kumbh Sans",
  "Lekton",
  "Lemonada",
  "Literata",
  "Merienda",
  "Monda",
  "Noto Serif",
  "Orbitron",
  "Ovo",
  "Patua One",
  "Paytone One",
  "Prata",
  "Questrial",
  "Quattrocento",
  "Rasa",
  "Recursive",
  "Rosario",
  "Ruda",
  "Rufina",
  "Sarala",
  "Scada",
  "Shrikhand",
  "Sigmar One",
  "Staatliches",
  "Syne",
  "Tinos",
  "Unna",
  "Yrsa",
  "Zen Kaku Gothic New",
] as const;

const ALL_GOOGLE_SET = new Set<string>([
  ...POPULAR_GOOGLE_FONTS,
  ...EXTRA_GOOGLE_FONTS,
]);

/** Sorted Google family names for the “All” tab (offline, no API key). */
export function getAllGoogleFontFamilies(): string[] {
  return [...ALL_GOOGLE_SET].sort((a, b) => a.localeCompare(b));
}

export function isSystemFontName(name: string): boolean {
  return SYSTEM_FONTS.some((s) => s.name === name);
}

/** CSS `font-family` value for canvas / preview. */
export function resolveTextFontCss(primary: string): string {
  const sys = SYSTEM_FONTS.find((s) => s.name === primary);
  if (sys) return sys.cssValue;
  const escaped = primary.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}", var(--font-sans)`;
}

export type FontPickerCategory = "popular" | "system" | "all";

export interface FontOption {
  name: string;
  kind: "system" | "google";
}

export function getFontOptionsForCategory(category: FontPickerCategory): FontOption[] {
  if (category === "system") {
    return SYSTEM_FONTS.map((s) => ({ name: s.name, kind: "system" as const }));
  }
  if (category === "popular") {
    return POPULAR_GOOGLE_FONTS.map((name) => ({ name, kind: "google" as const }));
  }
  return [
    ...SYSTEM_FONTS.map((s) => ({ name: s.name, kind: "system" as const })),
    ...getAllGoogleFontFamilies().map((name) => ({ name, kind: "google" as const })),
  ];
}
