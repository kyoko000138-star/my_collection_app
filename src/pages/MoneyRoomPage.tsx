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
  // --- Game State ---
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  // 어떤 화면인지 (마을 / 월드맵 / 배틀 / 인벤토리 / 왕국 / 도감)
  const [scene, setScene] = useState<Scene>(Scene.VILLAGE);

  // 상단 탭: 게임 화면 vs 요약 화면
  const [viewMode, setViewMode] = useState<'GAME' | 'SUMMARY'>('GAME');

  // 현재 선택된 던전
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');

  // 하루 마감 로그 모달
  const [showDailyLog, setShowDailyLog] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    // 날짜 바뀌었으면 counters 초기화 등
    setGameState((prev) => checkDailyReset(prev));
  }, []);

  // --- Helpers ---
  const todayStr = new Date().toISOString().split('T')[0];
  const lunaPhase = calculateLunaPhase(gameState.lunaCycle);
  const theme = getLunaTheme(lunaPhase);
  const isNewUser = gameState.maxBudget === 0;

  // 배틀일 때만 오늘의 몬스터 타입 결정
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
      alert('🛡️ 방어 성공! 의지력(MP)을 회복했습니다.');
      setScene(Scene.VILLAGE);
    }, 100);
  };

  // 하루 마감 (여관에서 쉬기)
  const handleDayEnd = () => {
    const { newState } = applyDayEnd(gameState, todayStr);
    setGameState(newState);
    setShowDailyLog(true);
  };

  // 디버그용 전체 리셋
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
      {/* 뷰 전환 탭 (게임 / 요약) */}
      <div style={styles.viewToggle}>
        <button
          type="button"
          onClick={() => setViewMode('GAME')}
          style={{
            ...styles.viewToggleBtn,
            backgroundColor:
              viewMode === 'GAME' ? '#0f172a' : 'rgba(15,23,42,0.6)',
          }}
        >
          🎮 게임
        </button>
        <button
          type="button"
          onClick={() => setViewMode('SUMMARY')}
          style={{
            ...styles.viewToggleBtn,
            backgroundColor:
              viewMode === 'SUMMARY' ? '#0f172a' : 'rgba(15,23,42,0.6)',
          }}
        >
          📊 요약
        </button>
      </div>

      {/* 메인 뷰: 게임 or 요약 */}
      {viewMode === 'SUMMARY' ? (
        <MoneySummaryView
          user={gameState}
          onBackToGame={() => setViewMode('GAME')}
        />
      ) : (
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

          {/* 인벤토리 / 자산 / 도감 모달 */}
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

      {/* 오늘 하루 로그 모달 (게임/요약 모드 상관없이 띄움) */}
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

      {/* 디버그 Reset 버튼 (설정 페이지 생기면 옮겨도 됨) */}
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
    zIndex: 40,
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
  },
  debugArea: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    opacity: 0.4,
    fontSize: 10,
  },
};

export default MoneyRoomPage;
