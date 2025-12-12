// src/money/components/KingdomModal.tsx

import React from 'react';
import { AssetBuildingView } from '../types';

interface KingdomModalProps {
  open: boolean;
  onClose: () => void;
  buildings: AssetBuildingView[];
  onManageSubs: () => void; // 중복이면 제거 가능하나 일단 유지
}

export const KingdomModal: React.FC<KingdomModalProps> = ({
  open,
  onClose,
  buildings,
}) => {
  if (!open) return null;

  // 정원 테마 아이콘
  const getIcon = (id: string) => {
    switch(id) {
      case 'fence': return '🌳';      // 방어 -> 나무/요새
      case 'greenhouse': return '⛺'; // 무지출 -> 텐트/온실
      case 'mansion': return '🏠';    // 고정비 -> 집
      case 'fountain': return '⛲';   // 정화 -> 분수/마법탑
      case 'barn': return '🛖';       // 파밍 -> 헛간/창고
      default: return '🌱';
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
            <div style={styles.empty}>데이터 로딩 중...</div>
          ) : (
            buildings.map((b) => {
              const progress = b.nextTarget 
                ? Math.min(100, (b.count / b.nextTarget) * 100) 
                : 100;

              return (
                <div key={b.id} style={styles.row}>
                  {/* 왼쪽 아이콘 박스 */}
                  <div style={styles.iconBox}>
                    <span style={{fontSize: '24px'}}>{getIcon(b.id)}</span>
                  </div>
                  
                  {/* 오른쪽 정보 */}
                  <div style={{flex: 1}}>
                    <div style={styles.rowHeader}>
                      <span style={styles.label}>{b.label}</span>
                      <span style={styles.lvBadge}>Lv.{b.level}</span>
                    </div>
                    
                    {/* 진행도 바 (다크 테마 스타일) */}
                    <div style={styles.barBg}>
                      <div style={{...styles.barFill, width: `${progress}%`}} />
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

        {/* 닫기 버튼만 깔끔하게 */}
        <button onClick={onClose} style={styles.closeBtn}>닫기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
  },
  card: {
    width: '90%', maxWidth: '360px',
    backgroundColor: '#1e293b', // 1번 이미지의 어두운 청록/남색 배경
    borderRadius: '16px', padding: '24px',
    border: '1px solid #334155', color: '#fff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column'
  },
  title: { textAlign: 'center', margin: '0 0 8px 0', fontSize: '18px', color: '#fbcfe8' },
  desc: { textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginBottom: '24px' },
  list: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  empty: { textAlign: 'center', color: '#64748b', padding: '20px' },
  
  row: {
    display: 'flex', gap: '16px', alignItems: 'center',
    backgroundColor: '#0f172a', // 더 어두운 박스 배경
    padding: '12px', borderRadius: '12px',
    border: '1px solid #1e293b'
  },
  iconBox: {
    width: '40px', height: '40px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1e293b', borderRadius: '8px'
  },
  rowHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#f8fafc' },
  lvBadge: { 
    fontSize: '10px', color: '#fbbf24', 
    border: '1px solid #78350f', padding: '1px 6px', borderRadius: '4px',
    backgroundColor: 'rgba(251, 191, 36, 0.1)'
  },
  
  barBg: { width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '3px' },
  barFill: { height: '100%', backgroundColor: '#34d399', borderRadius: '3px' },
  countText: { fontSize: '10px', textAlign: 'right', marginTop: '4px', color: '#64748b' },
  
  closeBtn: {
    marginTop: '24px', width: '100%', padding: '14px',
    backgroundColor: '#334155', color: '#fff', border: 'none',
    borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold',
    transition: 'background 0.2s'
  }
};
