// src/pages/MoneyRoomPage.tsx

import React, { useState, useEffect } from 'react';
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
import { applyRepayment, applySavings, checkMentalCare } from '../money/moneyHealthyLogic';

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
    lastDailyResetDate: undefined as any,
    lastDayEndDate: undefined as any,
  },
  // garden이 types에 확실히 들어가 있지 않더라도 런타임 방어용으로 넣어둠
  garden: {
    treeLevel: 1,
    weedCount: 0,
    flowerState: 'normal',
  } as any,
  lastLoginDate: undefined,
};

// ✅ 로컬 저장된 오래된 데이터가 “중첩 객체를 통째로 덮어써서” 필드 누락으로 터지는 걸 방지
const hydrateState = (savedRaw: any): UserState => {
  const base = JSON.parse(JSON.stringify(INITIAL_STATE)) as UserState;
  if (!savedRaw || typeof savedRaw !== 'object') return base;

  const merged = { ...base, ...savedRaw } as UserState;

  // 중첩 객체는 깊게 병합
  merged.lunaCycle = { ...base.lunaCycle, ...(savedRaw.lunaCycle || {}) };
  merged.assets = { ...base.assets, ...(savedRaw.assets || {}) };
  merged.counters = { ...base.counters, ...(savedRaw.counters || {}) };
  merged.materials = { ...(base.materials || {}), ...(savedRaw.materials || {}) };
  (merged as any).garden = { ...(base as any).garden, ...(savedRaw.garden || {}) };

  // 배열은 타입 안전하게
  merged.inventory = Array.isArray(savedRaw.inventory) ? savedRaw.inventory : base.inventory;
  merged.collection = Array.isArray(savedRaw.collection) ? savedRaw.collection : base.collection;
  merged.pending = Array.isArray(savedRaw.pending) ? savedRaw.pending : base.pending;

  return merged;
};

// ✅ 하위 컴포넌트 에러 나면 “빈 화면” 대신 에러를 화면에 표시
class GameErrorBoundary extends React.Component<
  { onReset: () => void; children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('[MoneyRoom ErrorBoundary]', error);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={styles.errorBox}>
          <div style={styles.errorTitle}>⚠️ 화면 렌더 중 오류</div>
          <div style={styles.errorMsg}>
            {this.state.error.name}: {this.state.error.message}
          </div>
          <button type="button" onClick={this.props.onReset} style={styles.errorBtn}>
            🔄 데이터 리셋 후 다시 열기
          </button>
          <div style={styles.errorHint}>
            (대부분 “저장된 예전 데이터에 필드가 없어서” 생기는 오류예요)
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MoneyRoomPage: React.FC = () => {
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return INITIAL_STATE;
      return hydrateState(JSON.parse(saved));
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
    setGameState((prev) => checkDailyReset(prev));
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const lunaPhase = calculateLunaPhase(gameState.lunaCycle);
  const theme = getLunaTheme(lunaPhase);
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

    let next = gameState;
    const msgs: string[] = [];

    // 1) 기본: 예산 감소 + Junk 처리
    const { newState: spentState, message } = applySpend(
      next,
      amount,
      spendMode !== 'NORMAL', // 상환/저축은 고정비처럼 처리(=Junk 제외)
      activeDungeon,
    );
    next = spentState;
    msgs.push(message);

    // 2) 모드별 보상(정원)
    if (spendMode === 'REPAY') {
      const r = applyRepayment(next, amount);
      next = r.newState;
      msgs.push(r.msg);
    } else if (spendMode === 'SAVE') {
      const s = applySavings(next, amount);
      next = s.newState;
      msgs.push(s.msg);
    } else {
      const care = checkMentalCare(next);
      if (care === 'gardener_tea_time') {
        msgs.push('🍵 정원사가 따뜻한 차를 준비했어요. 오늘은 나를 조금 더 아껴줘요.');
      }
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
    const { newState, message } = applyDayEnd(gameState);
    setGameState(newState);
    setShowDailyLog(true);
    if (message) alert(message);
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
    }));
  };

  return (
    <div style={{ ...styles.appContainer, backgroundColor: theme.bg }}>
      {/* 게임/요약 토글 */}
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

      {/* 지출 모드 토글 (GAME일 때만) */}
      {viewMode === 'GAME' && (
        <div style={styles.modeToggle}>
          <button
            type="button"
            onClick={() => setSpendMode('NORMAL')}
            style={{
              ...styles.modeButton,
              backgroundColor: spendMode === 'NORMAL' ? '#f97316' : 'rgba(15,23,42,0.85)',
            }}
          >
            🍽 일반 지출
          </button>
          <button
            type="button"
            onClick={() => setSpendMode('REPAY')}
            style={{
              ...styles.modeButton,
              backgroundColor: spendMode === 'REPAY' ? '#16a34a' : 'rgba(15,23,42,0.85)',
            }}
          >
            💳 대출/할부 상환
          </button>
          <button
            type="button"
            onClick={() => setSpendMode('SAVE')}
            style={{
              ...styles.modeButton,
              backgroundColor: spendMode === 'SAVE' ? '#0ea5e9' : 'rgba(15,23,42,0.85)',
            }}
          >
            💰 저축/이체
          </button>
        </div>
      )}

      {viewMode === 'SUMMARY' ? (
        <MoneySummaryView user={gameState} onBackToGame={() => setViewMode('GAME')} />
      ) : (
        <GameErrorBoundary onReset={handleReset}>
          <>
            {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

            {scene === Scene.VILLAGE && (
              <VillageView
                user={gameState}
                onChangeScene={setScene}
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
        </GameErrorBoundary>
      )}

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

      {/* 항상 보이는 리셋 버튼 */}
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
    zIndex: 50,
    display: 'flex',
    gap: 4,
  },
  viewToggleBtn: {
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid #4b5563',
    fontSize: 11,
    color: '#e5e7eb',
    cursor: 'pointer',
    backgroundColor: '#020617',
  },
  modeToggle: {
    position: 'absolute',
    top: 40,
    left: 8,
    right: 8,
    zIndex: 49,
    display: 'flex',
    gap: 6,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  modeButton: {
    padding: '4px 10px',
    borderRadius: 999,
    border: '1px solid #4b5563',
    fontSize: 11,
    color: '#e5e7eb',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  debugArea: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    opacity: 0.5,
    fontSize: 10,
    zIndex: 60,
  },

  errorBox: {
    margin: '80px 12px 0',
    padding: 12,
    borderRadius: 14,
    border: '1px solid #7f1d1d',
    backgroundColor: 'rgba(127,29,29,0.25)',
  },
  errorTitle: { fontSize: 14, marginBottom: 8 },
  errorMsg: { fontSize: 12, color: '#fecaca', marginBottom: 10, wordBreak: 'break-word' },
  errorBtn: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid #ef4444',
    backgroundColor: '#7f1d1d',
    color: '#fff',
    cursor: 'pointer',
  },
  errorHint: { marginTop: 8, fontSize: 11, color: '#fca5a5' },
};

export default MoneyRoomPage;
