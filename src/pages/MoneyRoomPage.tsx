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
import DailyLogModal from '../money/components/DailyLogModal'; // ✅ 오늘의 로그

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
  assets: {
    fortress: 0,
    airfield: 0,
    mansion: 0,
    tower: 0,
    warehouse: 0,
  },
  counters: {
    defenseActionsToday: 0,
    junkObtainedToday: 0,
    dailyTotalSpend: 0,
    hadSpendingToday: false,
    noSpendStreak: 0,
    guardPromptShownToday: false,
    // lastDailyResetDate / lastDayEndDate 는 undefined로 시작해도 됨
  },
  lastLoginDate: undefined,
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
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false); // ✅ 오늘 로그 모달

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
  const isNewUser = gameState.maxBudget === 0; // 예산 0이면 온보딩 유저로 간주

  // 배틀용 몬스터 타입 (카테고리)
  const currentMonsterType =
    scene === Scene.BATTLE
      ? activeDungeon !== 'etc'
        ? activeDungeon
        : getDailyMonster(gameState.pending)
      : 'etc';

  // --- Handlers ---

  // 지출(피격)
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

  // 방어(의지력 회복)
  const handleGuard = () => {
    const next = applyDefense(gameState);
    setGameState(next);
    setTimeout(() => {
      alert('🛡️ 방어 행동! 의지력(MP)을 회복했습니다.');
      setScene(Scene.VILLAGE);
    }, 100);
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

  // ✅ 하루 마감 + 오늘의 로그 열기
  const handleDayEnd = () => {
    const { newState, message } = applyDayEnd(gameState, todayStr);
    setGameState(newState);
    alert(message); // "Natural Dust +1" 등 로그 텍스트
    setIsDailyLogOpen(true);
  };

  // --- Render ---
  const hpPercent =
    gameState.maxBudget > 0
      ? Math.round((gameState.currentBudget / gameState.maxBudget) * 100)
      : 0;

  return (
    <div
      style={{
        ...styles.appContainer,
        backgroundColor: theme.bg,
      }}
    >
      {/* ✅ 신규 유저 온보딩 */}
      {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

      {/* 메인 씬 전환 */}
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

      {/* 인벤토리 & 제작 */}
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

      {/* 자산 왕국 */}
      <KingdomModal
        open={scene === Scene.KINGDOM}
        onClose={() => setScene(Scene.VILLAGE)}
        buildings={getAssetBuildingsView(gameState)}
      />

      {/* 수집 도감 */}
      <CollectionModal
        open={scene === Scene.COLLECTION}
        onClose={() => setScene(Scene.VILLAGE)}
        collection={gameState.collection}
      />

      {/* ✅ 오늘의 로그 모달 */}
      <DailyLogModal
        open={isDailyLogOpen}
        onClose={() => setIsDailyLogOpen(false)}
        today={todayStr}
        hp={hpPercent}
        mp={gameState.mp}
        def={gameState.assets.fortress}
        junkToday={gameState.counters.junkObtainedToday}
        defenseActionsToday={gameState.counters.defenseActionsToday}
        noSpendStreak={gameState.counters.noSpendStreak}
        pending={gameState.pending}
      />

      {/* 디버그/관리 버튼들 */}
      <div style={styles.debugArea}>
        <button onClick={handleDayEnd} style={styles.debugButton}>
          🌙 하루 마감
        </button>
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
          }}
          style={styles.debugButton}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

// src/pages/MoneyRoomPage.tsx 맨 아래 부분

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    maxWidth: '420px',
    margin: '0 auto',
    // [수정] minHeight 대신 height 사용, Flex박스 적용
    height: '100vh', 
    display: 'flex',
    flexDirection: 'column',
    
    color: '#fff',
    fontFamily: '"NeoDungGeunMo", monospace',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 1s ease',
  },
  debugArea: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    opacity: 0.3,
    zIndex: 100, // 버튼이 항상 위에 오도록 zIndex 추가
  },
  debugButton: {
    fontSize: 10,
    padding: '4px 6px',
    borderRadius: 6,
    border: '1px solid #4b5563',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    cursor: 'pointer',
  },
};

export default MoneyRoomPage;
