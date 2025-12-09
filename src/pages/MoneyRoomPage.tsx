import React, { useMemo, useState, useEffect } from 'react';
import { 
  Swords, Search, Backpack, Edit2, Shield, CheckSquare, Square, 
  Calendar as CalendarIcon, Gem, Skull, Heart, Scroll, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 컴포넌트 (기존 경로 유지)
import NoSpendBoard from '../components/money/NoSpendBoard';
import JourneyMap from '../components/money/JourneyMap';
import Modal from '../components/ui/Modal'; 

// 로직 (기존 경로 유지)
import { calcLeafPoints, calcHP, calcRPGStats, calcAdvancedXP } from '../money/moneyGameLogic';
import { calcMonsterHp, pickMonsterForCategory, getTopDiscretionaryCategory } from '../money/moneyMonsters';
import { createJourney, evaluateJourney, RouteMode, MoneyJourneyState } from '../money/moneyJourney';
import { calcCycleStatus, CycleSettings, CycleStatus, LunaMode } from '../money/moneyLuna';

// ---- 타입 정의 ----
type TxType = 'expense' | 'income';
interface TransactionLike { id: string; date: string; type: TxType; category: string; amount: number; isEssential?: boolean; isRecoverySnack?: boolean; }
interface InstallmentLike { id: string; name: string; totalAmount: number; paidAmount: number; }
interface DayStatusLike { day: number; isNoSpend: boolean; completedQuests: number; }
interface MonthlyBudgetLike { year: number; month: number; variableBudget: number; noSpendTarget: number; snackRecoveryBudget?: number; }
interface GameItem { id: string; name: string; type: 'loot'|'material'|'consumable'; count: number; desc: string; icon: string; price: number; }
interface BattleQuest { id: number; text: string; done: boolean; damage: number; type: 'daily' | 'one-time'; }

// 📺 [스타일] 레트로 픽셀 스타일 (강제 적용)
const RetroStyle = () => (
  <style>{`
    @import url('https://cdn.jsdelivr.net/gh/DungGeunMo/DungGeunMo/DungGeunMo.css');
    
    * {
      font-family: 'DungGeunMo', sans-serif !important;
      box-sizing: border-box;
      -webkit-font-smoothing: none; /* 폰트 앤티앨리어싱 제거 (거칠게) */
    }

    body {
      background-color: #050505;
    }

    /* 스크롤바 커스텀 */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #000; }
    ::-webkit-scrollbar-thumb { background: #fff; border: 1px solid #000; }

    /* 📺 CRT 모니터 스캔라인 효과 */
    .scanlines {
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0),
        rgba(255,255,255,0) 50%,
        rgba(0,0,0,0.1) 50%,
        rgba(0,0,0,0.1)
      );
      background-size: 100% 4px;
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none; z-index: 9999;
    }

    /* 📦 픽셀 박스 (Pixel Box) - 둥근 모서리 절대 금지 */
    .pixel-box {
      background-color: #000;
      border: 4px solid #fff; /* 굵은 테두리 */
      color: #fff;
      padding: 16px;
      margin-bottom: 20px;
      position: relative;
      box-shadow: 6px 6px 0px #333; /* 각진 그림자 */
    }
    
    /* 빨간 박스 (경고/몬스터/지출) */
    .pixel-box.danger {
      border-color: #ff004d;
      color: #ff004d;
      box-shadow: 6px 6px 0px #5c001b;
    }
    
    /* 파란 박스 (정보/방어) */
    .pixel-box.info {
      border-color: #29adff;
      color: #29adff;
      box-shadow: 6px 6px 0px #004569;
    }

    /* 🕹️ 픽셀 버튼 */
    .pixel-btn {
      background-color: #000;
      border: 2px solid #fff;
      color: #fff;
      padding: 10px;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 14px;
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 4px 4px 0px #555;
      transition: all 0.1s;
    }
    .pixel-btn:active {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0px #555;
    }
    /* 중요 버튼 (채워진 스타일) */
    .pixel-btn.primary {
      background-color: #fff;
      color: #000;
      font-weight: bold;
    }
    .pixel-btn.danger {
      border-color: #ff004d;
      color: #ff004d;
      box-shadow: 4px 4px 0px #5c001b;
    }
    .pixel-btn.danger:hover {
      background-color: #ff004d;
      color: #000;
    }

    /* ⌨️ 인풋 창 (터미널 느낌) */
    .pixel-input, .pixel-select {
      background: #111;
      border: 2px solid #fff;
      color: #0f0; /* 해커 느낌 형광초록 */
      font-family: 'DungGeunMo';
      padding: 10px;
      width: 100%;
      outline: none;
      margin-bottom: 8px;
    }
    .pixel-input::placeholder { color: #444; }
    .pixel-input:focus { border-color: #0f0; }

    /* 탭 메뉴 */
    .pixel-tab {
      background: #000;
      border: 2px solid #555;
      color: #555;
      padding: 10px;
      flex: 1;
      cursor: pointer;
      text-align: center;
    }
    .pixel-tab.active {
      border-color: #fff;
      color: #fff;
      background: #222;
      border-bottom: none; /* 연결된 느낌 */
      font-weight: bold;
    }
  `}</style>
);

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  
  // 🔹 UI 상태
  const [activeTab, setActiveTab] = useState<'status' | 'adventure'>('status'); 
  const [activeModal, setActiveModal] = useState<'inventory' | 'calendar' | 'budget_edit' | 'saving' | null>(null);
  const [inventoryTab, setInventoryTab] = useState<'equip' | 'loot' | 'collection'>('equip');
  const [location, setLocation] = useState<'field' | 'village'>('field');
  const [farmMessage, setFarmMessage] = useState<string | null>(null);
  
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);

  // 🔹 데이터 상태
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
    { id: 1, text: '가계부 기록', done: false, damage: 30, type: 'daily' },
    { id: 2, text: '지출 방어 계획', done: false, damage: 40, type: 'daily' },
    { id: 3, text: '충동구매 참기', done: false, damage: 50, type: 'daily' },
    { id: 4, text: '냉장고 파먹기', done: false, damage: 100, type: 'one-time' },
  ]);

  const [txForm, setTxForm] = useState({ 
    date: today.toISOString().slice(0, 10), type: 'expense' as TxType, category: '', amount: '', isEssential: false, isRecoverySnack: false
  });

  const [savingAmountInput, setSavingAmountInput] = useState('');

  // ---------------- [로직 연동] ----------------
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>({ lastPeriodStart: '2025-11-25', cycleLength: 33, manualMode: null });
  const cycleStatus = useMemo(() => calcCycleStatus(today, cycleSettings), [today, cycleSettings]);
  const lunaMode = cycleStatus.mode;

  const [routeMode, setRouteMode] = useState<RouteMode>('calm');
  const [journey, setJourney] = useState<MoneyJourneyState>(() => createJourney('calm'));

  const handleRouteChange = (newMode: RouteMode) => {
    setRouteMode(newMode);
    setJourney(prev => {
      const newMap = createJourney(newMode);
      const safeNodeId = Math.min(prev.currentNodeId, newMap.nodes.length - 1);
      return { ...newMap, currentNodeId: safeNodeId };
    });
  };

  useEffect(() => {
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const noSpendDays = dayStatuses.filter((d) => d.isNoSpend).length;
    const ctx = { variableBudget: monthlyBudget.variableBudget, totalExpense, noSpendDays, dayOfMonth: today.getDate() };
    setJourney(prev => evaluateJourney(prev, ctx));
  }, [monthlyBudget, transactions, dayStatuses, today]);

  // 계산 로직
  const totalLeafPoints = useMemo(() => calcLeafPoints(transactions, dayStatuses, installments), [transactions, dayStatuses, installments]);
  const currentLeaf = Math.max(0, totalLeafPoints - spentLeaf);
  const currentHP = useMemo(() => calcHP(monthlyBudget, transactions), [monthlyBudget, transactions]);
  
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0), [transactions]);
  const remainBudget = monthlyBudget.variableBudget - totalExpense;
  // 체력바 비율 계산 (소수점 제거)
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
  
  // 이펙트
  const triggerAttack = () => { setIsAttacking(true); setTimeout(() => setIsAttacking(false), 500); };
  const triggerDamage = () => { setIsDamaged(true); setTimeout(() => setIsDamaged(false), 500); };

  // ---- 핸들러 ----
  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category || !amountNum) return alert('입력 오류');
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
    // ... 파밍 로직 (간소화)
    setFarmMessage(`무언가 발견!`);
    setTimeout(() => setFarmMessage(null), 1000);
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');

  // 👾 몬스터 카드 렌더링 (인라인 스타일 -> 레트로 박스)
  const renderRetroMonster = () => (
    <div className="pixel-box danger" style={{ textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, border: '1px solid #ff004d', padding: '2px 4px' }}>ENEMY</div>
      <div style={{ fontSize: 20, marginBottom: 10 }}>{monsterInfo.name}</div>
      
      {/* 몬스터 이미지 영역 */}
      <div style={{ 
        height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        animation: isAttacking ? 'shake 0.5s' : 'none',
        filter: isAttacking ? 'invert(1)' : 'none' // 공격받으면 색 반전 (고전게임 효과)
      }}>
        <style>{`@keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }`}</style>
        {/* 몬스터 대신 텍스트 아스키 아트 느낌 or 기본 이미지 */}
        <div style={{ fontSize: 60 }}>
           {monsterInfo.id.includes('shopping') ? '🛍️' : monsterInfo.id.includes('delivery') ? '🐲' : '👻'}
        </div>
      </div>

      {/* 몬스터 체력바 */}
      <div style={{ fontSize: 12, marginBottom: 4, display:'flex', justifyContent:'space-between' }}>
        <span>HP</span>
        <span>{monsterInfo.currentHp}/{monsterInfo.hp}</span>
      </div>
      <div style={{ width: '100%', height: 12, border: '2px solid #fff', padding: 1 }}>
        <div style={{ width: `${(monsterInfo.currentHp / monsterInfo.hp) * 100}%`, height: '100%', background: '#ff004d' }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#fff', paddingBottom: '90px' }}>
      <RetroStyle />
      <div className="scanlines" />

      {/* 🟢 상단 HUD */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 24, color: '#fff' }}>
            {activeTab === 'status' ? '🛡️ STATUS' : '⚔️ FIELD'}
          </div>
          <div style={{ border: '2px solid #ffd700', padding: '4px 8px', color: '#ffd700', fontSize: 14 }}>
             G: {gameGold}
          </div>
        </div>

        {/* 내 HP (예산) */}
        <div style={{ border: '2px solid #fff', padding: 4, marginBottom: 4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
            <span>PLAYER HP (BUDGET)</span>
            <span>{hpPercent}%</span>
          </div>
          <div style={{ width: '100%', height: 16, background: '#333' }}>
            <div style={{ 
              width: `${hpPercent}%`, height: '100%', 
              background: hpPercent < 30 ? '#ff004d' : '#00e436' 
            }} />
          </div>
        </div>
      </div>

      {/* 🟢 탭 메뉴 */}
      <div style={{ display: 'flex', padding: '0 16px', gap: 0, marginBottom: 20 }}>
        <button onClick={() => setActiveTab('status')} className={`pixel-tab ${activeTab === 'status' ? 'active' : ''}`}>
          상태/방어
        </button>
        <button onClick={() => setActiveTab('adventure')} className={`pixel-tab ${activeTab === 'adventure' ? 'active' : ''}`}>
          모험/사냥
        </button>
      </div>

      {/* 🟢 [탭 1] 상태 & 방어 */}
      {activeTab === 'status' && (
        <div style={{ padding: '0 16px' }}>
          
          {/* 생명력 수치 박스 */}
          <div className="pixel-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed #555', paddingBottom: 8, marginBottom: 8 }}>
              <span style={{ color: '#00e436' }}>❤ 잔여 생명력</span>
              <button onClick={openBudgetEdit} style={{ background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:12 }}>[설정]</button>
            </div>
            <div style={{ fontSize: 32, textAlign: 'right', marginBottom: 4 }}>
              {formatMoney(remainBudget)}
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: '#ff004d' }}>
              (피격 데미지: -{formatMoney(totalExpense)})
            </div>
          </div>

          {/* 피격(지출) 기록 */}
          <div className="pixel-box danger">
            <div style={{ color: '#ff004d', marginBottom: 12, display:'flex', alignItems:'center', gap:8 }}>
              <Skull size={16} /> DAMAGE REPORT
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" value={txForm.date} onChange={e => setTxForm(p => ({...p, date: e.target.value}))} className="pixel-input" style={{flex:1}} />
              <select value={txForm.type} onChange={e => setTxForm(p => ({...p, type: e.target.value as TxType}))} className="pixel-select" style={{flex:1}}>
                <option value="expense">피격(지출)</option>
                <option value="income">회복(수입)</option>
              </select>
            </div>
            <input placeholder="원인 (ITEM NAME)" value={txForm.category} onChange={e => setTxForm(p => ({...p, category: e.target.value}))} className="pixel-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="tel" placeholder="데미지 (AMOUNT)" value={txForm.amount} onChange={e => setTxForm(p => ({...p, amount: e.target.value}))} className="pixel-input" style={{flex:2}} />
              <button onClick={handleAddTx} className="pixel-btn danger" style={{flex:1}}>확인</button>
            </div>
          </div>

          {/* 반격 (절약) */}
          <div className="pixel-box info">
            <div style={{ color: '#29adff', marginBottom: 12, display:'flex', alignItems:'center', gap:8 }}>
              <Swords size={16} /> COUNTER ATTACK
            </div>
            
            <button onClick={toggleTodayNoSpend} className={`pixel-btn ${isNoSpendToday ? 'primary' : ''}`} style={{marginBottom:16}}>
              {isNoSpendToday ? "🛡️ 완벽 방어 성공!" : "🛡️ 무지출 방어 (Perfect Guard)"}
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="절약 금액 (반격)" type="tel" value={savingAmountInput} onChange={e => setSavingAmountInput(e.target.value)} className="pixel-input" style={{flex:2, borderColor:'#29adff', color:'#29adff'}} />
              <button onClick={confirmSaving} className="pixel-btn" style={{flex:1, borderColor:'#29adff', color:'#29adff'}}>반격</button>
            </div>
          </div>

          {/* 퀘스트 목록 */}
          <div className="pixel-box">
            <div style={{ marginBottom: 12 }}>📜 QUEST LOG</div>
            {battleQuests.map(q => (
              <div key={q.id} onClick={() => toggleBattleQuest(q.id)} style={{ 
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px', 
                cursor: 'pointer', borderBottom: '1px dashed #333',
                opacity: q.done ? 0.5 : 1, textDecoration: q.done ? 'line-through' : 'none'
              }}>
                {q.done ? <CheckSquare size={16} /> : <Square size={16} />}
                <span style={{ flex: 1, fontSize: 12 }}>{q.text}</span>
                <span style={{ fontSize: 10, color: '#ff004d' }}>-{q.damage} HP</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 🟢 [탭 2] 모험 & 사냥 */}
      {activeTab === 'adventure' && (
        <div style={{ padding: '0 16px' }}>
          {/* 월드맵 (간소화된 픽셀 버전) */}
          <div className="pixel-box" style={{ padding: 10, textAlign: 'center', fontSize: 12, color: '#aaa' }}>
             🗺️ WORLD MAP : {routeMode === 'calm' ? '평온의 숲' : '고통의 던전'} (Lv.{level})
          </div>

          {/* 몬스터 카드 */}
          {renderRetroMonster()}

          {/* 메뉴 버튼 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button onClick={() => setActiveModal('inventory')} className="pixel-btn">
              <Backpack size={16} /> INVENTORY
            </button>
            <button onClick={() => handleFieldSearch()} className="pixel-btn">
              <Search size={16} /> SEARCH
            </button>
          </div>
          {farmMessage && (
            <div style={{ marginTop: 20, textAlign: 'center', color: '#ffd700', border: '2px solid #ffd700', padding: 10, background: '#000' }}>
              {farmMessage}
            </div>
          )}
        </div>
      )}

      {/* 🟢 모달 (인벤토리 등) - 간단하게 렌더링 */}
      <Modal isOpen={activeModal === 'inventory'} onClose={() => setActiveModal(null)} title="INVENTORY">
        <div style={{ padding: 10, background: '#000', color: '#fff', fontFamily: 'DungGeunMo' }}>
           {/* 인벤토리 내용... */}
           <div style={{ borderBottom: '1px dashed #fff', paddingBottom: 8, marginBottom: 8 }}>
             💰 GOLD: {gameGold}
           </div>
           {inventory.map((item, idx) => (
             <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
               <span>{item.icon}</span>
               <span>{item.name} x{item.count}</span>
             </div>
           ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'budget_edit'} onClose={() => setActiveModal(null)} title="SET MAX HP">
         <div style={{ padding: 10 }}>
            <label style={{display:'block', marginBottom:4, fontSize:12}}>MAX HP (월 예산)</label>
            <input className="pixel-input" type="number" value={editBudgetForm.variable} onChange={e => setEditBudgetForm(p => ({...p, variable: e.target.value}))} />
            <button onClick={saveBudget} className="pixel-btn primary" style={{marginTop:10}}>설정 저장</button>
         </div>
      </Modal>

    </div>
  );
};

export default MoneyRoomPage;
