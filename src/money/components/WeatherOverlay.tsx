// src/money/components/WeatherOverlay.tsx
import React from 'react';
import { MoneyWeatherId } from '../moneyWeather';

export const WeatherOverlay: React.FC<{ weather: MoneyWeatherId }> = ({ weather }) => {
  const base: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 5,
    opacity: 0.22,
  };

  const layerStyle: React.CSSProperties = (() => {
    switch (weather) {
      case 'RAIN':
      case 'STORM':
        return {
          ...base,
          opacity: weather === 'STORM' ? 0.32 : 0.22,
          backgroundImage:
            'repeating-linear-gradient(120deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 2px, rgba(255,255,255,0) 6px, rgba(255,255,255,0) 14px)',
          backgroundSize: '200% 200%',
          animation: 'money_rain 1.2s linear infinite',
        };
      case 'SNOW':
        return {
          ...base,
          opacity: 0.28,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.85) 0 2px, transparent 3px), radial-gradient(circle at 70% 40%, rgba(255,255,255,0.85) 0 2px, transparent 3px), radial-gradient(circle at 45% 70%, rgba(255,255,255,0.85) 0 2px, transparent 3px)',
          backgroundSize: '200px 200px',
          animation: 'money_snow 3.5s linear infinite',
        };
      case 'RAINBOW':
        return {
          ...base,
          opacity: 0.18,
          backgroundImage:
            'linear-gradient(90deg, rgba(255,0,0,0.35), rgba(255,165,0,0.35), rgba(255,255,0,0.35), rgba(0,128,0,0.35), rgba(0,0,255,0.35), rgba(75,0,130,0.35), rgba(238,130,238,0.35))',
          animation: 'money_rainbow 2.8s ease-in-out infinite',
        };
      case 'CLOUDY':
        return {
          ...base,
          opacity: 0.18,
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 70% 25%, rgba(255,255,255,0.28), transparent 60%)',
        };
      case 'SUNNY':
      default:
        return {
          ...base,
          opacity: 0.12,
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.35), transparent 55%)',
        };
    }
  })();

  return (
    <>
      <style>{`
        @keyframes money_rain {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        @keyframes money_snow {
          0% { transform: translateY(-8px); }
          100% { transform: translateY(18px); }
        }
        @keyframes money_rainbow {
          0%,100% { opacity: 0.14; }
          50% { opacity: 0.24; }
        }
      `}</style>
      <div style={layerStyle} />
    </>
  );
};
