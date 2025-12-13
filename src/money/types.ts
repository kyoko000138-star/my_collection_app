// src/money/types.ts

// ------------------------------------------------------------------
// 1. Scene Definition
// ------------------------------------------------------------------
export enum Scene {
  GARDEN = 'GARDEN',           // 메인 (정원)
  MY_ROOM = 'MY_ROOM',         // [NEW] 마이룸
  VILLAGE_MAP = 'VILLAGE_MAP', // [NEW] 마을 지도
  LIBRARY = 'LIBRARY',         // 도서관
  WORLD_MAP = 'WORLD_MAP',     // 월드맵
  FIELD = 'FIELD',             // 필드 (탐험)
  BATTLE = 'BATTLE',           // 전투
  INVENTORY = 'INVENTORY',     // [NEW] 인벤토리
  SETTINGS = 'SETTINGS',       // [NEW] 설정
  KINGDOM = 'KINGDOM',         // 자산 현황
  COLLECTION = 'COLLECTION',   // 도감
  SUBSCRIPTION = 'SUBSCRIPTION', // 구독 관리
  FORGE = 'FORGE',             // 대장간
  SHOP = 'SHOP',               // 상점
  MONTHLY_REPORT = 'MONTHLY_REPORT' // 월간 리포트
}

// ------------------------------------------------------------------
// 2. Existing Data Types (1213_코드.txt 원본 유지)
// ------------------------------------------------------------------
export type ClassType = 'GUARDIAN' | 'SAGE' | 'ALCHEMIST' | 'DRUID';
export type LocationId = 'VILLAGE_BASE' | 'CITY_CAPITAL' | 'FOREST_OUTLAW';

// 아이템 & 인벤토리
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

// 금융 시스템 (v4)
export type TxType = 'EXPENSE' | 'INCOME' | 'TRANSFER';
export type CategoryId = string; 
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

// 자산 (정원 테마로 매핑)
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

// 필드 오브젝트
export interface FieldObject {
  id: string;
  x: number;
  y: number;
  type: 'JUNK' | 'HERB' | 'CHEST' | 'SIGNPOST';
  isCollected: boolean;
}

// ------------------------------------------------------------------
// 3. New RPG Elements (그림자, 몬스터)
// ------------------------------------------------------------------
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
  color?: string;
}

// ------------------------------------------------------------------
// 4. Root User State
// ------------------------------------------------------------------
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
  noSpendStamps: Record<string, boolean>; // 스탬프
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
  categoryId?: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  obtainedAt: string;
  category: 'JUNK' | 'BADGE';
}

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
  lunaCycle: LunaCycle; // [중요] v2 구조
  
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
  
  currentLocation: LocationId;
  unlockedLocations: LocationId[];
  
  gardenNutrients: {
    savedAmount: number;
    debtRepaid: number;
  };

  lastLoginDate?: string;
}
