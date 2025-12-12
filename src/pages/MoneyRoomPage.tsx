// src/pages/MoneyRoomPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { MoneySummaryView } from '../money/components/MoneySummaryView';

// Types & Logic
import { UserState, Scene, SubscriptionPlan, FieldObject, AssetBuildingsState } from '../money/types';
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

// Views (VillageView 삭제됨)
import { GardenView } from '../money/components/GardenView'; 
import { VillageMap } from '../money/components/VillageMap';
import { LibraryView } from '../money/components/LibraryView';
import { WorldMapView } from '../money/components/WorldMapView';
import { BattleView } from '../money/components/BattleView';
import { FieldView } from '../money/components/FieldView';

// Modals
import { WeatherOverlay } from '../money/components/WeatherOverlay';
import { RewardModal } from '../money/components/RewardModal';
import { InventoryModal } from '../money/components/InventoryModal';
import { KingdomModal } from '../money/components/KingdomModal'; // 이름 유지, 내용은 자산 정원
import { CollectionModal } from '../money/components/CollectionModal';
import { OnboardingModal } from '../money/components/OnboardingModal';
import DailyLogModal from '../money/components/DailyLogModal';
import { SubscriptionModal } from '../money/components/SubscriptionModal';

const STORAGE_KEY = 'money-room-save-v5-full';

// ---------------------------------------------------------
// 💾 데이터 초기화
// ---------------------------------------------------------
const INITIAL_ASSETS: AssetBuildingsState = {
  fence: 0, greenhouse: 0, mansion: 0, fountain: 0, barn: 0
};

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
  assets: INITIAL_ASSETS,
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
    assets: { ...base.assets, ...(saved.assets || {}) },
    counters: { ...base.counters, ...(saved.counters || {}) },
    garden: { ...base.garden, ...(saved.garden || {}), decorations: saved.garden?.decorations ?? base.garden.decorations },
    inventory: Array.isArray(saved.inventory) ? saved.inventory : base.inventory,
    subscriptions: Array.isArray(saved.subscriptions) ? saved.subscriptions : base.subscriptions,
  };
};

const MoneyRoomPage: React.FC = () => {
  // -------------------------------------------------------
  // 1. State
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

  // 초기 시작은 무조건 'GARDEN' (홈)
  const [scene, setScene] = useState<Scene>(Scene.GARDEN);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');
  const [viewMode, setViewMode] = useState<'GAME' | 'SUMMARY'>('GAME');
  
  // [NEW] 필드 탐험 관련 상태
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });
  const [fieldObjects, setFieldObjects] = useState<FieldObject[]>([]);

  // Modals
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [lastReward, setLastReward] = useState<RewardItem | null>(null);

  // -------------------------------------------------------
  // 2. Effects & Helpers
  // -------------------------------------------------------
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    setGameState((prev) => {
      const merged = mergeUserState(INITIAL_STATE, prev);
      const reset = checkDailyReset(merged);
      const sub = applySubscriptionChargesIfDue(reset);
      // 알림이 너무 자주 뜨면 주석 처리
      // if (sub.logs.length > 0) alert(sub.logs.join('\n'));
      return sub.newState;
    });
  }, []);

  const todayStr = useMemo(() => getKSTDateString(), []);
  const weather = getMoneyWeather(gameState);
  const weatherMeta = getWeatherMeta(weather);
  const hpPercent = gameState.maxBudget > 0
      ? Math.round((gameState.currentBudget / gameState.maxBudget) * 100)
      : 0;
  const isNewUser = gameState.maxBudget === 0;

  // -------------------------------------------------------
  // 3. Handlers
  // -------------------------------------------------------
  
  // 던전 입장 (필드 생성)
  const enterDungeon = (dungeonId: string) => {
    setActiveDungeon(dungeonId);
    
    // 파밍 아이템 랜덤 생성
    const newObjects: FieldObject[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `obj_${Date.now()}_${i}`,
      x: Math.floor(Math.random() * 80 + 10),
      y: Math.floor(Math.random() * 80 + 10),
      type: Math.random() > 0.6 ? 'JUNK' : 'HERB',
      isCollected: false
    }));
    
    setFieldObjects(newObjects);
    setPlayerPos({ x: 50, y: 50 });
    setScene(Scene.FIELD);
  };

  // D-Pad 이동 (필드에서만 작동)
  const handleMove = (dx: number, dy: number) => {
    if (scene !== Scene.FIELD) return;

    setPlayerPos(prev => {
      const nextX = Math.max(5, Math.min(95, prev.x + dx));
      const nextY = Math.max(5, Math.min(95, prev.y + dy));
      
      // 아이템 습득 체크
      setFieldObjects(objs => objs.map(obj => {
        if (obj.isCollected) return obj;
        const dist = Math.sqrt(Math.pow(obj.x - nextX, 2) + Math.pow(obj.y - nextY, 2));
        if (dist < 6) { // 근접
          setGameState(gs => ({ ...gs, junk: gs.junk + 1 })); // 임시: Junk 획득
          return { ...obj, isCollected: true };
        }
        return obj;
      }));

      return { x: nextX, y: nextY };
    });
  };

  // A 버튼 (결정/상호작용)
  const handleActionA = () => {
    if (scene === Scene.GARDEN) {
      setScene(Scene.VILLAGE_MAP); // 집 밖으로
    } else if (scene === Scene.FIELD) {
      setScene(Scene.BATTLE); // 탐험 중 적 조우(지출)
    } else if (scene === Scene.VILLAGE_MAP) {
      // 맵에서는 건물 클릭으로 이동하므로 A버튼은 일단 월드맵으로
      setScene(Scene.WORLD_MAP);
    }
  };

  // B 버튼 (취소/뒤로가기)
  const handleActionB = () => {
    if (scene === Scene.BATTLE) setScene(Scene.FIELD);
    else if (scene === Scene.FIELD) setScene(Scene.WORLD_MAP);
    else if (scene === Scene.WORLD_MAP) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.VILLAGE_MAP) setScene(Scene.GARDEN);
    else if (scene === Scene.LIBRARY) setScene(Scene.VILLAGE_MAP);
    else setViewMode(prev => prev === 'GAME' ? 'SUMMARY' : 'GAME');
  };

  // Core Logic Wrappers
  const handleSpend = (amt: number) => {
    const { newState, message } = applySpend(gameState, amt, false, activeDungeon);
    setGameState(newState);
    setTimeout(() => { alert(message); setScene(Scene.GARDEN); }, 100);
  };

  const handleGuard = () => {
    const next = applyDefense(gameState);
    setGameState(next);
    setTimeout(() => { alert('🛡️ 방어 성공!'); setScene(Scene.GARDEN); }, 100);
  };

  const handleDayEnd = () => {
    const { newState } = applyDayEnd(gameState);
    let next = newState;
    if (!gameState.counters.hadSpendingToday) next.seedPackets = (next.seedPackets || 0) + 1;
    setGameState(next);
    setShowDailyLog(true);
  };

  const handleOnboarding = (data: any) => {
    setGameState(prev => ({
      ...prev,
      name: data.profile.name,
      jobTitle: data.profile.classType,
      maxBudget: data.budget.total,
      currentBudget: data.budget.current,
      lunaCycle: { ...prev.lunaCycle, startDate: data.luna.nextPeriodDate || todayStr },
    }));
  };

  const handlePullSeed = () => {
    if ((gameState.seedPackets || 0) <= 0) return;
    const reward = pullGacha();
    
    // 리워드 적용 로직
    const applyRewardToState = (state: UserState, r: RewardItem): UserState => {
      const next = JSON.parse(JSON.stringify(state)) as UserState;
      next.seedPackets = Math.max(0, (next.seedPackets || 0) - 1);
      if (r.type === 'DECOR') {
        if (!next.garden.decorations) next.garden.decorations = [];
        next.garden.decorations.push({
          id: r.id, x: Math.floor(15 + Math.random() * 70), y: Math.floor(35 + Math.random() * 40),
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

  // Subscription Handlers
  const handleAddSub = (p: SubscriptionPlan) => setGameState(prev => ({...prev, subscriptions: [...prev.subscriptions, p]}));
  const handleRemoveSub = (id: string) => setGameState(prev => ({...prev, subscriptions: prev.subscriptions.filter(s => s.id !== id)}));

  // -------------------------------------------------------
  // 4. Rendering
  // -------------------------------------------------------
  if (viewMode === 'SUMMARY') return <MoneySummaryView user={gameState} onBackToGame={() => setViewMode('GAME')} />;

  return (
    <div style={consoleStyles.body}>
      
      {/* [HUD] 상단 정보 */}
      <div style={consoleStyles.hud}>
        <div style={consoleStyles.hudRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={consoleStyles.levelBadge}>Lv.{gameState.level}</span>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{gameState.name}</span>
          </div>
          <span>{weatherMeta.icon}</span>
        </div>
        <div style={consoleStyles.hpBarFrame}>
          <div style={{
            ...consoleStyles.hpBarFill, width: `${hpPercent}%`,
            backgroundColor: gameState.status.mode === 'DARK' ? '#4b5563' : '#ef4444'
          }} />
          <span style={consoleStyles.hpText}>
            HP {gameState.currentBudget.toLocaleString()} / {gameState.maxBudget.toLocaleString()}
          </span>
        </div>
        <div style={consoleStyles.hudRowBottom}>
          <span style={{ color: '#60a5fa' }}>MP {gameState.mp}/{gameState.maxMp}</span>
          <span onClick={() => setRewardOpen(true)} style={{ cursor: 'pointer', color: gameState.seedPackets ? '#4ade80' : '#6b7280' }}>
            🌱 {gameState.seedPackets || 0}
          </span>
        </div>
      </div>

      {/* [SCREEN] 중앙 게임 화면 */}
      <div style={consoleStyles.screenBezel}>
        <div style={consoleStyles.screenContent}>
          {/* 오버레이 효과 */}
          {scene === Scene.GARDEN && <WeatherOverlay weather={weather} />}
          <div style={consoleStyles.crtEffect} />

          {/* Scene Routing */}
          {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

          {scene === Scene.GARDEN && (
            <GardenView user={gameState} onChangeScene={setScene} onDayEnd={handleDayEnd} />
          )}
          {scene === Scene.VILLAGE_MAP && (
            <VillageMap onChangeScene={setScene} />
          )}
          {scene === Scene.LIBRARY && (
            <LibraryView onOpenSubs={() => setScene(Scene.SUBSCRIPTION)} onBack={() => setScene(Scene.VILLAGE_MAP)} />
          )}
          {scene === Scene.WORLD_MAP && (
            <WorldMapView onSelectDungeon={enterDungeon} onBack={() => setScene(Scene.VILLAGE_MAP)} />
          )}
          {scene === Scene.FIELD && (
            <FieldView playerPos={playerPos} objects={fieldObjects} dungeonName={activeDungeon} />
          )}
          {scene === Scene.BATTLE && (
            <BattleView 
              dungeonId={activeDungeon} playerHp={gameState.currentBudget} maxHp={gameState.maxBudget} 
              onSpend={handleSpend} onGuard={handleGuard} onRun={() => setScene(Scene.GARDEN)} 
            />
          )}

          {/* Modals (Overlay) */}
          <InventoryModal 
            open={scene === Scene.INVENTORY} onClose={() => setScene(Scene.GARDEN)} 
            junk={gameState.junk} salt={gameState.salt} materials={gameState.materials} equipment={[]} 
            collection={gameState.collection} canPurify={true} onPurify={()=>{}} onCraft={()=>{}} 
          />
          <KingdomModal 
            open={scene === Scene.KINGDOM} onClose={() => setScene(Scene.GARDEN)} 
            buildings={getAssetBuildingsView(gameState)} onManageSubs={() => setScene(Scene.SUBSCRIPTION)} 
          />
          <CollectionModal open={scene === Scene.COLLECTION} onClose={() => setScene(Scene.GARDEN)} collection={gameState.collection} />
          <SubscriptionModal 
            open={scene === Scene.SUBSCRIPTION} onClose={() => setScene(Scene.LIBRARY)} 
            plans={gameState.subscriptions} onAdd={handleAddSub} onRemove={handleRemoveSub} 
          />
        </div>
      </div>

      {/* [CONTROLLER] 하단 조작부 */}
      <div style={consoleStyles.controlDeck}>
        {/* D-Pad */}
        <div style={consoleStyles.dpadArea}>
          <div style={consoleStyles.dpad}>
             <div style={consoleStyles.dpadUp} onClick={() => handleMove(0, -10)}>▲</div>
             <div style={consoleStyles.dpadLeft} onClick={() => handleMove(-10, 0)}>◀</div>
             <div style={consoleStyles.dpadRight} onClick={() => handleMove(10, 0)}>▶</div>
             <div style={consoleStyles.dpadDown} onClick={() => handleMove(0, 10)}>▼</div>
          </div>
          <div style={{marginTop:4, fontSize:9, color:'#64748b'}}>MOVE</div>
        </div>

        {/* Action Buttons */}
        <div style={consoleStyles.actionBtnArea}>
          <div style={consoleStyles.btnGroup}>
            <button style={consoleStyles.actionBtnB} onClick={handleActionB}>B</button>
            <span style={consoleStyles.btnLabel}>취소/이전</span>
          </div>
          <div style={consoleStyles.btnGroup}>
            <button style={consoleStyles.actionBtnA} onClick={handleActionA}>A</button>
            <span style={consoleStyles.btnLabel}>결정/조사</span>
          </div>
        </div>

        {/* System Buttons */}
        <div style={consoleStyles.systemBtnArea}>
           <button style={consoleStyles.systemBtn} onClick={() => setScene(Scene.KINGDOM)}>SELECT</button>
           <button style={consoleStyles.systemBtn} onClick={() => setScene(Scene.COLLECTION)}>START</button>
        </div>
      </div>

      {/* Global Modals */}
      <DailyLogModal open={showDailyLog} onClose={()=>setShowDailyLog(false)} today={todayStr} hp={hpPercent} mp={gameState.mp} def={0} junkToday={0} defenseActionsToday={0} noSpendStreak={0} pending={[]} />
      <RewardModal open={rewardOpen} seedPackets={gameState.seedPackets || 0} lastReward={lastReward} onPull={handlePullSeed} onClose={() => setRewardOpen(false)} />
    </div>
  );
};

// ---------------------------------------------------------
// 🎨 Styles (Console Layout)
// ---------------------------------------------------------
const consoleStyles: Record<string, React.CSSProperties> = {
  body: { width: '100%', maxWidth: '420px', margin: '0 auto', height: '100dvh', backgroundColor: '#202025', display: 'flex', flexDirection: 'column', fontFamily: '"NeoDungGeunMo", monospace', overflow: 'hidden', color: '#fff', position: 'relative' },
  hud: { height: '80px', backgroundColor: '#2d3748', borderBottom: '4px solid #1a202c', padding: '10px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', zIndex: 10, boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.3)' },
  hudRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' },
  hudRowBottom: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  levelBadge: { backgroundColor: '#4a5568', padding: '1px 4px', borderRadius: '4px', fontSize: '10px', color: '#e2e8f0' },
  hpBarFrame: { width: '100%', height: '16px', backgroundColor: '#111', border: '2px solid #555', borderRadius: '4px', position: 'relative', overflow: 'hidden' },
  hpBarFill: { height: '100%', transition: 'width 0.5s ease-out' },
  hpText: { position: 'absolute', width: '100%', textAlign: 'center', top: 0, lineHeight: '14px', fontSize: '10px', color: '#fff', textShadow: '1px 1px 0 #000', fontWeight: 'bold' },
  screenBezel: { flex: 1, backgroundColor: '#000', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', boxShadow: 'inset 0 0 15px #000' },
  screenContent: { width: '100%', height: '100%', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '2px solid #444', display: 'flex', flexDirection: 'column' },
  crtEffect: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99, background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '100% 4px', opacity: 0.15 },
  controlDeck: { height: '180px', backgroundColor: '#2d3748', borderTop: '4px solid #4a5568', padding: '15px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr auto', gap: '10px', boxShadow: 'inset 0 5px 10px rgba(0,0,0,0.3)' },
  dpadArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  dpad: { position: 'relative', width: '90px', height: '90px' },
  dpadCenter: { position: 'absolute', top: 30, left: 30, width: 30, height: 30, backgroundColor: '#1a202c' },
  dpadUp: { position: 'absolute', top: 0, left: 30, width: 30, height: 30, backgroundColor: '#1a202c', borderRadius: '4px 4px 0 0', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color: '#4a5568', boxShadow: '0 4px 0 #000' },
  dpadDown: { position: 'absolute', bottom: 0, left: 30, width: 30, height: 30, backgroundColor: '#1a202c', borderRadius: '0 0 4px 4px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color: '#4a5568', boxShadow: '0 4px 0 #000' },
  dpadLeft: { position: 'absolute', top: 30, left: 0, width: 30, height: 30, backgroundColor: '#1a202c', borderRadius: '4px 0 0 4px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color: '#4a5568', boxShadow: '0 4px 0 #000' },
  dpadRight: { position: 'absolute', top: 30, right: 0, width: 30, height: 30, backgroundColor: '#1a202c', borderRadius: '0 4px 4px 0', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color: '#4a5568', boxShadow: '0 4px 0 #000' },
  actionBtnArea: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', paddingBottom: '10px' },
  btnGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  actionBtnA: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e53e3e', border: 'none', boxShadow: '0 4px 0 #9b2c2c', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-10px' },
  actionBtnB: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#d69e2e', border: 'none', boxShadow: '0 4px 0 #975a16', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px' },
  btnLabel: { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' },
  systemBtnArea: { gridColumn: 'span 2', display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '-5px' },
  systemBtn: { width: '50px', height: '12px', background: '#718096', border: 'none', borderRadius: '6px', cursor: 'pointer', transform: 'rotate(-15deg)', boxShadow: '1px 1px 0 #000', color:'#cbd5e1', fontSize:'8px', display:'flex', alignItems:'center', justifyContent:'center' }
};

export default MoneyRoomPage;
