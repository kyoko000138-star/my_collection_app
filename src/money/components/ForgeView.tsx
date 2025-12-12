// src/money/components/ForgeView.tsx
import React from 'react';

interface Props {
  materials: Record<string, number>;
  onCraft: () => void;
  onBack: () => void;
}

export const ForgeView: React.FC<Props> = ({ materials, onCraft, onBack }) => {
  const essence = materials['PURE_ESSENCE'] || 0;
  const canCraft = essence >= 3;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚒️ 대장간</h2>
      
      <div style={styles.card}>
        <div style={styles.icon}>🗡️</div>
        <h3>잔잔한 장부검</h3>
        <p style={styles.desc}>기록 시 MP 소모를 줄여주는 검</p>
        
        <div style={styles.cost}>
          필요: 🔮 Pure Essence 3개 (보유: {essence})
        </div>

        <button 
          onClick={onCraft} 
          disabled={!canCraft}
          style={canCraft ? styles.btnCraft : styles.btnDisabled}
        >
          {canCraft ? "제작하기" : "재료 부족"}
        </button>
      </div>

      <button onClick={onBack} style={styles.backBtn}>나가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#451a03', padding: '20px', display: 'flex', flexDirection: 'column', color: '#fff' },
  title: { textAlign: 'center', borderBottom: '2px solid #d97706', paddingBottom: '10px' },
  card: { backgroundColor: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', textAlign: 'center', marginTop: '20px' },
  icon: { fontSize: '50px', marginBottom: '10px' },
  desc: { fontSize: '12px', color: '#fbbf24' },
  cost: { margin: '15px 0', fontSize: '13px', color: '#fed7aa' },
  btnCraft: { width: '100%', padding: '12px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  btnDisabled: { width: '100%', padding: '12px', backgroundColor: '#57534e', color: '#a8a29e', border: 'none', borderRadius: '8px', cursor: 'not-allowed' },
  backBtn: { marginTop: 'auto', padding: '10px', backgroundColor: 'transparent', border: '1px solid #d97706', color: '#fbbf24', borderRadius: '8px', cursor: 'pointer' }
};
