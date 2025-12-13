// src/money/types.ts

// -------------------------
// 1. Scene Definition
// -------------------------
export enum Scene {
  GARDEN = 'GARDEN',           // [Main]
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
// 2. Constants & Enums
// -------------------------
export type LocationId = 'VILLAGE_BASE' | 'CITY_CAPITAL' | 'FOREST_OUTLAW';
export type ClassType = 'GUARDIAN' | 'SAGE' | 'ALCHEMIST' | 'DRUID';

// 아이템 효과
export type ItemEffectType = 
  | 'MP_RESTORE' | 'MP_COST_DOWN' | 'SALT_BOOST' | 'JUNK_CLEAN' 
  | 'GROWTH_BOOST' | 'NPC_LOVE' | 'NONE';

// -------------------------
// 3. Financial System (v4 Full)
// -------------------------
export type TxType = 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'INSTALLMENT' | 'LOAN'; 
export type CategoryId = string; 
export type IntentTag = string;

export interface Transaction {
  id: string;
  type?: TxType;
  amount: number;
  category: CategoryId;
  intent?: IntentTag;
  note?: string;
  createdAt: string;
  // v4 태그 확장
  situations?: string[];
  attributes?: string[];
}
export type PendingTransaction = Transaction;

// -------------------------
// 4. Items & Inventory
// -------------------------
export type ItemType = 'consumable' | 'equipment' | 'material' | 'junk' | 'decor';

export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  desc: string;
  effectType?: ItemEffectType;
  effectValue?: number;
  price?: number;
  equipSlot?: 'weapon' | 'armor' | 'accessory';
}

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  count: number;
}

export interface CraftRecipe {
  id: string;
  name: string;
  resultItemId: string;
  resultCount: number;
  junkCost: number;
  saltCost: number;
  mpCost: number;
  essenceCost: number;
  materials?: Record<string, number>;
  category: 'BASIC' | 'EQUIPMENT' | 'CONSUMABLE' | 'DECOR';
}

// -------------------------
// 5. RPG & World (New)
// -------------------------
export interface ShadowMonster {
  id: string;
  sourceTxId?: string; // 연결된 지출 ID
  amount: number;      // 금액
  category: string;    // 카테고리
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
// 6. User State Components
// -------------------------
export interface AssetBuildingsState {
  fence: number;      // 방어
  greenhouse: number; // 무지출
  mansion: number;    // 고정비
  fountain: number;   // 정화
  barn: number;       // 파밍
}

export interface AssetBuildingView {
  id: string;
  label: string;
  level: number;
  nextTarget: number | null;
  count: number;
}

export interface GardenState {
  treeLevel: number;
  pondLevel: number;
  flowerState: 'blooming' | 'normal' | 'withered';
  weedCount: number;
  decorations: string[]; 
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
  startDate?: string;
  periodLength?: number;
  cycleLength?: number;
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
  note?: string;
  categoryId?: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  obtainedAt: string;
  category: 'JUNK' | 'BADGE';
  source?: string;
}

export interface NpcAffection {
  gardener: number;
  angel: number;
  demon: number;
  curator: number;
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

// -------------------------
// 7. Root User State
// -------------------------
export interface UserState {
  name: string;
  level: number;
  jobTitle: string;
  
  currentBudget: number;
  maxBudget: number;
  mp: number;
  maxMp: number;
  junk: number;
  salt: number;
  seedPackets: number;

  garden: GardenState;
  status: PlayerStatus;
  lunaCycle: LunaCycle;
  
  inventory: InventoryItem[];
  collection: CollectionItem[];
  pending: PendingTransaction[];
  materials: Record<string, number>;
  
  // [RPG Detailed]
  equipped: {
    weapon: string | null;
    armor: string | null;
    accessory: string | null;
  };
  npcAffection: NpcAffection;
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
  currentLocation: LocationId;
  unlockedLocations: LocationId[];

  // [NEW] 그림자 몬스터
  unresolvedShadows: ShadowMonster[];
  
  lastLoginDate?: string;
}
