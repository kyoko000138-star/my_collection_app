// src/money/types.ts

import { ClassType } from './constants';

export type LunaMode = 'NORMAL' | 'PMS' | 'REST';

// 1. 거래 및 대기열 기록
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

// 2. [NEW] 도감 아이템 구조
export interface CollectionItem {
  id: string;        // "junk_forest_01", "badge_no_spend_7" 등
  name: string;      // "말라비틀어진 꽃잎"
  description: string; 
  obtainedAt: string; // ISO String
  category: 'JUNK' | 'BADGE' | 'EQUIPMENT';
}

// 3. 인벤토리 구조
export interface Inventory {
  junk: number;
  salt: number;
  
  // 확장성을 위한 Record 타입
  shards: Record<string, number>; 
  materials: Record<string, number>;
  
  equipment: string[]; // 장착 중인 장비 ID 목록
  
  // [UPDATE] 도감 시스템을 위해 객체 배열로 변경
  collection: CollectionItem[]; 
}

// 4. [NEW] 자산 구조 (건물 레벨 산정용 누적치)
export interface AssetKingdom {
  fortress: number;  // 요새 (방어 횟수 등)
  airfield: number;  // 비행장 (무지출 등)
  mansion: number;   // 저택 (고정비 관리 등)
  tower: number;     // 마법탑 (정화 횟수 등)
  warehouse: number; // 창고 (아이템 획득 등)
}

// 📌 5. 단일 진실 공급원 (Single Source of Truth)
export interface UserState {
  // 프로필 & 직업
  profile: {
    name: string;
    classType: ClassType | null;
    level: number;
  };

  // 루나 시스템
  luna: {
    nextPeriodDate: string; // "YYYY-MM-DD"
    averageCycle: number;   
    isTracking: boolean;    
  };

  // 예산 & HP
  budget: {
    total: number;      
    current: number;    
    fixedCost: number;  
    startDate: string;  
  };

  // 파이낸셜 스탯
  stats: {
    def: number;        
    creditScore: number; 
  };

  // [NEW] 자산 상태 추가
  assets: AssetKingdom;

  // 카운터 & 플래그 (로직의 핵심)
  counters: {
    // 일일 리셋 대상
    defenseActionsToday: number; 
    junkObtainedToday: number;   
    guardPromptShownToday: boolean; // [NEW] 가드 프롬프트 노출 여부
    dailyTotalSpend: number;        // [NEW] 오늘 총 지출액
    hadSpendingToday: boolean;      // [NEW] 오늘 지출 발생 여부 (무지출 판정용)
    
    // 날짜 추적
    lastAccessDate: string | null; 
    lastDailyResetDate: string | null; 
    lastDayEndDate: string | null;  // [NEW] 마감 처리한 날짜
    
    // 누적 데이터
    noSpendStreak: number;
    lunaShieldsUsedThisMonth: number; 
  };

  // 런타임 값 (MP)
  runtime: {
    mp: number; 
  };

  inventory: Inventory;
  pending: PendingTransaction[];
  
  // 거래 내역 (실제 앱에서는 별도 DB로 관리하지만, MVP에선 여기에 포함 가능)
  transactions?: Transaction[]; 
}
