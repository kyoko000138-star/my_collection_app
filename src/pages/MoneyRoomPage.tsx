import React, { useState, useEffect, useMemo } from 'react';

// Types
import { 
  UserState, Scene, SubscriptionPlan, FieldObject, 
  AssetBuildingsState, ShadowMonster, MonsterStat, LocationId,
  Transaction 
} from '../money/types';
import { CLASS_TYPES } from '../money/constants';
import { WORLD_LOCATIONS } from '../money/gameData';

// Logic
import {
  checkDailyReset,
  applySpend,
  applyTransaction, 
  applyDayEnd,
  applySubscriptionChargesIfDue,
  getAssetBuildingsView,
  applyUseGardenItem,
  applyEquipItem,
  applyBuyItem
} from '../money/moneyGameLogic';
import { getKSTDateString, getMoneyWeather, getWeatherMeta } from '../money/moneyWeather';
import { RewardItem } from '../money/rewardData';

// Views
import { GardenView } from '../money/components/GardenView'; 
import { VillageMap } from '../money/components/VillageMap';
import { LibraryView } from '../money/components/LibraryView';
import { WorldMapView } from '../money/components/WorldMapView';
import { BattleView } from '../money/components/BattleView';
import { FieldView } from '../money/components/FieldView';
import { MyRoomView } from '../money/components/MyRoomView';
import { InventoryView } from '../money/components/InventoryView';
import { SettingsView } from '../money/components/SettingsView';
import { ForgeView } from '../money/components/ForgeView';
import { ShopView } from '../money/components/ShopView';
import { CollectionView } from '../money/components/CollectionView';
import { MonthlyReportView } from '../money/components/MonthlyReportView';

// Modals
import { WeatherOverlay } from '../money/components/WeatherOverlay';
import { RewardModal } from '../money/components/RewardModal';
import { KingdomModal } from '../money/components/KingdomModal'; 
import { CollectionModal } from '../money/components/CollectionModal';
import { OnboardingModal } from '../money/components/OnboardingModal';
import DailyLogModal from '../money/components/DailyLogModal';
import { SubscriptionModal } from '../money/components/SubscriptionModal';
import { StampRallyModal } from '../money/components/StampRallyModal'; // [NEW] 추가

// [중요] 저장소 키 변경 (데이터 충돌 방지)
const STORAGE_KEY = 'money-room-save-v10-fix';

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
  
  // [CRITICAL FIX] 루나 시스템 초기값 (v2 구조 준수)
  lunaCycle: { 
    history: [], // 빈 배열 필수! (이게 없어서 터짐)
    avgCycleLength: 28,
    avgPeriodLength: 5,
    currentPhase: 'FOLLICULAR', 
    nextPeriodDate: '',
    dDay: 0
  },

  inventory: [],
  collection: [],
  pending: [], 
  materials: {}, 
  equipped: { weapon: null, armor: null, accessory: null },
  assets: INITIAL_ASSETS,
  counters: {
    defenseActionsToday: 0, junkObtainedToday: 0, noSpendStreak: 0, dailyTotalSpend: 0,
    guardPromptShownToday: false, hadSpendingToday: false, lastDailyResetDate: '', lastDayEndDate: '',
    cumulativeDefense: 0, noSpendStamps: {} 
  },
  subscriptions: [],
  unresolvedShadows: [], 
  npcAffection: { gardener: 0, angel: 0, demon: 0, curator: 0 },
  stats: { attack: 1, defense: 10 },
  currentLocation: 'VILLAGE_BASE',
  unlockedLocations: ['VILLAGE_BASE'],
  gardenNutrients: { savedAmount: 0, debtRepaid: 0 }
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
    materials: { ...base.materials, ...(saved.materials || {}) },
    equipped: { ...base.equipped, ...(saved.equipped || {}) },
    npcAffection: { ...base.npcAffection, ...(saved.npcAffection || {}) },
    currentLocation: saved.currentLocation || base.currentLocation,
    unlockedLocations: Array.isArray(saved.unlockedLocations) ? saved.unlockedLocations : base.unlockedLocations,
    gardenNutrients: { ...base.gardenNutrients, ...(saved.gardenNutrients || {}) },
    // LunaCycle 병합 안전장치
    lunaCycle: {
        ...base.lunaCycle,
        ...(saved.lunaCycle || {}),
        history: saved.lunaCycle?.history || base.lunaCycle.history
    }
  };
};

const MoneyRoomPage: React.FC = () => {
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

  const [scene, setScene] = useState<Scene>(Scene.GARDEN);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });
  const [fieldObjects, setFieldObjects] = useState<FieldObject[]>([]);
  const [targetShadowId, setTargetShadowId] = useState<string | null>(null); 

  const [showDailyLog, setShowDailyLog] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [lastReward, setLastReward] = useState<RewardItem | null>(null);
  
  // [NEW] 스탬프 랠리 모달 상태
  const [showStamp, setShowStamp] = useState(false);

  // 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // 일일 리셋 체크
  useEffect(() => {
    setGameState((prev) => {
      const merged = mergeUserState(INITIAL_STATE, prev);
      const reset = checkDailyReset(merged);
      const sub = applySubscriptionChargesIfDue(reset);
      if (sub.logs.length > 0) {
        alert(`[자동 청구]\n${sub.logs.join('\n')}`);
      }
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

  // --- Field Logic ---

  const regenerateFieldItems = () => {
    const newObjects: FieldObject[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `obj_${Date.now()}_${i}`,
      x: Math.floor(Math.random() * 80 + 10),
      y: Math.floor(Math.random() * 80 + 10),
      type: Math.random() > 0.6 ? 'JUNK' : 'HERB',
      isCollected: false
    }));

    const allLocs = Object.keys(WORLD_LOCATIONS) as LocationId[];
    const hasLocked = allLocs.some(loc => !gameState.unlockedLocations.includes(loc));
    
    if (hasLocked && Math.random() < 0.5) {
      newObjects.push({
        id: `signpost_${Date.now()}`,
        x: Math.floor(Math.random() * 60 + 20),
        y: Math.floor(Math.random() * 60 + 20),
        type: 'SIGNPOST',
        isCollected: false
      });
    }

    setFieldObjects(newObjects);
  };

  const enterDungeon = (dungeonId: string) => {
    setActiveDungeon(dungeonId);
    regenerateFieldItems();
    setPlayerPos({ x: 50, y: 50 });
    setScene(Scene.FIELD);
  };

  const handleMove = (dx: number, dy: number) => {
    if (scene !== Scene.FIELD) return;
    setPlayerPos(prev => {
      let nextX = prev.x + dx;
      let nextY = prev.y + dy;
      let mapChanged = false;
      if (nextX < 0) { nextX = 95; mapChanged = true; }
      if (nextX > 100) { nextX = 5; mapChanged = true; }
      if (nextY < 0) { nextY = 95; mapChanged = true; }
      if (nextY > 100) { nextY = 5; mapChanged = true; }
      if (mapChanged) regenerateFieldItems();

      const hitShadow = gameState.unresolvedShadows?.find(s => {
        const dist = Math.sqrt(Math.pow(s.x - nextX, 2) + Math.pow(s.y - nextY, 2));
        return dist < 8; 
      });

      if (hitShadow) {
        alert("👻 그림자가 실체화되어 덤벼듭니다!");
        setActiveDungeon(hitShadow.category);
        setTargetShadowId(hitShadow.id); 
        setScene(Scene.BATTLE);
        return prev; 
      }

      if (!mapChanged && Math.random() < 0.1) {
        setTargetShadowId(null); 
        setScene(Scene.BATTLE);
        return prev;
      }

      setFieldObjects(objs => objs.map(obj => {
        if (obj.isCollected) return obj;
        const dist = Math.sqrt(Math.pow(obj.x - nextX, 2) + Math.pow(obj.y - nextY, 2));
        
        if (dist < 8) {
          if (obj.type === 'SIGNPOST') {
            const allLocs = Object.keys(WORLD_LOCATIONS) as LocationId[];
            const locked = allLocs.filter(loc => !gameState.unlockedLocations.includes(loc));
            if (locked.length > 0) {
              const newLoc = locked[0];
              setGameState(gs => ({
                ...gs,
                unlockedLocations: [...gs.unlockedLocations, newLoc]
              }));
              alert(`🗺️ 낡은 이정표를 발견했습니다!\n[${WORLD_LOCATIONS[newLoc].name}] 위치가 지도에 기록되었습니다.`);
            } else {
              alert("🗺️ 이미 모든 지역을 발견했습니다.");
            }
          } else {
            setGameState(gs => ({ ...gs, junk: gs.junk + 1 }));
          }
          return { ...obj, isCollected: true };
        }
        return obj;
      }));
      return { x: nextX, y: nextY };
    });
  };

  // --- Handlers ---

  // [NEW] v4 통합 트랜잭션 핸들러
  const handleTransaction = (txData: any) => {
    const result = applyTransaction(gameState, txData);
    setGameState(result.newState);
    if (result.message) {
      alert(result.message);
    }
  };

  const handleRecordSpend = (amount: number, type: 'SPEND' | 'INSTALLMENT' | 'LOAN', description: string) => {
    let dungeonType = 'etc';
    if (type === 'INSTALLMENT') dungeonType = 'shopping'; 
    else if (type === 'LOAN') dungeonType = 'transport'; 
    else if (type === 'SPEND' && description.includes('식비')) dungeonType = 'food';

    const { newState } = applySpend(gameState, amount, false, dungeonType);
    
    const newShadow: ShadowMonster = {
      id: `shadow_${Date.now()}`,
      amount: amount,
      category: dungeonType,
      createdAt: new Date().toISOString(),
      x: Math.floor(Math.random() * 80 + 10),
      y: Math.floor(Math.random() * 80 + 10),
    };
    setGameState({
      ...newState,
      unresolvedShadows: [...(newState.unresolvedShadows || []), newShadow]
    });
    setScene(Scene.LIBRARY);
  };

  const handleBattleWin = () => {
    setGameState(prev => ({
      ...prev,
      junk: prev.junk + (targetShadowId ? 5 : 2), 
      unresolvedShadows: targetShadowId 
        ? prev.unresolvedShadows.filter(s => s.id !== targetShadowId)
        : prev.unresolvedShadows
    }));
    setTargetShadowId(null);
    alert("⚔️ 승리! 대상을 정화하고 Junk를 획득했습니다.");
    setScene(Scene.FIELD);
  };

  const handleBattleRun = () => {
    alert("🏃 급히 도망쳤습니다...");
    setScene(Scene.FIELD);
  };

  const handleConsumeMp = (amount: number) => {
    setGameState(prev => ({...prev, mp: Math.max(0, prev.mp - amount)}));
  };

  const handleUpdateUser = (newState: UserState) => {
    setGameState(newState);
  };

  const handleUseGardenItem = (itemId: string) => {
    const result = applyUseGardenItem(gameState, itemId);
    if (result.success) {
      setGameState(result.newState);
      alert(`✨ ${result.message}`);
    } else {
      alert(`🚫 ${result.message}`);
    }
  };

  const handleEquipItem = (itemId: string) => {
    const result = applyEquipItem(gameState, itemId);
    if (result.success) {
      setGameState(result.newState);
    } else {
      alert(`🚫 ${result.message}`);
    }
  };

  const handleBuyItem = (itemId: string) => {
    const result = applyBuyItem(gameState, itemId);
    if (result.success) {
      setGameState(result.newState);
      alert(`🛒 ${result.message}`);
    } else {
      alert(`🚫 ${result.message}`);
    }
  };

  const handleLocationChange = (locId: LocationId) => {
    setGameState(prev => ({ ...prev, currentLocation: locId }));
    alert(`${WORLD_LOCATIONS[locId].name}로 이동했습니다!`);
  };

  // --- Buttons & Navigation ---

  const handleActionA = () => {
    if (scene === Scene.GARDEN) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.VILLAGE_MAP) setScene(Scene.WORLD_MAP);
    else if (scene === Scene.FIELD) {
       if(Math.random() > 0.5) alert("아무것도 없었다.");
       else setScene(Scene.BATTLE);
    }
  };

  const handleActionB = () => {
    if (scene === Scene.BATTLE) setScene(Scene.FIELD);
    else if (scene === Scene.FIELD) setScene(Scene.WORLD_MAP);
    else if (scene === Scene.WORLD_MAP) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.LIBRARY || scene === Scene.FORGE || scene === Scene.SHOP) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.VILLAGE_MAP) setScene(Scene.GARDEN);
    else if (scene === Scene.MY_ROOM || scene === Scene.INVENTORY || scene === Scene.SETTINGS) setScene(Scene.GARDEN);
    else if (scene === Scene.COLLECTION || scene === Scene.MONTHLY_REPORT) setScene(Scene.GARDEN);
  };

  const handleDayEnd = () => {
    const shadowCount = gameState.unresolvedShadows?.length || 0;
    if (shadowCount > 0) {
      if (!confirm(`🌑 그림자가 ${shadowCount}마리 남아있습니다.\n청산하지 않고 주무시겠습니까?`)) return;
    }
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
      lunaCycle: { ...prev.lunaCycle, history: [] },
      materials: {}, 
      equipped: { weapon: null, armor: null, accessory: null },
      currentLocation: 'VILLAGE_BASE',
      unlockedLocations: ['VILLAGE_BASE']
    }));
  };
  const handlePullSeed = () => { };
  const handleAddSub = (p: SubscriptionPlan) => setGameState(prev => ({...prev, subscriptions: [...prev.subscriptions, p]}));
  const handleRemoveSub = (id: string) => setGameState(prev => ({...prev, subscriptions: prev.subscriptions.filter(s => s.id !== id)}));

  const battleMonster: MonsterStat = targetShadowId
    ? { name: '지출의 그림자', hp: 50, maxHp: 50, attack: 10, sprite: '👻', rewardJunk: 5 }
    : { name: '잡동사니 몬스터', hp: 30, maxHp: 30, attack: 5, sprite: '📦', rewardJunk: 2 };

  return (
    <div style={consoleStyles.body}>
      <div style={consoleStyles.hud}>
        <div style={consoleStyles.hudRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={consoleStyles.levelBadge}>Lv.{gameState.level}</span>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{gameState.name}</span>
          </div>
          {/* [NEW] 날씨 아이콘 클릭 시 스탬프 랠리 오픈 */}
          <span onClick={() => setShowStamp(true)} style={{cursor: 'pointer'}} title="출석부 보기">
            {weatherMeta.icon}
          </span>
        </div>
        <div style={consoleStyles.hpBarFrame}>
          <div style={{
            ...consoleStyles.hpBarFill, width: `${Math.max(0, hpPercent)}%`,
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

      <div style={consoleStyles.screenBezel}>
        <div style={consoleStyles.screenContent}>
          {scene === Scene.GARDEN && <WeatherOverlay weather={weather} />}
          <div style={consoleStyles.crtEffect} />

          {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

          {/* Views Switching */}
          {scene === Scene.GARDEN && (
            <GardenView 
              user={gameState} 
              onChangeScene={setScene} 
              onDayEnd={handleDayEnd}
              onUseItem={handleUseGardenItem}
            />
          )}
          
          {scene === Scene.MY_ROOM && (
            <MyRoomView 
              user={gameState} 
              rpgStats={gameState.stats || { attack: 1, defense: 10 }}
              onBack={() => setScene(Scene.GARDEN)} 
              onOpenInventory={() => setScene(Scene.INVENTORY)}
              onOpenSettings={() => setScene(Scene.SETTINGS)}
            />
          )}

          {scene === Scene.VILLAGE_MAP && (
             <VillageMap 
                onChangeScene={setScene} 
                npcAffection={gameState.npcAffection}
                onNpcInteraction={(id) => alert(`${id}와 대화 시도!`)}
             />
          )}
          
          {/* [핵심] 도서관 (새로운 handleTransaction 전달) */}
          {scene === Scene.LIBRARY && (
            <LibraryView 
              user={gameState} 
              onRecordTransaction={handleTransaction} 
              onOpenSubs={() => setScene(Scene.SUBSCRIPTION)} 
              onBack={() => setScene(Scene.VILLAGE_MAP)} 
            />
          )}
          
          {scene === Scene.FORGE && (
            <ForgeView 
              user={gameState} 
              onUpdateUser={handleUpdateUser} 
              onBack={() => setScene(Scene.VILLAGE_MAP)} 
            />
          )}
          {scene === Scene.SHOP && (
            <ShopView 
              salt={gameState.salt} 
              onBuyItem={handleBuyItem} 
              onBack={() => setScene(Scene.VILLAGE_MAP)} 
            />
          )}

          {scene === Scene.WORLD_MAP && (
            <WorldMapView 
                currentLocation={gameState.currentLocation}
                unlockedLocations={gameState.unlockedLocations}
                onSelectLocation={handleLocationChange}
                onSelectDungeon={enterDungeon} 
                onBack={() => setScene(Scene.VILLAGE_MAP)} 
            />
          )}
          {scene === Scene.FIELD && (
            <FieldView 
              playerPos={playerPos} objects={fieldObjects} 
              shadows={gameState.unresolvedShadows || []} 
              dungeonName={activeDungeon} 
            />
          )}
          
          {scene === Scene.BATTLE && (
            <BattleView 
              monster={battleMonster}
              playerMp={gameState.mp}
              playerStats={gameState.stats}
              onWin={handleBattleWin}
              onRun={handleBattleRun}
              onConsumeMp={handleConsumeMp}
            />
          )}

          {scene === Scene.INVENTORY && (
            <InventoryView 
              user={gameState} 
              onBack={() => setScene(Scene.MY_ROOM)} 
              onUseItem={handleUseGardenItem} 
              onEquipItem={handleEquipItem}
            />
          )}
          {scene === Scene.SETTINGS && <SettingsView user={gameState} onSave={(u) => setGameState(p=>({...p, ...u}))} onBack={() => setScene(Scene.MY_ROOM)} />}
          
          {/* New Views */}
          {scene === Scene.COLLECTION && <CollectionView user={gameState} onBack={() => setScene(Scene.GARDEN)} />}
          {scene === Scene.MONTHLY_REPORT && <MonthlyReportView user={gameState} onBack={() => setScene(Scene.LIBRARY)} />}
          
          <KingdomModal open={scene === Scene.KINGDOM} onClose={() => setScene(Scene.GARDEN)} buildings={getAssetBuildingsView(gameState)} onManageSubs={() => {}} />
          <CollectionModal open={scene === Scene.COLLECTION} onClose={() => setScene(Scene.GARDEN)} collection={gameState.collection} />
          <SubscriptionModal open={scene === Scene.SUBSCRIPTION} onClose={() => setScene(Scene.LIBRARY)} plans={gameState.subscriptions} onAdd={handleAddSub} onRemove={handleRemoveSub} />
          
          {/* [NEW] 스탬프 랠리 모달 */}
          <StampRallyModal 
            open={showStamp} 
            onClose={() => setShowStamp(false)} 
            stamps={gameState.counters.noSpendStamps} 
          />
        </div>
      </div>

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
            <span style={consoleStyles.btnLabel}>취소/뒤로</span>
          </div>
          <div style={consoleStyles.btnGroup}>
            <button style={consoleStyles.actionBtnA} onClick={handleActionA}>A</button>
            <span style={consoleStyles.btnLabel}>결정/조사</span>
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
