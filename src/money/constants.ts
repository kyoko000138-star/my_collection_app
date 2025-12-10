export const GAME_CONSTANTS = {
  MAX_MP: 30,
  HP_WARNING_THRESHOLD: 30, // 30% 미만 시 경고
  
  // 경제 관련
  JUNK_THRESHOLD: 5000, // 이 금액 이상 지출 시 Junk 획득
  DAILY_JUNK_LIMIT: 10, // 하루 최대 Junk 획득량
  DAILY_DEFENSE_LIMIT: 3, // 하루 최대 방어 인정 횟수
  
  // [NEW] 보상 관련
  REWARD_NATURAL_DUST: 1, // 마감 시 기본 지급 (Natural Dust)
  REWARD_SALT_NO_SPEND: 1, // 무지출 성공 시 지급 (Salt)
  
  // 쿨타임 (ms 단위)
  ACCESS_COOLDOWN_MS: 3 * 60 * 60 * 1000, // 3시간
  
  // 정화 비용
  PURIFY_COST_MP: 1, 
  PURIFY_COST_JUNK: 1,
  PURIFY_COST_SALT: 1,
  PURIFY_OUTPUT_MATERIAL: {
    'PURE_ESSENCE': 1, // 정화 결과물
  } as const,
  
  // 보상 (MP)
  MP_RECOVERY_ACCESS: 1, 
  MP_RECOVERY_DEFENSE: 1, 
  MP_RECOVERY_QUEST: 2,   

  // 제작 레시피 (예시)
  CRAFTING_RECIPES: {
    'MILD_LEDGER_SWORD': {
      materialCosts: { 'PURE_ESSENCE': 3 },
      output: { type: 'EQUIPMENT', id: '잔잔한 장부검', effect: 'MP_MAX_UP' },
    }
  } as const
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
