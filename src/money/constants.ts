// src/money/constants.ts

// 1. 게임 밸런스 상수
export const GAME_CONSTANTS = {
  MAX_MP: 30,
  HP_WARNING_THRESHOLD: 30, // 30% 미만 시 경고
  
  // Guard Prompt 조건
  GUARD_PROMPT_MIN_AMOUNT: 10000, // 이 금액 이상일 때만 경고 팝업

  // 경제 관련
  JUNK_THRESHOLD: 5000, // 이 금액 이상 지출 시 Junk 획득
  DAILY_JUNK_LIMIT: 10, // 하루 최대 Junk 획득량
  DAILY_DEFENSE_LIMIT: 3, // 하루 최대 방어 인정 횟수
  
  // 보상 관련
  DUST_REWARD_PER_DAY: 1,         // 접속 시 Natural Dust 지급량
  SALT_REWARD_PER_NOSPEND_DAY: 1, // 무지출 시 Salt 지급량
  LUNA_SHIELD_MONTHLY_LIMIT: 3,   // PMS 기간 자동 방어 횟수
  
  // 보상 (MP)
  MP_RECOVERY_ACCESS: 1, 
  MP_RECOVERY_DEFENSE: 3, // 방어 성공 시 회복량
  MP_RECOVERY_QUEST: 2,   

  // 정화 및 제작 비용
  PURIFY_COST_MP: 1, 
  PURIFY_COST_JUNK: 1,
  PURIFY_COST_SALT: 1,
  EQUIPMENT_COST_PURE_ESSENCE: 3,

  // 정화 결과물 정의
  PURIFY_OUTPUT_MATERIAL: {
    'PURE_ESSENCE': 1, 
  } as const,

  // 쿨타임 (ms 단위)
  ACCESS_COOLDOWN_MS: 3 * 60 * 60 * 1000, 

  // 제작 레시피
  CRAFTING_RECIPES: {
    'MILD_LEDGER_SWORD': {
      materialCosts: { 'PURE_ESSENCE': 3 },
      output: { type: 'EQUIPMENT', id: '잔잔한 장부검', effect: 'MP_MAX_UP' },
    }
  } as const
};

// 2. 도감 데이터베이스
export const COLLECTION_DB = {
  JUNK_FOREST: [
    { id: 'junk_forest_01', name: '말라비틀어진 꽃잎', desc: '숲에서 흔히 보이는 시든 꽃잎.' },
    { id: 'junk_forest_02', name: '반쯤 썩은 도토리', desc: '다람쥐가 숨겨놓고 잊어버린 것 같다.' },
    { id: 'junk_forest_03', name: '이끼 낀 돌맹이', desc: '아무짝에도 쓸모없어 보이지만 예쁘다.' },
  ],
  BADGES: {
    FIRST_JUNK: { id: 'badge_first_junk', name: '초보 수집가', desc: '첫 번째 Junk를 획득했다.' },
    NO_SPEND_3: { id: 'badge_no_spend_3', name: '작은 인내', desc: '3일 연속 무지출을 달성했다.' },
    NO_SPEND_7: { id: 'badge_no_spend_7', name: '절제의 미학', desc: '7일 연속 무지출을 달성했다.' },
  },
};

// 3. 직업 상수
export const CLASS_TYPES = {
  GUARDIAN: 'GUARDIAN',   
  SAGE: 'SAGE',           
  ALCHEMIST: 'ALCHEMIST', 
  DRUID: 'DRUID',         
} as const;

export type ClassType = typeof CLASS_TYPES[keyof typeof CLASS_TYPES];

export const CLASS_CONSTANTS = {
  GUARDIAN_DEFENSE_THRESHOLD: 3000, // 이 금액 이하 지출은 '방어됨' 판정
  DRUID_REST_HEAL: 5,               // 드루이드가 REST 기간에 얻는 추가 MP
  ALCHEMIST_GOLD_PER_JUNK: 100,     // 연금술사가 정크 판매 시 얻는 가상 골드
};

// 4. [NEW] 던전(지출 카테고리) 데이터
export const DUNGEONS = {
  food: { name: '배달의 숲', desc: '기름진 냄새가 진동합니다.', color: '#22c55e', icon: '🌲' },
  transport: { name: '택시의 사막', desc: '미터기 말이 빠르게 달립니다.', color: '#f59e0b', icon: '🏜️' },
  shopping: { name: '지름의 시장', desc: '반짝이는 물건이 가득합니다.', color: '#ec4899', icon: '🎪' },
  etc: { name: '기타 던전', desc: '알 수 없는 곳입니다.', color: '#6366f1', icon: '🕳️' },
} as const;

// 5. [NEW] 몬스터 데이터 (전투 화면용)
export const MONSTERS = {
  food: { name: '야식 슬라임', sprite: '🍕', hp: 100, color: '#ef4444' },
  transport: { name: '미터기 미믹', sprite: '🚕', hp: 80, color: '#f59e0b' },
  shopping: { name: '충동구매 유령', sprite: '👻', hp: 150, color: '#ec4899' },
  etc: { name: '텅장 몬스터', sprite: '💸', hp: 50, color: '#6366f1' },
};
