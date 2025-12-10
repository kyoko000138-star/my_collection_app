// import 추가
import { getLunaMode, getLunaTheme } from '../money/moneyLuna';

import React, { useState, useEffect } from 'react';
import { UserState } from '../money/types';
import { GAME_CONSTANTS, CLASS_TYPES } from '../money/constants';
import { getHp, applySpend, applyDefense, checkDailyReset } from '../money/moneyGameLogic';

// ----------------------------------------------------------------------
// [MOCK DATA] 실제 앱에서는 DB나 로컬 스토리지에서 불러옵니다.
// ----------------------------------------------------------------------
const INITIAL_STATE: UserState = {
  profile: { name: 'Player 1', classType: CLASS_TYPES.GUARDIAN, level: 1 },
  budget: { total: 1000000, current: 850000, fixedCost: 300000, startDate: '2023-10-01' },
  stats: { def: 50, creditScore: 0 },
  counters: {
    defenseActionsToday: 0,
    junkObtainedToday: 0,
    lastAccessDate: null,
    lastDailyResetDate: null,
    noSpendStreak: 3,
    lunaShieldsUsedThisMonth: 0,
  },
  runtime: { mp: 15 },
  inventory: { junk: 0, salt: 0, shards: {}, materials: {}, equipment: [], collection: [] },
  pending: [],
};

export const MoneyRoomPage: React.FC = () => {
  const [gameState, setGameState] = useState<UserState>(INITIAL_STATE);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("던전에 입장했습니다.");

  // 1. HP 계산 (실시간 반영)
  const hp = getHp(gameState.budget.current, gameState.budget.total);
  
  // HP 색상 로직 (안전: 초록 / 경고: 노랑 / 위험: 빨강)
  const getHpColor = (hp: number) => {
    if (hp > 50) return '#4ade80'; // Green
    if (hp > 30) return '#facc15'; // Yellow
    return '#ef4444'; // Red
  };

  // 2. 초기화 로직 (접속 시)
  useEffect(() => {
    // 실제 구현 시 여기서 checkDailyReset 등을 호출하여 상태 업데이트
    const refreshedState = checkDailyReset(gameState);
    setGameState(refreshedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. 행동 핸들러: 지출 (Hit)
  const handleSpend = () => {
    // 테스트를 위해 15,000원 지출로 고정
    const spendAmount = 15000; 
    
    // 로직 적용
    const nextState = applySpend(gameState, spendAmount, false);
    setGameState(nextState);

    // 피드백 메시지 (No Guilt)
    setFeedbackMsg(`피격(Hit)! HP가 ${getHp(nextState.budget.current, nextState.budget.total)}%로 감소했습니다.`);
  };

  // 4. 행동 핸들러: 방어 (Guard)
  const handleDefense = () => {
    if (gameState.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) {
      setFeedbackMsg("오늘의 방어 태세가 이미 한계에 도달했습니다.");
      return;
    }

    const nextState = applyDefense(gameState);
    setGameState(nextState);

    export const MoneyRoomPage: React.FC = () => {
  // Mock State에 luna 정보 추가 (테스트를 위해 오늘 날짜 근처로 설정해보세요)
  const [gameState, setGameState] = useState<UserState>({
    ...INITIAL_STATE,
    luna: { 
      nextPeriodDate: '2025-12-15', // 테스트: 오늘이 12/10이면 D-5 -> PMS 모드여야 함
      averageCycle: 28, 
      isTracking: true 
    } 
  });

    // 피드백 메시지 (칭찬 대신 상태 보고)
    setFeedbackMsg(`방어 성공. MP가 회복되었습니다. (오늘 방어: ${nextState.counters.defenseActionsToday}/${GAME_CONSTANTS.DAILY_DEFENSE_LIMIT})`);
  };

  return (
    <div style={styles.container}>
      {/* --- HEADER: 날짜 & 모드(Luna) --- */}
      <header style={styles.header}>
        <span style={styles.date}>12월 10일 (수)</span>
        <span style={styles.modeBadge}>NORMAL MODE</span>
      </header>

      // [NEW] Luna Mode 계산
  const todayStr = new Date().toISOString().split('T')[0]; // "2025-12-10"
  const currentMode = getLunaMode(todayStr, gameState.luna.nextPeriodDate);
  const theme = getLunaTheme(currentMode);

  return (
    // 배경색을 모드에 따라 변경 (긴장감 조성 or 편안함)
    <div style={{...styles.container, backgroundColor: theme.bgColor}}> 
      
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <span style={styles.date}>{todayStr}</span>
        <span style={{...styles.modeBadge, color: theme.color, border: `1px solid ${theme.color}`}}>
          {theme.label}
        </span>
      </header>

      {/* --- HERO: HP BAR (핵심) --- */}
      <section style={styles.heroSection}>
        <div style={styles.hpLabel}>
          <span>HP (생존력)</span>
          <span>{hp}%</span>
        </div>
        <div style={styles.hpBarBg}>
          <div 
            style={{
              ...styles.hpBarFill, 
              width: `${hp}%`, 
              backgroundColor: getHpColor(hp)
            }} 
          />
        </div>
        <div style={styles.budgetDetail}>
          잔여: {gameState.budget.current.toLocaleString()} / 전체: {gameState.budget.total.toLocaleString()}
        </div>
      </section>

      {/* --- FEEDBACK AREA --- */}
      {/* 테마별 메시지 우선 노출, 이후 사용자 액션 피드백 노출 */}
      <div style={{...styles.feedbackArea, borderColor: theme.color}}>
         {feedbackMsg === "던전에 입장했습니다." ? theme.message : feedbackMsg}
      </div>

      {/* --- STATS: MP & DEF --- */}
      <section style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>MP (의지)</div>
          <div style={styles.statValue}>
            <span style={{color: '#60a5fa'}}>{gameState.runtime.mp}</span> 
            <span style={styles.statMax}> / {GAME_CONSTANTS.MAX_MP}</span>
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>DEF (방어)</div>
          <div style={styles.statValue}>{gameState.stats.def}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Junk (파편)</div>
          <div style={styles.statValue}>{gameState.inventory.junk}</div>
        </div>
      </section>

      {/* --- FEEDBACK AREA --- */}
      <div style={styles.feedbackArea}>
        "{feedbackMsg}"
      </div>

      {/* --- ACTIONS: Combat Interface --- */}
      <footer style={styles.actionArea}>
        <button onClick={handleSpend} style={styles.btnHit}>
          🔥 지출 (Hit)
        </button>
        <button onClick={handleDefense} style={styles.btnGuard}>
          🛡️ 방어 (Guard)
        </button>
      </footer>
    </div>
  );
};

// ----------------------------------------------------------------------
// [STYLES] 인라인 스타일 (빠른 프로토타이핑용)
// ----------------------------------------------------------------------
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '420px', // 모바일 사이즈 제한
    margin: '0 auto',
    backgroundColor: '#111827', // Dark Gray Background
    color: '#f3f4f6',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  date: { fontSize: '18px', fontWeight: 'bold' },
  modeBadge: {
    backgroundColor: '#374151',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#9ca3af',
  },
  heroSection: { marginBottom: '30px' },
  hpLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  hpBarBg: {
    width: '100%',
    height: '24px',
    backgroundColor: '#374151',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
  },
  hpBarFill: {
    height: '100%',
    transition: 'width 0.5s ease-in-out, background-color 0.5s',
  },
  budgetDetail: {
    marginTop: '8px',
    textAlign: 'right',
    fontSize: '12px',
    color: '#9ca3af',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    marginBottom: '30px',
  },
  statBox: {
    backgroundColor: '#1f2937',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  statLabel: { fontSize: '12px', color: '#9ca3af', marginBottom: '4px' },
  statValue: { fontSize: '20px', fontWeight: 'bold' },
  statMax: { fontSize: '12px', color: '#6b7280' },
  feedbackArea: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#d1d5db',
    marginBottom: '20px',
    border: '1px dashed #374151',
    borderRadius: '8px',
    padding: '20px',
  },
  actionArea: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  btnHit: {
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #b91c1c', // 버튼 입체감
  },
  btnGuard: {
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #1d4ed8',
  },
};
