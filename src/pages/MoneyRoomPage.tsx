// src/pages/MoneyRoomPage.tsx
import React, { useMemo, useState } from 'react';
import { PenTool, Swords, ChevronDown, ChevronUp, Sprout, Search, Zap, PiggyBank, Coffee, Car, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

// 컴포넌트
import MoneyStats from '../components/money/MoneyStats';
import CollectionBar from '../components/money/CollectionBar';
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyQuestCard from '../components/money/MoneyQuestCard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';
import MoneyShopCard from '../components/money/MoneyShopCard';
import Modal from '../components/ui/Modal'; 

// 로직
import { calcLeafPoints, calcHP, calcRPGStats, calcAdvancedXP } from '../money/moneyGameLogic';
import { calcMonsterHp, pickMonsterForCategory, getTopDiscretionaryCategory } from '../money/moneyMonsters';

// ---- 타입 정의 ----
type TxType = 'expense' | 'income';
interface TransactionLike { id: string; date: string; type: TxType; category: string; amount: number; isEssential?: boolean; }
interface InstallmentLike { id: string; name: string; totalAmount: number; paidAmount: number; }
interface DayStatusLike { day: number; isNoSpend: boolean; completedQuests: number; }
interface MonthlyBudgetLike { year: number; month: number; variableBudget: number; noSpendTarget: number; }

// 절약 습관 타입
interface SavingHabit { id: string; name: string; icon: React.ReactNode; savedAmount: number; checked: boolean; }

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  
  // 🔹 UI 상태
  const [activeTab, setActiveTab] = useState<'record' | 'adventure'>('record'); // 👈 기본을 'record'로 변경 (가계부 중시)
  const [activeModal, setActiveModal] = useState<'inventory' | 'quest' | 'calendar' | null>(null);
  const [location, setLocation] = useState<'field' | 'village'>('field');
  const [farmMessage, setFarmMessage] = useState<string | null>(null);

  // 🔹 데이터 상태
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetLike>({ year: today.getFullYear(), month: today.getMonth() + 1, variableBudget: 500_000, noSpendTarget: 10 });
  const [transactions, setTransactions] = useState<TransactionLike[]>([]);
  const [installments, setInstallments] = useState<InstallmentLike[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatusLike[]>([]);
  const [gameGold, setGameGold] = useState(0); 
  const [spentLeaf, setSpentLeaf] = useState(0);
  const [energy, setEnergy] = useState(5);
  
  // 💰 [NEW] 현실 저축 누적액 (가계부 기능 강화)
  const [realSavings, setRealSavings] = useState(0);

  // 🌱 [NEW] 오늘의 절약 습관 (매일 초기화 로직은 생략, 예시용 state)
  const [habits, setHabits] = useState<SavingHabit[]>([
    { id: 'coffee', name: '커피 대신 물', icon: <Coffee size={14}/>, savedAmount: 4500, checked: false },
    { id: 'taxi', name: '택시 대신 버스', icon: <Car size={14}/>, savedAmount: 10000, checked: false },
    { id: 'snack', name: '편의점 패스', icon: <ShoppingBag size={14}/>, savedAmount: 3000, checked: false },
  ]);

  // 🔹 입력 폼
  const [txForm, setTxForm] = useState({ date: today.toISOString().slice(0, 10), type: 'expense' as TxType, category: '', amount: '', isEssential: false });

  // 🧮 계산 로직
  const totalLeafPoints = useMemo(() => calcLeafPoints(transactions, dayStatuses, installments), [transactions, dayStatuses, installments]);
  const currentLeaf = Math.max(0, totalLeafPoints - spentLeaf);
  const currentHP = useMemo(() => calcHP(monthlyBudget, transactions), [monthlyBudget, transactions]);
  
  // RPG 스탯 (저축액이 DEX에 반영됨!)
  const rpgStats = useMemo(() => calcRPGStats(transactions, dayStatuses, gameGold + realSavings / 100), [transactions, dayStatuses, gameGold, realSavings]);
  const { currentExp, level, maxExp } = useMemo(() => calcAdvancedXP(rpgStats, installments), [rpgStats, installments]);
  const expRatio = (currentExp / maxExp) * 100;

  // 예산 계산
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0), [transactions]);
  const remainBudget = monthlyBudget.variableBudget - totalExpense;
  const budgetRatio = Math.min(100, Math.max(0, (remainBudget / monthlyBudget.variableBudget) * 100));

  // 몬스터 상태
  const monsterInfo = useMemo(() => {
    const cat = getTopDiscretionaryCategory(transactions);
    const mon = pickMonsterForCategory(cat);
    const noSpendDays = dayStatuses.filter(d => d.isNoSpend).length;
    const hp = calcMonsterHp(mon, { noSpendDays });
    return { ...mon, currentHp: hp, isDead: hp <= 0 };
  }, [transactions, dayStatuses]);

  const isNoSpendToday = useMemo(() => dayStatuses.some(d => d.day === today.getDate() && d.isNoSpend), [dayStatuses, today]);
  const hasTxToday = useMemo(() => transactions.some(t => t.date === today.toISOString().slice(0, 10)), [transactions, today]);

  // ⚔️ 직업
  const userClass = useMemo(() => {
    if (transactions.length === 0) return { name: '모험가 지망생', icon: '🌱' };
    const income = transactions.filter(t => t.type === 'income').length;
    const expense = transactions.filter(t => t.type === 'expense').length;
    if (income > expense) return { name: '대상인', icon: '💰' };
    if (transactions.filter(t => t.type === 'expense').every(t => t.amount <= 10000)) return { name: '수도승', icon: '🙏' };
    return { name: '방랑 검사', icon: '⚔️' };
  }, [transactions]);

  const userTitle = useMemo(() => {
    if (level >= 10) return '전설의 마스터';
    if (level >= 5) return '베테랑 모험가';
    return '초심자 모험가';
  }, [level]);

  // ---- 핸들러 ----
  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category || !amountNum) return alert('입력 확인');
    const newTx: TransactionLike = { id: `${Date.now()}`, date: txForm.date, type: txForm.type, category: txForm.category.trim(), amount: amountNum, isEssential: txForm.isEssential };
    setTransactions((prev) => [newTx, ...prev]);
    setTxForm((prev) => ({ ...prev, amount: '', category: '' }));
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

  const handleFieldSearch = () => {
    if (energy <= 0) { setFarmMessage('⚡ 행동력이 부족합니다!'); setTimeout(() => setFarmMessage(null), 1500); return; }
    if (farmMessage) return;
    setEnergy(p => p - 1);
    const rewards = [ { text: '🌿 잡초 (10G)', gold: 10 }, { text: '✨ 유리조각 (50G)', gold: 50 }, { text: '🪙 동전 (100G)', gold: 100 }, { text: '📦 상자 (500G)', gold: 500 } ];
    const pick = rewards[Math.floor(Math.random() * rewards.length)];
    setFarmMessage(pick.text);
    setGameGold(p => p + pick.gold);
    if (pick.gold > 0) confetti({ particleCount: 30, spread: 40, origin: { y: 0.5 }, colors: ['#ffd700'] });
    setTimeout(() => setFarmMessage(null), 2000);
  };

  // 습관 체크 토글
  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextState = !h.checked;
        if (nextState) { // 체크 시
          setRealSavings(s => s + h.savedAmount); // 저축액 증가
          setGameGold(g => g + 50); // 게임 골드 보상
          confetti({ particleCount: 30, origin: { y: 0.8 }, colors: ['#88ff5a'] });
        } else { // 체크 해제 시
          setRealSavings(s => Math.max(0, s - h.savedAmount));
          setGameGold(g => Math.max(0, g - 50));
        }
        return { ...h, checked: nextState };
      }
      return h;
    }));
  };

  const isDanger = currentHP <= 30 && currentHP > 0;
  const formatMoney = (n: number) => n.toLocaleString('ko-KR');

  return (
    <div style={{ 
      minHeight: '100vh', backgroundColor: location === 'village' ? '#fffaf0' : '#222',
      backgroundImage: location === 'village' ? `radial-gradient(#dcd1bf 1px, transparent 1px)` : undefined,
      backgroundSize: '20px 20px',
      color: location === 'field' ? '#fff' : '#333',
      transition: 'all 0.5s ease',
      boxShadow: isDanger ? 'inset 0 0 50px rgba(255, 0, 0, 0.3)' : 'none',
      paddingBottom: '80px'
    }}>
      
      {/* 🔹 상단 HUD */}
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
            {activeTab === 'record' ? '📊 가계부 상황실' : (location === 'field' ? '⚔️ 황야' : '🏠 마을')}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: 16, height: 6, borderRadius: 4, backgroundColor: i < energy ? '#fbc02d' : '#555' }} />
            ))}
          </div>
        </div>
        {/* HP바 */}
        <div style={{ width: '100%', height: 10, backgroundColor: '#444', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: `${currentHP}%`, height: '100%', backgroundColor: isDanger ? '#ff4444' : '#4da6ff', transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* 🔹 탭 전환 */}
      <div style={{ padding: '16px', display: 'flex', gap: 10 }}>
        <button onClick={() => setActiveTab('record')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', backgroundColor: activeTab === 'record' ? '#fff' : 'rgba(255,255,255,0.2)', color: activeTab === 'record' ? '#333' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          <PenTool size={14} style={{ marginRight: 4, display: 'inline' }} />
          기록 & 습관
        </button>
        <button onClick={() => setActiveTab('adventure')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', backgroundColor: activeTab === 'adventure' ? '#fff' : 'rgba(255,255,255,0.2)', color: activeTab === 'adventure' ? '#333' : '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          <Swords size={14} style={{ marginRight: 4, display: 'inline' }} />
          모험 & 전투
        </button>
      </div>

      {/* ========== [기록 & 습관 탭] (대폭 강화됨!) ========== */}
      {activeTab === 'record' && (
        <div className="fade-in" style={{ padding: '0 16px', color: '#333' }}>
          
          {/* 1. 예산 모니터 (Visual) */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#888' }}>이번 달 남은 예산</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: remainBudget < 0 ? '#ff4444' : '#333' }}>
                {formatMoney(remainBudget)}원
              </div>
            </div>
            {/* 게이지 바 */}
            <div style={{ width: '100%', height: 12, backgroundColor: '#eee', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ 
                width: `${budgetRatio}%`, height: '100%', 
                backgroundColor: budgetRatio < 20 ? '#ff4444' : '#4caf50', 
                transition: 'width 0.5s ease' 
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#aaa' }}>
              <span>쓴 돈: {formatMoney(totalExpense)}</span>
              <span>총 예산: {formatMoney(monthlyBudget.variableBudget)}</span>
            </div>
          </div>

          {/* 2. 절약 습관 트래커 (Habit Tracker) */}
          <div style={{ padding: '16px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sprout size={16} color="#4caf50" /> 오늘의 절약 행동
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {habits.map((habit) => (
                <div key={habit.id} 
                  onClick={() => toggleHabit(habit.id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 12, 
                    backgroundColor: habit.checked ? '#f0ffe5' : '#f9f9f9',
                    border: habit.checked ? '1px solid #b2f2bb' : '1px solid #eee',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ color: habit.checked ? '#2e7d32' : '#aaa' }}>{habit.icon}</div>
                    <div style={{ fontSize: 13, color: habit.checked ? '#2e7d32' : '#555', fontWeight: habit.checked ? 'bold' : 'normal' }}>
                      {habit.name}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: habit.checked ? '#2e7d32' : '#999' }}>
                    +{formatMoney(habit.savedAmount)}원
                  </div>
                </div>
              ))}
            </div>
            {realSavings > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #eee', textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#555' }}>오늘 아낀 돈 합계: </span>
                <span style={{ fontSize: 14, fontWeight: 'bold', color: '#2e7d32' }}>{formatMoney(realSavings)}원</span>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>(이 돈은 캐릭터 DEX 스탯을 올려줍니다!)</div>
              </div>
            )}
          </div>

          {/* 3. 빠른 지출 입력 */}
          <div style={{ padding: '20px', borderRadius: 20, backgroundColor: '#fff', marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 12, fontSize: 14 }}>💸 지출 기록하기</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="date" value={txForm.date} onChange={e => setTxForm(p => ({...p, date: e.target.value}))} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 10 }} />
              <select value={txForm.type} onChange={e => setTxForm(p => ({...p, type: e.target.value as TxType}))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: 10 }}>
                <option value="expense">지출</option>
                <option value="income">수입</option>
              </select>
            </div>
            <input placeholder="내용 (예: 편의점)" value={txForm.category} onChange={e => setTxForm(p => ({...p, category: e.target.value}))} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 10, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="금액" value={txForm.amount} onChange={e => setTxForm(p => ({...p, amount: e.target.value}))} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 10 }} />
              <button onClick={handleAddTx} style={{ padding: '0 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 'bold' }}>입력</button>
            </div>
          </div>

          {/* 최근 기록 */}
          {transactions.length > 0 && (
            <div style={{ padding: '16px', borderRadius: 20, backgroundColor: '#fff' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>최근 내역</div>
              {transactions.slice(0, 3).map(t => (
                <div key={t.id} style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ color: '#555' }}>{t.category}</span>
                  <span style={{ fontWeight: 500, color: t.type === 'expense' ? '#ff4444' : '#4caf50' }}>
                    {t.type === 'expense' ? '-' : '+'}{formatMoney(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== [모험 탭] (기존 게임 요소) ========== */}
      {activeTab === 'adventure' && location === 'field' && (
        <div className="fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ position: 'relative' }}>
            <MoneyMonsterCard transactions={transactions} dayStatuses={dayStatuses} />
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{userClass.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#aaa' }}>Lv.{level} {userClass.name}</div>
              <div style={{ width: '100%', height: 4, backgroundColor: '#555', borderRadius: 2, marginTop: 4 }}>
                <div style={{ width: `${expRatio}%`, height: '100%', backgroundColor: '#ffd700' }} />
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ffd700' }}>{gameGold} G</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <button onClick={() => setActiveModal('calendar')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#ff4444', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <Swords size={20} /> 공격
            </button>
            <button onClick={() => setActiveModal('quest')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <Scroll size={20} /> 의뢰
            </button>
            <button onClick={() => setActiveModal('inventory')} style={{ padding: '16px 0', borderRadius: 12, border: 'none', backgroundColor: '#444', color: '#fff', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <Backpack size={20} /> 가방
            </button>
          </div>

          {monsterInfo.isDead && (
            <button onClick={() => { setLocation('village'); confetti({ particleCount: 100, origin: { y: 0.6 } }); }} style={{ padding: '12px', borderRadius: 12, border: 'none', backgroundColor: '#fff', color: '#333', fontWeight: 'bold', cursor: 'pointer', marginTop: 10 }}>
              🏠 마을로 귀환하기
            </button>
          )}
        </div>
      )}

      {activeTab === 'adventure' && location === 'village' && (
        <div className="fade-in" style={{ padding: '0 16px' }}>
          <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>평화로운 마을</div>
            <p style={{ fontSize: 12, color: '#666' }}>전투에서 지친 몸을 쉬어가세요.</p>
          </div>
          <MoneyShopCard currentLeaf={currentLeaf} onBuy={(cost) => setSpentLeaf(p => p + cost)} />
          <button onClick={() => setLocation('field')} style={{ width: '100%', padding: '16px', marginTop: 20, borderRadius: 12, border: 'none', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <DoorOpen size={18} /> 필드로 나가기
          </button>
        </div>
      )}

      {/* ========== [모달 창들] ========== */}
      <Modal isOpen={activeModal === 'calendar'} onClose={() => setActiveModal(null)} title="⚔️ 이번 달 공략집">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#666' }}>오늘 지출이 없었다면 공격하세요!</span>
          <button onClick={toggleTodayNoSpend} style={{ padding: '6px 12px', borderRadius: 20, border: 'none', backgroundColor: '#ff4444', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
            🔥 공격 (성공 체크)
          </button>
        </div>
        <NoSpendBoard year={monthlyBudget.year} month={monthlyBudget.month} dayStatuses={dayStatuses as any} />
      </Modal>

      <Modal isOpen={activeModal === 'quest'} onClose={() => setActiveModal(null)} title="📜 길드 의뢰서">
        <MoneyQuestCard isNoSpendToday={isNoSpendToday} hasTxToday={hasTxToday} />
      </Modal>

      <Modal isOpen={activeModal === 'inventory'} onClose={() => setActiveModal(null)} title="🎒 내 가방">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{userClass.icon}</div>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>{userClass.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{userTitle} (Lv.{level})</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ff6b6b' }}>STR</div>
            <div>{rpgStats.str}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#4da6ff' }}>INT</div>
            <div>{rpgStats.int}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ffd700' }}>DEX</div>
            <div>{rpgStats.dex}</div>
          </div>
        </div>
        <MoneyWeaponCard transactions={transactions} dayStatuses={dayStatuses} savedAmount={gameGold + (realSavings/100)} />
      </Modal>

    </div>
  );
};

export default MoneyRoomPage;
