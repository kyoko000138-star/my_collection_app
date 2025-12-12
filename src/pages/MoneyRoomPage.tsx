// src/pages/MoneyRoomPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { MoneySummaryView } from '../money/components/MoneySummaryView';

// Data & Logic
import { UserState, Scene } from '../money/types';
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

type SpendMode = 'NORMAL' | 'REPAY' | 'SAVE';

// ✅ 구버전 세이브에도 garden이 없으면 런타임에서 터져서, 안전하게 채워줌
const ensureGarden = (s: any) => {
  if (!s.garden) {
    s.garden = { treeLevel: 1, pondLevel: 1, flowerState: 'normal', weedCount: 0 };
  }
  return s;
};

const INITIAL_STATE: UserState = ({
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
    lastDailyResetDate: undefined as any,
    lastDayEndDate: undefined as any,
  },
  // @ts-ignore
  garden: { treeLevel: 1, pondLevel: 1, flowerState: 'normal', weedCount: 0 },
  lastLoginDate: undefined,
} as any) as UserState;

const hydrateState = (savedRaw: any): UserState => {
  const base = JSON.parse(JSON.stringify(INITIAL_STATE)) as any;
  if (!savedRaw || typeof savedRaw !== 'object') return base;

  const merged: any = { ...base, ...savedRaw };
  merged.lunaCycle = { ...base.lunaCycle, ...(savedRaw.lunaCycle || {}) };
  merged.assets = { ...base.assets, ...(savedRaw.assets || {}) };
  merged.counters = { ...base.counters, ...(savedRaw.counters || {}) };
  merged.materials = { ...(base.materials || {}), ...(savedRaw.materials || {}) };

  merged.inventory = Array.isArray(savedRaw.inventory) ? savedRaw.inventory : base.inventory;
  merged.collection = Array.isArray(savedRaw.collection) ? savedRaw.collection : base.collection;
  merged.pending = Array.isArray(savedRaw.pending) ? savedRaw.pending : base.pending;

  ensureGarden(merged);
  return merged as UserState;
};

const MoneyRoomPage: React.FC = () => {
  // ✅ iOS Safari에서 100vh/100%가 흔들리는 문제 해결: 실제 픽셀 높이로 고정
  const [viewportH, setViewportH] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return window.innerHeight || 0;
  });

  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight || 0);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? hydrateState(JSON.parse(saved)) : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [scene, setScene] = useState<Scene>(Scene.VILLAGE);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');

  const [viewMode, setViewMode] = useState<'GAME' | 'SUMMARY'>('GAME');
  const [spendMode, setSpendMode] = useState<SpendMode>('NORMAL');

  const [showDailyLog, setShowDailyLog] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    setGameState((prev: any) => checkDailyReset(ensureGarden(prev)));
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const lunaPhase = useMemo(() => calculateLunaPhase(gameState.lunaCycle), [gameState.lunaCycle]);
  const theme = useMemo(() => getLunaTheme(lunaPhase), [lunaPhase]);
  const isNewUser = gameState.maxBudget === 0;

  const currentMonsterType =
    scene === Scene.BATTLE
      ? activeDungeon !== 'etc'
        ? activeDungeon
        : getDailyMonster(gameState.pending)
      : 'etc';

  const hpPercent =
    gameState.maxBudget > 0
      ? Math.round((gameState.currentBudget / gameState.maxBudget) * 100)
      : 0;

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(INITIAL_STATE);
    setScene(Scene.VILLAGE);
    setActiveDungeon('etc');
    setSpendMode('NORMAL');
    setViewMode('GAME');
    setShowDailyLog(false);
  };

  const handleSpend = (amount: number) => {
    if (!amount || amount <= 0) return;

    let next: any = ensureGarden(JSON.parse(JSON.stringify(gameState)));
    const msgs: string[] = [];

    // ✅ 상환/저축은 고정비처럼 처리해 Junk 드랍/파밍에서 분리
    const { newState: spentState, message } = applySpend(
      next,
      amount,
      spendMode !== 'NORMAL',
      activeDungeon,
    );
    next = ensureGarden(spentState);
    msgs.push(message);

    if (spendMode === 'REPAY') {
      const r = applyRepayment(next, amount);
      next = ensureGarden(r.newState);
      msgs.push(r.msg);
    } else if (spendMode === 'SAVE') {
      const s = applySavings(next, amount);
      next = ensureGarden(s.newState);
      msgs.push(s.msg);
    }

    setGameState(next);
    setTimeout(() => {
      alert(msgs.join('\n\n'));
      setScene(Scene.VILLAGE);
      setSpendMode('NORMAL');
    }, 100);
  };

  const handleGuard = () => {
    const next = applyDefense(gameState);
    setGameState(next);
    setTimeout(() => {
      alert('🛡️ 방어 성공! 의지력(MP)을 회복했습니다.');
      setScene(Scene.VILLAGE);
    }, 100);
  };

  const handleDayEnd = () => {
    const { newState } = applyDayEnd(gameState);
    setGameState(newState);
    setShowDailyLog(true);
  };

  const handleOnboarding = (data: any) => {
    setGameState((prev: any) => {
      const next = {
        ...prev,
        name: data.profile.name,
        jobTitle: data.profile.classType,
        maxBudget: data.budget.total,
        currentBudget: data.budget.current,
        lunaCycle: {
          ...prev.lunaCycle,
          startDate: data.luna.nextPeriodDate || todayStr,
        },
      };
      return ensureGarden(next);
    });
  };

  // ✅ 실제 적용되는 컨테이너 높이 (iOS 대응)
  const containerHeight = viewportH ? `${viewportH}px` : '100vh';

  return (
    <div style={{ ...styles.appContainer, backgroundColor: theme.bg, height: containerHeight }}>
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

      {/* ✅ 모드 칩: 중앙 정렬 + HUD랑 덜 겹치게 조금 아래 */}
      {viewMode === 'GAME' && (
        <div style={styles.modeBar}>
          <div style={styles.modeBarInner}>
            <button
              type="button"
              onClick={() => setSpendMode('NORMAL')}
              style={{
                ...styles.modeChip,
                ...(spendMode === 'NORMAL' ? styles.modeChipActive : {}),
              }}
            >
              🍊 지출
            </button>
            <button
              type="button"
              onClick={() => setSpendMode('REPAY')}
              style={{
                ...styles.modeChip,
                ...(spendMode === 'REPAY' ? styles.modeChipActive : {}),
              }}
            >
              🧾 상환
            </button>
            <button
              type="button"
              onClick={() => setSpendMode('SAVE')}
              style={{
                ...styles.modeChip,
                ...(spendMode === 'SAVE' ? styles.modeChipActive : {}),
              }}
            >
              💰 저축
            </button>
          </div>
        </div>
      )}

      {/* ✅ 중요: 게임 화면이 들어갈 “실제 높이” 영역 */}
      <div style={styles.sceneArea}>
        {viewMode === 'SUMMARY' ? (
          <MoneySummaryView user={gameState} onBackToGame={() => setViewMode('GAME')} />
        ) : (
          <>
            {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

            {scene === Scene.VILLAGE && (
              <VillageView user={gameState} onChangeScene={setScene} onDayEnd={handleDayEnd} />
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
                dungeonId={currentMonsterType}
                playerHp={gameState.currentBudget}
                maxHp={gameState.maxBudget}
                onSpend={handleSpend}
                onGuard={handleGuard}
                onRun={() => setScene(Scene.WORLD_MAP)}
              />
            )}

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
      </div>

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

      {/* Reset */}
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
    width: '100%',
    margin: '0 auto',

    // ✅ 핵심: display:flex + sceneArea flex:1 조합
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',

    color: '#fff',
    fontFamily: '"NeoDungGeunMo", monospace',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 1s ease',
    boxSizing: 'border-box',
  },

  sceneArea: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
  },

  viewToggle: {
    position: 'absolute',
    top: 'calc(8px + env(safe-area-inset-top))',
    left: 8,
    zIndex: 80,
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

  modeBar: {
    position: 'absolute',
    top: 'calc(72px + env(safe-area-inset-top))', // HUD랑 덜 겹치게 아래로
    left: 0,
    right: 0,
    zIndex: 75,
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
    zIndex: 90,
  },
};

export default MoneyRoomPage;
