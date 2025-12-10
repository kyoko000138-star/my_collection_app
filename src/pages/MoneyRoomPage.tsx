// src/pages/MoneyRoomPage.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Swords, Shield, Heart, Zap, Map as MapIcon, 
  ShoppingBag, Coffee, Car, BookOpen, Crown 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// MoneyRoomPage.tsx 내부
const MoneyRoomPage: React.FC = () => {

// 1. 설계도 및 로직 가져오기
import { 
  UserState, TransactionLike, ResidueType, 
  MaterialType, Building 
} from '../money/types';
import { calcCycleStatus } from '../money/moneyLuna';
import { 
  calcHP, calcMP, getResidueFromCategory, 
  updateBuildingExp, calcAttackDamage 
} from '../money/moneyGameLogic';
import { getDailyMonster } from '../money/moneyJourney';

// [추가] 현재 화면 탭 상태 ('battle' | 'inventory' | 'map' | 'kingdom')
  const [currentTab, setCurrentTab] = useState<'battle' | 'inventory' | 'map' | 'kingdom'>('battle');

// 초기값 상수 (데이터가 없을 때 사용)
const INITIAL_USER_STATE: UserState = {
  meta: { lastLoginDate: new Date().toISOString().slice(0, 10), lastLoginTime: '00:00', currentYear: 2025, currentMonth: 12 },
  status: { hp: 100, mp: 10, credit: 0 },
  budget: { year: 2025, month: 12, variableBudget: 500000, noSpendTarget: 10, snackRecoveryBudget: 30000 },
  cycle: { lastPeriodStart: '2025-12-01', cycleLength: 28 },
  inventory: { 
    gold: 0, leaf: 0, potions: 3, 
    shards: { record: 0, discipline: 0, freedom: 0 }, 
    items: {}, materials: {}, consumables: {},
    collection: [], equipped: {} 
  },
  buildings: [
    { id: 'main_bank', name: '비상금 창고', type: 'warehouse', level: 1, currentExp: 0, totalSavings: 0, monthStreak: 0 }
  ],
  job: { currentJob: 'novice', tier: 0, exp: 0, unlockedSkills: [] },
  journey: { nodes: [], currentNodeId: 0, routeTheme: 'forest' },
  buffs: {},
};

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const todayStr = today.toISOString().slice(0, 10);

  // ----------------------------------------------------------------
  // 3. 전역 상태 (User State) - 안전한 초기화 로직 적용
  // ----------------------------------------------------------------
  const [user, setUser] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('mr_user_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 저장된 데이터와 초기값을 병합하여 없는 필드(cycle 등) 채워넣기
        return {
          ...INITIAL_USER_STATE,
          ...parsed,
          cycle: parsed.cycle || INITIAL_USER_STATE.cycle,
          inventory: { ...INITIAL_USER_STATE.inventory, ...(parsed.inventory || {}) }
        };
      }
    } catch (e) {
      console.error("데이터 로드 실패, 초기화합니다.", e);
    }
    return INITIAL_USER_STATE;
  });

  // 상태 변경 시 자동 저장
  useEffect(() => {
    localStorage.setItem('mr_user_v3', JSON.stringify(user));
  }, [user]);

  // 임시: 오늘의 거래 내역 (실제로는 별도 state나 DB에서 관리)
  const [todayTransactions, setTodayTransactions] = useState<TransactionLike[]>([]);

  // ----------------------------------------------------------------
  // 4. 엔진 가동 (계산기 돌리기)
  // ----------------------------------------------------------------
  
  // A. 바이오 리듬 엔진 (방어 코드 포함된 moneyLuna 사용)
  const luna = useMemo(() => calcCycleStatus(today, user.cycle), [today, user.cycle]);
  
  // B. 데일리 몬스터 엔진
  const monster = useMemo(() => getDailyMonster(todayTransactions), [todayTransactions]);

  // C. 현재 HP 계산
  const currentHP = useMemo(() => calcHP(user.budget, todayTransactions), [user.budget, todayTransactions]);

  // ----------------------------------------------------------------
  // 5. 액션 핸들러 (사용자 행동 처리)
  // ----------------------------------------------------------------

  const [txForm, setTxForm] = useState({ amount: '', category: '식비', memo: '' });

  // ⚔️ 평타: 앱 켜기 / 눈팅 (Check)
  const handleCheck = () => {
    setUser(prev => ({
      ...prev,
      status: { ...prev.status, mp: Math.min(prev.status.mp + 1, 100) } // MP 회복
    }));
    alert("⚔️ 평타 공격! 몬스터를 견제하고 의지력(MP)을 회복했습니다.");
  };

  // 💥 피격: 지출 발생 (Spend)
  const handleSpend = (usePotion: boolean) => {
    const amount = Number(txForm.amount);
    if (!amount) return alert("금액을 입력해주세요.");

    // 1. 포션 사용 체크
    if (usePotion && user.inventory.potions <= 0) return alert("🧪 포션이 부족합니다!");

    // 2. 잔해(Residue) 획득 로직
    const residue = getResidueFromCategory(txForm.category);
    
    // 3. 상태 업데이트
    setUser(prev => {
      const newMaterials = { ...prev.inventory.materials }; 
      newMaterials[residue as string] = (newMaterials[residue as string] || 0) + 1;

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          potions: usePotion ? prev.inventory.potions - 1 : prev.inventory.potions,
          materials: newMaterials 
        }
      };
    });

    // 4. 거래 내역 저장 (임시)
    const newTx: TransactionLike = {
      id: Date.now().toString(), date: todayStr, type: 'expense',
      category: txForm.category, amount, isRecoverySnack: usePotion, memo: txForm.memo
    };
    setTodayTransactions(prev => [...prev, newTx]);

    // 5. 피드백
    if (usePotion) {
      confetti({ colors: ['#ff69b4', '#fff'] });
      alert(`🧪 포션 사용! 데미지를 막아내고 [${residue}] 잔해를 수습했습니다.`);
    } else {
      alert(`💥 크윽! ${amount} 데미지! [${residue}] 잔해를 획득했습니다.`);
    }
    
    setTxForm({ amount: '', category: '식비', memo: '' });
  };

  // 🔨 강타: 저축 (Save)
  const handleSave = () => {
    const amount = Number(txForm.amount);
    if (!amount) return;

    setUser(prev => {
      // 첫 번째 건물 성장 (예시)
      const updatedBuilding = updateBuildingExp(prev.buildings[0], amount, false);
      const newBuildings = [...prev.buildings];
      newBuildings[0] = updatedBuilding;

      return {
        ...prev,
        buildings: newBuildings,
        inventory: { ...prev.inventory, gold: prev.inventory.gold + Math.floor(amount / 100) } 
      };
    });

    confetti({ colors: ['#ffd700', '#FFA500'] });
    alert(`🔨 저축 강타! 몬스터에게 강력한 데미지! (건물 경험치 +)`);
    setTxForm({ amount: '', category: '저축', memo: '' });
  };

  // ----------------------------------------------------------------
  // 6. UI 렌더링
  // ----------------------------------------------------------------
  
  // 배경색 동적 변경 (PMS일 때 붉은 틴트)
  const bgColor = luna.mode === 'pms' ? '#fff0f5' : luna.mode === 'rest' ? '#f0f8ff' : '#f8f9fa';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, padding: '20px', paddingBottom: '100px', transition: 'background 0.5s' }}>
      
      {/* --- HUD --- */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>{luna.message}</div>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>LV.1 모험가</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>
          <div style={{ color: '#e11d48' }}>HP {currentHP}%</div>
          <div style={{ color: '#3b82f6' }}>MP {user.status.mp} / 10</div>
        </div>
      </header>

      {/* --- 몬스터 카드 --- */}
      <div style={{ 
        backgroundColor: '#fff', borderRadius: 16, padding: 20, textAlign: 'center', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: 20, border: '2px solid #333' 
      }}>
        <div style={{ fontSize: 48, marginBottom: 8, animation: 'bounce 2s infinite' }}>{monster.emoji}</div>
        <div style={{ fontSize: 16, fontWeight: 'bold' }}>{monster.name}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{monster.desc}</div>
        
        {/* HP Bar */}
        <div style={{ width: '100%', height: 8, background: '#eee', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', background: '#ff4444' }} /> 
        </div>
      </div>

      {/* --- 전투 컨트롤러 (입력) --- */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={handleCheck} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: 8, background: '#f9f9f9', fontSize: 12 }}>
            ⚔️ 눈팅 (평타)
          </button>
          <button style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: 8, background: '#f9f9f9', fontSize: 12 }}>
            ✨ 퀘스트 (스킬)
          </button>
        </div>

        {/* 카테고리 선택 */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: 6, marginBottom: 12, paddingBottom: 4 }}>
          {['식비', '쇼핑', '교통', '문화', '저축'].map(cat => (
            <button key={cat} onClick={() => setTxForm({...txForm, category: cat})}
              style={{ 
                padding: '6px 12px', borderRadius: 20, fontSize: 12, whiteSpace: 'nowrap',
                background: txForm.category === cat ? '#333' : '#eee', 
                color: txForm.category === cat ? '#fff' : '#333', border: 'none'
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* 금액 입력 */}
        <input 
          type="number" placeholder="금액 입력" value={txForm.amount} 
          onChange={e => setTxForm({...txForm, amount: e.target.value})}
          style={{ width: '100%', padding: '12px', fontSize: 16, border: '1px solid #ddd', borderRadius: 10, marginBottom: 12 }}
        />

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {txForm.category === '저축' ? (
            <button onClick={handleSave} style={{ flex: 1, padding: '14px', background: '#ffd700', color: '#333', fontWeight: 'bold', border: 'none', borderRadius: 12 }}>
              🔨 저축 강타!
            </button>
          ) : (
            <>
              <button onClick={() => handleSpend(false)} style={{ flex: 2, padding: '14px', background: '#333', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 12 }}>
                💥 지출 (피격)
              </button>
              {luna.mode === 'pms' && (
                <button onClick={() => handleSpend(true)} style={{ flex: 1, padding: '14px', background: '#e11d48', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 12, boxShadow: '0 0 10px #e11d4840' }}>
                  🧪 포션 ({user.inventory.potions})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- 하단 메뉴 (네비게이션) --- */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #eee', padding: '12px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <NavButton icon={<Swords size={20}/>} label="전투" active />
        <NavButton icon={<ShoppingBag size={20}/>} label="인벤토리" />
        <NavButton icon={<MapIcon size={20}/>} label="월드맵" />
        <NavButton icon={<Crown size={20}/>} label="왕국" />
      </div>

    </div>
  );
};

// 하단 버튼 컴포넌트
const NavButton = ({ icon, label, active = false }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: active ? '#333' : '#aaa' }}>
    {icon}
    <span style={{ fontSize: 10, fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
  </div>
);

export default MoneyRoomPage;
