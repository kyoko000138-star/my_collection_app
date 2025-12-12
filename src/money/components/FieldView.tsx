// src/money/components/FieldView.tsx

import React from 'react';
import { FieldObject } from '../types';

interface FieldViewProps {
  playerPos: { x: number; y: number }; // 플레이어 위치 (0~100)
  objects: FieldObject[];              // 맵에 떨어진 아이템들
  dungeonName: string;
}

export const FieldView: React.FC<FieldViewProps> = ({ playerPos, objects, dungeonName }) => {
  return (
    <div style={styles.container}>
      {/* 맵 배경 (타일 패턴) */}
      <div style={styles.background}>
        <div style={styles.gridOverlay} />
      </div>

      {/* 상단 지역 이름 */}
      <div style={styles.header}>
        🚩 {dungeonName} (탐험 중...)
      </div>

      {/* 떨어진 아이템들 */}
      {objects.map(obj => !obj.isCollected && (
        <div key={obj.id} style={{
          ...styles.objectBase,
          left: `${obj.x}%`, top: `${obj.y}%`
        }}>
          {obj.type === 'JUNK' ? '📄' : obj.type === 'HERB' ? '🌿' : '🎁'}
        </div>
      ))}

      {/* 플레이어 캐릭터 */}
      <div style={{
        ...styles.player,
        left: `${playerPos.x}%`, 
        top: `${playerPos.y}%`
      }}>
        🧙‍♂️
        <div style={styles.shadow} />
      </div>

      {/* 안내 메시지 */}
      <div style={styles.guideMsg}>
        방향키로 이동하여 아이템을 습득하세요!
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#353b48' },
  background: { position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' },
  gridOverlay: { width: '100%', height: '100%', border: '2px solid #4a5568', boxSizing: 'border-box' },
  header: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 4, fontSize: '12px', color: '#fff', zIndex: 10 },
  
  objectBase: { position: 'absolute', fontSize: '20px', transform: 'translate(-50%, -50%)', animation: 'bounce 2s infinite' },
  
  player: { position: 'absolute', fontSize: '32px', transform: 'translate(-50%, -80%)', transition: 'all 0.1s linear', zIndex: 5 },
  shadow: { position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '20px', height: '6px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%' },
  
  guideMsg: { position: 'absolute', bottom: 10, width: '100%', textAlign: 'center', fontSize: '10px', color: '#a0aec0', textShadow: '1px 1px 0 #000' }
};
