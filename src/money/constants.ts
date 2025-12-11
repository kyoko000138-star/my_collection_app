export const GAME_CONSTANTS = {
  MAX_MP: 30,
  HP_WARNING_THRESHOLD: 30, // 30% 미만 시 경고

  // [NEW] 도감 데이터베이스 (Junk 획득 시 랜덤 매핑용)
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
