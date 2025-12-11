// src/money/moneyGardenLogic.ts

import { UserState } from './types';

// 아이템 ID 모음
export const ITEM_IDS = {
  WATER: 'water_can',   // 물뿌리개
  HOE: 'hoe',           // 호미
  NUTRIENT: 'nutrient', // 영양제
} as const;

type ItemId = (typeof ITEM_IDS)[keyof typeof ITEM_IDS];

// 공통: 인벤토리에서 아이템 1개 사용
function useItem(state: UserState, itemId: ItemId): UserState | null {
  const next = JSON.parse(JSON.stringify(state)) as UserState;
  const idx = next.inventory.findIndex((i) => i.id === itemId);
  if (idx === -1 || next.inventory[idx].count <= 0) return null;

  next.inventory[idx].count -= 1;
  if (next.inventory[idx].count <= 0) {
    next.inventory.splice(idx, 1);
  }
  return next;
}

// 1. 물 주기 → 나무 성장 + 꽃 상태 좋아짐
export const waterTree = (
  state: UserState,
): { newState: UserState; success: boolean; msg: string } => {
  const next = useItem(state, ITEM_IDS.WATER);
  if (!next)
    return {
      newState: state,
      success: false,
      msg: '물뿌리개가 없습니다! (무지출/하루 마감 보상으로 획득해보세요)',
    };

  next.garden.treeLevel = Math.min(5, next.garden.treeLevel + 1);
  next.garden.flowerState = 'blooming';

  return {
    newState: next,
    success: true,
    msg: '💧 물을 주었습니다! 꿈의 나무가 자라고 꽃이 활짝 피었어요.',
  };
};

// 2. 잡초 뽑기 → 대출 상환 보조용
export const removeWeed = (
  state: UserState,
): { newState: UserState; success: boolean; msg: string } => {
  const next = useItem(state, ITEM_IDS.HOE);
  if (!next)
    return {
      newState: state,
      success: false,
      msg: '호미가 없습니다! (방어/무지출 보상으로 획득해보세요)',
    };

  next.garden.weedCount = Math.max(0, next.garden.weedCount - 1);

  return {
    newState: next,
    success: true,
    msg: '🧹 잡초를 뽑았습니다! 정원이 조금 더 깔끔해졌어요.',
  };
};

// 3. 영양제 → 시든 꽃 회복
export const reviveFlower = (
  state: UserState,
): { newState: UserState; success: boolean; msg: string } => {
  if (state.garden.flowerState !== 'withered') {
    return {
      newState: state,
      success: false,
      msg: '꽃이 아직 건강해요. 나중에 힘들 때 써도 괜찮아요.',
    };
  }

  const next = useItem(state, ITEM_IDS.NUTRIENT);
  if (!next)
    return {
      newState: state,
      success: false,
      msg: '영양제가 없습니다! (절약/저축 미션으로 얻어보세요)',
    };

  next.garden.flowerState = 'normal';

  return {
    newState: next,
    success: true,
    msg: '💊 영양제를 줬어요. 꽃이 다시 생기를 찾습니다.',
  };
};
