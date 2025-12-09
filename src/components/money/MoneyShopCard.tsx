// src/components/money/MoneyShopCard.tsx
import React, { useState } from 'react';
import { Sparkles, PenTool, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

// 🐱 상점 주인 이미지 (내장)
const SHOP_KEEPER_IMG = 'https://images.unsplash.com/photo-1534234828569-1f3561d50c11?q=80&w=200&auto=format&fit=crop';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  desc: string;
}

const ITEMS: ShopItem[] = [
  { id: 'potion', name: '회복 포션', price: 5, icon: <Heart size={14} color="#ff6b6b" />, desc: '지친 마음을 달래줍니다 (이펙트)' },
  { id: 'scroll', name: '기록 스크롤', price: 10, icon: <PenTool size={14} color="#4da6ff" />, desc: '기록 의지를 +1 상승시킵니다' },
  { id: 'box', name: '랜덤 박스', price: 20, icon: <Sparkles size={14} color="#ffd700" />, desc: '꽝 혹은 대박 (운 시험)' },
];

interface MoneyShopCardProps {
  currentLeaf: number;
  onBuy: (cost: number) => void;
}

const MoneyShopCard: React.FC<MoneyShopCardProps> = ({ currentLeaf, onBuy }) => {
  const [msg, setMsg] = useState('');

  const handleBuy = (item: ShopItem) => {
    if (currentLeaf < item.price) {
      setMsg('Leaf가 부족해요!');
      setTimeout(() => setMsg(''), 1500);
      return;
    }

    onBuy(item.price);
    
    if (item.id === 'potion') {
      setMsg('💖 HP가 회복되는 기분!');
      confetti({ particleCount: 30, spread: 50, colors: ['#ff6b6b', '#fff'] });
    } else if (item.id === 'box') {
      const luck = Math.random();
      if(luck > 0.6) {
        setMsg('✨ 대박! 희귀한 돌맹이 획득!');
        confetti({ particleCount: 80, spread: 80 });
      } else {
        setMsg('💨 꽝! 상자가 비어있네요.');
      }
    } else {
      setMsg(`🛒 ${item.name} 획득!`);
    }
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div style={{
      padding: '16px', borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #ddd',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
      height: '260px', // 📉 몬스터 카드랑 높이 맞춤
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid #555' }}>
          <img src={SHOP_KEEPER_IMG} alt="Keeper" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#333' }}>숲속 잡화점</div>
          <div style={{ fontSize: 10, color: '#888' }}>"어서오세요~"</div>
        </div>
        <div style={{ marginLeft: 'auto', backgroundColor: '#f0ffe5', padding: '2px 8px', borderRadius: '8px', fontSize: 11, color: '#2e7d32', fontWeight: 'bold' }}>
          🌿 {currentLeaf}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        {ITEMS.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px', borderRadius: '10px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
            <div style={{ padding: 6, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#333' }}>{item.name}</div>
              <div style={{ fontSize: 9, color: '#999' }}>{item.desc}</div>
            </div>
            <button 
              onClick={() => handleBuy(item)}
              style={{ 
                padding: '4px 8px', borderRadius: '6px', border: 'none', 
                backgroundColor: currentLeaf >= item.price ? '#333' : '#ddd', 
                color: '#fff', fontSize: 10, fontWeight: 'bold', cursor: currentLeaf >= item.price ? 'pointer' : 'default'
              }}
            >
              {item.price}
            </button>
          </div>
        ))}
      </div>

      {msg && (
        <div className="fade-in" style={{ 
          marginTop: 8, padding: '4px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', 
          borderRadius: '6px', fontSize: 11, textAlign: 'center', position: 'absolute', bottom: 20, left: 20, right: 20
        }}>
          {msg}
        </div>
      )}
    </div>
  );
};

export default MoneyShopCard;
