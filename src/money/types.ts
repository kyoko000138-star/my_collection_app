// src/money/types.ts

// -------------------------
// 1. Scene Definition
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
// 2. Constants & Enums
// -------------------------
export type LocationId = 'VILLAGE_BASE' | 'CITY_CAPITAL' | 'FOREST_OUTLAW';
export type ClassType = 'GUARDIAN' | 'SAGE' | 'ALCHEMIST' | 'DRUID';

export type ItemEffectType = 
  | 'MP_RESTORE'      // MP 회복
  | 'MP_COST_DOWN'    // MP 소모 감소
  | 'SALT_BOOST'      // Salt 획득량 증가
  | 'JUNK_CLEAN'      // Junk 정화/제거
  | 'GROWTH_BOOST'    // 정원 성장 속도 증가
  | 'NPC_LOVE'        // NPC 호감도 상승
  | 'NONE';

// -------------------------
// 3. Financial System (v4 Full Specification)
// -------------------------
export type TxType = 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'INSTALLMENT' | 'LOAN'; 

export type CategoryId = string; // 유연성을 위해 string 유지

export type IntentTag = 
  | 'necessary' | 'planned' | 'self_care' | 'reward' | 'small_joy' 
  | 'impulse' | 'convenience' | 'efficiency' | 'social_duty' | 'unavoidable' | 'explore'
  | 'goal_emergency' | 'goal_debt' | 'goal_trip' | 'goal_big' | 'goal_house' | 'goal_retirement' | 'goal_growth';

export type SituationTag = 
  | 'workday' | 'weekend' | 'commute' | 'late_night' 
  | 'month_end' | 'payday' | 'stress' | 'tired' | 'sick' 
  | 'pms' | 'period' | 'social' | 'traveling'
  | 'windfall' | 'market_drop';

export type AttributeTag = 
  | 'online' | 'offline' | 'delivery' | 'import' | 'secondhand'
  | 'limited' | 'preorder' | 'bundle' | 'split_pay' | 'points'
  | 'fan_goods' | 'fan_ticket' | 'fan_trip'
  | 'auto' | 'dca' | 'lump_sum';

export interface Transaction {
  id: string;
  type?: TxType;
  amount: number;
  category: CategoryId;
  intent?: IntentTag;
  situations?: SituationTag[];
  attributes?: AttributeTag[];
  note?: string;
  createdAt: string;
}
// 호환성 별칭
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
// 5. RPG & World Elements
// -------------------------
export interface ShadowMonster {
  id: string;
  sourceTxId?: string; // 연결된 지출 ID
  amount: number;      // 금액 (강함의 척도)
  category: string;    // 'food' -> 슬라임 등
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
  decorations: string[]; // 원본 유지
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
  // 호환성 필드
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
// 7. Root User State (Full Integration)
// -------------------------
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
  seedPackets: number;

  // [Systems]
  garden: GardenState;
  status: PlayerStatus;
  lunaCycle: LunaCycle;
  
  // [Data]
  inventory: InventoryItem[];
  collection: CollectionItem[];
  pending: PendingTransaction[];
  materials: Record<string, number>;
  
  // [RPG Detailed - 복원됨]
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

  // [NEW] 신규 추가된 필드
  unresolvedShadows: ShadowMonster[]; // 그림자 (업보)
  
  lastLoginDate?: string;
}
