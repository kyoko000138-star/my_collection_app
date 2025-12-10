import { ClassType } from './constants';

export type LunaMode = 'NORMAL' | 'PMS' | 'REST';

// 거래 기록
export interface Transaction {
  id: string;
  amount: number; 
  category: string;
  date: string; 
  note: string;
  tags: string[]; 
  isFixedCost: boolean;
}

// 나중에 입력 리스트
export interface PendingTransaction {
  id: string;
  amount?: number; 
  note: string;
  createdAt: string;
}

// 인벤토리 구조
export interface Inventory {
  junk: number;
  salt: number;
  shards: Record<string, number>; 
  materials: Record<string, number>;
  equipment: string[]; 
  collection: string[];
}

// 📌 단일 진실 공급원 (Single Source of Truth)
export interface UserState {
  profile: {
    name: string;
    classType: ClassType | null;
    level: number;
  };

  luna: {
    nextPeriodDate: string; // "YYYY-MM-DD"
    averageCycle: number;   
    isTracking: boolean;    
  };

  budget: {
    total: number;      
    current: number;    
    fixedCost: number;  
    startDate: string;  
  };

  stats: {
    def: number;        
    creditScore: number; 
  };

  counters: {
    defenseActionsToday: number; 
    junkObtainedToday: number;   
    lastAccessDate: string | null; 
    lastDailyResetDate: string | null; 
    
    // [NEW] 오늘 총 지출액 (무지출 판정용)
    dailyTotalSpend: number; 
    // [NEW] 오늘 마감 보상 받았는지 여부
    isDayEnded: boolean;

    noSpendStreak: number;
    lunaShieldsUsedThisMonth: number; 
  };

  runtime: {
    mp: number; 
  };

  inventory: Inventory;
  pending: PendingTransaction[];
}
