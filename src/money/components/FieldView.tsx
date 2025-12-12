// src/money/components/FieldView.tsx

import React from 'react';
import { FieldObject } from '../types';

interface FieldViewProps {
  playerPos: { x: number; y: number }; // 0~100 %
  objects: FieldObject[];
  dungeonName: string;
}

export const FieldView: React.FC<FieldViewProps> = ({ playerPos, objects, dungeonName }) => {
  return (
    <div style={styles.container}>
      {/* 1. 배경 (타일 패턴) */}
      <div style={styles.bgPattern} />
      
      {/* 2. 상단 지역 표시 */}
      <div style={styles.header}>
        🚩 {dungeonName} (탐험 중...)
      </div>

      {/* 3. 오브젝트 렌더링 */}
      {objects.map(obj => !obj.isCollected && (
        <div 
          key={obj.id} 
          style={{
            ...styles.object,
            left: `${obj.x}%`, 
            top: `${obj.y}%`
          }}
        >
          {/* 아이템 타입별 이모지 */}
          {obj.type === 'JUNK' ? '📄' : obj.type === 'HERB' ? '🌿' : '💎'}
        </div>
      ))}

      {/* 4. 플레이어 캐릭터 */}
      <div 
        style={{
          ...styles.player,
          left: `${playerPos.x}%`, 
          top: `${playerPos.y}%`
        }}
      >
        <div style={styles.playerSprite}>🧙‍♂️</div>
        <div style={styles.shadow} />
      </div>

      {/* 5. 안내 문구 */}
      <div style={styles.guide}>
        <span style={{backgroundColor:'rgba(0,0,0,0.6)', padding:'2px 6px', borderRadius:4}}>
          방향키로 이동 / A버튼 조사
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    backgroundColor: '#353b48', // 땅 색상
  },
  bgPattern: {
    position: 'absolute', inset: 0, opacity: 0.2,
    backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
    backgroundSize: '20px 20px'
  },
  header: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
    padding: '4px 8px', borderRadius: 6, fontSize: '12px', zIndex: 10,
    border: '1px solid rgba(255,255,255,0.2)'
  },
  object: {
    position: 'absolute', fontSize: '24px',
    transform: 'translate(-50%, -50%)',
    animation: 'float 2s infinite ease-in-out',
    zIndex: 5
  },
  player: {
    position: 'absolute', zIndex: 20,
    transform: 'translate(-50%, -80%)', // 발 위치 기준 보정
    transition: 'all 0.15s linear', // 부드러운 이동
    display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  playerSprite: { fontSize: '40px', filter: 'drop-shadow(0 4px 2px rgba(0,0,0,0.4))' },
  shadow: {
    width: '24px', height: '8px', backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '50%', marginTop: '-6px'
  },
  guide: {
    position: 'absolute', bottom: 10, width: '100%', textAlign: 'center',
    fontSize: '10px', color: '#e2e8f0'
  }
};
