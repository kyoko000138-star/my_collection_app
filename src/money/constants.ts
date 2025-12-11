// src/money/constants.ts

export const GAME_CONSTANTS = {
  MAX_MP: 30,
  HP_WARNING_THRESHOLD: 30, 
  GUARD_PROMPT_MIN_AMOUNT: 10000,
  JUNK_THRESHOLD: 5000, 
  DAILY_JUNK_LIMIT: 10, 
  DAILY_DEFENSE_LIMIT: 3, 
  
  // 보상 (MP)
  MP_RECOVERY_ACCESS: 1, 
  MP_RECOVERY_DEFENSE: 3, 
  
  // 비용
  PURIFY_COST_MP: 1, 
  PURIFY_COST_JUNK: 1, 
  PURIFY_COST_SALT: 1, 
};

// 직업 상수
export const CLASS_TYPES = {
  GUARDIAN: 'GUARDIAN',    
  SAGE: 'SAGE',            
  ALCHEMIST: 'ALCHEMIST', 
  DRUID: 'DRUID',          
} as const;

export type ClassType = typeof CLASS_TYPES[keyof typeof CLASS_TYPES];

// 던전(카테고리) 데이터
export const DUNGEONS = {
  food: { name: '배달의 숲', desc: '기름진 냄새가 진동합니다.', color: '#22c55e', icon: '🌲' },
  transport: { name: '택시의 사막', desc: '미터기 말이 빠르게 달립니다.', color: '#f59e0b', icon: '🏜️' },
  shopping: { name: '지름의 시장', desc: '반짝이는 물건이 가득합니다.', color: '#ec4899', icon: '🎪' },
  etc: { name: '기타 던전', desc: '알 수 없는 곳입니다.', color: '#6366f1', icon: '🕳️' },
} as const;

// 몬스터 데이터 (기본)
export const MONSTERS = {
  food: { name: '야식 슬라임', sprite: '🍕', hp: 100, color: '#ef4444' },
  transport: { name: '미터기 미믹', sprite: '🚕', hp: 80, color: '#f59e0b' },
  shopping: { name: '충동구매 유령', sprite: '👻', hp: 150, color: '#ec4899' },
  etc: { name: '텅장 몬스터', sprite: '💸', hp: 50, color: '#6366f1' },
};

// 도감 및 배지 데이터
export const COLLECTION_DB = {
  JUNK_FOREST: [
    { id: 'junk_01', name: '말라비틀어진 영수증', desc: '형체를 알아볼 수 없다.' },
    { id: 'junk_02', name: '배달 용기 뚜껑', desc: '기름기가 묻어있다.' },
    { id: 'junk_03', name: '일회용 수저', desc: '뜯지 않은 채 버려졌다.' },
    { id: 'junk_04', name: '할인 쿠폰(만료)', desc: '쓰려고 했을 땐 이미 늦었다.' },
  ],
  BADGES: {
    FIRST_JUNK: { id: 'badge_first', name: '초보 수집가', desc: '첫 번째 Junk를 획득했다.' },
    NO_SPEND_3: { id: 'badge_3day', name: '작은 인내', desc: '3일 연속 무지출 달성.' },
    GUARD_MASTER: { id: 'badge_guard', name: '철벽 방어', desc: '하루 3회 방어 성공.' },
  }
};
