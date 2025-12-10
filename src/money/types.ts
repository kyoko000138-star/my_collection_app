// src/money/types.ts

// ==========================================
// 1. 기본 정의 (Primitive Types)
// ==========================================
export type TxType = 'expense' | 'income' | 'transfer'; 
export type LunaMode = 'normal' | 'pms' | 'rest';
export type RouteMode = 'calm' | 'adventure';
export type NodeType = 'town' | 'field' | 'dungeon' | 'crossroad' | 'boss' | 'shop';

// ==========================================
// 2. 아이템 카테고리 (Item Categories)
// ==========================================

// 🗑️ 잔해 (Junk): 맵/시간/카테고리별 드랍
export type ResidueType = 
  | 'sticky_slime' | 'tangled_thread' | 'rusty_gear' | 'unknown_stone' | 'fog_dust' // 기존
  | 'wet_moss' | 'torn_receipt' // 숲
  | 'broken_glass' | 'soaked_box' // 항구
  | 'dried_syrup' | 'crushed_can' // 사막
  | 'expired_coupon' | 'crumpled_paper' // 학회
  | 'fake_gem' | 'faded_ribbon'; // VIP

// 💎 재료 (Material): 정화 및 특수 조건 획득
export type MaterialType = 
  | 'sugar_crystal' | 'fine_silk' | 'iron_plate' | 'mana_powder' | 'purifying_salt' // 정화 기본
  | 'tea_essence' | 'leaf_fragment' | 'forest_dew' // 숲
  | 'polished_scrap' | 'timber_plank' | 'sea_glass' // 항구
  | 'salt_crystal' | 'dried_date' // 사막
  | 'knowledge_shard' | 'contract_ink' // 학회
  | 'gold_leaf' | 'porcelain_chip' | 'aged_wood' // VIP
  | 'dawn_crystal' | 'dusk_crystal' // 시간 (새벽/황혼)
  | 'spider_silk' | 'rainbow_cloth' // 패턴 (장기미사용/다양성)
  | 'cactus_sap' | 'refined_water'; // 지역 특수

// 🧪 소비 (Consumable): 효과 정의
export type ConsumableEffect = 
  | 'heal_hp' | 'restore_mp' | 'buff_drop' | 'defense_boost' 
  | 'luna_shield_up' | 'time_extend'; // 모래시계 등

// ⚔️ 장비 (Equipment): 슬롯 정의
export type EquipSlot = 'weapon' | 'armor' | 'accessory';

// 🏺 수집품 (Relic): 세트 정의
export type RelicSet = 'none' | 'lost_civilization' | 'four_seasons' | 'tea_time';

// 📦 통합 아이템 인터페이스
export interface ItemData {
  id: string;
  name: string;
  category: 'residue' | 'material' | 'consumable' | 'equipment' | 'relic';
  tier: 'D' | 'C' | 'B' | 'A' | 'S';
  description: string; // Lore 텍스트
  icon: string;        // 이모지
  
  // 상세 속성 (Optional)
  effect?: { type: ConsumableEffect; value: number; duration?: number }; // 소비템용
  stats?: { atk?: number; def?: number; mpRegen?: number; special?: string }; // 장비용
  relicSet?: RelicSet; // 수집품용
}

// ==========================================
// 3. 핵심 데이터 모델 (Core Models)
// ==========================================

export interface TransactionLike {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (새벽/황혼 체크용)
  type: TxType;
  category: string;
  amount: number;
  isEssential?: boolean;
  isRecoverySnack?: boolean; 
  memo?: string; 
}

export interface DayStatusLike {
  day: number;
  isNoSpend: boolean;
  completedQuests: number;
  lunaShieldUsed?: boolean;
}

export interface MonthlyBudgetLike {
  year: number;
  month: number;
  variableBudget: number;     
  noSpendTarget: number;
  snackRecoveryBudget?: number; 
}

export interface InstallmentLike {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
}

export interface CycleSettings {
  lastPeriodStart: string;
  cycleLength: number;
}

// ==========================================
// 4. 자산의 왕국 (Asset Kingdom)
// ==========================================
export interface Building {
  id: string;
  name: string;        // "비상금 창고" 등
  type: 'warehouse' | 'tower' | 'dock' | 'house'; // 건물 외형 타입
  level: number;       
  currentExp: number;  
  totalSavings: number;
  monthStreak: number; // 월간 연속 달성 횟수
}

// ==========================================
// 5. 직업 & 전직 (Job System)
// ==========================================
export type JobType = 'novice' | 'guardian' | 'sage' | 'alchemist' | 'druid';
export type JobTier = 0 | 1 | 2 | 3; 

export interface JobState {
  currentJob: JobType;
  tier: JobTier;
  exp: number; 
  unlockedSkills: string[];
}

// ==========================================
// 6. 인벤토리 & 통합 상태 (Root State)
// ==========================================

export interface InventoryState {
  gold: number; 
  leaf: number; 
  
  // 3대 조각
  shards: {
    record: number;     
    discipline: number; 
    freedom: number;    
  };

  // 아이템 수량 (ID: 개수)
  items: Record<string, number>; 
  
  // 도감 해금 목록 (ID 리스트)
  collection: string[]; 
  
  // 장착 중인 아이템 ID
  equipped: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
}

// 최종 유저 데이터 (LocalStorage 저장 대상)
export interface UserState {
  meta: {
    lastLoginDate: string;
    lastLoginTime: string; // HH:mm (시간 체크용)
    currentYear: number;
    currentMonth: number;
  };

  status: {
    hp: number;    
    mp: number;    
    credit: number; // 신용도
  };

  // 일시적 버프 상태 (향초 등)
  buffs: {
    mpRegenMultiplier?: number; // MP 회복 배율
    nextDropDouble?: boolean;   // 다음 드랍 2배
  };

  budget: MonthlyBudgetLike;
  cycle: CycleSettings;
  
  buildings: Building[]; 
  job: JobState;         
  inventory: InventoryState;
  
  journey: {
    nodes: any[]; 
    currentNodeId: number;
    routeTheme: string; 
  };
}
