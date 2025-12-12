// src/pages/MoneyRoomPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { MoneySummaryView } from '../money/components/MoneySummaryView';

import { UserState, Scene, SubscriptionPlan } from '../money/types';
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
  applySubscriptionChargesIfDue,
} from '../money/moneyGameLogic';
import { calculateLunaPhase } from '../money/moneyLuna';
import { getKSTDateString, getMoneyWeather, getWeatherMeta } from '../money/moneyWeather';
import { pullGacha, RewardItem, DECOR_EMOJI } from '../money/rewardData';

// Views
import { VillageView } from '../money/components/VillageView';
import { WorldMapView } from '../money/components/WorldMapView';
import { BattleView } from '../money/components/BattleView';

// Components & Modals
import { WeatherOverlay } from '../money/components/WeatherOverlay';
import { RewardModal } from '../money/components/RewardModal';
import { InventoryModal } from '../money/components/InventoryModal';
import { KingdomModal } from '../money/components/KingdomModal';
import { CollectionModal } from '../money/components/CollectionModal';
import { OnboardingModal } from '../money/components/OnboardingModal';
import DailyLogModal from '../money/components/DailyLogModal';

// [NEW] 구독 모달
import { SubscriptionModal } from '../money/components/SubscriptionModal';

const STORAGE_KEY = 'money-room-save-v5-full';

// ---------------------------------------------------------
// 💾 데이터 초기화
// ---------------------------------------------------------
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
  seedPackets: 0,
  garden: { treeLevel: 0, pondLevel: 0, flowerState: 'normal', weedCount: 0, decorations: [] },
  status: { mode: 'NORMAL', darkLevel: 0 },
  lunaCycle: { startDate: '', periodLength: 5, cycleLength: 28 },
  inventory: [],
  collection: [],
  pending: [],
  materials: {},
  assets: { fortress: 0, airfield: 0, mansion: 0, tower: 0, warehouse: 0 },
  counters: {
    defenseActionsToday: 0, junkObtainedToday: 0, noSpendStreak: 0, dailyTotalSpend: 0,
    guardPromptShownToday: false, hadSpendingToday: false, lastDailyResetDate: '', lastDayEndDate: '',
  },
  subscriptions: [],
};

// ✅ 안전 병합 (Deep Merge)
const mergeUserState = (base: UserState, saved: Partial<UserState>): UserState => {
  return {
    ...base,
    ...saved,
    lunaCycle: { ...base.lunaCycle, ...(saved.lunaCycle || {}) },
    assets: { ...base.assets, ...(saved.assets || {}) },
    counters: { ...base.counters, ...(saved.counters || {}) },
    garden: { ...base.garden, ...(saved.garden || {}), decorations: saved.garden?.decorations ?? base.garden.decorations },
    status: { ...base.status, ...(saved.status || {}) },
    inventory: Array.isArray(saved.inventory) ? saved.inventory : base.inventory,
    collection: Array.isArray(saved.collection) ? saved.collection : base.collection,
    pending: Array.isArray(saved.pending) ? saved.pending : base.pending,
    subscriptions: Array.isArray(saved.subscriptions) ? saved.subscriptions : base.subscriptions,
    materials: saved.materials ?? base.materials,
    seedPackets: typeof saved.seedPackets === 'number' ? saved.seedPackets : base.seedPackets,
  };
};

const MoneyRoomPage: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (!savedRaw) return INITIAL_STATE;
      const saved = JSON.parse(savedRaw) as Partial<UserState>;
      return mergeUserState(INITIAL_STATE, saved);
    } catch {
      return INITIAL_STATE;
    }
  });

  const [scene, setScene] = useState<Scene>(Scene.VILLAGE);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');
  const [viewMode, setViewMode] = useState<'GAME' | 'SUMMARY'>('GAME');

  // Modals
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [lastReward, setLastReward] = useState<RewardItem | null>(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // 초기화 (리셋 + 구독 청구)
  useEffect(() => {
    setGameState((prev) => {
      const merged = mergeUserState(INITIAL_STATE, prev);
      const reset = checkDailyReset(merged);
      const sub = applySubscriptionChargesIfDue(reset);
      // 구독 청구 로그가 있다면 알림
      if (sub.logs.length > 0) {
        alert(sub.logs.join('\n'));
      }
      return sub.newState;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Helpers ---
  const todayStr = useMemo(() => getKSTDateString(), []);
  const weather = getMoneyWeather(gameState);
  const weatherMeta = getWeatherMeta(weather);
  const isNewUser = gameState.maxBudget === 0;

  const currentMonsterType =
    scene === Scene.BATTLE
      ? activeDungeon !== 'etc'
        ? activeDungeon
        : getDailyMonster(gameState.pending)
      : 'etc';

  const hpPercent = gameState.maxBudget > 0
      ? Math.round((gameState.currentBudget / gameState.maxBudget) * 100)
      : 0;
  
  // --- Handlers ---
  const handleSpend = (amount: number) => {
    const { newState, message } = applySpend(gameState, amount, false, activeDungeon);
    setGameState(newState);
    setTimeout(() => {
      alert(message);
      setScene(Scene.VILLAGE);
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
    let next = newState;
    if (!gameState.counters.hadSpendingToday) {
        next.seedPackets = (next.seedPackets || 0) + 1;
    }
    setGameState(next);
    setShowDailyLog(true);
  };

  const handlePullSeed = () => {
    if ((gameState.seedPackets || 0) <= 0) return;
    const reward = pullGacha();
    
    // Gacha Helper
    const applyRewardToState = (state: UserState, r: RewardItem): UserState => {
      const next = JSON.parse(JSON.stringify(state)) as UserState;
      next.seedPackets = Math.max(0, (next.seedPackets || 0) - 1);
      if (r.type === 'DECOR') {
        if (!next.garden.decorations) next.garden.decorations = [];
        next.garden.decorations.push({
          id: r.id,
          x: Math.floor(15 + Math.random() * 70),
          y: Math.floor(35 + Math.random() * 40),
          obtainedAt: new Date().toISOString(),
        });
      } else if (r.type === 'ITEM') {
        const idx = next.inventory.findIndex((i) => i.id === r.id);
        if (idx >= 0) next.inventory[idx].count++;
        else next.inventory.push({ id: r.id, name: r.name, type: 'consumable', count: 1 });
      }
      return next;
    };

    setGameState((prev) => applyRewardToState(prev, reward));
    setLastReward(reward);
  };

  const handleReset = () => {
    if (confirm('모든 데이터를 초기화하시겠습니까?')) {
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
      lunaCycle: { ...prev.lunaCycle, startDate: data.luna.nextPeriodDate || todayStr },
    }));
  };

  // [NEW] 구독 추가 핸들러
  const handleAddSubscription = (plan: SubscriptionPlan) => {
    setGameState(prev => ({
      ...prev,
      subscriptions: [...(prev.subscriptions || []), plan],
      assets: { ...prev.assets, mansion: (prev.assets.mansion || 0) + 1 }
    }));
  };

  // [NEW] 구독 삭제 핸들러
  const handleRemoveSubscription = (id: string) => {
    setGameState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s.id !== id)
    }));
  };

  // ---------------------------------------------------------
  // 🖥️ 렌더링
  // ---------------------------------------------------------
  return (
    <div 
      style={{
        ...styles.appContainer,
        // [NEW] 흑화 모드 필터: 예산이 0 이하일 때 잿빛 + 붉은 톤으로 변경
        filter: gameState.status.mode === 'DARK' 
          ? 'grayscale(90%) contrast(120%) sepia(20%) hue-rotate(-20deg)' 
          : 'none',
        transition: 'filter 2s ease', 
      }}
    >
      
      {/* 1. 상단 UI (토글 & 날씨/씨앗) */}
      <div style={styles.viewToggle}>
        <button
          onClick={() => setViewMode('GAME')}
          style={{
            ...styles.viewToggleBtn,
            backgroundColor: viewMode === 'GAME' ? '#0f172a' : 'rgba(15,23,42,0.6)',
          }}
        >
          🎮 게임
        </button>
        <button
          onClick={() => setViewMode('SUMMARY')}
          style={{
            ...styles.viewToggleBtn,
            backgroundColor: viewMode === 'SUMMARY' ? '#0f172a' : 'rgba(15,23,42,0.6)',
          }}
        >
          📊 요약
        </button>
      </div>

      <div style={styles.topRight}>
        <div style={styles.weatherBadge} title="소비 날씨">
          <span>{weatherMeta.icon}</span>
          <span style={{ fontSize: 11, opacity: 0.85 }}>{weatherMeta.label}</span>
        </div>
        <button
          style={styles.seedBtn}
          onClick={() => setRewardOpen(true)}
          title="씨앗 봉투 열기"
        >
          🌱 {gameState.seedPackets || 0}
        </button>
      </div>

      {/* 2. 메인 컨텐츠 영역 */}
      {viewMode === 'SUMMARY' ? (
        <MoneySummaryView user={gameState} onBackToGame={() => setViewMode('GAME')} />
      ) : (
        <div style={styles.screenWrap}>
          
          {/* 오버레이: 날씨 & 정원 데코 (마을에서만 표시) */}
          {scene === Scene.VILLAGE && <WeatherOverlay weather={weather} />}
          
          {scene === Scene.VILLAGE && gameState.garden?.decorations?.length > 0 && (
            <div style={styles.decorLayer}>
              {gameState.garden.decorations.map((d, idx) => (
                <div
                  key={`${d.id}-${idx}`}
                  style={{
                    position: 'absolute',
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: 24,
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                    zIndex: 2, 
                  }}
                >
                  {DECOR_EMOJI[d.id] || '✨'}
                </div>
              ))}
            </div>
          )}

          {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

          {/* Scene Switcher */}
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

          {/* Common Modals */}
          <InventoryModal 
            open={scene === Scene.INVENTORY} onClose={() => setScene(Scene.VILLAGE)} 
            junk={gameState.junk} salt={gameState.salt} materials={gameState.materials}
            equipment={gameState.inventory.map((i) => i.name)} collection={gameState.collection}
            canPurify={gameState.mp > 0} 
            onPurify={() => { const res = applyPurify(gameState); setGameState(res.newState); alert(res.message); }}
            onCraft={() => { const res = applyCraftEquipment(gameState); setGameState(res.newState); alert(res.message); }}
          />
          <KingdomModal 
            open={scene === Scene.KINGDOM} 
            onClose={() => setScene(Scene.VILLAGE)} 
            buildings={getAssetBuildingsView(gameState)} 
            onManageSubs={() => setScene(Scene.SUBSCRIPTION)} // [NEW] 연결
          />
          <CollectionModal open={scene === Scene.COLLECTION} onClose={() => setScene(Scene.VILLAGE)} collection={gameState.collection} />
          
          {/* [NEW] 구독 관리 모달 */}
          <SubscriptionModal 
            open={scene === Scene.SUBSCRIPTION}
            onClose={() => setScene(Scene.VILLAGE)}
            plans={gameState.subscriptions || []}
            onAdd={handleAddSubscription}
            onRemove={handleRemoveSubscription}
          />

        </div>
      )}

      {/* 3. Global Modals */}
      <DailyLogModal 
        open={showDailyLog} onClose={() => setShowDailyLog(false)} 
        today={todayStr} hp={hpPercent} mp={gameState.mp} 
        def={gameState.counters.defenseActionsToday} junkToday={gameState.counters.junkObtainedToday} 
        defenseActionsToday={gameState.counters.defenseActionsToday} noSpendStreak={gameState.counters.noSpendStreak} 
        pending={gameState.pending} 
      />
      <RewardModal 
        open={rewardOpen} seedPackets={gameState.seedPackets || 0} 
        lastReward={lastReward} onPull={handlePullSeed} onClose={() => setRewardOpen(false)} 
      />

      <div style={styles.debugBtn} onClick={handleReset}>🔄</div>
    </div>
  );
};

// ---------------------------------------------------------
// 💄 Styles
// ---------------------------------------------------------
const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    maxWidth: '420px',
    margin: '0 auto',
    height: '100dvh', // 모바일 주소창 대응
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    fontFamily: '"NeoDungGeunMo", monospace',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 1s ease',
  },

  screenWrap: {
    flex: 1, 
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  decorLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 6,
    pointerEvents: 'none',
  },

  viewToggle: {
    position: 'absolute', top: 8, left: 8, zIndex: 40, display: 'flex', gap: 4,
  },
  viewToggleBtn: {
    padding: '4px 8px', borderRadius: 999, border: '1px solid #4b5563', fontSize: 11, color: '#e5e7eb', cursor: 'pointer', backgroundColor: '#020617',
  },

  topRight: {
    position: 'absolute', top: 8, right: 8, zIndex: 50, display: 'flex', gap: 6, alignItems: 'center',
  },
  weatherBadge: {
    display: 'flex', gap: 6, alignItems: 'center', padding: '4px 8px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
  },
  seedBtn: {
    padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.35)', color: '#fff', cursor: 'pointer', fontSize: 12,
  },

  debugBtn: {
    position: 'absolute', bottom: 6, right: 6, opacity: 0.4, fontSize: 10, cursor: 'pointer', zIndex: 60,
  },
};

export default MoneyRoomPage;
