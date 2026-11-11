import type { ActivityGrade } from "@/types/experience";

export const OUTFIT_SLOTS = [
  ["HEAD", "머리(헤어)", false],
  ["ACCESSORY_1", "액세서리 1", false],
  ["ACCESSORY_2", "액세서리 2", false],
  ["FACE", "얼굴장식", false],
  ["CLOTHING", "의상", true],
  ["TAIL", "꼬리", false],
  ["HANDS", "손(장갑)", true],
  ["FEET", "발(신발)", true],
  ["WEAPON", "무기", false],
  ["ROBE", "로브", false],
  ["MOTION", "모션", false],
] as const;
export type OutfitSlot = (typeof OUTFIT_SLOTS)[number][0];
export interface CatalogItem {
  name: string;
  topCategory: string;
  subCategory: string;
}
export interface OutfitItem {
  slot: OutfitSlot;
  inputType: "CATALOG" | "CUSTOM";
  name: string;
  topCategory?: string | null;
  subCategory?: string | null;
}
interface OutfitAuthor {
  nickname: string;
  profileImageUrl: string | null;
  serverName: string | null;
  verified: boolean;
  activityGrade?: ActivityGrade | null;
}
interface OutfitImage {
  id: number;
  url: string;
  displayOrder: number;
}
export interface Outfit {
  id: number;
  userId: number;
  author: OutfitAuthor;
  content: string;
  images: OutfitImage[];
  items: OutfitItem[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface OutfitPage<T> {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
}
export interface OutfitViewerState {
  outfitId: number;
  liked: boolean;
  bookmarked: boolean;
}
export interface OutfitComment {
  id: number;
  outfitId: number;
  userId: number;
  author: OutfitAuthor;
  content: string;
  parentId: number | null;
  deleted: boolean;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}
export const slotLabel = (slot: OutfitSlot) =>
  OUTFIT_SLOTS.find(([key]) => key === slot)?.[1] ?? slot;
