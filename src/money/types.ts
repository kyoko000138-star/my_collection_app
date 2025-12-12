// src/money/types.ts

export enum Scene {
  VILLAGE = 'VILLAGE',
  WORLD_MAP = 'WORLD_MAP',
  BATTLE = 'BATTLE',
  INVENTORY = 'INVENTORY',
  KINGDOM = 'KINGDOM',
  COLLECTION = 'COLLECTION',
}

// ✅ [NEW] 정원 상태
export interface GardenState {
  treeLevel: number; // 저축 → 꿈의 나무
  pondLevel: number; // (추후) 비상금 연못
  flowerState: 'blooming' | 'normal' | 'withered'; // (추후) 생활 꽃
  weedCount: number; // 부채/과소비 잡초
}

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'material' | 'junk';
  count: number;
  description?: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  category: 'JUNK' | 'BADGE';
  description: string;
  obtainedAt: string;
}

export interface PendingTransaction {
  id: string;
  amount?: number;
  note: string;
  createdAt: string;
}

export interface AssetBuildingView {
  id: string;
  label: string;
  count: number;
  level: number;
  nextTarget: number | null;
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

  lunaCycle: {
    startDate: string;
    periodLength: number;
    cycleLength: number;
  };

  inventory: Item[];
  collection: CollectionItem[];
  pending: PendingTransaction[];

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

  // ✅ [NEW]
  garden: GardenState;
}
