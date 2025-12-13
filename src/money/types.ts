// src/money/types.ts

// -------------------------
// 1. Scene & Enums
// -------------------------
export enum Scene {
  GARDEN = 'GARDEN',
  MY_ROOM = 'MY_ROOM',
  VILLAGE_MAP = 'VILLAGE_MAP',
  LIBRARY = 'LIBRARY',
  WORLD_MAP = 'WORLD_MAP',
  FIELD = 'FIELD',
  BATTLE = 'BATTLE',
  INVENTORY = 'INVENTORY',
  KINGDOM = 'KINGDOM',
  COLLECTION = 'COLLECTION',
  SUBSCRIPTION = 'SUBSCRIPTION',
  FORGE = 'FORGE',
  SHOP = 'SHOP',
  SETTINGS = 'SETTINGS',
  MONTHLY_REPORT = 'MONTHLY_REPORT'
}

// 월드 로케이션 ID
export type LocationId = 'VILLAGE_BASE' | 'CITY_CAPITAL' | 'FOREST_OUTLAW';

// 아이템 효과 타입
export type ItemEffectType = 
  | 'MP_RESTORE'      // MP 회복
  | 'MP_COST_DOWN'    // MP 소모 감소
  | 'SALT_BOOST'      // Salt 획득량 증가
  | 'JUNK_CLEAN'      // Junk 정화/제거
  | 'GROWTH_BOOST'    // 정원 성장 속도 증가
  | 'NPC_LOVE'        // NPC 호감도 상승
  | 'NONE';

// -------------------------
// 2. Luna System (Bio-Rhythm)
// -------------------------
export type LunaPhase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION' | 'LUTEAL' | 'PMS';

export interface PeriodRecord {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  cycleLength?: number; // 이전 시작일로부터의 간격 (자동계산용)
}

export interface LunaCycle {
  // 3~6개월치 기록 보관 (최신순 권장)
  history: PeriodRecord[]; 
  
  // 계산된 평균값 (AI 예측용)
  avgCycleLength: number;  // 평균 주기 (예: 28일)
  avgPeriodLength: number; // 평균 기간 (예: 5일)
  
  // 현재 상태 (매일 접속 시 갱신)
  currentPhase: LunaPhase;
  nextPeriodDate: string;  // 예상 시작일
  dDay: number;            // D-Day
}

// -------------------------
// 3. v4 Financial System
// -------------------------

// 대분류
export type TxType = 'EXPENSE' | 'INCOME' | 'TRANSFER'; 

// 상세 카테고리 (Category ID)
export type CategoryId = 
  // [고정비] Fixed
  | 'fixed.housing' | 'fixed.utilities' | 'fixed.telecom' | 'fixed.insurance' 
  | 'fixed.subscription' | 'fixed.fees'
  // [생활/식비] Food & Life
  | 'food.groceries' | 'food.out' | 'food.cafe_snack' | 'life.supplies'
  // [이동] Move
  | 'move.transport' | 'move.travel'
  // [건강] Health
  | 'health.medical' | 'health.meds' | 'health.fitness'
  // [즐거움/성장] Fun & Self
  | 'social.gift' | 'social.meetup' | 'fun.hobby' | 'self.dev' | 'big.oneoff'
  | 'life.pet' | 'life.family'
  // [저축/투자/부채] Save & Invest (정원 연동)
  | 'save.emergency' | 'save.buffer' | 'save.goal' | 'save.deposit' 
  | 'save.debt' // 부채 상환 (정원 덩굴 제거 효과)
  | 'invest.isa' | 'invest.pension' | 'invest.brokerage' | 'invest.cash_equiv'
  // [기타]
  | 'etc';

// 태그 시스템 (Tags)
export type IntentTag = 
  // 지출 의도
  | 'necessary' | 'planned' | 'self_care' | 'reward' | 'small_joy' 
  | 'impulse' | 'convenience' | 'efficiency' | 'social_duty' | 'unavoidable' | 'explore'
  // 저축 의도 (목적)
  | 'goal_emergency' | 'goal_debt' | 'goal_trip' | 'goal_big' | 'goal_house' | 'goal_retirement' | 'goal_growth';

export type SituationTag = 
  | 'workday' | 'weekend' | 'commute' | 'late_night' 
  | 'month_end' | 'payday' | 'stress' | 'tired' | 'sick' 
  | 'pms' | 'period' | 'social' | 'traveling'
  | 'windfall' | 'market_drop';

export type AttributeTag = 
  | 'online' | 'offline' | 'delivery' | 'import' | 'secondhand'
  | 'limited' | 'preorder' | 'bundle' | 'split_pay' | 'points'
  | 'fan_goods' | 'fan_ticket' | 'fan_trip'
  | 'auto' | 'dca' | 'lump_sum';

// 거래 내역 구조체
export interface Transaction {
  id: string;
  type?: TxType;           
  amount: number;
  category: CategoryId;   
  
  // 태그 (v4)
  intent?: IntentTag;     
  situations?: SituationTag[]; 
  attributes?: AttributeTag[]; 
  
  note?: string;          
  createdAt: string;      
}

// 하위 호환성용 별칭
export type PendingTransaction = Transaction;

// -------------------------
// 4. Items & Field & Assets
// -------------------------
export interface ItemData {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'material' | 'junk' | 'decor';
  desc: string;
  effectType?: ItemEffectType;
  effectValue?: number; 
  price?: number;
  equipSlot?: 'weapon' | 'armor' | 'accessory'; 
}

export interface CraftRecipe {
  id: string;
  name: string;
  resultItemId: string;
  resultCount: number;
  junkCost: number;
  saltCost: number;
  mpCost: number;
  essenceCost: number;
  materials?: Record<string, number>; 
  category: 'BASIC' | 'EQUIPMENT' | 'CONSUMABLE' | 'DECOR';
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'material' | 'junk';
  count: number;
}

export interface AssetBuildingsState {
  fence: number;      // 방어
  greenhouse: number; // 무지출
  mansion: number;    // 고정비
  fountain: number;   // 정화
  barn: number;       // 파밍
}

export interface AssetBuildingView {
  id: string;
  label: string;
  level: number;
  nextTarget: number | null;
  count: number;
}

export interface FieldObject {
  id: string;
  x: number;
  y: number;
  type: 'JUNK' | 'HERB' | 'CHEST' | 'SIGNPOST'; // SIGNPOST 추가됨
  isCollected: boolean;
}

export interface ShadowMonster {
  id: string;
  amount: number;
  category: string;
  createdAt: string;
  x: number;
  y: number;
}

export interface MonsterStat {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  sprite: string;
  rewardJunk: number;
}

export interface GardenState {
  treeLevel: number;
  pondLevel: number;
  flowerState: 'blooming' | 'normal' | 'withered';
  weedCount: number;
  decorations: string[];
}

export interface PlayerStatus {
  mode: 'NORMAL' | 'DARK';
  darkLevel: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  billingDay: number;
  isActive: boolean;
  lastChargedDate?: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  obtainedAt: string;
  category: 'JUNK' | 'BADGE';
}

export interface NpcAffection {
  gardener: number;
  angel: number;
  demon: number;
  curator: number;
}

// -------------------------
// 5. Root User State
// -------------------------
export interface UserState {
  name: string;
  level: number;
  jobTitle: string;
  currentBudget: number;
  maxBudget: number;
  mp: number;
  maxMp: number;
  junk: number;
  salt: number;
  seedPackets: number;

  garden: GardenState;
  status: PlayerStatus;
  
  // [UPDATED] 고도화된 루나 시스템
  lunaCycle: LunaCycle;

  inventory: InventoryItem[];
  collection: CollectionItem[];
  
  // [UPDATED] v4 거래 내역
  pending: Transaction[]; 
  
  materials: Record<string, number>;
  equipped: {
    weapon: string | null;
    armor: string | null;
    accessory: string | null;
  };

  assets: AssetBuildingsState;
  
  counters: {
    defenseActionsToday: number;
    junkObtainedToday: number;
    dailyTotalSpend: number;
    hadSpendingToday: boolean;
    noSpendStreak: number;
    guardPromptShownToday: boolean;
    lastDailyResetDate: string;
    lastDayEndDate: string;
    cumulativeDefense: number;
    noSpendStamps: Record<string, boolean>; // 무지출 스탬프
  };

  subscriptions: SubscriptionPlan[];
  unresolvedShadows: ShadowMonster[];
  npcAffection: NpcAffection;
  stats: {
    attack: number;
    defense: number;
  };

  // 탐험 시스템
  currentLocation: LocationId;
  unlockedLocations: LocationId[];

  // 정원 연동 데이터 (저축/부채상환 누적 효과)
  gardenNutrients?: {
    savedAmount: number;   // 저축 누적액
    debtRepaid: number;    // 부채 상환액
  };
}
