// src/money/types.ts

// -------------------------
// Scene
// -------------------------
export enum Scene {
  VILLAGE = 'VILLAGE',
  WORLD_MAP = 'WORLD_MAP',
  BATTLE = 'BATTLE',
  INVENTORY = 'INVENTORY',
  KINGDOM = 'KINGDOM',
  COLLECTION = 'COLLECTION',
  SUBSCRIPTION = 'SUBSCRIPTION', // [NEW] 구독 관리 화면 추가
  
  // 확장(옵션)
  GARDEN = 'GARDEN',
  MY_ROOM = 'MY_ROOM',
}

// -------------------------
// Inventory
// -------------------------
export type ItemType = 'consumable' | 'equipment' | 'material' | 'junk' | 'decor';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  count: number;
  rarity?: 'COMMON' | 'RARE' | 'EPIC';
  desc?: string;
}

// -------------------------
// Collection
// -------------------------
export type CollectionCategory = 'JUNK' | 'BADGE';
export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  obtainedAt: string; // ISO
  category: CollectionCategory;
  source?: string;
}

// -------------------------
// Pending logs
// -------------------------
export interface PendingTransaction {
  id: string;
  amount?: number;
  note: string;
  createdAt: string; // ISO
  categoryId?: string;
  kind?: 'SPEND' | 'SAVING' | 'REPAY' | 'INCOME' | 'ETC';
}

// -------------------------
// Luna
// -------------------------
export interface LunaCycle {
  startDate: string; // YYYY-MM-DD
  periodLength: number;
  cycleLength: number;
}

// -------------------------
// Buildings / Assets
// -------------------------
export interface AssetBuildingsState {
  fortress: number;
  airfield: number;
  mansion: number;
  tower: number;
  warehouse: number;
}

export type AssetBuildingId =
  | 'fortress'
  | 'airfield'
  | 'mansion'
  | 'tower'
  | 'warehouse';

export interface AssetBuildingView {
  id: AssetBuildingId;
  label: string;
  level: number;
  nextTarget: number | null;
  count: number;
}

// -------------------------
// Garden (정원 = 결과 화면)
// -------------------------
export type FlowerState = 'blooming' | 'normal' | 'withered';
export interface GardenState {
  treeLevel: number; // 꿈의 나무(저축)
  pondLevel: number; // 비상금 연못(옵션)
  flowerState: FlowerState;
  weedCount: number; // 잡초(부채/과소비)
  decorations?: { id: string; x: number; y: number; obtainedAt: string }[];
}

// -------------------------
// 흑화 모드
// -------------------------
export type PlayerMode = 'NORMAL' | 'DARK';
export interface PlayerStatus {
  mode: PlayerMode;
  darkLevel: number; // 0~100 (연출/패널티 단계에 사용)
}

// -------------------------
// 구독(고정비)
// -------------------------
export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  billingDay: number; // 1~28 권장
  cycle: BillingCycle;
  isActive: boolean;

  startedAt?: string; // YYYY-MM-DD
  lastChargedDate?: string; // YYYY-MM-DD (중복청구 방지)
  note?: string;

  categoryId?: string; // 'subscription' 등
}

// -------------------------
// NPC(확장용)
// -------------------------
export type NpcId = 'angel' | 'demon' | 'gardener' | 'curator';
export interface DialogueLine {
  speaker: NpcId | 'system';
  text: string;
  mood?: 'neutral' | 'warm' | 'worried' | 'stern' | 'playful';
}

// -------------------------
// User state
// -------------------------
export interface UserCounters {
  defenseActionsToday: number;
  junkObtainedToday: number;
  dailyTotalSpend: number;
  hadSpendingToday: boolean;
  noSpendStreak: number;
  guardPromptShownToday: boolean;

  lastDailyResetDate?: string; // YYYY-MM-DD
  lastDayEndDate?: string; // YYYY-MM-DD
}

export interface UserState {
  name: string;
  level: number;
  jobTitle: string;
  seedPackets?: number; // [NEW] 씨앗 봉투

  currentBudget: number; // HP
  maxBudget: number;

  mp: number;
  maxMp: number;

  junk: number;
  salt: number;

  garden: GardenState;
  status: PlayerStatus;

  lunaCycle: LunaCycle;

  inventory: Item[];
  collection: CollectionItem[];
  pending: PendingTransaction[];

  materials: Record<string, number>;
  assets: AssetBuildingsState;

  counters: UserCounters;
  
  // ✅ 고정비/구독
  subscriptions: SubscriptionPlan[];

  lastLoginDate?: string;
}
