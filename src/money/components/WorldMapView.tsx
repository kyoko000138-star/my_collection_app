import React from 'react';

interface WorldMapViewProps {
  onSelectDungeon: (category: string) => void;
  onBack: () => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({ onSelectDungeon, onBack }) => {
  const dungeons = [
    { id: 'food', name: '식비의 숲', icon: '🌲', color: '#22c55e' },
    { id: 'transport', name: '교통의 사막', icon: '🏜️', color: '#f59e0b' },
    { id: 'shopping', name: '쇼핑의 시장', icon: '🎪', color: '#ec4899' },
    { id: 'etc', name: '기타 던전', icon: '🕳️', color: '#6366f1' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗺️ 월드맵</h2>
      <p style={styles.subtitle}>어디서 지출이 발생했나요?</p>

      <div style={styles.grid}>
        {dungeons.map((d) => (
          <button 
            key={d.id} 
            onClick={() => onSelectDungeon(d.id)}
            style={{...styles.card, borderColor: d.color}}
          >
            <div style={{fontSize:'32px', marginBottom:'10px'}}>{d.icon}</div>
            <div style={{color: d.color, fontWeight:'bold'}}>{d.name}</div>
          </button>
        ))}
      </div>

      <button onClick={onBack} style={styles.btnBack}>↩️ 마을로 돌아가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' },
  title: { textAlign: 'center', fontSize: '24px', marginBottom: '10px' },
  subtitle: { textAlign: 'center', color: '#9ca3af', marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' },
  card: { 
    padding: '20px', backgroundColor: '#1f2937', border: '2px solid', borderRadius: '12px',
    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' 
  },
  btnBack: { padding: '15px', backgroundColor: 'transparent', border: '2px solid #4b5563', color: '#9ca3af', borderRadius: '12px', cursor: 'pointer' }
};
