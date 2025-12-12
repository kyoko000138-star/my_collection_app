// src/pages/MoneyRoomPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { MoneySummaryView } from '../money/components/MoneySummaryView';

// Types & Logic
import { UserState, Scene, SubscriptionPlan, FieldObject, AssetBuildingsState, ShadowMonster } from '../money/types';
import { CLASS_TYPES } from '../money/constants';
import {
  checkDailyReset, applySpend, applyDefense, applyDayEnd, applyPurify, 
  applyCraftEquipment, getAssetBuildingsView, getDailyMonster, applySubscriptionChargesIfDue
} from '../money/moneyGameLogic';
import { getKSTDateString, getMoneyWeather, getWeatherMeta } from '../money/moneyWeather';
import { pullGacha, RewardItem, DECOR_EMOJI } from '../money/rewardData';

// Views
import { GardenView } from '../money/components/GardenView'; 
import { VillageMap } from '../money/components/VillageMap';
import { LibraryView } from '../money/components/LibraryView';
import { WorldMapView } from '../money/components/WorldMapView';
import { BattleView } from '../money/components/BattleView';
import { FieldView } from '../money/components/FieldView';
import { MyRoomView } from '../money/components/MyRoomView';

// Modals
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
// 💾 데이터 초기화
// ---------------------------------------------------------
const INITIAL_ASSETS: AssetBuildingsState = { fence: 0, greenhouse: 0, mansion: 0, fountain: 0, barn: 0 };

const INITIAL_STATE: UserState = {
  name: 'Player 1', level: 1, jobTitle: CLASS_TYPES.GUARDIAN,
  currentBudget: 0, maxBudget: 0, mp: 30, maxMp: 30, junk: 0, salt: 0, seedPackets: 0,
  garden: { treeLevel: 0, pondLevel: 0, flowerState: 'normal', weedCount: 0, decorations: [] },
  status: { mode: 'NORMAL', darkLevel: 0 },
  lunaCycle: { startDate: '', periodLength: 5, cycleLength: 28 },
  inventory: [], collection: [], pending: [], materials: {},
  assets: INITIAL_ASSETS,
  counters: { defenseActionsToday: 0, junkObtainedToday: 0, noSpendStreak: 0, dailyTotalSpend: 0, guardPromptShownToday: false, hadSpendingToday: false },
  subscriptions: [],
  unresolvedShadows: [] // [NEW] 그림자 스택
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
    unresolvedShadows: Array.isArray(saved.unresolvedShadows) ? saved.unresolvedShadows : base.unresolvedShadows,
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
    } catch { return INITIAL_STATE; }
  });

  const [scene, setScene] = useState<Scene>(Scene.GARDEN);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');
  const [viewMode, setViewMode] = useState<'GAME' | 'SUMMARY'>('GAME');
  
  // 탐험 상태
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });
  const [fieldObjects, setFieldObjects] = useState<FieldObject[]>([]);
  const [targetShadowId, setTargetShadowId] = useState<string | null>(null); // 전투 중인 그림자 ID

  // Modals
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [lastReward, setLastReward] = useState<RewardItem | null>(null);

  // -------------------------------------------------------
  // 2. Effects & Helpers
  // -------------------------------------------------------
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState)); }, [gameState]);

  useEffect(() => {
    setGameState((prev) => {
      const merged = mergeUserState(INITIAL_STATE, prev);
      const reset = checkDailyReset(merged);
      const sub = applySubscriptionChargesIfDue(reset);
      return sub.newState;
    });
  }, []);

  const todayStr = useMemo(() => getKSTDateString(), []);
  const weather = getMoneyWeather(gameState);
  const weatherMeta = getWeatherMeta(weather);
  const hpPercent = gameState.maxBudget > 0 ? Math.round((gameState.currentBudget / gameState.maxBudget) * 100) : 0;
  const isNewUser = gameState.maxBudget === 0;

  const currentMonsterType = scene === Scene.BATTLE 
    ? (activeDungeon !== 'etc' ? activeDungeon : getDailyMonster(gameState.pending)) 
    : 'etc';

  // -------------------------------------------------------
  // 3. Handlers
  // -------------------------------------------------------
  
  // 필드 아이템 재생성
  const regenerateFieldItems = () => {
    const newObjects: FieldObject[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `obj_${Date.now()}_${i}`,
      x: Math.floor(Math.random() * 80 + 10),
      y: Math.floor(Math.random() * 80 + 10),
      type: Math.random() > 0.6 ? 'JUNK' : 'HERB',
      isCollected: false
    }));
    setFieldObjects(newObjects);
  };

  const enterDungeon = (dungeonId: string) => {
    setActiveDungeon(dungeonId);
    regenerateFieldItems();
    setPlayerPos({ x: 50, y: 50 });
    setScene(Scene.FIELD);
  };

  // [수정] D-Pad 이동 (무한 맵 + 랜덤 인카운터 + 그림자 충돌)
  const handleMove = (dx: number, dy: number) => {
    if (scene !== Scene.FIELD) return;

    setPlayerPos(prev => {
      let nextX = prev.x + dx;
      let nextY = prev.y + dy;
      
      // 1. 무한 맵 로직 (화면 끝 도달 시 반대편 이동 + 아이템 리젠)
      let mapChanged = false;
      if (nextX < 0) { nextX = 90; mapChanged = true; }
      if (nextX > 100) { nextX = 10; mapChanged = true; }
      if (nextY < 0) { nextY = 90; mapChanged = true; }
      if (nextY > 100) { nextY = 10; mapChanged = true; }

      if (mapChanged) {
        regenerateFieldItems();
      }

      // 2. 그림자(지출 몬스터) 충돌 체크
      const hitShadow = gameState.unresolvedShadows?.find(s => {
        const dist = Math.sqrt(Math.pow(s.x - nextX, 2) + Math.pow(s.y - nextY, 2));
        return dist < 8; 
      });

      if (hitShadow) {
        alert("👻 그림자가 실체화되어 덤벼듭니다! (지출 기록 확인)");
        setActiveDungeon(hitShadow.category);
        setTargetShadowId(hitShadow.id); // 타겟 설정
        setScene(Scene.BATTLE);
        return prev;
      }

      // 3. 랜덤 인카운터 (15%)
      if (Math.random() < 0.15) {
        setTargetShadowId(null); // 일반 몬스터
        setScene(Scene.BATTLE);
        return prev;
      }

      // 4. 아이템 습득
      setFieldObjects(objs => objs.map(obj => {
        if (obj.isCollected) return obj;
        const dist = Math.sqrt(Math.pow(obj.x - nextX, 2) + Math.pow(obj.y - nextY, 2));
        if (dist < 8) {
          setGameState(gs => ({ ...gs, junk: gs.junk + 1 }));
          return { ...obj, isCollected: true };
        }
        return obj;
      }));

      return { x: nextX, y: nextY };
    });
  };

  // [수정] 지출 입력 (그림자 생성)
  const handleSpend = (amt: number) => {
    // 1. 타겟 그림자가 있었다면 제거 (청산)
    if (targetShadowId) {
        const { newState, message } = applySpend(gameState, amt, false, activeDungeon);
        setGameState({
            ...newState,
            unresolvedShadows: newState.unresolvedShadows.filter(s => s.id !== targetShadowId)
        });
        setTargetShadowId(null);
        setTimeout(() => { alert("👻 그림자를 정화했습니다!"); setScene(Scene.FIELD); }, 100);
        return;
    }

    // 2. 일반 지출 (도서관 등에서) -> 그림자 생성
    const { newState, message } = applySpend(gameState, amt, false, activeDungeon);
    const newShadow: ShadowMonster = {
      id: `shadow_${Date.now()}`,
      amount: amt,
      category: activeDungeon,
      createdAt: new Date().toISOString(),
      x: Math.floor(Math.random() * 80 + 10),
      y: Math.floor(Math.random() * 80 + 10),
    };

    setGameState({
      ...newState,
      unresolvedShadows: [...(newState.unresolvedShadows || []), newShadow]
    });

    alert(`${message}\n(필드에 그림자가 생성되었습니다...)`);
    
    // 전투 중이었다면 마을로, 아니면 유지
    if (scene === Scene.BATTLE) setScene(Scene.GARDEN);
  };

  // 나머지 핸들러들
  const handleActionA = () => {
    if (scene === Scene.GARDEN) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.FIELD) setScene(Scene.BATTLE);
    else if (scene === Scene.VILLAGE_MAP) setScene(Scene.WORLD_MAP);
  };

  const handleActionB = () => {
    if (scene === Scene.BATTLE) setScene(Scene.FIELD);
    else if (scene === Scene.FIELD) setScene(Scene.WORLD_MAP);
    else if (scene === Scene.WORLD_MAP) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.LIBRARY) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.VILLAGE_MAP) setScene(Scene.GARDEN);
    else if (scene === Scene.MY_ROOM) setScene(Scene.GARDEN);
    else if (scene === Scene.GARDEN) setViewMode(prev => prev === 'GAME' ? 'SUMMARY' : 'GAME');
  };

  const handleGuard = () => {
    const next = applyDefense(gameState);
    setGameState(next);
    setTimeout(() => { alert('🛡️ 방어 성공!'); setScene(Scene.GARDEN); }, 100);
  };

  const handleDayEnd = () => {
    // 그림자 확인
    const shadowCount = gameState.unresolvedShadows?.length || 0;
    if (shadowCount > 0) {
        if (!confirm(`🌑 그림자가 ${shadowCount}마리 남아있습니다. 정말 주무시겠습니까?\n(그림자는 계속 따라다닙니다)`)) return;
    }

    const { newState } = applyDayEnd(gameState);
    let next = newState;
    if (!gameState.counters.hadSpendingToday) next.seedPackets = (next.seedPackets || 0) + 1;
    setGameState(next);
    setShowDailyLog(true);
  };

  const handleOnboarding = (data: any) => { /* ...기존 유지... */ };
  const handlePullSeed = () => { /* ...기존 유지... */ };
  const handleAddSub = (p: SubscriptionPlan) => setGameState(prev => ({...prev, subscriptions: [...prev.subscriptions, p]}));
  const handleRemoveSub = (id: string) => setGameState(prev => ({...prev, subscriptions: prev.subscriptions.filter(s => s.id !== id)}));

  if (viewMode === 'SUMMARY') return <MoneySummaryView user={gameState} onBackToGame={() => setViewMode('GAME')} />;

  return (
    <div style={consoleStyles.body}>
      
      {/* HUD */}
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

      {/* Screen */}
      <div style={consoleStyles.screenBezel}>
        <div style={consoleStyles.screenContent}>
          {scene === Scene.GARDEN && <WeatherOverlay weather={weather} />}
          <div style={consoleStyles.crtEffect} />

          {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

          {scene === Scene.GARDEN && <GardenView user={gameState} onChangeScene={setScene} onDayEnd={handleDayEnd} />}
          {scene === Scene.VILLAGE_MAP && <VillageMap onChangeScene={setScene} />}
          {scene === Scene.LIBRARY && <LibraryView onOpenSubs={() => setScene(Scene.SUBSCRIPTION)} onBack={() => setScene(Scene.VILLAGE_MAP)} />}
          {scene === Scene.MY_ROOM && <MyRoomView user={gameState} onBack={() => setScene(Scene.GARDEN)} />}
          {scene === Scene.WORLD_MAP && <WorldMapView onSelectDungeon={enterDungeon} onBack={() => setScene(Scene.VILLAGE_MAP)} />}
          
          {scene === Scene.FIELD && (
            <FieldView 
                playerPos={playerPos} 
                objects={fieldObjects} 
                shadows={gameState.unresolvedShadows || []} 
                dungeonName={activeDungeon} 
            />
          )}
          
          {scene === Scene.BATTLE && (
            <BattleView 
              dungeonId={activeDungeon} playerHp={gameState.currentBudget} maxHp={gameState.maxBudget} 
              onSpend={handleSpend} onGuard={handleGuard} onRun={() => setScene(Scene.FIELD)} 
            />
          )}

          {/* Modals */}
          <InventoryModal open={scene === Scene.INVENTORY} onClose={() => setScene(Scene.GARDEN)} junk={gameState.junk} salt={gameState.salt} materials={gameState.materials} equipment={[]} collection={gameState.collection} canPurify={true} onPurify={()=>{}} onCraft={()=>{}} />
          <KingdomModal open={scene === Scene.KINGDOM} onClose={() => setScene(Scene.GARDEN)} buildings={getAssetBuildingsView(gameState)} onManageSubs={() => setScene(Scene.SUBSCRIPTION)} />
          <CollectionModal open={scene === Scene.COLLECTION} onClose={() => setScene(Scene.GARDEN)} collection={gameState.collection} />
          <SubscriptionModal open={scene === Scene.SUBSCRIPTION} onClose={() => setScene(Scene.LIBRARY)} plans={gameState.subscriptions} onAdd={handleAddSub} onRemove={handleRemoveSub} />
        </div>
      </div>

      {/* Controller */}
      <div style={consoleStyles.controlDeck}>
        <div style={consoleStyles.dpadArea}>
          <div style={consoleStyles.dpad}>
             <div style={consoleStyles.dpadUp} onClick={() => handleMove(0, -10)}>▲</div>
             <div style={consoleStyles.dpadLeft} onClick={() => handleMove(-10, 0)}>◀</div>
             <div style={consoleStyles.dpadRight} onClick={() => handleMove(10, 0)}>▶</div>
             <div style={consoleStyles.dpadDown} onClick={() => handleMove(0, 10)}>▼</div>
          </div>
          <div style={{marginTop:4, fontSize:9, color:'#64748b'}}>MOVE</div>
        </div>
        <div style={consoleStyles.actionBtnArea}>
          <div style={consoleStyles.btnGroup}>
            <button style={consoleStyles.actionBtnB} onClick={handleActionB}>B</button>
            <span style={consoleStyles.btnLabel}>취소</span>
          </div>
          <div style={consoleStyles.btnGroup}>
            <button style={consoleStyles.actionBtnA} onClick={handleActionA}>A</button>
            <span style={consoleStyles.btnLabel}>결정</span>
          </div>
        </div>
        <div style={consoleStyles.systemBtnArea}>
           <div style={consoleStyles.btnGroup}>
             <button style={consoleStyles.systemBtn} onClick={() => setScene(Scene.KINGDOM)} />
             <span style={consoleStyles.btnLabelSmall}>자산</span>
           </div>
           <div style={consoleStyles.btnGroup}>
             <button style={consoleStyles.systemBtn} onClick={() => setScene(Scene.MY_ROOM)} />
             <span style={consoleStyles.btnLabelSmall}>마이룸</span>
           </div>
        </div>
      </div>

      <DailyLogModal open={showDailyLog} onClose={()=>setShowDailyLog(false)} today={todayStr} hp={hpPercent} mp={gameState.mp} def={0} junkToday={0} defenseActionsToday={0} noSpendStreak={0} pending={[]} />
      <RewardModal open={rewardOpen} seedPackets={gameState.seedPackets || 0} lastReward={lastReward} onPull={handlePullSeed} onClose={() => setRewardOpen(false)} />
    </div>
  );
};

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
  systemBtn: { width: '50px', height: '12px', background: '#718096', border: 'none', borderRadius: '6px', cursor: 'pointer', transform: 'rotate(-15deg)', boxShadow: '1px 1px 0 #000' },
  btnLabelSmall: { fontSize: '9px', color: '#64748b', marginTop: '4px', letterSpacing: '1px' },
};

export default MoneyRoomPage;
