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

// src/pages/MoneyRoomPage.tsx 하단의 styles 객체 교체

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '420px', margin: '0 auto', color: '#e5e7eb', minHeight: '100vh',
    padding: '20px', display: 'flex', flexDirection: 'column',
    // [NEW] 배경에 격자 무늬 추가 (던전 바닥 느낌)
    backgroundColor: '#111827',
    backgroundImage: `
      linear-gradient(#1f2937 1px, transparent 1px),
      linear-gradient(90deg, #1f2937 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    fontFamily: '"NeoDungGeunMo", sans-serif', // 폰트 적용 확인
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  date: { fontSize: '20px', textShadow: '2px 2px 0px #000' }, // 텍스트 그림자
  classBadge: { fontSize: '14px', color: '#9ca3af', marginTop: '4px' },
  
  // [NEW] 픽셀 스타일 배지
  modeBadge: { 
    padding: '6px 10px', fontSize: '12px', 
    border: '2px solid', boxShadow: '2px 2px 0px rgba(0,0,0,0.5)',
    backgroundColor: '#1f2937' 
  },

  heroSection: { marginBottom: '25px', textAlign: 'center' },
  
  // [NEW] 아바타 영역 (이미지 들어갈 곳)
  avatarArea: {
    width: '80px', height: '80px', margin: '0 auto 10px',
    backgroundColor: '#374151', border: '2px solid #fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    imageRendering: 'pixelated' // 이미지 도트 깨짐 방지
  },

  hpLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '18px' },
  
  // [NEW] 레트로 HP Bar (각진 테두리)
  hpBarBg: { 
    width: '100%', height: '24px', backgroundColor: '#374151', 
    border: '2px solid #fff', position: 'relative'
  },
  hpBarFill: { 
    height: '100%', transition: 'width 0.2s steps(5)', // 끊기는 애니메이션
  },
  budgetDetail: { textAlign: 'right', fontSize: '12px', color: '#9ca3af', marginTop: '6px' },

  // [NEW] RPG 명령어 입력창 스타일
  inputSection: { display: 'flex', gap: '8px', marginBottom: '25px' },
  inputAmount: { 
    flex: 1, padding: '12px', fontSize: '18px', 
    backgroundColor: '#000', color: '#fff', 
    border: '2px solid #4b5563', outline: 'none', fontFamily: 'inherit'
  },
  btnInputHit: { 
    padding: '0 20px', fontSize: '16px', cursor: 'pointer',
    backgroundColor: '#ef4444', color: 'white', border: '2px solid #fff',
    boxShadow: '4px 4px 0px #7f1d1d', // 입체 그림자
    active: { transform: 'translate(2px, 2px)', boxShadow: '2px 2px 0px #7f1d1d' } // 클릭 효과 (JS로 구현 필요하지만 느낌만)
  },

  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' },
  
  // [NEW] 스탯 박스 (검은 배경 + 흰 테두리)
  statBox: { 
    backgroundColor: '#000', padding: '10px', 
    border: '2px solid #374151', textAlign: 'center' 
  },
  statLabel: { fontSize: '12px', color: '#9ca3af', marginBottom: '4px' },

  // [NEW] 대화창 스타일 (Message Box)
  feedbackArea: { 
    flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', 
    color: '#fff', marginBottom: '25px', 
    backgroundColor: 'rgba(0,0,0,0.6)', // 반투명 검정
    border: '2px solid #fff', // 흰색 테두리
    boxShadow: '0 0 0 2px #000 inset', // 이중 테두리 효과
    padding: '20px', minHeight: '100px', whiteSpace: 'pre-line', fontSize: '16px', lineHeight: '1.6'
  },

  gridActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'auto' },
  
  // [NEW] RPG 버튼 스타일 (각진 버튼)
  btnAction: { 
    padding: '15px', backgroundColor: '#374151', color: '#fff', 
    border: '2px solid #fff', boxShadow: '4px 4px 0px #000',
    cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit'
  },
  btnEndDay: { 
    padding: '15px', backgroundColor: '#1e3a8a', color: '#fbbf24', 
    border: '2px solid #fbbf24', boxShadow: '4px 4px 0px #000',
    cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit',
    gridColumn: 'span 2' // 맨 아래 꽉 채우기
  },
};

export default MoneyRoomPage;
