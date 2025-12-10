// src/money/constants.ts

// 🎮 공통 게임 상수
export const GAME_CONSTANTS = {
  // MP 관련
  MAX_MP: 30,
  HP_WARNING_THRESHOLD: 30, // 30% 미만 시 경고

  // 경제 관련
  JUNK_THRESHOLD: 5000, // 이 금액 이상 지출 시 Junk 획득
  DAILY_JUNK_LIMIT: 10, // 하루 최대 Junk 획득량
  DAILY_DEFENSE_LIMIT: 3, // 하루 최대 방어 인정 횟수

  // MP 회복
  MP_RECOVERY_ACCESS: 1, // (추후) 접속 시 MP 회복량
  MP_RECOVERY_DEFENSE: 1, // 방어 성공 시 MP 회복
  MP_RECOVERY_QUEST: 2,   // 퀘스트 완료 시 MP 회복

  // 쿨타임 (ms 단위) – 추후 접속 MP 회복에 사용 예정
  ACCESS_COOLDOWN_MS: 3 * 60 * 60 * 1000, // 3시간

  // 보상/비용
  DUST_REWARD_PER_DAY: 1,              // 하루 1회 Natural Dust
  SALT_REWARD_PER_NOSPEND_DAY: 1,      // 무지출 Day 당 Salt 1개
  EQUIPMENT_COST_PURE_ESSENCE: 3,      // 잔잔한 장부검 제작에 필요한 Essence 수

  // Guard Prompt 관련
  GUARD_PROMPT_MIN_AMOUNT: 20000,      // 이 금액 이상 비고정비 지출 시 우선 검토
  LUNA_SHIELD_MONTHLY_LIMIT: 3,        // PMS 기간 자동 방어 사용 가능 횟수 (월)
} as const;

// 🎭 직업 타입
export const CLASS_TYPES = {
  GUARDIAN: 'GUARDIAN',   // 수호자
  SAGE: 'SAGE',           // 현자
  ALCHEMIST: 'ALCHEMIST', // 연금술사
  DRUID: 'DRUID',         // 드루이드
} as const;

export type ClassType = typeof CLASS_TYPES[keyof typeof CLASS_TYPES];

// 🎭 직업별 상수
export const CLASS_CONSTANTS = {
  GUARDIAN_DEFENSE_THRESHOLD: 3000,  // 이 금액 이하 지출은 '방어됨' 판정
  DRUID_REST_HEAL: 5,                // 드루이드가 REST 기간에 얻는 추가 MP
  ALCHEMIST_GOLD_PER_JUNK: 100,      // (추후) 연금술사: Junk 판매 시 얻는 가상 골드
} as const;
