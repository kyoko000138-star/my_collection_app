// src/money/components/ShopView.tsx
import React from 'react';
import { ITEM_DB } from '../gameData';

interface Props {
  salt: number;
  onBuyItem: (itemId: string) => void;
  onBack: () => void;
}

export const ShopView: React.FC<Props> = ({ salt, onBuyItem, onBack }) => {
  // 판매 아이템 목록 (임시)
  const shopItems = ['water_can', 'potion_mp_s'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🏪 잡화점</h2>
        <div style={{color: '#fbbf24'}}>보유 Salt: {salt}</div>
      </div>

      <div style={styles.list}>
        {shopItems.map(itemId => {
            const item = ITEM_DB[itemId] || { name: '???', desc: '', price: 10 };
            const price = 10; // 임시 고정 가격
            
            return (
                <div key={itemId} style={styles.itemRow}>
                    <div style={{flex: 1}}>
                        <div style={{fontWeight:'bold'}}>{item.name}</div>
                        <div style={{fontSize:'10px', color:'#9ca3af'}}>{item.desc}</div>
                    </div>
                    <button onClick={() => onBuyItem(itemId)} style={styles.buyBtn}>
                        {price} Salt
                    </button>
                </div>
            );
        })}
      </div>

      <button onClick={onBack} style={styles.backBtn}>나가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#3f3cbb', padding: '20px', display: 'flex', flexDirection: 'column', color:'#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' },
  list: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  itemRow: { display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' },
  buyBtn: { padding: '8px 16px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' },
  backBtn: { marginTop: '20px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};
