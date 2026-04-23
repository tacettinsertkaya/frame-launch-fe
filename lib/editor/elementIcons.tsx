import type { LucideIcon } from "lucide-react";
import {
  Star,
  Heart,
  Sparkles,
  Zap,
  CheckCircle2,
  Shield,
  Trophy,
  TrendingUp,
  Users,
  Smartphone,
  LayoutDashboard,
} from "lucide-react";

/** İkon öğesi `iconName` için Lucide eşlemesi (bilinmeyen → Sparkles). */
export const ELEMENT_ICON_MAP: Record<string, LucideIcon> = {
  Star,
  Heart,
  Sparkles,
  Zap,
  CheckCircle2,
  Shield,
  Trophy,
  TrendingUp,
  Users,
  Smartphone,
  LayoutDashboard,
};

export const ELEMENT_ICON_NAMES = Object.keys(ELEMENT_ICON_MAP) as readonly string[];

export function resolveElementIcon(name: string): LucideIcon {
  return ELEMENT_ICON_MAP[name] ?? Sparkles;
}
