import { UserState, CollectionItem } from './types';
import { GAME_CONSTANTS, COLLECTION_DB, CLASS_TYPES, ClassType } from './constants';
import { checkGuardianShield, getDruidRecoveryBonus } from './moneyClassLogic';
import { getLunaMode } from './moneyLuna';


/**
 * 🔄 월말 정산 (Month End)
 * - 현재 상태를 History에 저장
 * - Junk를 매각하여 다음 달 시드머니(예산 보너스)로 전환
 * - 레벨/HP/일일카운터 초기화 (자산/인벤토리/직업은 유지)
 */
export const applyMonthEnd = (state: UserState): { newState: UserState, message: string } => {
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`; // "2025-12"

  // 1. 등급 산정 (임시 로직)
  const hp = getHp(state.budget.current, state.budget.total);
  let grade = 'C';
  if (hp > 80) grade = 'S';
  else if (hp > 50) grade = 'A';
  else if (hp > 20) grade = 'B';

  // 2. Junk 매각 (1개당 100원 보너스 예산)
  const junkCount = state.inventory.junk;
  const bonusBudget = junkCount * 100; 

  // 3. 기록 생성
  const record: MonthRecord = {
    id: monthKey,
    grade,
    totalSpent: state.budget.total - state.budget.current,
    finalHp: hp,
    savedJunk: junkCount,
    mvpAsset: '요새', // (추후 로직 고도화 필요)
  };

  // 4. 다음 달 상태 생성 (Reset & Inherit)
  const newState: UserState = {
    ...state,
    budget: {
      ...state.budget,
      current: state.budget.total + bonusBudget, // 예산 리필 + 보너스
      startDate: getTodayString(),
    },
    // HP, MP 등 런타임 스탯 초기화
    runtime: { mp: GAME_CONSTANTS.MAX_MP },
    counters: {
      ...state.counters,
      defenseActionsToday: 0,
      junkObtainedToday: 0,
      dailyTotalSpend: 0,
      hadSpendingToday: false,
      isDayEnded: false,
      lunaShieldsUsedThisMonth: 0, // 월간 카운터 리셋
    },
    // 인벤토리: Junk는 매각되어 0됨, 나머지는 유지
    inventory: {
      ...state.inventory,
      junk: 0, 
    },
    // 기록 저장
    history: [...(state.history || []), record],
  };

  return {
    newState,
    message: `📅 ${monthKey} 정산 완료!\n등급: ${grade}\nJunk ${junkCount}개를 매각하여 예산 +${bonusBudget}원 추가됨.`
  };
};
// ------------------------------------------------------------------
// [SECTION 1] 유틸리티 및 판정 함수 (Helpers)
// ------------------------------------------------------------------

const getTodayString = () => new Date().toISOString().split('T')[0];

/**
 * HP 계산 (0 ~ 100, 예산 기반)
 */
export const getHp = (current: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (current / total) * 100;
  return Math.max(0, Math.min(100, Math.floor(percentage)));
};

/**
 * 🚨 가드 프롬프트(경고) 노출 여부 판단
 * 조건: 1일 1회 미노출, 비고정비, 고액(1만↑) or HP위험(30%↓)
 */
export const shouldShowGuardPrompt = (state: UserState, amount: number, isFixedCost: boolean): boolean => {
  if (state.counters.guardPromptShownToday) return false;
  if (isFixedCost) return false;

  const currentHp = getHp(state.budget.current, state.budget.total);
  const nextHp = getHp(state.budget.current - amount, state.budget.total);
  
  const isHighAmount = amount >= GAME_CONSTANTS.GUARD_PROMPT_MIN_AMOUNT;
  const isCriticalHit = currentHp > GAME_CONSTANTS.HP_WARNING_THRESHOLD && nextHp <= GAME_CONSTANTS.HP_WARNING_THRESHOLD;

  return isHighAmount || isCriticalHit;
};

/**
 * 가드 프롬프트 확인 처리 (플래그 true 설정)
 */
export const markGuardPromptShown = (state: UserState): UserState => {
  return {
    ...state,
    counters: { ...state.counters, guardPromptShownToday: true }
  };
};

/**
 * [HELPER] 도감 추가 함수 (중복 체크 후 추가)
 */
const addCollectionItem = (
  inventory: any, 
  itemData: { id: string, name: string, desc: string }, 
  category: 'JUNK' | 'BADGE'
) => {
  const exists = inventory.collection.some((item: CollectionItem) => item.id === itemData.id);
  if (!exists) {
    inventory.collection.push({
      id: itemData.id,
      name: itemData.name,
      description: itemData.desc,
      obtainedAt: new Date().toISOString(),
      category,
    });
    return true; 
  }
  return false; 
};

// ------------------------------------------------------------------
// [SECTION 2] 코어 루프 (Core Logic: Reset, Spend, Guard)
// ------------------------------------------------------------------

/**
 * 1. 앱 접속 / 날짜 변경 시 리셋
 */
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();
  if (state.counters.lastDailyResetDate === today) return state;

  const currentMode = getLunaMode(today, state.luna.nextPeriodDate);
  const druidBonus = getDruidRecoveryBonus(state, currentMode);
  const newMp = Math.min(GAME_CONSTANTS.MAX_MP, state.runtime.mp + druidBonus);

  // 접속 보상: Natural Dust (Junk) 지급 로직은 applyDayEnd나 별도 보상 함수에서 처리하지만,
  // 여기서는 단순히 카운터 리셋에 집중합니다.
  
  return {
    ...state,
    runtime: { ...state.runtime, mp: newMp },
    counters: {
      ...state.counters,
      defenseActionsToday: 0,
      junkObtainedToday: 0,
      guardPromptShownToday: false,
      dailyTotalSpend: 0,
      lastDailyResetDate: today,
      hadSpendingToday: false, 
    },
  };
};

/**
 * 2. 지출(Hit) 처리
 * - 예산 차감, 수호자 체크, Junk/도감 획득
 */
export const applySpend = (
  state: UserState,
  amount: number,
  isFixedCost: boolean
): { newState: UserState; message: string } => {
  const newState: UserState = {
    ...state,
    budget: { ...state.budget },
    counters: { ...state.counters },
    inventory: { ...state.inventory, collection: [...state.inventory.collection] },
    // 자산 업데이트 준비
    assets: { ...state.assets } 
  };

  let message = '';

  // 예산 및 누적 지출 처리
  newState.budget.current -= amount;
  newState.counters.hadSpendingToday = true;
  newState.counters.dailyTotalSpend = (newState.counters.dailyTotalSpend || 0) + amount;

  // 수호자 패시브
  const isGuarded = checkGuardianShield(state, amount);

  if (isGuarded) {
    message = `🛡️ [수호자] ${amount.toLocaleString()}원 지출을 방어했습니다! (콤보 유지)`;
  } else {
    newState.counters.noSpendStreak = 0; // 콤보 리셋

    // Junk 획득 로직
    if (!isFixedCost && amount >= GAME_CONSTANTS.JUNK_THRESHOLD && newState.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT) {
      newState.inventory.junk += 1;
      newState.counters.junkObtainedToday += 1;
      
      // [자산] 창고(Warehouse) 경험치 증가 (물건이 쌓임)
      newState.assets.warehouse += 1;

      message = `💥 피격! Junk 1개 획득.`;

      // [도감] 랜덤 정크 발견
      if (Math.random() < 0.5) {
        const randomJunk = COLLECTION_DB.JUNK_FOREST[Math.floor(Math.random() * COLLECTION_DB.JUNK_FOREST.length)];
        const isNew = addCollectionItem(newState.inventory, randomJunk, 'JUNK');
        if (isNew) message += ` (✨도감: ${randomJunk.name})`;
      }
      addCollectionItem(newState.inventory, COLLECTION_DB.BADGES.FIRST_JUNK, 'BADGE');
    } else {
      message = `💥 피격! 예산이 차감되었습니다.`;
    }
  }

  // [자산] 고정비 지출 시 저택(Mansion) 경험치 증가
  if (isFixedCost) {
    newState.assets.mansion += 1;
  }

  return { newState, message };
};

/**
 * 3. 방어(Guard) 행동
 */
export const applyDefense = (state: UserState): UserState => {
  if (state.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) return state;

  const newMp = Math.min(GAME_CONSTANTS.MAX_MP, state.runtime.mp + GAME_CONSTANTS.MP_RECOVERY_DEFENSE);
  
  return {
    ...state,
    runtime: { ...state.runtime, mp: newMp },
    counters: { ...state.counters, defenseActionsToday: state.counters.defenseActionsToday + 1 },
    // [자산] 방어 시 요새(Fortress) 경험치 증가
    assets: { ...state.assets, fortress: state.assets.fortress + 1 }
  };
};

/**
 * 4. 정화(Purify)
 */
export const applyPurify = (state: UserState): { newState: UserState, message: string } => {
  const { PURIFY_COST_MP, PURIFY_COST_JUNK, PURIFY_COST_SALT, PURIFY_OUTPUT_MATERIAL } = GAME_CONSTANTS;
  const outputMaterialKey = Object.keys(PURIFY_OUTPUT_MATERIAL)[0] as keyof typeof PURIFY_OUTPUT_MATERIAL;
  const amount = PURIFY_OUTPUT_MATERIAL[outputMaterialKey];

  if (state.runtime.mp < PURIFY_COST_MP || state.inventory.junk < PURIFY_COST_JUNK || state.inventory.salt < PURIFY_COST_SALT) {
    return { newState: state, message: '자원(MP/Junk/Salt)이 부족합니다.' };
  }

  const newState = { ...state, assets: { ...state.assets } }; // Deep copy needed for assets
  newState.runtime.mp -= PURIFY_COST_MP;
  newState.inventory.junk -= PURIFY_COST_JUNK;
  newState.inventory.salt -= PURIFY_COST_SALT;
  newState.inventory.materials[outputMaterialKey] = (newState.inventory.materials[outputMaterialKey] || 0) + amount;
  
  // [자산] 정화 시 마법탑(Tower) 경험치 증가
  newState.assets.tower += 1;

  return { newState, message: `✨ 정화 성공! ${outputMaterialKey} +${amount}` };
};

/**
 * 5. 하루 마감(DayEnd)
 */
export const applyDayEnd = (state: UserState, today: string): { newState: UserState; message: string } => {
  if (state.counters.lastDayEndDate === today) {
    return { newState: state, message: '오늘은 이미 마감 처리되었습니다.' };
  }

  const newState: UserState = {
    ...state,
    counters: { ...state.counters },
    inventory: { ...state.inventory, collection: [...state.inventory.collection] },
    assets: { ...state.assets }
  };

  const logs: string[] = [];

  // Natural Dust 지급
  newState.inventory.junk += 1;
  logs.push('🧹 Natural Dust +1');

  // 무지출 보상
  if (!state.counters.hadSpendingToday) {
    const newStreak = state.counters.noSpendStreak + 1;
    newState.counters.noSpendStreak = newStreak;
    newState.inventory.salt = (state.inventory.salt ?? 0) + 1;
    
    // [자산] 무지출 시 비행장(Airfield) 경험치 증가
    newState.assets.airfield += 1;
    
    logs.push(`✨ Salt +1, 콤보 ${newStreak}일`);

    // [도감] 배지 획득
    if (newStreak === 3) {
      if (addCollectionItem(newState.inventory, COLLECTION_DB.BADGES.NO_SPEND_3, 'BADGE')) logs.push(`🏅 [작은 인내] 획득`);
    }
    if (newStreak === 7) {
      if (addCollectionItem(newState.inventory, COLLECTION_DB.BADGES.NO_SPEND_7, 'BADGE')) logs.push(`🏅 [절제의 미학] 획득`);
    }
  } else {
    logs.push('지출 발생: 무지출 보상 없음.');
  }

  newState.counters.lastDayEndDate = today;
  newState.counters.hadSpendingToday = false; 

  return { newState, message: logs.join(' ') };
};

// ------------------------------------------------------------------
// [SECTION 3] 심화 기능 (Advanced: Crafting, Assets, Class)
// ------------------------------------------------------------------

/**
 * 6. 장비 제작 (Craft Equipment)
 */
export const applyCraftEquipment = (state: UserState): { newState: UserState; message: string } => {
  const cost = GAME_CONSTANTS.EQUIPMENT_COST_PURE_ESSENCE;
  const currentEssence = state.inventory.materials['PURE_ESSENCE'] ?? 0;

  if (currentEssence < cost) {
    return { newState: state, message: `재료 부족 (Pure Essence ${cost}개 필요)` };
  }

  const newState = {
    ...state,
    inventory: {
      ...state.inventory,
      materials: { ...state.inventory.materials, PURE_ESSENCE: currentEssence - cost },
      equipment: [...state.inventory.equipment, '잔잔한 장부검']
    },
    assets: { ...state.assets, warehouse: state.assets.warehouse + 5 } // 제작은 큰 경험치
  };

  return { newState, message: `⚒ 장비 제작 완료! '잔잔한 장부검'을 획득했습니다.` };
};

/**
 * 7. 자산 건물 뷰 데이터 생성 (View Helper)
 */
export const getAssetBuildingsView = (state: UserState) => {
  const src = state.assets;
  
  // 레벨 계산 로직 (임시: 0->10->30->100)
  const calcLevel = (count: number) => {
    if (count >= 100) return { level: 4, nextTarget: null };
    if (count >= 30) return { level: 3, nextTarget: 100 };
    if (count >= 10) return { level: 2, nextTarget: 30 };
    return { level: 1, nextTarget: 10 };
  };

  const defs: { id: keyof typeof src; label: string }[] = [
    { id: 'fortress',  label: '요새 (방어)' },
    { id: 'airfield',  label: '비행장 (무지출)' },
    { id: 'mansion',   label: '저택 (고정비)' },
    { id: 'tower',     label: '마법탑 (정화)' },
    { id: 'warehouse', label: '창고 (파밍)' },
  ];

  return defs.map(({ id, label }) => {
    const count = src[id];
    const { level, nextTarget } = calcLevel(count);
    return { id, label, count, level, nextTarget };
  });
};

/**
 * 8. 직업 변경 (Class Change)
 */
export const changeClass = (state: UserState, classType: ClassType): { newState: UserState; message: string } => {
  if (state.profile.classType === classType) {
    return { newState: state, message: '이미 해당 직업입니다.' };
  }

  const newState: UserState = {
    ...state,
    profile: { ...state.profile, classType, level: 1 } // 전직 시 레벨 1 초기화
  };

  return { newState, message: `직업이 변경되었습니다. 레벨이 초기화됩니다.` };
};
