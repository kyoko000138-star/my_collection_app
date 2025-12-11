// src/money/types.ts

export enum Scene {
  VILLAGE = 'VILLAGE',
  WORLD_MAP = 'WORLD_MAP',
  BATTLE = 'BATTLE',
  INVENTORY = 'INVENTORY',
  KINGDOM = 'KINGDOM',
  COLLECTION = 'COLLECTION',
  // [NEW] 정원 뷰 (원하면 나중에 확장)
  GARDEN = 'GARDEN',
}

// [NEW] 정원 상태
export type FlowerState = 'normal' | 'blooming' | 'withered';

export interface GardenState {
  treeLevel: number;      // 꿈의 나무 레벨 (저축)
  weedCount: number;      // 잡초/가시 개수 (부채)
  flowerState: FlowerState; // 이번 달 지출 상태
}

// ... Item, CollectionItem, PendingTransaction, AssetBuildingView 그대로 ...

export interface UserState {
  // 프로필
  name: string;
  level: number;
  jobTitle: string;

  // 핵심 스탯
  currentBudget: number; // HP
  maxBudget: number;     // Max HP
  mp: number;
  maxMp: number;

  // 자원
  junk: number;
  salt: number;

  // [NEW] 정원
  garden: GardenState;

  // Luna Cycle
  lunaCycle: {
    startDate: string;
    periodLength: number;
    cycleLength: number;
  };

  // 인벤토리 & 데이터
  inventory: Item[];
  collection: CollectionItem[];
  pending: PendingTransaction[];

  // 자산 (건물… → 나중에 정원 요소로 치환)
  assets: {
    fortress: number;
    airfield: number;
    mansion: number;
    tower: number;
    warehouse: number;
  };

  materials: Record<string, number>;

  counters: {
    defenseActionsToday: number;
    junkObtainedToday: number;
    dailyTotalSpend: number;
    hadSpendingToday: boolean;
    noSpendStreak: number;
    lastDailyResetDate?: string;
    lastDayEndDate?: string;
    guardPromptShownToday: boolean;
  };

  lastLoginDate?: string;
}
