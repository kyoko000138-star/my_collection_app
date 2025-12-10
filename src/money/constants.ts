// src/money/constants.ts

export const GAME_CONSTANTS = {
  MAX_MP: 30,
  HP_WARNING_THRESHOLD: 30, // 30% 미만 시 경고

  // 경제 관련
  JUNK_THRESHOLD: 5000, // 이 금액 이상 지출 시 Junk 획득
  DAILY_JUNK_LIMIT: 10, // 하루 최대 Junk 획득량
  DAILY_DEFENSE_LIMIT: 3, // 하루 최대 방어 인정 횟수

  // 보상
  MP_RECOVERY_ACCESS: 1, // 접속 시 MP 회복
  MP_RECOVERY_DEFENSE: 1, // 방어 성공 시 MP 회복
  MP_RECOVERY_QUEST: 2,   // 퀘스트 완료 시 MP 회복

  // 쿨타임 (ms 단위)
  ACCESS_COOLDOWN_MS: 3 * 60 * 60 * 1000, // 3시간

  // 장비 제작 관련
  EQUIPMENT_COST_PURE_ESSENCE: 3, // 잔잔한 장부검 제작에 필요한 pureEssence 개수
};

export const CLASS_TYPES = {
  GUARDIAN: 'GUARDIAN',   // 수호자
  SAGE: 'SAGE',           // 현자
  ALCHEMIST: 'ALCHEMIST', // 연금술사
  DRUID: 'DRUID',         // 드루이드
} as const;

export type ClassType = typeof CLASS_TYPES[keyof typeof CLASS_TYPES];

export const CLASS_CONSTANTS = {
  GUARDIAN_DEFENSE_THRESHOLD: 3000, // 이 금액 이하 지출은 '방어됨' 판정
  DRUID_REST_HEAL: 5,               // 드루이드가 REST 기간에 얻는 추가 MP
  ALCHEMIST_GOLD_PER_JUNK: 100,     // 연금술사가 정크 판매 시 얻는 가상 골드
};
