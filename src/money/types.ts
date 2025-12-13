// src/money/types.ts

// -------------------------
// 1. Scene Definition
// -------------------------
export enum Scene {
  GARDEN = 'GARDEN',           // [Main] 자산의 정원
  VILLAGE_MAP = 'VILLAGE_MAP', // [Hub] 마을 지도
  LIBRARY = 'LIBRARY',         // [Feature] 도서관
  WORLD_MAP = 'WORLD_MAP',     // [Adventure] 월드맵
  FIELD = 'FIELD',             // [Adventure] 필드 탐험
  BATTLE = 'BATTLE',           // [Action] 전투
  MY_ROOM = 'MY_ROOM',         // [Menu] 마이룸
  INVENTORY = 'INVENTORY',     // [Menu] 인벤토리
  SETTINGS = 'SETTINGS',       // [Menu] 설정
  KINGDOM = 'KINGDOM',         // [Modal] 자산 현황
  COLLECTION = 'COLLECTION',   // [Feature] 도감
  SUBSCRIPTION = 'SUBSCRIPTION', // [Modal] 구독 관리
  FORGE = 'FORGE',             // [Feature] 대장간
  SHOP = 'SHOP',               // [Feature] 상점
  MONTHLY_REPORT = 'MONTHLY_REPORT' // [Feature] 월간 리포트
}

// -------------------------
// 2. Constants & IDs
// -------------------------
export type LocationId = 'VILLAGE_BASE' | 'CITY_CAPITAL' | 'FOREST_OUTLAW';
export type ClassType = 'GUARDIAN' | 'SAGE' | 'ALCHEMIST' | 'DRUID';

// -------------------------
// 3. Items & Inventory
// -------------------------
export type ItemEffectType = 
  | 'MP_RESTORE'      // MP 회복
  | 'MP_COST_DOWN'    // MP 소모 감소
  | 'SALT_BOOST'      // Salt 획득량 증가
  | 'JUNK_CLEAN'      // Junk 정화/제거
  | 'GROWTH_BOOST'    // 정원 성장 속도 증가
  | 'NPC_LOVE'        // NPC 호감도 상승
  | 'NONE';

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
// 4. Financial System (v4 Full)
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
  // v4 태그 확장 (원본 유지)
  situations?: string[];
  attributes?: string[];
}
export type PendingTransaction = Transaction;

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

// -------------------------
// 5. RPG & World Elements (New & Existing)
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
  
  equipped: {
    weapon: string | null;
    armor: string | null;
    accessory: string | null;
  };
  
  assets: AssetBuildingsState;
  counters: UserCounters;
  subscriptions: SubscriptionPlan[];
  
  // [NEW] 그림자 몬스터
  unresolvedShadows: ShadowMonster[];
  
  npcAffection: NpcAffection;
  stats: {
    attack: number;
    defense: number;
  };
  
  currentLocation: LocationId;
  unlockedLocations: LocationId[];
  
  gardenNutrients: {
    savedAmount: number;
    debtRepaid: number;
  };

  lastLoginDate?: string;
}
