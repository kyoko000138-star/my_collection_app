// src/money/types.ts
import { ClassType } from './constants';

export type LunaMode = 'NORMAL' | 'PMS' | 'REST';

// 거래 기록
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;   // "YYYY-MM-DD"
  note: string;
  tags: string[];
  isFixedCost: boolean;
}

// 나중에 입력 리스트
export interface PendingTransaction {
  id: string;
  amount?: number;
  note: string;
  createdAt: string; // ISO 문자열
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
    total: number;     // 이번 달 총 예산
    current: number;   // 현재 잔여 예산
    fixedCost: number; // 고정비 총합
    startDate: string; // "YYYY-MM-DD"
  };

  // 4. 파이낸셜 스탯
  stats: {
    def: number;
    creditScore: number;
  };

  // 5. 일일/주간 카운터
  counters: {
    defenseActionsToday: number;    // 오늘 방어 횟수
    junkObtainedToday: number;      // 오늘 Junk 획득 수

    lastAccessDate: string | null;      // 마지막 접속일
    lastDailyResetDate: string | null;  // checkDailyReset 마지막 실행일

    noSpendStreak: number;          // 연속 무지출 일수
    lunaShieldsUsedThisMonth: number;

    // ✅ DayEnd 루프용
    lastDayEndDate: string | null;  // "오늘 마감하기" 마지막 실행일
    hadSpendingToday: boolean;      // 오늘 지출 발생 여부
  };

  // 6. 런타임 스탯 (MP)
  runtime: {
    mp: number;
  };

  // 7. 인벤토리 & 대기열
  inventory: Inventory;
  pending: PendingTransaction[];
}
