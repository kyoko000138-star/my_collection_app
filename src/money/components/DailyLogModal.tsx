// src/money/components/DailyLogModal.tsx
import React from 'react';
import { PendingTransaction } from '../types';

interface DailyLogModalProps {
  open: boolean;
  onClose: () => void;

  today: string;
  hp: number;
  mp: number;
  def: number;

  junkToday: number;
  defenseActionsToday: number;
  noSpendStreak: number;

  pending: PendingTransaction[];
}

const DailyLogModal: React.FC<DailyLogModalProps> = ({
  open,
  onClose,
  today,
  hp,
  mp,
  def,
  junkToday,
  defenseActionsToday,
  noSpendStreak,
  pending,
}) => {
  if (!open) return null;

  const getGradeInfo = () => {
    if (noSpendStreak > 0 && junkToday === 0) {
      return {
        grade: 'S',
        label: '완전 방어',
        desc: '무지출 스트릭을 이어갔습니다. 피격 없이 하루를 버텼습니다.',
      };
    }
    if (defenseActionsToday > 0 && junkToday === 0) {
      return {
        grade: 'A',
        label: '방어 중심',
        desc: '지출 없이 방어 행동으로만 하루를 보냈습니다.',
      };
    }
    if (defenseActionsToday > 0 && junkToday > 0) {
      return {
        grade: 'B',
        label: '혼합',
        desc: '피격도 있었지만, 일부는 방어에 성공했습니다.',
      };
    }
    if (defenseActionsToday === 0 && junkToday > 0) {
      return {
        grade: 'C',
        label: '피격 중심',
        desc: '방어 행동 없이 피격만 있었습니다. 상태만 기록합니다.',
      };
    }
    return {
      grade: '-',
      label: '기록 없음',
      desc: '오늘은 아직 기록된 피격/방어가 없습니다.',
    };
  };

  const gradeInfo = getGradeInfo();

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCardLarge}>
        <h2 style={styles.modalTitle}>오늘의 로그</h2>
        <p style={styles.modalDate}>{today}</p>

        {/* 등급 요약 */}
        <section style={styles.gradeSection}>
          <div style={styles.gradeMainRow}>
            <span style={styles.gradeBadge}>{gradeInfo.grade}</span>
            <span style={styles.gradeLabel}>{gradeInfo.label}</span>
          </div>
          <p style={styles.gradeDesc}>{gradeInfo.desc}</p>
        </section>

        {/* 스탯 요약 */}
        <section style={styles.statsSection}>
          <div style={styles.statsHeader}>오늘의 상태 요약</div>
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>HP</div>
              <div style={styles.statValue}>{hp}%</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>MP</div>
              <div style={styles.statValue}>{mp}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>DEF</div>
              <div style={styles.statValue}>{def}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>오늘 Junk 획득</div>
              <div style={styles.statValue}>{junkToday}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>방어 행동</div>
              <div style={styles.statValue}>{defenseActionsToday}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>무지출 스트릭</div>
              <div style={styles.statValue}>{noSpendStreak}</div>
            </div>
          </div>
        </section>

        {/* Pending 리스트 */}
        <section style={styles.pendingSection}>
          <div style={styles.pendingHeader}>나중에 입력할 기록</div>
          {pending.length === 0 ? (
            <div style={styles.pendingEmpty}>
              현재 대기 중인 항목이 없습니다.
              <br />
              지출을 메모만 해 두고 싶을 때
              <br />
              &quot;나중에 입력&quot; 기능이 여기에 쌓일 예정입니다.
            </div>
          ) : (
            <div style={styles.pendingList}>
              {pending.map((p) => (
                <div key={p.id} style={styles.pendingItem}>
                  <div style={styles.pendingNote}>{p.note}</div>
                  <div style={styles.pendingMeta}>
                    <span>{p.amount ? `${p.amount.toLocaleString()}원` : '금액 미입력'}</span>
                    <span>{p.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={styles.modalFooterRow}>
          <button type="button" onClick={onClose} style={styles.btnSecondary}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
  },
  modalCardLarge: {
    width: '100%',
    maxWidth: '380px',
    maxHeight: '80vh',
    backgroundColor: '#020617',
    borderRadius: '16px',
    padding: '16px 16px 12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    border: '1px solid #1f2937',
    color: '#e5e7eb',
    display: 'flex',
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: '18px',
    marginBottom: '4px',
  },
  modalDate: {
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '8px',
  },
  gradeSection: {
    marginBottom: '12px',
    padding: '10px 12px',
    borderRadius: '12px',
    backgroundColor: '#020617',
    border: '1px solid #374151',
  },
  gradeMainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gradeBadge: {
    fontSize: '18px',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid #4b5563',
  },
  gradeLabel: {
    fontSize: '13px',
    fontWeight: 600,
  },
  gradeDesc: {
    fontSize: '11px',
    color: '#9ca3af',
    margin: 0,
  },
  statsSection: {
    marginBottom: '12px',
  },
  statsHeader: {
    fontSize: '12px',
    marginBottom: '6px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 6,
  },
  statBox: {
    backgroundColor: '#020617',
    borderRadius: '10px',
    border: '1px solid #111827',
    padding: '8px',
  },
  statLabel: {
    fontSize: '10px',
    color: '#9ca3af',
    marginBottom: 2,
  },
  statValue: {
    fontSize: '13px',
    fontWeight: 600,
  },
  pendingSection: {
    marginBottom: '8px',
  },
  pendingHeader: {
    fontSize: '12px',
    marginBottom: '4px',
  },
  pendingEmpty: {
    fontSize: '11px',
    color: '#6b7280',
    padding: '10px',
    borderRadius: '10px',
    border: '1px dashed #374151',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  pendingList: {
    maxHeight: '120px',
    overflowY: 'auto',
  },
  pendingItem: {
    padding: '8px 0',
    borderBottom: '1px solid #111827',
  },
  pendingNote: {
    fontSize: '12px',
    marginBottom: 2,
  },
  pendingMeta: {
    fontSize: '10px',
    color: '#9ca3af',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalFooterRow: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-end',
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
};

export default DailyLogModal;
