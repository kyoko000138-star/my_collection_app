import React, { useMemo, useState, useEffect } from 'react';
import { 
  Swords, Search, Backpack, Edit2, Shield, CheckSquare, Square, 
  Calendar as CalendarIcon, Gem, Skull, Heart, Scroll, RefreshCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 컴포넌트 & 로직 (기존 유지)
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';
import JourneyMap from '../components/money/JourneyMap';
import FogOverlay from '../components/effects/FogOverlay';
import Modal from '../components/ui/Modal'; 

import { calcLeafPoints, calcHP, calcRPGStats, calcAdvancedXP } from '../money/moneyGameLogic';
import { calcMonsterHp, pickMonsterForCategory, getTopDiscretionaryCategory } from '../money/moneyMonsters';
import { createJourney, evaluateJourney, RouteMode, MoneyJourneyState } from '../money/moneyJourney';
import { calcCycleStatus, CycleSettings, CycleStatus, LunaMode } from '../money/moneyLuna';

// 타입 정의
type TxType = 'expense' | 'income';
interface TransactionLike { id: string; date: string; type: TxType; category: string; amount: number; isEssential?: boolean; isRecoverySnack?: boolean; }
interface InstallmentLike { id: string; name: string; totalAmount: number; paidAmount: number; }
interface DayStatusLike { day: number; isNoSpend: boolean; completedQuests: number; }
interface MonthlyBudgetLike { year: number; month: number; variableBudget: number; noSpendTarget: number; snackRecoveryBudget?: number; }
interface GameItem { id: string; name: string; type: 'loot'|'material'|'consumable'; count: number; desc: string; icon: string; price: number; }
interface BattleQuest { id: number; text: string; done: boolean; damage: number; type: 'daily' | 'one-time'; }

// 🎨 [JRPG 스타일] CSS (핵심!)
const JrpgStyle = () => (
  <style>{`
    @import url('https://cdn.jsdelivr.net/gh/DungGeunMo/DungGeunMo/DungGeunMo.css');
    
    * {
      font-family: 'DungGeunMo', sans-serif !important;
      box-sizing: border-box;
    }

    body {
      background-color: #202028; /* 차분한 다크 그레이 */
      color: #fff;
    }

    /* 📦 RPG 윈도우 박스 (픽셀 모서리 구현) */
    .rpg-box {
      background: #363640; /* 윈도우 배경색 */
      position: relative;
      margin-bottom: 24px;
      padding: 16px;
      color: #fff;
      /* CSS box-shadow로 픽셀 테두리 흉내 */
      box-shadow: 
        -4px 0 0 0 #202028, 
        4px 0 0 0 #202028, 
        0 -4px 0 0 #202028, 
        0 4px 0 0 #202028, 
        
        -4px -4px 0 0 #fff, /* 좌상단 코너 */
        4px -4px 0 0 #fff,  /* 우상단 */
        -4px 4px 0 0 #fff,  /* 좌하단 */
        4px 4px 0 0 #fff,   /* 우하단 */
        
        0 0 0 4px #fff;     /* 전체 흰 테두리 */
    }

    /* 🎮 RPG 버튼 */
    .rpg-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%;
      padding: 12px;
      background: #5d5d6a;
      border: none;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      box-shadow: inset 2px 2px 0px rgba(255,255,255,0.5), inset -2px -2px 0px rgba(0,0,0,0.5), 2px 2px 0px #000;
    }
    .rpg-btn:active {
      transform: translate(2px, 2px);
      box-shadow: inset 2px 2px 0px rgba(0,0,0,0.5), inset -2px -2px 0px rgba(255,255,255,0.2);
    }
    
    /* 주요 버튼 (파랑) */
    .rpg-btn.primary { background: #3b82f6; }
    /* 위험 버튼 (빨강) */
    .rpg-btn.danger { background: #ef4444; }

    /* ⌨️ 입력창 */
    .rpg-input {
      width: 100%;
      padding: 10px;
      background: #202028;
      border: 2px solid #5d5d6a;
      color: #fff;
      font-family: 'DungGeunMo';
      outline: none;
      box-shadow: inset 2px 2px 0px rgba(0,0,0,0.5);
    }
    .rpg-input:focus {
      border-color: #ffd700;
      background: #000;
    }

    /* 📑 탭 */
    .rpg-tab-container {
      display: flex; gap: 8px; margin: 0 8px 16px;
    }
    .rpg-tab {
      flex: 1; padding: 10px;
      background: #2d2d35;
      color: #888;
      border: none; cursor: pointer;
      border-radius: 8px 8px 0 0;
      border: 2px solid #202028;
      border-bottom: none;
    }
    .rpg-tab.active {
      background: #363640;
      color: #ffd700;
      font-weight: bold;
      border-color: #fff;
      margin-top: -4px; padding-bottom: 14px; /* 튀어나오는 효과 */
      position: relative; z-index: 1;
    }
  `}</style>
);

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  
  // UI & Data State
  const [activeTab, setActiveTab] = useState<'status' | 'adventure'>('status'); 
  const [activeModal, setActiveModal] = useState<'inventory' | 'calendar' | 'budget_edit' | 'saving' | null>(null);
  const [inventoryTab, setInventoryTab] = useState<'equip' | 'loot' | 'collection'>('equip');
  const [location, setLocation] = useState<'field' | 'village'>('field');
  const [farmMessage, setFarmMessage] = useState<string | null>(null);
  
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);

  // Data State
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetLike>({ 
    year: today.getFullYear(), month: today.getMonth() + 1, variableBudget: 500_000, noSpendTarget: 10, snackRecoveryBudget: 30_000 
  });
  const [editBudgetForm, setEditBudgetForm] = useState({ variable: '', target: '', snack: '' });
  const [transactions, setTransactions] = useState<TransactionLike[]>([]);
  const [installments, setInstallments] = useState<InstallmentLike[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatusLike[]>([]);
  const [gameGold, setGameGold] = useState(0); 
  const [spentLeaf, setSpentLeaf] = useState(0);
  const [energy, setEnergy] = useState(5);
  const [realSavings, setRealSavings] = useState(0); 

  const [inventory, setInventory] = useState<GameItem[]>([
    { id: 'potion', name: '비상금 물약', type: 'consumable', count: 1, desc: '급할 때 쓰는 비상금.', icon: '🧪', price: 0 },
  ]);

  const [battleQuests, setBattleQuests] = useState<BattleQuest[]>([
    { id: 1, text: '가계부 기록 (기본)', done: false, damage: 30, type: 'daily' },
    { id: 2, text: '지출 방어 계획', done: false, damage: 40, type: 'daily' },
    { id: 3, text: '충동구매 참기', done: false, damage: 50, type: 'daily' },
    { id: 4, text: '냉장고 파먹기', done: false, damage: 100, type: 'one-time' },
  ]);

  const [txForm, setTxForm] = useState({ 
    date: today.toISOString().slice(0, 10), type: 'expense' as TxType, category: '', amount: '', isEssential: false, isRecoverySnack: false
  });
  const [savingAmountInput, setSavingAmountInput] = useState('');

  // Logics
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>({ lastPeriodStart: '2025-11-25', cycleLength: 33, manualMode: null });
  const cycleStatus = useMemo(() => calcCycleStatus(today, cycleSettings), [today, cycleSettings]);
  const lunaMode = cycleStatus.mode;

  const [routeMode, setRouteMode] = useState<RouteMode>('calm');
  const [journey, setJourney] = useState<MoneyJourneyState>(() => createJourney('calm'));

  const handleRouteChange = (newMode: RouteMode) => {
    setRouteMode(newMode);
    setJourney(prev => {
      const newMap = createJourney(newMode);
      return { ...newMap, currentNodeId: Math.min(prev.currentNodeId, newMap.nodes.length - 1) };
    });
  };

  useEffect(() => {
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const noSpendDays = dayStatuses.filter((d) => d.isNoSpend).length;
    const ctx = { variableBudget: monthlyBudget.variableBudget, totalExpense, noSpendDays, dayOfMonth: today.getDate() };
    setJourney(prev => evaluateJourney(prev, ctx));
  }, [monthlyBudget, transactions, dayStatuses, today]);

  const currentHP = useMemo(() => calcHP(monthlyBudget, transactions), [monthlyBudget, transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0), [transactions]);
  const remainBudget = monthlyBudget.variableBudget - totalExpense;
  const hpPercent = Math.max(0, Math.min(100, Math.floor((remainBudget / monthlyBudget.variableBudget) * 100)));

  const monsterInfo = useMemo(() => {
    const cat = getTopDiscretionaryCategory(transactions);
    const mon = pickMonsterForCategory(cat);
    const noSpendDays = dayStatuses.filter(d => d.isNoSpend).length;
    const questDamage = battleQuests.filter(q => q.done).reduce((sum, q) => sum + q.damage, 0);
    const criticalDamage = noSpendDays * 300;
    const savingDamage = Math.floor(realSavings / 100);
    const baseHp = calcMonsterHp(mon, { noSpendDays: 0 }); 
    const finalHp = Math.max(0, baseHp - questDamage - criticalDamage - savingDamage);
    return { ...mon, currentHp: finalHp, hp: baseHp, isDead: finalHp <= 0 };
  }, [transactions, dayStatuses, battleQuests, realSavings]);

  const isNoSpendToday = useMemo(() => dayStatuses.some(d => d.day === today.getDate() && d.isNoSpend), [dayStatuses, today]);
  
  // Handlers
  const triggerAttack = () => { setIsAttacking(true); setTimeout(() => setIsAttacking(false), 500); };
  const triggerDamage = () => { setIsDamaged(true); setTimeout(() => setIsDamaged(false), 500); };

  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category || !amountNum) return alert('입력 확인 필요');
    const newTx: TransactionLike = { id: `${Date.now()}`, date: txForm.date, type: txForm.type, category: txForm.category.trim(), amount: amountNum, isEssential: txForm.isEssential, isRecoverySnack: txForm.isRecoverySnack };
    setTransactions((prev) => [newTx, ...prev]);
    setTxForm((prev) => ({ ...prev, amount: '', category: '', isRecoverySnack: false }));
    if (newTx.type === 'expense') triggerDamage(); else triggerAttack();
  };

  const toggleTodayNoSpend = () => {
    const day = today.getDate();
    setDayStatuses((prev) => {
      const existing = prev.find((d) => d.day === day);
      if (existing && existing.isNoSpend) return prev.map((d) => (d.day === day ? { ...d, isNoSpend: false } : d));
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#4dff88', '#3b82f6'] });
      triggerAttack();
      if (!existing) return [...prev, { day, isNoSpend: true, completedQuests: 0 }];
      return prev.map((d) => (d.day === day ? { ...d, isNoSpend: true } : d));
    });
  };

  const toggleBattleQuest = (id: number) => {
    setBattleQuests(prev => prev.map(q => {
      if (q.id === id) {
        if (!q.done) triggerAttack();
        return { ...q, done: !q.done };
      }
      return q;
    }));
  };

  const confirmSaving = () => {
    const amount = Number(savingAmountInput.replace(/,/g, ''));
    if (amount > 0) {
      setRealSavings(prev => prev + amount);
      setGameGold(prev => prev + Math.floor(amount / 10));
      confetti({ particleCount: 50, origin: { y: 0.6 }, colors: ['#ffd700'] });
      triggerAttack();
    }
    setActiveModal(null);
    setSavingAmountInput('');
  };

  const openBudgetEdit = () => {
    setEditBudgetForm({ variable: String(monthlyBudget.variableBudget), target: String(monthlyBudget.noSpendTarget), snack: String(monthlyBudget.snackRecoveryBudget || 0) });
    setActiveModal('budget_edit');
  };
  const saveBudget = () => {
    setMonthlyBudget(prev => ({ ...prev, variableBudget: Number(editBudgetForm.variable.replace(/,/g, '')), noSpendTarget: Number(editBudgetForm.target), snackRecoveryBudget: Number(editBudgetForm.snack.replace(/,/g, '')) }));
    setActiveModal(null);
  };

  const handleFieldSearch = () => {
    if (energy <= 0) { setFarmMessage('행동력 부족'); setTimeout(() => setFarmMessage(null), 1500); return; }
    setEnergy(p => p - 1);
    const items = [{icon:'🌿', name:'잡초', val:5}, {icon:'🪙', name:'동전', val:50}, {icon:'✨', name:'유리조각', val:10}];
    const pick = items[Math.floor(Math.random()*items.length)];
    setFarmMessage(`${pick.icon} ${pick.name} 획득!`);
    setGameGold(p => p + pick.val);
    setTimeout(() => setFarmMessage(null), 1500);
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '90px' }}>
      <JrpgStyle />
      {lunaMode === 'pms' && <FogOverlay />}

      {/* 🔹 상단 헤더 */}
      <div style={{ padding: '16px 16px 0', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 20, color: '#ffd700', textShadow: '2px 2px #000' }}>
            Lv.{Math.floor(gameGold/1000)+1} {activeTab === 'status' ? '방어선' : '전장'}
          </div>
          <div style={{ background:'rgba(0,0,0,0.5)', padding:'4px 8px', borderRadius:4, border:'1px solid #555' }}>
             💰 {gameGold} G
          </div>
        </div>
        
        {/* HP바 */}
        <div style={{ border: '2px solid #fff', height: 20, background: '#000', position:'relative', borderRadius:4, overflow:'hidden', boxShadow:'0 4px 0 rgba(0,0,0,0.3)' }}>
          <div style={{ 
            width: `${hpPercent}%`, height: '100%', 
            background: 'linear-gradient(to bottom, #4ade80, #22c55e)', // 그라데이션으로 입체감
            transition: 'width 0.5s ease'
          }} />
          <div style={{ position:'absolute', top:2, left:0, width:'100%', textAlign:'center', fontSize:10, textShadow:'1px 1px #000' }}>
            HP {hpPercent}%
          </div>
        </div>
      </div>

      {/* 🔹 탭 메뉴 */}
      <div className="rpg-tab-container">
        <button onClick={() => setActiveTab('status')} className={`rpg-tab ${activeTab === 'status' ? 'active' : ''}`}>
          🛡️ 상태/방어
        </button>
        <button onClick={() => setActiveTab('adventure')} className={`rpg-tab ${activeTab === 'adventure' ? 'active' : ''}`}>
          ⚔️ 모험/사냥
        </button>
      </div>

      {/* 🟢 [탭 1] 상태 & 방어 */}
      {activeTab === 'status' && (
        <div className="fade-in" style={{ padding: '0 16px' }}>
          
          {/* 1. HP (예산) */}
          <div className="rpg-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#4ade80' }}>❤ LIFE (잔액)</span>
              <button onClick={openBudgetEdit} style={{ background:'none', border:'none', color:'#aaa', cursor:'pointer' }}><Edit2 size={14}/></button>
            </div>
            <div style={{ fontSize: 32, textAlign: 'right', marginBottom: 4, textShadow:'2px 2px #000' }}>
              {formatMoney(remainBudget)}
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: '#ef4444' }}>
              (누적 피격: -{formatMoney(totalExpense)})
            </div>
          </div>

          {/* 2. 피격 (지출) */}
          <div className="rpg-box" style={{ borderColor: '#ef4444' }}>
            <div style={{ color:'#ef4444', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
              <Skull size={16} /> DAMAGE REPORT (지출)
            </div>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="date" value={txForm.date} onChange={e => setTxForm(p => ({...p, date: e.target.value}))} className="rpg-input" style={{flex:1}} />
              <select value={txForm.type} onChange={e => setTxForm(p => ({...p, type: e.target.value as TxType}))} className="rpg-input" style={{flex:1}}>
                <option value="expense">피격(지출)</option>
                <option value="income">회복(수입)</option>
              </select>
            </div>
            <input placeholder="원인 (ITEM NAME)" value={txForm.category} onChange={e => setTxForm(p => ({...p, category: e.target.value}))} className="rpg-input" style={{marginBottom:8}} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="tel" placeholder="데미지 (AMOUNT)" value={txForm.amount} onChange={e => setTxForm(p => ({...p, amount: e.target.value}))} className="rpg-input" style={{flex:2}} />
              <button onClick={handleAddTx} className="rpg-btn danger" style={{flex:1}}>확인</button>
            </div>
          </div>

          {/* 3. 반격 (절약/무지출) */}
          <div className="rpg-box" style={{ borderColor: '#3b82f6' }}>
            <div style={{ color: '#60a5fa', marginBottom: 12, display:'flex', alignItems:'center', gap:8 }}>
              <Swords size={16} /> COUNTER ATTACK
            </div>
            
            <button onClick={toggleTodayNoSpend} className={`rpg-btn ${isNoSpendToday ? 'primary' : ''}`} style={{marginBottom:16, border:'2px dashed #3b82f6', background: isNoSpendToday ? '#3b82f6' : 'transparent'}}>
              <Shield size={16}/> {isNoSpendToday ? "🛡️ 완벽 방어 성공 (Perfect Guard)" : "🛡️ 오늘 무지출 방어 시도"}
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="절약 금액 (반격)" type="tel" value={savingAmountInput} onChange={e => setSavingAmountInput(e.target.value)} className="rpg-input" style={{flex:2}} />
              <button onClick={confirmSaving} className="rpg-btn primary" style={{flex:1}}>반격</button>
            </div>
          </div>

          {/* 4. 퀘스트 */}
          <div className="rpg-box">
            <div style={{ marginBottom: 12, display:'flex', gap:8, alignItems:'center' }}><Scroll size={16}/> QUEST LOG</div>
            {battleQuests.map(q => (
              <div key={q.id} onClick={() => toggleBattleQuest(q.id)} style={{ 
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px', 
                cursor: 'pointer', borderBottom: '1px dashed #555',
                opacity: q.done ? 0.5 : 1, textDecoration: q.done ? 'line-through' : 'none'
              }}>
                {q.done ? <CheckSquare size={16} color="#4ade80" /> : <Square size={16} color="#888" />}
                <span style={{ flex: 1, fontSize: 12 }}>{q.text}</span>
                <span style={{ fontSize: 10, color: '#ef4444', background:'#202028', padding:'2px 4px', borderRadius:4 }}>-{q.damage} HP</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 🟢 [탭 2] 모험 & 사냥 */}
      {activeTab === 'adventure' && (
        <div style={{ padding: '0 16px' }}>
          
          <JourneyMap journey={journey} onChangeRoute={handleRouteChange} />

          {/* 몬스터 카드 (외부 컴포넌트지만 스타일 덮어씌우기 위해 래핑) */}
          <div className="rpg-box danger" style={{ textAlign: 'center', marginTop:20 }}>
             <div style={{ position:'absolute', top:8, left:8, background:'#ef4444', color:'#fff', fontSize:10, padding:'2px 6px', borderRadius:4 }}>BOSS</div>
             <div style={{ fontSize: 18, marginBottom: 10 }}>{monsterInfo.name}</div>
             <div style={{ fontSize: 60, filter: isAttacking ? 'invert(1)' : 'none', transition:'filter 0.1s' }}>
                {monsterInfo.id.includes('shopping') ? '🛍️' : monsterInfo.id.includes('delivery') ? '🐲' : '👻'}
             </div>
             <div style={{ marginTop:10, border:'2px solid #555', height:12, padding:1 }}>
                <div style={{ width: `${(monsterInfo.currentHp / monsterInfo.hp) * 100}%`, height: '100%', background: '#ef4444' }} />
             </div>
             <div style={{ fontSize:10, marginTop:4 }}>HP {monsterInfo.currentHp}/{monsterInfo.hp}</div>
             
             {farmMessage && (
               <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', background:'#000', border:'1px solid #ffd700', color:'#ffd700', padding:'4px 8px', borderRadius:4, fontSize:12 }}>
                 {farmMessage}
               </div>
             )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button onClick={() => setActiveModal('inventory')} className="rpg-btn">
              <Backpack size={16} /> 인벤토리
            </button>
            <button onClick={() => handleFieldSearch()} className="rpg-btn">
              <Search size={16} /> 탐색하기
            </button>
          </div>
        </div>
      )}

      {/* 🟢 모달 (JRPG 스타일) */}
      <Modal isOpen={activeModal === 'inventory'} onClose={() => setActiveModal(null)} title="INVENTORY">
        <div style={{ padding: 10, background: '#202028', color: '#fff' }}>
           <div style={{ borderBottom: '1px dashed #555', paddingBottom: 8, marginBottom: 8, display:'flex', justifyContent:'space-between' }}>
             <span>💰 GOLD</span>
             <span style={{ color:'#ffd700' }}>{gameGold}</span>
           </div>
           {inventory.map((item, idx) => (
             <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems:'center' }}>
               <div style={{ background:'#000', padding:8, borderRadius:4, border:'1px solid #555' }}>{item.icon}</div>
               <div>
                 <div style={{fontSize:14}}>{item.name} x{item.count}</div>
                 <div style={{fontSize:10, color:'#888'}}>{item.desc}</div>
               </div>
             </div>
           ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'budget_edit'} onClose={() => setActiveModal(null)} title="MAX HP 설정">
         <div style={{ padding: 10, background:'#202028' }}>
            <label style={{display:'block', marginBottom:4, fontSize:12, color:'#aaa'}}>월 예산 (Max HP)</label>
            <input className="rpg-input" type="number" value={editBudgetForm.variable} onChange={e => setEditBudgetForm(p => ({...p, variable: e.target.value}))} />
            <button onClick={saveBudget} className="rpg-btn primary" style={{marginTop:16}}>설정 저장</button>
         </div>
      </Modal>

    </div>
  );
};

export default MoneyRoomPage;
