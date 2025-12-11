import React, { useState, useEffect } from 'react';

// Types & Constants
import { UserState } from '../money/types';
import { GAME_CONSTANTS, CLASS_TYPES, ClassType } from '../money/constants';

// Logic Engines
import { 
  getHp, applySpend, applyDefense, checkDailyReset, applyPurify, applyDayEnd, 
  shouldShowGuardPrompt, markGuardPromptShown, getAssetBuildingsView, applyCraftEquipment 
} from '../money/moneyGameLogic';
import { getLunaMode, getLunaTheme } from '../money/moneyLuna';

// Components (Modals)
import { InventoryModal } from '../money/components/InventoryModal';
import { CollectionModal } from '../money/components/CollectionModal';
import { KingdomModal } from '../money/components/KingdomModal';
import { OnboardingModal } from '../money/components/OnboardingModal';

// [KEY] 로컬 스토리지 저장 키
const STORAGE_KEY = 'money-room-save-v1';

// [MOCK DATA] 초기 데이터
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

export const MoneyRoomPage: React.FC = () => {
  // 1. 상태 초기화
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...INITIAL_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Save load failed", e);
    }
    return INITIAL_STATE;
  });

  const [feedbackMsg, setFeedbackMsg] = useState<string>("던전에 입장했습니다.");
  const [inputAmount, setInputAmount] = useState<string>('');

  // 모달 상태 (변수명 수정됨)
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isKingdomOpen, setIsKingdomOpen] = useState(false);

  // Derived Values
  const hp = getHp(gameState.budget.current, gameState.budget.total);
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMode = getLunaMode(todayStr, gameState.luna.nextPeriodDate);
  const theme = getLunaTheme(currentMode);
  
  const assetBuildings = getAssetBuildingsView(gameState);
  
  const needsOnboarding = gameState.profile.name === 'Player 1';

  // 2. 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // 3. 일일 리셋
  useEffect(() => {
    setGameState(prev => checkDailyReset(prev));
  }, []);

  // --- HANDLERS ---

  const handleOnboardingComplete = (data: Partial<UserState>) => {
    setGameState(prev => ({ ...prev, ...data }));
    setFeedbackMsg(`환영합니다, ${data.profile?.name}님! 던전 공략을 시작합니다.`);
  };

  const handleSpendSubmit = () => {
    const amount = parseInt(inputAmount.replace(/,/g, ''), 10);
    if (!amount || amount <= 0) {
      setFeedbackMsg("금액을 정확히 입력해주세요.");
      return;
    }

    if (shouldShowGuardPrompt(gameState, amount, false)) {
      const nextHp = getHp(gameState.budget.current - amount, gameState.budget.total);
      const confirmMsg = 
        `⚠️ [위험] 고위험 지출 감지!\n\n` +
        `이 지출을 하면 HP가 ${hp}% → ${nextHp}%로 떨어집니다.\n` +
        `정말 진행하시겠습니까?\n\n` +
        `(취소 시 '방어'로 인정되어 MP가 회복됩니다.)`;

      if (!window.confirm(confirmMsg)) {
        handleDefense("지출 유혹을 방어했습니다! (Guard Success)");
        setGameState(prev => markGuardPromptShown(prev));
        setInputAmount('');
        return;
      }
      setGameState(prev => markGuardPromptShown(prev));
    }

    const { newState, message } = applySpend(gameState, amount, false);
    setGameState(newState);
    setFeedbackMsg(message);
    setInputAmount('');
  };

  const handleDefense = (customMsg?: string) => {
    if (gameState.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) {
      setFeedbackMsg("오늘의 방어 태세가 이미 한계에 도달했습니다.");
      return;
    }
    const nextState = applyDefense(gameState);
    setGameState(nextState);
    setFeedbackMsg(customMsg || `방어 성공. MP가 회복되었습니다.`);
  };

  const handlePurify = () => {
    const { newState, message } = applyPurify(gameState);
    setGameState(newState);
    setFeedbackMsg(message);
  };

  const handleCraft = () => {
    const { newState, message } = applyCraftEquipment(gameState);
    setGameState(newState);
    setFeedbackMsg(message);
  };

  const handleDayEnd = () => {
    if (gameState.counters.lastDayEndDate === todayStr) {
      setFeedbackMsg("이미 오늘 마감을 완료했습니다.");
      return;
    }
    if (!window.confirm("오늘 하루를 마감하고 보상을 받으시겠습니까?")) return;
    
    const { newState, message } = applyDayEnd(gameState, todayStr);
    setGameState(newState);
    setFeedbackMsg(message);
  };

  const handleResetData = () => {
    if (window.confirm("정말 모든 데이터를 초기화하시겠습니까?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  // UI Helpers
  const getHpColor = (hp: number) => hp > 50 ? '#4ade80' : hp > 30 ? '#facc15' : '#ef4444';
  const canPurify = gameState.runtime.mp >= 1 && gameState.inventory.junk >= 1 && gameState.inventory.salt >= 1;
  const getClassBadge = (type: ClassType | null) => {
    if (type === CLASS_TYPES.GUARDIAN) return '🛡️ 수호자';
    if (type === CLASS_TYPES.SAGE) return '🔮 현자';
    if (type === CLASS_TYPES.ALCHEMIST) return '💰 연금술사';
    if (type === CLASS_TYPES.DRUID) return '🌿 드루이드';
    return '👶 모험가';
  };

  return (
    <div style={{...styles.container, backgroundColor: theme.bgColor}}>
      {needsOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      <header style={styles.header}>
        <div style={{display:'flex', flexDirection:'column'}}>
          <span style={styles.date}>{todayStr}</span>
          <span style={styles.classBadge}>
            {getClassBadge(gameState.profile.classType)} Lv.{gameState.profile.level} {gameState.profile.name}
          </span>
        </div>
        <span style={{...styles.modeBadge, color: theme.color, borderColor: theme.color}}>
          {theme.label}
        </span>
      </header>

      <section style={styles.heroSection}>
        <div style={styles.hpLabel}><span>HP (생존력)</span><span>{hp}%</span></div>
        <div style={styles.hpBarBg}>
          <div style={{...styles.hpBarFill, width: `${hp}%`, backgroundColor: getHpColor(hp)}} />
        </div>
        <div style={styles.budgetDetail}>
          {gameState.budget.current.toLocaleString()} / {gameState.budget.total.toLocaleString()}
        </div>
      </section>

      <section style={styles.inputSection}>
        <input 
          type="number" 
          placeholder="얼마를 쓰셨나요?" 
          style={styles.inputAmount}
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSpendSubmit()}
        />
        <button onClick={handleSpendSubmit} style={styles.btnInputHit}>
          🔥 HIT
        </button>
      </section>

      <section style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>MP (의지)</div>
          <div style={{color: '#60a5fa', fontWeight:'bold'}}>{gameState.runtime.mp} / 30</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>오늘지출</div>
          <div style={{color: '#fca5a5', fontWeight:'bold'}}>{gameState.counters.dailyTotalSpend.toLocaleString()}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>스트릭</div>
          <div style={{fontWeight:'bold', color: '#fbbf24'}}>{gameState.counters.noSpendStreak}일</div>
        </div>
      </section>

      <div style={{...styles.feedbackArea, borderColor: theme.color}}>
        {feedbackMsg}
      </div>

      <div style={styles.gridActions}>
        <button onClick={() => handleDefense()} style={styles.btnAction}>🛡️ 방어</button>
        {/* 변수명 수정됨: isInventoryModalOpen */}
        <button onClick={() => setIsInventoryModalOpen(true)} style={styles.btnAction}>🎒 인벤토리</button>
        <button onClick={() => setIsKingdomOpen(true)} style={styles.btnAction}>🏰 내 왕국</button>
        <button onClick={() => setIsCollectionOpen(true)} style={styles.btnAction}>📖 도감</button>
        
        <button 
          onClick={handleDayEnd} 
          disabled={gameState.counters.lastDayEndDate === todayStr}
          style={{...styles.btnEndDay, gridColumn: 'span 2'}}
        >
          {gameState.counters.lastDayEndDate === todayStr ? "💤 오늘 마감 완료" : "🌙 오늘 마감하기"}
        </button>
      </div>

      {/* MODALS */}
      <InventoryModal
        open={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)}
        junk={gameState.inventory.junk} salt={gameState.inventory.salt}
        materials={gameState.inventory.materials} equipment={gameState.inventory.equipment}
        collection={gameState.inventory.collection}
        canPurify={canPurify} 
        onPurify={handlePurify}
        onCraft={handleCraft} 
      />
      <CollectionModal 
        open={isCollectionOpen} onClose={() => setIsCollectionOpen(false)}
        collection={gameState.inventory.collection}
      />
      <KingdomModal 
        open={isKingdomOpen} onClose={() => setIsKingdomOpen(false)}
        buildings={assetBuildings}
      />

      <div style={{textAlign: 'center', marginTop: '30px', opacity: 0.5}}>
        <button onClick={handleResetData} style={{background:'none', border:'none', color:'#4b5563', fontSize:'10px', textDecoration:'underline', cursor:'pointer'}}>
          데이터 초기화 (Reset)
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '420px', margin: '0 auto', color: '#f3f4f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', transition: 'background 0.5s' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  date: { fontSize: '18px', fontWeight: 'bold' },
  classBadge: { fontSize: '12px', color: '#9ca3af', marginTop: '4px' },
  modeBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid', height: 'fit-content' },
  heroSection: { marginBottom: '25px' },
  hpLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 'bold' },
  hpBarBg: { width: '100%', height: '20px', backgroundColor: '#374151', borderRadius: '10px', overflow: 'hidden' },
  hpBarFill: { height: '100%', transition: 'all 0.5s ease-out' },
  budgetDetail: { textAlign: 'right', fontSize: '12px', color: '#9ca3af', marginTop: '6px' },
  inputSection: { display: 'flex', gap: '10px', marginBottom: '25px' },
  inputAmount: { flex: 1, padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#1f2937', color: 'white', fontSize: '18px', fontWeight: 'bold', outline: 'none' },
  btnInputHit: { padding: '0 25px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 0 #b91c1c' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' },
  statBox: { backgroundColor: '#1f2937', padding: '12px', borderRadius: '10px', textAlign: 'center' },
  statLabel: { fontSize: '11px', color: '#9ca3af', marginBottom: '4px' },
  feedbackArea: { flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#d1d5db', marginBottom: '25px', border: '1px dashed', borderRadius: '12px', padding: '15px', minHeight: '80px', whiteSpace: 'pre-line' },
  gridActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'auto' },
  btnAction: { padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#374151', color: '#e5e7eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  btnEndDay: { padding: '15px', borderRadius: '12px', border: '1px solid #fbbf24', backgroundColor: '#1f2937', color: '#fbbf24', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
};

export default MoneyRoomPage;
