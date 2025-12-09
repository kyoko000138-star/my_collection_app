import React from 'react';

const FogOverlay: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', // 클릭은 통과됨
        zIndex: 5, // 배경보다는 위, UI보다는 아래
        overflow: 'hidden'
      }}
    >
      <style>
        {`
          @keyframes fogFloat {
            0% { transform: translateX(-5%) translateY(0); opacity: 0.4; }
            50% { transform: translateX(5%) translateY(-2%); opacity: 0.7; }
            100% { transform: translateX(-5%) translateY(0); opacity: 0.4; }
          }
        `}
      </style>
      {/* 안개 레이어 1 */}
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(120, 110, 130, 0.4) 90%)',
        backdropFilter: 'blur(2px) grayscale(40%)',
        animation: 'fogFloat 20s infinite ease-in-out',
      }} />
      {/* 안개 텍스트 */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold'
      }}>
        PMS FOG ACTIVE
      </div>
    </div>
  );
};

export default FogOverlay;
