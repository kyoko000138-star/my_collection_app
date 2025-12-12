// src/pages/MoneyRoomPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { MoneySummaryView } from '../money/components/MoneySummaryView';

// Data & Logic
import { UserState, Scene, PendingTransaction } from '../money/types';
import { CLASS_TYPES } from '../money/constants';
import {
  checkDailyReset,
  applySpend,
  applyDefense,
  applyDayEnd,
  applyPurify,
  applyCraftEquipment,
  getAssetBuildingsView,
  getDailyMonster,
} from '../money/moneyGameLogic';
import { calculateLunaPhase, getLunaTheme } from '../money/moneyLuna';

// ✅ Healthy Logic
import { applyRepayment, applySavings } from '../money/moneyHealthyLogic';

// Views
import { VillageView } from '../money/components/VillageView';
import { WorldMapView } from '../money/components/WorldMapView';
import { BattleView } from '../money/components/BattleView';

// Modals
import { InventoryModal } from '../money/components/InventoryModal';
import { KingdomModal } from '../money/components/KingdomModal';
import { CollectionModal } from '../money/components/CollectionModal';
import { OnboardingModal } from '../money/components/OnboardingModal';
import DailyLogModal from '../money/components/DailyLogModal';

const STORAGE_KEY = 'money-room-save-v5-full';

type ActionMode = 'SPEND' | 'REPAY' | 'SAVE';

// --- KST Helpers (머니룸 로직과 날짜 기준 통일) ---
const getTodayStringKST = () => {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
};
const getNowISOStringKST = () => {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString();
};

const INITIAL_STATE: UserState = {
  name: 'Player 1',
  level: 1,
  jobTitle: CLASS_TYPES.GUARDIAN,

  currentBudget: 0,
  maxBudget: 0,
  mp: 30,
  maxMp: 30,

  junk: 0,
  salt: 0,

  lunaCycle: { startDate: '', periodLength: 5, cycleLength: 28 },

  inventory: [],
  collection: [],
  pending: [],

  materials: {},
  assets: { fortress: 0, airfield: 0, mansion: 0, tower: 0, warehouse: 0 },

  counters: {
    defenseActionsToday: 0,
    junkObtainedToday: 0,
    noSpendStreak: 0,
    dailyTotalSpend: 0,
    guardPromptShownToday: false,
    hadSpendingToday: false,
  },

  // ✅ [NEW] 구버전 세이브에서도 안전하게 머지되도록 기본값 포함
  garden: {
    treeLevel: 1,
    pondLevel: 1,
    flowerState: 'normal',
    weedCount: 0,
  },
};

const MoneyRoomPage: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return INITIAL_STATE;

      const parsed = JSON.parse(saved) as Partial<UserState>;

      // ✅ 딥 머지(구버전 세이브에 garden/counters 일부 없으면 터지던 문제 방지)
      return {
        ...INITIAL_STATE,
        ...parsed,
        lunaCycle: { ...INITIAL_STATE.lunaCycle, ...(parsed.lunaCycle || {}) },
        assets: { ...INITIAL_STATE.assets, ...(parsed.assets || {}) },
        counters: { ...INITIAL_STATE.counters, ...(parsed.counters || {}) },
        materials: { ...INITIAL_STATE.materials, ...(parsed.materials || {}) },
        garden: { ...INITIAL_STATE.garden, ...((parsed as any).garden || {}) },
        inventory: parsed.inventory ?? INITIAL_STATE.inventory,
        collection: parsed.collection ?? INITIAL_STATE.collection,
        pending: parsed.pending ?? INITIAL_STATE.pending,
      };
    } catch {
      return INITIAL_STATE;
    }
  });

  const [scene, setScene] = useState<Scene>(Scene.VILLAGE);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');

  // 🔁 게임 / 요약 뷰 전환
  const [viewMode, setViewMode] = useState<'GAME' | 'SUMMARY'>('GAME');

  // ✅ 상단 모드(일반지출/상환/저축)
  const [actionMode, setActionMode] = useState<ActionMode>('SPEND');

  // 하루 마감 모달
  const [showDailyLog, setShowDailyLog] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    setGameState((prev) => checkDailyReset(prev));
  }, []);

  // --- Derived ---
  const todayStr = getTodayStringKST();
  const lunaPhase = useMemo(() => calculateLunaPhase(gameState.lunaCycle), [gameState.lunaCycle]);
  const theme = useMemo(() => getLunaTheme(lunaPhase), [lunaPhase]);

  const isNewUser = gameState.maxBudget === 0;

  const hpPercent =
    gameState.maxBudget > 0
      ? Math.round((gameState.currentBudget / gameState.maxBudget) * 100)
      : 0;

  const battleDungeonId =
    actionMode === 'SPEND'
      ? (activeDungeon !== 'etc' ? activeDungeon : getDailyMonster(gameState.pending))
      : 'etc';

  // --- Helpers ---
  const pushPending = (st: UserState, amount: number, note: string) => {
    const tx: PendingTransaction = {
      id: Date.now().toString(),
      amount,
      note,
      createdAt: getNowISOStringKST(),
    };
    st.pending = [tx, ...st.pending].slice(0, 50);
  };

  // ✅ 상환/저축은 “지출 한도/무지출 스트릭”을 깨지 않게(건강한 도파민)
  const applyNonSpendOutflow = (state: UserState, amount: number, note: string): UserState => {
    const next = JSON.parse(JSON.stringify(state)) as UserState;
    next.currentBudget -= amount; // 현실 반영: 예산(HP)은 줄어듦
    // hadSpendingToday / dailyTotalSpend는 건드리지 않음
    pushPending(next, amount, note);
    return next;
  };

  const handleChangeScene = (nextScene: Scene) => {
    // ✅ 상환/저축 모드일 때는 월드맵 스킵 → 바로 입력(배틀)로
    if (nextScene === Scene.WORLD_MAP && actionMode !== 'SPEND') {
      setActiveDungeon('etc');
      setScene(Scene.BATTLE);
      return;
    }
    setScene(nextScene);
  };

  // --- Handlers ---
  const handleSpend = (amount: number) => {
    if (!amount || amount <= 0) return;

    // 1) 일반 지출
    if (actionMode === 'SPEND') {
      const { newState, message } = applySpend(gameState, amount, false, activeDungeon);
      setGameState(newState);
      setTimeout(() => {
        alert(message);
        setScene(Scene.VILLAGE);
      }, 100);
      return;
    }

    // 2) 대출/할부 상환
    if (actionMode === 'REPAY') {
      const outflowed = applyNonSpendOutflow(gameState, amount, `🧾 대출/할부 상환`);
      const { newState, msg } = applyRepayment(outflowed, amount);
      setGameState(newState);
      setTimeout(() => {
        alert(msg);
        setScene(Scene.VILLAGE);
      }, 100);
      return;
    }

    // 3) 저축/이체
    if (actionMode === 'SAVE') {
      const outflowed = applyNonSpendOutflow(gameState, amount, `💰 저축/이체`);
      const { newState, msg } = applySavings(outflowed, amount);
      setGameState(newState);
      setTimeout(() => {
        alert(msg);
        setScene(Scene.VILLAGE);
      }, 100);
      return;
    }
  };

  const handleGuard = () => {
    const next = applyDefense(gameState);
    setGameState(next);
    setTimeout(() => {
      alert('🛡️ 방어 성공! 의지력(MP)을 회복했습니다.');
      setScene(Scene.VILLAGE);
    }, 100);
  };

  // 🛏 하루 마감 (여관에서 쉬기)
  const handleDayEnd = () => {
    const { newState } = applyDayEnd(gameState);
    setGameState(newState);
    setShowDailyLog(true);
  };

  // 디버그 리셋
  const handleReset = () => {
    if (
      window.confirm(
        '머니룸 데이터를 모두 초기화할까요?\n(예산/자산/도감 기록이 모두 지워집니다)',
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleOnboarding = (data: any) => {
    setGameState((prev) => ({
      ...prev,
      name: data.profile.name,
      jobTitle: data.profile.classType,
      maxBudget: data.budget.total,
      currentBudget: data.budget.current,
      lunaCycle: {
        ...prev.lunaCycle,
        startDate: data.luna.nextPeriodDate || todayStr,
      },
      garden: prev.garden || INITIAL_STATE.garden,
    }));
  };

  // --- Render ---
  return (
    <div style={{ ...styles.appContainer, backgroundColor: theme.bg }}>
      {/* 🎮 게임 / 📊 요약 토글 */}
      <div style={styles.viewToggle}>
        <button
          type="button"
          onClick={() => setViewMode('GAME')}
          style={{
            ...styles.viewToggleBtn,
            backgroundColor: viewMode === 'GAME' ? '#0f172a' : 'rgba(15,23,42,0.6)',
          }}
        >
          🎮 게임
        </button>
        <button
          type="button"
          onClick={() => setViewMode('SUMMARY')}
          style={{
            ...styles.viewToggleBtn,
            backgroundColor: viewMode === 'SUMMARY' ? '#0f172a' : 'rgba(15,23,42,0.6)',
          }}
        >
          📊 요약
        </button>
      </div>

      {/* ✅ 모드 바(레이아웃: 가운데 + 작은 칩) */}
      {viewMode === 'GAME' && (
        <div style={styles.modeBar}>
          <div style={styles.modeBarInner}>
            <button
              type="button"
              onClick={() => setActionMode('SPEND')}
              style={{
                ...styles.modeChip,
                ...(actionMode === 'SPEND' ? styles.modeChipActive : {}),
              }}
            >
              🍊 지출
            </button>
            <button
              type="button"
              onClick={() => setActionMode('REPAY')}
              style={{
                ...styles.modeChip,
                ...(actionMode === 'REPAY' ? styles.modeChipActive : {}),
              }}
            >
              🧾 상환
            </button>
            <button
              type="button"
              onClick={() => setActionMode('SAVE')}
              style={{
                ...styles.modeChip,
                ...(actionMode === 'SAVE' ? styles.modeChipActive : {}),
              }}
            >
              💰 저축
            </button>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      {viewMode === 'SUMMARY' ? (
        <MoneySummaryView user={gameState} onBackToGame={() => setViewMode('GAME')} />
      ) : (
        <>
          {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

          {scene === Scene.VILLAGE && (
            <VillageView
              user={gameState}
              onChangeScene={handleChangeScene} // ✅ wrapper
              onDayEnd={handleDayEnd}
            />
          )}

          {scene === Scene.WORLD_MAP && (
            <WorldMapView
              onSelectDungeon={(id) => {
                setActiveDungeon(id);
                setScene(Scene.BATTLE);
              }}
              onBack={() => setScene(Scene.VILLAGE)}
            />
          )}

          {scene === Scene.BATTLE && (
            <BattleView
              dungeonId={battleDungeonId}
              playerHp={gameState.currentBudget}
              maxHp={gameState.maxBudget}
              onSpend={handleSpend}
              onGuard={handleGuard}
              onRun={() => setScene(actionMode === 'SPEND' ? Scene.WORLD_MAP : Scene.VILLAGE)}
            />
          )}

          {/* 인벤토리 / 정원(자산) / 도감 모달 */}
          <InventoryModal
            open={scene === Scene.INVENTORY}
            onClose={() => setScene(Scene.VILLAGE)}
            junk={gameState.junk}
            salt={gameState.salt}
            materials={gameState.materials}
            equipment={gameState.inventory.map((i) => i.name)}
            collection={gameState.collection}
            canPurify={gameState.mp > 0}
            onPurify={() => {
              const { newState, message } = applyPurify(gameState);
              setGameState(newState);
              alert(message);
            }}
            onCraft={() => {
              const { newState, message } = applyCraftEquipment(gameState);
              setGameState(newState);
              alert(message);
            }}
          />

          <KingdomModal
            open={scene === Scene.KINGDOM}
            onClose={() => setScene(Scene.VILLAGE)}
            buildings={getAssetBuildingsView(gameState)}
          />

          <CollectionModal
            open={scene === Scene.COLLECTION}
            onClose={() => setScene(Scene.VILLAGE)}
            collection={gameState.collection}
          />
        </>
      )}

      {/* 하루 마감 리포트 */}
      <DailyLogModal
        open={showDailyLog}
        onClose={() => setShowDailyLog(false)}
        today={todayStr}
        hp={hpPercent}
        mp={gameState.mp}
        def={gameState.counters.defenseActionsToday}
        junkToday={gameState.counters.junkObtainedToday}
        defenseActionsToday={gameState.counters.defenseActionsToday}
        noSpendStreak={gameState.counters.noSpendStreak}
        pending={gameState.pending}
      />

      {/* 디버그 Reset */}
      <div style={styles.debugArea}>
        <button type="button" onClick={handleReset}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    maxWidth: '420px',
    margin: '0 auto',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: '"NeoDungGeunMo", monospace',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 1s ease',
  },

  viewToggle: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 60,
    display: 'flex',
    gap: 4,
  },
  viewToggleBtn: {
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid rgba(148,163,184,0.35)',
    fontSize: 11,
    color: '#e5e7eb',
    cursor: 'pointer',
    backgroundColor: 'rgba(2,6,23,0.75)',
    backdropFilter: 'blur(6px)',
  },

  // ✅ 모드 바: “가운데 + 작은 칩” (좌/우 HUD와 덜 싸우게)
  modeBar: {
    position: 'absolute',
    top: 44, // VillageView 좌/우 HUD(상단) 피해서 살짝 아래
    left: 0,
    right: 0,
    zIndex: 55,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  modeBarInner: {
    pointerEvents: 'auto',
    display: 'flex',
    gap: 6,
    padding: '4px 6px',
    borderRadius: 999,
    background: 'rgba(2,6,23,0.50)',
    border: '1px solid rgba(148,163,184,0.25)',
    backdropFilter: 'blur(6px)',
    maxWidth: 260,
  },
  modeChip: {
    border: '1px solid rgba(148,163,184,0.25)',
    background: 'rgba(15,23,42,0.35)',
    color: '#e5e7eb',
    borderRadius: 999,
    padding: '4px 8px',
    fontSize: 11,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  modeChipActive: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.18)',
  },

  debugArea: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    opacity: 0.4,
    fontSize: 10,
    zIndex: 80,
  },
};

export default MoneyRoomPage;
