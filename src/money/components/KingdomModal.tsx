// src/money/components/KingdomModal.tsx
import React from 'react';

export interface KingdomBuilding {
  id: string;
  name: string;           // 예: '요새'
  type: string;           // 예: 'FORTRESS'
  level: number;          // 1 ~ 4
  streak: number;         // 누적 횟수 (예: 무지출 스트릭)
}

interface KingdomModalProps {
  open: boolean;
  onClose: () => void;
  buildings: KingdomBuilding[];
}

const KingdomModal: React.FC<KingdomModalProps> = ({
  open,
  onClose,
  buildings,
}) => {
  if (!open) return null;

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Lv.1 새로 지어진 기지';
      case 2:
        return 'Lv.2 안정된 거점';
      case 3:
        return 'Lv.3 번영하는 거점';
      case 4:
        return 'Lv.4 전설의 랜드마크';
      default:
        return `Lv.${level}`;
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCardLarge}>
        <h2 style={styles.modalTitle}>자산의 왕국</h2>
        <p style={styles.modalSubtitle}>
          금액보다 &quot;횟수&quot;가 이 세계의 건물을 키웁니다.
        </p>

        <div style={styles.modalScrollArea}>
          {buildings.length === 0 ? (
            <div style={styles.emptyBox}>
              아직 세워진 건물이 없습니다.
              <br />
              무지출 스트릭, 저축/투자 기록 등으로
              <br />
              하나씩 기지를 세워보세요.
            </div>
          ) : (
            buildings.map((b) => (
              <div key={b.id} style={styles.buildingCard}>
                <div style={styles.buildingHeader}>
                  <span style={styles.buildingName}>{b.name}</span>
                  <span style={styles.buildingType}>{b.type}</span>
                </div>

                <div style={styles.levelRow}>
                  <span style={styles.levelLabel}>{getLevelLabel(b.level)}</span>
                  <span style={styles.levelBadge}>Lv.{b.level}</span>
                </div>

                <div style={styles.streakRow}>
                  <span style={styles.streakLabel}>누적 횟수</span>
                  <span style={styles.streakValue}>{b.streak} 회</span>
                </div>

                <div style={styles.progressBarBg}>
                  <div
                    style={{
                      ...styles.progressBarFill,
                      width: `${Math.min(100, (b.streak / 100) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.footerNote}>
          ※ 향후: 부채 0 유지 & 신용 점수 상승에 따라
          <br />
          VIP 맵과 숨겨진 건물이 해금될 예정입니다.
        </div>

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
    zIndex: 50,
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
  modalSubtitle: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  modalScrollArea: {
    flex: 1,
    overflowY: 'auto',
    marginTop: '12px',
  },
  emptyBox: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    padding: '24px 8px',
    borderRadius: '12px',
    border: '1px dashed #374151',
  },
  buildingCard: {
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#020617',
    border: '1px solid #374151',
    marginBottom: '10px',
  },
  buildingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  buildingName: {
    fontSize: '14px',
    fontWeight: 600,
  },
  buildingType: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  levelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
    marginBottom: '4px',
  },
  levelLabel: {
    fontSize: '12px',
    color: '#e5e7eb',
  },
  levelBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid #4b5563',
  },
  streakRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#e5e7eb',
    marginBottom: '6px',
  },
  streakLabel: {
    color: '#9ca3af',
  },
  streakValue: {
    fontWeight: 600,
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    borderRadius: '999px',
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    transition: 'width 0.3s ease',
  },
  footerNote: {
    fontSize: '10px',
    color: '#6b7280',
    marginTop: '8px',
    lineHeight: 1.4,
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

export default KingdomModal;
