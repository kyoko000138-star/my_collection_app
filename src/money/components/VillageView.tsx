// src/money/components/VillageView.tsx

import React from 'react';
import { UserState } from '../types';

interface VillageViewProps {
  gameState: UserState;
  onMoveToWorld: () => void;
  onOpenMenu: (menu: string) => void;
  onRest: () => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ 
  gameState, onMoveToWorld, onOpenMenu, onRest 
}) => {
  return (
    <div style={styles.container}>
      {/* 상단 정보창 (프메 스타일) */}
      <div style={styles.statusBar}>
        <div style={styles.statusRow}>📅 2025년 12월 11일 (맑음)</div>
        <div style={styles.statusRow}>
          <span>💖 HP {gameState.budget.current.toLocaleString()}</span>
          <span>💧 MP {gameState.runtime.mp}</span>
        </div>
      </div>

      {/* 메인 화면 (방 안) */}
      <div style={styles.roomScene}>
        <div style={styles.window}>🪟</div>
        <div style={styles.character}>🧢</div>
        <div style={styles.desk} onClick={() => onOpenMenu('inventory')}>🎒</div>
      </div>

      {/* 하단 명령 버튼 (스케줄) */}
      <div style={styles.menuGrid}>
        <button onClick={onMoveToWorld} style={styles.btnBig}>
          ⚔️ 던전 탐험 (지출하러 가기)
        </button>
        
        <div style={styles.subGrid}>
          <button onClick={() => onOpenMenu('craft')} style={styles.btnSmall}>🔨 제작</button>
          <button onClick={() => onOpenMenu('collection')} style={styles.btnSmall}>📖 도감</button>
          <button onClick={() => onOpenMenu('kingdom')} style={styles.btnSmall}>🏰 왕국</button>
          <button onClick={onRest} style={styles.btnRest}>🌙 휴식 (마감)</button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#3e2723', padding: '10px' },
  
  statusBar: { backgroundColor: '#f5f5dc', border: '3px solid #5d4037', borderRadius: '4px', padding: '8px', marginBottom: '10px', fontFamily: '"NeoDungGeunMo", serif', color: '#3e2723' },
  statusRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' },

  roomScene: { flex: 1, backgroundColor: '#8d6e63', border: '4px solid #4e342e', borderRadius: '8px', position: 'relative', marginBottom: '10px', backgroundImage: 'radial-gradient(#a1887f 20%, transparent 20%)', backgroundSize: '10px 10px' },
  window: { position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '40px' },
  character: { position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', fontSize: '60px', animation: 'float 3s infinite' },
  desk: { position: 'absolute', bottom: '20px', right: '30px', fontSize: '30px', cursor: 'pointer' },

  menuGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  btnBig: { padding: '15px', backgroundColor: '#b91c1c', color: '#fff', border: '3px solid #7f1d1d', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0 #7f1d1d' },
  subGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px' },
  btnSmall: { padding: '10px 0', backgroundColor: '#d4b996', color: '#3e2723', border: '2px solid #8d6e63', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 3px 0 #8d6e63' },
  btnRest: { padding: '10px 0', backgroundColor: '#1e3a8a', color: '#fbbf24', border: '2px solid #172554', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 3px 0 #172554' },
};
