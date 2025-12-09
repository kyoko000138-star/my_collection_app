import React, { useMemo, useState, useEffect } from 'react';
import { 
  PenTool, Swords, Sprout, Search, Coffee, Car, ShoppingBag, 
  Map, Moon, Shield, Scroll, Backpack, DoorOpen, Edit2, CheckCircle, XCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 컴포넌트
import MoneyShopCard from '../components/money/MoneyShopCard';
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyQuestCard from '../components/money/MoneyQuestCard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';
import JourneyMap from '../components/money/JourneyMap';
import Modal from '../components/ui/Modal'; 

// 로직 (기존 파일들)
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

// 절약 습관 타입 (고정 금액 삭제, 아이콘과 이름만 유지)
interface SavingActionTemplate { id: string; name: string; icon: React.ReactNode; defaultAmount: number; }

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  
  // 🔹 UI 상태
  const [activeTab, setActiveTab] = useState<'record' | 'adventure'>('record');
  const [activeModal, setActiveModal] = useState<'inventory' | 'quest' | 'calendar' | 'saving' | null>(null);
  const [location, setLocation] = useState<'field' | 'village'>('field');
  const [farmMessage, setFarmMessage] = useState<string | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false); // [NEW] 예산 수정 모드

  // 🔹 데이터 상태
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetLike>({ 
    year: today.getFullYear(), 
    month: today.getMonth() + 1, 
    variableBudget: 500_000, 
    noSpendTarget: 10,
    snackRecoveryBudget: 30_000 
  });
  // 예산 수정을 위한 임시 상태
  const [editBudgetForm, setEditBudgetForm] = useState({ variable: '', target: '', snack: '' });

  const [transactions, setTransactions] = useState<TransactionLike[]>([]);
  const [installments, setInstallments] = useState<InstallmentLike[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatusLike[]>([]);
  
  // 게임 재화
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
  
  // [NEW] 절약 입력 팝업용 상태
  const [selectedSaving, setSelectedSaving] = useState<SavingActionTemplate | null>(null);
  const [savingAmountInput, setSavingAmountInput] = useState('');

  // 🔹 입력 폼
  const [txForm, setTxForm] = useState({ 
    date: today.toISOString().slice(0, 10), 
    type: 'expense' as TxType, 
    category: '', 
    amount: '', 
    isEssential: false,
    isRecoverySnack: false
  });

  // ---------------- [로직 연동] ----------------
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>({
    lastPeriodStart: '', cycleLength: 33, manualMode: null,
  });
  const cycleStatus = useMemo(() => calcCycleStatus(today, cycleSettings), [today, cycleSettings]);
  const lunaMode = cycleStatus.mode;

  const [routeMode, setRouteMode] = useState<RouteMode>('calm');
  const [journey, setJourney] = useState<MoneyJourneyState>(() => createJourney('calm'));

  // 루트 변경
  const handleRouteChange = (newMode: RouteMode) => {
    setRouteMode(newMode);
    setJourney(prev => {
      const newMap = createJourney(newMode);
      const safeNodeId = Math.min(prev.currentNodeId, newMap.nodes.length - 1);
      return { ...newMap, currentNodeId: safeNodeId };
    });
  };

  // 진행도 자동 업데이트
  useEffect(() => {
    const calculatedTotalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const calculatedNoSpendDays = dayStatuses.filter((d) => d.isNoSpend).length;
    const ctx = {
      variableBudget: monthlyBudget.variableBudget,
      totalExpense: calculatedTotalExpense,
      noSpendDays: calculatedNoSpendDays,
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
  const expRatio = (currentExp / 100) * 100; // maxExp 로직 단순화

  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0), [transactions]);
  const remainBudget = monthlyBudget.variableBudget - totalExpense;
  const budgetRatio = Math.min(100, Math.max(0, (remainBudget / monthlyBudget.variableBudget) * 100));

  const monsterInfo = useMemo(() => {
    const cat = getTopDiscretionaryCategory(transactions);
    const mon = pickMonsterForCategory(cat);
    const noSpendDays = dayStatuses.filter(d => d.isNoSpend).length;
    const hp = calcMonsterHp(mon, { noSpendDays });
    return { ...mon, currentHp: hp, isDead: hp <= 0 };
  }, [transactions, dayStatuses]);

  const isNoSpendToday = useMemo(() => dayStatuses.some(d => d.day === today.getDate() && d.isNoSpend), [dayStatuses, today]);
  const hasTxToday = useMemo(() => transactions.some(t => t.date === today.toISOString().slice(0, 10)), [transactions, today]);

  const userClass = useMemo(() => {
    if (transactions.length === 0) return { name: '초심자', icon: '🌱' };
    return { name: '모험가', icon: '⚔️' };
  }, [transactions]);

  // ---- 핸들러 ----
  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category || !amountNum) return alert('입력 확인');
    const newTx: TransactionLike = { 
      id: `${Date.now()}`, date: txForm.date, type: txForm.type, category: txForm.category.trim(), amount: amountNum, isEssential: txForm.isEssential, isRecoverySnack: txForm.isRecoverySnack
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

  // [NEW] 절약 행동 클릭 시 팝업 열기
  const handleSavingClick = (template: SavingActionTemplate) => {
    setSelectedSaving(template);
    setSavingAmountInput(String(template.defaultAmount)); // 기본값 채워주기
    setActiveModal('saving');
  };

  // [NEW] 절약 확정
  const confirmSaving = () => {
    if (!selectedSaving) return;
    const amount = Number(savingAmountInput.replace(/,/g, ''));
    if (amount > 0) {
      setRealSavings(prev => prev + amount);
      setGameGold(prev => prev + Math.floor(amount / 10)); // 10원당 1골드
      // 기록에도 남길지 선택 (여기선 저축액 누적만)
      confetti({ particleCount: 50, origin: { y: 0.6 }, colors: ['#4caf50', '#ffd700'] });
    }
    setActiveModal(null);
    setSelectedSaving(null);
  };

  // [NEW] 예산 수정 시작
  const startEditBudget = () => {
    setEditBudgetForm({
      variable: String(monthlyBudget.variableBudget),
      target: String(monthlyBudget.noSpendTarget),
      snack: String(monthlyBudget.snackRecoveryBudget || 0)
    });
    setIsEditingBudget(true);
  };

  // [NEW] 예산 저장
  const saveBudget = () => {
    setMonthlyBudget(prev => ({
      ...prev,
      variableBudget: Number(editBudgetForm.variable.replace(/,/g, '')),
      noSpendTarget: Number(editBudgetForm.target),
      snackRecoveryBudget: Number(editBudgetForm.snack.replace(/,/g, ''))
    }));
    setIsEditingBudget(false);
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');

  return (
    <div style={{ 
      minHeight: '100vh', backgroundColor: location === 'village' ? '#fffaf0' : '#222',
      backgroundImage: location === 'village' ? `radial-gradient(#dcd1bf 1px, transparent 1px)` : undefined,
      backgroundSize: '20px 20px',
      color: location === 'field' ? '#fff' : '#333',
      transition: 'all 0.5s ease',
      paddingBottom: '80px'
    }}>
      
      {/* 🔹 상단 HUD (항상 표시) */}
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
            {activeTab === 'record' ? '📊 가계부 상황실' : (location === 'field' ? '⚔️ 황야' : '🏠 마을')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#ffd700', fontWeight: 'bold' }}>{gameGold} G</div>
            {/* HP바 */}
            <div style={{ width: 80, height: 8, backgroundColor: '#444', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${currentHP}%`, height: '100%', backgroundColor: currentHP < 30 ? '#ff4444' : '#4da6ff' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 탭 버튼 */}
      <div style={{ padding: '16px', display: 'flex', gap: 10 }}>
        <button onClick={() => setActiveTab('record')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', backgroundColor: activeTab === 'record' ? '#fff' : 'rgba(255,255,255,0.2)', color: activeTab === 'record' ? '#333' : '#fff', fontWeight: 'bold', boxShadow: activeTab === 'record' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>
          <PenTool size={16} style={{ marginBottom: -2, marginRight: 6 }} /> 기록 & 관리
        </button>
        <button onClick={() => setActiveTab('adventure')} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', backgroundColor: activeTab === 'adventure' ? '#fff' : 'rgba(255,255,255,0.2)', color: activeTab === 'adventure' ? '#333' : '#fff', fontWeight: 'bold', boxShadow: activeTab === 'adventure' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>
          <Swords size={16} style={{ marginBottom: -2, marginRight: 6 }} /> 모험 & 가방
        </button>
      </div>

      {/* ========== [탭 1: 기록 & 관리] ========== */}
      {activeTab === 'record' && (
        <div className="fade-in" style={{ padding: '0 16px', color: '#333' }}>
          
          {/* 🌙 Luna 모드 상태 (간략 표시) */}
          <div style={{ 
            marginBottom: 16, padding: '8px 12px', borderRadius: 12, backgroundColor: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 'bold', color: '#555' }}>
              <Moon size={14} color={lunaMode === 'pms' ? '#ef4444' : lunaMode === 'rest' ? '#3b82f6' : '#9ca3af'} />
              {lunaMode === 'normal' ? '평온 주간' : lunaMode === 'pms' ? 'PMS 주의보' : '휴식 주간'}
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>{lunaMode === 'normal' ? '회복 슬롯 잠김' : '보호 모드 켜짐'}</div>
          </div>

          {/* 1. 예산 카드 (수정 기능 추가) */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {!isEditingBudget ? (
              // [뷰 모드]
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
                
                {/* 게이지 */}
                <div style={{ width: '100%', height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ width: `${budgetRatio}%`, height: '100%', backgroundColor: budgetRatio < 20 ? '#ff4444' : '#4caf50', transition: 'width 0.5s' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}>
                  <span>쓴 돈: {formatMoney(totalExpense)}</span>
                  <span>총 예산: {formatMoney(monthlyBudget.variableBudget)}</span>
                </div>
              </>
            ) : (
              // [수정 모드]
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 'bold' }}>📝 예산 재설정</div>
                
                <label style={{ fontSize: 12, color: '#666' }}>
                  변동비 예산
                  <input 
                    type="number" 
                    value={editBudgetForm.variable}
                    onChange={e => setEditBudgetForm(p => ({...p, variable: e.target.value}))}
                    style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 8, border: '1px solid #ddd' }}
                  />
                </label>

                <label style={{ fontSize: 12, color: '#666' }}>
                  무지출 목표 (일)
                  <input 
                    type="number" 
                    value={editBudgetForm.target}
                    onChange={e => setEditBudgetForm(p => ({...p, target: e.target.value}))}
                    style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 8, border: '1px solid #ddd' }}
                  />
                </label>

                <label style={{ fontSize: 12, color: '#666' }}>
                  회복 간식 예산
                  <input 
                    type="number" 
                    value={editBudgetForm.snack}
                    onChange={e => setEditBudgetForm(p => ({...p, snack: e.target.value}))}
                    style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 8, border: '1px solid #ddd' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={saveBudget} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', backgroundColor: '#333', color: '#fff', fontWeight: 'bold' }}>저장</button>
                  <button onClick={() => setIsEditingBudget(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', backgroundColor: '#eee', color: '#666' }}>취소</button>
                </div>
              </div>
            )}
          </div>

          {/* 2. 유동적 절약 행동 (클릭 -> 팝업) */}
          <div style={{ padding: '16px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sprout size={16} color="#4caf50" /> 오늘의 절약 행동
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
            
            {realSavings > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #eee', textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#555' }}>오늘 아낀 돈: </span>
                <span style={{ fontSize: 14, fontWeight: 'bold', color: '#2e7d32' }}>{formatMoney(realSavings)}원</span>
              </div>
            )}
          </div>

          {/* 3. 지출 기록 (회복 간식 체크 포함) */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 14 }}>💸 지출 기록하기</div>
            {/* ...입력 폼 (기존과 동일)... */}
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
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                 <input type="checkbox" checked={txForm.isEssential} onChange={e => setTxForm(p => ({...p, isEssential: e.target.checked}))} /> 필수 지출
               </label>
               <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: lunaMode === 'normal' ? '#ccc' : '#e11d48' }}>
                 <input type="checkbox" checked={txForm.isRecoverySnack} onChange={e => setTxForm(p => ({...p, isRecoverySnack: e.target.checked}))} disabled={lunaMode === 'normal'} /> 회복 간식
               </label>
            </div>
          </div>
        </div>
      )}

      {/* ========== [탭 2: 모험 & 가방] (월드맵 이동됨) ========== */}
      {activeTab === 'adventure' && (
        <div className="fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* 🗺️ 월드맵 (여기서 크게 보여줌) */}
          <JourneyMap journey={journey} onChangeRoute={handleRouteChange} />

          {/* ⚔️ 전투 / 채집 액션 */}
          <div style={{ position: 'relative' }}>
             <MoneyMonsterCard transactions={transactions} dayStatuses={dayStatuses} />
             {/* ... 몬스터 / 채집 로직 유지 ... */}
          </div>

          {/* 🎒 메뉴 버튼들 (인벤토리 추가) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <button onClick={() => setActiveModal('inventory')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#444', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Backpack size={20} /> 가방 (New!)
            </button>
            <button onClick={() => setActiveModal('quest')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Scroll size={20} /> 의뢰
            </button>
            <button onClick={() => setActiveModal('calendar')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#ff4444', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Shield size={20} /> 방어전
            </button>
          </div>
        </div>
      )}

      {/* ========== [모달 창들] ========== */}
      
      {/* 🎒 가방 (인벤토리) 모달 */}
      <Modal isOpen={activeModal === 'inventory'} onClose={() => setActiveModal(null)} title="🎒 모험가의 가방">
        <div style={{ textAlign: 'center', marginBottom: 20, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{userClass.name} (Lv.{level})</div>
          <div style={{ fontSize: 12, color: '#888' }}>보유 골드: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{gameGold} G</span></div>
        </div>
        
        <h4 style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>장착 중인 장비</h4>
        <MoneyWeaponCard transactions={transactions} dayStatuses={dayStatuses} savedAmount={gameGold + (realSavings/100)} />
        
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#aaa' }}>
          * 절약할 때마다 골드가 쌓이고,<br/>장비를 제작할 수 있습니다.
        </div>
      </Modal>

      {/* 💰 절약 금액 입력 모달 */}
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
            확인 (골드 획득!)
          </button>
        </div>
      </Modal>

      {/* 기존 모달들 (퀘스트, 달력) */}
      <Modal isOpen={activeModal === 'quest'} onClose={() => setActiveModal(null)} title="📜 길드 의뢰서">
        <MoneyQuestCard isNoSpendToday={isNoSpendToday} hasTxToday={hasTxToday} lunaMode={lunaMode} />
      </Modal>

      <Modal isOpen={activeModal === 'calendar'} onClose={() => setActiveModal(null)} title="⚔️ 이번 달 공략집">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#666' }}>오늘 지출이 없었다면?</span>
          <button onClick={toggleTodayNoSpend} style={{ padding: '6px 12px', borderRadius: 20, border: 'none', backgroundColor: '#ff4444', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
            🔥 방어 성공 체크
          </button>
        </div>
        <NoSpendBoard dayStatuses={dayStatuses as any} lunaMode={lunaMode} />
      </Modal>

    </div>
  );
};

export default MoneyRoomPage;
