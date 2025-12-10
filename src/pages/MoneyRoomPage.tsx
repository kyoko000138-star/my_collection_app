// src/pages/MoneyRoomPage.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Swords, Moon, Heart, Shield, Map as MapIcon,
  Zap, Database, Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Logic Imports ---
import { UserState, TransactionLike, DayStatusLike, ResidueType } from '../money/types';
import { calcCycleStatus } from '../money/moneyLuna';
import { calcHP, getResidueFromCategory, calcAttackDamage } from '../money/moneyGameLogic';
import { createJourney, getDailyMonster } from '../money/moneyJourney';

// --- Components (기존 것 사용, 내용만 props로 전달) ---
import MoneyMonsterCard from '../components/money/MoneyMonsterCard'; 
import MoneyStats from '../components/money/MoneyStats';
// (나머지 컴포넌트 import...)

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const todayStr = today.toISOString().slice(0, 10);

  // 1. 전역 상태 (실제론 Context나 Redux 권장하지만, 일단 useState로 구현)
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('mr_user_v3');
    // 초기값 세팅 (생략됨 - 실제 구현시엔 types.ts의 UserState 초기값 필요)
    return saved ? JSON.parse(saved) : { 
      budget: { variableBudget: 500000, snackRecoveryBudget: 30000 },
      cycleSettings: { lastPeriodStart: '2025-12-01', cycleLength: 28 },
      inventory: { potions: 3, shards: { record:0, discipline:0, freedom:0 }, materials: {} },
      status: { hp: 100, mp: 10, credit: 0 },
      // ... 나머지 필드 초기화
    };
  });

  // 로컬스토리지 저장
  useEffect(() => {
    localStorage.setItem('mr_user_v3', JSON.stringify(user));
  }, [user]);

  // 2. 엔진 가동
  const luna = useMemo(() => calcCycleStatus(today, user.cycleSettings), [today, user.cycleSettings]);
  const transactions = []; // (실제론 user.transactions 등에서 가져와야 함)
  const todayTxs = transactions.filter((t:any) => t.date === todayStr);
  const monster = useMemo(() => getDailyMonster(todayTxs), [todayTxs]);

  // 3. 입력 폼 상태
  const [txForm, setTxForm] = useState({ amount: '', category: '', memo: '' });

  // --- Actions ---

  // ⚔️ 평타: 앱 켜기 / 눈팅
  const handleCheck = () => {
    // 쿨타임 로직 필요 (여기선 생략)
    setUser(prev => ({
      ...prev,
      status: { ...prev.status, mp: Math.min(prev.status.mp + 1, 100) }
    }));
    alert("⚔️ 평타 공격! 몬스터를 견제하고 MP가 1 회복되었습니다.");
  };

  // 💥 피격 & 수습: 지출 입력
  const handleAddExpense = (usePotion: boolean) => {
    const amount = Number(txForm.amount);
    if (!amount) return;

    // 1. 잔해(Residue) 획득
    const residue = getResidueFromCategory(txForm.category);
    
    // 2. 포션 사용 여부 체크
    let finalUsePotion = usePotion;
    if (usePotion && user.inventory.potions <= 0) {
      alert("🧪 포션이 부족합니다!");
      finalUsePotion = false; 
    }

    // 3. 상태 업데이트
    setUser(prev => {
      const newMaterials = { ...prev.inventory.materials };
      newMaterials[residue] = (newMaterials[residue] || 0) + 1; // 잔해 추가

      const newPotions = finalUsePotion ? prev.inventory.potions - 1 : prev.inventory.potions;
      
      // HP 계산은 moneyGameLogic의 calcHP가 담당 (여기선 단순화)
      
      return {
        ...prev,
        inventory: { ...prev.inventory, materials: newMaterials, potions: newPotions },
        // ... HP 감소 로직 추가 필요
      };
    });

    // 4. 피드백
    if (finalUsePotion) {
      confetti({ colors: ['#ff69b4', '#fff'] }); // 핑크 힐링
      alert(`🧪 포션을 마셔 데미지를 막았습니다! (잔해: ${residue} 획득)`);
    } else {
      alert(`💥 ${amount} 데미지를 입었습니다! (잔해: ${residue} 획득)`);
    }
    
    // 5. 수습(기록) 보상
    if (txForm.memo.length > 2) {
       // 기록의 조각 추가 로직
    }
  };

  // 🔨 강타: 저축
  const handleSaving = () => {
    const amount = Number(txForm.amount);
    // 건물 경험치 로직 호출
    confetti({ colors: ['#ffd700'] });
    alert(`🔨 강타! 몬스터에게 ${amount*2} 데미지!`);
  };

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: '0 auto', background: luna.mode === 'pms' ? '#fff0f5' : '#fff' }}>
      
      {/* 1. 상단 HUD */}
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 'bold' }}>Lv.1 모험가</h2>
          <div style={{ fontSize: 12, color: '#666' }}>{luna.message}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#e11d48', fontWeight: 'bold' }}>HP {user.status.hp}%</div>
          <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>MP {user.status.mp}</div>
        </div>
      </header>

      {/* 2. 몬스터 카드 (오늘의 전황) */}
      <div style={{ marginBottom: 20, textAlign: 'center', padding: 20, border: '2px solid #333', borderRadius: 16 }}>
        <div style={{ fontSize: 40 }}>{monster.emoji}</div>
        <h3>{monster.name} (Lv.{monster.level})</h3>
        <div style={{ fontSize: 12, color: '#888' }}>오늘의 지출 마수</div>
      </div>

      {/* 3. 전투 컨트롤러 (입력폼) */}
      <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={handleCheck} style={{ flex: 1, padding: 8, background: '#fff', border: '1px solid #ddd', borderRadius: 8 }}>
            ⚔️ 눈팅 (평타)
          </button>
          <button onClick={() => alert('퀘스트창 열기')} style={{ flex: 1, padding: 8, background: '#fff', border: '1px solid #ddd', borderRadius: 8 }}>
            ✨ 퀘스트 (스킬)
          </button>
        </div>

        <input 
          type="number" placeholder="금액 입력" 
          value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})}
          style={{ width: '100%', padding: 12, marginBottom: 8, borderRadius: 8, border: '1px solid #ddd' }}
        />
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
           {['식비', '쇼핑', '교통', '저축'].map(cat => (
             <button key={cat} onClick={() => setTxForm({...txForm, category: cat})} 
               style={{ flex: 1, fontSize: 11, padding: 6, borderRadius: 6, background: txForm.category===cat ? '#333' : '#eee', color: txForm.category===cat ? '#fff' : '#333' }}>
               {cat}
             </button>
           ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* 지출 버튼 */}
          {txForm.category !== '저축' && (
            <>
              <button onClick={() => handleAddExpense(false)} style={{ flex: 2, padding: 12, background: '#333', color: '#fff', fontWeight: 'bold', borderRadius: 8, border: 'none' }}>
                💥 지출 (피격)
              </button>
              {/* PMS일 때만 포션 버튼 등장 */}
              {luna.mode === 'pms' && (
                <button onClick={() => handleAddExpense(true)} style={{ flex: 1, padding: 12, background: '#e11d48', color: '#fff', fontWeight: 'bold', borderRadius: 8, border: 'none' }}>
                  🧪 포션 ({user.inventory.potions})
                </button>
              )}
            </>
          )}
          
          {/* 저축 버튼 */}
          {txForm.category === '저축' && (
            <button onClick={handleSaving} style={{ flex: 1, padding: 12, background: '#ffd700', color: '#333', fontWeight: 'bold', borderRadius: 8, border: 'none' }}>
              🔨 저축 강타!
            </button>
          )}
        </div>
      </div>

      {/* 4. 하단 메뉴 (인벤토리 등) */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <button style={{ padding: 12, background: '#fff', border: '1px solid #ddd', borderRadius: 8 }}>🎒 인벤토리</button>
        <button style={{ padding: 12, background: '#fff', border: '1px solid #ddd', borderRadius: 8 }}>🗺️ 월드맵</button>
        <button style={{ padding: 12, background: '#fff', border: '1px solid #ddd', borderRadius: 8 }}>🏰 내 왕국</button>
      </div>

    </div>
  );
};

export default MoneyRoomPage;
