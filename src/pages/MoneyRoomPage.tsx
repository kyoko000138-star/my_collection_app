// src/pages/MoneyRoomPage.tsx
import React, { useMemo, useState } from 'react';
import { PenTool, Swords, ChevronDown, ChevronUp, Sprout } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calcAdvancedXP, calcRPGStats } from '../money/moneyGameLogic'; // 👈 추가

// 컴포넌트들
import MoneyStats from '../components/money/MoneyStats';
import CollectionBar from '../components/money/CollectionBar';
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyQuestCard from '../components/money/MoneyQuestCard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';
import MoneyShopCard from '../components/money/MoneyShopCard';

// 로직 import
import { calcLeafPoints, calcHP } from '../money/moneyGameLogic';

// ---- 타입 정의 ----
type TxType = 'expense' | 'income';
interface TransactionLike { id: string; date: string; type: TxType; category: string; amount: number; isEssential?: boolean; }
interface InstallmentLike { id: string; name: string; totalAmount: number; paidAmount: number; }
interface DayStatusLike { day: number; isNoSpend: boolean; completedQuests: number; }
interface MonthlyBudgetLike { year: number; month: number; variableBudget: number; noSpendTarget: number; }

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);

  const MoneyRoomPage: React.FC = () => {
  // ... 기존 상태들 ...
  const [spentLeaf, setSpentLeaf] = useState(0);
  
  // 💰 [NEW] 저축액 상태 (파밍하거나 아껴서 모은 돈)
  // 실제로는 'budget - expense' 남은 돈을 저축으로 칠 수도 있고, 
  // 파밍으로 얻은 골드를 누적할 수도 있음. 여기선 파밍 골드 + 가상 저축이라 가정.
  const [savedAmount, setSavedAmount] = useState(0); 

  // ...

  // 🧮 [NEW] RPG 스탯 & 경험치 계산
  const rpgStats = useMemo(() => calcRPGStats(transactions, dayStatuses, savedAmount), [transactions, dayStatuses, savedAmount]);
  const { currentExp, level, maxExp } = useMemo(() => calcAdvancedXP(rpgStats, installments), [rpgStats, installments]);
  const expRatio = (currentExp / maxExp) * 100;

  // 칭호 로직도 레벨 기반으로 유지
  const userTitle = useMemo(() => {
    if (level >= 10) return '전설의 용사';
    if (level >= 5) return '베테랑 모험가';
    return '초심자 모험가';
  }, [level]);

  // 🌱 파밍 시스템 업데이트 (돈도 줌!)
  const handleFarming = () => {
    if (farmMessage) return;
    const rewards = [
      { text: '🌿 약초 발견 (+10원)', gold: 10 },
      { text: '✨ 반짝이는 동전 (+100원)', gold: 100 },
      { text: '📦 보물상자 발견! (+500원)', gold: 500 },
      { text: '🐛 꽝... 아무것도 없었다.', gold: 0 },
    ];
    const pick = rewards[Math.floor(Math.random() * rewards.length)];
    
    setFarmMessage(pick.text);
    setSavedAmount(prev => prev + pick.gold); // 저축액 증가 -> DEX 증가 -> 장비 업글!
    
    if (pick.gold > 0) {
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.5 }, colors: ['#ffd700'] });
    }
    setTimeout(() => setFarmMessage(null), 2000);
  };

  // ... (나머지 코드 동일) ...

  return (
    // ...
            {/* 1. [내 구역] 캐릭터 + 장비 */}
            <div style={scrollItemStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                {/* 🛡️ 캐릭터 카드 */}
                <div style={{
                  padding: '16px', borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #ddd',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden'
                }}>
                  {/* 상단: 아바타 & 레벨 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f4f1ea', fontSize: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e5e5e5' }}>
                        🧙‍♀️
                      </div>
                      <div style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: '#333', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', border: '2px solid #fff' }}>
                        Lv.{level}
                      </div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: '#b59a7a', fontWeight: 'bold' }}>{userClass.name}</div>
                      <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{userTitle}</div>
                      
                      {/* EXP bar */}
                      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                        <div style={{ flex:1, height: '6px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${expRatio}%`, height: '100%', backgroundColor: '#ffd700', transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ fontSize: 9, color: '#aaa' }}>{Math.floor(expRatio)}%</div>
                      </div>
                    </div>

                    <button onClick={handleFarming} style={{ /* ...스타일... */ }}>
                      <Sprout size={16} color="#4caf50" />
                      <span style={{ fontSize: 10, color: '#2e7d32', marginTop: 2 }}>수확</span>
                    </button>
                  </div>

                  {/* 📊 RPG 스탯 표시 (NEW!) */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#f8f8f8', padding: '8px', borderRadius: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#ff6b6b', fontWeight:'bold' }}>STR (힘)</div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{rpgStats.str}</div>
                      <div style={{ fontSize: 9, color: '#999' }}>무지출</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#4da6ff', fontWeight:'bold' }}>INT (지능)</div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{rpgStats.int}</div>
                      <div style={{ fontSize: 9, color: '#999' }}>기록</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#ffd700', fontWeight:'bold' }}>DEX (민첩)</div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{rpgStats.dex}</div>
                      <div style={{ fontSize: 9, color: '#999' }}>저축</div>
                    </div>
                  </div>

                  {/* 장비창 (스탯에 따라 자동 변경됨) */}
                  <MoneyWeaponCard 
                    transactions={transactions} 
                    dayStatuses={dayStatuses} 
                    savedAmount={savedAmount} // 👈 저축액 전달
                  />
                  
                </div>
              </div>
            </div>
  
  // 🔹 탭 & UI 상태
  const [activeTab, setActiveTab] = useState<'record' | 'adventure'>('adventure');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [farmMessage, setFarmMessage] = useState<string | null>(null);

  // 🔹 데이터 상태
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetLike>({
    year: today.getFullYear(), month: today.getMonth() + 1, variableBudget: 500_000, noSpendTarget: 10,
  });
  const [transactions, setTransactions] = useState<TransactionLike[]>([]);
  const [installments, setInstallments] = useState<InstallmentLike[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatusLike[]>([]);
  const [spentLeaf, setSpentLeaf] = useState(0);

  // 🔹 입력 폼 상태
  const [budgetInput, setBudgetInput] = useState({ variableBudget: String(monthlyBudget.variableBudget), noSpendTarget: String(monthlyBudget.noSpendTarget) });
  const [txForm, setTxForm] = useState({ date: today.toISOString().slice(0, 10), type: 'expense' as TxType, category: '', amount: '', isEssential: false });
  const [instForm, setInstForm] = useState({ name: '', totalAmount: '', paidAmount: '' });

  // 🧮 기본 계산 로직
  const totalLeafPoints = useMemo(() => calcLeafPoints(transactions, dayStatuses, installments), [transactions, dayStatuses, installments]);
  const currentLeaf = Math.max(0, totalLeafPoints - spentLeaf);
  const currentHP = useMemo(() => calcHP(monthlyBudget, transactions), [monthlyBudget, transactions]);
  
  // 🆙 레벨 & 칭호 (기존)
  const level = Math.floor(totalLeafPoints / 10) + 1;
  const currentExp = totalLeafPoints % 10;
  const expRatio = (currentExp / 10) * 100;
  
  const userTitle = useMemo(() => {
    if (level >= 10) return '전설의 재정 마스터';
    if (level >= 5) return '노련한 관리자';
    if (level >= 3) return '떠오르는 용사';
    return '초심자';
  }, [level]);

  // ⚔️ [NEW] 직업(Class) 계산 로직
  const userClass = useMemo(() => {
    if (transactions.length === 0) return { name: '모험가 지망생', icon: '🌱' };
    
    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;
    
    // 수입 기록이 지출보다 많으면 '상인'
    if (incomeCount > expenseCount) return { name: '대상인 (Merchant)', icon: '💰' };
    
    // 모든 지출이 1만원 이하면 '수도승'
    const isFrugal = transactions.filter(t => t.type === 'expense').every(t => t.amount <= 10000);
    if (isFrugal && expenseCount > 0) return { name: '절약의 수도승', icon: '🙏' };
    
    return { name: '방랑 검사', icon: '⚔️' };
  }, [transactions]);

  // 🩸 [NEW] 상태 이상(Buff/Debuff) 계산 로직
  const activeEffects = useMemo(() => {
    const effects = [];
    
    // 1. [철벽] 최근 3일 중 하루라도 무지출 성공 시
    const recent = dayStatuses.slice(-3);
    if (recent.some(d => d.isNoSpend)) {
      effects.push({ id: 'shield', name: '철벽 방어', icon: '🛡️', color: '#4caf50' });
    }

    // 2. [출혈] 오늘 지출 3건 이상
    const todayStr = today.toISOString().slice(0, 10);
    const todayCount = transactions.filter(t => t.date === todayStr && t.type === 'expense').length;
    if (todayCount >= 3) {
      effects.push({ id: 'bleed', name: '지갑 출혈', icon: '🩸', color: '#f44336' });
    }

    // 3. [식곤증] 최근 지출 중 식비/배달/간식 포함
    const hasFood = transactions.slice(0, 3).some(t => 
      t.category.includes('식비') || t.category.includes('배달') || t.category.includes('간식') || t.category.includes('카페')
    );
    if (hasFood) {
      effects.push({ id: 'food', name: '식곤증', icon: '🍗', color: '#ff9800' });
    }

    return effects;
  }, [transactions, dayStatuses, today]);


  // ---- 핸들러 ----
  const handleSaveBudget = () => {
    const vb = Number(budgetInput.variableBudget.replace(/,/g, ''));
    const nt = Number(budgetInput.noSpendTarget);
    if (!Number.isFinite(vb) || vb < 0) return alert('숫자만 입력해주세요.');
    setMonthlyBudget((prev) => ({ ...prev, variableBudget: vb, noSpendTarget: nt }));
    alert('예산이 저장되었습니다.');
  };

  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category || !amountNum) return alert('내용을 입력해주세요.');
    const newTx: TransactionLike = { id: `${Date.now()}`, date: txForm.date, type: txForm.type, category: txForm.category.trim(), amount: amountNum, isEssential: txForm.isEssential };
    setTransactions((prev) => [newTx, ...prev]);
    setTxForm((prev) => ({ ...prev, amount: '', category: '' }));
  };

  const handleAddInstallment = () => {
    if (!instForm.name) return alert('이름을 입력해주세요.');
    const total = Number(instForm.totalAmount.replace(/,/g, ''));
    const paid = Number(instForm.paidAmount.replace(/,/g, '')) || 0;
    const newIns: InstallmentLike = { id: `${Date.now()}`, name: instForm.name.trim(), totalAmount: total, paidAmount: Math.min(paid, total) };
    setInstallments((prev) => [newIns, ...prev]);
    setInstForm({ name: '', totalAmount: '', paidAmount: '' });
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

  const handleFarming = () => {
    if (farmMessage) return;
    const rewards = [ '🌿 작은 풀잎', '✨ 반짝이는 유리', '🪙 1 골드', '🪵 나뭇가지', '🐛 벌레 (윽!)', '📦 빈 상자' ];
    const pick = rewards[Math.floor(Math.random() * rewards.length)];
    setFarmMessage(`${pick} 획득!`);
    confetti({ particleCount: 20, spread: 30, origin: { y: 0.5 }, shapes: ['circle'], colors: ['#88ff5a'] });
    setTimeout(() => setFarmMessage(null), 2000);
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');
  const monthLabel = `${monthlyBudget.year}. ${String(monthlyBudget.month).padStart(2, '0')}`;
  
  // 🎨 스타일
  const scrollContainerStyle: React.CSSProperties = {
    display: 'flex', overflowX: 'auto', gap: '12px', padding: '4px 12px 24px', 
    scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', alignItems: 'flex-start',
  };
  const scrollItemStyle: React.CSSProperties = { minWidth: '90%', scrollSnapAlign: 'center', flexShrink: 0 };
  const isDanger = currentHP <= 30 && currentHP > 0;

  return (
    <div style={{ 
      padding: '12px 0 60px',
      backgroundColor: '#f4f1ea', 
      backgroundImage: `radial-gradient(#dcd1bf 1px, transparent 1px)`, 
      backgroundSize: '20px 20px',
      minHeight: '100vh',
      transition: 'box-shadow 0.5s ease',
      boxShadow: isDanger ? 'inset 0 0 50px rgba(255, 0, 0, 0.15)' : 'none',
    }}>
      
      {/* 헤더 */}
      <div style={{ marginBottom: 16, padding: '0 12px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#b59a7a', marginBottom: 4 }}>ROOM 08</div>
        <div style={{ fontSize: 20, color: '#222', marginBottom: 4 }}>머니룸</div>
        <div style={{ fontSize: 12, color: '#777' }}>{monthLabel}의 모험 기록</div>
      </div>

      {/* 🔹 HUD: 스탯창 */}
      <div style={{ margin: '0 12px 20px' }}>
        <MoneyStats monthlyBudget={monthlyBudget as any} transactions={transactions} dayStatuses={dayStatuses} installments={installments} />
        <div style={{ marginTop: -12 }}><CollectionBar transactions={transactions} dayStatuses={dayStatuses} installments={installments} /></div>
      </div>

      {/* 🔹 탭 버튼 */}
      <div style={{ display: 'flex', margin: '0 12px 24px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 999, padding: 4 }}>
        <button onClick={() => setActiveTab('record')} style={{ flex: 1, padding: '8px 0', borderRadius: 999, border: 'none', backgroundColor: activeTab === 'record' ? '#fff' : 'transparent', color: activeTab === 'record' ? '#333' : '#888', fontWeight: activeTab === 'record' ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <PenTool size={14} /> 기록
        </button>
        <button onClick={() => setActiveTab('adventure')} style={{ flex: 1, padding: '8px 0', borderRadius: 999, border: 'none', backgroundColor: activeTab === 'adventure' ? '#fff' : 'transparent', color: activeTab === 'adventure' ? '#333' : '#888', fontWeight: activeTab === 'adventure' ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Swords size={14} /> 모험
        </button>
      </div>

      {/* 🔹 탭 1: 기록의 책상 */}
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
              <input placeholder="내용 (예: 편의점)" value={txForm.category} onChange={e => setTxForm(p => ({...p, category: e.target.value}))} style={{ padding: '8px', borderRadius: 8, border: '1px solid #ddd' }} />
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
        <div className="fade-in">
          
          <div style={scrollContainerStyle}>
            
            {/* 1. [내 구역] 캐릭터(파밍) + 장비 합성 */}
            <div style={scrollItemStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                {/* 🛡️ 캐릭터 카드 (NEW: 직업/상태이상 표시) */}
                <div style={{
                  padding: '16px', borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #ddd',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f4f1ea', fontSize: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e5e5e5' }}>
                        {userClass.icon} {/* 👈 직업 이모지 */}
                      </div>
                      <div style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: '#333', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', border: '2px solid #fff' }}>
                        Lv.{level}
                      </div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: '#b59a7a', fontWeight: 'bold', letterSpacing: '1px' }}>{userClass.name}</div>
                      <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{userTitle}</div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '4px', marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${expRatio}%`, height: '100%', backgroundColor: '#ffd700', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>

                    <button onClick={handleFarming} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '8px 10px', borderRadius: '12px', border: '1px solid #88ff5a', backgroundColor: '#f0ffe5',
                      cursor: 'pointer', flexShrink: 0
                    }}>
                      <Sprout size={16} color="#4caf50" />
                      <span style={{ fontSize: 10, color: '#2e7d32', marginTop: 2 }}>수확</span>
                    </button>
                  </div>

                  {/* 🩸 상태 이상 (버프/디버프 목록) */}
                  {activeEffects.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
                      {activeEffects.map((ef: any) => (
                        <div key={ef.name} style={{ 
                          fontSize: '11px', padding: '3px 8px', borderRadius: '6px', 
                          backgroundColor: `${ef.color}15`, color: ef.color, border: `1px solid ${ef.color}40`,
                          display: 'flex', alignItems: 'center', gap: 4, fontWeight: 'bold'
                        }}>
                          <span>{ef.icon}</span> {ef.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 파밍 메시지 */}
                {farmMessage && (
                  <div className="fade-in" style={{ textAlign: 'center', padding: '8px', backgroundColor: '#333', color: '#fff', borderRadius: '8px', fontSize: '12px' }}>
                    {farmMessage}
                  </div>
                )}

                {/* 무기 합성 */}
                <MoneyWeaponCard transactions={transactions} dayStatuses={dayStatuses} installments={installments} />
              </div>
            </div>

            {/* 2. [전장 구역] 몬스터 + 퀘스트 */}
            <div style={scrollItemStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <MoneyMonsterCard transactions={transactions} dayStatuses={dayStatuses} />
                <MoneyQuestCard />
              </div>
            </div>

            {/* 3. [상점 구역] */}
            <div style={scrollItemStyle}>
              <MoneyShopCard 
                currentLeaf={currentLeaf} 
                onBuy={(cost) => setSpentLeaf(prev => prev + cost)} 
              />
            </div>

          </div> 

          {/* 무지출 달력 */}
          <div style={{ padding: '0 12px' }}>
             <div onClick={() => setIsCalendarOpen(!isCalendarOpen)} style={{ padding: '12px 16px', backgroundColor: '#fff', borderRadius: 12, border: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 'bold', color: '#555' }}>📅 무지출 캘린더</span>
              {isCalendarOpen ? <ChevronUp size={16} color="#999"/> : <ChevronDown size={16} color="#999"/>}
            </div>
            {isCalendarOpen && (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button onClick={toggleTodayNoSpend} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 999, border: 'none', backgroundColor: '#333', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                    ✨ 오늘 성공 체크!
                  </button>
                </div>
                <NoSpendBoard year={monthlyBudget.year} month={monthlyBudget.month} dayStatuses={dayStatuses as any} />
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default MoneyRoomPage;
