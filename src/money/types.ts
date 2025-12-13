export const CLASS_TYPES = {
  NOVICE: 'NOVICE',
  GUARDIAN: 'GUARDIAN',   
  RANGER: 'RANGER',       
  ALCHEMIST: 'ALCHEMIST', 
} as const;
export type ClassType = typeof CLASS_TYPES[keyof typeof CLASS_TYPES];

// [V1.0 신규] 위치 ID (기존 좌표 시스템 대체)
export type LocationId = 
  | 'VILLAGE_BASE'    
  | 'FIELD_CROSSROAD' 
  | 'FOREST_ENTRY'    
  | 'FOREST_OUTLAW'   
  | 'FIELD_PLAINS'    
  | 'CITY_CAPITAL'    
  | 'REST_AREA';      

// [V1.0 신규] 자산 건물 상태
export interface AssetBuildingsState {
  fence: number;      
  hut: number;        
  house: number;      
  mansion: number;    
  castle: number;     
  fountain: number;   
  greenhouse: number; 
  statue: number;     
  barn: number;       
}

export interface RpgStats {
  str: number; 
  def: number; 
  luk: number; 
}

// [통합] UserState
export interface UserState {
  name: string;
  level: number;
  jobTitle: ClassType;
  
  // [현실]
  currentBudget: number; 
  maxBudget: number;     
  
  // [판타지]
  mp: number;            
  maxMp: number;
  exp: number;
  stats: RpgStats;

  // [탐험]
  currentLocation: LocationId;
  unlockedLocations: LocationId[];
  isExhausted: boolean;

  // [자산]
  assets: AssetBuildingsState;
  garden: { 
    treeLevel: number; 
    pondLevel: number;
    flowerState: 'blooming' | 'normal' | 'withered'; 
    weedCount: number; 
    decorations: any[]; 
  };
  
  // [기존 1213 데이터 유지]
  inventory: any[]; 
  collection: any[]; 
  subscriptions: SubscriptionPlan[]; 
  unresolvedShadows: ShadowMonster[];
  lunaCycle: any; 
  counters: any; 
  npcAffection: any; 
  gardenNutrients: any;
  materials: any; 
  equipped: any; 
  status: any; 
  junk: number; 
  salt: number; 
  seedPackets: number;
}

export interface Transaction { id: string; amount: number; category: string; createdAt: string; }
export interface SubscriptionPlan { id: string; name: string; amount: number; billingDay: number; categoryId: string; isActive: boolean; cycle: string; startedAt: string; }
export interface FieldObject { id: string; x: number; y: number; type: string; isCollected: boolean; }
export interface ShadowMonster { id: string; amount: number; category: string; hp?: number; maxHp?: number; createdAt: string; x?: number; y?: number; }
export interface MonsterStat { name: string; hp: number; maxHp: number; attack: number; sprite: string; rewardJunk: number; }

export enum Scene { 
  GARDEN='GARDEN', MY_ROOM='MY_ROOM', VILLAGE_MAP='VILLAGE_MAP', LIBRARY='LIBRARY', 
  FORGE='FORGE', SHOP='SHOP', WORLD_MAP='WORLD_MAP', FIELD='FIELD', BATTLE='BATTLE', 
  INVENTORY='INVENTORY', SETTINGS='SETTINGS', COLLECTION='COLLECTION', 
  MONTHLY_REPORT='MONTHLY_REPORT', KINGDOM='KINGDOM', SUBSCRIPTION='SUBSCRIPTION' 
}
