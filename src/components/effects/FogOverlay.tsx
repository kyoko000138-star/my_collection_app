import React from 'react';

const FogOverlay: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // 클릭은 통과되도록
        zIndex: 50,
        background: 'linear-gradient(to bottom, rgba(100, 80, 120, 0.2), transparent)',
        backdropFilter: 'blur(1px) grayscale(30%)', // 살짝 흐리고 채도 낮춤
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 안개 애니메이션 효과 (CSS로 흐르는 느낌) */}
      <style>
        {`
          @keyframes fogMove {
            0% { transform: translateX(-10%); opacity: 0.3; }
            50% { transform: translateX(10%); opacity: 0.6; }
            100% { transform: translateX(-10%); opacity: 0.3; }
          }
        `}
      </style>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: -50,
          right: -50,
          bottom: 0,
          background: 'radial-gradient(circle, transparent 40%, rgba(200, 200, 220, 0.4) 90%)',
          animation: 'fogMove 10s infinite ease-in-out',
        }}
      />
      <div style={{
        position: 'absolute',
        top: '10%',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        fontWeight: 'bold',
        textShadow: '0 0 5px rgba(0,0,0,0.5)',
        letterSpacing: '0.1em'
      }}>
        PMS FOG DETECTED
      </div>
    </div>
  );
};

export default FogOverlay;
