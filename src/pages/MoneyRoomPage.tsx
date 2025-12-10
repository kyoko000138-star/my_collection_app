// src/pages/MoneyRoomPage.tsx
import React, { useEffect, useState } from 'react';
import { GAME_CONSTANTS, CLASS_TYPES, type ClassType } from '../money/constants';
import type {
  UserState,
  Transaction,
  PendingTransaction,
} from '../money/types';
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
  getAssetBuildingsView,
  type AssetBuildingView,
  changeClass,
} from '../money/moneyGameLogic';
import { getLunaMode, getLunaTheme } from '../money/moneyLuna';

// 간단 ID 생성기
const generateId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// 직업 선택 카드 정의
const CLASS_OPTIONS: {
  id: ClassType;
  title: string;
  subtitle: string;
  detail: string;
}[] = [
  {
    id: CLASS_TYPES.GUARDIAN,
    title: '🛡️ 수호자',
    subtitle: '소액 방어 & 스트릭 유지',
    detail:
      '3,000원 이하 지출을 방어해 스트릭을 지켜주는 방어 특화 타입입니다.',
  },
  {
    id: CLASS_TYPES.SAGE,
    title: '🔮 현자',
    subtitle: '기록 & 패턴 분석',
    detail:
      '기록과 패턴 분석에 특화된 타입입니다. 리포트/분석 화면에서 힘을 발휘하도록 확장 예정입니다.',
  },
  {
    id: CLASS_TYPES.ALCHEMIST,
    title: '💰 연금술사',
    subtitle: '정크 → 자산 변환',
    detail:
      'Junk를 자산으로 바꾸는 경제 타입입니다. 추후 골드/자산 화면과 연동됩니다.',
  },
  {
    id: CLASS_TYPES.DRUID,
    title: '🌿 드루이드',
    subtitle: 'REST 기간 회복 버프',
    detail:
      'REST 기간에 MP 추가 회복을 받는 타입입니다. 멘탈 & 회복에 초점을 둡니다.',
  },
];

// [MOCK] 초기 상태
const INITIAL_STATE: UserState = {
  profile: { name: 'Player 1', classType: CLASS_TYPES.GUARDIAN, level: 1 },
  luna: {
    nextPeriodDate: '2025-12-15', // 테스트용
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
    lastDayEndDate: null,
    guardPromptShownToday: false,
    noSpendStreak: 3,
    lunaShieldsUsedThisMonth: 0,
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
  assets: {
    fortress: 0,
    airfield: 0,
    mansion: 0,
    tower: 0,
    warehouse: 0,
  },
};

export const MoneyRoomPage: React.FC = () => {
  const [gameState, setGameState] = useState<UserState>(INITIAL_STATE);
  const [feedbackMsg, setFeedbackMsg] = useState('던전에 입장했습니다.');

  // 지출 입력 모달
  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
  const [spendAmountInput, setSpendAmountInput] = useState('');
  const [isFixedCostInput, setIsFixedCostInput] = useState(false);
  const [spendNoteInput, setSpendNoteInput] = useState('');

  // Guard Prompt
  const [isGuardPromptOpen, setIsGuardPromptOpen] = useState(false);
  const [guardInfo, setGuardInfo] = useState<GuardPromptInfo | null>(null);
  const [pendingSpendAmount, setPendingSpendAmount] = useState<number | null>(
    null
  );
  const [pendingIsFixedCost, setPendingIsFixedCost] = useState(false);

  // 직업 선택 모달
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // 파생 값
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
  const canCraftSword =
    pureEssence >= GAME_CONSTANTS.EQUIPMENT_COST_PURE_ESSENCE;

  const assetBuildings: AssetBuildingView[] = getAssetBuildingsView(gameState);

  const pendingList: PendingTransaction[] = gameState.pending;
  const pendingCount = pendingList.length;
  const isPendingHeavy = pendingCount >= 5;

  // 최근 지출 5건
  const recentTransactions = [...gameState.transactions].slice(-5).reverse();

  // 마운트 시 일일 리셋
  useEffect(() => {
    setGameState((prev) => checkDailyReset(prev));
  }, []);

  // UI 헬퍼
  const getHpColor = (hpValue: number) => {
    if (hpValue > 50) return '#4ade80';
    if (hpValue > 30) return '#facc15';
    return '#ef4444';
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

  // --- 지출 모달 열기/닫기 ---
  const handleOpenSpendModal = () => {
    setSpendAmountInput('');
    setIsFixedCostInput(false);
    setSpendNoteInput('');
    setIsSpendModalOpen(true);
  };

  const handleCloseSpendModal = () => {
    setIsSpendModalOpen(false);
  };

  // --- 지출 Hit 진행 (Guard Prompt 고려) ---
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

      const { newState, message } = applySpend(
        gameState,
        amount,
        isFixedCostInput
      );

      setGameState({
        ...newState,
        transactions: [...newState.transactions, tx],
      });
      setFeedbackMsg(message);
      setGuardInfo(null);
      setIsGuardPromptOpen(false);
      setPendingSpendAmount(null);
    }
  };

  // --- "나중에 입력"으로 저장 ---
  const handleSaveToPending = () => {
    const raw = spendAmountInput.replace(/,/g, '');
    const amount =
      raw.trim().length > 0 && !Number.isNaN(Number(raw))
        ? Number(raw)
        : undefined;

    if (amount !== undefined && amount <= 0) {
      setFeedbackMsg('금액을 비워두거나, 0보다 큰 숫자로 입력해주세요.');
      return;
    }

    if (!spendNoteInput && amount === undefined) {
      setFeedbackMsg('메모나 금액 중 하나는 입력해주세요.');
      return;
    }

    const pendingItem: PendingTransaction = {
      id: generateId(),
      amount,
      note: spendNoteInput || '(메모 없음)',
      createdAt: new Date().toISOString(),
    };

    setGameState((prev) => ({
      ...prev,
      pending: [...prev.pending, pendingItem],
    }));

    setIsSpendModalOpen(false);
    setFeedbackMsg('나중에 입력 리스트에 1건을 보관했습니다.');
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

    setGameState({
      ...newState,
      transactions: [...newState.transactions, tx],
    });

    setFeedbackMsg(message);
    setIsGuardPromptOpen(false);
    setGuardInfo(null);
    setPendingSpendAmount(null);
  };

  // --- Guard Prompt: 취소 & 방어 ---
  const handleCancelAndGuard = () => {
    if (
      gameState.counters.defenseActionsToday >=
      GAME_CONSTANTS.DAILY_DEFENSE_LIMIT
    ) {
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

  // --- 방어 버튼 (No Spend) ---
  const handleDefenseClick = () => {
    if (
      gameState.counters.defenseActionsToday >=
      GAME_CONSTANTS.DAILY_DEFENSE_LIMIT
    ) {
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

  // --- 정화 ---
  const handlePurify = () => {
    const { newState, message } = applyPurify(gameState);
    setGameState(newState);
    setFeedbackMsg(message);
  };

  // --- 장비 제작 ---
  const handleCraftSword = () => {
    const { newState, message } = applyCraftEquipment(gameState);
    setGameState(newState);
    setFeedbackMsg(message);
  };

  // --- 직업 선택 모달 ---
  const handleOpenClassModal = () => {
    setIsClassModalOpen(true);
  };

  const handleCloseClassModal = () => {
    setIsClassModalOpen(false);
  };

  const handleSelectClass = (classType: ClassType) => {
    const { newState, message } = changeClass(gameState, classType);
    setGameState(newState);
    setFeedbackMsg(message);
    setIsClassModalOpen(false);
  };

  // --- Pending 리스트 삭제/비우기 ---
  const handleRemovePending = (id: string) => {
    setGameState((prev) => ({
      ...prev,
      pending: prev.pending.filter((p) => p.id !== id),
    }));
  };

  const handleClearPending = () => {
    setGameState((prev) => ({
      ...prev,
      pending: [],
    }));
    setFeedbackMsg('나중에 입력 리스트를 모두 비웠습니다.');
  };

  return (
    <div style={{ ...styles.container, backgroundColor: theme.bgColor }}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={styles.date}>{todayStr}</span>
          <button
            type="button"
            onClick={handleOpenClassModal}
            style={styles.classButton}
          >
            {getClassBadge(gameState.profile.classType)}
          </button>
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

      {/* HP BAR */}
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

      {/* STATS */}
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

      {/* PURIFY */}
      <section style={styles.purifySection}>
        <div style={styles.purifyHeader}>
          <span style={styles.purifyTitle}>정화 루프</span>
          <span style={styles.purifySubtitle}>
            Junk + Salt + MP → pureEssence
          </span>
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

      {/* EQUIPMENT */}
      <section style={styles.eqSection}>
        <div style={styles.eqHeader}>
          <span style={styles.eqTitle}>장비 & 인벤토리</span>
          <span style={styles.eqSubtitle}>
            pureEssence {GAME_CONSTANTS.EQUIPMENT_COST_PURE_ESSENCE}개 → 잔잔한
            장부검
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

      {/* 자산의 왕국 */}
      <section style={styles.assetSection}>
        <div style={styles.assetHeader}>
          <span style={styles.assetTitle}>자산의 왕국</span>
          <span style={styles.assetSubtitle}>
            금액이 아니라 “횟수”로 성장하는 작은 왕국들
          </span>
        </div>
        <div style={styles.assetList}>
          {assetBuildings.map((b) => {
            const ratio =
              b.nextTarget === null || b.nextTarget === 0
                ? 1
                : Math.max(0, Math.min(1, b.count / b.nextTarget));
            const nextDiff =
              b.nextTarget === null ? null : Math.max(b.nextTarget - b.count, 0);

            return (
              <div key={b.id} style={styles.assetCard}>
                <div style={styles.assetCardHeader}>
                  <span style={styles.assetLabel}>{b.label}</span>
                  <span style={styles.assetLevelBadge}>Lv.{b.level}</span>
                </div>
                <div style={styles.assetInfoRow}>
                  <span>누적 횟수: {b.count}회</span>
                  {nextDiff === null ? (
                    <span style={styles.assetDoneText}>최대 레벨 달성</span>
                  ) : (
                    <span>다음 레벨까지 {nextDiff}회</span>
                  )}
                </div>
                <div style={styles.assetProgressBg}>
                  <div
                    style={{
                      ...styles.assetProgressFill,
                      width: `${ratio * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 나중에 입력 리스트 */}
      <section style={styles.pendingSection}>
        <div style={styles.pendingHeaderRow}>
          <span style={styles.pendingTitle}>나중에 입력 리스트</span>
          <span style={styles.pendingCount}>{pendingCount}건</span>
        </div>

        {pendingCount === 0 ? (
          <div style={styles.pendingEmpty}>
            보류 중인 항목이 없습니다. 필요할 때 지출 입력 화면에서
            &quot;나중에 입력&quot;을 눌러보세요.
          </div>
        ) : (
          <>
            {isPendingHeavy && (
              <div style={styles.pendingWarn}>
                ⚠️ 나중에 입력이 {pendingCount}건 쌓였습니다. 주말에 한 번 정리해
                보세요.
              </div>
            )}
            <div style={styles.pendingList}>
              {pendingList.map((p) => (
                <div key={p.id} style={styles.pendingRow}>
                  <div style={styles.pendingMain}>
                    <span style={styles.pendingNote}>{p.note}</span>
                    {p.amount !== undefined && (
                      <span style={styles.pendingAmount}>
                        {p.amount.toLocaleString()}원
                      </span>
                    )}
                  </div>
                  <div style={styles.pendingSub}>
                    <span>{p.createdAt.slice(0, 10)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePending(p.id)}
                      style={styles.pendingDeleteBtn}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleClearPending}
              style={styles.pendingClearBtn}
            >
              리스트 전체 비우기
            </button>
          </>
        )}
      </section>

      {/* 최근 지출 로그 */}
      <section style={styles.txSection}>
        <div style={styles.txHeaderRow}>
          <span style={styles.txTitle}>최근 지출 로그</span>
          <span style={styles.txCount}>
            {gameState.transactions.length}건
          </span>
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

      {/* 피드백 영역 */}
      <div style={{ ...styles.feedbackArea, borderColor: theme.color }}>
        {feedbackMsg === '던전에 입장했습니다.' ? theme.message : feedbackMsg}
      </div>

      {/* 액션 버튼 */}
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

      {/* 지출 입력 모달 */}
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
                닫기
              </button>
              <button onClick={handleSaveToPending} style={styles.btnSecondary}>
                나중에 입력
              </button>
              <button onClick={handleSpendNext} style={styles.btnPrimary}>
                Hit 진행 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guard Prompt 모달 */}
      {isGuardPromptOpen && guardInfo && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>Guard 체크</h2>
            <p
              style={{
                fontSize: '14px',
                marginBottom: '12px',
                lineHeight: 1.6,
              }}
            >
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
            <p
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginBottom: '16px',
              }}
            >
              숫자와 상태만 알려드립니다. 진행 여부는 사용자가 결정합니다.
            </p>

            <div style={styles.modalButtonRow}>
              <button
                onClick={handleCancelAndGuard}
                style={styles.btnSecondary}
              >
                지출 취소 & 방어
              </button>
              <button onClick={handleConfirmHit} style={styles.btnPrimary}>
                Hit 진행
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 직업 선택 모달 */}
      {isClassModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>직업 선택</h2>
            <p
              style={{
                fontSize: '13px',
                color: '#9ca3af',
                marginBottom: '12px',
              }}
            >
              이번 달 머니룸에서 사용할 직업을 선택합니다.
              직업을 변경하면 레벨은 1로 초기화됩니다.
            </p>

            <div style={styles.classOptionsList}>
              {CLASS_OPTIONS.map((opt) => {
                const isCurrent = gameState.profile.classType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectClass(opt.id)}
                    style={{
                      ...styles.classOptionCard,
                      borderColor: isCurrent ? '#60a5fa' : '#1f2937',
                      opacity: isCurrent ? 0.9 : 1,
                    }}
                  >
                    <div style={styles.classOptionHeader}>
                      <span style={styles.classOptionTitle}>{opt.title}</span>
                      {isCurrent && (
                        <span style={styles.classOptionCurrent}>현재</span>
                      )}
                    </div>
                    <div style={styles.classOptionSubtitle}>
                      {opt.subtitle}
                    </div>
                    <div style={styles.classOptionDetail}>{opt.detail}</div>
                  </button>
                );
              })}
            </div>

            <div style={styles.modalButtonRow}>
              <button onClick={handleCloseClassModal} style={styles.btnSecondary}>
                닫기
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  date: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  classButton: {
    marginTop: '4px',
    padding: '4px 8px',
    borderRadius: '999px',
    border: '1px solid #1f2937',
    backgroundColor: 'rgba(15,23,42,0.85)',
    color: '#60a5fa',
    fontSize: '12px',
    cursor: 'pointer',
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

  // PURIFY
  purifySection: {
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#020617',
    border: '1px solid #374151',
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

  // EQUIPMENT
  eqSection: {
    marginBottom: '16px',
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

  // 자산의 왕국
  assetSection: {
    marginBottom: '20px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#020617',
    border: '1px solid #374151',
  },
  assetHeader: {
    marginBottom: '6px',
  },
  assetTitle: {
    fontSize: '13px',
    fontWeight: 600,
  },
  assetSubtitle: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  assetList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px',
  },
  assetCard: {
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1px solid #111827',
    backgroundColor: '#020617',
  },
  assetCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  assetLabel: {
    fontSize: '12px',
    color: '#e5e7eb',
  },
  assetLevelBadge: {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '999px',
    border: '1px solid #4b5563',
    color: '#e5e7eb',
  },
  assetInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
  assetDoneText: {
    color: '#facc15',
  },
  assetProgressBg: {
    width: '100%',
    height: '6px',
    borderRadius: '999px',
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  assetProgressFill: {
    height: '100%',
    borderRadius: '999px',
    backgroundColor: '#22c55e',
    transition: 'width 0.4s ease-out',
  },

  // PENDING
  pendingSection: {
    marginBottom: '20px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#020617',
    border: '1px dashed #4b5563',
  },
  pendingHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  pendingTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e5e7eb',
  },
  pendingCount: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  pendingEmpty: {
    fontSize: '12px',
    color: '#6b7280',
  },
  pendingWarn: {
    fontSize: '11px',
    color: '#facc15',
    marginBottom: '6px',
  },
  pendingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '4px',
    marginBottom: '8px',
  },
  pendingRow: {
    padding: '6px 0',
    borderTop: '1px solid #111827',
  },
  pendingMain: {
    display: 'flex',
    justifyContent: 'spaceBetween',
    alignItems: 'baseline',
    marginBottom: '2px',
  } as React.CSSProperties,
  pendingNote: {
    fontSize: '12px',
    color: '#e5e7eb',
    marginRight: '8px',
  },
  pendingAmount: {
    fontSize: '12px',
    color: '#93c5fd',
  },
  pendingSub: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px',
  },
  pendingDeleteBtn: {
    border: 'none',
    background: 'transparent',
    color: '#f97373',
    cursor: 'pointer',
    fontSize: '11px',
  },
  pendingClearBtn: {
    marginTop: '4px',
    width: '100%',
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid #4b5563',
    backgroundColor: '#020617',
    color: '#9ca3af',
    fontSize: '11px',
    cursor: 'pointer',
  },

  // Transaction Log
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

  // 모달
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

  // 직업 선택 모달
  classOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
  },
  classOptionCard: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #1f2937',
    backgroundColor: '#020617',
    cursor: 'pointer',
  },
  classOptionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  classOptionTitle: {
    fontSize: '14px',
    fontWeight: 600,
  },
  classOptionCurrent: {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '999px',
    border: '1px solid #60a5fa',
    color: '#bfdbfe',
  },
  classOptionSubtitle: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '2px',
  },
  classOptionDetail: {
    fontSize: '11px',
    color: '#6b7280',
  },
};

export default MoneyRoomPage;
