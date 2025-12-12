// src/money/components/WorldMapView.tsx

import React from 'react';

interface Props {
  onSelectDungeon: (id: string) => void;
  onBack: () => void;
}

const DUNGEONS = [
  { id: 'food', name: '배달의 숲', icon: '🌲', x: 20, y: 30, color: '#22c55e' },
  { id: 'transport', name: '택시 사막', icon: '🏜️', x: 70, y: 20, color: '#eab308' },
  { id: 'shopping', name: '지름 시장', icon: '🎪', x: 25, y: 65, color: '#ec4899' },
  { id: 'etc', name: '기타 던전', icon: '🕳️', x: 75, y: 70, color: '#6366f1' },
];

export const WorldMapView: React.FC<Props> = ({ onSelectDungeon, onBack }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗺️ 월드맵</h2>
      
      <div style={styles.mapFrame}>
        {/* 길 (SVG Path) */}
        <svg style={styles.paths}>
          <path d="M50 50 L20 30" stroke="#a8a29e" strokeWidth="4" strokeDasharray="5,5" />
          <path d="M50 50 L70 20" stroke="#a8a29e" strokeWidth="4" strokeDasharray="5,5" />
          <path d="M50 50 L25 65" stroke="#a8a29e" strokeWidth="4" strokeDasharray="5,5" />
          <path d="M50 50 L75 70" stroke="#a8a29e" strokeWidth="4" strokeDasharray="5,5" />
          <circle cx="50%" cy="50%" r="5" fill="#fff" /> {/* 마을 중심 */}
        </svg>

        {/* 던전 노드 */}
        {DUNGEONS.map(d => (
          <div 
            key={d.id}
            onClick={() => onSelectDungeon(d.id)}
            style={{ ...styles.node, left: `${d.x}%`, top: `${d.y}%`, borderColor: d.color }}
          >
            <span style={{fontSize:'24px'}}>{d.icon}</span>
            <span style={styles.label}>{d.name}</span>
          </div>
        ))}

        {/* 플레이어 (중앙 마을) */}
        <div style={styles.player}>🧙‍♂️</div>
      </div>

      <button onClick={onBack} style={styles.backBtn}>↩️ 마을로 돌아가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', height: '100%', backgroundColor: '#292524',
    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px'
  },
  title: { color: '#fff', fontSize: '16px', marginBottom: '10px' },
  mapFrame: {
    flex: 1, width: '100%', position: 'relative',
    backgroundColor: '#44403c', borderRadius: '12px', border: '4px solid #78716c',
    overflow: 'hidden'
  },
  paths: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  
  node: {
    position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
    backgroundColor: '#1c1917', border: '3px solid',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transform: 'translate(-50%, -50%)',
    boxShadow: '0 4px 0 rgba(0,0,0,0.5)', transition: 'transform 0.1s'
  },
  label: {
    fontSize: '10px', color: '#fff', marginTop: '2px', whiteSpace: 'nowrap',
    textShadow: '1px 1px 0 #000', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0 4px', borderRadius: 4
  },
  player: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    fontSize: '30px', zIndex: 10
  },
  backBtn: {
    marginTop: '10px', padding: '10px 20px', backgroundColor: '#57534e',
    color: '#fff', border: '2px solid #a8a29e', borderRadius: '8px', cursor: 'pointer'
  }
};
