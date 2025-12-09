import React, { useMemo, useState, useEffect } from 'react';
import { 
  Swords, Search, Moon, Backpack, Edit2, Shield, CheckSquare, Square, 
  Calendar as CalendarIcon, Gem, Skull, Heart, Scroll
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 컴포넌트
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';
import JourneyMap from '../components/money/JourneyMap';
import FogOverlay from '../components/effects/FogOverlay';
import Modal from '../components/ui/Modal'; 

// 로직
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

// [NEW] 인벤토리 아이템 타입
type ItemType = 'loot' | 'material' | 'consumable';
interface GameItem { id: string; name: string; type: ItemType; count: number; desc: string; icon: string; price: number; }

// [NEW] 전투 퀘스트 (투두리스트)
interface BattleQuest { id: number; text: string; done: boolean; damage: number; type: 'daily' | 'one-time'; }

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  
  // 🔹 UI 상태
  const [activeTab, setActiveTab] = useState<'status' | 'adventure'>('status'); // hq -> status (상태창)
  const [activeModal, setActiveModal] = useState<'inventory' | 'calendar' | 'budget_edit' | 'saving' | null>(null);
  const [inventoryTab, setInventoryTab] = useState<'equip' | 'loot' | 'collection'>('equip');
  const [location, setLocation] = useState<'field' | 'village'>('field');
  const [farmMessage, setFarmMessage] = useState<string | null>(null);
  
  // 애니메이션 트리거 상태
  const [isAttacking, setIsAttacking] = useState(false); // 내가 때림 (절약)
  const [isDamaged, setIsDamaged] = useState(false); // 내가 맞음 (지출)

  // 🔹 데이터 상태
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetLike>({ 
    year: today.getFullYear(), month: today.getMonth() + 1, variableBudget: 500_000, noSpendTarget: 10, snackRecoveryBudget: 30_000 
  });
  // 예산 수정 폼
  const [editBudgetForm, setEditBudgetForm] = useState({ variable: '', target: '', snack: '' });

  const [transactions, setTransactions] = useState<TransactionLike[]>([]);
  const [installments, setInstallments] = useState<InstallmentLike[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatusLike[]>([]);
  
  // 게임 재화 (현실 돈과 분리됨)
  const [gameGold, setGameGold] = useState(0); 
  const [spentLeaf, setSpentLeaf] = useState(0);
  const [energy, setEnergy] = useState(5);
  const [realSavings, setRealSavings] = useState(0); // 현실 절약 누적액 (공격력)

  // [NEW] 인벤토리 상태 (전리품 등)
  const [inventory, setInventory] = useState<GameItem[]>([
    { id: 'potion', name: '비상금 물약', type: 'consumable', count: 1, desc: '급할 때 쓰는 비상금.', icon: '🧪', price: 0 },
  ]);

  // [NEW] 전투 퀘스트 (투두리스트) - 공격 행동
  const [battleQuests, setBattleQuests] = useState<BattleQuest[]>([
    { id: 1, text: '가계부 정리 (기본 공격)', done: false, damage: 30, type: 'daily' },
    { id: 2, text: '내일 지출 방어 계획', done: false, damage: 40, type: 'daily' },
    { id: 3, text: '충동구매 참기 1회', done: false, damage: 50, type: 'daily' },
    { id: 4, text: '냉장고 파먹기 (강공)', done: false, damage: 100, type: 'one-time' },
  ]);

  const [txForm, setTxForm] = useState({ 
    date: today.toISOString().slice(0, 10), type: 'expense' as TxType, category: '', amount: '', isEssential: false, isRecoverySnack: false
  });

  // 절약 입력용 상태
  const [savingAmountInput, setSavingAmountInput] = useState('');

  // ---------------- [로직 연동] ----------------
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>({
    lastPeriodStart: '2025-11-25', cycleLength: 33, manualMode: null,
  });
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
    const ctx = {
      variableBudget: monthlyBudget.variableBudget, totalExpense, noSpendDays, dayOfMonth: today.getDate(),
    };
    setJourney(prev => evaluateJourney(prev, ctx));
  }, [monthlyBudget, transactions, dayStatuses, today]);

  // 계산 로직
  const totalLeafPoints = useMemo(() => calcLeafPoints(transactions, dayStatuses, installments), [transactions, dayStatuses, installments]);
  const currentLeaf = Math.max(0, totalLeafPoints - spentLeaf);
  const currentHP = useMemo(() => calcHP(monthlyBudget, transactions), [monthlyBudget, transactions]);
  const rpgStats = useMemo(() => calcRPGStats(transactions, dayStatuses, gameGold + realSavings / 100), [transactions, dayStatuses, gameGold, realSavings]);
  const { currentExp, level } = useMemo(() => calcAdvancedXP(rpgStats, installments), [rpgStats, installments]);
  
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0), [transactions]);
  const remainBudget = monthlyBudget.variableBudget - totalExpense;
  const budgetRatio = Math.min(100, Math.max(0, (remainBudget / monthlyBudget.variableBudget) * 100));

  const monsterInfo = useMemo(() => {
    const cat = getTopDiscretionaryCategory(transactions);
    const mon = pickMonsterForCategory(cat);
    const noSpendDays = dayStatuses.filter(d => d.isNoSpend).length;
    
    // 유저의 공격력 합산 (퀘스트 + 무지출 + 절약액)
    const questDamage = battleQuests.filter(q => q.done).reduce((sum, q) => sum + q.damage, 0);
    const criticalDamage = noSpendDays * 300; // 무지출은 강력한 한방
    const savingDamage = Math.floor(realSavings / 100); // 100원 절약당 1데미지

    const baseHp = calcMonsterHp(mon, { noSpendDays: 0 }); // 순수 몬스터 체력
    const finalHp = Math.max(0, baseHp - questDamage - criticalDamage - savingDamage);

    return { ...mon, currentHp: finalHp, hp: baseHp, isDead: finalHp <= 0 };
  }, [transactions, dayStatuses, battleQuests, realSavings]);

  const isNoSpendToday = useMemo(() => dayStatuses.some(d => d.day === today.getDate() && d.isNoSpend), [dayStatuses, today]);
  
  // 이펙트 트리거
  const triggerAttack = () => { setIsAttacking(true); setTimeout(() => setIsAttacking(false), 500); };
  const triggerDamage = () => { setIsDamaged(true); setTimeout(() => setIsDamaged(false), 500); };

  // ---- 핸들러 ----
  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category || !amountNum) return alert('내용과 금액을 입력해주세요.');
    
    const newTx: TransactionLike = { 
      id: `${Date.now()}`, date: txForm.date, type: txForm.type, category: txForm.category.trim(), amount: amountNum, isEssential: txForm.isEssential, isRecoverySnack: txForm.isRecoverySnack
    };
    setTransactions((prev) => [newTx, ...prev]);
    setTxForm((prev) => ({ ...prev, amount: '', category: '', isRecoverySnack: false }));
    
    if (newTx.type === 'expense') {
      triggerDamage(); // 지출 = 내가 아픔 (피격)
    } else {
      triggerAttack(); // 수입 = 회복? 일단 긍정적 효과
    }
  };

  // 무지출 토글 (필살기)
  const toggleTodayNoSpend = () => {
    const day = today.getDate();
    setDayStatuses((prev) => {
      const existing = prev.find((d) => d.day === day);
      if (existing && existing.isNoSpend) {
        return prev.map((d) => (d.day === day ? { ...d, isNoSpend: false } : d));
      }
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#4dff88', '#3b82f6'] });
      triggerAttack(); // 무지출 = 몬스터에게 크리티컬!
      if (!existing) return [...prev, { day, isNoSpend: true, completedQuests: 0 }];
      return prev.map((d) => (d.day === day ? { ...d, isNoSpend: true } : d));
    });
  };

  // 퀘스트 토글 (평타)
  const toggleBattleQuest = (id: number) => {
    setBattleQuests(prev => prev.map(q => {
      if (q.id === id) {
        if (!q.done) triggerAttack(); // 퀘스트 완료 = 공격
        return { ...q, done: !q.done };
      }
      return q;
    }));
  };

  // 직접 절약 입력 (반격)
  const confirmSaving = () => {
    const amount = Number(savingAmountInput.replace(/,/g, ''));
    if (amount > 0) {
      setRealSavings(prev => prev + amount);
      setGameGold(prev => prev + Math.floor(amount / 10)); // 보상은 게임 골드로
      confetti({ particleCount: 50, origin: { y: 0.6 }, colors: ['#ffd700'] });
      triggerAttack(); // 절약 = 몬스터 타격
    }
    setActiveModal(null);
    setSavingAmountInput('');
  };

  const addToInventory = (newItem: Omit<GameItem, 'count'>) => {
    setInventory(prev => {
      const existing = prev.find(i => i.id === newItem.id);
      if (existing) {
        return prev.map(i => i.id === newItem.id ? { ...i, count: i.count + 1 } : i);
      }
      return [...prev, { ...newItem, count: 1 }];
    });
  };

  const handleFieldSearch = () => {
    if (energy <= 0) { setFarmMessage('⚡ 행동력이 부족합니다!'); setTimeout(() => setFarmMessage(null), 1500); return; }
    setEnergy(p => p - 1);
    
    const roll = Math.random();
    let loot: Omit<GameItem, 'count'> | null = null;
    let gold = 0;

    if (roll < 0.4) {
      loot = { id: 'weed', name: '잡초', type: 'material', desc: '흔한 풀.', icon: '🌿', price: 5 };
      gold = 5;
    } else if (roll < 0.7) {
      loot = { id: 'glass', name: '유리조각', type: 'material', desc: '반짝이는 쓰레기.', icon: '✨', price: 20 };
      gold = 20;
    } else if (roll < 0.9) {
      loot = { id: 'coin', name: '오래된 동전', type: 'loot', desc: '누군가 흘린 돈.', icon: '🪙', price: 100 };
      gold = 100;
    } else {
      loot = { id: 'chest', name: '보물상자', type: 'loot', desc: '대박이다!', icon: '📦', price: 500 };
      gold = 500;
    }

    setFarmMessage(`${loot.icon} ${loot.name} 획득!`);
    addToInventory(loot);
    setGameGold(p => p + gold);
    setTimeout(() => setFarmMessage(null), 2000);
  };

  const openBudgetEdit = () => {
    setEditBudgetForm({
      variable: String(monthlyBudget.variableBudget), target: String(monthlyBudget.noSpendTarget), snack: String(monthlyBudget.snackRecoveryBudget || 0)
    });
    setActiveModal('budget_edit');
  };
  const saveBudget = () => {
    setMonthlyBudget(prev => ({ ...prev, variableBudget: Number(editBudgetForm.variable.replace(/,/g, '')), noSpendTarget: Number(editBudgetForm.target), snackRecoveryBudget: Number(editBudgetForm.snack.replace(/,/g, '')) }));
    setActiveModal(null);
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');

  return (
    <div style={{ 
      minHeight: '100vh', backgroundColor: location === 'village' ? '#fffaf0' : '#222',
      color: location === 'field' ? '#fff' : '#333',
      transition: 'background-color 0.5s ease', paddingBottom: '90px', position: 'relative',
      // 피격 시 붉은 효과 (내가 맞았을 때)
      boxShadow: isDamaged ? 'inset 0 0 50px rgba(255,0,0,0.5)' : 'none'
    }}>
      
      {lunaMode === 'pms' && <FogOverlay />}

      {/* 🔹 상단 HUD */}
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
            {activeTab === 'status' ? '🛡️ 내 상태 (Status)' : (location === 'field' ? '⚔️ 야생의 땅' : '🛖 마을')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#ffd700', fontWeight: 'bold', display:'flex', alignItems:'center', gap:2 }}>
              <Gem size={12}/> {gameGold}
            </div>
            {/* 플레이어 HP (예산) */}
            <div style={{ width: 80, height: 10, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden', border:'1px solid #555' }}>
              <div style={{ width: `${currentHP}%`, height: '100%', backgroundColor: currentHP < 30 ? '#ef4444' : '#10b981', transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 탭 컨트롤 */}
      <div style={{ padding: '16px', display: 'flex', gap: 10, position: 'relative', zIndex: 10 }}>
        <button onClick={() => setActiveTab('status')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: activeTab === 'status' ? '#fff' : 'rgba(255,255,255,0.1)', color: activeTab === 'status' ? '#333' : '#999', fontWeight: 'bold', transition:'all 0.2s', boxShadow: activeTab === 'status' ? '0 4px 0 #ddd' : 'none', transform: activeTab === 'status' ? 'translateY(-2px)' : 'none' }}>
          <Shield size={16} style={{ marginBottom: -2, marginRight: 6 }} /> 상태 & 방어
        </button>
        <button onClick={() => setActiveTab('adventure')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: activeTab === 'adventure' ? '#fff' : 'rgba(255,255,255,0.1)', color: activeTab === 'adventure' ? '#333' : '#999', fontWeight: 'bold', transition:'all 0.2s', boxShadow: activeTab === 'adventure' ? '0 4px 0 #ddd' : 'none', transform: activeTab === 'adventure' ? 'translateY(-2px)' : 'none' }}>
          <Swords size={16} style={{ marginBottom: -2, marginRight: 6 }} /> 모험 & 사냥
        </button>
      </div>

      {/* ========== [탭 1: 상태 & 방어 (Status)] ========== */}
      {activeTab === 'status' && (
        <div className="fade-in" style={{ padding: '0 16px', color: '#333', position: 'relative', zIndex: 10 }}>
          
          {/* 1. HP (예산) 카드 - 용어 변경됨 */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border:'1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: '#888', fontWeight:'bold', display:'flex', alignItems:'center', gap:4 }}>
                  <Heart size={12} fill="#ef4444" color="#ef4444"/> 현재 생명력 (잔액)
                </div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: remainBudget < 0 ? '#ff4444' : '#333', marginTop: 4 }}>
                  {formatMoney(remainBudget)}
                </div>
              </div>
              <button onClick={openBudgetEdit} style={{ padding: 8, borderRadius: 8, border: '1px solid #eee', backgroundColor: '#f9f9f9', cursor: 'pointer', color:'#555' }}>
                <Edit2 size={14} /> <span style={{fontSize:11}}>최대체력 설정</span>
              </button>
            </div>
            {/* 게이지 */}
            <div style={{ width: '100%', height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: `${budgetRatio}%`, height: '100%', backgroundColor: budgetRatio < 20 ? '#ef4444' : '#10b981', transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: 11, color: '#aaa', textAlign:'right' }}>
               누적 데미지(지출): -{formatMoney(totalExpense)} / Max HP: {formatMoney(monthlyBudget.variableBudget)}
            </div>
          </div>

          {/* 2. 데미지 로그 (지출 입력) - 피격 개념 적용 */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fee2e2', marginBottom: 16, border:'1px solid #fecaca' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 14, color:'#b91c1c', display:'flex', alignItems:'center', gap:6 }}>
              <Skull size={16} /> 피격(지출) 기록
            </div>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="date" value={txForm.date} onChange={e => setTxForm(p => ({...p, date: e.target.value}))} style={{ flex: 1, padding: '10px', border: '1px solid #fca5a5', borderRadius: 10, fontSize:12, backgroundColor:'rgba(255,255,255,0.5)' }} />
              <select value={txForm.type} onChange={e => setTxForm(p => ({...p, type: e.target.value as TxType}))} style={{ padding: '10px', border: '1px solid #fca5a5', borderRadius: 10, fontSize:12, backgroundColor:'rgba(255,255,255,0.5)' }}>
                <option value="expense">데미지 (지출)</option>
                <option value="income">회복 (수입)</option>
              </select>
            </div>
            
            <input placeholder="원인 (예: 야식 몬스터)" value={txForm.category} onChange={e => setTxForm(p => ({...p, category: e.target.value}))} style={{ width: '100%', padding: '10px', border: '1px solid #fca5a5', borderRadius: 10, marginBottom: 8, fontSize:13, backgroundColor:'rgba(255,255,255,0.5)' }} />
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input type="tel" placeholder="피해량 (금액)" value={txForm.amount} onChange={e => setTxForm(p => ({...p, amount: e.target.value}))} style={{ flex: 1, padding: '10px', border: '1px solid #fca5a5', borderRadius: 10, fontSize:13, backgroundColor:'rgba(255,255,255,0.5)' }} />
              <button onClick={handleAddTx} style={{ padding: '0 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 'bold', boxShadow:'0 2px 5px rgba(239, 68, 68, 0.4)' }}>기록</button>
            </div>
             <div style={{ display: 'flex', gap: 12, fontSize: 12, color:'#7f1d1d' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor:'pointer' }}>
                 <input type="checkbox" checked={txForm.isEssential} onChange={e => setTxForm(p => ({...p, isEssential: e.target.checked}))} /> 방어불가(필수)
               </label>
               <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: lunaMode === 'normal' ? '#aaa' : '#b91c1c', cursor: lunaMode === 'normal' ? 'default' : 'pointer' }}>
                 <input type="checkbox" checked={txForm.isRecoverySnack} onChange={e => setTxForm(p => ({...p, isRecoverySnack: e.target.checked}))} disabled={lunaMode === 'normal'} /> 포션사용(회복)
               </label>
            </div>
          </div>

          {/* 3. 반격 (절약/무지출) - 공격 개념 적용 */}
          <div style={{ padding: '16px', borderRadius: 20, backgroundColor: '#f0f9ff', marginBottom: 16, border:'1px solid #bae6fd' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#0369a1', marginBottom: 12, display:'flex', alignItems:'center', gap:6 }}>
              <Swords size={16} /> 반격 개시 (Attack)
            </div>
            
            {/* 무지출 (궁극기) */}
            <button 
              onClick={toggleTodayNoSpend}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: isNoSpendToday ? '2px solid #3b82f6' : '2px dashed #93c5fd',
                backgroundColor: isNoSpendToday ? '#3b82f6' : '#fff',
                color: isNoSpendToday ? '#fff' : '#60a5fa',
                fontWeight: 'bold', fontSize: 14, marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s', boxShadow: isNoSpendToday ? '0 5px 15px rgba(59, 130, 246, 0.4)' : 'none'
              }}
            >
              {isNoSpendToday ? "🛡️ 완벽 방어 성공! (Crit!)" : "🛡️ 오늘 완벽 방어 (무지출)"}
            </button>

            {/* 절약 입력 (평타) */}
            <div style={{ display:'flex', gap:8 }}>
              <input 
                 placeholder="절약 금액 (반격 데미지)" 
                 type="tel" 
                 value={savingAmountInput}
                 onChange={(e) => setSavingAmountInput(e.target.value)}
                 style={{ flex:1, padding:'12px', borderRadius:10, border:'1px solid #bae6fd', fontSize:13 }}
              />
              <button onClick={() => { if(savingAmountInput) confirmSaving(); }} style={{ padding:'0 16px', backgroundColor:'#0ea5e9', color:'#fff', border:'none', borderRadius:10, fontWeight:'bold' }}>
                반격
              </button>
            </div>
          </div>

          {/* 4. 전투 기술 (투두) */}
          <div style={{ padding: '16px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16, border:'1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6, color:'#555' }}>
                <Scroll size={16} /> 전투 기술 (Quest)
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {battleQuests.map(q => (
                <div 
                  key={q.id} 
                  onClick={() => toggleBattleQuest(q.id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: 12,
                    backgroundColor: q.done ? '#f3f4f6' : '#fff', cursor: 'pointer',
                    border: '1px solid', borderColor: q.done ? '#eee' : '#e5e7eb',
                    opacity: q.done ? 0.6 : 1, transition: 'all 0.2s'
                  }}
                >
                  {q.done ? <CheckSquare size={18} color="#3b82f6" /> : <Square size={18} color="#ddd" />}
                  <span style={{ fontSize: 13, flex: 1, textDecoration: q.done ? 'line-through' : 'none' }}>{q.text}</span>
                  <span style={{ fontSize: 11, fontWeight: 'bold', color: '#3b82f6', backgroundColor:'#eff6ff', padding:'2px 6px', borderRadius:4 }}>
                    데미지 {q.damage}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========== [탭 2: 모험 (Adventure)] ========== */}
      {activeTab === 'adventure' && (
        <div className="fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 10 }}>
          
          {/* 🗺️ 월드맵 */}
          <JourneyMap journey={journey} onChangeRoute={handleRouteChange} />

          {/* ⚔️ 몬스터 (반격 시 타격 효과) */}
          <div style={{ position: 'relative' }}>
             <MoneyMonsterCard 
                monsterName={monsterInfo.name} currentHp={monsterInfo.currentHp} maxHp={monsterInfo.hp}
                isHit={isAttacking} 
             />
             <div style={{ position: 'absolute', bottom: -20, right: 10, zIndex: 10 }}>
               <button onClick={handleFieldSearch} style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid #fff', backgroundColor: '#4caf50', color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Search size={28} />
               </button>
             </div>
             {farmMessage && (
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px 16px', borderRadius: 20, fontSize: 13, zIndex: 20, whiteSpace:'nowrap', border:'1px solid #4caf50' }}>
                 {farmMessage}
               </div>
             )}
          </div>

          {/* 🎒 메뉴 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setActiveModal('inventory')} style={{ padding: '20px 0', borderRadius: 16, border: 'none', backgroundColor: '#374151', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow:'0 4px 0 #1f2937' }}>
              <Backpack size={24} /> 보급품 (Inventory)
            </button>
            <button onClick={() => setActiveModal('calendar')} style={{ padding: '20px 0', borderRadius: 16, border: 'none', backgroundColor: '#4b5563', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow:'0 4px 0 #374151' }}>
              <CalendarIcon size={24} /> 방어 일지
            </button>
          </div>
        </div>
      )}

      {/* ========== [모달들] ========== */}
      
      {/* 🎒 인벤토리 모달 (분리됨) */}
      <Modal isOpen={activeModal === 'inventory'} onClose={() => setActiveModal(null)} title="🎒 보급품 가방">
        <div style={{ display:'flex', borderBottom:'1px solid #eee', marginBottom:16 }}>
          <button onClick={() => setInventoryTab('equip')} style={{ flex:1, padding:'10px', background:'none', border:'none', borderBottom: inventoryTab === 'equip' ? '2px solid #333' : 'none', fontWeight: inventoryTab === 'equip' ? 'bold' : 'normal', color:'#333' }}>장비</button>
          <button onClick={() => setInventoryTab('loot')} style={{ flex:1, padding:'10px', background:'none', border:'none', borderBottom: inventoryTab === 'loot' ? '2px solid #333' : 'none', fontWeight: inventoryTab === 'loot' ? 'bold' : 'normal', color:'#333' }}>전리품</button>
          <button onClick={() => setInventoryTab('collection')} style={{ flex:1, padding:'10px', background:'none', border:'none', borderBottom: inventoryTab === 'collection' ? '2px solid #333' : 'none', fontWeight: inventoryTab === 'collection' ? 'bold' : 'normal', color:'#333' }}>수집</button>
        </div>

        {inventoryTab === 'equip' && (
          <MoneyWeaponCard transactions={transactions} dayStatuses={dayStatuses} savedAmount={gameGold + (realSavings/100)} />
        )}

        {inventoryTab === 'loot' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {inventory.length === 0 ? (
              <div style={{ gridColumn:'span 2', textAlign:'center', padding:20, color:'#aaa' }}>가방이 비었습니다.<br/>야생을 탐색해보세요!</div>
            ) : (
              inventory.map((item, idx) => (
                <div key={idx} style={{ border:'1px solid #eee', borderRadius:10, padding:10, display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ fontSize:24 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:'bold' }}>{item.name} x{item.count}</div>
                    <div style={{ fontSize:11, color:'#888' }}>{item.desc}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {inventoryTab === 'collection' && (
           <div style={{ textAlign:'center', padding:20, color:'#666', fontSize:13 }}>
             <div style={{ marginBottom:20, padding:10, background:'#f9f9f9', borderRadius:10 }}>
                <span style={{ fontSize:24 }}>🍵</span>
                <div style={{ fontWeight:'bold' }}>수집한 차</div>
                <div style={{ color:'#aaa', fontSize:11 }}>아직 발견된 차가 없습니다.</div>
             </div>
             <div style={{ padding:10, background:'#f9f9f9', borderRadius:10 }}>
                <span style={{ fontSize:24 }}>🪴</span>
                <div style={{ fontWeight:'bold' }}>향 도감</div>
                <div style={{ color:'#aaa', fontSize:11 }}>아직 피운 향이 없습니다.</div>
             </div>
           </div>
        )}
      </Modal>

      {/* ✏️ 예산 수정 모달 */}
      <Modal isOpen={activeModal === 'budget_edit'} onClose={() => setActiveModal(null)} title="📦 최대 체력(예산) 설정">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '10px 0' }}>
           <label style={{ fontSize: 13, fontWeight:'bold', color:'#555' }}>
             최대 체력 (월 예산)
             <input type="text" value={editBudgetForm.variable} onChange={e => setEditBudgetForm(p => ({...p, variable: e.target.value}))} style={{ width: '100%', padding: '12px', marginTop:6, borderRadius:8, border:'1px solid #ddd' }} />
           </label>
           <label style={{ fontSize: 13, fontWeight:'bold', color:'#555' }}>
             방어 목표 일수 (무지출)
             <input type="number" value={editBudgetForm.target} onChange={e => setEditBudgetForm(p => ({...p, target: e.target.value}))} style={{ width: '100%', padding: '12px', marginTop:6, borderRadius:8, border:'1px solid #ddd' }} />
           </label>
           <label style={{ fontSize: 13, fontWeight:'bold', color:'#555' }}>
             회복 포션 예산 (간식)
             <input type="text" value={editBudgetForm.snack} onChange={e => setEditBudgetForm(p => ({...p, snack: e.target.value}))} style={{ width: '100%', padding: '12px', marginTop:6, borderRadius:8, border:'1px solid #ddd' }} />
           </label>
           <button onClick={saveBudget} style={{ width: '100%', padding: '14px', backgroundColor: '#333', color: '#fff', fontWeight:'bold', borderRadius:10, border:'none', marginTop:10 }}>
             설정 완료
           </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'calendar'} onClose={() => setActiveModal(null)} title="🛡️ 방어 일지">
         <NoSpendBoard dayStatuses={dayStatuses as any} lunaMode={lunaMode} />
      </Modal>

    </div>
  );
};

export default MoneyRoomPage;
