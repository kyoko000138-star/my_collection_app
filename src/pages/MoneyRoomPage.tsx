// src/pages/MoneyRoomPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserState, Scene, AssetBuildingsState, LocationId, ShadowMonster, SubscriptionPlan 
} from '../money/types';
import { MAP_CONNECTIONS, MAP_INFO, ASSET_OBJECTS } from '../money/gameData';
import {
  checkDailyReset, applySpend, applyTransaction, applyDayEnd,
  applySubscriptionChargesIfDue, getAssetBuildingsView,
  applyUseGardenItem, applyEquipItem, applyBuyItem, applyPurifySkill
} from '../money/moneyGameLogic';
import { getKSTDateString, getMoneyWeather, getWeatherMeta } from '../money/moneyWeather';
import { RewardItem } from '../money/rewardData'; // Import 복원

// Views
import { GardenView } from '../money/components/GardenView';
import { FieldView } from '../money/components/FieldView';
import { VillageMap } from '../money/components/VillageMap';
import { LibraryView } from '../money/components/LibraryView';
import { MyRoomView } from '../money/components/MyRoomView';
import { InventoryView } from '../money/components/InventoryView';
import { SettingsView } from '../money/components/SettingsView';
import { ForgeView } from '../money/components/ForgeView';
import { ShopView } from '../money/components/ShopView';
import { CollectionView } from '../money/components/CollectionView';
import { MonthlyReportView } from '../money/components/MonthlyReportView';
import { BattleView } from '../money/components/BattleView';
import { WorldMapView } from '../money/components/WorldMapView'; // Import 복원

// Modals
import { WeatherOverlay } from '../money/components/WeatherOverlay';
import { RewardModal } from '../money/components/RewardModal';
import { KingdomModal } from '../money/components/KingdomModal'; 
import { CollectionModal } from '../money/components/CollectionModal';
import { OnboardingModal } from '../money/components/OnboardingModal';
import DailyLogModal from '../money/components/DailyLogModal';
import { SubscriptionModal } from '../money/components/SubscriptionModal';
import { StampRallyModal } from '../money/components/StampRallyModal';

const STORAGE_KEY = 'money-room-save-v11-fixed'; // 키 변경하여 꼬인 데이터 초기화 권장

const INITIAL_ASSETS: AssetBuildingsState = {
  fence: 0, hut: 0, house: 0, mansion: 0, castle: 0, fountain: 0, greenhouse: 0, barn: 0, statue: 0
};

const INITIAL_STATE: UserState = {
  name: 'Player', level: 1, jobTitle: 'NOVICE',
  currentBudget: 0, maxBudget: 0,
  mp: 30, maxMp: 30,
  exp: 0, stats: { str: 1, def: 10, luk: 1 },
  currentLocation: 'VILLAGE_BASE', unlockedLocations: ['VILLAGE_BASE'],
  isExhausted: false,
  assets: INITIAL_ASSETS,
  garden: { treeLevel: 0, pondLevel: 0, flowerState: 'normal', weedCount: 0, decorations: [] },
  
  // [1213_코드.txt source: 105] 빈 배열 초기화 중요!
  lunaCycle: { history: [], avgCycleLength: 28, avgPeriodLength: 5, currentPhase: 'FOLLICULAR', nextPeriodDate: '', dDay: 0 },
  inventory: [], collection: [], subscriptions: [], unresolvedShadows: [],
  counters: { defenseActionsToday: 0, junkObtainedToday: 0, noSpendStreak: 0, dailyTotalSpend: 0, hadSpendingToday: false },
  status: { mode: 'NORMAL', darkLevel: 0 },
  gardenNutrients: { savedAmount: 0, debtRepaid: 0 },
  materials: {}, equipped: {}, npcAffection: {}, junk: 0, salt: 0, seedPackets: 0
};

// [1213_코드.txt source: 107] 병합 로직 복원
const mergeUserState = (base: UserState, saved: Partial<UserState>): UserState => {
  return {
    ...base,
    ...saved,
    assets: { ...base.assets, ...(saved.assets || {}) },
    counters: { ...base.counters, ...(saved.counters || {}) },
    garden: { ...base.garden, ...(saved.garden || {}), decorations: saved.garden?.decorations ?? base.garden.decorations },
    // 배열 복구 로직 유지
    inventory: Array.isArray(saved.inventory) ? saved.inventory : base.inventory,
    unlockedLocations: Array.isArray(saved.unlockedLocations) ? saved.unlockedLocations : base.unlockedLocations,
    lunaCycle: { ...base.lunaCycle, ...(saved.lunaCycle || {}), history: saved.lunaCycle?.history || [] }
  };
};

const MoneyRoomPage: React.FC = () => {
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (!savedRaw) return INITIAL_STATE;
      return mergeUserState(INITIAL_STATE, JSON.parse(savedRaw));
    } catch { return INITIAL_STATE; }
  });

  const [scene, setScene] = useState<Scene>(Scene.GARDEN);
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');
  const [targetShadowId, setTargetShadowId] = useState<string | null>(null); // 복원

  // 자동 저장
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState)); }, [gameState]);

  // 일일 리셋 [1213_코드.txt source: 117]
  useEffect(() => {
    setGameState((prev) => {
      const merged = mergeUserState(INITIAL_STATE, prev);
      const reset = checkDailyReset(merged);
      const sub = applySubscriptionChargesIfDue(reset.newState); // reset.newState 사용
      if (sub.logs.length > 0) alert(`[자동 청구]\n${sub.logs.join('\n')}`);
      return sub.newState;
    });
  }, []);

  const weather = getMoneyWeather(gameState);
  const weatherMeta = getWeatherMeta(weather);
  const hpPercent = gameState.maxBudget > 0 ? (gameState.currentBudget / gameState.maxBudget) * 100 : 0;
  
  // [중요] 입장하기 안되는 원인: isNewUser가 계속 true로 남아서임.
  const isNewUser = gameState.maxBudget === 0;

  // --- Handlers ---

  // [복원] 1213_코드.txt source: 168 - 데이터 매핑 로직 필수!
  const handleOnboarding = (data: any) => {
    setGameState(prev => ({
      ...prev,
      name: data.profile.name,
      jobTitle: data.profile.classType,
      // [핵심] 여기서 모달의 data 구조를 gameState 구조로 변환해줘야 함
      maxBudget: data.budget.total, 
      currentBudget: data.budget.current,
      lunaCycle: { ...prev.lunaCycle, history: [] }, // history 초기화
      currentLocation: 'VILLAGE_BASE',
      unlockedLocations: ['VILLAGE_BASE']
    }));
    // 완료 후 정원으로 이동
    setScene(Scene.GARDEN);
  };

  const handleRescue = () => {
    alert(`🧙‍♂️ 정원사: "주인님! 탈진하셨군요. 마을로 모시겠습니다."`);
    setGameState(prev => ({ ...prev, currentLocation: 'VILLAGE_BASE' }));
    setScene(Scene.VILLAGE_MAP);
  };

  // 노드 이동 로직 (v1.0 신규)
  const handleMove = (direction: 'N' | 'S' | 'W' | 'E') => {
    if (scene !== Scene.FIELD) return; // 필드에서만 이동

    if (gameState.isExhausted) {
      if(confirm("⚠️ 탈진 상태입니다. 구조 요청을 보내시겠습니까?")) handleRescue();
      return;
    }

    const currentLoc = gameState.currentLocation;
    const connections = MAP_CONNECTIONS[currentLoc];

    if (connections && connections[direction]) {
      const nextLoc = connections[direction] as LocationId;
      const nextInfo = MAP_INFO[nextLoc];

      setGameState(prev => ({
        ...prev,
        currentLocation: nextLoc,
        unlockedLocations: prev.unlockedLocations.includes(nextLoc) ? prev.unlockedLocations : [...prev.unlockedLocations, nextLoc]
      }));

      // 인카운터
      if (nextInfo.type === 'DANGER' && Math.random() < 0.2) {
         if (gameState.unresolvedShadows.length > 0) {
             alert("👻 그림자와 마주쳤습니다!");
             setScene(Scene.BATTLE);
         }
      }
    } else {
      // 이동 불가 (벽)
    }
  };

  // [복원] A버튼 핸들러 (Scene 전환 및 상호작용) - 1213_코드.txt source: 157
  const handleActionA = () => {
    if (scene === Scene.GARDEN) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.VILLAGE_MAP) setScene(Scene.WORLD_MAP);
    else if (scene === Scene.WORLD_MAP) {
        // 월드맵에서는 클릭으로 이동하므로 A버튼은 취소/뒤로가기 역할에 가까울 수 있음
        // 여기선 마을로 돌아가기
        setScene(Scene.VILLAGE_MAP);
    }
    else if (scene === Scene.FIELD) {
       // 필드 조사
       if(Math.random() > 0.7 && gameState.unresolvedShadows.length > 0) {
           setScene(Scene.BATTLE);
       } else {
           alert("주변에 아무것도 없습니다.");
       }
    }
  };

  // [복원] B버튼 핸들러 - 1213_코드.txt source: 159
  const handleActionB = () => {
    if (scene === Scene.BATTLE) setScene(Scene.FIELD);
    else if (scene === Scene.FIELD) setScene(Scene.WORLD_MAP); // 필드 -> 월드맵
    else if (scene === Scene.WORLD_MAP) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.LIBRARY || scene === Scene.FORGE || scene === Scene.SHOP) setScene(Scene.VILLAGE_MAP);
    else if (scene === Scene.VILLAGE_MAP) setScene(Scene.GARDEN);
    else if (scene === Scene.MY_ROOM || scene === Scene.INVENTORY || scene === Scene.SETTINGS) setScene(Scene.GARDEN);
  };

  // 지출 기록 (그림자 생성)
  const handleRecordSpend = (amount: number, type: string, description: string) => {
    let dungeonType = 'etc';
    if (description.includes('식비')) dungeonType = 'food';
    else if (type === 'INSTALLMENT') dungeonType = 'shopping';

    const { newState, message } = applySpend(gameState, amount, false, dungeonType);
    const newShadow: ShadowMonster = {
      id: `shadow_${Date.now()}`, amount, category: dungeonType, createdAt: new Date().toISOString()
    };
    
    setGameState({ ...newState, unresolvedShadows: [...(newState.unresolvedShadows || []), newShadow] });
    alert(message);
    setScene(Scene.LIBRARY);
  };

  // 정화 스킬 (A버튼 롱프레스 대신 별도 버튼으로 제공)
  const handlePurify = () => {
      const res = applyPurifySkill(gameState);
      if(res.success) setGameState(res.newState);
      alert(res.message);
  };

  // --- Render ---
  return (
    <div style={consoleStyles.body}>
      {/* HUD (상단 바) */}
      <div style={consoleStyles.hud}>
        <div style={consoleStyles.hudRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={consoleStyles.levelBadge}>Lv.{gameState.level}</span>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{gameState.name}</span>
          </div>
          <span onClick={() => setShowStamp(true)} style={{cursor:'pointer'}} title="출석부">
            {weatherMeta.icon}
          </span>
        </div>
        
        {/* HP Bar */}
        <div style={consoleStyles.hpBarFrame}>
          <div style={{
            ...consoleStyles.hpBarFill, 
            width: `${Math.max(0, hpPercent)}%`,
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

      {/* Main Screen */}
      <div style={consoleStyles.screenBezel}>
        <div style={consoleStyles.screenContent}>
          {scene === Scene.GARDEN && <WeatherOverlay weather={weather} />}
          <div style={consoleStyles.crtEffect} />

          {/* [핵심] 온보딩 모달 (신규 유저일 때만 표시) */}
          {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

          {/* --- Scenes --- */}
          {scene === Scene.GARDEN && (
            <GardenView 
              user={gameState} 
              onChangeScene={setScene} 
              onDayEnd={() => { 
                  applyDayEnd(gameState); 
                  setShowDailyLog(true); 
              }}
              onUseItem={()=>{}}
            />
          )}
          
          {scene === Scene.FIELD && (
            <FieldView 
              user={gameState} 
              onMove={handleMove} 
              shadows={gameState.unresolvedShadows || []} 
            />
          )}

          {/* 기존 뷰들 연결 */}
          {scene === Scene.VILLAGE_MAP && <VillageMap onChangeScene={setScene} />}
          {scene === Scene.LIBRARY && <LibraryView user={gameState} onRecordTransaction={handleRecordSpend} onOpenSubs={() => setScene(Scene.SUBSCRIPTION)} onBack={() => setScene(Scene.VILLAGE_MAP)} />}
          {scene === Scene.FORGE && <ForgeView user={gameState} onUpdateUser={setGameState} onBack={() => setScene(Scene.VILLAGE_MAP)} />}
          {scene === Scene.SHOP && <ShopView salt={gameState.salt} onBuyItem={(id) => applyBuyItem(gameState, id)} onBack={() => setScene(Scene.VILLAGE_MAP)} />}
          {scene === Scene.WORLD_MAP && (
            <WorldMapView 
                currentLocation={gameState.currentLocation}
                unlockedLocations={gameState.unlockedLocations}
                onSelectLocation={(loc) => { setGameState(p=>({...p, currentLocation: loc})); setScene(Scene.FIELD); }}
                onSelectDungeon={() => {}} 
                onBack={() => setScene(Scene.VILLAGE_MAP)} 
            />
          )}
          {scene === Scene.MY_ROOM && <MyRoomView user={gameState} rpgStats={gameState.stats} onBack={() => setScene(Scene.GARDEN)} onOpenInventory={() => setScene(Scene.INVENTORY)} onOpenSettings={() => setScene(Scene.SETTINGS)} />}
          {scene === Scene.INVENTORY && <InventoryView user={gameState} onBack={() => setScene(Scene.MY_ROOM)} onUseItem={(id) => applyUseGardenItem(gameState, id)} onEquipItem={(id) => applyEquipItem(gameState, id)} />}
          {scene === Scene.SETTINGS && <SettingsView user={gameState} onSave={(u) => setGameState(p=>({...p, ...u}))} onBack={() => setScene(Scene.MY_ROOM)} />}
          {scene === Scene.BATTLE && <BattleView monster={{name:'그림자', hp:50, maxHp:50, attack:10, sprite:'👻', rewardJunk:5}} playerMp={gameState.mp} playerStats={gameState.stats} onWin={()=>{alert("정화 완료!"); setScene(Scene.FIELD);}} onRun={()=>setScene(Scene.FIELD)} onConsumeMp={()=>{}} />}
          {scene === Scene.COLLECTION && <CollectionView user={gameState} onBack={() => setScene(Scene.GARDEN)} />}
          {scene === Scene.MONTHLY_REPORT && <MonthlyReportView user={gameState} onBack={() => setScene(Scene.LIBRARY)} />}
          
          <KingdomModal open={scene === Scene.KINGDOM} onClose={() => setScene(Scene.GARDEN)} buildings={getAssetBuildingsView(gameState)} onManageSubs={() => {}} />
          <CollectionModal open={scene === Scene.COLLECTION} onClose={() => setScene(Scene.GARDEN)} collection={gameState.collection} />
          <SubscriptionModal open={scene === Scene.SUBSCRIPTION} onClose={() => setScene(Scene.LIBRARY)} plans={gameState.subscriptions} onAdd={()=>{}} onRemove={()=>{}} />
          
          <StampRallyModal open={showStamp} onClose={() => setShowStamp(false)} stamps={gameState.counters.noSpendStamps} />
        </div>
      </div>

      {/* Controller */}
      <div style={consoleStyles.controlDeck}>
        <div style={consoleStyles.dpadArea}>
          <div style={consoleStyles.dpad}>
             <div style={consoleStyles.dpadUp} onClick={() => handleMove('N')}>▲</div>
             <div style={consoleStyles.dpadLeft} onClick={() => handleMove('W')}>◀</div>
             <div style={consoleStyles.dpadRight} onClick={() => handleMove('E')}>▶</div>
             <div style={consoleStyles.dpadDown} onClick={() => handleMove('S')}>▼</div>
          </div>
          <div style={{marginTop:4, fontSize:9, color:'#64748b'}}>MOVE</div>
        </div>

        <div style={consoleStyles.actionBtnArea}>
          <div style={consoleStyles.btnGroup}>
            <button style={consoleStyles.actionBtnB} onClick={handleActionB}>B</button>
            <span style={consoleStyles.btnLabel}>뒤로</span>
          </div>
          <div style={consoleStyles.btnGroup}>
            {/* 정화 스킬을 A버튼에 할당 (or 상호작용) */}
            <button style={consoleStyles.actionBtnA} onClick={scene === Scene.FIELD ? handlePurify : handleActionA}>A</button>
            <span style={consoleStyles.btnLabel}>{scene === Scene.FIELD ? '정화' : '결정'}</span>
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

      <DailyLogModal open={showDailyLog} onClose={()=>setShowDailyLog(false)} today={getKSTDateString()} hp={hpPercent} mp={gameState.mp} def={0} junkToday={0} defenseActionsToday={0} noSpendStreak={0} pending={[]} />
      <RewardModal open={rewardOpen} seedPackets={gameState.seedPackets || 0} lastReward={null} onPull={()=>{}} onClose={() => setRewardOpen(false)} />
    </div>
  );
};

// [스타일 유지] 1213_코드.txt와 동일
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
