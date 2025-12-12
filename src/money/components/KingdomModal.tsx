// src/money/components/KingdomModal.tsx

import React from 'react';
import { AssetBuildingView } from '../types';

interface KingdomModalProps {
  open: boolean;
  onClose: () => void;
  buildings: AssetBuildingView[];
  onManageSubs: () => void;
}

export const KingdomModal: React.FC<KingdomModalProps> = ({
  open,
  onClose,
  buildings,
  onManageSubs,
}) => {
  if (!open) return null;

  // 정원 테마 아이콘 매핑
  const getIcon = (id: string) => {
    switch (id) {
      case 'fence': return '🚧';      // 방어 -> 울타리
      case 'greenhouse': return '🏕️'; // 무지출 -> 온실/텐트
      case 'mansion': return '🏠';    // 고정비 -> 저택
      case 'fountain': return '⛲';   // 정화 -> 분수
      case 'barn': return '🛖';       // 파밍 -> 헛간
      default: return '🌳';
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2 style={styles.title}>🌷 자산의 정원</h2>
        <p style={styles.desc}>
          금액이 아닌 <b>"행동의 횟수"</b>가 정원을 가꿉니다.
        </p>

        <div style={styles.list}>
          {buildings.length === 0 ? (
            <div style={{textAlign:'center', padding: 20, color:'#9ca3af'}}>
              데이터 로딩 중...
            </div>
          ) : (
            buildings.map((b) => {
              // 진행률 계산
              const progress = b.nextTarget 
                ? Math.min(100, (b.count / b.nextTarget) * 100) 
                : 100;

              return (
                <div key={b.id} style={styles.row}>
                  <div style={styles.iconBox}>{getIcon(b.id)}</div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={styles.rowHeader}>
                      <span style={styles.label}>{b.label}</span>
                      <span style={styles.lvBadge}>Lv.{b.level}</span>
                    </div>
                    
                    <div style={styles.barBg}>
                      <div style={{ ...styles.barFill, width: `${progress}%` }} />
                    </div>
                    
                    <div style={styles.countText}>
                      {b.count} / {b.nextTarget || 'MAX'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button onClick={onManageSubs} style={styles.subBtn}>
          📜 고정비(구독) 계약 관리
        </button>

        <button onClick={onClose} style={styles.closeBtn}>
          닫기
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 2000,
  },
  card: {
    width: '90%', maxWidth: '360px', maxHeight: '80vh',
    backgroundColor: '#1f2937', // Dark Slate
    borderRadius: '16px', padding: '20px',
    border: '2px solid #4b5563',
    color: '#fff',
    display: 'flex', flexDirection: 'column',
  },
  title: { textAlign: 'center', margin: '0 0 4px 0', fontSize: '20px', color: '#fbcfe8' }, // 핑크빛 타이틀
  desc: { textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginBottom: '20px' },
  
  list: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' },
  
  row: {
    display: 'flex', gap: '12px', alignItems: 'center',
    backgroundColor: '#111827', padding: '12px', borderRadius: '12px',
    border: '1px solid #374151'
  },
  iconBox: { fontSize: '24px' },
  
  rowHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  label: { fontSize: '14px', fontWeight: 'bold' },
  lvBadge: { fontSize: '11px', color: '#fbbf24', border: '1px solid #78350f', padding: '1px 5px', borderRadius: '4px' },
  
  barBg: { width: '100%', height: '6px', backgroundColor: '#374151', borderRadius: '3px' },
  barFill: { height: '100%', backgroundColor: '#34d399', borderRadius: '3px', transition: 'width 0.3s' },
  
  countText: { fontSize: '10px', textAlign: 'right', marginTop: '4px', color: '#9ca3af' },
  
  subBtn: {
    marginTop: '20px', width: '100%', padding: '12px',
    backgroundColor: '#4f46e5', color: '#fff', border: 'none',
    borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
  },
  closeBtn: {
    marginTop: '10px', width: '100%', padding: '10px',
    backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #4b5563',
    borderRadius: '10px', cursor: 'pointer'
  }
};
