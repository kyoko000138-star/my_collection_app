import React, { useState, useEffect } from 'react';

// 1. Data & Logic
import { UserState } from '../money/types';
import { CLASS_TYPES } from '../money/constants';
import { 
  getHp, checkDailyReset, applySpend, applyDefense, applyDayEnd, 
  applyPurify, applyCraftEquipment 
} from '../money/moneyGameLogic';
import { getLunaTheme, getLunaMode } from '../money/moneyLuna';

// 2. Views (화면 컴포넌트)
import { VillageView } from '../money/components/VillageView';
import { WorldMapView } from '../money/components/WorldMapView';
import { BattleView } from '../money/components/BattleView';

// 3. Modals (팝업)
import { InventoryModal } from '../money/components/InventoryModal';
import { KingdomModal } from '../money/components/KingdomModal';
import { CollectionModal } from '../money/components/CollectionModal';
import { OnboardingModal } from '../money/components/OnboardingModal';

// 저장소 키 (버전 변경 시 키를 바꾸면 초기화됨)
const STORAGE_KEY = 'money-room-save-v3-adventure'; 

// 초기 데이터 (신규 유저용)
const INITIAL_STATE: UserState = {
  scene: 'VILLAGE',
  profile: { name: 'Player 1', classType: CLASS_TYPES.GUARDIAN, level: 1 },
  budget: { total: 500000, current: 500000, fixedCost: 0, startDate: '' },
  stats: { def: 0, creditScore: 0 },
  assets: { fortress: 0, airfield: 0, mansion: 0, tower: 0, warehouse: 0 },
  counters: { 
    defenseActionsToday: 0, junkObtainedToday: 0, noSpendStreak: 0, 
    dailyTotalSpend: 0, guardPromptShownToday: false, hadSpendingToday: false,
    lastAccessDate: null, lastDailyResetDate: null, lastDayEndDate: null, 
    lunaShieldsUsedThisMonth: 0 
  },
  runtime: { mp: 30 },
  inventory: { junk: 0, salt: 0, materials: {}, equipment: [], shards: {}, collection: [] },
  pending: [],
  history: [],
  luna: { nextPeriodDate: '', averageCycle: 28, isTracking: false },
};

const MoneyRoomPage: React.FC = () => {
  // --- [State Management] ---
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
    } catch { return INITIAL_STATE; }
  });

  const [scene, setScene] = useState<'VILLAGE' | 'WORLDMAP' | 'BATTLE'>('VILLAGE');
  const [activeDungeon, setActiveDungeon] = useState<string>('etc'); // 선택된 던전 ID
  const [modal, setModal] = useState<string | null>(null); // 현재 열린 모달

  // --- [Effect] ---
  // 1. 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // 2. 일일 리셋 (접속 시)
  useEffect(() => {
    setGameState(prev => checkDailyReset(prev));
  }, []);

  // --- [Helpers] ---
  const hpPercent = getHp(gameState.budget.current, gameState.budget.total);
  const todayStr = new Date().toISOString().split('T')[0];
  const theme = getLunaTheme(getLunaMode(todayStr, gameState.luna.nextPeriodDate));
  const isNewUser = gameState.profile.name === 'Player 1';

  // --- [Handlers] ---

  // ⚔️ 전투: 지출 (Hit)
  const handleSpend = (amount: number) => {
    const { newState, message } = applySpend(gameState, amount, false);
    setGameState(newState);
    
    // 전투 종료 연출 (알림 -> 마을 귀환)
    setTimeout(() => {
      alert(`💥 [피격] ${amount.toLocaleString()}원 지출!\nHP가 감소했습니다.\n(${message})`);
      setScene('VILLAGE');
    }, 100);
  };

  // 🛡️ 전투: 방어 (Guard)
  const handleGuard = () => {
    const next = applyDefense(gameState);
    setGameState(next);
    setTimeout(() => {
      alert(`🛡️ [방어 성공] 지출 유혹을 이겨냈습니다!\nMP가 회복되었습니다.`);
      setScene('VILLAGE');
    }, 100);
  };

  // 🌙 마을: 하루 마감 (Rest)
  const handleRest = () => {
    if (gameState.counters.lastDayEndDate === todayStr) {
      return alert("이미 오늘 하루를 마감했습니다.");
    }
    if (!window.confirm("오늘 하루를 정리하고 휴식하시겠습니까?")) return;

    const { newState, message } = applyDayEnd(gameState, todayStr);
    setGameState(newState);
    alert(message);
  };

  // 🧪 인벤토리: 정화 & 제작
  const handlePurify = () => {
    const { newState, message } = applyPurify(gameState);
    setGameState(newState);
    alert(message);
  };
  const handleCraft = () => {
    const { newState, message } = applyCraftEquipment(gameState);
    setGameState(newState);
    alert(message);
  };

  return (
    <div style={styles.appContainer}>
      {/* 0. 온보딩 (신규 유저) */}
      {isNewUser && (
        <OnboardingModal onComplete={d => setGameState(p => ({ ...p, ...d }))} />
      )}

      {/* 1. 마을 화면 (VILLAGE) */}
      {scene === 'VILLAGE' && (
        <VillageView 
          gameState={gameState} 
          hp={hpPercent} todayStr={todayStr} theme={theme}
          onMoveToWorld={() => setScene('WORLDMAP')}
          onOpenMenu={(menu) => setModal(menu)}
          onRest={handleRest}
        />
      )}

      {/* 2. 월드맵 화면 (WORLDMAP) */}
      {scene === 'WORLDMAP' && (
        <WorldMapView 
          onSelectDungeon={(id) => { setActiveDungeon(id); setScene('BATTLE'); }}
          onBack={() => setScene('VILLAGE')}
        />
      )}

      {/* 3. 전투 화면 (BATTLE) */}
      {scene === 'BATTLE' && (
        <BattleView 
          dungeonId={activeDungeon}
          playerHp={gameState.budget.current}
          maxHp={gameState.budget.total}
          onSpend={handleSpend}
          onGuard={handleGuard}
          onRun={() => setScene('WORLDMAP')}
        />
      )}

      {/* 4. 공통 모달 (Inventory, Kingdom, Collection) */}
      <InventoryModal 
        open={modal === 'inventory' || modal === 'craft'} 
        onClose={() => setModal(null)}
        junk={gameState.inventory.junk} salt={gameState.inventory.salt}
        materials={gameState.inventory.materials} equipment={gameState.inventory.equipment}
        collection={gameState.inventory.collection}
        canPurify={gameState.runtime.mp > 0}
        onPurify={handlePurify} onCraft={handleCraft}
      />
      <KingdomModal 
        open={modal === 'kingdom'} onClose={() => setModal(null)} 
        buildings={[]} /* TODO: getAssetBuildingsView 연결 필요 */
      />
      <CollectionModal 
        open={modal === 'collection'} onClose={() => setModal(null)} 
        collection={gameState.inventory.collection} 
      />
      
      {/* 디버그용 초기화 버튼 */}
      <div style={styles.debugArea}>
        <button onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }}>
          🔄 Reset Data
        </button>
      </div>
    </div>
  );
};

const styles = {
  appContainer: {
    maxWidth: '420px', margin: '0 auto', minHeight: '100vh',
    backgroundColor: '#000', color: '#fff',
    fontFamily: '"NeoDungGeunMo", monospace', // 픽셀 폰트 필수
    position: 'relative' as const,
    overflow: 'hidden'
  },
  debugArea: {
    position: 'absolute' as const, bottom: '5px', right: '5px', opacity: 0.3
  }
};

export default MoneyRoomPage;
