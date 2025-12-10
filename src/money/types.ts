// src/money/types.ts
import { ClassType } from './constants';

export type LunaMode = 'NORMAL' | 'PMS' | 'REST';

// 거래 기록
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string; // "YYYY-MM-DD"
  note: string;
  tags: string[];
  isFixedCost: boolean;
}

// 나중에 입력 리스트
export interface PendingTransaction {
  id: string;
  amount?: number;
  note: string;
  createdAt: string; // ISO string
}

// 인벤토리 구조
export interface Inventory {
  junk: number;
  salt: number;
  shards: Record<string, number>;    // 예: { naturalDust: 3 }
  materials: Record<string, number>; // 예: { pureEssence: 2 }
  equipment: string[];               // 예: ['잔잔한 장부검']
  collection: string[];              // 향/골동품 등 컬렉션 태그
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
    averageCycle: number;   // 평균 생리 주기 (일)
    isTracking: boolean;    // 추적 여부
  };

  // 3. 예산 & HP
  budget: {
    total: number;      // 이번 달 전체 예산
    current: number;    // 현재 남은 예산
    fixedCost: number;  // 고정비 총합
    startDate: string;  // 예산 시작일 (YYYY-MM-DD)
  };

  // 4. 파이낸셜 스탯
  stats: {
    def: number;         // 방어력(부채 상환율 등)
    creditScore: number; // 신용 점수 (Phase 3용)
  };

  // 5. 일일/주간 카운터
  counters: {
    defenseActionsToday: number;   // 오늘 방어 행동 횟수
    junkObtainedToday: number;     // 오늘 획득한 Junk 개수

    lastAccessDate: string | null;     // 마지막 접속 날짜
    lastDailyResetDate: string | null; // 일일 리셋 처리 날짜
    lastDayEndDate: string | null;     // "오늘 마감하기" 실행 날짜

    guardPromptShownToday: boolean; // Guard 프롬프트 노출 여부
    noSpendStreak: number;          // 연속 무지출 일수
    lunaShieldsUsedThisMonth: number; // 루나 실드 사용 횟수 (월 단위)
  };

  // 6. 런타임 스탯 (MP)
  runtime: {
    mp: number; // 행동력 (0 ~ MAX_MP)
  };

  // 7. 인벤토리 & 대기열
  inventory: Inventory;
  pending: PendingTransaction[];

  // 8. 거래 기록 (이번 달)
  transactions: Transaction[];
}
