// src/money/components/WorldMapView.tsx

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
      <p style={styles.desc}>어느 던전(지출처)으로 가시겠습니까?</p>

      <div style={styles.mapArea}>
        {/* 던전 노드들 */}
        {Object.entries(DUNGEONS).map(([key, data], idx) => (
          <button 
            key={key}
            onClick={() => onSelectDungeon(key)}
            style={{...styles.node, top: `${20 + idx * 20}%`, left: idx % 2 === 0 ? '20%' : '60%', borderColor: data.color}}
          >
            <span style={{fontSize:'24px'}}>{data.icon}</span>
            <span style={styles.nodeLabel}>{data.name}</span>
          </button>
        ))}
        {/* 길 연결선 (장식) */}
        <svg style={styles.pathSvg}><path d="M80 80 Q 150 150 220 220" stroke="#a8a29e" strokeWidth="4" fill="none" strokeDasharray="5,5" /></svg>
      </div>

      <button onClick={onBack} style={styles.btnBack}>↩️ 마을로 귀환</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1c1917' },
  title: { textAlign: 'center', color: '#e7e5e4', marginTop: '20px', fontSize: '20px' },
  desc: { textAlign: 'center', color: '#a8a29e', fontSize: '12px', marginBottom: '10px' },
  mapArea: { flex: 1, position: 'relative', margin: '10px', backgroundColor: '#292524', borderRadius: '12px', border: '4px solid #44403c', overflow: 'hidden' },
  pathSvg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' },
  node: { 
    position: 'absolute', width: '80px', height: '80px', borderRadius: '50%', 
    backgroundColor: '#1c1917', border: '3px solid', zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.5)', transition: 'transform 0.1s'
  },
  nodeLabel: { fontSize: '10px', color: '#fff', marginTop: '4px', textShadow: '1px 1px 0 #000' },
  btnBack: { margin: '20px', padding: '15px', backgroundColor: '#44403c', color: '#e7e5e4', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
};
