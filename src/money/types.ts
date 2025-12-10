// src/money/types.ts

import type { ClassType } from './constants';

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
    averageCycle: number;   // 평균 주기 (일)
    isTracking: boolean;    // 루나 시스템 사용 여부
  };

  // 3. 예산 & HP 
  budget: {
    total: number;      // 이번 달 총 예산
    current: number;    // 남은 예산
    fixedCost: number;  // 고정비 합계
    startDate: string;  // "YYYY-MM-DD"
  };

  // 4. 파이낸셜 스탯
  stats: {
    def: number;         // 부채 상환율 / 방어력 (0~100)
    creditScore: number; // 무부채 유지 시 누적되는 신용 점수
  };

  // 5. 일일/주간 카운터
  counters: {
    defenseActionsToday: number;       // 오늘 방어 행동 횟수
    junkObtainedToday: number;         // 오늘 획득한 Junk 개수
    lastAccessDate: string | null;     // 마지막 접속일 ("YYYY-MM-DD")
    lastDailyResetDate: string | null; // 마지막 일일 리셋 처리일

    noSpendStreak: number;             // 연속 무지출 일수
    lunaShieldsUsedThisMonth: number;  // 월간 루나 실드 사용 횟수
    guardPromptShownToday: boolean;    // 오늘 Guard Prompt 노출 여부
  };

  // 6. 런타임 스탯 (MP)
  runtime: {
    mp: number; // 행동력 (0 ~ MAX_MP)
  };

  // 7. 인벤토리 & 대기열
  inventory: Inventory;
  pending: PendingTransaction[];
}
