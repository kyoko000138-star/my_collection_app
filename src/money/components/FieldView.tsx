// src/money/components/FieldView.tsx
import React from 'react';
import { UserState } from '../types';
import { MAP_INFO, MAP_CONNECTIONS } from '../gameData';

interface Props {
  user: UserState;
  onMove: (dir: 'N' | 'S' | 'W' | 'E') => void;
  shadows: any[];
}

export const FieldView: React.FC<Props> = ({ user, onMove, shadows }) => {
  const currentLoc = user.currentLocation;
  const info = MAP_INFO[currentLoc] || { name: '???', type: 'DANGER', color: '#000', minimap: {x:0,y:0} };
  const connections = MAP_CONNECTIONS[currentLoc] || {};
  const mapGrid = info.minimap; 

  // 미니맵 렌더링 (5x5)
  const renderMinimapNode = (x: number, y: number) => {
    if (x === mapGrid.x && y === mapGrid.y) return <div style={styles.miniNodeCurrent} />; // 나
    const neighbor = Object.values(MAP_INFO).find(m => m.minimap.x === x && m.minimap.y === y);
    if (neighbor) return <div style={{...styles.miniNode, backgroundColor: neighbor.color}} />;
    return <div style={styles.miniNodeEmpty} />;
  };

  return (
    <div style={{ ...styles.container, backgroundColor: info.color }}>
      {/* 1. 상단 정보 & 미니맵 */}
      <div style={styles.header}>
        <div style={styles.locInfo}>
            <h2 style={{ margin: 0, fontSize: '18px', textShadow: '1px 1px 0 #000' }}>📍 {info.name}</h2>
            <span style={{ fontSize: '12px', color: '#eee', textShadow: '1px 1px 0 #000' }}>
                {info.type === 'TOWN' ? '안전한 마을' : '⚠️ 위험 지역'}
            </span>
        </div>
        
        {/* 미니맵 박스 */}
        <div style={styles.minimapBox}>
            {Array.from({length: 5}).map((_, y) => (
                <div key={y} style={{display:'flex'}}>
                    {Array.from({length: 5}).map((_, x) => (
                        <div key={`${x}-${y}`} style={{width: 6, height: 6, margin: 1}}>
                            {renderMinimapNode(x, y)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
      </div>

      {/* 2. 중앙 캐릭터 */}
      <div style={styles.centerView}>
        <div style={{ fontSize: '60px', marginBottom: '20px', transition: 'transform 0.2s' }}>
          {user.isExhausted ? '🚑' : '🧙‍♂️'}
        </div>
        {user.isExhausted && <div style={styles.exhaustAlert}>탈진! 구조 대기중...</div>}
        
        {shadows.length > 0 && (
          <div style={styles.shadowAlert}>👻 그림자 {shadows.length}체 배회 중</div>
        )}
      </div>

      {/* 3. 방향 네비게이션 (나침반) */}
      <div style={styles.compass}>
        {connections.N && <div style={styles.dirN}>⬆️ {MAP_INFO[connections.N]?.name}</div>}
        {connections.S && <div style={styles.dirS}>⬇️ {MAP_INFO[connections.S]?.name}</div>}
        {connections.W && <div style={styles.dirW}>⬅️ {MAP_INFO[connections.W]?.name}</div>}
        {connections.E && <div style={styles.dirE}>➡️ {MAP_INFO[connections.E]?.name}</div>}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' },
  header: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' },
  locInfo: { color: '#fff' },
  minimapBox: { background: '#111', padding: '4px', border: '1px solid #555', borderRadius: 4, boxShadow: '0 0 10px rgba(0,0,0,0.5)' },
  miniNodeCurrent: { width: '100%', height: '100%', backgroundColor: '#ef4444', borderRadius: '50%', border: '1px solid #fff' },
  miniNode: { width: '100%', height: '100%', borderRadius: '1px', opacity: 0.8 },
  miniNodeEmpty: { width: '100%', height: '100%', backgroundColor: '#222' },
  centerView: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  exhaustAlert: { background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold', marginTop: 10, border: '2px solid #fff' },
  shadowAlert: { background: 'rgba(0,0,0,0.7)', color: '#ef4444', padding: '4px 8px', borderRadius: 4, marginTop: 10 },
  compass: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  dirN: { position: 'absolute', top: 60, width: '100%', textAlign: 'center', color: '#fff', fontWeight: 'bold', textShadow: '1px 1px 0 #000' },
  dirS: { position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', color: '#fff', fontWeight: 'bold', textShadow: '1px 1px 0 #000' },
  dirW: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#fff', fontWeight: 'bold', textShadow: '1px 1px 0 #000', textAlign: 'left' },
  dirE: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#fff', fontWeight: 'bold', textShadow: '1px 1px 0 #000', textAlign: 'right' },
};
