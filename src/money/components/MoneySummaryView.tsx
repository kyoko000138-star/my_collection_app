// src/money/components/MoneySummaryView.tsx

import React from 'react';
import { UserState } from '../types';
import { calculateLunaPhase } from '../moneyLuna';

interface MoneySummaryViewProps {
  user: UserState;
  onBackToGame: () => void;
}

export const MoneySummaryView: React.FC<MoneySummaryViewProps> = ({
  user,
  onBackToGame,
}) => {
  // --- 기본 스탯 계산 ---
  const hpPercent =
    user.maxBudget > 0
      ? Math.round((user.currentBudget / user.maxBudget) * 100)
      : 0;

  const mpPercent =
    user.maxMp > 0 ? Math.round((user.mp / user.maxMp) * 100) : 0;

  const {
    noSpendStreak,
    dailyTotalSpend,
    defenseActionsToday,
    junkObtainedToday,
  } = user.counters;

  // 이번 달 예산 대비 사용/남은 금액 (대략)
  const usedBudget =
    user.maxBudget > 0
      ? Math.max(user.maxBudget - Math.max(user.currentBudget, 0), 0)
      : 0;

  const luna = calculateLunaPhase(user.lunaCycle);

  // --- UI ---
  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button type="button" onClick={onBackToGame} style={styles.backButton}>
          ← 게임으로
        </button>
        <div style={styles.headerTexts}>
          <div style={styles.headerLabel}>MONEY SUMMARY</div>
          <h1 style={styles.headerTitle}>이번 달 재무 요약</h1>
          <div style={styles.headerSub}>
            소비로가 아니라 <b>절약·저축으로 도파민</b>을 얻기 위한
            상태판이에요.
          </div>
        </div>
      </div>

      {/* 카드 1: 예산 / HP · MP */}
      <section style={styles.card}>
        <div style={styles.cardTitleRow}>
          <span style={styles.cardTitle}>예산 & 상태</span>
          <span style={styles.cardMeta}>
            {luna.phaseName} · {luna.isPeriod ? '생리 기간' : '일반일'}
          </span>
        </div>

        <div style={styles.budgetRow}>
          <div style={styles.budgetBox}>
            <div style={styles.budgetLabel}>이번 달 예산</div>
            <div style={styles.budgetValue}>
              {user.maxBudget.toLocaleString()} G
            </div>
          </div>
          <div style={styles.budgetBox}>
            <div style={styles.budgetLabel}>지금까지 사용</div>
            <div style={styles.budgetValue}>{usedBudget.toLocaleString()} G</div>
          </div>
          <div style={styles.budgetBox}>
            <div style={styles.budgetLabel}>남은 예산(HP)</div>
            <div style={styles.budgetValue}>
              {user.currentBudget.toLocaleString()} G
            </div>
          </div>
        </div>

        {/* HP 바 */}
        <div style={styles.barBlock}>
          <div style={styles.barLabelRow}>
            <span>HP (예산 잔량)</span>
            <span>{hpPercent}%</span>
          </div>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFillGreen, width: `${hpPercent}%` }} />
          </div>
        </div>

        {/* MP 바 */}
        <div style={styles.barBlock}>
          <div style={styles.barLabelRow}>
            <span>MP (의지력)</span>
            <span>
              {user.mp} / {user.maxMp}
            </span>
          </div>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFillBlue, width: `${mpPercent}%` }} />
          </div>
        </div>
      </section>

      {/* 카드 2: 방어 / 무지출 / Junk */}
      <section style={styles.card}>
        <div style={styles.cardTitleRow}>
          <span style={styles.cardTitle}>오늘의 패턴</span>
          <span style={styles.cardMeta}>오늘 기준</span>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>오늘 지출 합계</div>
            <div style={styles.statValue}>
              {dailyTotalSpend.toLocaleString()} G
            </div>
            <div style={styles.statHint}>HP에서 빠져나간 양</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>방어 행동(Guard)</div>
            <div style={styles.statValue}>{defenseActionsToday}</div>
            <div style={styles.statHint}>
              피격 전에 막아낸 횟수예요.
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>오늘 획득 Junk</div>
            <div style={styles.statValue}>{junkObtainedToday}</div>
            <div style={styles.statHint}>
              소비의 흔적이자, 나중엔 정화 재료가 돼요.
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>무지출 스트릭</div>
            <div style={styles.statValue}>{noSpendStreak}</div>
            <div style={styles.statHint}>
              쌓일수록 <b>도파민 보상</b>을 크게 줄 계획!
            </div>
          </div>
        </div>
      </section>

      {/* 카드 3: 자원 / 인벤 느낌 */}
      <section style={styles.card}>
        <div style={styles.cardTitleRow}>
          <span style={styles.cardTitle}>재료 & 자원</span>
        </div>
        <div style={styles.resourceRow}>
          <div style={styles.resourceBadge}>
            🧹 Junk <span style={styles.resourceValue}>{user.junk}</span>
          </div>
          <div style={styles.resourceBadge}>
            🧂 Salt <span style={styles.resourceValue}>{user.salt}</span>
          </div>
          <div style={styles.resourceBadge}>
            🧪 Pure Essence{' '}
            <span style={styles.resourceValue}>
              {user.materials['PURE_ESSENCE'] || 0}
            </span>
          </div>
        </div>
        <p style={styles.resourceText}>
          Junk와 Salt는 <b>정화</b>를 통해 Pure Essence로 바뀌고,
          나중에는 “절약 장비”나 “배지” 제작에 쓰일 예정이에요.
        </p>
      </section>

      {/* 카드 4: 나중에 입력할 기록 */}
      <section style={styles.card}>
        <div style={styles.cardTitleRow}>
          <span style={styles.cardTitle}>나중에 입력할 기록</span>
          <span style={styles.cardMeta}>
            최근 {Math.min(user.pending.length, 5)}개만 표시
          </span>
        </div>
        {user.pending.length === 0 ? (
          <div style={styles.pendingEmpty}>
            아직 “나중에 입력”으로 저장된 기록이 없어요.
            <br />
            지출을 메모만 해 두고 싶을 때, 전투 화면의 기능을 붙일 예정이에요.
          </div>
        ) : (
          <div style={styles.pendingList}>
            {user.pending.slice(0, 5).map((p) => (
              <div key={p.id} style={styles.pendingItem}>
                <div style={styles.pendingNote}>{p.note}</div>
                <div style={styles.pendingMeta}>
                  <span>
                    {p.amount
                      ? `${p.amount.toLocaleString()}원`
                      : '금액 미입력'}
                  </span>
                  <span>{p.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 푸터 */}
      <div style={styles.footer}>
        <button type="button" onClick={onBackToGame} style={styles.mainButton}>
          🎮 게임 화면으로 돌아가기
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '420px',
    margin: '0 auto',
    minHeight: '100vh',
    padding: '52px 12px 16px',
    color: '#e5e7eb',
    fontFamily: '"NeoDungGeunMo", monospace',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid #4b5563',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    fontSize: 11,
    cursor: 'pointer',
  },
  headerTexts: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 10,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#9ca3af',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    margin: 0,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 11,
    color: '#9ca3af',
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 12,
    border: '1px solid #1f2937',
    marginBottom: 10,
  },
  cardTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
  },
  cardMeta: {
    fontSize: 10,
    color: '#9ca3af',
  },
  budgetRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 6,
    marginBottom: 8,
  },
  budgetBox: {
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 6,
    border: '1px solid #111827',
  },
  budgetLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 2,
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: 600,
  },
  barBlock: {
    marginTop: 4,
  },
  barLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    marginBottom: 2,
  },
  barTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#020617',
    overflow: 'hidden',
  },
  barFillGreen: {
    height: '100%',
    background:
      'linear-gradient(90deg, rgba(34,197,94,1) 0%, rgba(190,242,100,1) 100%)',
  },
  barFillBlue: {
    height: '100%',
    background:
      'linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(129,140,248,1) 100%)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
  },
  statBox: {
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 8,
    border: '1px solid #111827',
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 2,
  },
  statHint: {
    fontSize: 10,
    color: '#9ca3af',
  },
  resourceRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  resourceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid #4b5563',
    fontSize: 11,
  },
  resourceValue: {
    fontWeight: 600,
  },
  resourceText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  pendingEmpty: {
    fontSize: 11,
    color: '#9ca3af',
    padding: '6px 8px',
    borderRadius: 10,
    backgroundColor: '#020617',
    border: '1px dashed #374151',
  },
  pendingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    maxHeight: 160,
    overflowY: 'auto',
  },
  pendingItem: {
    borderRadius: 10,
    backgroundColor: '#020617',
    border: '1px solid #111827',
    padding: 8,
  },
  pendingNote: {
    fontSize: 12,
    marginBottom: 4,
  },
  pendingMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#9ca3af',
  },
  footer: {
    marginTop: 8,
    textAlign: 'center',
  },
  mainButton: {
    padding: '8px 16px',
    borderRadius: 999,
    border: '1px solid #4b5563',
    backgroundColor: '#0f172a',
    color: '#e5e7eb',
    fontSize: 12,
    cursor: 'pointer',
  },
};

export default MoneySummaryView;
