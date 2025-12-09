import React, { useMemo, useState, useEffect } from 'react';
import { 
  PenTool, Swords, Sprout, Search, Coffee, Car, ShoppingBag, 
  Moon, Backpack, Edit2, Shield, Calendar as CalendarIcon 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 컴포넌트
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyQuestCard from '../components/money/MoneyQuestCard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';
import JourneyMap from '../components/money/JourneyMap';
import FogOverlay from '../components/effects/FogOverlay'; // [NEW] 안개 효과
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
interface SavingActionTemplate { id: string; name: string; icon: React.ReactNode; defaultAmount: number; }

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  
  // 🔹 UI 상태
  const [activeTab, setActiveTab] = useState<'record' | 'adventure'>('record');
  const [activeModal, setActiveModal] = useState<'inventory' | 'quest' | 'saving' | null>(null);
  const [location, setLocation] = useState<'field' | 'village'>('field');
  const [farmMessage, setFarmMessage] = useState<string | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false); // [NEW] 공격 모션 상태

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

  // 🌱 절약 행동 템플릿
  const savingTemplates: SavingActionTemplate[] = [
    { id: 'coffee', name: '커피 대신 물', icon: <Coffee size={14}/>, defaultAmount: 4500 },
    { id: 'taxi', name: '택시 대신 버스', icon: <Car size={14}/>, defaultAmount: 10000 },
    { id: 'snack', name: '편의점 패스', icon: <ShoppingBag size={14}/>, defaultAmount: 3000 },
  ];
  
  const [selectedSaving, setSelectedSaving] = useState<SavingActionTemplate | null>(null);
  const [savingAmountInput, setSavingAmountInput] = useState('');

  // 🔹 입력 폼
  const [txForm, setTxForm] = useState({ 
    date: today.toISOString().slice(0, 10), type: 'expense' as TxType, category: '', amount: '', isEssential: false, isRecoverySnack: false
  });

  // ---------------- [로직 연동] ----------------
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>({
    lastPeriodStart: '2025-11-25', cycleLength: 33, manualMode: null, // 테스트용 날짜 넣어둠
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
      variableBudget: monthlyBudget.variableBudget,
      totalExpense,
      noSpendDays,
      dayOfMonth: today.getDate(),
    };
    setJourney(prev => evaluateJourney(prev, ctx));
  }, [monthlyBudget, transactions, dayStatuses, today]);

  // 계산 로직들
  const totalLeafPoints = useMemo(() => calcLeafPoints(transactions, dayStatuses, installments), [transactions, dayStatuses, installments]);
  const currentLeaf = Math.max(0, totalLeafPoints - spentLeaf);
  const currentHP = useMemo(() => calcHP(monthlyBudget, transactions), [monthlyBudget, transactions]);
  const rpgStats = useMemo(() => calcRPGStats(transactions, dayStatuses, gameGold + realSavings / 100), [transactions, dayStatuses, gameGold, realSavings]);
  const { currentExp, level } = useMemo(() => calcAdvancedXP(rpgStats, installments), [rpgStats, installments]);
  const expRatio = (currentExp / 100) * 100;

  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0), [transactions]);
  const remainBudget = monthlyBudget.variableBudget - totalExpense;
  const budgetRatio = Math.min(100, Math.max(0, (remainBudget / monthlyBudget.variableBudget) * 100));

  const monsterInfo = useMemo(() => {
    const cat = getTopDiscretionaryCategory(transactions);
    const mon = pickMonsterForCategory(cat);
    const noSpendDays = dayStatuses.filter(d => d.isNoSpend).length;
    // 몬스터 HP는 예산/지출 상황에 따라 변함
    const hp = calcMonsterHp(mon, { noSpendDays });
    return { ...mon, currentHp: hp, isDead: hp <= 0 };
  }, [transactions, dayStatuses]);

  const isNoSpendToday = useMemo(() => dayStatuses.some(d => d.day === today.getDate() && d.isNoSpend), [dayStatuses, today]);
  const hasTxToday = useMemo(() => transactions.some(t => t.date === today.toISOString().slice(0, 10)), [transactions, today]);

  const userClass = useMemo(() => {
    if (transactions.length === 0) return { name: '초심자', icon: '🌱' };
    return { name: '모험가', icon: '⚔️' };
  }, [transactions]);

  // ---- [NEW] 공격 이펙트 트리거 ----
  const triggerAttack = () => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 500); // 0.5초간 타격 효과
  };

  // ---- 핸들러 ----
  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category || !amountNum) return alert('입력 확인');
    const newTx: TransactionLike = { 
      id: `${Date.now()}`, date: txForm.date, type: txForm.type, category: txForm.category.trim(), amount: amountNum, isEssential: txForm.isEssential, isRecoverySnack: txForm.isRecoverySnack
    };
    setTransactions((prev) => [newTx, ...prev]);
    setTxForm((prev) => ({ ...prev, amount: '', category: '', isRecoverySnack: false }));
    
    // 공격 발동! (기록 = 공격)
    triggerAttack();
  };

  // [NEW] 무지출 도장 토글 (실수 방지 포함)
  const toggleTodayNoSpend = () => {
    const day = today.getDate();
    setDayStatuses((prev) => {
      const existing = prev.find((d) => d.day === day);
      
      // 1. 이미 체크되어 있으면 -> 취소 (토글)
      if (existing && existing.isNoSpend) {
        return prev.map((d) => (d.day === day ? { ...d, isNoSpend: false } : d));
      }
      
      // 2. 체크 안 되어 있으면 -> 성공!
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#ffdb4d', '#4dff88', '#4da6ff'] });
      triggerAttack(); // 무지출 성공도 공격!

      if (!existing) return [...prev, { day, isNoSpend: true, completedQuests: 0 }];
      return prev.map((d) => (d.day === day ? { ...d, isNoSpend: true } : d));
    });
  };

  const handleSavingClick = (template: SavingActionTemplate) => {
    setSelectedSaving(template);
    setSavingAmountInput(String(template.defaultAmount));
    setActiveModal('saving');
  };

  const confirmSaving = () => {
    if (!selectedSaving) return;
    const amount = Number(savingAmountInput.replace(/,/g, ''));
    if (amount > 0) {
      setRealSavings(prev => prev + amount);
      setGameGold(prev => prev + Math.floor(amount / 10));
      confetti({ particleCount: 50, origin: { y: 0.6 }, colors: ['#4caf50', '#ffd700'] });
      triggerAttack(); // 절약도 공격!
    }
    setActiveModal(null);
    setSelectedSaving(null);
  };

  const startEditBudget = () => {
    setEditBudgetForm({
      variable: String(monthlyBudget.variableBudget), target: String(monthlyBudget.noSpendTarget), snack: String(monthlyBudget.snackRecoveryBudget || 0)
    });
    setIsEditingBudget(true);
  };

  const saveBudget = () => {
    setMonthlyBudget(prev => ({
      ...prev,
      variableBudget: Number(editBudgetForm.variable.replace(/,/g, '')),
      noSpendTarget: Number(editBudgetForm.target),
      snackRecoveryBudget: Number(editBudgetForm.snack.replace(/,/g, ''))
    }));
    setIsEditingBudget(false);
  };

  const handleFieldSearch = () => {
    if (energy <= 0) { setFarmMessage('⚡ 행동력이 부족합니다!'); setTimeout(() => setFarmMessage(null), 1500); return; }
    setEnergy(p => p - 1);
    const rewards = [ { text: '🌿 잡초 (10G)', gold: 10 }, { text: '✨ 유리조각 (50G)', gold: 50 }, { text: '🪙 동전 (100G)', gold: 100 } ];
    const pick = rewards[Math.floor(Math.random() * rewards.length)];
    setFarmMessage(pick.text);
    setGameGold(p => p + pick.gold);
    setTimeout(() => setFarmMessage(null), 2000);
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');

  return (
    <div style={{ 
      minHeight: '100vh', backgroundColor: location === 'village' ? '#fffaf0' : '#222',
      color: location === 'field' ? '#fff' : '#333',
      transition: 'all 0.5s ease',
      paddingBottom: '80px',
      position: 'relative' // 안개 효과용
    }}>
      
      {/* 🌫️ PMS 안개 이펙트 Overlay */}
      {lunaMode === 'pms' && <FogOverlay />}

      {/* 🔹 상단 HUD */}
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', zIndex: 10 }}>
            {activeTab === 'record' ? '📊 가계부 상황실' : (location === 'field' ? '⚔️ 황야' : '🏠 마을')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
            <div style={{ fontSize: 12, color: '#ffd700', fontWeight: 'bold' }}>{gameGold} G</div>
            <div style={{ width: 80, height: 8, backgroundColor: '#444', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${currentHP}%`, height: '100%', backgroundColor: currentHP < 30 ? '#ff4444' : '#4da6ff' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 탭 버튼 */}
      <div style={{ padding: '16px', display: 'flex', gap: 10, zIndex: 10, position: 'relative' }}>
        <button onClick={() => setActiveTab('record')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', backgroundColor: activeTab === 'record' ? '#fff' : 'rgba(255,255,255,0.2)', color: activeTab === 'record' ? '#333' : '#fff', fontWeight: 'bold' }}>
          <PenTool size={16} style={{ marginBottom: -2, marginRight: 6 }} /> 기록 & 방어
        </button>
        <button onClick={() => setActiveTab('adventure')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', backgroundColor: activeTab === 'adventure' ? '#fff' : 'rgba(255,255,255,0.2)', color: activeTab === 'adventure' ? '#333' : '#fff', fontWeight: 'bold' }}>
          <Swords size={16} style={{ marginBottom: -2, marginRight: 6 }} /> 모험 & 가방
        </button>
      </div>

      {/* ========== [탭 1: 기록 & 방어] ========== */}
      {activeTab === 'record' && (
        <div className="fade-in" style={{ padding: '0 16px', color: '#333', position: 'relative', zIndex: 10 }}>
          
          {/* 🌙 Luna 모드 */}
          <div style={{ 
            marginBottom: 16, padding: '8px 12px', borderRadius: 12, backgroundColor: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 'bold', color: '#555' }}>
              <Moon size={14} color={lunaMode === 'pms' ? '#ef4444' : lunaMode === 'rest' ? '#3b82f6' : '#9ca3af'} />
              {lunaMode === 'normal' ? '평온 주간' : lunaMode === 'pms' ? 'PMS 주의보 (안개)' : '휴식 주간'}
            </div>
            {lunaMode === 'pms' && <div style={{ fontSize: 10, color: '#ef4444' }}>안개 속이라 몬스터가 잘 안 보입니다!</div>}
          </div>

          {/* 🛡️ 방어전 (무지출 도장) - 기록 탭으로 이동 */}
          <div style={{ padding: '16px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} color="#3b82f6" /> 오늘의 방어전
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>지출이 없다면 도장을 꾹!</div>
            </div>
            
            {/* 도장 버튼 */}
            <button 
              onClick={toggleTodayNoSpend}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: '2px dashed #ddd',
                backgroundColor: isNoSpendToday ? '#eff6ff' : '#fafafa',
                color: isNoSpendToday ? '#3b82f6' : '#aaa',
                fontWeight: 'bold', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s'
              }}
            >
              {isNoSpendToday ? (
                <>
                  <Shield size={20} fill="#3b82f6" /> 방어 성공! (취소하려면 클릭)
                </>
              ) : (
                <>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #ddd' }} /> 
                  오늘 무지출 성공 체크하기
                </>
              )}
            </button>
          </div>

          {/* 1. 예산 카드 */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {!isEditingBudget ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#888' }}>이번 달 남은 예산</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: remainBudget < 0 ? '#ff4444' : '#333', marginTop: 4 }}>
                      {formatMoney(remainBudget)}원
                    </div>
                  </div>
                  <button onClick={startEditBudget} style={{ padding: 6, borderRadius: '50%', border: 'none', backgroundColor: '#f5f5f5', cursor: 'pointer' }}>
                    <Edit2 size={14} color="#666" />
                  </button>
                </div>
                <div style={{ width: '100%', height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ width: `${budgetRatio}%`, height: '100%', backgroundColor: budgetRatio < 20 ? '#ff4444' : '#4caf50', transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}>
                  <span>쓴 돈: {formatMoney(totalExpense)}</span>
                  <span>총 예산: {formatMoney(monthlyBudget.variableBudget)}</span>
                </div>
              </>
            ) : (
              // 수정 폼 (생략 - 위와 동일)
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* ... (위 코드 복붙) ... */}
                <button onClick={saveBudget} style={{ padding: 10, backgroundColor: '#333', color:'#fff', border:'none', borderRadius:8 }}>저장</button>
              </div>
            )}
          </div>

          {/* 2. 절약 행동 (공격) */}
          <div style={{ padding: '16px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sprout size={16} color="#4caf50" /> 절약은 최고의 공격
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {savingTemplates.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => handleSavingClick(item)}
                  style={{ 
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 0', borderRadius: 12, border: '1px solid #eee', backgroundColor: '#fafafa', cursor: 'pointer'
                  }}
                >
                  <div style={{ color: '#2e7d32' }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{item.name}</div>
                </button>
              ))}
            </div>
            {realSavings > 0 && <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#2e7d32' }}>오늘 총 {formatMoney(realSavings)}원 방어함!</div>}
          </div>

          {/* 3. 지출 기록 (공격) */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 14 }}>💸 기록도 공격이다 (지출 입력)</div>
            {/* ...입력 폼... */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="date" value={txForm.date} onChange={e => setTxForm(p => ({...p, date: e.target.value}))} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 10 }} />
              <select value={txForm.type} onChange={e => setTxForm(p => ({...p, type: e.target.value as TxType}))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: 10 }}>
                <option value="expense">지출</option>
                <option value="income">수입</option>
              </select>
            </div>
            <input placeholder="내용" value={txForm.category} onChange={e => setTxForm(p => ({...p, category: e.target.value}))} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 10, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input placeholder="금액" value={txForm.amount} onChange={e => setTxForm(p => ({...p, amount: e.target.value}))} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 10 }} />
              <button onClick={handleAddTx} style={{ padding: '0 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 'bold' }}>입력</button>
            </div>
            {/* 체크박스들 */}
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                 <input type="checkbox" checked={txForm.isEssential} onChange={e => setTxForm(p => ({...p, isEssential: e.target.checked}))} /> 필수
               </label>
               <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: lunaMode === 'normal' ? '#ccc' : '#e11d48' }}>
                 <input type="checkbox" checked={txForm.isRecoverySnack} onChange={e => setTxForm(p => ({...p, isRecoverySnack: e.target.checked}))} disabled={lunaMode === 'normal'} /> 회복 간식
               </label>
            </div>
          </div>
        </div>
      )}

      {/* ========== [탭 2: 모험 & 가방] ========== */}
      {activeTab === 'adventure' && (
        <div className="fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 10 }}>
          
          {/* 🗺️ 월드맵 (이미지 적용 가능하게 교체) */}
          <JourneyMap journey={journey} onChangeRoute={handleRouteChange} />

          {/* ⚔️ 몬스터 (이미지 적용 + 공격 효과) */}
          <div style={{ position: 'relative' }}>
             <MoneyMonsterCard 
                monsterName={monsterInfo.name}
                currentHp={monsterInfo.currentHp}
                maxHp={monsterInfo.hp}
                isHit={isAttacking} // 공격 상태 전달
             />
             <div style={{ position: 'absolute', bottom: -20, right: 10, zIndex: 10 }}>
               <button onClick={handleFieldSearch} style={{ width: 50, height: 50, borderRadius: '50%', border: '4px solid #fff', backgroundColor: '#4caf50', color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Search size={24} />
               </button>
             </div>
             {farmMessage && (
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12, zIndex: 20 }}>
                 {farmMessage}
               </div>
             )}
          </div>

          {/* 🎒 메뉴 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setActiveModal('inventory')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#444', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Backpack size={20} /> 가방 확인
            </button>
            <button onClick={() => setActiveModal('quest')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <CalendarIcon size={20} /> 캘린더 보기
            </button>
          </div>
        </div>
      )}

      {/* ========== [모달들] ========== */}
      
      <Modal isOpen={activeModal === 'inventory'} onClose={() => setActiveModal(null)} title="🎒 모험가의 가방">
        <div style={{ textAlign: 'center', marginBottom: 20, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{userClass.name} (Lv.{level})</div>
          <div style={{ fontSize: 12, color: '#888' }}>보유 골드: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{gameGold} G</span></div>
        </div>
        <MoneyWeaponCard transactions={transactions} dayStatuses={dayStatuses} savedAmount={gameGold + (realSavings/100)} />
      </Modal>

      <Modal isOpen={activeModal === 'saving'} onClose={() => setActiveModal(null)} title="절약 기록">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{selectedSaving?.icon}</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>{selectedSaving?.name}</div>
          <label style={{ display: 'block', textAlign: 'left', fontSize: 12, color: '#666', marginBottom: 6 }}>아낀 금액</label>
          <input 
            type="number" 
            value={savingAmountInput}
            onChange={(e) => setSavingAmountInput(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: 18, fontWeight: 'bold', border: '2px solid #4caf50', borderRadius: 12, marginBottom: 20 }}
            autoFocus
          />
          <button 
            onClick={confirmSaving}
            style={{ width: '100%', padding: '14px', backgroundColor: '#4caf50', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 12, fontSize: 16 }}
          >
            공격하기! (확인)
          </button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'quest'} onClose={() => setActiveModal(null)} title="📅 월간 기록">
         <NoSpendBoard dayStatuses={dayStatuses as any} lunaMode={lunaMode} />
         <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#888' }}>
           무지출 도장은 '기록' 탭에서 찍을 수 있습니다.
         </div>
      </Modal>

    </div>
  );
};

export default MoneyRoomPage;
