// src/money/components/ShopView.tsx
import React from 'react';

interface Props {
  salt: number;
  onBack: () => void;
}

export const ShopView: React.FC<Props> = ({ salt, onBack }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🏪 잡화점</h2>
        <div style={styles.wallet}>🧂 {salt}</div>
      </div>

      <div style={styles.grid}>
        <div style={styles.item}>
          <div style={{fontSize:'30px'}}>🧪</div>
          <div>회복 물약</div>
          <button style={styles.buyBtn} onClick={() => alert("준비 중입니다!")}>5 Salt</button>
        </div>
        <div style={styles.item}>
          <div style={{fontSize:'30px'}}>💊</div>
          <div>비료</div>
          <button style={styles.buyBtn} onClick={() => alert("준비 중입니다!")}>10 Salt</button>
        </div>
        {/* 더 많은 아이템 추가 가능 */}
      </div>

      <button onClick={onBack} style={styles.backBtn}>나가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#064e3b', padding: '20px', display: 'flex', flexDirection: 'column', color: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #34d399', paddingBottom: '10px' },
  wallet: { fontSize: '14px', fontWeight: 'bold', color: '#34d399' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' },
  item: { backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', textAlign: 'center' },
  buyBtn: { marginTop: '5px', padding: '6px 12px', backgroundColor: '#059669', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '12px' },
  backBtn: { marginTop: 'auto', padding: '10px', backgroundColor: 'transparent', border: '1px solid #34d399', color: '#34d399', borderRadius: '8px', cursor: 'pointer' }
};
