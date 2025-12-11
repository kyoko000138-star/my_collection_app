// src/money/types.ts

import { ClassType } from './constants';

// ------------------------------------------------------------------
// [ENUMS & TYPES] 상수 및 타입 정의
// ------------------------------------------------------------------

export type Scene = 'TITLE' | 'VILLAGE' | 'WORLDMAP' | 'BATTLE' | 'CRAFTING' | 'MONTH_END';

export type LunaMode = 'NORMAL' | 'PMS' | 'REST';

// ------------------------------------------------------------------
// [SUB-INTERFACES] 하위 데이터 구조
// ------------------------------------------------------------------

// 1. 거래 및 대기열
export interface Transaction {
  id: string;
  amount: number; 
  category: string;
  date: string; // "YYYY-MM-DD"
  note: string;
  tags: string[]; 
  isFixedCost: boolean;
}

export interface PendingTransaction {
  id: string;
  amount?: number; 
  note: string;
  createdAt: string;
}

// 2. 도감 및 수집품
export interface CollectionItem {
  id: string;        // "junk_forest_01", "badge_no_spend_7" 등
  name: string;      // "말라비틀어진 꽃잎"
  description: string; 
  obtainedAt: string; // ISO String
  category: 'JUNK' | 'BADGE' | 'EQUIPMENT';
}

// 3. 인벤토리
export interface Inventory {
  junk: number;
  salt: number;
  
  // 확장성을 위한 Record 타입
  shards: Record<string, number>; 
  materials: Record<string, number>;
  
  equipment: string[]; // 장착 중인 장비 ID 목록
  
  // 도감 시스템 (객체 배열)
  collection: CollectionItem[]; 
}

// 4. 자산 (건물 레벨 산정용)
export interface AssetKingdom {
  fortress: number;  // 요새 (방어 횟수 등)
  airfield: number;  // 비행장 (무지출 등)
  mansion: number;   // 저택 (고정비 관리 등)
  tower: number;     // 마법탑 (정화 횟수 등)
  warehouse: number; // 창고 (아이템 획득 등)
}

// 5. 월말 정산 기록 (History)
export interface MonthRecord {
  id: string;         // "2025-12"
  grade: string;      // "S", "A", "B"...
  totalSpent: number;
  finalHp: number;
  savedJunk: number;  // 매각한 정크 수
  mvpAsset: string;   // 가장 많이 성장한 건물
}

// ------------------------------------------------------------------
// [MAIN INTERFACE] 단일 진실 공급원 (Single Source of Truth)
// ------------------------------------------------------------------

export interface UserState {
  // [SYSTEM] 현재 화면 상태 (저장 및 복구용)
  scene: Scene;

  // [CORE] 프로필 & 직업
  profile: {
    name: string;
    classType: ClassType | null;
    level: number;
  };

  // [SYSTEM] 루나 시스템 (신체 주기)
  luna: {
    nextPeriodDate: string; // "YYYY-MM-DD"
    averageCycle: number;   
    isTracking: boolean;    
  };

  // [ECONOMY] 예산 & HP
  budget: {
    total: number;      
    current: number;    
    fixedCost: number;  
    startDate: string;  
  };

  // [STATS] 파이낸셜 스탯
  stats: {
    def: number;        
    creditScore: number; 
  };

  // [ASSETS] 자산 상태
  assets: AssetKingdom;

  // [COUNTERS] 각종 카운터 & 플래그
  counters: {
    // 일일 리셋 대상
    defenseActionsToday: number; 
    junkObtainedToday: number;   
    guardPromptShownToday: boolean; 
    dailyTotalSpend: number;        
    hadSpendingToday: boolean;      
    
    // 날짜 추적
    lastAccessDate: string | null; 
    lastDailyResetDate: string | null; 
    lastDayEndDate: string | null;  
    
    // 누적 데이터
    noSpendStreak: number;
    lunaShieldsUsedThisMonth: number; 
  };

  // [RUNTIME] 변동이 잦은 값 (MP)
  runtime: {
    mp: number; 
  };

  // [DATA] 인벤토리 & 기록
  inventory: Inventory;
  pending: PendingTransaction[];
  history: MonthRecord[]; // 지난달 기록 보관소
  
  // 거래 내역 (선택적)
  transactions?: Transaction[]; 
}
