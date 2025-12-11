// src/pages/MoneyRoomPage.tsx

import React, { useState, useEffect } from 'react';

// Data & Logic
import { UserState, Scene } from '../money/types';
import { CLASS_TYPES } from '../money/constants';
import { 
  checkDailyReset, applySpend, applyDefense, applyDayEnd, 
  applyPurify, applyCraftEquipment, getAssetBuildingsView, getDailyMonster
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

const STORAGE_KEY = 'money-room-save-v5-full'; 

const INITIAL_STATE: UserState = {
  name: 'Player 1', level: 1, jobTitle: CLASS_TYPES.GUARDIAN,
  currentBudget: 0, maxBudget: 0, mp: 30, maxMp: 30,
  junk: 0, salt: 0,
  lunaCycle: { startDate: '', periodLength: 5, cycleLength: 28 },
  inventory: [], collection: [], pending: [], materials: {},
  assets: { fortress: 0, airfield: 0, mansion: 0, tower: 0, warehouse: 0 },
  counters: { defenseActionsToday: 0, junkObtainedToday: 0, noSpendStreak: 0, dailyTotalSpend: 0, guardPromptShownToday: false, hadSpendingToday: false }
};

const MoneyRoomPage: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
    } catch { return INITIAL_STATE; }
  });

  const [scene, setScene] = useState<Scene>(Scene.VILLAGE);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');

  // --- Effects ---
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState)); }, [gameState]);
  useEffect(() => { setGameState(prev => checkDailyReset(prev)); }, []);

  // --- Helpers ---
  const todayStr = new Date().toISOString().split('T')[0];
  const lunaPhase = calculateLunaPhase(gameState.lunaCycle);
  const theme = getLunaTheme(lunaPhase);
  const isNewUser = gameState.maxBudget === 0; // 예산 0이면 신규 유저로 간주

  // 데일리 몬스터 (오늘의 지출 패턴에 따라 바뀜)
  const currentMonsterType = scene === Scene.BATTLE ? (activeDungeon !== 'etc' ? activeDungeon : getDailyMonster(gameState.pending)) : 'etc';

  // --- Handlers ---
  const handleSpend = (amount: number) => {
    const { newState, message } = applySpend(gameState, amount, false, activeDungeon);
    setGameState(newState);
    setTimeout(() => { alert(message); setScene(Scene.VILLAGE); }, 100);
  };

  const handleGuard = () => {
    const next = applyDefense(gameState);
    setGameState(next);
    setTimeout(() => { alert(`🛡️ 방어 성공! 의지력(MP)을 회복했습니다.`); setScene(Scene.VILLAGE); }, 100);
  };

  const handleOnboarding = (data: any) => {
    // 온보딩 데이터 매핑 (복잡한 구조 -> Flat State)
    setGameState(prev => ({
      ...prev,
      name: data.profile.name,
      jobTitle: data.profile.classType,
      maxBudget: data.budget.total,
      currentBudget: data.budget.current,
      lunaCycle: { ...prev.lunaCycle, startDate: data.luna.nextPeriodDate || todayStr }
    }));
  };

  // --- Render ---
  return (
    <div style={{...styles.appContainer, backgroundColor: theme.bg}}>
      {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

      {scene === Scene.VILLAGE && (
        <VillageView user={gameState} onChangeScene={setScene} />
      )}

      {scene === Scene.WORLD_MAP && (
        <WorldMapView onSelectDungeon={(id) => { setActiveDungeon(id); setScene(Scene.BATTLE); }} onBack={() => setScene(Scene.VILLAGE)} />
      )}

      {scene === Scene.BATTLE && (
        <BattleView 
          dungeonId={currentMonsterType}
          playerHp={gameState.currentBudget} maxHp={gameState.maxBudget}
          onSpend={handleSpend} onGuard={handleGuard} onRun={() => setScene(Scene.WORLD_MAP)}
        />
      )}

      <InventoryModal 
        open={scene === Scene.INVENTORY} onClose={() => setScene(Scene.VILLAGE)}
        junk={gameState.junk} salt={gameState.salt}
        materials={gameState.materials} equipment={gameState.inventory.map(i => i.name)}
        collection={gameState.collection} canPurify={gameState.mp > 0}
        onPurify={() => { const { newState, message } = applyPurify(gameState); setGameState(newState); alert(message); }} 
        onCraft={() => { const { newState, message } = applyCraftEquipment(gameState); setGameState(newState); alert(message); }}
      />

      <KingdomModal open={scene === Scene.KINGDOM} onClose={() => setScene(Scene.VILLAGE)} buildings={getAssetBuildingsView(gameState)} />
      <CollectionModal open={scene === Scene.COLLECTION} onClose={() => setScene(Scene.VILLAGE)} collection={gameState.collection} />
      
      <div style={styles.debugArea}>
        <button onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }}>🔄 Reset</button>
      </div>
    </div>
  );
};

const styles = {
  appContainer: { maxWidth: '420px', margin: '0 auto', minHeight: '100vh', color: '#fff', fontFamily: '"NeoDungGeunMo", monospace', position: 'relative' as const, overflow: 'hidden', transition: 'background-color 1s ease' },
  debugArea: { position: 'absolute' as const, bottom: '5px', right: '5px', opacity: 0.3 }
};

export default MoneyRoomPage;
