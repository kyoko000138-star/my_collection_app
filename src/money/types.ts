// src/money/types.ts
import type { ClassType } from './constants';

export type LunaMode = 'NORMAL' | 'PMS' | 'REST';

// 거래 기록
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;        // "YYYY-MM-DD"
  note: string;
  tags: string[];
  isFixedCost: boolean;
}

// 나중에 입력 리스트
export interface PendingTransaction {
  id: string;
  amount?: number;     // 금액이 확정되지 않은 메모도 허용
  note: string;
  createdAt: string;   // ISO string
}

// 인벤토리 구조
export interface Inventory {
  junk: number;
  salt: number;
  shards: Record<string, number>;     // 예: { naturalDust: 3 }
  materials: Record<string, number>;  // 예: { pureEssence: 2 }
  equipment: string[];                // 장비 이름 리스트
  collection: string[];               // (추후) 소장품 연동용
}

// 자산의 왕국 – 각 건물 타입별 카운트
export interface Assets {
  fortress: number;   // 요새
  airfield: number;   // 비행장
  mansion: number;    // 저택
  tower: number;      // 마법탑
  warehouse: number;  // 창고
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
    averageCycle: number;   // 평균 주기 일수
    isTracking: boolean;    // 생리 주기 추적 여부
  };

  // 3. 예산 & HP
  budget: {
    total: number;     // 이번 달 총 예산
    current: number;   // 현재 남은 예산
    fixedCost: number; // 고정비 합계
    startDate: string; // 예산 시작일 (대부분 1일)
  };

  // 4. 파이낸셜 스탯
  stats: {
    def: number;        // 방어 & 상환력 (0~100)
    creditScore: number; // (추후) 신용 점수
  };

  // 5. 일일/주간/월간 카운터
  counters: {
    defenseActionsToday: number;  // 오늘 방어 버튼 사용 횟수
    junkObtainedToday: number;    // 오늘 획득한 Junk 개수

    lastAccessDate: string | null;      // 마지막 접속 날짜 (YYYY-MM-DD)
    lastDailyResetDate: string | null;  // 일일 초기화가 마지막으로 수행된 날짜
    lastDayEndDate: string | null;      // "오늘 마감하기"를 마지막으로 누른 날짜

    guardPromptShownToday: boolean;     // Guard Prompt 오늘 노출 여부

    noSpendStreak: number;              // 연속 무지출 일수
    lunaShieldsUsedThisMonth: number;   // 이번 달 사용한 Luna Shield 횟수
  };

  // 6. 런타임 스탯 (MP)
  runtime: {
    mp: number; // 행동력 (0 ~ MAX_MP)
  };

  // 7. 인벤토리 & 대기열
  inventory: Inventory;
  pending: PendingTransaction[];

  // 8. 거래 로그
  transactions: Transaction[];

  // 9. 자산의 왕국
  assets: Assets;
}
