// src/money/components/WorldMapView.tsx

import React from 'react';
import { WORLD_LOCATIONS } from '../gameData';
import { LocationId } from '../types';

interface Props {
  currentLocation: LocationId;
  unlockedLocations: LocationId[];
  onSelectLocation: (locId: LocationId) => void;
  onSelectDungeon: (dungeonId: string) => void;
  onBack: () => void;
}

export const WorldMapView: React.FC<Props> = ({ 
  currentLocation, 
  unlockedLocations, 
  onSelectLocation, 
  onSelectDungeon, 
  onBack 
}) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗺️ 월드맵</h2>
      
      <div style={styles.mapArea}>
        {/* --- 마을 노드 --- */}
        {Object.entries(WORLD_LOCATIONS).map(([key, data], idx) => {
          const locId = key as LocationId;
          const isUnlocked = (unlockedLocations || []).includes(locId);
          const isCurrent = locId === currentLocation;

          return (
            <div 
              key={key} 
              style={{
                ...styles.node, 
                // [수정] 시작 위치를 15%로 올려서 공간 확보
                top: `${15 + idx * 25}%`, 
                left: idx % 2 === 0 ? '20%' : '60%',
                backgroundColor: isUnlocked 
                  ? (isCurrent ? '#10b981' : '#6366f1') 
                  : '#4b5563',
                borderColor: isUnlocked ? '#fff' : '#9ca3af',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : 0.7
              }}
              onClick={() => {
                if (isUnlocked) onSelectLocation(locId);
                else alert("🚧 아직 발견하지 못한 지역입니다.\n필드에서 [이정표]를 찾아보세요!");
              }}
            >
              <div style={styles.nodeIcon}>
                {isUnlocked ? (isCurrent ? '🚩' : '🏘️') : '🔒'}
              </div>
              <div style={styles.nodeLabel}>
                {isUnlocked ? data.name : '???'}
              </div>
              {isCurrent && <div style={styles.currentTag}>현재 위치</div>}
            </div>
          );
        })}

        {/* --- 하단 버튼 영역 (겹침 방지) --- */}
        <div style={styles.bottomArea}>
          <button style={styles.dungeonBtn} onClick={() => onSelectDungeon('etc')}>
            💀 미지의 던전 (탐험)
          </button>
          <p style={styles.tipText}>Tip: 필드를 돌아다니며 이정표(🪧)를 찾으세요!</p>
        </div>
      </div>

      <div style={styles.footer}>
        <button onClick={onBack} style={styles.backBtn}>돌아가기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', color: '#fff' },
  title: { textAlign: 'center', padding: '20px', borderBottom: '2px solid #334155', margin: 0 },
  
  mapArea: { flex: 1, position: 'relative', backgroundImage: 'radial-gradient(#1e293b 10%, #0f172a 90%)' },
  
  node: { position: 'absolute', width: '90px', padding: '10px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: '2px solid #fff', transition: 'transform 0.2s', zIndex: 5 },
  nodeIcon: { fontSize: '24px', marginBottom: '5px' },
  nodeLabel: { fontSize: '12px', fontWeight: 'bold', textShadow: '1px 1px 0 #000' },
  currentTag: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fbbf24', color: '#000', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', fontWeight: 'bold', zIndex: 10, border: '1px solid #fff' },

  // [수정] 절대 위치로 하단 고정하여 노드와 겹침 방지
  bottomArea: { position: 'absolute', bottom: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  
  dungeonBtn: { padding: '12px 30px', backgroundColor: '#ef4444', color: '#fff', border: '2px solid #fff', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px #ef4444', fontSize: '14px' },
  tipText: { fontSize: '11px', color: '#94a3b8' },

  footer: { padding: '20px', borderTop: '2px solid #334155' },
  backBtn: { width: '100%', padding: '12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};
