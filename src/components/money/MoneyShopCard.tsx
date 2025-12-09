// src/components/money/MoneyShopCard.tsx
import React, { useState } from 'react';
import { ShoppingBasket, Sparkles, Zap, Heart } from 'lucide-react';
import { SHOP_KEEPER_IMG } from '../../money/moneyImages';
import confetti from 'canvas-confetti';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  desc: string;
}

const ITEMS: ShopItem[] = [
  { id: 'potion', name: '마음의 포션', price: 5, icon: <Heart size={16} color="#ff6b6b" />, desc: '지친 마음을 달래줍니다 (HP 회복 연출)' },
  { id: 'scroll', name: '기록의 스크롤', price: 10, icon: <PenTool size={16} color="#4da6ff" />, desc: '기록 의지를 +1 상승시킵니다' },
  { id: 'box', name: '미스테리 박스', price: 20, icon: <Sparkles size={16} color="#ffd700" />, desc: '무엇이 나올지 모릅니다 (꽝 있음)' },
];

interface MoneyShopCardProps {
  currentLeaf: number;
  onBuy: (cost: number) => void; // 구매 시 부모에게 알림
}

const MoneyShopCard: React.FC<MoneyShopCardProps> = ({ currentLeaf, onBuy }) => {
  const [msg, setMsg] = useState('');

  const handleBuy = (item: ShopItem) => {
    if (currentLeaf < item.price) {
      setMsg('Leaf가 부족해요! 더 모아오세요.');
      setTimeout(() => setMsg(''), 2000);
      return;
    }

    onBuy(item.price);
    
    // 구매 효과
    if (item.id === 'potion') {
      setMsg('💖 마음이 편안해집니다...');
      confetti({ particleCount: 50, spread: 50, colors: ['#ff6b6b', '#ffffff'] });
    } else if (item.id === 'box') {
        const luck = Math.random();
        if(luck > 0.5) {
            setMsg('✨ 대박! 희귀한 "돌맹이"를 얻었습니다!');
            confetti({ particleCount: 100, spread: 100 });
        } else {
            setMsg('💨 꽝! 상자가 비어있었습니다.');
        }
    } else {
      setMsg(`🛒 ${item.name} 구매 완료!`);
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div style={{
      padding: '16px', borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #ddd',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minHeight: '320px', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #333' }}>
          <img src={SHOP_KEEPER_IMG} alt="Shop Keeper" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>숲속 잡화점</div>
          <div style={{ fontSize: 11, color: '#888' }}>"좋은 물건 있어요~"</div>
        </div>
        <div style={{ marginLeft: 'auto', backgroundColor: '#f0ffe5', padding: '4px 8px', borderRadius: '8px', fontSize: 12, color: '#2e7d32', fontWeight: 'bold' }}>
          🌿 {currentLeaf}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ITEMS.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: '12px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
            <div style={{ padding: 8, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#333' }}>{item.name}</div>
              <div style={{ fontSize: 10, color: '#999' }}>{item.desc}</div>
            </div>
            <button 
              onClick={() => handleBuy(item)}
              style={{ 
                padding: '6px 12px', borderRadius: '8px', border: 'none', 
                backgroundColor: currentLeaf >= item.price ? '#333' : '#ccc', 
                color: '#fff', fontSize: 11, fontWeight: 'bold', cursor: currentLeaf >= item.price ? 'pointer' : 'not-allowed'
              }}
            >
              {item.price}🌿
            </button>
          </div>
        ))}
      </div>

      {msg && (
        <div className="fade-in" style={{ 
          marginTop: 10, padding: '8px', backgroundColor: '#333', color: '#fff', 
          borderRadius: '8px', fontSize: 12, textAlign: 'center' 
        }}>
          {msg}
        </div>
      )}
    </div>
  );
};

export default MoneyShopCard;
