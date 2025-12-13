// src/money/types.ts

// -------------------------
// Scene & Enums
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
  SUBSCRIPTION = 'SUBSCRIPTION',
  FORGE = 'FORGE',
  SHOP = 'SHOP',
  SETTINGS = 'SETTINGS'
}

export type LocationId = 'VILLAGE_BASE' | 'CITY_CAPITAL' | 'FOREST_OUTLAW';

export type ItemEffectType = 
  | 'MP_RESTORE' | 'MP_COST_DOWN' | 'SALT_BOOST' | 'JUNK_CLEAN' 
  | 'GROWTH_BOOST' | 'NPC_LOVE' | 'NONE';

// -------------------------
// Items & Recipes
// -------------------------
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

export interface InventoryItem {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'material' | 'junk';
  count: number;
}

// -------------------------
// State Interfaces
// -------------------------
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

export interface FieldObject {
  id: string;
  x: number;
  y: number;
  // [NEW] SIGNPOST(이정표) 타입 추가
  type: 'JUNK' | 'HERB' | 'CHEST' | 'SIGNPOST';
  isCollected: boolean;
}

export interface ShadowMonster {
  id: string;
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

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  billingDay: number;
  isActive: boolean;
  lastChargedDate?: string;
}

export interface PendingTransaction {
  id: string;
  amount: number;
  note: string;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  obtainedAt: string;
  category: 'JUNK' | 'BADGE';
}

export interface NpcAffection {
  gardener: number;
  angel: number;
  demon: number;
  curator: number;
}

// -------------------------
// Root User State
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
  lunaCycle: {
    startDate: string;
    periodLength: number;
    cycleLength: number;
  };

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
  
  counters: {
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
  };

  subscriptions: SubscriptionPlan[];
  unresolvedShadows: ShadowMonster[];
  npcAffection: NpcAffection;
  stats: {
    attack: number;
    defense: number;
  };

  currentLocation: LocationId;
  // [NEW] 해금된 지역 목록
  unlockedLocations: LocationId[];
}


// ==========================================
// [NEW] v4 재무 카테고리 시스템 (Financial Types)
// ==========================================

// 1. 대분류 (Transaction Type)
export type TxType = 'EXPENSE' | 'INCOME' | 'TRANSFER'; // 지출, 수입, 이체(저축/투자)

// 2. 상세 카테고리 (Category ID)
export type CategoryId = 
  // [고정비] Fixed
  | 'fixed.housing' | 'fixed.utilities' | 'fixed.telecom' | 'fixed.insurance' 
  | 'fixed.subscription' | 'fixed.fees'
  // [생활/식비] Food & Life
  | 'food.groceries' | 'food.out' | 'food.cafe_snack' | 'life.supplies'
  // [이동] Move
  | 'move.transport' | 'move.travel'
  // [건강] Health
  | 'health.medical' | 'health.meds' | 'health.fitness'
  // [즐거움/성장] Fun & Self
  | 'social.gift' | 'social.meetup' | 'fun.hobby' | 'self.dev' | 'big.oneoff'
  | 'life.pet' | 'life.family'
  // [저축/투자/부채] Save & Invest (정원 연동!)
  | 'save.emergency' | 'save.buffer' | 'save.goal' | 'save.deposit' 
  | 'save.debt' // 👈 부채 상환 (가시덩굴 제거)
  | 'invest.isa' | 'invest.pension' | 'invest.brokerage' | 'invest.cash_equiv';

// 3. 태그 시스템 (Tags)
export type IntentTag = 
  // 지출 의도
  | 'necessary' | 'planned' | 'self_care' | 'reward' | 'small_joy' 
  | 'impulse' | 'convenience' | 'efficiency' | 'social_duty' | 'unavoidable' | 'explore'
  // 저축 의도 (목적)
  | 'goal_emergency' | 'goal_debt' | 'goal_trip' | 'goal_big' | 'goal_house' | 'goal_retirement' | 'goal_growth';

export type SituationTag = 
  | 'workday' | 'weekend' | 'commute' | 'late_night' 
  | 'month_end' | 'payday' | 'stress' | 'tired' | 'sick' 
  | 'pms' | 'period' | 'social' | 'traveling'
  | 'windfall' | 'market_drop'; // 저축 상황

export type AttributeTag = 
  | 'online' | 'offline' | 'delivery' | 'import' | 'secondhand'
  | 'limited' | 'preorder' | 'bundle' | 'split_pay' | 'points'
  | 'fan_goods' | 'fan_ticket' | 'fan_trip'
  | 'auto' | 'dca' | 'lump_sum'; // 투자 방식

// 4. 거래 내역 구조체 (Transaction)
export interface Transaction {
  id: string;
  type: TxType;           // 대분류
  amount: number;
  category: CategoryId;   // 상세 카테고리
  
  // 태그 (v4)
  intent?: IntentTag;     // 의도 (1개 권장)
  situations?: SituationTag[]; // 상황 (복수 가능)
  attributes?: AttributeTag[]; // 속성 (복수 가능)
  
  note?: string;          // 메모
  createdAt: string;      // 날짜
}
