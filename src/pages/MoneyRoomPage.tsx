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

  // 모달 상태
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

      {/* HEADER */}
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

      {/* HERO SECTION (HP & Avatar) */}
      <section style={styles.heroSection}>
        {/* [NEW] 캐릭터/몬스터 표시 영역 */}
        <div style={styles.avatarArea}>
          {/* 캐릭터 이미지가 있다면 여기에 <img src="..." /> 추가 */}
          <span style={{fontSize: '40px'}}>👾</span>
        </div>

        <div style={styles.hpLabel}><span>HP (생존력)</span><span>{hp}%</span></div>
        <div style={styles.hpBarBg}>
          <div style={{...styles.hpBarFill, width: `${hp}%`, backgroundColor: getHpColor(hp)}} />
        </div>
        <div style={styles.budgetDetail}>
          {gameState.budget.current.toLocaleString()} / {gameState.budget.total.toLocaleString()}
        </div>
      </section>

      {/* QUICK INPUT */}
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

      {/* STATS GRID */}
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

      {/* FEEDBACK */}
      <div style={{...styles.feedbackArea, borderColor: theme.color}}>
        {feedbackMsg}
      </div>

      {/* FOOTER ACTIONS */}
      <div style={styles.gridActions}>
        <button onClick={() => handleDefense()} style={styles.btnAction}>🛡️ 방어</button>
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

// --- Styles (레트로 RPG 스타일 적용) ---
// 👇 여기부터 styles 객체를 통째로 교체하세요.
const styles: Record<string, React.CSSProperties> = {
  // 1. 전체 배경: 숲속 오두막 바닥 느낌 (짙은 나무색 or 흙색)
  container: {
    maxWidth: '420px', margin: '0 auto', minHeight: '100vh',
    padding: '20px', display: 'flex', flexDirection: 'column',
    fontFamily: '"NeoDungGeunMo", sans-serif', // 픽셀 폰트 필수
    color: '#422006', // 텍스트는 진한 갈색 (가독성 UP)
    backgroundColor: '#3b302a', // 짙은 갈색 배경
    // 픽셀 패턴 배경 (체크무늬)
    backgroundImage: `
      linear-gradient(45deg, #463a32 25%, transparent 25%, transparent 75%, #463a32 75%, #463a32),
      linear-gradient(45deg, #463a32 25%, transparent 25%, transparent 75%, #463a32 75%, #463a32)
    `,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 10px 10px',
  },

  // 2. 헤더: 나무 간판 느낌
  header: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
    backgroundColor: '#a67c52', // 나무색
    padding: '10px 15px',
    border: '4px solid #5d4037', // 진한 나무 테두리
    boxShadow: '4px 4px 0px rgba(0,0,0,0.5)', // 픽셀 그림자
    borderRadius: '8px'
  },
  date: { fontSize: '18px', fontWeight: 'bold', color: '#fff', textShadow: '2px 2px 0 #000' },
  classBadge: { fontSize: '12px', color: '#ffe4c4', marginTop: '2px' }, // 크림색 텍스트
  
  // 상태 배지: 붉은 보석 느낌
  modeBadge: { 
    padding: '6px 10px', fontSize: '12px', color: '#fff', fontWeight: 'bold',
    backgroundColor: '#be123c', border: '2px solid #fff', 
    boxShadow: '2px 2px 0px #000', borderRadius: '4px'
  },

  // 3. 히어로 섹션: 캐릭터가 서있는 무대
  heroSection: { 
    marginBottom: '20px', textAlign: 'center',
    backgroundColor: '#5c4d41', // 캐릭터 발판 색
    padding: '20px',
    border: '4px solid #2a231d',
    borderRadius: '16px',
    position: 'relative'
  },
  
  avatarArea: {
    width: '100px', height: '100px', margin: '0 auto 10px',
    backgroundColor: 'rgba(0,0,0,0.2)', // 그림자 느낌
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '40px', border: '2px dashed #8d7b68'
  },

  // HP Bar: 고전적인 붉은색 + 굵은 테두리
  hpLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '16px', color: '#fff', textShadow: '1px 1px 0 #000' },
  hpBarBg: { 
    width: '100%', height: '24px', backgroundColor: '#2a231d', 
    border: '3px solid #1a1612', borderRadius: '12px', overflow: 'hidden', padding: '2px'
  },
  hpBarFill: { 
    height: '100%', borderRadius: '8px', 
    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3)' // 입체감
  },
  budgetDetail: { textAlign: 'right', fontSize: '12px', color: '#d6c0a6', marginTop: '6px' },

  // 4. 입력창: 양피지(종이) 느낌
  inputSection: { 
    display: 'flex', gap: '8px', marginBottom: '20px',
    backgroundColor: '#eaddcf', // 종이색
    padding: '8px',
    border: '4px solid #8b5a2b', // 나무 테두리
    borderRadius: '8px',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.3)'
  },
  inputAmount: { 
    flex: 1, padding: '10px', fontSize: '18px', 
    backgroundColor: 'transparent', color: '#422006', 
    border: 'none', outline: 'none', fontFamily: 'inherit', fontWeight: 'bold',
    borderBottom: '2px dashed #8b5a2b' // 밑줄
  },
  btnInputHit: { 
    padding: '0 20px', fontSize: '16px', cursor: 'pointer',
    backgroundColor: '#ef4444', color: 'white', 
    border: '3px solid #991b1b', borderRadius: '6px',
    boxShadow: '0 4px 0 #991b1b', // 눌리는 버튼 효과
    fontFamily: 'inherit'
  },

  // 5. 스탯 그리드: 아이템 슬롯 느낌
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' },
  statBox: { 
    backgroundColor: '#d4c5a9', // 밝은 베이지
    padding: '10px', 
    border: '3px solid #8b5a2b', 
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.5), 2px 2px 0 rgba(0,0,0,0.2)'
  },
  statLabel: { fontSize: '12px', color: '#785032', marginBottom: '4px', fontWeight: 'bold' },

  // 6. 대화창: 고전 RPG 텍스트 박스
  feedbackArea: { 
    flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', 
    color: '#fff', marginBottom: '25px', 
    backgroundColor: '#1e293b', // 짙은 남색 (대화창 국룰)
    border: '4px double #fff', // 이중 테두리
    borderRadius: '8px',
    boxShadow: '0 4px 0 rgba(0,0,0,0.5)',
    padding: '20px', minHeight: '80px', whiteSpace: 'pre-line', fontSize: '16px', lineHeight: '1.6'
  },

  // 7. 하단 버튼들: 누르고 싶은 픽셀 버튼
  gridActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'auto' },
  btnAction: { 
    padding: '15px', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer',
    backgroundColor: '#f59e0b', // 호박색 (Stardew UI 느낌)
    color: '#422006', fontWeight: 'bold',
    border: '3px solid #b45309', 
    borderRadius: '8px',
    boxShadow: '0 4px 0 #b45309, 0 6px 4px rgba(0,0,0,0.3)', // 입체감 극대화
    transition: 'transform 0.1s', // 클릭 시 눌리는 효과 (CSS active 필요)
  },
  
  // 마감 버튼은 특별하게 (파란색)
  btnEndDay: { 
    padding: '15px', fontSize: '16px', fontFamily: 'inherit', cursor: 'pointer',
    backgroundColor: '#3b82f6', 
    color: '#fff', fontWeight: 'bold',
    border: '3px solid #1d4ed8', 
    borderRadius: '8px',
    boxShadow: '0 4px 0 #1d4ed8, 0 6px 4px rgba(0,0,0,0.3)',
    gridColumn: 'span 2'
  },
};

export default MoneyRoomPage;
