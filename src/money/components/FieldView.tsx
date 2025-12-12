// src/money/components/FieldView.tsx

import React from 'react';
import { FieldObject, ShadowMonster } from '../types';

interface FieldViewProps {
  playerPos: { x: number; y: number };
  objects: FieldObject[];
  shadows: ShadowMonster[]; // [NEW] 그림자 몬스터
  dungeonName: string;
}

export const FieldView: React.FC<FieldViewProps> = ({ playerPos, objects, shadows, dungeonName }) => {
  // 그림자가 많을수록 화면이 어두워짐 (최대 70%)
  const darknessLevel = Math.min(shadows.length * 0.15, 0.7);

  return (
    <div style={styles.container}>
      {/* 배경 패턴 */}
      <div style={styles.bgPattern} />
      
      {/* 어둠 오버레이 (공포 분위기) */}
      <div style={{...styles.darknessOverlay, opacity: darknessLevel}} />

      {/* 헤더 */}
      <div style={styles.header}>
        🚩 {dungeonName} (그림자: {shadows.length})
      </div>

      {/* 파밍 아이템 */}
      {objects.map(obj => !obj.isCollected && (
        <div key={obj.id} style={{...styles.object, left: `${obj.x}%`, top: `${obj.y}%`}}>
          {obj.type === 'JUNK' ? '✨' : '🌿'}
        </div>
      ))}

      {/* [NEW] 그림자 몬스터 (지출 스택) */}
      {shadows.map(shadow => (
        <div key={shadow.id} style={{...styles.shadowMonster, left: `${shadow.x}%`, top: `${shadow.y}%`}}>
          <div className="animate-pulse">👻</div>
          <div style={styles.shadowLabel}>₩{shadow.amount.toLocaleString()}</div>
        </div>
      ))}

      {/* 플레이어 */}
      <div style={{...styles.player, left: `${playerPos.x}%`, top: `${playerPos.y}%`}}>
        <div style={styles.playerSprite}>🧙‍♂️</div>
        <div style={styles.shadow} />
      </div>

      {/* 가이드 */}
      <div style={styles.guide}>
        {shadows.length > 0 
          ? "⚠️ 으스스한 기운이 느껴집니다..." 
          : "방향키로 이동하며 아이템을 찾으세요."}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#353b48' },
  bgPattern: { position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' },
  
  darknessOverlay: { position: 'absolute', inset: 0, backgroundColor: '#000', pointerEvents: 'none', zIndex: 15, transition: 'opacity 0.5s' },

  header: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: '12px', zIndex: 20 },
  
  object: { position: 'absolute', fontSize: '20px', transform: 'translate(-50%, -50%)', animation: 'float 2s infinite ease-in-out', zIndex: 5 },
  
  shadowMonster: { position: 'absolute', fontSize: '28px', transform: 'translate(-50%, -50%)', zIndex: 10, filter: 'grayscale(100%) brightness(0.5) drop-shadow(0 0 5px #ef4444)' },
  shadowLabel: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontSize: '9px', color: '#fca5a5', textShadow: '1px 1px 0 #000', whiteSpace: 'nowrap' },

  player: { position: 'absolute', zIndex: 20, transform: 'translate(-50%, -80%)', transition: 'all 0.15s linear', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  playerSprite: { fontSize: '40px', filter: 'drop-shadow(0 4px 2px rgba(0,0,0,0.4))' },
  shadow: { width: '24px', height: '8px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', marginTop: '-6px' },
  
  guide: { position: 'absolute', bottom: 10, width: '100%', textAlign: 'center', fontSize: '10px', color: '#e2e8f0', zIndex: 20, textShadow: '1px 1px 0 #000' }
};
