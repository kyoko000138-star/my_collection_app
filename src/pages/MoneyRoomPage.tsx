// src/pages/MoneyRoomPage.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { PenTool, Swords, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti'; // 🎉 폭죽 라이브러리

import MoneyStats from '../components/money/MoneyStats';
import CollectionBar from '../components/money/CollectionBar';
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyQuestCard from '../components/money/MoneyQuestCard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';

// 로직 함수 가져오기 (레벨 계산용)
import { calcLeafPoints } from '../money/moneyGameLogic';
import { calcHP } from '../money/moneyGameLogic'; // HP 계산용

// ---- 타입 정의 ----
type TxType = 'expense' | 'income';
interface TransactionLike { id: string; date: string; type: TxType; category: string; amount: number; isEssential?: boolean; }
interface InstallmentLike { id: string; name: string; totalAmount: number; paidAmount: number; }
interface DayStatusLike { day: number; isNoSpend: boolean; completedQuests: number; }
interface MonthlyBudgetLike { year: number; month: number; variableBudget: number; noSpendTarget: number; }

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [activeTab, setActiveTab] = useState<'record' | 'adventure'>('adventure');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 데이터 상태
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetLike>({
    year: today.getFullYear(), month: today.getMonth() + 1, variableBudget: 500_000, noSpendTarget: 10,
  });
  const [transactions, setTransactions] = useState<TransactionLike[]>([]);
  const [installments, setInstallments] = useState<InstallmentLike[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatusLike[]>([]);

  // 입력 폼 상태
  const [budgetInput, setBudgetInput] = useState({ variableBudget: String(monthlyBudget.variableBudget), noSpendTarget: String(monthlyBudget.noSpendTarget) });
  const [txForm, setTxForm] = useState({ date: today.toISOString().slice(0, 10), type: 'expense' as TxType, category: '', amount: '', isEssential: false });
  const [instForm, setInstForm] = useState({ name: '', totalAmount: '', paidAmount: '' });

  // 🧮 실시간 스탯 계산 (레벨업/HP연출용)
  const leafPoints = useMemo(() => calcLeafPoints(transactions, dayStatuses, installments), [transactions, dayStatuses, installments]);
  const currentHP = useMemo(() => calcHP(monthlyBudget, transactions), [monthlyBudget, transactions]);

  // 🆙 레벨 & 칭호 시스템
  const level = Math.floor(leafPoints / 10) + 1;
  const currentExp = leafPoints % 10; // 10점마다 레벨업
  const expRatio = (currentExp / 10) * 100;

  const userTitle = useMemo(() => {
    if (level >= 10) return '💰 재정의 마스터';
    if (level >= 5) return '🛡️ 노련한 관리자';
    if (level >= 3) return '⚔️ 떠오르는 용사';
    return '🌱 초심자';
  }, [level]);

  // 핸들러들
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

  // 🎉 무지출 토글 시 폭죽 효과
  const toggleTodayNoSpend = () => {
    const day = today.getDate();
    
    setDayStatuses((prev) => {
      const existing = prev.find((d) => d.day === day);
      const isSuccess = !existing || !existing.isNoSpend; // 이번에 성공으로 바뀌는가?

      if (isSuccess) {
        // ✨ 폭죽 팡!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
      }

      if (!existing) return [...prev, { day, isNoSpend: true, completedQuests: 0 }];
      return prev.map((d) => (d.day === day ? { ...d, isNoSpend: !d.isNoSpend } : d));
    });
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR');
  const monthLabel = `${monthlyBudget.year}. ${String(monthlyBudget.month).padStart(2, '0')}`;
  
  // 스타일
  const scrollContainerStyle: React.CSSProperties = {
    display: 'flex', overflowX: 'auto', gap: '12px', padding: '4px 12px 24px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', alignItems: 'flex-start',
  };
  const scrollItemStyle: React.CSSProperties = { minWidth: '90%', scrollSnapAlign: 'center', flexShrink: 0 };

  // 🩸 HP 위기 상태 스타일 (화면 테두리 붉게)
  const isDanger = currentHP <= 30 && currentHP > 0;
  const containerStyle: React.CSSProperties = {
    padding: '12px 0 60px',
    backgroundColor: '#f4f1ea',
    backgroundImage: `radial-gradient(#dcd1bf 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    minHeight: '100vh',
    transition: 'box-shadow 0.5s ease',
    boxShadow: isDanger ? 'inset 0 0 50px rgba(255, 0, 0, 0.15)' : 'none', // 위기일 때 붉은 기운
  };

  return (
    <div style={containerStyle}>
      
      {/* 헤더 */}
      <div style={{ marginBottom: 16, padding: '0 12px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#b59a7a', marginBottom: 4 }}>ROOM 08</div>
        <div style={{ fontSize: 20, color: '#222', marginBottom: 4 }}>머니룸</div>
        <div style={{ fontSize: 12, color: '#777' }}>{monthLabel}의 모험 기록</div>
      </div>

      {/* 🔹 HUD */}
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
              <input placeholder="내용 (예: 편의점)" value={txForm.category} onChange={e => setTxForm(p => ({...p, category: e.target.value}))} style={{ padding: '8px', borderRadius: 8, border: '1px solid #ddd' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <input placeholder="금액" inputMode="numeric" value={txForm.amount} onChange={e => setTxForm(p => ({...p, amount: e.target.value}))} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #ddd' }} />
                <button onClick={handleAddTx} style={{ padding: '0 16px', borderRadius: 8, backgroundColor: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>입력</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 탭 2: 모험 */}
      {activeTab === 'adventure' && (
        <div className="fade-in">
          <div style={scrollContainerStyle}>
            
            {/* 1. 내 캐릭터 (업그레이드 버전!) */}
            <div style={scrollItemStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{
                  padding: '20px', borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #ddd',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden'
                }}>
                  {/* EXP 게이지 바 (배경에 깔기) */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: '6px', width: `${expRatio}%`, backgroundColor: '#ffd700', transition: 'width 0.5s ease' }} />
                  
                  <div style={{ fontSize: 12, color: '#b59a7a', letterSpacing: '2px', marginBottom: 10 }}>MY CHARACTER</div>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f4f1ea', fontSize: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, border: '4px solid #e5e5e5' }}>🧙‍♀️</div>
                  
                  {/* 레벨 & 칭호 표시 */}
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{userTitle}</div>
                  <div style={{ fontSize: 12, color: '#777', marginBottom: 16 }}>Lv. {level} <span style={{color:'#ccc'}}>|</span> EXP {currentExp}/10</div>
                  
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{leafPoints}</div>
                      <div style={{ fontSize: 10, color: '#999' }}>Leaf</div>
                    </div>
                    <div style={{ width: 1, height: '100%', backgroundColor: '#eee' }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{transactions.length}</div>
                      <div style={{ fontSize: 10, color: '#999' }}>기록</div>
                    </div>
                  </div>
                </div>
                <MoneyWeaponCard transactions={transactions} dayStatuses={dayStatuses} installments={installments} />
              </div>
            </div>

            {/* 나머지 카드들 */}
            <div style={scrollItemStyle}><MoneyMonsterCard transactions={transactions} dayStatuses={dayStatuses} /></div>
            <div style={scrollItemStyle}><MoneyQuestCard /></div>
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
                    ✨ 오늘 무지출 성공!
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
