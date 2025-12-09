// src/pages/MoneyRoomPage.tsx
import React, { useMemo, useState } from 'react';

import MoneyStats from '../components/money/MoneyStats';
import CollectionBar from '../components/money/CollectionBar';
import NoSpendBoard from '../components/money/NoSpendBoard';
import MoneyQuestCard from '../components/money/MoneyQuestCard';
import MoneyMonsterCard from '../components/money/MoneyMonsterCard';
import MoneyWeaponCard from '../components/money/MoneyWeaponCard';

// ---- 타입 (일단 이 파일 안에서만 사용하는 느슨한 타입) ----
type TxType = 'expense' | 'income';

interface TransactionLike {
  id: string;
  date: string; // "YYYY-MM-DD"
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
  day: number; // 1 ~ 31
  isNoSpend: boolean;
  completedQuests: number;
}

interface MonthlyBudgetLike {
  year: number;
  month: number; // 1~12
  variableBudget: number; // 이번달 변동비 예산
  noSpendTarget: number;  // 이번달 무지출 목표 일수
}

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudgetLike>({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    variableBudget: 500_000,
    noSpendTarget: 10,
  });

  const [transactions, setTransactions] = useState<TransactionLike[]>([]);
  const [installments, setInstallments] = useState<InstallmentLike[]>([]);
  const [dayStatuses, setDayStatuses] = useState<DayStatusLike[]>([]);

  // ---- 입력 폼용 로컬 상태 ----
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

  // ---- 예산 저장 ----
  const handleSaveBudget = () => {
    const vb = Number(budgetInput.variableBudget.replace(/,/g, ''));
    const nt = Number(budgetInput.noSpendTarget);
    if (!Number.isFinite(vb) || vb < 0) return alert('예산 금액을 숫자로 입력해 주세요.');
    if (!Number.isFinite(nt) || nt < 0) return alert('무지출 목표 일수를 숫자로 입력해 주세요.');

    setMonthlyBudget((prev) => ({
      ...prev,
      variableBudget: vb,
      noSpendTarget: nt,
    }));
    alert('이번 달 예산을 업데이트했어요.');
  };

  // ---- 지출/수입 추가 ----
  const handleAddTx = () => {
    const amountNum = Number(txForm.amount.replace(/,/g, ''));
    if (!txForm.category.trim()) return alert('카테고리를 입력해 주세요.');
    if (!Number.isFinite(amountNum) || amountNum <= 0) return alert('금액을 0보다 크게 입력해 주세요.');

    const newTx: TransactionLike = {
      id: `${Date.now()}`,
      date: txForm.date,
      type: txForm.type,
      category: txForm.category.trim(),
      amount: amountNum,
      isEssential: txForm.isEssential,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setTxForm((prev) => ({
      ...prev,
      amount: '',
      category: '',
    }));
  };

  // ---- 할부 추가 ----
  const handleAddInstallment = () => {
    if (!instForm.name.trim()) return alert('할부 이름을 입력해 주세요.');
    const total = Number(instForm.totalAmount.replace(/,/g, ''));
    const paid = Number(instForm.paidAmount.replace(/,/g, '')) || 0;
    if (!Number.isFinite(total) || total <= 0) return alert('총 금액을 0보다 크게 입력해 주세요.');
    if (paid < 0) return alert('상환 금액이 이상해요.');

    const newIns: InstallmentLike = {
      id: `${Date.now()}`,
      name: instForm.name.trim(),
      totalAmount: total,
      paidAmount: Math.min(paid, total),
    };

    setInstallments((prev) => [newIns, ...prev]);
    setInstForm({ name: '', totalAmount: '', paidAmount: '' });
  };

  // ---- 오늘을 무지출/해제 토글 ----
  const toggleTodayNoSpend = () => {
    const day = today.getDate();
    setDayStatuses((prev) => {
      const existing = prev.find((d) => d.day === day);
      if (!existing) {
        return [...prev, { day, isNoSpend: true, completedQuests: 0 }];
      }
      return prev.map((d) =>
        d.day === day ? { ...d, isNoSpend: !d.isNoSpend } : d,
      );
    });
  };

  // 간단한 문장 생성기
  const getAdventureText = (t: TransactionLike) => {
    if (t.type === 'income') return `어딘가에서 ${t.amount}골드를 획득했다!`;
    if (t.category.includes('식비')) return `허기를 채우느라 ${t.amount}골드를 썼다.`;
    if (t.category.includes('쇼핑')) return `반짝이는 물건에 홀려 ${t.amount}골드를 잃었다.`;
    return `${t.category} 때문에 ${t.amount}골드가 주머니에서 빠져나갔다.`;
  };
  
  // 렌더링
  {transactions.slice(0, 5).map((t) => (
    <li key={t.id} style={{ fontFamily: 'Gowun Batang', fontSize: 12, color: '#555' }}>
      ⚔️ {t.date}: {getAdventureText(t)}
    </li>
  ))}

  // ---- 보조 계산 ----
  const monthLabel = `${monthlyBudget.year}. ${String(
    monthlyBudget.month,
  ).padStart(2, '0')}`;

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  const remainingBudget = Math.max(
    0,
    monthlyBudget.variableBudget - totalExpense,
  );

  const formatMoney = (n: number) =>
    n.toLocaleString('ko-KR', { maximumFractionDigits: 0 });

  return (
    <div
      style={{
        padding: '12px 4px 40px',
      }}
    >
      {/* 상단 제목 */}
      <div
        style={{
          marginBottom: 16,
          padding: '0 8px',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#b59a7a',
            marginBottom: 4,
          }}
        >
          ROOM 08
        </div>
        <div
          style={{
            fontSize: 20,
            color: '#222',
            marginBottom: 4,
          }}
        >
          머니룸 – 이번 달 모험 기록
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#777',
          }}
        >
          {monthLabel} 기준 예산 · 지출 · 무지출 챌린지를 게임처럼 모아 보는 방입니다.
        </div>
      </div>

      {/* ---------- 예산 카드 ---------- */}
      <div
        style={{
          margin: '0 8px 16px',
          padding: '12px 12px 14px',
          borderRadius: 16,
          border: '1px solid #e5e5e5',
          backgroundColor: '#fbfaf6',
          fontSize: 13,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#b59a7a',
            marginBottom: 6,
          }}
        >
          MONTHLY SETTINGS
        </div>
        <div
          style={{
            fontSize: 14,
            color: '#333',
            marginBottom: 8,
          }}
        >
          이번 달 예산 & 목표
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
            }}
          >
            <span style={{ width: 80, color: '#7a6a55' }}>변동비 예산</span>
            <input
              style={{
                flex: 1,
                borderRadius: 999,
                border: '1px solid #ddd',
                padding: '4px 10px',
                fontSize: 12,
              }}
              value={budgetInput.variableBudget}
              onChange={(e) =>
                setBudgetInput((prev) => ({
                  ...prev,
                  variableBudget: e.target.value,
                }))
              }
              inputMode="numeric"
            />
            <span
              style={{
                fontSize: 11,
                color: '#999',
              }}
            >
              원
            </span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
            }}
          >
            <span style={{ width: 80, color: '#7a6a55' }}>무지출 목표</span>
            <input
              style={{
                flex: 1,
                borderRadius: 999,
                border: '1px solid #ddd',
                padding: '4px 10px',
                fontSize: 12,
              }}
              value={budgetInput.noSpendTarget}
              onChange={(e) =>
                setBudgetInput((prev) => ({
                  ...prev,
                  noSpendTarget: e.target.value,
                }))
              }
              inputMode="numeric"
            />
            <span
              style={{
                fontSize: 11,
                color: '#999',
              }}
            >
              일
            </span>
          </label>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#8b7760',
            marginBottom: 8,
          }}
        >
          <span>지금까지 지출: {formatMoney(totalExpense)}원</span>
          <span>남은 예산: {formatMoney(remainingBudget)}원</span>
        </div>

        <button
          type="button"
          onClick={handleSaveBudget}
          style={{
            marginTop: 2,
            borderRadius: 999,
            border: '1px solid #d5c7ad',
            padding: '4px 12px',
            fontSize: 12,
            backgroundColor: '#f2e8d8',
            color: '#5a4830',
            cursor: 'pointer',
          }}
        >
          이번 달 예산 저장
        </button>
      </div>

      {/* ---------- 지출 입력 카드 ---------- */}
      <div
        style={{
          margin: '0 8px 16px',
          padding: '12px 12px 10px',
          borderRadius: 16,
          border: '1px solid #e5e5e5',
          backgroundColor: '#ffffff',
          fontSize: 13,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#b59a7a',
            marginBottom: 6,
          }}
        >
          QUICK LEDGER
        </div>
        <div
          style={{
            fontSize: 14,
            color: '#333',
            marginBottom: 8,
          }}
        >
          오늘의 가계부 한 줄
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="date"
              value={txForm.date}
              onChange={(e) =>
                setTxForm((prev) => ({ ...prev, date: e.target.value }))
              }
              style={{
                flex: 0.8,
                borderRadius: 999,
                border: '1px solid #ddd',
                padding: '4px 8px',
                fontSize: 11,
              }}
            />
            <select
              value={txForm.type}
              onChange={(e) =>
                setTxForm((prev) => ({
                  ...prev,
                  type: e.target.value as TxType,
                }))
              }
              style={{
                flex: 0.6,
                borderRadius: 999,
                border: '1px solid #ddd',
                padding: '4px 8px',
                fontSize: 11,
              }}
            >
              <option value="expense">지출</option>
              <option value="income">수입</option>
            </select>
            <input
              placeholder="카테고리 (예: 간식/카페)"
              value={txForm.category}
              onChange={(e) =>
                setTxForm((prev) => ({ ...prev, category: e.target.value }))
              }
              style={{
                flex: 1.5,
                borderRadius: 999,
                border: '1px solid #ddd',
                padding: '4px 8px',
                fontSize: 11,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              placeholder="금액"
              value={txForm.amount}
              onChange={(e) =>
                setTxForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              inputMode="numeric"
              style={{
                flex: 1,
                borderRadius: 999,
                border: '1px solid #ddd',
                padding: '4px 8px',
                fontSize: 11,
              }}
            />
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: '#7a6a55',
              }}
            >
              <input
                type="checkbox"
                checked={txForm.isEssential}
                onChange={(e) =>
                  setTxForm((prev) => ({
                    ...prev,
                    isEssential: e.target.checked,
                  }))
                }
              />
              필수 지출
            </label>
            <button
              type="button"
              onClick={handleAddTx}
              style={{
                borderRadius: 999,
                border: '1px solid #d5c7ad',
                padding: '4px 10px',
                fontSize: 11,
                backgroundColor: '#f4ebdd',
                color: '#5a4830',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              추가
            </button>
          </div>
        </div>

        {transactions.length > 0 && (
          <div
            style={{
              borderTop: '1px solid #eee',
              paddingTop: 6,
              marginTop: 4,
              fontSize: 11,
              color: '#777',
            }}
          >
            최근 기록:
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '4px 0 0',
              }}
            >
              {transactions.slice(0, 5).map((t) => (
                <li key={t.id}>
                  {t.date} · {t.type === 'expense' ? '-' : '+'}
                  {formatMoney(t.amount)}원 · {t.category}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ---------- 할부 입력 카드 ---------- */}
      <div
        style={{
          margin: '0 8px 16px',
          padding: '12px 12px 10px',
          borderRadius: 16,
          border: '1px solid #e5e5e5',
          backgroundColor: '#ffffff',
          fontSize: 13,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#b59a7a',
            marginBottom: 6,
          }}
        >
          INSTALLMENTS
        </div>
        <div
          style={{
            fontSize: 14,
            color: '#333',
            marginBottom: 8,
          }}
        >
          남은 할부 메모
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginBottom: 8,
          }}
        >
          <input
            placeholder="이름 (예: 노트북, 향로)"
            value={instForm.name}
            onChange={(e) =>
              setInstForm((prev) => ({ ...prev, name: e.target.value }))
            }
            style={{
              borderRadius: 999,
              border: '1px solid #ddd',
              padding: '4px 8px',
              fontSize: 11,
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              placeholder="총 금액"
              value={instForm.totalAmount}
              onChange={(e) =>
                setInstForm((prev) => ({
                  ...prev,
                  totalAmount: e.target.value,
                }))
              }
              inputMode="numeric"
              style={{
                flex: 1,
                borderRadius: 999,
                border: '1px solid #ddd',
                padding: '4px 8px',
                fontSize: 11,
              }}
            />
            <input
              placeholder="지금까지 상환"
              value={instForm.paidAmount}
              onChange={(e) =>
                setInstForm((prev) => ({
                  ...prev,
                  paidAmount: e.target.value,
                }))
              }
              inputMode="numeric"
              style={{
                flex: 1,
                borderRadius: 999,
                border: '1px solid #ddd',
                padding: '4px 8px',
                fontSize: 11,
              }}
            />
            <button
              type="button"
              onClick={handleAddInstallment}
              style={{
                borderRadius: 999,
                border: '1px solid #d5c7ad',
                padding: '4px 10px',
                fontSize: 11,
                backgroundColor: '#f4ebdd',
                color: '#5a4830',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              추가
            </button>
          </div>
        </div>

        {installments.length > 0 && (
          <div
            style={{
              borderTop: '1px solid #eee',
              paddingTop: 6,
              marginTop: 4,
              fontSize: 11,
              color: '#777',
            }}
          >
            현재 할부:
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '4px 0 0',
              }}
            >
              {installments.slice(0, 5).map((ins) => (
                <li key={ins.id}>
                  {ins.name} · {formatMoney(ins.paidAmount)}/
                  {formatMoney(ins.totalAmount)}원
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ---------- 게임형 카드들 ---------- */}

      <div style={{ margin: '0 8px' }}>
        <MoneyStats
          monthlyBudget={monthlyBudget as any}
          transactions={transactions}
          dayStatuses={dayStatuses}
          installments={installments}
        />

        <CollectionBar
          transactions={transactions}
          dayStatuses={dayStatuses}
          installments={installments}
        />

        <MoneyQuestCard />

        <MoneyMonsterCard
          transactions={transactions}
          dayStatuses={dayStatuses}
        />

        <MoneyWeaponCard
          transactions={transactions}
          dayStatuses={dayStatuses}
          installments={installments}
        />

        <button
          type="button"
          onClick={toggleTodayNoSpend}
          style={{
            marginTop: 4,
            marginBottom: 4,
            borderRadius: 999,
            border: '1px solid #dcd1bf',
            padding: '4px 10px',
            fontSize: 11,
            backgroundColor: '#f7f2e7',
            color: '#5a4830',
            cursor: 'pointer',
          }}
        >
          오늘을 무지출/해제로 토글하기
        </button>

        <NoSpendBoard
          year={monthlyBudget.year}
          month={monthlyBudget.month}
          dayStatuses={dayStatuses as any}
        />
      </div>
    </div>
  );
};

export default MoneyRoomPage;
