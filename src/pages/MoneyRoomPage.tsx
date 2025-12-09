// src/pages/MoneyRoomPage.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { 
  PenTool, Swords, Sprout, Coffee, Car, ShoppingBag, 
  Moon, Backpack, Shield, Scroll, Edit2, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 컴포넌트 import (경로 유지)
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyQuestCard from '../components/money/MoneyQuestCard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';
import JourneyMap from '../components/money/JourneyMap';
import Modal from '../components/ui/Modal'; 

// 로직 import (아래 2번 항목에서 코드 제공)
import { calcLeafPoints, calcHP, calcRPGStats, calcAdvancedXP } from '../money/moneyGameLogic';
import { calcCycleStatus, CycleSettings } from '../money/moneyLuna';
import { createJourney, evaluateJourney, RouteMode, MoneyJourneyState } from '../money/moneyJourney';

// ---- 타입 정의 ----
type TxType = 'expense' | 'income';
export interface TransactionLike { id: string; date: string; type: TxType; category: string; amount: number; isEssential?: boolean; isRecoverySnack?: boolean; }
export interface DayStatusLike { day: number; isNoSpend: boolean; completedQuests: number; }
interface MonthlyBudgetLike { year: number; month: number; variableBudget: number; noSpendTarget: number; snackRecoveryBudget?: number; }
interface SavingActionTemplate { id: string; name: string; icon: React.ReactNode; defaultAmount: number; }

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  
  // 🔹 [Persistence] 로컬 스토리지에서 데이터 불러오기
  const usePersistedState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    });
    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
  };

  // 🔹 상태 관리
  const [activeTab, setActiveTab] = useState<'record' | 'adventure'>('record');
  const [activeModal, setActiveModal] = useState<'inventory' | 'quest' | 'calendar' | 'saving' | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const [monthlyBudget, setMonthlyBudget] = usePersistedState<MonthlyBudgetLike>('mr_budget', { 
    year: today.getFullYear(), month: today.getMonth() + 1, variableBudget: 500000, noSpendTarget: 10, snackRecoveryBudget: 30000 
  });
  const [transactions, setTransactions] = usePersistedState<TransactionLike[]>('mr_tx', []);
  const [dayStatuses, setDayStatuses] = usePersistedState<DayStatusLike[]>('mr_days', []);
  const [gameGold, setGameGold] = usePersistedState<number>('mr_gold', 0);
  const [realSavings, setRealSavings] = usePersistedState<number>('mr_real_save', 0);
  const [routeMode, setRouteMode] = usePersistedState<RouteMode>('mr_route', 'calm');
  
  // 여행(Journey) 상태는 복잡해서 별도 처리
  const [journey, setJourney] = useState<MoneyJourneyState>(() => {
    const saved = localStorage.getItem('mr_journey');
    return saved ? JSON.parse(saved) : createJourney('calm');
  });
  useEffect(() => { localStorage.setItem('mr_journey', JSON.stringify(journey)); }, [journey]);

  // 임시 폼 상태
  const [editBudgetForm, setEditBudgetForm] = useState({ variable: '', target: '', snack: '' });
  const [txForm, setTxForm] = useState({ date: today.toISOString().slice(0, 10), type: 'expense' as TxType, category: '', amount: '', isEssential: false, isRecoverySnack: false });
  const [selectedSaving, setSelectedSaving] = useState<SavingActionTemplate | null>(null);
  const [savingAmountInput, setSavingAmountInput] = useState('');

  // 절약 템플릿
  const savingTemplates: SavingActionTemplate[] = [
    { id: 'coffee', name: '커피 수혈 방어', icon: <Coffee size={14}/>, defaultAmount: 4500 },
    { id: 'taxi', name: '택시 대신 튼튼다리', icon: <Car size={14}/>, defaultAmount: 10000 },
    { id: 'snack', name: '편의점 유혹 저항', icon: <ShoppingBag size={14}/>, defaultAmount: 3000 },
  ];

  // ---------------- [로직 연동] ----------------
  const cycleSettings: CycleSettings = { lastPeriodStart: '2025-08-26', cycleLength: 30 }; // 예시 날짜
  const { mode: lunaMode } = useMemo(() => calcCycleStatus(today, cycleSettings), [today]);

  // 계산 로직
  const currentHP = useMemo(() => calcHP(monthlyBudget, transactions), [monthlyBudget, transactions]);
  const rpgStats = useMemo(() => calcRPGStats(transactions, dayStatuses, gameGold + realSavings / 100), [transactions, dayStatuses, gameGold, realSavings]);
  const { level } = useMemo(() => calcAdvancedXP(rpgStats), [rpgStats]);
  
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0), [transactions]);
  const remainBudget = monthlyBudget.variableBudget - totalExpense;
  const budgetRatio = Math.min(100, Math.max(0, (remainBudget / monthlyBudget.variableBudget) * 100));

  // 진행도 업데이트
  useEffect(() => {
    const ctx = { variableBudget: monthlyBudget.variableBudget, totalExpense, noSpendDays: dayStatuses.filter(d => d.isNoSpend).length, dayOfMonth: today.getDate() };
    setJourney(prev => evaluateJourney(prev, ctx));
  }, [monthlyBudget, totalExpense, dayStatuses, today]);

  const handleRouteChange = (newMode: RouteMode) => {
    setRouteMode(newMode);
    setJourney(createJourney(newMode)); // 루트 변경 시 맵 리셋 (혹은 유지 로직 추가 가능)
  };

  // ---- 핸들러 ----
  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category || !amountNum) return alert('내용과 금액을 입력해주세요.');
    
    // Luna 모드: PMS일 때 회복 간식은 이펙트 다르게
    if (txForm.isRecoverySnack && lunaMode === 'pms') {
       confetti({ particleCount: 50, colors: ['#ff69b4', '#fff'] }); // 핑크색 힐링 이펙트
    } else {
       // 일반 지출 (데미지)
    }

    const newTx: TransactionLike = { 
      id: `${Date.now()}`, date: txForm.date, type: txForm.type, category: txForm.category.trim(), 
      amount: amountNum, isEssential: txForm.isEssential, isRecoverySnack: txForm.isRecoverySnack 
    };
    setTransactions((prev) => [newTx, ...prev]);
    setTxForm((prev) => ({ ...prev, amount: '', category: '', isRecoverySnack: false }));
  };

  const toggleTodayNoSpend = () => {
    const day = today.getDate();
    setDayStatuses((prev) => {
      const existing = prev.find((d) => d.day === day);
      if (!existing || !existing.isNoSpend) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#ffdb4d', '#4dff88', '#4da6ff'] });
      }
      if (!existing) return [...prev, { day, isNoSpend: true, completedQuests: 0 }];
      return prev.map((d) => (d.day === day ? { ...d, isNoSpend: !d.isNoSpend } : d));
    });
  };

  const confirmSaving = () => {
    if (!selectedSaving) return;
    const amount = Number(savingAmountInput.replace(/,/g, ''));
    if (amount > 0) {
      setRealSavings(prev => prev + amount);
      setGameGold(prev => prev + Math.floor(amount / 10)); 
      confetti({ particleCount: 50, origin: { y: 0.6 }, colors: ['#ffd700'] });
    }
    setActiveModal(null); setSelectedSaving(null);
  };

  const startEditBudget = () => {
    setEditBudgetForm({ variable: String(monthlyBudget.variableBudget), target: String(monthlyBudget.noSpendTarget), snack: String(monthlyBudget.snackRecoveryBudget || 0) });
    setIsEditingBudget(true);
  };

  const saveBudget = () => {
    setMonthlyBudget(prev => ({ ...prev, variableBudget: Number(editBudgetForm.variable.replace(/,/g, '')), noSpendTarget: Number(editBudgetForm.target), snackRecoveryBudget: Number(editBudgetForm.snack.replace(/,/g, '')) }));
    setIsEditingBudget(false);
  };
  
  // 데이터 리셋 (디버깅용)
  const handleReset = () => {
    if(confirm('모든 데이터를 초기화하시겠습니까?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');

  // 배경 테마: 던전(월말) vs 마을(월초) vs PMS(붉은끼)
  const getBgColor = () => {
      if (lunaMode === 'pms') return '#fff0f5'; // 옅은 핑크
      if (lunaMode === 'rest') return '#f0f8ff'; // 옅은 블루
      return activeTab === 'record' ? '#fffaf0' : '#222';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: getBgColor(), transition: 'background-color 0.5s ease', paddingBottom: '80px', color: activeTab === 'adventure' ? '#fff' : '#333' }}>
      
      {/* 상단 HUD */}
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
            {activeTab === 'record' ? '📊 관제실' : `Lv.${level} 모험가`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#ffd700', fontWeight: 'bold' }}>{gameGold} G</div>
            <div style={{ width: 80, height: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${currentHP}%`, height: '100%', backgroundColor: currentHP < 30 ? '#ff4444' : '#4da6ff', transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 탭 버튼 */}
      <div style={{ padding: '16px', display: 'flex', gap: 10 }}>
        <button onClick={() => setActiveTab('record')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', backgroundColor: activeTab === 'record' ? '#fff' : 'rgba(255,255,255,0.1)', color: activeTab === 'record' ? '#333' : '#fff', fontWeight: 'bold', boxShadow: activeTab === 'record' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>
          <PenTool size={16} style={{ marginRight: 6 }} /> 기록
        </button>
        <button onClick={() => setActiveTab('adventure')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', backgroundColor: activeTab === 'adventure' ? '#fff' : 'rgba(255,255,255,0.1)', color: activeTab === 'adventure' ? '#333' : '#fff', fontWeight: 'bold', boxShadow: activeTab === 'adventure' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>
          <Swords size={16} style={{ marginRight: 6 }} /> 모험
        </button>
      </div>

      {/* --- RECORD TAB --- */}
      {activeTab === 'record' && (
        <div className="fade-in" style={{ padding: '0 16px' }}>
          {/* Luna Status */}
          <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 12, backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 'bold', color: lunaMode === 'pms' ? '#e11d48' : '#555' }}>
              <Moon size={14} /> {lunaMode === 'normal' ? '평온 주간' : lunaMode === 'pms' ? 'PMS 경보 발령' : '휴식 주간'}
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>{lunaMode === 'pms' ? '회복 포션 사용 가능' : '일반 모드'}</div>
          </div>

          {/* Budget Card */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {!isEditingBudget ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#888' }}>잔여 체력(예산)</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: remainBudget < 0 ? '#ff4444' : '#333' }}>{formatMoney(remainBudget)}원</div>
                  </div>
                  <button onClick={startEditBudget} style={{ background:'none', border:'none', cursor:'pointer' }}><Edit2 size={16} color="#ccc" /></button>
                </div>
                <div style={{ width: '100%', height: 6, backgroundColor: '#f0f0f0', borderRadius: 5, marginTop: 10, overflow:'hidden' }}>
                    <div style={{ width: `${budgetRatio}%`, height: '100%', backgroundColor: budgetRatio < 20 ? '#ff4444' : '#4caf50' }} />
                </div>
              </>
            ) : (
              // Edit Form (축약)
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <input type="number" value={editBudgetForm.variable} onChange={e=>setEditBudgetForm(p=>({...p, variable:e.target.value}))} placeholder="예산" style={{padding:8, border:'1px solid #ddd', borderRadius:8}}/>
                  <div style={{display:'flex', gap:8}}>
                    <button onClick={saveBudget} style={{flex:1, padding:8, backgroundColor:'#333', color:'#fff', border:'none', borderRadius:8}}>저장</button>
                    <button onClick={()=>setIsEditingBudget(false)} style={{flex:1, padding:8, backgroundColor:'#eee', border:'none', borderRadius:8}}>취소</button>
                  </div>
              </div>
            )}
          </div>

          {/* Saving Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
             {savingTemplates.map(t => (
                 <button key={t.id} onClick={() => { setSelectedSaving(t); setSavingAmountInput(String(t.defaultAmount)); setActiveModal('saving'); }} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid #eee', backgroundColor: '#fff', fontSize: 11, color: '#555', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                     <div style={{color:'#2e7d32'}}>{t.icon}</div>{t.name}
                 </button>
             ))}
          </div>

          {/* Input Form */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 30 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 14 }}>📝 지출 기록 (데미지)</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="date" value={txForm.date} onChange={e => setTxForm(p => ({...p, date: e.target.value}))} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 10 }} />
                <select value={txForm.type} onChange={e => setTxForm(p => ({...p, type: e.target.value as TxType}))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: 10 }}><option value="expense">지출</option><option value="income">수입</option></select>
            </div>
            <input placeholder="내용 (예: 편의점)" value={txForm.category} onChange={e => setTxForm(p => ({...p, category: e.target.value}))} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 10, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input type="number" placeholder="금액" value={txForm.amount} onChange={e => setTxForm(p => ({...p, amount: e.target.value}))} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 10 }} />
                <button onClick={handleAddTx} style={{ padding: '0 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 'bold' }}>입력</button>
            </div>
            {/* Luna Mode Option */}
            <div style={{ display: 'flex', gap: 12, fontSize: 12, alignItems:'center' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                 <input type="checkbox" checked={txForm.isEssential} onChange={e => setTxForm(p => ({...p, isEssential: e.target.checked}))} /> 필수 지출
               </label>
               {lunaMode === 'pms' && (
                 <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#e11d48', fontWeight:'bold' }}>
                   <input type="checkbox" checked={txForm.isRecoverySnack} onChange={e => setTxForm(p => ({...p, isRecoverySnack: e.target.checked}))} /> 💊 회복 포션 사용
                 </label>
               )}
            </div>
          </div>
          
          <div style={{textAlign:'center', paddingBottom: 20}}>
            <button onClick={handleReset} style={{fontSize:10, color:'#aaa', border:'none', background:'none', textDecoration:'underline', cursor:'pointer'}}>데이터 초기화</button>
          </div>
        </div>
      )}

      {/* --- ADVENTURE TAB --- */}
      {activeTab === 'adventure' && (
        <div className="fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <JourneyMap journey={journey} onChangeRoute={handleRouteChange} />
          <MoneyMonsterCard transactions={transactions} dayStatuses={dayStatuses} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <button onClick={() => setActiveModal('inventory')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#444', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><Backpack size={20} /> 가방</button>
            <button onClick={() => setActiveModal('quest')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><Scroll size={20} /> 의뢰</button>
            <button onClick={() => setActiveModal('calendar')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#ff4444', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><Shield size={20} /> 방어전</button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={activeModal === 'inventory'} onClose={() => setActiveModal(null)} title="🎒 모험가의 가방">
        <MoneyWeaponCard transactions={transactions} dayStatuses={dayStatuses} savedAmount={gameGold + (realSavings/100)} />
      </Modal>
      <Modal isOpen={activeModal === 'saving'} onClose={() => setActiveModal(null)} title="절약 기록">
        <div style={{textAlign:'center', padding:'20px 0'}}>
           <div style={{fontSize:40, marginBottom:10}}>{selectedSaving?.icon}</div>
           <div style={{fontSize:16, fontWeight:'bold', marginBottom:20}}>{selectedSaving?.name}</div>
           <input type="number" value={savingAmountInput} onChange={(e) => setSavingAmountInput(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: 18, border: '2px solid #4caf50', borderRadius: 12, marginBottom: 20 }} autoFocus />
           <button onClick={confirmSaving} style={{ width: '100%', padding: '14px', backgroundColor: '#4caf50', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 12 }}>확인 (+골드 획득)</button>
        </div>
      </Modal>
      <Modal isOpen={activeModal === 'quest'} onClose={() => setActiveModal(null)} title="📜 길드 의뢰서">
        <MoneyQuestCard isNoSpendToday={dayStatuses.some(d => d.day === today.getDate() && d.isNoSpend)} hasTxToday={transactions.some(t => t.date === today.toISOString().slice(0, 10))} />
      </Modal>
      <Modal isOpen={activeModal === 'calendar'} onClose={() => setActiveModal(null)} title="⚔️ 이번 달 방어 기록">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#666' }}>오늘 지출이 없었다면?</span>
          <button onClick={toggleTodayNoSpend} style={{ padding: '6px 12px', borderRadius: 20, border: 'none', backgroundColor: '#ff4444', color: '#fff', fontSize: 12, cursor: 'pointer' }}>🔥 방어 성공 체크</button>
        </div>
        <NoSpendBoard dayStatuses={dayStatuses} lunaMode={lunaMode} />
      </Modal>

    </div>
  );
};

export default MoneyRoomPage;
