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
  const hpPercent =
    user.maxBudget > 0
      ? Math.round((user.currentBudget / user.maxBudget) * 100)
      : 0;
  const mpPercent =
    user.maxMp > 0 ? Math.round((user.mp / user.maxMp) * 100) : 0;

  const { noSpendStreak, defenseActionsToday, junkObtainedToday } =
    user.counters;

  const luna = calculateLunaPhase(user.lunaCycle);

  // 간단 코멘트
  let hpComment = '';
  if (hpPercent >= 80) hpComment = '예산 상태가 아주 안정적입니다.';
  else if (hpPercent >= 50) hpComment = '무난하지만, 작은 누수를 줄이면 좋아요.';
  else if (hpPercent >= 30) hpComment = '경고 구간. 지출을 더 꼼꼼히 봐야 할 때!';
  else hpComment = '위험 구간… 무지출/방어 위주로 한 번 조정해 볼까요?';

  const streakComment =
    noSpendStreak === 0
      ? '오늘은 아직 무지출 스트릭이 없습니다.'
      : `${noSpendStreak}일째 무지출을 이어가고 있어요.`;

  const periodLabel = luna.isPeriod ? 'PMS/생리 기간' : '일반 기간';

  return (
    <div style={styles.wrapper}>
      {/* 상단 헤더 */}
      <header style={styles.header}>
        <div>
          <div style={styles.headerTitle}>이번 달 머니 로그 요약</div>
          <div style={styles.headerSub}>
            예산·무지출·방어 상태를 한눈에 보는 화면이에요.
          </div>
        </div>
        <button style={styles.backButton} onClick={onBackToGame}>
          ← 게임 화면
        </button>
      </header>

      {/* 카드 영역 */}
      <div style={styles.cardsGrid}>
        {/* 예산 HP 카드 */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>예산 HP</div>
          <div style={styles.bigNumber}>{hpPercent}%</div>
          <div style={styles.smallText}>
            남은 예산{' '}
            <b>{user.currentBudget.toLocaleString()}
            </b>{' '}
            G / 총{' '}
            <b>{user.maxBudget.toLocaleString()}
            </b>{' '}
            G
          </div>

          <div style={styles.progressBarOuter}>
            <div
              style={{
                ...styles.progressBarInner,
                width: `${Math.min(100, Math.max(0, hpPercent))}%`,
                background:
                  hpPercent < 30
                    ? '#f97373'
                    : hpPercent < 60
                    ? '#facc15'
                    : '#4ade80',
              }}
            />
          </div>
          <div style={styles.comment}>{hpComment}</div>
        </section>

        {/* MP / 방어 카드 */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>의지력(MP) & 방어</div>
          <div style={styles.row}>
            <div>
              <div style={styles.label}>현재 MP</div>
              <div style={styles.mediumNumber}>{mpPercent}%</div>
              <div style={styles.smallText}>
                {user.mp} / {user.maxMp}
              </div>
            </div>
            <div>
              <div style={styles.label}>오늘 방어 행동</div>
              <div style={styles.mediumNumber}>{defenseActionsToday}</div>
              <div style={styles.smallText}>
                방어를 많이 쓸수록
                <br />
                작은 지출을 막을 수 있어요.
              </div>
            </div>
          </div>
        </section>

        {/* 무지출/정화 카드 */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>무지출 & 정화</div>
          <div style={styles.mediumNumber}>{noSpendStreak}일</div>
          <div style={styles.smallText}>{streakComment}</div>

          <div style={{ marginTop: 12 }}>
            <div style={styles.label}>오늘 Junk 획득</div>
            <div style={styles.smallText}>
              오늘 발견된 전리품: <b>{junkObtainedToday}</b> 개
            </div>
            <div style={{ ...styles.smallText, marginTop: 4 }}>
              Junk를 모아 정화하면 <b>Pure Essence</b>로 바뀌고,
              <br />
              장비 제작 재료가 됩니다.
            </div>
          </div>
        </section>

        {/* 환경 카드 (Luna) */}
        <section style={styles.card}>
          <div style={styles.cardTitle}>환경 난이도 (Luna)</div>
          <div style={styles.mediumNumber}>
            {periodLabel === 'PMS/생리 기간' ? '🔴' : '🌙'} {periodLabel}
          </div>
          <div style={styles.smallText}>
            몸 상태에 따라 같은 지출도
            <br />
            체감 난이도가 달라질 수 있어요.
          </div>
          <div style={{ ...styles.smallText, marginTop: 8 }}>
            오늘은 스스로에게{' '}
            <b>{luna.isPeriod ? '더 관대하게' : '적당히 단호하게'}</b> 대하는
            날입니다.
          </div>
        </section>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: '16px',
    paddingBottom: '40px',
    minHeight: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
  },
  headerSub: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  backButton: {
    fontSize: 11,
    padding: '6px 10px',
    borderRadius: 999,
    border: '1px solid #4b5563',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 10,
  },
  card: {
    backgroundColor: '#020617',
    borderRadius: 12,
    border: '1px solid #1f2937',
    padding: 12,
    boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
  },
  cardTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    opacity: 0.7,
    marginBottom: 6,
  },
  bigNumber: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 4,
  },
  mediumNumber: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    opacity: 0.7,
    marginBottom: 2,
  },
  smallText: {
    fontSize: 11,
    opacity: 0.8,
  },
  comment: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 1.4,
  },
  progressBarOuter: {
    marginTop: 8,
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 999,
    transition: 'width 0.3s',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 4,
  },
};
