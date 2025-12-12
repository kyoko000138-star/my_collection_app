import React from 'react';
import { Scene } from '../types';

interface Props {
  onChangeScene: (scene: Scene) => void;
}

export const VillageMap: React.FC<Props> = ({ onChangeScene }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={{fontSize:'20px'}}>🚩</span> 머니 빌리지
      </div>
      
      <div style={styles.mapArea}>
        {/* 길 (십자 형태) */}
        <div style={styles.roadVertical} />
        <div style={styles.roadHorizontal} />

        {/* 1. 도서관 (좌측 상단) */}
        <div style={{...styles.building, top: '20%', left: '20%'}} onClick={() => onChangeScene(Scene.LIBRARY)}>
          <div style={styles.icon}>🏛️</div>
          <div style={styles.label}>기록의 도서관</div>
          <div style={styles.subLabel}>(구독/지출)</div>
        </div>

        {/* 2. 내 정원 (중앙) */}
        <div style={{...styles.building, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10}} onClick={() => onChangeScene(Scene.GARDEN)}>
          <div style={{...styles.icon, fontSize: '50px'}}>🏡</div>
          <div style={styles.label}>나의 집</div>
        </div>

        {/* 3. 대장간 (우측 상단) */}
        <div style={{...styles.building, top: '20%', right: '20%'}} onClick={() => onChangeScene(Scene.FORGE)}>
          <div style={styles.icon}>⚒️</div>
          <div style={styles.label}>대장간</div>
        </div>

        {/* 4. 잡화점 (좌측 하단) */}
        <div style={{...styles.building, bottom: '20%', left: '20%'}} onClick={() => onChangeScene(Scene.SHOP)}>
          <div style={styles.icon}>🏪</div>
          <div style={styles.label}>잡화점</div>
        </div>

        {/* 5. 성문/월드맵 (하단 중앙) */}
        <div style={{...styles.building, bottom: '10%', left: '50%', transform: 'translateX(-50%)'}} onClick={() => onChangeScene(Scene.WORLD_MAP)}>
          <div style={styles.icon}>🏰</div>
          <div style={styles.label}>성 밖으로</div>
          <div style={styles.subLabel}>(탐험/전투)</div>
        </div>
      </div>
      
      <div style={styles.guide}>
        건물을 터치하거나 A버튼으로 결정
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#57534e', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  header: { padding: '10px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '16px', fontWeight: 'bold', zIndex: 20 },
  mapArea: { flex: 1, position: 'relative', backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', backgroundSize: '20px 20px' },
  
  roadVertical: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: '40px', transform: 'translateX(-20px)', backgroundColor: '#44403c', borderLeft: '2px dashed #78716c', borderRight: '2px dashed #78716c' },
  roadHorizontal: { position: 'absolute', left: 0, right: 0, top: '50%', height: '40px', transform: 'translateY(-20px)', backgroundColor: '#44403c', borderTop: '2px dashed #78716c', borderBottom: '2px dashed #78716c' },

  building: { position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s' },
  icon: { fontSize: '40px', filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.5))', marginBottom: '4px' },
  label: { backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' },
  subLabel: { fontSize: '9px', color: '#fbbf24', marginTop: '2px', textShadow: '1px 1px 0 #000' },
  
  guide: { position: 'absolute', bottom: 10, width: '100%', textAlign: 'center', color: '#d6d3d1', fontSize: '11px', zIndex: 20 }
};
