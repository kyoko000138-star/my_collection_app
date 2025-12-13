// src/money/components/GardenView.tsx
import React from 'react';
import { UserState } from '../types';
import { ASSET_OBJECTS } from '../gameData';

export const GardenView: React.FC<{ user: UserState, onChangeScene: any, onDayEnd: () => void, onUseItem: any }> = ({ user, onDayEnd }) => {
  const { assets, garden } = user;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#202025' }}>
      {/* 1. 배경 & 자산 건물 렌더링 */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* 울타리 */}
        {assets.fence > 0 && <div style={{position:'absolute', bottom:'15%', width:'100%', textAlign:'center', fontSize:'20px'}}>{Array(8).fill(ASSET_OBJECTS.fence).join(' ')}</div>}

        {/* 주거지 (현금 자산 레벨에 따라 변경) */}
        <div style={{ position: 'absolute', top: '25%', right: '15%', fontSize: '50px', zIndex: 2 }}>
          {assets.castle > 0 ? ASSET_OBJECTS.castle :
           assets.mansion > 0 ? ASSET_OBJECTS.mansion : 
           assets.house > 0 ? ASSET_OBJECTS.house : ASSET_OBJECTS.hut}
        </div>
        
        {/* 분수 (투자) */}
        {assets.fountain > 0 && <div style={{ position: 'absolute', bottom: '30%', left: '15%', fontSize: '40px' }}>{ASSET_OBJECTS.fountain}</div>}
        
        {/* 동상 (업적) */}
        {assets.statue > 0 && <div style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '35px' }}>{ASSET_OBJECTS.statue}</div>}
      </div>

      {/* 2. 꿈의 나무 & 안내 */}
      <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
        <div style={{ fontSize: '70px', filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.5))' }}>
          {garden.treeLevel === 0 ? '🌱' : garden.treeLevel < 3 ? '🌿' : '🌳'}
        </div>
        <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: 4, marginTop: -5 }}>
          {garden.treeLevel === 0 ? "저축으로 씨앗을 심으세요" : `Lv.${garden.treeLevel} 자산의 나무`}
        </div>
      </div>

      <button onClick={onDayEnd} style={{ position: 'absolute', top: 10, right: 10, padding: '8px 12px', background: '#374151', color: '#fff', border: '1px solid #fff', borderRadius: 8, cursor: 'pointer', zIndex: 20 }}>
        🌙 마감
      </button>
    </div>
  );
};
