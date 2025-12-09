// src/pages/MoneyRoomPage.tsx
import React, { useMemo, useState } from 'react';
import { PenTool, Swords } from 'lucide-react'; // 아이콘 추가

import MoneyStats from '../components/money/MoneyStats';
import CollectionBar from '../components/money/CollectionBar';
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyQuestCard from '../components/money/MoneyQuestCard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';

// ---- 타입 정의 (이전과 동일) ----
type TxType = 'expense' | 'income';
interface TransactionLike {
  id: string;
  date: string;
  type: TxType;
  category: string;
  amount: number;
  isEssential?: boolean;
}
interface InstallmentLike {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
}
interface DayStatusLike {
  day: number;
  isNoSpend: boolean;
  completedQuests: number;
}
interface MonthlyBudgetLike {
  year: number;
  month: number;
  variableBudget: number;
  noSpendTarget: number;
}

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  
  // 🔹 탭 상태 추가 ('record' | 'adventure')
  const [activeTab, setActiveTab] = useState<'record' | 'adventure'>('record');

  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetLike>({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    variableBudget: 500_000,
    noSpendTarget: 10,
  });

  const [transactions, setTransactions] = useState<TransactionLike[]>([]);
  const [installments, setInstallments] = useState<InstallmentLike[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatusLike[]>([]);

  // ---- 입력 폼 상태들 ----
  const [budgetInput, setBudgetInput] = useState({
    variableBudget: String(monthlyBudget.variableBudget),
    noSpendTarget: String(monthlyBudget.noSpendTarget),
  });

  const [txForm, setTxForm] = useState({
    date: today.toISOString().slice(0, 10),
    type: 'expense' as TxType,
    category: '',
    amount: '',
    isEssential: false,
  });

  const [instForm, setInstForm] = useState({
    name: '',
    totalAmount: '',
    paidAmount: '',
  });

  // ---- 핸들러 함수들 (이전과 동일) ----
  const handleSaveBudget = () => {
    const vb = Number(budgetInput.variableBudget.replace(/,/g, ''));
    const nt = Number(budgetInput.noSpendTarget);
    if (!Number.isFinite(vb) || vb < 0) return alert('숫자만 입력해주세요.');
    setMonthlyBudget((prev) => ({ ...prev, variableBudget: vb, noSpendTarget: nt }));
    alert('예산이 저장되었습니다.');
  };

  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category) return alert('카테고리를 입력해주세요.');
    if (!amountNum) return alert('금액을 입력해주세요.');

    const newTx: TransactionLike = {
      id: `${Date.now()}`,
      date: txForm.date,
      type: txForm.type,
      category: txForm.category.trim(),
      amount: amountNum,
      isEssential: txForm.isEssential,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setTxForm((prev) => ({ ...prev, amount: '', category: '' }));
  };

  const handleAddInstallment = () => {
    if (!instForm.name) return alert('이름을 입력해주세요.');
    const total = Number(instForm.totalAmount.replace(/,/g, ''));
    const paid = Number(instForm.paidAmount.replace(/,/g, '')) || 0;
    
    const newIns: InstallmentLike = {
      id: `${Date.now()}`,
      name: instForm.name.trim(),
      totalAmount: total,
      paidAmount: Math.min(paid, total),
    };
    setInstallments((prev) => [newIns, ...prev]);
    setInstForm({ name: '', totalAmount: '', paidAmount: '' });
  };

  const toggleTodayNoSpend = () => {
    const day = today.getDate();
    setDayStatuses((prev) => {
      const existing = prev.find((d) => d.day === day);
      if (!existing) return [...prev, { day, isNoSpend: true, completedQuests: 0 }];
      return prev.map((d) => (d.day === day ? { ...d, isNoSpend: !d.isNoSpend } : d));
    });
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');
  const monthLabel = `${monthlyBudget.year}. ${String(monthlyBudget.month).padStart(2, '0')}`;
  
  // 계산용
  const totalExpense = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
  [transactions]);
  const remainingBudget = Math.max(0, monthlyBudget.variableBudget - totalExpense);


  return (
    // MoneyRoomPage.tsx의 최상위 div 스타일 변경
    <div style={{ 
      padding: '12px 0 60px',
      // 👇 여기부터 추가
      backgroundColor: '#f4f1ea', // 누런 종이 색
      backgroundImage: `radial-gradient(#dcd1bf 1px, transparent 1px)`, // 모눈종이 패턴
      backgroundSize: '20px 20px',
      minHeight: '100vh'
    }}>
      
      {/* 헤더 */}
      <div style={{ marginBottom: 16, padding: '0 8px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#b59a7a', marginBottom: 4 }}>ROOM 08</div>
        <div style={{ fontSize: 20, color: '#222', marginBottom: 4 }}>머니룸</div>
        <div style={{ fontSize: 12, color: '#777' }}>{monthLabel}의 모험 기록</div>
      </div>

      {/* 🔹 HUD: 스탯창은 항상 맨 위에 고정 (게임 느낌) */}
      <div style={{ margin: '0 8px 20px' }}>
        <MoneyStats
          monthlyBudget={monthlyBudget as any}
          transactions={transactions}
          dayStatuses={dayStatuses}
          installments={installments}
        />
      </div>

      {/* 🔹 탭 버튼 영역 */}
      <div style={{ display: 'flex', margin: '0 8px 24px', backgroundColor: '#eee', borderRadius: 999, padding: 4 }}>
        <button
          onClick={() => setActiveTab('record')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 999,
            border: 'none',
            backgroundColor: activeTab === 'record' ? '#fff' : 'transparent',
            color: activeTab === 'record' ? '#333' : '#888',
            fontWeight: activeTab === 'record' ? 700 : 400,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: activeTab === 'record' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <PenTool size={14} /> 기록의 책상
        </button>
        <button
          onClick={() => setActiveTab('adventure')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 999,
            border: 'none',
            backgroundColor: activeTab === 'adventure' ? '#fff' : 'transparent',
            color: activeTab === 'adventure' ? '#333' : '#888',
            fontWeight: activeTab === 'adventure' ? 700 : 400,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: activeTab === 'adventure' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Swords size={14} /> 모험의 방
        </button>
      </div>

      {/* 🔹 탭 1: 기록의 책상 (입력 위주) */}
      {activeTab === 'record' && (
        <div className="fade-in">
          {/* 가계부 입력 (가장 자주 쓰니까 위로 올림) */}
          <div style={{ margin: '0 8px 16px', padding: '16px', borderRadius: 16, border: '1px solid #e5e5e5', backgroundColor: '#fff' }}>
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
            
            {/* 최근 기록 */}
            {transactions.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>최근 기록</div>
                {transactions.slice(0, 3).map(t => (
                  <div key={t.id} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#555' }}>{t.category}</span>
                    <span style={{ fontWeight: 500 }}>{t.type === 'expense' ? '-' : '+'}{formatMoney(t.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 예산 설정 (접혀있거나 아래쪽에) */}
          <div style={{ margin: '0 8px 16px', padding: '16px', borderRadius: 16, border: '1px solid #e5e5e5', backgroundColor: '#f9f9f9' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', color: '#b59a7a', marginBottom: 8 }}>SETTINGS</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
               <label style={{ flex: 1, fontSize: 11 }}>
                 <div style={{ marginBottom: 4, color: '#777' }}>목표 예산</div>
                 <input value={budgetInput.variableBudget} onChange={e => setBudgetInput(p => ({...p, variableBudget: e.target.value}))} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: 6 }} />
               </label>
               <label style={{ flex: 1, fontSize: 11 }}>
                 <div style={{ marginBottom: 4, color: '#777' }}>무지출 목표일</div>
                 <input value={budgetInput.noSpendTarget} onChange={e => setBudgetInput(p => ({...p, noSpendTarget: e.target.value}))} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: 6 }} />
               </label>
            </div>
            <button onClick={handleSaveBudget} style={{ width: '100%', padding: '6px', borderRadius: 6, border: '1px solid #ddd', backgroundColor: '#fff', fontSize: 11, cursor: 'pointer' }}>설정 저장</button>
          </div>

          {/* 할부 관리 */}
          <div style={{ margin: '0 8px 16px', padding: '16px', borderRadius: 16, border: '1px solid #e5e5e5', backgroundColor: '#f9f9f9' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', color: '#b59a7a', marginBottom: 8 }}>INSTALLMENTS</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input placeholder="할부명" value={instForm.name} onChange={e => setInstForm(p => ({...p, name: e.target.value}))} style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12 }} />
              <input placeholder="총액" value={instForm.totalAmount} onChange={e => setInstForm(p => ({...p, totalAmount: e.target.value}))} style={{ width: 60, padding: '6px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12 }} />
              <button onClick={handleAddInstallment} style={{ padding: '0 10px', border: '1px solid #aaa', borderRadius: 6, backgroundColor: '#fff', fontSize: 11, cursor: 'pointer' }}>+</button>
            </div>
            {installments.map(ins => (
              <div key={ins.id} style={{ fontSize: 12, color: '#555', padding: '4px 0' }}>• {ins.name} ({formatMoney(ins.paidAmount)} / {formatMoney(ins.totalAmount)})</div>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 탭 2: 모험의 방 (게임 요소 위주) */}
      {activeTab === 'adventure' && (
        <div className="fade-in" style={{ margin: '0 8px' }}>
          <MoneyMonsterCard
            transactions={transactions}
            dayStatuses={dayStatuses}
          />
          
          <MoneyQuestCard />
          
          <MoneyWeaponCard
            transactions={transactions}
            dayStatuses={dayStatuses}
            installments={installments}
          />
          
          <CollectionBar
            transactions={transactions}
            dayStatuses={dayStatuses}
            installments={installments}
          />
          
          {/* 무지출 달력 */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 'bold', color: '#555' }}>무지출 캘린더</span>
              <button onClick={toggleTodayNoSpend} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, border: '1px solid #333', backgroundColor: '#fff', cursor: 'pointer' }}>
                오늘 성공/취소 토글
              </button>
            </div>
            <NoSpendBoard
              year={monthlyBudget.year}
              month={monthlyBudget.month}
              dayStatuses={dayStatuses as any}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default MoneyRoomPage;
