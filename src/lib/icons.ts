import {
  ArrowUpRight,
  Baby,
  BookOpen,
  Bus,
  Clock,
  DoorOpen,
  Footprints,
  Globe,
  HandHeart,
  Heart,
  House,
  MapPin,
  Moon,
  Music,
  ParkingSquare,
  Shield,
  Sun,
  Sunrise,
  Target,
  Train,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";

// content/*.yaml 에서는 아이콘을 아래의 고정된 키로만 고른다.
// 새 아이콘이 필요하면 여기에 키를 더한다 (콘텐츠에서 임의의 아이콘을 불러오지 않는다).
export const ICONS = {
  sun: Sun,
  moon: Moon,
  heart: Heart,
  sunrise: Sunrise,
  users: Users,
  music: Music,
  target: Target,
  "book-open": BookOpen,
  shield: Shield,
  globe: Globe,
  baby: Baby,
  parking: ParkingSquare,
  "map-pin": MapPin,
  clock: Clock,
  train: Train,
  bus: Bus,
  home: House,
  footprints: Footprints,
  "arrow-up-right": ArrowUpRight,
  "door-open": DoorOpen,
  "hand-heart": HandHeart,
  utensils: Utensils,
} as const satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;

export const ICON_KEYS = Object.keys(ICONS) as [IconKey, ...IconKey[]];

export function getIcon(key: string): LucideIcon {
  return ICONS[key as IconKey] ?? MapPin;
}
