// src/money/moneyJourney.ts

export type NodeType = 'town' | 'field' | 'dungeon';
export type RouteMode = 'calm' | 'adventure'; // 갈림길 타입

export interface JourneyNode {
  id: number;
  type: NodeType;
  label: string;
  description: string;
}

export interface MoneyJourneyState {
  currentNodeId: number;
  nodes: JourneyNode[];
  routeMode: RouteMode; // 현재 선택된 루트 저장
}

// 모드에 따라 맵 생성
export function createJourney(routeMode: RouteMode): MoneyJourneyState {
  let nodes: JourneyNode[] = [];

  if (routeMode === 'calm') {
    // 🌱 차분 루트: 던전 없음 (4단계)
    nodes = [
      { id: 0, type: 'town', label: '시작 마을', description: '한 달 예산을 정비하는 곳' },
      { id: 1, type: 'field', label: '평온의 숲', description: '가벼운 소비를 관리하는 곳' },
      { id: 2, type: 'field', label: '고요한 들판', description: '꾸준함을 유지하는 곳' },
      { id: 3, type: 'town', label: '결산의 언덕', description: '한 달을 마무리하는 곳' },
    ];
  } else {
    // ⚔️ 도전 루트: 던전 포함 (5단계)
    nodes = [
      { id: 0, type: 'town', label: '시작 마을', description: '장비를 챙기고 준비하는 곳' },
      { id: 1, type: 'field', label: '초심자 숲', description: '몸을 풀며 기록하는 곳' },
      { id: 2, type: 'dungeon', label: '지출의 동굴', description: '유혹이 강한 위기의 구간' },
      { id: 3, type: 'field', label: '회복의 평원', description: '던전을 지나 안정을 찾는 곳' },
      { id: 4, type: 'town', label: '승리의 성', description: '보상을 정산하는 곳' },
    ];
  }

  return {
    currentNodeId: 0,
    nodes,
    routeMode,
  };
}

// 진행도 평가 (evaluateJourney)
// 기존 로직을 살리되, 던전 유무에 따라 분기 처리
export function evaluateJourney(
  state: MoneyJourneyState,
  ctx: { variableBudget: number; totalExpense: number; noSpendDays: number; dayOfMonth: number }
): MoneyJourneyState {
  const { variableBudget, totalExpense, noSpendDays, dayOfMonth } = ctx;
  const expenseRatio = variableBudget > 0 ? totalExpense / variableBudget : 0;
  
  let nextId = state.currentNodeId;
  const maxId = state.nodes.length - 1;

  // 1. 공통: 예산 설정하면 출발 (0 -> 1)
  if (state.currentNodeId === 0 && variableBudget > 0) {
    nextId = 1;
  }

  // 2. 루트별 분기
  if (state.routeMode === 'calm') {
    // [차분 루트 로직]
    // 1(숲) -> 2(들판): 15일 지남 OR 무지출 5일 이상
    if (state.currentNodeId === 1) {
      if (dayOfMonth >= 15 || noSpendDays >= 5) nextId = 2;
    }
    // 2(들판) -> 3(결산): 25일 지남
    if (state.currentNodeId === 2) {
      if (dayOfMonth >= 25) nextId = 3;
    }
  } else {
    // [도전 루트 로직]
    // 1(숲) -> 2(던전): 무지출 3일 이상 OR 10일 지남
    if (state.currentNodeId === 1) {
      if (noSpendDays >= 3 || dayOfMonth >= 10) nextId = 2;
    }
    // 2(던전) -> 3(평원): 예산 70% 이하 방어 중 AND 20일 지남
    if (state.currentNodeId === 2) {
      if (expenseRatio <= 0.7 && dayOfMonth >= 20) nextId = 3;
    }
    // 3(평원) -> 4(성): 28일 지남
    if (state.currentNodeId === 3) {
      if (dayOfMonth >= 28) nextId = 4;
    }
  }

  // maxId 초과 방지
  return {
    ...state,
    currentNodeId: Math.min(nextId, maxId),
  };
}
