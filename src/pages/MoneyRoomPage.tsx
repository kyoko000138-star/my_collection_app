// src/money/components/InventoryModal.tsx
import React from 'react';
import { GAME_CONSTANTS } from '../constants';

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;

  junk: number;
  salt: number;
  dust: number;
  pureEssence: number;
  equipment: string[];

  canPurify: boolean;
  canCraft: boolean;

  onPurify: () => void;
  onCraft: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({
  open,
  onClose,
  junk,
  salt,
  dust,
  pureEssence,
  equipment,
  canPurify,
  canCraft,
  onPurify,
  onCraft,
}) => {
  if (!open) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCardLarge}>
        <h2 style={styles.modalTitle}>인벤토리 · 정화</h2>

        <div style={styles.modalScrollArea}>
          {/* 정화 루프 */}
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
              onClick={onPurify}
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

          {/* 장비 & 인벤토리 */}
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
                <div style={styles.eqEmpty}>
                  아직 제작된 장비가 없습니다.
                </div>
              ) : (
                equipment.map((name, idx) => (
                  <div key={`${name}-${idx}`} style={styles.eqItem}>
                    <span style={styles.eqItemName}>{name}</span>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={onCraft}
              disabled={!canCraft}
              style={{
                ...styles.btnCraft,
                opacity: canCraft ? 1 : 0.5,
                cursor: canCraft ? 'pointer' : 'not-allowed',
              }}
            >
              ⚒ 장비 제작 (잔잔한 장부검)
            </button>
          </section>
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
    marginBottom: '8px',
  },
  modalScrollArea: {
    flex: 1,
    overflowY: 'auto',
    marginTop: '8px',
  },
  modalFooterRow: {
    marginTop: '12px',
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

  // 정화 섹션
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

  // 장비 섹션
  eqSection: {
    marginBottom: '8px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#020617',
    border: '1px solid '#374151',
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
};

export default InventoryModal;
