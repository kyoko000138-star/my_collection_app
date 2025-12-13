// src/money/components/WorldMapView.tsx

import React from 'react';
import { WORLD_LOCATIONS } from '../gameData';
import { LocationId } from '../types';

interface Props {
  currentLocation: LocationId;
  onSelectLocation: (locId: LocationId) => void;
  onSelectDungeon: (dungeonId: string) => void;
  onBack: () => void;
}

export const WorldMapView: React.FC<Props> = ({ currentLocation, onSelectLocation, onSelectDungeon, onBack }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗺️ 월드맵</h2>
      
      <div style={styles.mapArea}>
        {/* --- 마을 이동 노드 --- */}
        {Object.entries(WORLD_LOCATIONS).map(([key, data], idx) => {
          const isCurrent = key === currentLocation;
          return (
            <div 
              key={key} 
              style={{
                ...styles.node, 
                top: `${20 + idx * 25}%`, 
                left: idx % 2 === 0 ? '20%' : '60%',
                backgroundColor: isCurrent ? '#10b981' : '#6366f1'
              }}
              onClick={() => onSelectLocation(key as LocationId)}
            >
              <div style={styles.nodeIcon}>{isCurrent ? '🚩' : '🏘️'}</div>
              <div style={styles.nodeLabel}>{data.name}</div>
              {isCurrent && <div style={styles.currentTag}>현재 위치</div>}
            </div>
          );
        })}

        {/* --- 던전 (기존 기능) --- */}
        <button style={styles.dungeonBtn} onClick={() => onSelectDungeon('etc')}>
          💀 미지의 던전 (탐험)
        </button>
      </div>

      <div style={styles.footer}>
        <button onClick={onBack} style={styles.backBtn}>마을로 돌아가기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', color: '#fff' },
  title: { textAlign: 'center', padding: '20px', borderBottom: '2px solid #334155', margin: 0 },
  
  mapArea: { flex: 1, position: 'relative', backgroundImage: 'radial-gradient(#1e293b 10%, #0f172a 90%)' },
  
  node: { position: 'absolute', width: '80px', padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: '2px solid #fff', transition: 'transform 0.2s' },
  nodeIcon: { fontSize: '24px', marginBottom: '5px' },
  nodeLabel: { fontSize: '12px', fontWeight: 'bold', textShadow: '1px 1px 0 #000' },
  currentTag: { position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fbbf24', color: '#000', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', fontWeight: 'bold' },

  dungeonBtn: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '12px 30px', backgroundColor: '#ef4444', color: '#fff', border: '2px solid #fff', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px #ef4444' },

  footer: { padding: '20px', borderTop: '2px solid #334155' },
  backBtn: { width: '100%', padding: '12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};
