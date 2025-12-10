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
  // 1. 기본 프로필 & 직업
  profile: {
    name: string;
    classType: ClassType | null;
    level: number;
  };

  // 2. 루나 시스템 (신체 주기)
  luna: {
    nextPeriodDate: string; // "YYYY-MM-DD"
    averageCycle: number;   
    isTracking: boolean;    
  };

  // 3. 예산 & HP 
  budget: {
    total: number;      
    current: number;    
    fixedCost: number;  
    startDate: string;  
  };

  // 4. 파이낸셜 스탯
  stats: {
    def: number;        
    creditScore: number; 
  };

  // 5. 일일/주간 카운터
  counters: {
    defenseActionsToday: number; 
    junkObtainedToday: number;   
    lastAccessDate: string | null; 
    lastDailyResetDate: string | null; 
    
    noSpendStreak: number;
    lunaShieldsUsedThisMonth: number; 
  };

  // 6. 런타임 스탯 (MP)
  runtime: {
    mp: number; 
  };

  // 7. 인벤토리 & 대기열
  inventory: Inventory;
  pending: PendingTransaction[];
}
