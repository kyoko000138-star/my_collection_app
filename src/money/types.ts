// src/money/types.ts

// -------------------------
// Scene (장면)
// -------------------------
export enum Scene {
  VILLAGE = 'VILLAGE',
  WORLD_MAP = 'WORLD_MAP',
  BATTLE = 'BATTLE',
  INVENTORY = 'INVENTORY',
  KINGDOM = 'KINGDOM',
  COLLECTION = 'COLLECTION',

  // ✅ 룰북 확장(옵션): 정원/내방 등 "새 씬"을 붙일 때 사용
  GARDEN = 'GARDEN',
  MY_ROOM = 'MY_ROOM',
}

// -------------------------
// Core Item / Inventory
// -------------------------
export type ItemType = 'consumable' | 'equipment' | 'material' | 'junk' | 'decor';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  count: number;

  // 확장용(선택)
  rarity?: 'COMMON' | 'RARE' | 'EPIC';
  desc?: string;
}

// -------------------------
// Collection (도감)
// -------------------------
export type CollectionCategory = 'JUNK' | 'BADGE';

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  obtainedAt: string; // ISO string (KST로 저장해도 ok)
  category: CollectionCategory;

  // 확장용(선택)
  source?: string; // 어디서 얻었는지(던전/이벤트 등)
}

// -------------------------
// Logs (최근 기록/Pending)
// -------------------------
export interface PendingTransaction {
  id: string;
  amount?: number;
  note: string;
  createdAt: string; // ISO string

  // 확장용(선택)
  categoryId?: string; // food/transport/...
  kind?: 'SPEND' | 'SAVING' | 'REPAY' | 'INCOME' | 'ETC';
}

// -------------------------
// Luna (주기/테마용)
// -------------------------
export interface LunaCycle {
  startDate: string; // YYYY-MM-DD 권장
  periodLength: number;
  cycleLength: number;
}

// -------------------------
// Assets (기존 “건물 카운트” 시스템 유지)
// -------------------------
export interface AssetBuildingsState {
  fortress: number;
  airfield: number;
  mansion: number;
  tower: number;
  warehouse: number;
}

export type AssetBuildingId =
  | 'fortress'
  | 'airfield'
  | 'mansion'
  | 'tower'
  | 'warehouse';

export interface AssetBuildingView {
  id: AssetBuildingId;
  label: string;
  level: number;
  nextTarget: number | null;
  count: number;
}

// -------------------------
// Garden (룰북 핵심: “정원 = 결과 화면”)
// -------------------------
export type FlowerState = 'blooming' | 'normal' | 'withered';

export interface GardenState {
  treeLevel: number; // 꿈의 나무(저축): 1~5
  pondLevel: number; // 비상금 연못: 0~3 (혹은 0~5 등 추후 조정)
  flowerState: FlowerState; // 생활의 꽃(지출 상태)
  weedCount: number; // 잡초(부채/과소비)
}

// -------------------------
// NPC (룰북: 4 NPC)
// -------------------------
export type NpcId = 'angel' | 'demon' | 'gardener' | 'curator';

export interface DialogueLine {
  speaker: NpcId | 'system';
  text: string;
  mood?: 'neutral' | 'warm' | 'worried' | 'stern' | 'playful';
}

export interface NpcDefinition {
  id: NpcId;
  nameKo: string;
  nameEn: string;
  emoji: string;
  color: string; // 대화창 이름표 색
  description: string;
}

// -------------------------
// User State (게임 세이브 핵심)
// -------------------------
export interface UserCounters {
  defenseActionsToday: number;
  junkObtainedToday: number;
  dailyTotalSpend: number;
  hadSpendingToday: boolean;
  noSpendStreak: number;
  guardPromptShownToday: boolean;

  // 날짜(옵션)
  lastDailyResetDate?: string; // YYYY-MM-DD
  lastDayEndDate?: string; // YYYY-MM-DD
}

export interface UserState {
  // 프로필
  name: string;
  level: number;
  jobTitle: string; // CLASS_TYPES 값 그대로(문자열)

  // 핵심 스탯
  currentBudget: number; // HP
  maxBudget: number;
  mp: number; // MP(의지력)
  maxMp: number;

  // 자원
  junk: number;
  salt: number;

  // ✅ 룰북 핵심: 정원 상태(저축/부채/지출 시각화)
  garden: GardenState;

  // 루나/주기
  lunaCycle: LunaCycle;

  // 인벤토리/도감/기록
  inventory: Item[];
  collection: CollectionItem[];
  pending: PendingTransaction[];

  // 제작 재료
  materials: Record<string, number>;

  // 기존 건물(자산) 시스템
  assets: AssetBuildingsState;

  // 카운터(일일)
  counters: UserCounters;

  // 기록(옵션)
  lastLoginDate?: string;
}
