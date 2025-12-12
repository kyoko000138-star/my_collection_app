// src/money/types.ts

// -------------------------
// Scene Definition
// -------------------------
export enum Scene {
  GARDEN = 'GARDEN',           // [Main] 자산의 정원 (홈 화면)
  MY_ROOM = 'MY_ROOM',         // [Menu] 마이룸 (상태창)
  VILLAGE_MAP = 'VILLAGE_MAP', // [Hub] 마을 지도 (이동 거점)
  LIBRARY = 'LIBRARY',         // [Feature] 도서관 (구독/기록)
  WORLD_MAP = 'WORLD_MAP',     // [Adventure] 던전 선택
  FIELD = 'FIELD',             // [Adventure] 실시간 탐험
  BATTLE = 'BATTLE',           // [Action] 지출 입력 (전투)
  INVENTORY = 'INVENTORY',     // [Menu] 가방
  KINGDOM = 'KINGDOM',         // [Menu] 자산 현황 (파일명 유지)
  COLLECTION = 'COLLECTION',   // [Menu] 도감
  SUBSCRIPTION = 'SUBSCRIPTION' // [Modal] 구독 관리
}

// -------------------------
// Assets (정원 테마로 리뉴얼)
// -------------------------
export type AssetBuildingId = 
  | 'fence'        // 방어 (구 요새) -> 울타리
  | 'greenhouse'   // 무지출 (구 비행장) -> 온실
  | 'mansion'      // 고정비 (구 저택) -> 저택
  | 'fountain'     // 정화 (구 마법탑) -> 정화의 분수
  | 'barn';        // 파밍 (구 창고) -> 헛간

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
// Field Objects (탐험용)
// -------------------------
export interface FieldObject {
  id: string;
  x: number; // 0~100%
  y: number; // 0~100%
  type: 'JUNK' | 'HERB' | 'CHEST';
  isCollected: boolean;
}

// -------------------------
// Inventory & Items
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
// Garden (비주얼 상태)
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

  lastLoginDate?: string;
}
