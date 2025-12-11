import React from 'react';
import { UserState } from '../types';
import { GAME_CONSTANTS } from '../constants';

interface VillageViewProps {
  gameState: UserState;
  hp: number;
  todayStr: string;
  theme: { color: string; label: string };
  onMoveToWorld: () => void;
  onOpenMenu: (menu: string) => void;
  onRest: () => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ 
  gameState, hp, todayStr, theme, onMoveToWorld, onOpenMenu, onRest 
}) => {
  return (
    <div style={styles.container}>
      {/* 📜 상단 정보창 (상태바) */}
      <div style={styles.statusBar}>
        <div style={styles.statusRow}>
          <span>📅 {todayStr}</span>
          <span style={{color: theme.color}}>{theme.label}</span>
        </div>
        <div style={styles.statusRow}>
          <span>💖 HP {hp}%</span>
          <span>💧 MP {gameState.runtime.mp}/{GAME_CONSTANTS.MAX_MP}</span>
        </div>
      </div>

      {/* 🏠 메인 화면 (내 방) */}
      <div style={styles.roomScene}>
        <div style={styles.window}>🪟</div>
        <div style={styles.character}>
          {/* 직업별 이모지 혹은 이미지 */}
          {gameState.profile.classType === 'GUARDIAN' ? '🛡️' : '🧢'}
        </div>
        <div style={styles.desk} onClick={() => onOpenMenu('inventory')}>
          🎒 <span style={styles.bubble}>Check!</span>
        </div>
        <div style={styles.messageBox}>
          "오늘도 무사히 하루를 넘겨보자."
        </div>
      </div>

      {/* 🕹️ 하단 명령 버튼 (스케줄러 스타일) */}
      <div style={styles.menuGrid}>
        <button onClick={onMoveToWorld} style={styles.btnAdventure}>
          ⚔️ 던전 탐험 (지출하러 가기)
        </button>
        
        <div style={styles.subGrid}>
          <button onClick={() => onOpenMenu('inventory')} style={styles.btnMenu}>🎒 가방</button>
          <button onClick={() => onOpenMenu('craft')} style={styles.btnMenu}>🔨 제작</button>
          <button onClick={() => onOpenMenu('collection')} style={styles.btnMenu}>📖 도감</button>
          <button onClick={() => onOpenMenu('kingdom')} style={styles.btnMenu}>🏰 왕국</button>
        </div>

        <button onClick={onRest} style={styles.btnRest}>
          🌙 하루 마감 (휴식)
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', padding: '10px', backgroundColor: '#3e2723' },
  
  statusBar: { 
    backgroundColor: '#f5f5dc', border: '3px solid #5d4037', borderRadius: '4px', 
    padding: '8px 12px', marginBottom: '10px', 
    fontFamily: '"NeoDungGeunMo", monospace', color: '#3e2723',
    boxShadow: '0 4px 0 rgba(0,0,0,0.3)'
  },
  statusRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' },

  roomScene: { 
    flex: 1, backgroundColor: '#8d6e63', border: '4px solid #4e342e', borderRadius: '8px', 
    position: 'relative', marginBottom: '10px', 
    backgroundImage: 'radial-gradient(#a1887f 20%, transparent 20%)', backgroundSize: '10px 10px' 
  },
  window: { position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '40px' },
  character: { 
    position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)', 
    fontSize: '60px', animation: 'bounce 2s infinite' 
  },
  desk: { position: 'absolute', bottom: '20px', right: '30px', fontSize: '30px', cursor: 'pointer' },
  bubble: { position: 'absolute', top: '-15px', right: '-10px', fontSize: '10px', backgroundColor: '#fff', padding: '2px 4px', borderRadius: '4px', border: '1px solid #000' },
  messageBox: {
    position: 'absolute', bottom: '10px', left: '10px', right: '10px',
    backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px', borderRadius: '4px',
    fontSize: '12px', textAlign: 'center'
  },

  menuGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  btnAdventure: { 
    padding: '15px', backgroundColor: '#b91c1c', color: '#fef2f2', 
    border: '3px solid #7f1d1d', borderRadius: '8px', 
    fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', 
    boxShadow: '0 4px 0 #7f1d1d', textShadow: '1px 1px 0 #000'
  },
  subGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px' },
  btnMenu: { 
    padding: '10px 0', backgroundColor: '#d4b996', color: '#3e2723', 
    border: '2px solid #8d6e63', borderRadius: '6px', 
    fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 3px 0 #8d6e63' 
  },
  btnRest: { 
    padding: '12px', backgroundColor: '#1e3a8a', color: '#fbbf24', 
    border: '3px solid #172554', borderRadius: '8px', 
    fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0 #172554' 
  },
};
