// src/money/types.ts

// 1. 화면(Scene) 상태 정의
export enum Scene {
  VILLAGE = 'VILLAGE',      // 메인 화면 (마을/내 방)
  WORLD_MAP = 'WORLD_MAP',  // 던전 선택 화면
  BATTLE = 'BATTLE',        // 지출(전투) 화면
  INVENTORY = 'INVENTORY',  // 가방/제작
  KINGDOM = 'KINGDOM',      // 자산 관리
  COLLECTION = 'COLLECTION' // 도감
}

// 2. 아이템 타입 정의
export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'material' | 'junk';
  count: number;
  description?: string;
}

// 3. 사용자(플레이어) 상태 정의
export interface UserState {
  // 기본 정보
  name: string;
  level: number;
  jobTitle: string; // 'Guardian', 'Druid' 등

  // 핵심 생존 스탯 (돈 = HP, 의지 = MP)
  currentBudget: number; // 현재 남은 돈 (HP)
  maxBudget: number;     // 월 예산 (Max HP)
  mp: number;            // 의지력 (MP) - 참기/방어 시 소모/회복
  maxMp: number;

  // 자원
  junk: number; // 지출 시 쌓이는 찌꺼기
  salt: number; // 절약 시 얻는 정화 소금

  // 루나(생리 주기) 정보
  lunaCycle: {
    startDate: string;    // YYYY-MM-DD
    periodLength: number; // 보통 5~7
    cycleLength: number;  // 보통 28
  };

  // 인벤토리
  inventory: Item[];
  
  // 기록
  lastLoginDate?: string;
}
