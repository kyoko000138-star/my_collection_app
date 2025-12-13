import React, { useState, useEffect } from 'react';
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

// Views (1213에 있던 모든 뷰 복구)
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
import { WorldMapView } from '../money/components/WorldMapView';

// Modals
import { WeatherOverlay } from '../money/components/WeatherOverlay';
import { RewardModal } from '../money/components/RewardModal';
import { KingdomModal } from '../money/components/KingdomModal'; 
import { CollectionModal } from '../money/components/CollectionModal';
import { OnboardingModal } from '../money/components/OnboardingModal';
import DailyLogModal from '../money/components/DailyLogModal';
import { SubscriptionModal } from '../money/components/SubscriptionModal';
import { StampRallyModal } from '../money/components/StampRallyModal';

const STORAGE_KEY = 'money-room-save-v12-final'; // 키 변경 (초기화)

const INITIAL_ASSETS: AssetBuildingsState = {
  fence: 0, hut: 0, house: 0, mansion: 0, castle: 0, fountain: 0, greenhouse: 0, barn: 0, statue: 0
};

const INITIAL_STATE: UserState = {
  name: 'Player', level: 1, jobTitle: 'NOVICE',
  currentBudget: 0, maxBudget: 0, // 0이면 신규 유저로 인식
  mp: 30, maxMp: 30,
  exp: 0, stats: { str: 1, def: 10, luk: 1 },
  currentLocation: 'VILLAGE_BASE', unlockedLocations: ['VILLAGE_BASE'],
  isExhausted: false,
  assets: INITIAL_ASSETS,
  garden: { treeLevel: 0, pondLevel: 0, flowerState: 'normal', weedCount: 0, decorations: [] },
  lunaCycle: { history: [], avgCycleLength: 28, avgPeriodLength: 5, currentPhase: 'FOLLICULAR', nextPeriodDate: '', dDay: 0 },
  inventory: [], collection: [], subscriptions: [], unresolvedShadows: [],
  counters: { defenseActionsToday: 0, junkObtainedToday: 0, noSpendStreak: 0, dailyTotalSpend: 0, hadSpendingToday: false },
  status: { mode: 'NORMAL', darkLevel: 0 },
  gardenNutrients: { savedAmount: 0, debtRepaid: 0 },
  materials: {}, equipped: {}, npcAffection: {}, junk: 0, salt: 0, seedPackets: 0
};

const MoneyRoomPage: React.FC = () => {
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      return savedRaw ? { ...INITIAL_STATE, ...JSON.parse(savedRaw) } : INITIAL_STATE;
    } catch { return INITIAL_STATE; }
  });

  const [scene, setScene] = useState<Scene>(Scene.GARDEN);
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [showStamp, setShowStamp] = useState(false);

  // 저장 및 리셋
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState)); }, [gameState]);
  useEffect(() => {
    const { newState } = checkDailyReset(gameState);
    const sub = applySubscriptionChargesIfDue(newState);
    if(sub.logs.length) alert(sub.logs.join('\n'));
    setGameState(sub.newState);
  }, []);

  const weather = getMoneyWeather(gameState);
  const weatherMeta = getWeatherMeta(weather);
  const hpPercent = gameState.maxBudget > 0 ? (gameState.currentBudget / gameState.maxBudget) * 100 : 0;
  
  // [CRITICAL FIX] maxBudget이 0이면 무조건 온보딩 뜸. handleOnboarding에서 이걸 채워줘야 함.
  const isNewUser = gameState.maxBudget === 0;

  // --- Handlers ---

  // [수정] 온보딩 완료 시 데이터 매핑 (입장 불가 버그 해결)
  const handleOnboarding = (data: any) => {
    setGameState(prev => ({
      ...prev,
      name: data.profile.name,
      jobTitle: data.profile.classType,
      maxBudget: Number(data.budget.total), // 숫자 변환
      currentBudget: Number(data.budget.current), // 숫자 변환
      // 초기화
      lunaCycle: { ...prev.lunaCycle, history: [] },
      currentLocation: 'VILLAGE_BASE',
      unlockedLocations: ['VILLAGE_BASE']
    }));
    setScene(Scene.GARDEN);
  };

  const handleRescue = () => {
    alert(`🧙‍♂️ 정원사: "주인님! 탈진하셨군요. 마을로 모시겠습니다."`);
    setGameState(prev => ({ ...prev, currentLocation: 'VILLAGE_BASE' }));
    setScene(Scene.VILLAGE_MAP);
  };

  const handleMove = (direction: 'N' | 'S' | 'W' | 'E') => {
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

      // 씬 자동 전환
      if (nextInfo.type === 'TOWN') setScene(Scene.VILLAGE_MAP);
      else setScene(Scene.FIELD);

      // 인카운터
      if (nextInfo.type === 'DANGER' && Math.random() < 0.2) {
         if (gameState.unresolvedShadows.length > 0) {
             alert("👻 소비의 그림자가 나타났습니다!");
             setScene(Scene.BATTLE);
         }
      }
    }
  };

  const handleRecordSpend = (amount: number, type: string, description: string) => {
    const { newState, message } = applySpend(gameState, amount, false, 'etc');
    const newShadow: ShadowMonster = { id: `shadow_${Date.now()}`, amount, category: 'etc', createdAt: new Date().toISOString() };
    setGameState({ ...newState, unresolvedShadows: [...newState.unresolvedShadows, newShadow] });
    alert(message);
    setScene(Scene.LIBRARY);
  };

  const handlePurify = () => {
      const res = applyPurifySkill(gameState);
      if(res.success) setGameState(res.newState);
      alert(res.message);
  };

  return (
    <div style={consoleStyles.body}>
      <div style={consoleStyles.hud}>
        <div style={consoleStyles.hudRow}>
          <span>Lv.{gameState.level} {gameState.jobTitle}</span>
          <span onClick={() => setShowStamp(true)} style={{cursor:'pointer'}}>{weatherMeta.icon}</span>
        </div>
        <div style={consoleStyles.hpBarFrame}>
          <div style={{...consoleStyles.hpBarFill, width: `${Math.max(0, hpPercent)}%`, background: '#ef4444'}} />
          <div style={consoleStyles.hpText}>HP {gameState.currentBudget.toLocaleString()} / {gameState.maxBudget.toLocaleString()}</div>
        </div>
        <div style={{textAlign:'right', fontSize:'10px', color:'#9ca3af'}}>잔여: ₩{gameState.currentBudget.toLocaleString()}</div>
        <div style={consoleStyles.hudRowBottom}>
           <span style={{color:'#60a5fa'}}>MP {gameState.mp}/{gameState.maxMp}</span>
           <span onClick={() => setRewardOpen(true)} style={{cursor:'pointer'}}>🌱 {gameState.seedPackets}</span>
        </div>
      </div>

      <div style={consoleStyles.screenBezel}>
        <div style={consoleStyles.screenContent}>
           <WeatherOverlay weather={weather} />
           <div style={consoleStyles.crtEffect} />
           
           {/* 온보딩 모달 (이제 정상 작동) */}
           {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

           {/* --- 뷰 통합 --- */}
           {scene === Scene.GARDEN && <GardenView user={gameState} onChangeScene={setScene} onDayEnd={()=>applyDayEnd(gameState)} onUseItem={()=>{}} />}
           {scene === Scene.FIELD && <FieldView user={gameState} onMove={handleMove} shadows={gameState.unresolvedShadows} />}
           {scene === Scene.VILLAGE_MAP && <VillageMap onChangeScene={setScene} />}
           {scene === Scene.LIBRARY && <LibraryView user={gameState} onRecordTransaction={handleRecordSpend} onOpenSubs={()=>setScene(Scene.SUBSCRIPTION)} onBack={()=>setScene(Scene.VILLAGE_MAP)} />}
           {scene === Scene.FORGE && <ForgeView user={gameState} onUpdateUser={setGameState} onBack={()=>setScene(Scene.VILLAGE_MAP)} />}
           {scene === Scene.SHOP && <ShopView salt={gameState.salt} onBuyItem={(id)=>applyBuyItem(gameState, id)} onBack={()=>setScene(Scene.VILLAGE_MAP)} />}
           {scene === Scene.WORLD_MAP && <WorldMapView currentLocation={gameState.currentLocation} unlockedLocations={gameState.unlockedLocations} onSelectLocation={(l)=>{setGameState(p=>({...p, currentLocation:l})); setScene(Scene.FIELD);}} onSelectDungeon={()=>{}} onBack={()=>setScene(Scene.VILLAGE_MAP)} />}
           {scene === Scene.MY_ROOM && <MyRoomView user={gameState} rpgStats={gameState.stats} onBack={()=>setScene(Scene.GARDEN)} onOpenInventory={()=>setScene(Scene.INVENTORY)} onOpenSettings={()=>setScene(Scene.SETTINGS)} />}
           {scene === Scene.INVENTORY && <InventoryView user={gameState} onBack={()=>setScene(Scene.MY_ROOM)} onUseItem={(id)=>applyUseGardenItem(gameState, id)} onEquipItem={(id)=>applyEquipItem(gameState, id)} />}
           {scene === Scene.BATTLE && <BattleView monster={{name:'그림자', hp:50, maxHp:50, attack:10, sprite:'👻', rewardJunk:5}} playerMp={gameState.mp} playerStats={gameState.stats} onWin={()=>{alert("승리!"); setScene(Scene.FIELD);}} onRun={()=>setScene(Scene.FIELD)} onConsumeMp={()=>{}} />}
           
           {/* 모달 */}
           <StampRallyModal open={showStamp} onClose={() => setShowStamp(false)} stamps={gameState.counters.noSpendStamps} />
           <SubscriptionModal open={scene === Scene.SUBSCRIPTION} onClose={() => setScene(Scene.LIBRARY)} plans={gameState.subscriptions} onAdd={()=>{}} onRemove={()=>{}} />
           <KingdomModal open={scene === Scene.KINGDOM} onClose={() => setScene(Scene.GARDEN)} buildings={getAssetBuildingsView(gameState)} onManageSubs={() => {}} />
           <CollectionModal open={scene === Scene.COLLECTION} onClose={() => setScene(Scene.GARDEN)} collection={gameState.collection} />
        </div>
      </div>

      <div style={consoleStyles.controlDeck}>
        <div style={consoleStyles.dpadArea}>
          <div style={consoleStyles.dpad}>
             <div style={consoleStyles.dpadUp} onClick={() => handleMove('N')}>▲</div>
             <div style={consoleStyles.dpadLeft} onClick={() => handleMove('W')}>◀</div>
             <div style={consoleStyles.dpadRight} onClick={() => handleMove('E')}>▶</div>
             <div style={consoleStyles.dpadDown} onClick={() => handleMove('S')}>▼</div>
          </div>
        </div>
        <div style={consoleStyles.actionBtnArea}>
           <button style={consoleStyles.actionBtnB} onClick={() => setScene(Scene.GARDEN)}>B</button>
           <button style={consoleStyles.actionBtnA} onClick={scene === Scene.FIELD ? handlePurify : () => setScene(Scene.VILLAGE_MAP)}>A</button>
        </div>
        <div style={consoleStyles.systemBtnArea}>
           <button style={consoleStyles.systemBtn} onClick={() => setScene(Scene.MY_ROOM)}>MY</button>
        </div>
      </div>
    </div>
  );
};

// [스타일 유지] 1213_코드.txt의 consoleStyles 복사
const consoleStyles: Record<string, React.CSSProperties> = {
  body: { width: '100%', maxWidth: '420px', margin: '0 auto', height: '100dvh', backgroundColor: '#202025', display: 'flex', flexDirection: 'column', fontFamily: '"NeoDungGeunMo", monospace', overflow: 'hidden', color: '#fff', position: 'relative' },
  hud: { height: '80px', backgroundColor: '#2d3748', borderBottom: '4px solid #1a202c', padding: '10px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px', zIndex: 10 },
  hudRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' },
  hudRowBottom: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  levelBadge: { backgroundColor: '#4a5568', padding: '1px 4px', borderRadius: '4px', fontSize: '10px', color: '#e2e8f0' },
  hpBarFrame: { width: '100%', height: '16px', backgroundColor: '#111', border: '2px solid #555', borderRadius: '4px', position: 'relative', overflow: 'hidden' },
  hpBarFill: { height: '100%', transition: 'width 0.5s ease-out' },
  hpText: { position: 'absolute', width: '100%', textAlign: 'center', top: 0, lineHeight: '14px', fontSize: '10px', color: '#fff', textShadow: '1px 1px 0 #000', fontWeight: 'bold' },
  screenBezel: { flex: 1, backgroundColor: '#000', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  screenContent: { width: '100%', height: '100%', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '2px solid #444', display: 'flex', flexDirection: 'column' },
  crtEffect: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99, background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '100% 4px', opacity: 0.15 },
  controlDeck: { height: '180px', backgroundColor: '#2d3748', borderTop: '4px solid #4a5568', padding: '15px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr auto', gap: '10px' },
  dpadArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  dpad: { position: 'relative', width: '90px', height: '90px' },
  dpadUp: { position: 'absolute', top: 0, left: 30, width: 30, height: 30, backgroundColor: '#4a5568', cursor: 'pointer', textAlign:'center', lineHeight:'30px', boxShadow: '0 4px 0 #000' },
  dpadDown: { position: 'absolute', bottom: 0, left: 30, width: 30, height: 30, backgroundColor: '#4a5568', cursor: 'pointer', textAlign:'center', lineHeight:'30px', boxShadow: '0 4px 0 #000' },
  dpadLeft: { position: 'absolute', top: 30, left: 0, width: 30, height: 30, backgroundColor: '#4a5568', cursor: 'pointer', textAlign:'center', lineHeight:'30px', boxShadow: '0 4px 0 #000' },
  dpadRight: { position: 'absolute', top: 30, right: 0, width: 30, height: 30, backgroundColor: '#4a5568', cursor: 'pointer', textAlign:'center', lineHeight:'30px', boxShadow: '0 4px 0 #000' },
  actionBtnArea: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' },
  actionBtnA: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e53e3e', border: 'none', boxShadow: '0 4px 0 #9b2c2c', color: '#fff', cursor: 'pointer' },
  actionBtnB: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#d69e2e', border: 'none', boxShadow: '0 4px 0 #975a16', color: '#fff', cursor: 'pointer' },
  systemBtnArea: { gridColumn: 'span 2', display: 'flex', justifyContent: 'center', gap: '24px' },
  systemBtn: { width: '50px', height: '12px', background: '#718096', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnLabel: { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' },
  btnLabelSmall: { fontSize: '9px', color: '#64748b', marginTop: '4px', letterSpacing: '1px' },
};

export default MoneyRoomPage;
