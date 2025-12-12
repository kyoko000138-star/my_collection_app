// src/money/types.ts

// src/money/types.ts

export enum Scene {
  GARDEN = 'GARDEN',
  MY_ROOM = 'MY_ROOM',
  VILLAGE_MAP = 'VILLAGE_MAP',
  LIBRARY = 'LIBRARY',
  WORLD_MAP = 'WORLD_MAP',
  FIELD = 'FIELD',
  BATTLE = 'BATTLE',
  INVENTORY = 'INVENTORY',
  KINGDOM = 'KINGDOM',
  COLLECTION = 'COLLECTION',
  SUBSCRIPTION = 'SUBSCRIPTION',
  FORGE = 'FORGE', // [NEW] 대장간
  SHOP = 'SHOP',   // [NEW] 잡화점
  SETTINGS = 'SETTINGS'
}

// -------------------------
// Scene Definition
// -------------------------
export enum Scene {
  GARDEN = 'GARDEN',
  MY_ROOM = 'MY_ROOM',
  VILLAGE_MAP = 'VILLAGE_MAP',
  LIBRARY = 'LIBRARY',
  WORLD_MAP = 'WORLD_MAP',
  FIELD = 'FIELD',
  BATTLE = 'BATTLE',
  INVENTORY = 'INVENTORY',
  KINGDOM = 'KINGDOM',
  COLLECTION = 'COLLECTION',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

// -------------------------
// Assets
// -------------------------
export type AssetBuildingId = 'fence' | 'greenhouse' | 'mansion' | 'fountain' | 'barn';

export interface AssetBuildingsState {
  fence: number;
  greenhouse: number;
  mansion: number;
  fountain: number;
  barn: number;
}

export interface AssetBuildingView {
  id: AssetBuildingId;
  label: string;
  level: number;
  nextTarget: number | null;
  count: number;
}

// -------------------------
// Field & Shadows (NEW)
// -------------------------
export interface FieldObject {
  id: string;
  x: number;
  y: number;
  type: 'JUNK' | 'HERB' | 'CHEST';
  isCollected: boolean;
}

export interface ShadowMonster {
  id: string;
  amount: number;      // 지출 금액
  category: string;    // 카테고리
  createdAt: string;
  x: number;           // 필드 좌표 X
  y: number;           // 필드 좌표 Y
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
// Garden
// -------------------------
export type FlowerState = 'blooming' | 'normal' | 'withered';
export interface GardenState {
  treeLevel: number;
  pondLevel: number;
  flowerState: FlowerState;
  weedCount: number;
  decorations?: { id: string; x: number; y: number; obtainedAt: string }[];
}

// -------------------------
// Player Status
// -------------------------
export type PlayerMode = 'NORMAL' | 'DARK';
export interface PlayerStatus {
  mode: PlayerMode;
  darkLevel: number;
}

// -------------------------
// Subscription
// -------------------------
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  billingDay: number;
  cycle: BillingCycle;
  isActive: boolean;
  startedAt?: string;
  lastChargedDate?: string;
  note?: string;
  categoryId?: string;
}

// -------------------------
// User State Root
// -------------------------
export interface UserCounters {
  defenseActionsToday: number;
  junkObtainedToday: number;
  dailyTotalSpend: number;
  hadSpendingToday: boolean;
  noSpendStreak: number;
  guardPromptShownToday: boolean;
  lastDailyResetDate?: string;
  lastDayEndDate?: string;
}

export interface LunaCycle {
  startDate: string;
  periodLength: number;
  cycleLength: number;
}

export interface PendingTransaction {
  id: string;
  amount?: number;
  note: string;
  createdAt: string;
  categoryId?: string;
  kind?: 'SPEND' | 'SAVING' | 'REPAY' | 'INCOME' | 'ETC';
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  obtainedAt: string;
  category: 'JUNK' | 'BADGE';
  source?: string;
}

export interface UserState {
  name: string;
  level: number;
  jobTitle: string;
  seedPackets?: number;

  currentBudget: number;
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
  subscriptions: SubscriptionPlan[];
  
  // [NEW] 해결되지 않은 그림자들
  unresolvedShadows: ShadowMonster[];

  lastLoginDate?: string;
}
