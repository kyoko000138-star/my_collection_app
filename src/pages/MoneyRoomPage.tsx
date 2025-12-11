import React, { useState, useEffect } from 'react';

// Types & Logic
import { UserState } from '../money/types';
import { GAME_CONSTANTS, CLASS_TYPES, ClassType } from '../money/constants';
import { 
  getHp, applySpend, applyDefense, checkDailyReset, applyPurify, applyDayEnd, 
  shouldShowGuardPrompt, markGuardPromptShown, applyCraftEquipment 
} from '../money/moneyGameLogic';
import { getLunaMode, getLunaTheme } from '../money/moneyLuna';

// Views
import { VillageView } from '../money/components/VillageView';
import { WorldMapView } from '../money/components/WorldMapView';
import { BattleView } from '../money/components/BattleView';

// Modals
import { InventoryModal } from '../money/components/InventoryModal';
import { CollectionModal } from '../money/components/CollectionModal';
import { KingdomModal } from '../money/components/KingdomModal';
import { OnboardingModal } from '../money/components/OnboardingModal';

const STORAGE_KEY = 'money-room-save-v1';

const INITIAL_STATE: UserState = {
  profile: { name: 'Player 1', classType: CLASS_TYPES.GUARDIAN, level: 1 },
  luna: { nextPeriodDate: '2025-12-25', averageCycle: 28, isTracking: true },
  budget: { total: 1000000, current: 850000, fixedCost: 300000, startDate: '2025-12-01' },
  stats: { def: 50, creditScore: 0 },
  assets: { fortress: 0, airfield: 0, mansion: 0, tower: 0, warehouse: 0 },
  counters: {
    defenseActionsToday: 0, junkObtainedToday: 0, lastAccessDate: null, lastDailyResetDate: null,
    noSpendStreak: 3, lunaShieldsUsedThisMonth: 0, dailyTotalSpend: 0, isDayEnded: false,
    guardPromptShownToday: false, lastDayEndDate: null, hadSpendingToday: false
  },
  runtime: { mp: 15 },
  inventory: { junk: 0, salt: 0, shards: {}, materials: {}, equipment: [], collection: [] },
  pending: [],
};

type Scene = 'VILLAGE' | 'WORLDMAP' | 'BATTLE';

const MoneyRoomPage: React.FC = () => {
  // 1. Init State
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...INITIAL_STATE, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return INITIAL_STATE;
  });

  // Scene State
  const [currentScene, setCurrentScene] = useState<Scene>('VILLAGE');
  const [selectedDungeon, setSelectedDungeon] = useState<string>(''); // 'food', 'transport' etc.

  // Modals
  const [modals, setModals] = useState({ inventory: false, collection: false, kingdom: false });

  // Derived Values
  const hp = getHp(gameState.budget.current, gameState.budget.total);
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMode = getLunaMode(todayStr, gameState.luna.nextPeriodDate);
  const theme = getLunaTheme(currentMode);
  
  const needsOnboarding = gameState.profile.name === 'Player 1';

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    setGameState(prev => checkDailyReset(prev));
  }, []);

  // --- Handlers ---

  const handleSpend = (amount: number) => {
    // Guard Prompt Check
    if (shouldShowGuardPrompt(gameState, amount, false)) {
      const nextHp = getHp(gameState.budget.current - amount, gameState.budget.total);
      if (!window.confirm(`⚠️ 위험! HP가 ${hp}% -> ${nextHp}%로 떨어집니다. 진행할까요?`)) {
        // 취소 -> 방어
        const next = applyDefense(gameState);
        setGameState(markGuardPromptShown(next));
        alert("방어 성공! MP가 회복되었습니다.");
        setCurrentScene('VILLAGE');
        return;
      }
      setGameState(prev => markGuardPromptShown(prev));
    }

    const { newState, message } = applySpend(gameState, amount, false);
    setGameState(newState);
    alert(message); // 간단한 피드백
    setCurrentScene('VILLAGE'); // 마을로 귀환
  };

  const toggleModal = (key: keyof typeof modals, value: boolean) => {
    setModals(prev => ({ ...prev, [key]: value }));
  };

  // UI Render
  return (
    <div style={{...styles.container, backgroundColor: theme.bgColor}}>
      {needsOnboarding && <OnboardingModal onComplete={d => setGameState(prev => ({...prev, ...d}))} />}

      {currentScene === 'VILLAGE' && (
        <VillageView 
          gameState={gameState} hp={hp} todayStr={todayStr} theme={theme}
          onGoAdventure={() => setCurrentScene('WORLDMAP')}
          onOpenInventory={() => toggleModal('inventory', true)}
          onOpenKingdom={() => toggleModal('kingdom', true)}
          onOpenCollection={() => toggleModal('collection', true)}
          onDayEnd={() => {
             const { newState, message } = applyDayEnd(gameState, todayStr);
             setGameState(newState);
             alert(message);
          }}
          getClassBadge={(t) => t === CLASS_TYPES.GUARDIAN ? '🛡️' : '👶'}
          getHpColor={(v) => v > 50 ? '#4ade80' : v > 30 ? '#facc15' : '#ef4444'}
        />
      )}

      {currentScene === 'WORLDMAP' && (
        <WorldMapView 
          onSelectDungeon={(id) => { setSelectedDungeon(id); setCurrentScene('BATTLE'); }}
          onBack={() => setCurrentScene('VILLAGE')}
        />
      )}

      {currentScene === 'BATTLE' && (
        <BattleView 
          dungeonName={selectedDungeon}
          onAttack={handleSpend}
          onFlee={() => setCurrentScene('WORLDMAP')}
        />
      )}

      {/* Modals */}
      <InventoryModal 
        open={modals.inventory} onClose={() => toggleModal('inventory', false)}
        junk={gameState.inventory.junk} salt={gameState.inventory.salt}
        materials={gameState.inventory.materials} equipment={gameState.inventory.equipment}
        collection={gameState.inventory.collection}
        canPurify={gameState.runtime.mp > 0}
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
        open={modals.kingdom} onClose={() => toggleModal('kingdom', false)}
        buildings={[]} // getAssetBuildingsView(gameState) 결과 넣기
      />
      <CollectionModal 
        open={modals.collection} onClose={() => toggleModal('collection', false)}
        collection={gameState.inventory.collection}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '420px', margin: '0 auto', color: '#e5e7eb', minHeight: '100vh',
    padding: '20px', fontFamily: '"NeoDungGeunMo", sans-serif',
    backgroundColor: '#111827',
    backgroundImage: `linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
  },
};

export default MoneyRoomPage;
