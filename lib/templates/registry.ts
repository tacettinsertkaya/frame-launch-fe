import type { Project, Screenshot } from "@/lib/types/project";
import {
  defaultBackground,
  defaultBorder,
  defaultDevice,
  defaultShadow,
  defaultText,
} from "@/lib/types/project";
import { uid, nowIso } from "@/lib/utils";

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  category: "SaaS" | "E-commerce" | "Fitness" | "AI" | "Marketing";
  thumbBg: string;
  build: () => Project;
}

function makeProject(name: string, screenshots: Screenshot[]): Project {
  return {
    id: uid("p_"),
    name,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    schemaVersion: 2,
    defaultLocale: "tr",
    activeLocales: ["tr", "en"],
    screenshots,
  };
}

function screenshot(partial: Partial<Screenshot>): Screenshot {
  return {
    id: uid("s_"),
    name: "Ekran",
    deviceSizeId: "iphone-69",
    uploads: {},
    background: defaultBackground(),
    device: defaultDevice(),
    text: {
      headline: defaultText("top", true),
      subheadline: { ...defaultText("top", false), enabled: false },
    },
    elements: [],
    popouts: [],
    ...partial,
  };
}

const saasDashboardClean = (): Project =>
  makeProject("SaaS Dashboard – Clean", [
    screenshot({
      name: "Hero",
      background: {
        ...defaultBackground(),
        type: "gradient",
        gradient: {
          direction: 135,
          stops: [
            { color: "#e8c610", position: 0 },
            { color: "#fff066", position: 100 },
          ],
        },
      },
      text: {
        headline: {
          ...defaultText("top", true),
          text: { tr: "İşinizi büyütün", en: "Grow your business" },
          color: "#000000",
        },
        subheadline: {
          ...defaultText("top", false),
          enabled: true,
          text: {
            tr: "Tek bir panelde tüm metrikler",
            en: "All your metrics in one dashboard",
          },
          color: "#000000",
        },
      },
      device: { ...defaultDevice(), scale: 72, verticalPos: 60 },
    }),
    screenshot({
      name: "Analytics",
      background: {
        ...defaultBackground(),
        type: "solid",
        solidColor: "#000000",
      },
      text: {
        headline: {
          ...defaultText("top", true),
          text: { tr: "Verileri keşfedin", en: "Discover insights" },
          color: "#e8c610",
        },
        subheadline: { ...defaultText("top", false), enabled: false },
      },
    }),
  ]);

const ecomShopBold = (): Project =>
  makeProject("E-commerce – Bold", [
    screenshot({
      name: "Hero",
      background: {
        ...defaultBackground(),
        type: "gradient",
        gradient: {
          direction: 135,
          stops: [
            { color: "#ff6a00", position: 0 },
            { color: "#ee0979", position: 100 },
          ],
        },
      },
      text: {
        headline: {
          ...defaultText("bottom", true),
          text: { tr: "Hızlı alışveriş", en: "Shop in seconds" },
          color: "#ffffff",
          fontSize: 64,
        },
        subheadline: {
          ...defaultText("bottom", false),
          enabled: true,
          text: { tr: "Saniyeler içinde sepete ekle", en: "Add to cart in seconds" },
        },
      },
      device: {
        ...defaultDevice(),
        scale: 65,
        verticalPos: 50,
        shadow: { ...defaultShadow(), blur: 80, opacity: 50 },
      },
    }),
  ]);

const fitnessYogaCalm = (): Project =>
  makeProject("Fitness & Yoga – Calm", [
    screenshot({
      name: "Calm",
      background: {
        ...defaultBackground(),
        type: "gradient",
        gradient: {
          direction: 160,
          stops: [
            { color: "#11998e", position: 0 },
            { color: "#38ef7d", position: 100 },
          ],
        },
      },
      text: {
        headline: {
          ...defaultText("top", true),
          text: { tr: "Nefes al, sakinleş", en: "Breathe in, calm down" },
          color: "#ffffff",
          fontSize: 52,
        },
        subheadline: {
          ...defaultText("top", false),
          enabled: true,
          text: { tr: "Günlük yoga rutini", en: "Daily yoga routine" },
        },
      },
    }),
  ]);

const aiToolFuturistic = (): Project =>
  makeProject("AI Tool – Futuristic", [
    screenshot({
      name: "Future",
      background: {
        ...defaultBackground(),
        type: "gradient",
        gradient: {
          direction: 135,
          stops: [
            { color: "#000000", position: 0 },
            { color: "#1a1a1a", position: 100 },
          ],
        },
        overlay: { color: "#e8c610", opacity: 6 },
      },
      text: {
        headline: {
          ...defaultText("top", true),
          text: { tr: "Yapay zekânın gücüyle", en: "Powered by AI" },
          color: "#e8c610",
          fontSize: 60,
        },
        subheadline: {
          ...defaultText("top", false),
          enabled: true,
          text: {
            tr: "Saatler süren işleri saniyelere indirin",
            en: "Turn hours of work into seconds",
          },
          color: "#ffffff",
        },
      },
      device: {
        ...defaultDevice(),
        scale: 70,
        border: { ...defaultBorder(), enabled: true, color: "#e8c610", width: 4, opacity: 70 },
      },
    }),
  ]);

const marketingOgLaunch = (): Project =>
  makeProject("Marketing OG – Launch", [
    screenshot({
      name: "OG Cover",
      deviceSizeId: "og",
      background: {
        ...defaultBackground(),
        type: "solid",
        solidColor: "#000000",
      },
      device: { ...defaultDevice(), scale: 0, verticalPos: 50 },
      text: {
        headline: {
          ...defaultText("top", true),
          text: { tr: "Lansman bugün!", en: "Launch day!" },
          color: "#e8c610",
          fontSize: 96,
          align: "left",
          verticalOffset: 40,
        },
        subheadline: {
          ...defaultText("top", false),
          enabled: true,
          text: { tr: "Yeni bir başlangıç", en: "A new beginning" },
          color: "#ffffff",
          align: "left",
          verticalOffset: 50,
          fontSize: 32,
        },
      },
    }),
  ]);

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "saas-dashboard-clean",
    name: "SaaS Dashboard – Clean",
    description: "Sarı-altın gradient, dengeli yerleşim, dashboard temalı SaaS sunumları için.",
    category: "SaaS",
    thumbBg: "linear-gradient(135deg,#e8c610 0%,#fff066 100%)",
    build: saasDashboardClean,
  },
  {
    id: "ecom-shop-bold",
    name: "E-commerce – Bold",
    description: "Sıcak turuncu-pembe gradient, çağrı odaklı e-ticaret kapakları.",
    category: "E-commerce",
    thumbBg: "linear-gradient(135deg,#ff6a00 0%,#ee0979 100%)",
    build: ecomShopBold,
  },
  {
    id: "fitness-yoga-calm",
    name: "Fitness & Yoga – Calm",
    description: "Sakinleştirici yeşil tonlar, fitness ve yoga uygulamaları için.",
    category: "Fitness",
    thumbBg: "linear-gradient(135deg,#11998e 0%,#38ef7d 100%)",
    build: fitnessYogaCalm,
  },
  {
    id: "ai-tool-futuristic",
    name: "AI Tool – Futuristic",
    description: "Saf siyah üzerine sarı vurgu — AI ve yapay zeka ürünleri için.",
    category: "AI",
    thumbBg: "linear-gradient(135deg,#000000 0%,#1a1a1a 100%)",
    build: aiToolFuturistic,
  },
  {
    id: "marketing-og-launch",
    name: "Marketing OG – Launch",
    description: "Siyah arka plan + sarı başlık — sosyal medya kapağı (1200×630).",
    category: "Marketing",
    thumbBg: "linear-gradient(100deg,#000000 0%,#1a1a1a 100%)",
    build: marketingOgLaunch,
  },
];

export function getTemplate(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
