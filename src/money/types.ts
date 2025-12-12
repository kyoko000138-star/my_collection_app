// src/money/types.ts

// src/money/types.ts (수정 부분만)

export interface LunaCycle {
  startDate: string;      // 가장 최근 시작일 (기준점)
  periodLength: number;   // 지속 기간 (보통 5~7일)
  cycleLength: number;    // 현재 설정된 주기 (예: 28일)
  
  // [NEW] 최근 3~6개월 시작일 기록 (YYYY-MM-DD 문자열 배열)
  history: string[]; 
  
  // [NEW] 예측된 다음 시작일 (자동 계산됨)
  nextPredictedDate?: string;
}

// -------------------------
// Scene Definition
// -------------------------
export enum Scene {
  VILLAGE = 'VILLAGE',       // 메인 거점
  WORLD_MAP = 'WORLD_MAP',   // 던전 선택
  FIELD = 'FIELD',           // [NEW] 직접 돌아다니는 탐험 맵
  BATTLE = 'BATTLE',         // 지출 입력 (전투)
  INVENTORY = 'INVENTORY',   // 가방
  KINGDOM = 'KINGDOM',       // 자산 정원 (파일명 KingdomModal 유지)
  COLLECTION = 'COLLECTION', // 도감
  SUBSCRIPTION = 'SUBSCRIPTION', // 구독 관리
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
// Assets (정원 건물)
// -------------------------
// 기존 군사 용어 -> 정원 용어로 변경
export type AssetBuildingId = 
  | 'fence'        // 방어 (구 Fortress) -> 울타리
  | 'greenhouse'   // 무지출 (구 Airfield) -> 온실
  | 'mansion'      // 고정비 (구 Mansion) -> 저택/오두막
  | 'fountain'     // 정화 (구 Tower) -> 정화의 분수
  | 'barn';        // 파밍 (구 Warehouse) -> 헛간

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
// Garden (메인 비주얼)
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
  
  assets: AssetBuildingsState; // [Updated]
  counters: UserCounters;
  subscriptions: SubscriptionPlan[];

  lastLoginDate?: string;
}
