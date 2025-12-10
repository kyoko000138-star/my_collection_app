// src/pages/MoneyRoomPage.tsx

import React, { useEffect, useState } from 'react';
import { GAME_CONSTANTS, CLASS_TYPES, type ClassType } from '../money/constants';
import type { UserState, Transaction } from '../money/types';
import {
  getHp,
  applySpend,
  applyDefense,
  checkDailyReset,
  getGuardPromptInfo,
  type GuardPromptInfo,
  applyDayEnd,
  applyPurify,
  applyCraftEquipment,
} from '../money/moneyGameLogic';
import { getLunaMode, getLunaTheme } from '../money/moneyLuna';

// 간단한 ID 생성기
const generateId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// [MOCK DATA] 초기 상태
const INITIAL_STATE: UserState = {
  profile: { name: 'Player 1', classType: CLASS_TYPES.GUARDIAN, level: 1 },
  luna: {
    nextPeriodDate: '2025-12-15', // 테스트 날짜 (PMS 유도용)
    averageCycle: 28,
    isTracking: true,
  },
  budget: {
    total: 1_000_000,
    current: 850_000,
    fixedCost: 300_000,
    startDate: '2025-12-01',
  },
  stats: { def: 50, creditScore: 0 },
  counters: {
    defenseActionsToday: 0,
    junkObtainedToday: 0,
    lastAccessDate: null,
    lastDailyResetDate: null,
    noSpendStreak: 3,
    lunaShieldsUsedThisMonth: 0,
    guardPromptShownToday: false,
    lastDayEndDate: null,
  },
  runtime: { mp: 15 },
  inventory: {
    junk: 0,
    salt: 0,
    shards: {},
    materials: {},
    equipment: [],
    collection: [],
  },
  pending: [],
  transactions: [],
};

export const MoneyRoomPage: React.FC = () => {
  const [gameState, setGameState] = useState<UserState>(INITIAL_STATE);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('던전에 입장했습니다.');

  // 지출 입력 모달 상태
  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
  const [spendAmountInput, setSpendAmountInput] = useState<string>('');
  const [isFixedCostInput, setIsFixedCostInput] = useState<boolean>(false);
  const [spendNoteInput, setSpendNoteInput] = useState<string>('');

  // Guard Prompt 상태
  const [isGuardPromptOpen, setIsGuardPromptOpen] = useState(false);
  const [guardInfo, setGuardInfo] = useState<GuardPromptInfo | null>(null);
  const [pendingSpendAmount, setPendingSpendAmount] = useState<number | null>(null);
  const [pendingIsFixedCost, setPendingIsFixedCost] = useState<boolean>(false);

  // 파생 값들
  const hp = getHp(gameState.budget.current, gameState.budget.total);
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMode = getLunaMode(todayStr, gameState.luna.nextPeriodDate);
  const theme = getLunaTheme(currentMode);

  const junk = gameState.inventory.junk;
  const salt = gameState.inventory.salt;
  const dust = gameState.inventory.shards['naturalDust'] ?? 0;
  const pureEssence = gameState.inventory.materials['pureEssence'] ?? 0;
  const equipment = gameState.inventory.equipment;
  const canPurify = junk > 0 && salt > 0 && gameState.runtime.mp > 0;
  const canCraftSword = pureEssence >= GAME_CONSTANTS.EQUIPMENT_COST_PURE_ESSENCE;

  // 마운트 시 일일 리셋
  useEffect(() => {
    setGameState((prev) => checkDailyReset(prev));
  }, []);

  // UI 헬퍼
  const getHpColor = (hp: number) => {
    if (hp > 50) return '#4ade80'; // Green
    if (hp > 30) return '#facc15'; // Yellow
    return '#ef4444';              // Red
  };

  const getClassBadge = (classType: ClassType | null) => {
    switch (classType) {
      case CLASS_TYPES.GUARDIAN:
        return '🛡️ 수호자 Lv.1';
      case CLASS_TYPES.SAGE:
        return '🔮 현자 Lv.1';
      case CLASS_TYPES.ALCHEMIST:
        return '💰 연금술사 Lv.1';
      case CLASS_TYPES.DRUID:
        return '🌿 드루이드 Lv.1';
      default:
        return '👶 모험가';
    }
  };

  // --- 지출 입력 모달 열기 ---
  const handleOpenSpendModal = () => {
    setSpendAmountInput('');
    setIsFixedCostInput(false);
    setSpendNoteInput('');
    setIsSpendModalOpen(true);
  };

  const handleCloseSpendModal = () => {
    setIsSpendModalOpen(false);
  };

  // --- Guard Prompt 플로우 포함한 지출 제출 ---
  const handleSpendNext = () => {
    const raw = spendAmountInput.replace(/,/g, '');
    const amount = Number(raw);

    if (!amount || amount <= 0 || Number.isNaN(amount)) {
      setFeedbackMsg('지출 금액을 입력해주세요.');
      return;
    }

    const info = getGuardPromptInfo(gameState, amount, isFixedCostInput);
    setPendingSpendAmount(amount);
    setPendingIsFixedCost(isFixedCostInput);
    setIsSpendModalOpen(false);

    if (info.shouldShow) {
      setGuardInfo(info);
      setIsGuardPromptOpen(true);
      setGameState((prev) => ({
        ...prev,
        counters: {
          ...prev.counters,
          guardPromptShownToday: true,
        },
      }));
    } else {
      const tx: Transaction = {
        id: generateId(),
        amount,
        category: isFixedCostInput ? '고정비' : '기타',
        date: todayStr,
        note: spendNoteInput,
        tags: [],
        isFixedCost: isFixedCostInput,
      };

      const { newState, message } = applySpend(gameState, amount, isFixedCostInput);

      const nextTransactions = [...gameState.transactions, tx];

      setGameState({
        ...newState,
        transactions: nextTransactions,
      });
      setFeedbackMsg(message);
      setGuardInfo(null);
      setIsGuardPromptOpen(false);
      setPendingSpendAmount(null);
    }
  };

  // --- Guard Prompt: Hit 진행 ---
  const handleConfirmHit = () => {
    if (!pendingSpendAmount) {
      setIsGuardPromptOpen(false);
      setGuardInfo(null);
      return;
    }

    const amount = pendingSpendAmount;

    const tx: Transaction = {
      id: generateId(),
      amount,
      category: pendingIsFixedCost ? '고정비' : '기타',
      date: todayStr,
      note: spendNoteInput,
      tags: [],
      isFixedCost: pendingIsFixedCost,
    };

    const { newState, message } = applySpend(
      gameState,
      amount,
      pendingIsFixedCost
    );

    const nextTransactions = [...gameState.transactions, tx];

    setGameState({
      ...newState,
      transactions: nextTransactions,
    });
    setFeedbackMsg(message);
    setIsGuardPromptOpen(false);
    setGuardInfo(null);
    setPendingSpendAmount(null);
  };

  // --- Guard Prompt: 취소 후 방어 ---
  const handleCancelAndGuard = () => {
    if (gameState.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) {
      setFeedbackMsg('오늘의 방어 태세가 이미 한계에 도달했습니다.');
    } else {
      const nextState = applyDefense(gameState);
      setGameState(nextState);
      setFeedbackMsg(
        `지출을 취소했습니다. 방어 성공. MP가 회복되었습니다. (${nextState.counters.defenseActionsToday}/${GAME_CONSTANTS.DAILY_DEFENSE_LIMIT})`
      );
    }
    setIsGuardPromptOpen(false);
    setGuardInfo(null);
    setPendingSpendAmount(null);
  };

  // --- 일반 방어 버튼 (No-Spend Guard) ---
  const handleDefenseClick = () => {
    if (gameState.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) {
      setFeedbackMsg('오늘의 방어 태세가 이미 한계에 도달했습니다.');
      return;
    }
    const nextState = applyDefense(gameState);
    setGameState(nextState);
    setFeedbackMsg(
      `방어 성공. MP가 회복되었습니다. (${nextState.counters.defenseActionsToday}/${GAME_CONSTANTS.DAILY_DEFENSE_LIMIT})`
    );
  };

  // --- 오늘 마감하기 ---
  const handleDayEnd = () => {
    const { newState, message } = applyDayEnd(gameState);
    setGameState(newState);
    setFeedbackMsg(message);
  };

  // --- 정화(Purify) ---
  const handlePurify = () => {
    const { newState, message } = applyPurify(gameState);
    setGameState(newState);
    setFeedbackMsg(message);
  };

  // --- 장비 제작 (Craft) ---
  const handleCraftSword = () => {
    const { newState, message } = applyCraftEquipment(gameState);
    setGameState(newState);
    setFeedbackMsg(message);
  };

  // 최근 N개 지출
  const recentTransactions = [...gameState.transactions]
    .slice(-5)
    .reverse();

  return (
    <div style={{ ...styles.container, backgroundColor: theme.bgColor }}>
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={styles.date}>{todayStr}</span>
          <span style={{ fontSize: '14px', color: '#60a5fa', marginTop: '4px' }}>
            {getClassBadge(gameState.profile.classType)}
          </span>
        </div>
        <span
          style={{
            ...styles.modeBadge,
            color: theme.color,
            border: `1px solid ${theme.color}`,
          }}
        >
          {theme.label}
        </span>
      </header>

      {/* --- HERO: HP BAR --- */}
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
              backgroundColor: getHpColor(hp),
            }}
          />
        </div>
        <div style={styles.budgetDetail}>
          {gameState.budget.current.toLocaleString()} /{' '}
          {gameState.budget.total.toLocaleString()}
        </div>
      </section>

      {/* --- STATS GRID --- */}
      <section style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>MP</div>
          <div style={styles.statValue}>
            <span style={{ color: '#60a5fa' }}>{gameState.runtime.mp}</span>
            <span style={styles.statMax}> / {GAME_CONSTANTS.MAX_MP}</span>
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>DEF</div>
          <div style={styles.statValue}>{gameState.stats.def}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Junk</div>
          <div style={styles.statValue}>{gameState.inventory.junk}</div>
        </div>
      </section>

      {/* --- PURIFY SECTION --- */}
      <section style={styles.purifySection}>
        <div style={styles.purifyHeader}>
          <span style={styles.purifyTitle}>정화 루프</span>
          <span style={styles.purifySubtitle}>Junk + Salt + MP → Material</span>
        </div>
        <div style={styles.purifyStatsRow}>
          <span>Junk: {junk}</span>
          <span>Salt: {salt}</span>
          <span>Dust: {dust}</span>
          <span>Essence: {pureEssence}</span>
        </div>
        <button
          onClick={handlePurify}
          disabled={!canPurify}
          style={{
            ...styles.btnPurify,
            opacity: canPurify ? 1 : 0.5,
            cursor: canPurify ? 'pointer' : 'not-allowed',
          }}
        >
          🔄 정화 1회 (Junk 1 + Salt 1 + MP 1)
        </button>
      </section>

      {/* --- EQUIPMENT SECTION --- */}
      <section style={styles.eqSection}>
        <div style={styles.eqHeader}>
          <span style={styles.eqTitle}>장비 & 인벤토리</span>
          <span style={styles.eqSubtitle}>
            pureEssence {GAME_CONSTANTS.EQUIPMENT_COST_PURE_ESSENCE}개 → 잔잔한 장부검
          </span>
        </div>
        <div style={styles.eqStatsRow}>
          <span>보유 Essence: {pureEssence}</span>
          <span>장비 개수: {equipment.length}</span>
        </div>
        <div style={styles.eqList}>
          {equipment.length === 0 ? (
            <div style={styles.eqEmpty}>아직 제작된 장비가 없습니다.</div>
          ) : (
            equipment.map((name, idx) => (
              <div key={`${name}-${idx}`} style={styles.eqItem}>
                <span style={styles.eqItemName}>{name}</span>
              </div>
            ))
          )}
        </div>
        <button
          onClick={handleCraftSword}
          disabled={!canCraftSword}
          style={{
            ...styles.btnCraft,
            opacity: canCraftSword ? 1 : 0.5,
            cursor: canCraftSword ? 'pointer' : 'not-allowed',
          }}
        >
          ⚒ 장비 제작 (잔잔한 장부검)
        </button>
      </section>

      {/* --- TRANSACTION LOG --- */}
      <section style={styles.txSection}>
        <div style={styles.txHeaderRow}>
          <span style={styles.txTitle}>최근 지출 로그</span>
          <span style={styles.txCount}>{gameState.transactions.length}건</span>
        </div>
        {gameState.transactions.length === 0 ? (
          <div style={styles.txEmpty}>아직 기록된 지출이 없습니다.</div>
        ) : (
          <div>
            {recentTransactions.map((tx) => (
              <div key={tx.id} style={styles.txRow}>
                <div style={styles.txRowMain}>
                  <span style={styles.txAmount}>
                    {tx.amount.toLocaleString()}원
                  </span>
                  <span style={styles.txCategory}>
                    {tx.isFixedCost ? '고정비' : '비고정비'}
                  </span>
                </div>
                <div style={styles.txRowSub}>
                  <span>{tx.date}</span>
                  {tx.note && <span> · {tx.note}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- FEEDBACK AREA --- */}
      <div style={{ ...styles.feedbackArea, borderColor: theme.color }}>
        {feedbackMsg === '던전에 입장했습니다.' ? theme.message : feedbackMsg}
      </div>

      {/* --- ACTIONS --- */}
      <footer style={styles.actionArea}>
        <button onClick={handleOpenSpendModal} style={styles.btnHit}>
          🔥 지출 입력
        </button>
        <button onClick={handleDefenseClick} style={styles.btnGuard}>
          🛡️ 방어 (No Spend)
        </button>
        <button onClick={handleDayEnd} style={styles.btnDayEnd}>
          🌙 오늘 마감하기
        </button>
      </footer>

      {/* --- 지출 입력 모달 --- */}
      {isSpendModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>지출 입력</h2>

            <div style={styles.modalRow}>
              <label style={styles.modalLabel}>금액</label>
              <input
                style={styles.modalInput}
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={spendAmountInput}
                onChange={(e) => setSpendAmountInput(e.target.value)}
              />
            </div>

            <div style={styles.modalRow}>
              <label style={styles.modalLabel}>고정비 여부</label>
              <div style={styles.modalCheckboxRow}>
                <input
                  id="fixedCostCheckbox"
                  type="checkbox"
                  checked={isFixedCostInput}
                  onChange={(e) => setIsFixedCostInput(e.target.checked)}
                />
                <label htmlFor="fixedCostCheckbox" style={{ marginLeft: '8px' }}>
                  고정비로 처리
                </label>
              </div>
            </div>

            <div style={styles.modalRow}>
              <label style={styles.modalLabel}>메모 (선택)</label>
              <input
                style={styles.modalInput}
                type="text"
                placeholder="메모를 남겨둘 수 있습니다."
                value={spendNoteInput}
                onChange={(e) => setSpendNoteInput(e.target.value)}
              />
            </div>

            <div style={styles.modalButtonRow}>
              <button onClick={handleCloseSpendModal} style={styles.btnSecondary}>
                취소
              </button>
              <button onClick={handleSpendNext} style={styles.btnPrimary}>
                다음 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Guard Prompt 모달 --- */}
      {isGuardPromptOpen && guardInfo && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>Guard 체크</h2>
            <p style={{ fontSize: '14px', marginBottom: '12px', lineHeight: 1.6 }}>
              이 지출을 진행하면 HP와 일일 사용 가능 금액이 다음과 같이 변합니다.
            </p>
            <div style={{ marginBottom: '12px', fontSize: '14px' }}>
              <div>
                <strong>HP</strong> : {guardInfo.hpBefore}% →{' '}
                {guardInfo.hpAfter}%
              </div>
              <div style={{ marginTop: '6px' }}>
                <strong>남은 기간 일평균</strong> :{' '}
                {guardInfo.avgAvailablePerDay.toLocaleString()}원 사용 가능
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>
              숫자와 상태만 알려드립니다. 진행 여부는 사용자가 결정합니다.
            </p>

            <div style={styles.modalButtonRow}>
              <button onClick={handleCancelAndGuard} style={styles.btnSecondary}>
                지출 취소 & 방어
              </button>
              <button onClick={handleConfirmHit} style={styles.btnPrimary}>
                Hit 진행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 스타일
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '420px',
    margin: '0 auto',
    color: '#f3f4f6',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    transition: 'background-color 0.5s',
  },
  header: {
    display: 'flex',
    justifyContent: 'spaceBetween' as any,
    alignItems: 'center',
    marginBottom: '30px',
  },
  date: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  modeBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  heroSection: {
    marginBottom: '30px',
  },
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
    marginBottom: '16px',
  },
  statBox: {
    backgroundColor: '#1f2937',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  statLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  statMax: {
    fontSize: '12px',
    color: '#6b7280',
  },

  // --- PURIFY ---
  purifySection: {
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#020617',
    border: '1px solid '#374151',
  },
  purifyHeader: {
    marginBottom: '6px',
  },
  purifyTitle: {
    fontSize: '13px',
    fontWeight: 600,
  },
  purifySubtitle: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  purifyStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#e5e7eb',
    marginTop: '6px',
    marginBottom: '10px',
  },
  btnPurify: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #4b5563',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    fontSize: '13px',
  },

  // --- EQUIPMENT ---
  eqSection: {
    marginBottom: '20px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#020617',
    border: '1px solid #374151',
  },
  eqHeader: {
    marginBottom: '6px',
  },
  eqTitle: {
    fontSize: '13px',
    fontWeight: 600,
  },
  eqSubtitle: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  eqStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#e5e7eb',
    marginTop: '4px',
    marginBottom: '8px',
  },
  eqList: {
    maxHeight: '80px',
    overflowY: 'auto',
    marginBottom: '8px',
  },
  eqEmpty: {
    fontSize: '11px',
    color: '#6b7280',
  },
  eqItem: {
    padding: '4px 0',
    borderTop: '1px solid #111827',
    fontSize: '12px',
  },
  eqItemName: {
    color: '#e5e7eb',
  },
  btnCraft: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #4b5563',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    fontSize: '13px',
  },

  // --- Transaction Log ---
  txSection: {
    marginBottom: '20px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#111827',
    border: '1px solid #374151',
  },
  txHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  txTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e5e7eb',
  },
  txCount: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  txEmpty: {
    fontSize: '12px',
    color: '#6b7280',
    padding: '4px 0',
  },
  txRow: {
    padding: '6px 0',
    borderTop: '1px solid #1f2937',
  },
  txRowMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  txAmount: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#f9fafb',
  },
  txCategory: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  txRowSub: {
    marginTop: '2px',
    fontSize: '11px',
    color: '#6b7280',
  },

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
    gap: '10px',
    marginTop: '4px',
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
    boxShadow: '0 4px 0 #b91c1c',
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
  btnDayEnd: {
    gridColumn: '1 / span 2',
    padding: '12px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#111827',
    color: '#e5e7eb',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '4px',
    borderTop: '1px solid #374151',
  },

  // --- 모달 스타일 ---
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  modalCard: {
    width: '100%',
    maxWidth: '360px',
    backgroundColor: '#020617',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    border: '1px solid #1f2937',
    color: '#e5e7eb',
  },
  modalTitle: {
    fontSize: '18px',
    marginBottom: '16px',
  },
  modalRow: {
    marginBottom: '12px',
  },
  modalLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
  modalInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #4b5563',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    fontSize: '14px',
  },
  modalCheckboxRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
  },
  modalButtonRow: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  btnSecondary: {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #4b5563',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnPrimary: {
    padding: '8px 12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 3px 0 #1d4ed8',
  },
};

export default MoneyRoomPage;
