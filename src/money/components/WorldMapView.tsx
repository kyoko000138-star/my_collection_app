import React from 'react';
import { DUNGEONS } from '../constants';

interface WorldMapViewProps {
  onSelectDungeon: (id: string) => void;
  onBack: () => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({ onSelectDungeon, onBack }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗺️ 월드맵</h2>
      <p style={styles.desc}>어디서 지출이 발생했나요?</p>

      <div style={styles.mapArea}>
        {/* 배경 장식 (길) */}
        <svg style={styles.pathSvg}>
          <path d="M70 70 Q 150 150 230 230" stroke="#57534e" strokeWidth="6" fill="none" strokeDasharray="10,5" />
          <path d="M230 70 Q 150 150 70 230" stroke="#57534e" strokeWidth="6" fill="none" strokeDasharray="10,5" />
        </svg>

        {/* 던전 노드들 */}
        {Object.entries(DUNGEONS).map(([key, data], idx) => {
          // 지그재그 배치 로직
          const top = 15 + Math.floor(idx / 2) * 35;
          const left = idx % 2 === 0 ? 20 : 60;
          
          return (
            <button 
              key={key}
              onClick={() => onSelectDungeon(key)}
              style={{...styles.node, top: `${top}%`, left: `${left}%`, borderColor: data.color}}
            >
              <span style={{fontSize:'28px'}}>{data.icon}</span>
              <span style={styles.nodeLabel}>{data.name}</span>
            </button>
          );
        })}
      </div>

      <button onClick={onBack} style={styles.btnBack}>↩️ 마을로 귀환</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1c1917', padding: '10px' },
  title: { textAlign: 'center', color: '#e7e5e4', marginTop: '10px', fontSize: '20px', fontFamily: '"NeoDungGeunMo", monospace' },
  desc: { textAlign: 'center', color: '#a8a29e', fontSize: '12px', marginBottom: '20px' },
  
  mapArea: { 
    flex: 1, position: 'relative', backgroundColor: '#292524', 
    borderRadius: '12px', border: '4px solid #44403c', overflow: 'hidden',
    backgroundImage: 'linear-gradient(#292524 2px, transparent 2px), linear-gradient(90deg, #292524 2px, transparent 2px)',
    backgroundSize: '20px 20px',
    backgroundColor: '#302b27'
  },
  pathSvg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' },
  
  node: { 
    position: 'absolute', width: '90px', height: '90px', borderRadius: '50%', 
    backgroundColor: '#1c1917', border: '4px solid', zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 6px 0 rgba(0,0,0,0.5)', transition: 'transform 0.1s',
    transform: 'translate(-50%, -50%)'
  },
  nodeLabel: { 
    fontSize: '11px', color: '#fff', marginTop: '4px', 
    textShadow: '1px 1px 0 #000', backgroundColor: 'rgba(0,0,0,0.7)', 
    padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap' 
  },
  
  btnBack: { 
    marginTop: '20px', padding: '15px', backgroundColor: '#44403c', 
    color: '#e7e5e4', border: 'none', borderRadius: '8px', 
    cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' 
  },
};
