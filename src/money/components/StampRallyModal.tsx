// src/money/components/StampRallyModal.tsx

import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  stamps: Record<string, boolean>; // {'2023-10-01': true, ...}
}

export const StampRallyModal: React.FC<Props> = ({ open, onClose, stamps }) => {
  if (!open) return null;

  // 이번 달 달력 생성
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = `${year}년 ${month + 1}월`;

  const renderGrid = () => {
    const grid = [];
    for (let d = 1; d <= daysInMonth; d++) {
      // 날짜 키 생성 (YYYY-MM-DD)
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasStamp = stamps[dateKey];

      grid.push(
        <div key={d} style={styles.dayCell}>
          <div style={styles.dayNum}>{d}</div>
          {hasStamp && <div style={styles.stampMark}>💮</div>}
        </div>
      );
    }
    return grid;
  };

  const stampCount = Object.keys(stamps).filter(k => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>📅 무지출 챌린지</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        
        <div style={styles.monthLabel}>{monthName}</div>
        
        <div style={styles.grid}>
          {renderGrid()}
        </div>

        <div style={styles.footer}>
          이번 달 성공 횟수: <span style={{color: '#fbbf24', fontWeight: 'bold'}}>{stampCount}일</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { width: '90%', maxWidth: '350px', backgroundColor: '#1e293b', borderRadius: '16px', padding: '20px', border: '2px solid #fbbf24', boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  title: { margin: 0, fontSize: '18px', color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  monthLabel: { textAlign: 'center', color: '#94a3b8', marginBottom: '15px', fontWeight: 'bold' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
  dayCell: { aspectRatio: '1', backgroundColor: '#0f172a', borderRadius: '8px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: '10px', color: '#475569', position: 'absolute', top: '2px', left: '4px' },
  stampMark: { fontSize: '24px', animation: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' },

  footer: { marginTop: '20px', textAlign: 'center', color: '#cbd5e1', fontSize: '14px' }
};
