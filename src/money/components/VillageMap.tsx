// src/money/components/VillageMap.tsx
import React from 'react';
import { Scene } from '../types';

interface Props {
  onChangeScene: (scene: Scene) => void;
}

export const VillageMap: React.FC<Props> = ({ onChangeScene }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚩 머니 빌리지</h2>
      
      <div style={styles.mapArea}>
        {/* 1. 도서관 (기록/구독) */}
        <div style={{...styles.building, top: '20%', left: '20%'}} onClick={() => onChangeScene(Scene.LIBRARY)}>
          <div style={styles.icon}>🏛️</div>
          <div style={styles.label}>기록의 도서관</div>
        </div>

        {/* 2. 내 정원 (집) */}
        <div style={{...styles.building, top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} onClick={() => onChangeScene(Scene.GARDEN)}>
          <div style={{...styles.icon, fontSize: '50px'}}>🏡</div>
          <div style={styles.label}>나의 정원</div>
        </div>

        {/* 3. 상점 (준비중) */}
        <div style={{...styles.building, top: '25%', right: '20%'}} onClick={() => alert("상점 주인: 아직 물건 정리 중이에요!")}>
          <div style={styles.icon}>🏪</div>
          <div style={styles.label}>잡화점</div>
        </div>

        {/* 4. 성문 (월드맵/탐험) */}
        <div style={{...styles.building, bottom: '15%', left: '50%', transform: 'translateX(-50%)'}} onClick={() => onChangeScene(Scene.WORLD_MAP)}>
          <div style={styles.icon}>🏰</div>
          <div style={styles.label}>성 밖으로 (탐험)</div>
        </div>
      </div>
      
      <div style={styles.guide}>건물을 터치하여 입장하세요</div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#57534e', position: 'relative', overflow: 'hidden' },
  title: { position: 'absolute', top: 10, left: 0, width: '100%', textAlign: 'center', color: '#fff', fontSize: '16px', zIndex: 10, textShadow: '2px 2px 0 #000' },
  mapArea: { width: '100%', height: '100%', backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', backgroundSize: '20px 20px' },
  building: { position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s' },
  icon: { fontSize: '40px', filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.5))' },
  label: { marginTop: 5, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: 4 },
  guide: { position: 'absolute', bottom: 10, width: '100%', textAlign: 'center', color: '#d6d3d1', fontSize: '11px' }
};
