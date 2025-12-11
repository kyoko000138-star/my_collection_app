// src/pages/MoneyRoomPage.tsx

import React, { useState, useEffect } from 'react';

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
};

const MoneyRoomPage: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [scene, setScene] = useState<Scene>(Scene.VILLAGE);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');

  // 하루 마감 모달 표시 여부
  const [showDailyLog, setShowDailyLog] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    setGameState((prev) => checkDailyReset(prev));
  }, []);

  // --- Helpers ---
  const todayStr = new Date().toISOString().split('T')[0];
  const lunaPhase = calculateLunaPhase(gameState.lunaCycle);
  const theme = getLunaTheme(lunaPhase);
  const isNewUser = gameState.maxBudget === 0; // 예산 0이면 신규 유저로 간주

  // 오늘의 몬스터 타입 (배틀 씬일 때만)
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

  // --- Handlers ---

  // 지출
  const handleSpend = (amount: number) => {
    const { newState, message } = applySpend(
      gameState,
      amount,
      false,
      activeDungeon,
    );
    setGameState(newState);
    setTimeout(() => {
      alert(message);
      setScene(Scene.VILLAGE);
    }, 100);
  };

  // 방어
  const handleGuard = () => {
    const next = applyDefense(gameState);
    setGameState(next);
    setTimeout(() => {
      alert(`🛡️ 방어 성공! 의지력(MP)을 회복했습니다.`);
      setScene(Scene.VILLAGE);
    }, 100);
  };

  // 하루 마감
  const handleDayEnd = () => {
    const { newState } = applyDayEnd(gameState, todayStr);
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

  // 온보딩 완료
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

  // --- Render ---
  return (
    <div style={{ ...styles.appContainer, backgroundColor: theme.bg }}>
      {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

      {scene === Scene.VILLAGE && (
        <VillageView user={gameState} onChangeScene={setScene} />
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

      {/* 🌙 하루 마감 + 디버그 Reset 버튼 도크 */}
      <div style={styles.controlDock}>
        <button type="button" onClick={handleDayEnd} style={styles.dayEndBtn}>
          🌙 하루 마감
        </button>
        <button
          type="button"
          onClick={handleReset}
          style={styles.debugButton}
        >
          Reset
        </button>
      </div>

      {/* 오늘 로그 모달 */}
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
  controlDock: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    zIndex: 40,
  },
  dayEndBtn: {
    padding: '6px 10px',
    borderRadius: 999,
    border: '1px solid #1f2937',
    backgroundColor: '#020617',
    color: '#f9fafb',
    fontSize: 12,
    cursor: 'pointer',
  },
  debugButton: {
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid #4b5563',
    backgroundColor: '#111827',
    color: '#9ca3af',
    fontSize: 10,
    cursor: 'pointer',
    opacity: 0.7,
  },
};

export default MoneyRoomPage;
