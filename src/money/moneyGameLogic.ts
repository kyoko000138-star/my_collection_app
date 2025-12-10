// src/money/moneyGameLogic.ts
import type { UserState } from './types';
import { GAME_CONSTANTS, CLASS_TYPES, type ClassType } from './constants';
import { checkGuardianShield, getDruidRecoveryBonus } from './moneyClassLogic';
import { getLunaMode } from './moneyLuna';

// 공통 유틸
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getTodayString = () => new Date().toISOString().split('T')[0];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const calcDaysLeftInBudget = (startDateStr: string, todayStr: string): number => {
  const start = new Date(startDateStr);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1); // 다음 달
  end.setDate(0);                   // 이번 달 마지막 날

  const today = new Date(todayStr);
  const diffMs = end.getTime() - today.getTime();
  if (diffMs <= 0) return 1;
  return Math.max(1, Math.ceil(diffMs / MS_PER_DAY));
};

// HP 계산 (파생값)
export const getHp = (current: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (current / total) * 100;
  return clamp(Math.floor(percentage), 0, 100);
};

// Guard Prompt 정보 타입
export interface GuardPromptInfo {
  shouldShow: boolean;
  hpBefore: number;
  hpAfter: number;
  avgAvailablePerDay: number;
}

// 자산의 왕국 뷰 타입
export interface AssetBuildingView {
  id: string;
  label: string;
  count: number;
  level: number;
  nextTarget: number | null;
}

// 📅 일일 리셋 + 접속 보상 (Dust) + 드루이드 회복
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();

  if (state.counters.lastDailyResetDate === today) {
    return state;
  }

  const currentMode = getLunaMode(today, state.luna.nextPeriodDate);
  const druidBonus = getDruidRecoveryBonus(state, currentMode);

  const newMp = clamp(
    state.runtime.mp + druidBonus, // 접속 MP 회복은 추후 별도 구현
    0,
    GAME_CONSTANTS.MAX_MP
  );

  const currentDust = state.inventory.shards['naturalDust'] ?? 0;

  return {
    ...state,
    runtime: {
      ...state.runtime,
      mp: newMp,
    },
    inventory: {
      ...state.inventory,
      shards: {
        ...state.inventory.shards,
        naturalDust: currentDust + GAME_CONSTANTS.DUST_REWARD_PER_DAY,
      },
    },
    counters: {
      ...state.counters,
      defenseActionsToday: 0,
      junkObtainedToday: 0,
      guardPromptShownToday: false,
      lastDailyResetDate: today,
      lastAccessDate: today,
    },
  };
};

// 🧠 Guard Prompt에 필요한 정보 계산
export const getGuardPromptInfo = (
  state: UserState,
  amount: number,
  isFixedCost: boolean
): GuardPromptInfo => {
  const today = getTodayString();
  const hpBefore = getHp(state.budget.current, state.budget.total);

  const afterBudget = Math.max(0, state.budget.current - amount);
  const hpAfter = getHp(afterBudget, state.budget.total);

  const daysLeft = calcDaysLeftInBudget(state.budget.startDate, today);
  const avgAvailablePerDay =
    daysLeft > 0 ? Math.floor(afterBudget / daysLeft) : 0;

  // 기본적으로 "보여줄 필요 없음" 상태로 시작
  const base: GuardPromptInfo = {
    shouldShow: false,
    hpBefore,
    hpAfter,
    avgAvailablePerDay,
  };

  // 조건: 이미 오늘 한 번 보여줬으면 X
  if (state.counters.guardPromptShownToday) return base;

  // 조건: 고정비는 Guard Prompt 대상에서 제외
  if (isFixedCost) return base;

  // 조건: 금액이 너무 작고, HP도 충분하면 X
  const isHighAmount = amount >= GAME_CONSTANTS.GUARD_PROMPT_MIN_AMOUNT;
  const isHpDanger = hpAfter < GAME_CONSTANTS.HP_WARNING_THRESHOLD;

  if (!isHighAmount && !isHpDanger) {
    return base;
  }

  return {
    ...base,
    shouldShow: true,
  };
};

// 💸 지출 처리 (Hit) + 수호자 + Luna Shield
export const applySpend = (
  state: UserState,
  amount: number,
  isFixedCost: boolean
): { newState: UserState; message: string } => {
  const today = getTodayString();

  const prevBudgetCurrent = state.budget.current;
  const nextBudgetCurrent = Math.max(0, prevBudgetCurrent - amount);

  let newState: UserState = {
    ...state,
    budget: {
      ...state.budget,
      current: nextBudgetCurrent,
    },
  };

  let message = '';

  // 1) 수호자 패시브 체크
  const isGuardedByClass = checkGuardianShield(state, amount);
  if (isGuardedByClass) {
    message = `🛡️ [수호자] ${amount.toLocaleString()}원 지출을 방어했습니다. (스트릭 유지)`;
    // 수호자 방어 시 noSpendStreak는 유지, Junk 없음
    return { newState, message };
  }

  // 2) PMS 기간 Luna Shield 자동 방어 (월 3회까지)
  const currentMode = getLunaMode(today, state.luna.nextPeriodDate);
  const canUseLunaShield =
    currentMode === 'PMS' &&
    state.counters.lunaShieldsUsedThisMonth < GAME_CONSTANTS.LUNA_SHIELD_MONTHLY_LIMIT;

  if (canUseLunaShield) {
    newState = {
      ...newState,
      counters: {
        ...newState.counters,
        lunaShieldsUsedThisMonth: newState.counters.lunaShieldsUsedThisMonth + 1,
      },
    };

    message = `🌙 [Luna Shield]가 발동하여 ${amount.toLocaleString()}원 지출을 한 번 막아주었습니다. (스트릭 유지)`;
    return { newState, message };
  }

  // 3) 실제 피격 처리
  // 무지출 스트릭 리셋
  newState = {
    ...newState,
    counters: {
      ...newState.counters,
      noSpendStreak: 0,
    },
  };

  // Junk 획득 로직
  if (
    !isFixedCost &&
    amount >= GAME_CONSTANTS.JUNK_THRESHOLD &&
    newState.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT
  ) {
    newState = {
      ...newState,
      inventory: {
        ...newState.inventory,
        junk: newState.inventory.junk + 1,
      },
      counters: {
        ...newState.counters,
        junkObtainedToday: newState.counters.junkObtainedToday + 1,
      },
      // 자산: 비고정비 Hit → 창고에 적재한다고 가정
      assets: {
        ...newState.assets,
        warehouse: newState.assets.warehouse + 1,
      },
    };

    message = `💥 피격(Hit)! Junk 1개를 획득했습니다.`;
  } else {
    message = `💥 피격(Hit)! 예산이 차감되었습니다.`;
  }

  // 자산: 고정비는 "저택" 쌓기는 느낌으로
  if (isFixedCost) {
    newState = {
      ...newState,
      assets: {
        ...newState.assets,
        mansion: newState.assets.mansion + 1,
      },
    };
  }

  return { newState, message };
};

// 🛡 No-Spend 방어 버튼
export const applyDefense = (state: UserState): UserState => {
  if (state.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) {
    return state;
  }

  const newMp = clamp(
    state.runtime.mp + GAME_CONSTANTS.MP_RECOVERY_DEFENSE,
    0,
    GAME_CONSTANTS.MAX_MP
  );

  return {
    ...state,
    runtime: {
      ...state.runtime,
      mp: newMp,
    },
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1,
    },
    // 자산: 방어 행동 → 요새 강화 느낌
    assets: {
      ...state.assets,
      fortress: state.assets.fortress + 1,
    },
  };
};

// 🌙 오늘 마감하기
export const applyDayEnd = (
  state: UserState
): { newState: UserState; message: string } => {
  const today = getTodayString();

  if (state.counters.lastDayEndDate === today) {
    return {
      newState: state,
      message: '이미 오늘을 마감했습니다.',
    };
  }

  const hadSpendToday = state.transactions.some((tx) => tx.date === today);

  let newState: UserState = {
    ...state,
    counters: {
      ...state.counters,
      lastDayEndDate: today,
    },
  };

  if (!hadSpendToday) {
    // 무지출 Day → Salt +1, 스트릭 +1
    const nextSalt =
      newState.inventory.salt + GAME_CONSTANTS.SALT_REWARD_PER_NOSPEND_DAY;
    const nextStreak = newState.counters.noSpendStreak + 1;

    newState = {
      ...newState,
      inventory: {
        ...newState.inventory,
        salt: nextSalt,
      },
      counters: {
        ...newState.counters,
        noSpendStreak: nextStreak,
      },
      // 자산: 무지출 일수 → 비행장(기동성 확보) 카운트
      assets: {
        ...newState.assets,
        airfield: newState.assets.airfield + 1,
      },
    };

    return {
      newState,
      message: `무지출 DAY 완료. Salt +1, 무지출 스트릭 ${nextStreak}일차.`,
    };
  }

  return {
    newState,
    message: '오늘을 마감했습니다. (무지출 Day는 아니었습니다.)',
  };
};

// 🔄 정화 (Purify): Junk + Salt + MP → Material (pureEssence)
export const applyPurify = (
  state: UserState
): { newState: UserState; message: string } => {
  if (
    state.inventory.junk <= 0 ||
    state.inventory.salt <= 0 ||
    state.runtime.mp <= 0
  ) {
    return {
      newState: state,
      message: '정화 조건이 충족되지 않습니다. (Junk, Salt, MP를 확인하세요.)',
    };
  }

  const currentEssence = state.inventory.materials['pureEssence'] ?? 0;

  const newState: UserState = {
    ...state,
    inventory: {
      ...state.inventory,
      junk: state.inventory.junk - 1,
      salt: state.inventory.salt - 1,
      materials: {
        ...state.inventory.materials,
        pureEssence: currentEssence + 1,
      },
    },
    runtime: {
      ...state.runtime,
      mp: state.runtime.mp - 1,
    },
    // 자산: 정화 루프 → 마법탑 카운트 증가
    assets: {
      ...state.assets,
      tower: state.assets.tower + 1,
    },
  };

  return {
    newState,
    message: '정화 완료. pureEssence 1개를 획득했습니다.',
  };
};

// ⚒ 장비 제작: pureEssence → 잔잔한 장부검
export const applyCraftEquipment = (
  state: UserState
): { newState: UserState; message: string } => {
  const cost = GAME_CONSTANTS.EQUIPMENT_COST_PURE_ESSENCE;
  const currentEssence = state.inventory.materials['pureEssence'] ?? 0;

  if (currentEssence < cost) {
    return {
      newState: state,
      message: `장비 제작에 필요한 pureEssence가 부족합니다. (필요: ${cost}개)`,
    };
  }

  const newEssence = currentEssence - cost;

  const newState: UserState = {
    ...state,
    inventory: {
      ...state.inventory,
      materials: {
        ...state.inventory.materials,
        pureEssence: newEssence,
      },
      equipment: [...state.inventory.equipment, '잔잔한 장부검'],
    },
    // 자산: 장비 제작 → 창고 강화
    assets: {
      ...state.assets,
      warehouse: state.assets.warehouse + 1,
    },
  };

  return {
    newState,
    message: `⚒ 장비 제작 완료! '잔잔한 장부검'을 획득했습니다.`,
  };
};

// 🏰 자산의 왕국 뷰 생성
export const getAssetBuildingsView = (state: UserState): AssetBuildingView[] => {
  const src = state.assets;

  const calcLevel = (count: number): { level: number; nextTarget: number | null } => {
    if (count >= 100) return { level: 4, nextTarget: null };
    if (count >= 30) return { level: 3, nextTarget: 100 };
    if (count >= 10) return { level: 2, nextTarget: 30 };
    return { level: 1, nextTarget: 10 };
  };

  const defs: { id: keyof typeof src; label: string }[] = [
    { id: 'fortress',  label: '요새' },
    { id: 'airfield',  label: '비행장' },
    { id: 'mansion',   label: '저택' },
    { id: 'tower',     label: '마법탑' },
    { id: 'warehouse', label: '창고' },
  ];

  return defs.map(({ id, label }) => {
    const count = src[id];
    const { level, nextTarget } = calcLevel(count);
    return {
      id,
      label,
      count,
      level,
      nextTarget,
    };
  });
};

// 🎭 직업 변경 (전직)
export const changeClass = (
  state: UserState,
  classType: ClassType
): { newState: UserState; message: string } => {
  if (state.profile.classType === classType) {
    return {
      newState: state,
      message: '이미 선택된 직업입니다.',
    };
  }

  const newState: UserState = {
    ...state,
    profile: {
      ...state.profile,
      classType,
      level: 1,
    },
  };

  const label =
    classType === CLASS_TYPES.GUARDIAN
      ? '수호자'
      : classType === CLASS_TYPES.SAGE
      ? '현자'
      : classType === CLASS_TYPES.ALCHEMIST
      ? '연금술사'
      : classType === CLASS_TYPES.DRUID
      ? '드루이드'
      : '모험가';

  return {
    newState,
    message: `직업이 [${label}]로 변경되었습니다. 레벨이 1로 초기화됩니다.`,
  };
};
