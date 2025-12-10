// src/money/items.ts
import { ItemData } from './types';

export const ITEM_DB: Record<string, ItemData> = {
  // ===============================================
  // 1. 🗑️ 잔해 (Junk) - 지출 시 획득 (정화용)
  // ===============================================
  'sticky_slime': {
    id: 'sticky_slime', name: '끈적한 액체', category: 'residue', tier: 'D', icon: '💧',
    description: '식비 지출의 흔적. 달콤하고 끈적거립니다.'
  },
  'tangled_thread': {
    id: 'tangled_thread', name: '엉킨 실타래', category: 'residue', tier: 'D', icon: '🧶',
    description: '쇼핑의 충동이 복잡하게 얽혀있습니다.'
  },
  'rusty_gear': {
    id: 'rusty_gear', name: '녹슨 톱니', category: 'residue', tier: 'D', icon: '⚙️',
    description: '어딘가로 이동하며 떨어진 부품입니다.'
  },
  'unknown_stone': {
    id: 'unknown_stone', name: '정체불명의 돌', category: 'residue', tier: 'D', icon: '🪨',
    description: '분류할 수 없는 지출의 단단한 파편입니다.'
  },
  'fog_dust': {
    id: 'fog_dust', name: '짙은 안개 가루', category: 'residue', tier: 'D', icon: '🌫️',
    description: '형체가 없는 지출(구독/컨텐츠)의 흔적입니다.'
  },
  
  // ===============================================
  // 2. 💎 재료 (Material) - 정화/조건 달성 보상
  // ===============================================
  'purifying_salt': {
    id: 'purifying_salt', name: '정화의 소금', category: 'material', tier: 'B', icon: '✨',
    description: '무지출이라는 인내의 시간 끝에 얻은 순수한 결정.'
  },
  'sugar_crystal': {
    id: 'sugar_crystal', name: '설탕 결정', category: 'material', tier: 'C', icon: '🍬',
    description: '액체를 정화하여 얻은 결정. 포션의 주재료.'
  },
  'fine_silk': {
    id: 'fine_silk', name: '고운 비단', category: 'material', tier: 'C', icon: '🧵',
    description: '실타래를 풀어낸 최고급 원단. 장비 재료.'
  },
  'iron_plate': {
    id: 'iron_plate', name: '강철 판', category: 'material', tier: 'C', icon: '🛡️',
    description: '톱니를 녹여 만든 단단한 판.'
  },
  'mana_powder': {
    id: 'mana_powder', name: '마나 가루', category: 'material', tier: 'B', icon: '🔮',
    description: '지식을 정제하여 얻은 신비한 가루.'
  },
  'dawn_crystal': {
    id: 'dawn_crystal', name: '새벽의 결정', category: 'material', tier: 'A', icon: '🌅',
    description: '이른 아침(06-11시) 무지출 성공의 증표.'
  },
  'dusk_crystal': {
    id: 'dusk_crystal', name: '황혼의 결정', category: 'material', tier: 'A', icon: '🌆',
    description: '퇴근길(18-21시) 유혹을 이겨낸 증표.'
  },

  // ===============================================
  // 3. 🧪 소비 (Consumable) - 포션/스크롤
  // ===============================================
  'pms_potion': {
    id: 'pms_potion', name: '회복 포션', category: 'consumable', tier: 'B', icon: '🧪',
    description: 'PMS 기간 전용. 지출 데미지를 무효화합니다.',
    effect: { type: 'heal_hp', value: 100 } // 값은 로직에서 처리
  },
  'hourglass': {
    id: 'hourglass', name: '모래시계', category: 'consumable', tier: 'A', icon: '⏳',
    description: '오늘 마감을 1시간 연장합니다. (새벽 1시까지)',
    effect: { type: 'time_extend', value: 1 }
  },
  'focus_candle': {
    id: 'focus_candle', name: '집중의 향초', category: 'consumable', tier: 'B', icon: '🕯️',
    description: '다음 접속 시 MP 회복량이 2배가 됩니다.',
    effect: { type: 'restore_mp', value: 0 } // 특수 로직
  },

  // ===============================================
  // 4. ⚔️ 장비 (Equipment) - 스탯 보너스
  // ===============================================
  'ledger_sword': {
    id: 'ledger_sword', name: '잔잔한 장부검', category: 'equipment', tier: 'C', icon: '🗡️',
    description: '기록의 힘이 깃든 검. 기록 시 MP 회복.',
    stats: { mpRegen: 1 }
  },
  'tea_shield': {
    id: 'tea_shield', name: '차향 방패', category: 'equipment', tier: 'B', icon: '🛡️',
    description: '은은한 향으로 스트레스를 막습니다. 방어력 증가.',
    stats: { def: 5 }
  },
  'repay_ring': {
    id: 'repay_ring', name: '상환의 반지', category: 'equipment', tier: 'A', icon: '💍',
    description: '빚을 갚은 자의 증표. 신용도 상승 가속.',
    stats: { special: 'credit_boost' }
  },
  
  // ===============================================
  // 5. 🏺 수집품 (Relic) - 도감용
  // ===============================================
  'ancient_receipt': {
    id: 'ancient_receipt', name: '고대 영수증 석판', category: 'relic', tier: 'S', icon: '📜',
    description: '"기록하지 않은 자는 기억되지 않는다"고 적혀있다.',
    relicSet: 'lost_civilization'
  },
  'cherry_blossom': {
    id: 'cherry_blossom', name: '봄의 벚꽃잎', category: 'relic', tier: 'A', icon: '🌸',
    description: '낭비 없는 봄날에만 피어나는 꽃잎.',
    relicSet: 'four_seasons'
  }
};
