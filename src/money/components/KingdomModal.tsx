// src/money/components/KingdomModal.tsx

import React from 'react';
import { AssetBuildingView } from '../types';

interface KingdomModalProps {
  open: boolean;
  onClose: () => void;
  buildings: AssetBuildingView[];
  // [NEW] 고정비 관리 핸들러
  onManageSubs: () => void;
}

export const KingdomModal: React.FC<KingdomModalProps> = ({
  open,
  onClose,
  buildings,
  onManageSubs,
}) => {
  if (!open) return null;

  // 건물 ID와 레벨에 따른 아이콘/이모지 매핑
  const getIcon = (id: string, level: number) => {
    if (id === 'fortress') return level < 3 ? '⛺' : '🏰';    // 요새
    if (id === 'airfield') return level < 3 ? '🪁' : '🚀';    // 비행장
    if (id === 'mansion')  return level < 3 ? '🏠' : '🏯';    // 저택
    if (id === 'tower')    return level < 3 ? '🔮' : '🌌';    // 마법탑
    if (id === 'warehouse') return level < 3 ? '📦' : '💎';   // 창고
    return '🏗️';
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCardLarge}>
        <h2 style={styles.modalTitle}>🏰 자산의 왕국</h2>
        <p style={styles.modalSubtitle}>
          금액이 아닌 <b>"행동의 횟수"</b>가 이 세계를 구축합니다.
        </p>

        <div style={styles.modalScrollArea}>
          {buildings.length === 0 ? (
            <div style={styles.emptyBox}>
              데이터를 불러오는 중입니다...
            </div>
          ) : (
            buildings.map((b) => {
              // 진행률 계산 (만렙이면 100%)
              const progressPercent = b.nextTarget 
                ? Math.min(100, (b.count / b.nextTarget) * 100)
                : 100;

              return (
                <div key={b.id} style={styles.buildingCard}>
                  {/* 아이콘 영역 */}
                  <div style={styles.iconArea}>
                    <span style={{ fontSize: '28px' }}>{getIcon(b.id, b.level)}</span>
                  </div>

                  {/* 정보 영역 */}
                  <div style={styles.infoArea}>
                    <div style={styles.buildingHeader}>
                      <span style={styles.buildingName}>{b.label}</span>
                      <span style={styles.levelBadge}>Lv.{b.level}</span>
                    </div>

                    <div style={styles.progressRow}>
                      <span style={styles.progressText}>
                        {b.nextTarget 
                          ? `${b.count} / ${b.nextTarget} exp` 
                          : 'MAX LEVEL'}
                      </span>
                    </div>

                    <div style={styles.progressBarBg}>
                      <div
                        style={{
                          ...styles.progressBarFill,
                          width: `${progressPercent}%`,
                          backgroundColor: b.nextTarget ? '#8b5cf6' : '#fbbf24' // 만렙이면 금색
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* [NEW] 고정비 관리 버튼 */}
        <button 
          onClick={onManageSubs} 
          style={{
            ...styles.btnSecondary, 
            marginTop: '10px', 
            backgroundColor: '#4c1d95', 
            color: '#ddd6fe',
            border: '1px solid #6d28d9'
          }}
        >
          📜 고정비(구독) 계약 관리
        </button>

        <div style={styles.footerNote}>
          ※ 각 건물은 특정 행동(방어, 무지출, 정화 등)을 할 때마다 성장합니다.
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
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  },
  modalCardLarge: {
    width: '90%', maxWidth: '380px', maxHeight: '80vh',
    backgroundColor: '#111827', // Dark Gray
    borderRadius: '16px', padding: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    border: '1px solid #374151',
    color: '#e5e7eb',
    display: 'flex', flexDirection: 'column',
  },
  modalTitle: { fontSize: '20px', margin: '0 0 4px 0', textAlign: 'center', color: '#c084fc' },
  modalSubtitle: { fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginBottom: '20px' },
  modalScrollArea: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  emptyBox: { textAlign: 'center', color: '#6b7280', padding: '20px' },
  
  buildingCard: {
    display: 'flex', alignItems: 'center',
    padding: '12px', borderRadius: '12px',
    backgroundColor: '#1f2937', border: '1px solid #374151',
  },
  iconArea: {
    width: '50px', height: '50px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '10px',
    marginRight: '15px',
  },
  infoArea: { flex: 1 },
  buildingHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' },
  buildingName: { fontSize: '14px', fontWeight: 'bold', color: '#f3f4f6' },
  levelBadge: { fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fbbf24' },
  
  progressRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' },
  progressText: { fontSize: '11px', color: '#9ca3af' },
  
  progressBarBg: { width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#374151', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
  
  footerNote: { fontSize: '11px', color: '#6b7280', marginTop: '15px', textAlign: 'center' },
  modalFooterRow: { marginTop: '15px', display: 'flex', justifyContent: 'center' },
  btnSecondary: {
    width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
    backgroundColor: '#374151', color: '#e5e7eb', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' 
  },
};
