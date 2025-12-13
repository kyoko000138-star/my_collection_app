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
