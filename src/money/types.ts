// src/money/types.ts

// [1] 직업 및 RPG 스탯 (게임 전용)
export const CLASS_TYPES = {
  NOVICE: 'NOVICE',
  GUARDIAN: 'GUARDIAN',   // 방어형 (전투 MP 소모 감소)
  RANGER: 'RANGER',       // 탐험형 (이동 시 발견 확률 증가)
  ALCHEMIST: 'ALCHEMIST', // 제작형 (정화 대성공 확률 증가)
} as const;
export type ClassType = typeof CLASS_TYPES[keyof typeof CLASS_TYPES];

export interface RpgStats {
  str: number; // 공격력 (몬스터 처치 속도)
  def: number; // 방어력 (전투 시 MP 피해 감소 - *예산 방어 아님*)
  luk: number; // 행운 (아이템 드랍률)
}

// [2] 위치 ID (확장된 월드)
export type LocationId = 
  | 'VILLAGE_BASE'    // [마을] 시작의 마을
  | 'FIELD_CROSSROAD' // [필드] 운명의 갈림길 (교차로)
  | 'FOREST_ENTRY'    // [필드] 숲 입구
  | 'FOREST_OUTLAW'   // [던전] 무법자의 숲
  | 'FIELD_PLAINS'    // [필드] 바람의 들판
  | 'CITY_CAPITAL'    // [마을] 왕도 캐피탈 (확장 지역)
  | 'REST_AREA';      // [쉼터] 여행자 쉼터

// [3] 자산 건물 상태 (정원 시각화용)
export interface AssetBuildingsState {
  fence: number;      // 울타리
  hut: number;        // 오두막 (현금 Lv1)
  house: number;      // 주택 (현금 Lv2)
  mansion: number;    // 저택 (현금 Lv3)
  castle: number;     // 성 (현금 Lv4)
  fountain: number;   // 분수 (투자 수익)
  greenhouse: number; // 온실 (저축 목표)
  statue: number;     // 동상 (업적)
  barn: number;       // 헛간
}

// [4] 유저 상태 (통합)
export interface UserState {
  name: string;
  level: number;
  jobTitle: ClassType;
  
  // --- [Reality Layer] 현실 예산 (절대적 수치) ---
  currentBudget: number; // HP 역할
  maxBudget: number;     // Max HP 역할
  
  // --- [Fantasy Layer] 게임 자원 ---
  mp: number;            // 의지력
  maxMp: number;
  exp: number;
  stats: RpgStats;       // RPG 스탯

  // --- 탐험 & 위치 ---
  currentLocation: LocationId;
  unlockedLocations: LocationId[];
  isExhausted: boolean;  // HP <= 0 (탈진 상태)

  // --- 자산 & 정원 ---
  assets: AssetBuildingsState;
  garden: { 
    treeLevel: number; 
    pondLevel: number;
    flowerState: 'blooming' | 'normal' | 'withered'; 
    weedCount: number; 
    decorations: any[]; 
  };
  
  // ... 기존 필드 유지 ...
  inventory: any[]; collection: any[]; subscriptions: any[]; unresolvedShadows: any[];
  lunaCycle: any; counters: any; npcAffection: any; gardenNutrients: any;
  materials: any; equipped: any; status: any; 
  junk: number; salt: number; seedPackets: number;
}

// ... Transaction, SubscriptionPlan 등 기존 타입 유지 ...
export interface Transaction { id: string; amount: number; category: string; createdAt: string; }
export interface SubscriptionPlan { id: string; name: string; amount: number; billingDay: number; categoryId: string; }
export interface FieldObject { id: string; x: number; y: number; type: string; isCollected: boolean; }
export interface ShadowMonster { id: string; amount: number; category: string; hp?: number; maxHp?: number; createdAt: string; }
export interface MonsterStat { name: string; hp: number; maxHp: number; attack: number; sprite: string; rewardJunk: number; }
export enum Scene { GARDEN='GARDEN', MY_ROOM='MY_ROOM', VILLAGE_MAP='VILLAGE_MAP', LIBRARY='LIBRARY', FORGE='FORGE', SHOP='SHOP', WORLD_MAP='WORLD_MAP', FIELD='FIELD', BATTLE='BATTLE', INVENTORY='INVENTORY', SETTINGS='SETTINGS', COLLECTION='COLLECTION', MONTHLY_REPORT='MONTHLY_REPORT', KINGDOM='KINGDOM', SUBSCRIPTION='SUBSCRIPTION' }
