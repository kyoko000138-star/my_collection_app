import React, { useState, useEffect, useMemo } from 'react';
import { MoneySummaryView } from '../money/components/MoneySummaryView';

// Types & Logic
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
import { SubscriptionModal } from '../money/components/SubscriptionModal';

const STORAGE_KEY = 'money-room-save-v5-full';

// ---------------------------------------------------------
// 💾 데이터 초기화 및 헬퍼
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
  // -------------------------------------------------------
  // 1. State & Logic Hooks
  // -------------------------------------------------------
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

  // Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    setGameState((prev) => {
      const merged = mergeUserState(INITIAL_STATE, prev);
      const reset = checkDailyReset(merged);
      const sub = applySubscriptionChargesIfDue(reset);
      if (sub.logs.length > 0) {
        // alert(sub.logs.join('\n')); // 필요 시 주석 해제
      }
      return sub.newState;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers
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
  
  // Handlers
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

  const handleAddSubscription = (plan: SubscriptionPlan) => {
    setGameState(prev => ({
      ...prev,
      subscriptions: [...(prev.subscriptions || []), plan],
      assets: { ...prev.assets, mansion: (prev.assets.mansion || 0) + 1 }
    }));
  };

  const handleRemoveSubscription = (id: string) => {
    setGameState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s.id !== id)
    }));
  };

  // -------------------------------------------------------
  // 2. Rendering (Game Console Layout)
  // -------------------------------------------------------
  if (viewMode === 'SUMMARY') {
    return <MoneySummaryView user={gameState} onBackToGame={() => setViewMode('GAME')} />;
  }

  return (
    <div style={consoleStyles.body}>
      
      {/* --- [A] 상단 HUD 영역 (고정) --- */}
      <div style={consoleStyles.hud}>
        {/* 상단 정보줄: 레벨/이름 + 날씨 + 리셋버튼 */}
        <div style={consoleStyles.hudRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={consoleStyles.levelBadge}>Lv.{gameState.level}</span>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{gameState.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span onClick={handleReset} style={{cursor:'pointer', fontSize:'10px', opacity:0.5}}>↺</span>
            <span title="현재 날씨">{weatherMeta.icon}</span>
          </div>
        </div>

        {/* 체력바 (HP) */}
        <div style={consoleStyles.hpBarFrame}>
          <div style={{
            ...consoleStyles.hpBarFill,
            width: `${hpPercent}%`,
            backgroundColor: gameState.status.mode === 'DARK' ? '#4b5563' : '#ef4444'
          }} />
          <span style={consoleStyles.hpText}>
            HP {gameState.currentBudget.toLocaleString()} / {gameState.maxBudget.toLocaleString()}
          </span>
        </div>

        {/* 의지력(MP) & 씨앗 */}
        <div style={consoleStyles.hudRowBottom}>
          <span style={{ color: '#60a5fa' }}>MP {gameState.mp}/{gameState.maxMp}</span>
          <span 
            onClick={() => setRewardOpen(true)} 
            style={{ cursor: 'pointer', color: gameState.seedPackets > 0 ? '#4ade80' : '#6b7280' }}
          >
            🌱 씨앗 {gameState.seedPackets}개
          </span>
        </div>
      </div>

      {/* --- [B] 중앙 스크린 영역 (가변) --- */}
      <div style={consoleStyles.screenBezel}>
        <div style={consoleStyles.crtEffect} /> {/* CRT 스캔라인 효과 */}
        
        <div style={consoleStyles.screenContent}>
          {/* 날씨 오버레이 (마을일 때만) */}
          {scene === Scene.VILLAGE && <WeatherOverlay weather={weather} />}
          
          {/* 정원 데코레이션 (마을일 때만) */}
          {scene === Scene.VILLAGE && gameState.garden?.decorations?.length > 0 && (
            <div style={consoleStyles.decorLayer}>
              {gameState.garden.decorations.map((d, idx) => (
                <div key={`${d.id}-${idx}`} style={{
                    position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
                    transform: 'translate(-50%, -50%)', fontSize: 24, zIndex: 2,
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                }}>
                  {DECOR_EMOJI[d.id] || '✨'}
                </div>
              ))}
            </div>
          )}

          {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

          {/* 메인 뷰 스위칭 */}
          {scene === Scene.VILLAGE && (
            <VillageView user={gameState} onChangeScene={setScene} onDayEnd={handleDayEnd} />
          )}
          {scene === Scene.WORLD_MAP && (
            <WorldMapView onSelectDungeon={(id) => { setActiveDungeon(id); setScene(Scene.BATTLE); }} onBack={() => setScene(Scene.VILLAGE)} />
          )}
          {scene === Scene.BATTLE && (
            <BattleView dungeonId={currentMonsterType} playerHp={gameState.currentBudget} maxHp={gameState.maxBudget} onSpend={handleSpend} onGuard={handleGuard} onRun={() => setScene(Scene.WORLD_MAP)} />
          )}

          {/* 모달 (스크린 내부에 렌더링) */}
          <InventoryModal 
            open={scene === Scene.INVENTORY} onClose={() => setScene(Scene.VILLAGE)} 
            junk={gameState.junk} salt={gameState.salt} materials={gameState.materials}
            equipment={gameState.inventory.map((i) => i.name)} collection={gameState.collection}
            canPurify={gameState.mp > 0} 
            onPurify={() => { const res = applyPurify(gameState); setGameState(res.newState); alert(res.message); }}
            onCraft={() => { const res = applyCraftEquipment(gameState); setGameState(res.newState); alert(res.message); }}
          />
          <KingdomModal 
            open={scene === Scene.KINGDOM} onClose={() => setScene(Scene.VILLAGE)} 
            buildings={getAssetBuildingsView(gameState)} onManageSubs={() => setScene(Scene.SUBSCRIPTION)}
          />
          <CollectionModal 
            open={scene === Scene.COLLECTION} onClose={() => setScene(Scene.VILLAGE)} 
            collection={gameState.collection} 
          />
          <SubscriptionModal 
            open={scene === Scene.SUBSCRIPTION} onClose={() => setScene(Scene.VILLAGE)}
            plans={gameState.subscriptions || []} onAdd={handleAddSubscription} onRemove={handleRemoveSubscription}
          />
        </div>
      </div>

      {/* --- [C] 하단 컨트롤러 영역 (고정) --- */}
      <div style={consoleStyles.controlDeck}>
        
        {/* 1. D-Pad (십자키) */}
        <div style={consoleStyles.dpadArea}>
          <div style={consoleStyles.dpad}>
             <div style={consoleStyles.dpadUp} onClick={() => setScene(Scene.WORLD_MAP)}>▲</div>
             <div style={consoleStyles.dpadLeft} onClick={() => setScene(Scene.INVENTORY)}>◀</div>
             <div style={consoleStyles.dpadCenter}></div>
             <div style={consoleStyles.dpadRight} onClick={() => setScene(Scene.KINGDOM)}>▶</div>
             <div style={consoleStyles.dpadDown} onClick={() => setScene(Scene.VILLAGE)}>▼</div>
          </div>
          <div style={{marginTop:'4px', fontSize:'9px', color:'#64748b'}}>MOVE</div>
        </div>

        {/* 2. Action Buttons */}
        <div style={consoleStyles.actionBtnArea}>
          <div style={consoleStyles.btnGroup}>
            <button style={consoleStyles.actionBtnB} onClick={() => setViewMode('SUMMARY')}>B</button>
            <span style={consoleStyles.btnLabel}>요약</span>
          </div>
          <div style={consoleStyles.btnGroup}>
            {/* A버튼: 현재 Scene에 따라 동작이 달라지면 좋지만, 일단은 전투/입력(WorldMap)으로 연결 */}
            <button style={consoleStyles.actionBtnA} onClick={() => setScene(Scene.WORLD_MAP)}>A</button>
            <span style={consoleStyles.btnLabel}>결정</span>
          </div>
        </div>

        {/* 3. System Buttons */}
        <div style={consoleStyles.systemBtnArea}>
           <div style={consoleStyles.btnGroup}>
             <button style={consoleStyles.systemBtn} onClick={() => setScene(Scene.COLLECTION)} />
             <span style={consoleStyles.btnLabelSmall}>SELECT</span>
           </div>
           <div style={consoleStyles.btnGroup}>
             <button style={consoleStyles.systemBtn} onClick={() => setScene(Scene.KINGDOM)} />
             <span style={consoleStyles.btnLabelSmall}>START</span>
           </div>
        </div>

      </div>

      {/* 글로벌 모달 (화면 전체 덮음) */}
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

    </div>
  );
};

// ---------------------------------------------------------
// 🎨 Game Console Styles
// ---------------------------------------------------------
const consoleStyles: Record<string, React.CSSProperties> = {
  // 전체 바디
  body: {
    width: '100%', maxWidth: '420px', margin: '0 auto', height: '100dvh', 
    backgroundColor: '#202025', // 본체 색상
    display: 'flex', flexDirection: 'column',
    fontFamily: '"NeoDungGeunMo", monospace',
    overflow: 'hidden', position: 'relative',
    color: '#fff',
    boxShadow: '0 0 50px rgba(0,0,0,0.5)'
  },

  // 1. HUD
  hud: {
    height: '80px', backgroundColor: '#2d3748', 
    borderBottom: '4px solid #1a202c',
    padding: '10px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px',
    boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.3)', zIndex: 10
  },
  hudRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' },
  hudRowBottom: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  levelBadge: { backgroundColor: '#4a5568', padding: '1px 4px', borderRadius: '4px', fontSize: '10px', color: '#e2e8f0' },
  
  hpBarFrame: { width: '100%', height: '16px', backgroundColor: '#111', border: '2px solid #555', borderRadius: '4px', position: 'relative', overflow: 'hidden' },
  hpBarFill: { height: '100%', transition: 'width 0.5s ease-out' },
  hpText: { position: 'absolute', width: '100%', textAlign: 'center', top: '0', lineHeight: '14px', fontSize: '10px', color: '#fff', textShadow: '1px 1px 0 #000', fontWeight: 'bold' },

  // 2. Screen
  screenBezel: {
    flex: 1, // 남은 공간 차지
    backgroundColor: '#000', // 베젤 색상
    padding: '10px 10px 20px 10px', 
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    position: 'relative',
    boxShadow: 'inset 0 0 15px #000'
  },
  screenContent: {
    width: '100%', height: '100%', 
    backgroundColor: '#333', // 기본 배경
    borderRadius: '4px', overflow: 'hidden', position: 'relative',
    border: '2px solid #444',
    // 내부 뷰들이 절대 위치가 아닌 flex 꽉 채우기로 동작하게 함
    display: 'flex', flexDirection: 'column'
  },
  crtEffect: {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99,
    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)',
    backgroundSize: '100% 4px',
    opacity: 0.15
  },
  decorLayer: { position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' },

  // 3. Controller
  controlDeck: {
    height: '180px', backgroundColor: '#2d3748', 
    borderTop: '4px solid #4a5568',
    padding: '15px 20px', display: 'grid', 
    gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr auto',
    gap: '10px',
    boxShadow: 'inset 0 5px 10px rgba(0,0,0,0.3)'
  },
  
  // D-Pad
  dpadArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  dpad: { position: 'relative', width: '90px', height: '90px' },
  dpadCenter: { position: 'absolute', top: '30px', left: '30px', width: '30px', height: '30px', backgroundColor: '#1a202c' },
  dpadUp: { position: 'absolute', top: '0', left: '30px', width: '30px', height: '30px', backgroundColor: '#1a202c', borderRadius: '4px 4px 0 0', boxShadow: '0 4px 0 #000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#4a5568' },
  dpadDown: { position: 'absolute', bottom: '0', left: '30px', width: '30px', height: '30px', backgroundColor: '#1a202c', borderRadius: '0 0 4px 4px', boxShadow: '0 4px 0 #000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#4a5568' },
  dpadLeft: { position: 'absolute', top: '30px', left: '0', width: '30px', height: '30px', backgroundColor: '#1a202c', borderRadius: '4px 0 0 4px', boxShadow: '0 4px 0 #000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#4a5568' },
  dpadRight: { position: 'absolute', top: '30px', right: '0', width: '30px', height: '30px', backgroundColor: '#1a202c', borderRadius: '0 4px 4px 0', boxShadow: '0 4px 0 #000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#4a5568' },

  // Action Buttons
  actionBtnArea: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', paddingBottom: '10px' },
  btnGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  actionBtnA: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e53e3e', border: 'none', boxShadow: '0 4px 0 #9b2c2c', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-10px' },
  actionBtnB: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#d69e2e', border: 'none', boxShadow: '0 4px 0 #975a16', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px' },
  btnLabel: { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' },

  // System Buttons
  systemBtnArea: { gridColumn: 'span 2', display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '-5px' },
  systemBtn: { width: '40px', height: '12px', background: '#718096', border: 'none', borderRadius: '6px', cursor: 'pointer', transform: 'rotate(-15deg)', boxShadow: '1px 1px 0 #000' },
  btnLabelSmall: { fontSize: '9px', color: '#64748b', marginTop: '4px', letterSpacing: '1px' },
};

export default MoneyRoomPage;
