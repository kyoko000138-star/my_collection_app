// src/money/moneyJourney.ts
import { 
  MoneyJourneyState, JourneyNode, RouteMode, 
  TransactionLike, ZoneModifier
} from './types';

// ==========================================
// 1. 맵 테마 설정 (Map Themes)
// ==========================================
interface ThemeConfig {
  id: string;
  name: string;
  desc: string;
  modifier: ZoneModifier;
  bgEmoji: string; 
}

export const MAP_THEMES: Record<string, ThemeConfig> = {
  'forest': { 
    id: 'forest', name: '🌲 고요한 숲', desc: '힐링과 무지출을 위한 숲', 
    modifier: { damageMultiplier: 1.0, rewardMultiplier: 1.2 }, bgEmoji: '🌲' 
  },
  'harbor': { 
    id: 'harbor', name: '🏙️ 항구 도시', desc: '활기찬 무역과 파밍의 도시', 
    modifier: { damageMultiplier: 1.2, rewardMultiplier: 1.5 }, bgEmoji: '⚓' 
  },
  'desert': { 
    id: 'desert', name: '🏜️ 갈증의 사막', desc: '식비 유혹이 심한 곳', 
    modifier: { damageMultiplier: 1.5, rewardMultiplier: 2.0 }, bgEmoji: '🌵' 
  },
  'academy': { 
    id: 'academy', name: '🧙‍♀️ 마법 학회', desc: '고정비와 구독을 연구하는 곳', 
    modifier: { damageMultiplier: 1.0, rewardMultiplier: 1.0 }, bgEmoji: '📚' 
  },
  'vip': { 
    id: 'vip', name: '👑 VIP 라운지', desc: '신용 높은 자들의 휴식처', 
    modifier: { damageMultiplier: 0.5, rewardMultiplier: 3.0 }, bgEmoji: '🥂' 
  }
};

// ==========================================
// 2. 맵 생성기 (Map Generator)
// ==========================================
export const createJourney = (mode: RouteMode, themeKey: string = 'forest'): MoneyJourneyState => {
  const theme = MAP_THEMES[themeKey] || MAP_THEMES['forest'];
  
  // 월드맵 노드 구성 (기본 5단계)
  const nodes: JourneyNode[] = [
    { id: 0, label: '시작 마을', type: 'town', description: '여정을 준비하는 곳', nextNodes: [1], modifier: { damageMultiplier: 1, rewardMultiplier: 1 } },
    { id: 1, label: `${theme.name} 입구`, type: 'field', description: theme.desc, nextNodes: [2], modifier: theme.modifier },
    { id: 2, label: '깊은 구역', type: 'dungeon', description: '유혹이 강해집니다', nextNodes: [3], modifier: { ...theme.modifier, damageMultiplier: theme.modifier.damageMultiplier + 0.2 } },
    { id: 3, label: '갈림길', type: 'crossroad', description: '선택의 순간', nextNodes: [4], modifier: theme.modifier },
    { id: 4, label: '결산의 제단', type: 'boss', description: '월말 정산 (보스전)', nextNodes: [], modifier: { damageMultiplier: 1, rewardMultiplier: 5 } },
  ];

  return {
    nodes,
    currentNodeId: 0,
    routeTheme: themeKey,
    routeMode: mode
  };
};

// ==========================================
// 3. 데일리 몬스터 엔진 (Daily Monster)
// ==========================================
export interface DailyMonster {
  name: string;
  emoji: string;
  level: number; // 1(소형) ~ 3(대형)
  hp: number;    // 오늘 총 지출액에 비례
  maxHp: number;
  desc: string;
}

// 오늘 지출 내역을 분석해 몬스터 생성/진화
export const getDailyMonster = (todayTransactions: TransactionLike[]): DailyMonster => {
  // 1. 지출이 없으면 '안개' 상태
  if (!todayTransactions || todayTransactions.length === 0) {
    return { name: '정체불명의 안개', emoji: '🌫️', level: 0, hp: 1000, maxHp: 1000, desc: '아직 지출이 없습니다.' };
  }

  // 2. 가장 많이 쓴 카테고리(Max Category) 찾기
  const categoryMap: Record<string, number> = {};
  let maxCat = '';
  let maxAmount = 0;
  let totalAmount = 0;

  todayTransactions.forEach(t => {
    if (t.type === 'expense') {
      const cat = t.category || '기타';
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      totalAmount += t.amount;
      
      if (categoryMap[cat] > maxAmount) {
        maxAmount = categoryMap[cat];
        maxCat = cat;
      }
    }
  });

  // 3. 레벨 결정 (금액 기준 - 예시: 3만원, 10만원)
  let level = 1;
  if (totalAmount > 30000) level = 2;
  if (totalAmount > 100000) level = 3;

  // 4. 몬스터 스킨 결정 (카테고리별)
  let name = '지출 슬라임';
  let emoji = '💧';
  
  if (maxCat.includes('식비') || maxCat.includes('카페') || maxCat.includes('간식')) {
    name = level === 1 ? '커피 슬라임' : level === 2 ? '카페인 골렘' : '폭식의 마수';
    emoji = level === 1 ? '☕' : level === 2 ? '🍩' : '🦖';
  } else if (maxCat.includes('쇼핑') || maxCat.includes('옷') || maxCat.includes('패션')) {
    name = level === 1 ? '지름신 요정' : level === 2 ? '쇼핑백 미믹' : '파산의 드래곤';
    emoji = level === 1 ? '🧚' : level === 2 ? '🛍️' : '🐉';
  } else if (maxCat.includes('교통') || maxCat.includes('택시')) {
    name = level === 1 ? '게으름의 바퀴' : level === 2 ? '폭주 택시' : '지옥의 전차';
    emoji = level === 1 ? '🛞' : level === 2 ? '🚕' : '🔥';
  } else {
    // 기타
    name = level === 1 ? '잡동사니 유령' : level === 2 ? '영수증 뭉치' : '카드값 거신';
    emoji = level === 1 ? '👻' : level === 2 ? '🧾' : '👹';
  }

  return {
    name,
    emoji,
    level,
    hp: Math.max(0, totalAmount * 2), // 몬스터 체력은 지출액에 비례
    maxHp: Math.max(1000, totalAmount * 2),
    desc: `Lv.${level} 오늘의 지출 마수`
  };
};
