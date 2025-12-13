// src/money/types.ts

// -------------------------
// 1. Scene Definition (확장)
// -------------------------
export enum Scene {
  GARDEN = 'GARDEN',
  MY_ROOM = 'MY_ROOM',         // [NEW]
  VILLAGE_MAP = 'VILLAGE_MAP', // [NEW]
  LIBRARY = 'LIBRARY',
  WORLD_MAP = 'WORLD_MAP',
  FIELD = 'FIELD',
  BATTLE = 'BATTLE',
  INVENTORY = 'INVENTORY',     // [NEW]
  KINGDOM = 'KINGDOM',
  COLLECTION = 'COLLECTION',
  SUBSCRIPTION = 'SUBSCRIPTION',
  FORGE = 'FORGE',
  SHOP = 'SHOP',
  SETTINGS = 'SETTINGS',       // [NEW]
  MONTHLY_REPORT = 'MONTHLY_REPORT'
}

// -------------------------
// 2. Existing Data Types (원본 100% 유지)
// -------------------------
export type ClassType = 'GUARDIAN' | 'SAGE' | 'ALCHEMIST' | 'DRUID';
export type LocationId = 'VILLAGE_BASE' | 'CITY_CAPITAL' | 'FOREST_OUTLAW';

export type ItemEffectType = 'MP_RESTORE' | 'MP_COST_DOWN' | 'SALT_BOOST' | 'JUNK_CLEAN' | 'GROWTH_BOOST' | 'NPC_LOVE' | 'NONE';

export interface ItemData {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'material' | 'junk' | 'decor';
  desc: string;
  effectType?: ItemEffectType;
  effectValue?: number;
  price?: number;
  equipSlot?: 'weapon' | 'armor' | 'accessory';
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'material' | 'junk';
  count: number;
}

// v4 금융 시스템 (삭제 금지)
export type TxType = 'EXPENSE' | 'INCOME' | 'TRANSFER';
export type CategoryId = string; // (너무 길어서 string으로 퉁치지 않고 원본 유지하신다면 그대로 두셔도 됩니다)
export type IntentTag = 'necessary' | 'planned' | 'impulse' | 'social_duty' | 'explore' | string;

export interface Transaction {
  id: string;
  type?: TxType;
  amount: number;
  category: string;
  intent?: IntentTag;
  note?: string;
  createdAt: string;
}
export type PendingTransaction = Transaction;

// 자산 (기존)
export interface AssetBuildingsState {
  fence: number;
  greenhouse: number;
  mansion: number;
  fountain: number;
  barn: number;
}

export interface AssetBuildingView {
  id: string;
  label: string;
  level: number;
  nextTarget: number | null;
  count: number;
}

// -------------------------
// 3. New RPG Types (추가됨)
// -------------------------
export interface ShadowMonster {
  id: string;
  sourceTxId?: string;
  amount: number;
  category: string;
  createdAt: string;
  x: number;
  y: number;
}

export interface MonsterStat {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  sprite: string;
  rewardJunk: number;
}

export interface FieldObject {
  id: string;
  x: number;
  y: number;
  type: 'JUNK' | 'HERB' | 'CHEST' | 'SIGNPOST';
  isCollected: boolean;
}

// -------------------------
// 4. Root State (원본 필드 전원 복구 + 신규 필드 추가)
// -------------------------
export interface GardenState {
  treeLevel: number;
  pondLevel: number;
  flowerState: 'blooming' | 'normal' | 'withered';
  weedCount: number;
  decorations: string[]; // 원본 유지 (string[])
}

export interface PlayerStatus {
  mode: 'NORMAL' | 'DARK';
  darkLevel: number;
}

export interface LunaCycle {
  history: { startDate: string; endDate: string; }[];
  avgCycleLength: number;
  avgPeriodLength: number;
  currentPhase: string;
  nextPeriodDate: string;
  dDay: number;
  startDate?: string; // 호환성용
  periodLength?: number;
  cycleLength?: number;
}

export interface UserCounters {
  defenseActionsToday: number;
  junkObtainedToday: number;
  dailyTotalSpend: number;
  hadSpendingToday: boolean;
  noSpendStreak: number;
  guardPromptShownToday: boolean;
  lastDailyResetDate: string;
  lastDayEndDate: string;
  cumulativeDefense: number;
  noSpendStamps: Record<string, boolean>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  billingDay: number;
  cycle: 'MONTHLY' | 'YEARLY';
  isActive: boolean;
  startedAt?: string;
  lastChargedDate?: string;
}

export interface UserState {
  // [Profile]
  name: string;
  level: number;
  jobTitle: string;
  
  // [Resources]
  currentBudget: number;
  maxBudget: number;
  mp: number;
  maxMp: number;
  junk: number;
  salt: number;
  seedPackets: number; // 원본에 있었음

  // [Systems]
  garden: GardenState;
  status: PlayerStatus;
  lunaCycle: LunaCycle;
  
  // [Data]
  inventory: InventoryItem[];
  collection: any[]; // CollectionItem
  pending: PendingTransaction[];
  materials: Record<string, number>;
  
  // [RPG Detailed] (원본 복구)
  equipped: {
    weapon: string | null;
    armor: string | null;
    accessory: string | null;
  };
  npcAffection: {
    gardener: number;
    angel: number;
    demon: number;
    curator: number;
  };
  stats: {
    attack: number;
    defense: number;
  };
  gardenNutrients: {
    savedAmount: number;
    debtRepaid: number;
  };

  assets: AssetBuildingsState;
  counters: UserCounters;
  subscriptions: SubscriptionPlan[];

  // [Exploration]
  currentLocation: LocationId; // 원본 유지
  unlockedLocations: LocationId[]; // 원본 유지

  // [NEW] 신규 추가된 필드
  unresolvedShadows: ShadowMonster[]; // 그림자
  
  lastLoginDate?: string;
}
