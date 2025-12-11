// src/money/types.ts

export enum Scene {
  VILLAGE = 'VILLAGE',
  WORLD_MAP = 'WORLD_MAP',
  BATTLE = 'BATTLE',
  INVENTORY = 'INVENTORY',
  KINGDOM = 'KINGDOM',
  COLLECTION = 'COLLECTION'
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

// 사용자 상태 (Single Source of Truth)
export interface UserState {
  // 프로필
  name: string;
  level: number;
  jobTitle: string;
  
  // 핵심 스탯
  currentBudget: number; // HP
  maxBudget: number;     // Max HP
  mp: number;            // MP (의지력)
  maxMp: number;

  // 자원
  junk: number;
  salt: number;

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
  
  // 자산 (건물 레벨용 누적 카운터)
  assets: {
    fortress: number;
    airfield: number;
    mansion: number;
    tower: number;
    warehouse: number;
  };

  // 제작 재료
  materials: Record<string, number>;

  // 일일/월간 카운터
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

  // 기록
  lastLoginDate?: string;
}
