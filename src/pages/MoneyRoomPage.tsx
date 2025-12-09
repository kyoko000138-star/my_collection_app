// src/pages/MoneyRoomPage.tsx
import React, { useMemo, useState } from 'react';
import { PenTool, Swords, ChevronDown, ChevronUp, Sprout, Search, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

// 컴포넌트들
import MoneyStats from '../components/money/MoneyStats';
import CollectionBar from '../components/money/CollectionBar';
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyQuestCard from '../components/money/MoneyQuestCard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';
import MoneyShopCard from '../components/money/MoneyShopCard';

// 로직 import
import { calcLeafPoints, calcHP, calcRPGStats, calcAdvancedXP } from '../money/moneyGameLogic';
import { calcMonsterHp, pickMonsterForCategory, getTopDiscretionaryCategory } from '../money/moneyMonsters';

// ---- 타입 정의 ----
type TxType = 'expense' | 'income';
interface TransactionLike { id: string; date: string; type: TxType; category: string; amount: number; isEssential?: boolean; }
interface InstallmentLike { id: string; name: string; totalAmount: number; paidAmount: number; }
interface DayStatusLike { day: number; isNoSpend: boolean; completedQuests: number; }
interface MonthlyBudgetLike { year: number; month: number; variableBudget: number; noSpendTarget: number; }

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  
  // 🔹 탭 & UI 상태
  const [activeTab, setActiveTab] = useState<'record' | 'adventure'>('adventure');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [farmMessage, setFarmMessage] = useState<string | null>(null);
  
  // 🗺️ 위치 상태
  const [location, setLocation] = useState<'field' | 'village'>('field');

  // ⚡ 행동력 (Energy) 시스템
  const MAX_ENERGY = 5;
  const [energy, setEnergy] = useState(MAX_ENERGY); // 기본 5/5

  // 🔹 데이터 상태
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetLike>({
    year: today.getFullYear(), month: today.getMonth() + 1, variableBudget: 500_000, noSpendTarget: 10,
  });
  const [transactions, setTransactions] = useState<TransactionLike[]>([]);
  const [installments, setInstallments] = useState<InstallmentLike[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatusLike[]>([]);
  
  const [gameGold, setGameGold] = useState(0); 
  const [spentLeaf, setSpentLeaf] = useState(0); 

  // 🔹 입력 폼 상태
  const [budgetInput, setBudgetInput] = useState({ variableBudget: String(monthlyBudget.variableBudget), noSpendTarget: String(monthlyBudget.noSpendTarget) });
  const [txForm, setTxForm] = useState({ date: today.toISOString().slice(0, 10), type: 'expense' as TxType, category: '', amount: '', isEssential: false });
  const [instForm, setInstForm] = useState({ name: '', totalAmount: '', paidAmount: '' });

  // 🧮 계산 로직
  const totalLeafPoints = useMemo(() => calcLeafPoints(transactions, dayStatuses, installments), [transactions, dayStatuses, installments]);
  const currentLeaf = Math.max(0, totalLeafPoints - spentLeaf);
  const currentHP = useMemo(() => calcHP(monthlyBudget, transactions), [monthlyBudget, transactions]);
  
  const rpgStats = useMemo(() => calcRPGStats(transactions, dayStatuses, gameGold), [transactions, dayStatuses, gameGold]);
  const { currentExp, level, maxExp } = useMemo(() => calcAdvancedXP(rpgStats, installments), [rpgStats, installments]);
  const expRatio = (currentExp / maxExp) * 100;

  // 몬스터 상태 계산
  const monsterInfo = useMemo(() => {
    const cat = getTopDiscretionaryCategory(transactions);
    const mon = pickMonsterForCategory(cat);
    const noSpendDays = dayStatuses.filter(d => d.isNoSpend).length;
    const hp = calcMonsterHp(mon, { noSpendDays });
    return { ...mon, currentHp: hp, isDead: hp <= 0 };
  }, [transactions, dayStatuses]);

  // 퀘스트 자동 완료용 상태 계산
  const isNoSpendToday = useMemo(() => {
    const todayDate = today.getDate();
    return dayStatuses.some(d => d.day === todayDate && d.isNoSpend);
  }, [dayStatuses, today]);

  const hasTxToday = useMemo(() => {
    const todayStr = today.toISOString().slice(0, 10);
    return transactions.some(t => t.date === todayStr);
  }, [transactions, today]);

  // ⚔️ 직업 & 칭호
  const userClass = useMemo(() => {
    if (transactions.length === 0) return { name: '모험가 지망생', icon: '🌱' };
    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;
    if (incomeCount > expenseCount) return { name: '대상인', icon: '💰' };
    const isFrugal = transactions.filter(t => t.type === 'expense').every(t => t.amount <= 10000);
    if (isFrugal && expenseCount > 0) return { name: '수도승', icon: '🙏' };
    return { name: '방랑 검사', icon: '⚔️' };
  }, [transactions]);

  const userTitle = useMemo(() => {
    if (level >= 10) return '전설의 마스터';
    if (level >= 5) return '베테랑 모험가';
    return '초심자 모험가';
  }, [level]);

  // ---- 핸들러 ----
  const handleSaveBudget = () => { /* ... */ };
  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category || !amountNum) return alert('입력 확인');
    const newTx: TransactionLike = { id: `${Date.now()}`, date: txForm.date, type: txForm.type, category: txForm.category.trim(), amount: amountNum, isEssential: txForm.isEssential };
    setTransactions((prev) => [newTx, ...prev]);
    setTxForm((prev) => ({ ...prev, amount: '', category: '' }));
  };
  const handleAddInstallment = () => { /* ... */ };

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

  // 🌱 필드 파밍 (행동력 소모)
  const handleFieldSearch = () => {
    if (energy <= 0) {
      setFarmMessage('⚡ 행동력이 부족합니다! (내일 충전됨)');
      setTimeout(() => setFarmMessage(null), 1500);
      return;
    }
    if (farmMessage) return;

    setEnergy(prev => prev - 1); // 행동력 차감

    const rewards = [ { text: '🌿 잡초 (10G)', gold: 10 }, { text: '✨ 유리조각 (50G)', gold: 50 }, { text: '🪙 동전 (100G)', gold: 100 }, { text: '📦 상자 (500G)', gold: 500 } ];
    const pick = rewards[Math.floor(Math.random() * rewards.length)];
    setFarmMessage(pick.text);
    setGameGold(prev => prev + pick.gold);
    if (pick.gold > 0) confetti({ particleCount: 30, spread: 40, origin: { y: 0.5 }, colors: ['#ffd700'] });
    setTimeout(() => setFarmMessage(null), 2000);
  };

  // 지역 이동
  const handleMoveToVillage = () => {
    if (!monsterInfo.isDead) return alert('몬스터를 처치해야 마을로 갈 수 있습니다!');
    setLocation('village');
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
  };
  const handleMoveToField = () => setLocation('field');

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');
  const monthLabel = `${monthlyBudget.year}. ${String(monthlyBudget.month).padStart(2, '0')}`;
  const isDanger = currentHP <= 30 && currentHP > 0;

  return (
    <div style={{ 
      padding: '12px 0 60px',
      backgroundColor: location === 'village' ? '#fffaf0' : '#f4f1ea',
      backgroundImage: `radial-gradient(${location === 'village' ? '#dcd1bf' : '#ccc'} 1px, transparent 1px)`, 
      backgroundSize: '20px 20px',
      minHeight: '100vh',
      transition: 'background 0.5s ease, box-shadow 0.5s ease',
      boxShadow: isDanger ? 'inset 0 0 50px rgba(255, 0, 0, 0.15)' : 'none',
    }}>
      
      {/* 헤더 */}
      <div style={{ marginBottom: 16, padding: '0 12px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#b59a7a', marginBottom: 4 }}>ROOM 08</div>
        <div style={{ fontSize: 20, color: '#222', marginBottom: 4 }}>
          {location === 'field' ? '⚔️ 위험한 필드' : '🏠 평화로운 마을'}
        </div>
        <div style={{ fontSize: 12, color: '#777' }}>
          {location === 'field' ? '몬스터가 배회하고 있습니다.' : '상점에서 물건을 사고 정비하세요.'}
        </div>
      </div>

      {/* 🔹 HUD: 스탯 + 행동력 표시 */}
      <div style={{ margin: '0 12px 20px' }}>
        <MoneyStats monthlyBudget={monthlyBudget as any} transactions={transactions} dayStatuses={dayStatuses} installments={installments} />
        <div style={{ marginTop: -12 }}><CollectionBar transactions={transactions} dayStatuses={dayStatuses} installments={installments} /></div>
        
        {/* ⚡ 행동력 바 (NEW!) */}
        <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={14} color="#fbc02d" fill="#fbc02d" /> 행동력
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: MAX_ENERGY }).map((_, i) => (
              <div key={i} style={{ width: 24, height: 8, borderRadius: 4, backgroundColor: i < energy ? '#fbc02d' : '#eee', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>
      </div>

      {/* 🔹 탭 버튼 */}
      <div style={{ display: 'flex', margin: '0 12px 24px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 999, padding: 4 }}>
        <button onClick={() => setActiveTab('record')} style={{ flex: 1, padding: '8px 0', borderRadius: 999, border: 'none', backgroundColor: activeTab === 'record' ? '#fff' : 'transparent', color: activeTab === 'record' ? '#333' : '#888', fontWeight: activeTab === 'record' ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <PenTool size={14} /> 기록
        </button>
        <button onClick={() => setActiveTab('adventure')} style={{ flex: 1, padding: '8px 0', borderRadius: 999, border: 'none', backgroundColor: activeTab === 'adventure' ? '#fff' : 'transparent', color: activeTab === 'adventure' ? '#333' : '#888', fontWeight: activeTab === 'adventure' ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {location === 'field' ? <Swords size={14} /> : <Tent size={14} />} {location === 'field' ? '전투' : '마을'}
        </button>
      </div>

      {/* 🔹 탭 1: 기록 */}
      {activeTab === 'record' && (
        <div className="fade-in" style={{ padding: '0 12px' }}>
          <div style={{ padding: '16px', borderRadius: 16, border: '1px solid #e5e5e5', backgroundColor: '#fff', marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', color: '#b59a7a', marginBottom: 8 }}>QUICK LEDGER</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="date" value={txForm.date} onChange={e => setTxForm(p => ({...p, date: e.target.value}))} style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid #ddd' }} />
                <select value={txForm.type} onChange={e => setTxForm(p => ({...p, type: e.target.value as TxType}))} style={{ padding: '6px', borderRadius: 8, border: '1px solid #ddd' }}>
                  <option value="expense">지출</option>
                  <option value="income">수입</option>
                </select>
              </div>
              <input placeholder="내용" value={txForm.category} onChange={e => setTxForm(p => ({...p, category: e.target.value}))} style={{ padding: '8px', borderRadius: 8, border: '1px solid #ddd' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <input placeholder="금액" inputMode="numeric" value={txForm.amount} onChange={e => setTxForm(p => ({...p, amount: e.target.value}))} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #ddd' }} />
                <button onClick={handleAddTx} style={{ padding: '0 16px', borderRadius: 8, backgroundColor: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>입력</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 탭 2: 모험의 방 */}
      {activeTab === 'adventure' && (
        <div className="fade-in" style={{ padding: '0 12px' }}>
          
          {/* 1. 내 캐릭터 (파밍 버튼 제거됨 -> 필드로 이동) */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              padding: '16px', borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #ddd',
              display: 'flex', flexDirection: 'column', gap: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f4f1ea', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e5e5e5' }}>
                    {userClass.icon}
                  </div>
                  <div style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: '#333', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', border: '2px solid #fff' }}>
                    Lv.{level}
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#b59a7a', fontWeight: 'bold' }}>{userClass.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{userTitle}</div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '4px', marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${expRatio}%`, height: '100%', backgroundColor: '#ffd700', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>

              {/* 장비창 */}
              <MoneyWeaponCard transactions={transactions} dayStatuses={dayStatuses} savedAmount={gameGold} />
            </div>
          </div>

          {/* ⚔️ 필드 모드: 몬스터 & 파밍 & 퀘스트 */}
          {location === 'field' && (
            <div className="fade-in">
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* ... */}
                </div>
                {monsterInfo.isDead && (
                  <button onClick={handleMoveToVillage} style={{
                    padding: '6px 12px', borderRadius: '20px', backgroundColor: '#333', color: '#fff', fontSize: 12, border: 'none', cursor: 'pointer',
                    animation: 'pulse 1s infinite alternate'
                  }}>
                    🏠 마을 입장하기 &gt;
                  </button>
                )}
              </div>

              <MoneyMonsterCard transactions={transactions} dayStatuses={dayStatuses} />
              
              {/* 🌱 필드 파밍 버튼 (NEW PLACE!) */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                <button 
                  onClick={handleFieldSearch} 
                  disabled={energy <= 0}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '16px', border: '2px dashed #88ff5a',
                    backgroundColor: energy > 0 ? '#f0ffe5' : '#eee', color: energy > 0 ? '#2e7d32' : '#999',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: energy > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  <Search size={18} />
                  {energy > 0 ? '주변 수색하기 (행동력 -1)' : '지쳐서 움직일 수 없습니다...'}
                </button>
              </div>

              {/* 파밍 메시지 (중앙) */}
              {farmMessage && (
                <div className="fade-in" style={{ 
                  textAlign: 'center', padding: '8px 16px', backgroundColor: '#333', color: '#fff', 
                  borderRadius: '20px', fontSize: '12px', marginBottom: 16, width: 'fit-content', margin: '0 auto 16px'
                }}>
                  {farmMessage}
                </div>
              )}

              {/* 퀘스트 (자동 연동됨) */}
              <MoneyQuestCard isNoSpendToday={isNoSpendToday} hasTxToday={hasTxToday} />
              
              <div style={{ height: 16 }} />
              {/* 무지출 달력 (전투용) */}
              <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: 20, border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 'bold', fontSize: 14 }}>공격하기 (무지출 체크)</span>
                  <button onClick={toggleTodayNoSpend} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 999, border: 'none', backgroundColor: '#ff4444', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                    ⚔️ 공격!
                  </button>
                </div>
                <NoSpendBoard year={monthlyBudget.year} month={monthlyBudget.month} dayStatuses={dayStatuses as any} />
              </div>
            </div>
          )}

          {/* 🏠 마을 모드 */}
          {location === 'village' && (
            <div className="fade-in">
              {/* ... 상점 등 (이전과 동일) ... */}
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{width: 16, height: 16, backgroundColor: '#333', borderRadius: '50%'}} /> 마을
                </div>
                <button onClick={handleMoveToField} style={{
                  padding: '6px 12px', borderRadius: '20px', backgroundColor: '#fff', color: '#333', fontSize: 12, border: '1px solid #ccc', cursor: 'pointer'
                }}>
                  필드로 나가기
                </button>
              </div>
              <MoneyShopCard currentLeaf={currentLeaf} onBuy={(cost) => setSpentLeaf(prev => prev + cost)} />
            </div>
          )}

        </div>
      )}

      <style>{`@keyframes pulse { from { transform: scale(1); } to { transform: scale(1.05); } }`}</style>
    </div>
  );
};

export default MoneyRoomPage;
