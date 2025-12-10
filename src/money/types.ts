// src/money/types.ts
import { ClassType } from './constants';

// 거래 기록 (지출/수입/메모)
export interface Transaction {
  id: string;
  amount: number; // 지출은 양수, 수입은 음수 or 별도 처리
  category: string;
  date: string; // ISO String or 'YYYY-MM-DD'
  note: string;
  tags: string[]; // ['defended', 'pms_buy', etc.]
  isFixedCost: boolean; // 고정비 여부
}

// 나중에 입력 리스트
export interface PendingTransaction {
  id: string;
  amount?: number; // 금액을 모를 수도 있음
  note: string;
  createdAt: string;
}

// 인벤토리 구조
export interface Inventory {
  junk: number;
  salt: number;
  // 확장성을 위해 Record 타입 사용 (예: 'tea_essence': 5)
  shards: Record<string, number>; 
  materials: Record<string, number>;
  equipment: string[]; // 장착 중인 장비 ID 목록
  collection: string[]; // 도감/골동품 수집 목록
}

// 📌 핵심: 단일 진실 공급원 (Single Source of Truth)
export interface UserState {
  // 1. 기본 프로필 & 직업
  profile: {
    name: string;
    classType: ClassType | null;
    level: number;
  };

  // 2. 예산 & HP (HP는 budget 기반 파생값이나, 편의상 UI용 state로 들고 있어도 됨)
  budget: {
    total: number;      // 월 총 예산
    current: number;    // 현재 잔액
    fixedCost: number;  // 고정비
    startDate: string;  // 월 시작일
  };

  // 3. 파이낸셜 스탯
  stats: {
    def: number;        // Phase 1: 상환율, Phase 2: 100
    creditScore: number; // Phase 3: 신용 점수
  };

  // 4. 일일/주간 카운터 (로직용 변수)
  counters: {
    // 리셋 대상
    defenseActionsToday: number; // 오늘 방어(참기) 횟수
    junkObtainedToday: number;   // 오늘 획득한 Junk 개수
    lastAccessDate: string | null; // 마지막 접속 시간 (ISO)
    lastDailyResetDate: string | null; // 마지막으로 일일 리셋된 날짜 (YYYY-MM-DD)
    
    // 누적/스트릭
    noSpendStreak: number;
    lunaShieldsUsedThisMonth: number; // 월간 Luna 방어 횟수
  };

  // 5. 런타임 스탯 (MP)
  runtime: {
    mp: number; // Max 30
  };

  // 6. 인벤토리
  inventory: Inventory;

  // 7. 대기열
  pending: PendingTransaction[];
}
