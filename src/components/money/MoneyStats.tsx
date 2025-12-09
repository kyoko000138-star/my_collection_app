// src/components/money/MoneyStats.tsx
import React, { useMemo } from 'react';
import { Activity, Brain, Shield } from 'lucide-react';

// 타입은 일단 느슨하게 any로 잡아둘게 (나중에 실제 타입으로 교체 가능)
interface MoneyStatsProps {
  monthlyBudget?: any;
  transactions?: any[];
  dayStatuses?: any[];
  installments?: any[];
}

// --- 계산용 헬퍼 함수들 (이 파일 안에서 전부 정의) ---

function calcMonthlyExpense(transactions: any[] = []): number {
  return transactions
    .filter((t) => t?.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
}

// HP: 생활비 체력 (0~100)
function calcHP(monthlyBudget: any, transactions: any[] = []): number {
  if (!monthlyBudget || !monthlyBudget.variableBudget || monthlyBudget.variableBudget <= 0) return 0;
  const used = calcMonthlyExpense(transactions);
  const remain = Math.max(monthlyBudget.variableBudget - used, 0);
  return Math.round((remain / monthlyBudget.variableBudget) * 100);
}

// MP: 무지출/퀘스트 포인트 (0~10 기준, 일단 단순 버전)
function calcMP(monthlyBudget: any, dayStatuses: any[] = []): number {
  if (!monthlyBudget || !monthlyBudget.noSpendTarget || monthlyBudget.noSpendTarget <= 0) return 0;
  const noSpendDays = dayStatuses.filter((d) => d?.isNoSpend).length;
  const raw = (noSpendDays / monthlyBudget.noSpendTarget) * 10;
  return Math.max(0, Math.min(10, Math.round(raw)));
}

// DEF: 할부 방어도 (0~100)
function calcDEF(installments: any[] = []): number {
  if (!installments.length) return 0;
  const total = installments.reduce((sum, ins) => sum + (ins.totalAmount || 0), 0);
  if (total <= 0) return 0;
  const paid = installments.reduce((sum, ins) => sum + (ins.paidAmount || 0), 0);
  return Math.round((paid / total) * 100);
}

// --- 실제 컴포넌트 ---

const MoneyStats: React.FC<MoneyStatsProps> = ({
  monthlyBudget,
  transactions = [],
  dayStatuses = [],
  installments = [],
}) => {
  const { hp, mp, def } = useMemo(() => {
    const hp = calcHP(monthlyBudget, transactions);
    const mp = calcMP(monthlyBudget, dayStatuses);
    const def = calcDEF(installments);
    return { hp, mp, def };
  }, [monthlyBudget, transactions, dayStatuses, installments]);

  return (
    <div
      style={{
        padding: '16px 18px',
        borderRadius: '16px',
        border: '1px solid #e5e5e5',
        backgroundColor: '#f9f5ee',
        fontSize: 13,
        color: '#555',
        marginBottom: 16,
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
        MONEY STATUS
      </div>
      <div style={{ fontSize: 18, marginBottom: 8, color: '#333' }}>
        이번 달 머니 스탯
      </div>

      <StatRow icon={<Activity size={16} />} label="HP (생활비 체력)" value={hp} max={100} />
      <StatRow icon={<Brain size={16} />} label="MP (무지출 포인트)" value={mp} max={10} />
      <StatRow icon={<Shield size={16} />} label="DEF (할부 방어도)" value={def} max={100} />
    </div>
  );
};

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
}

const StatRow: React.FC<StatRowProps> = ({ icon, label, value, max }) => {
  const ratio = Math.max(0, Math.min(1, value / max || 0));

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 6 }}>
        {icon}
        <span style={{ fontSize: 13, color: '#6f5a45' }}>{label}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8b7760' }}>
          {value} / {max}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 999,
          background: '#e6ddcf',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: '100%',
            background: '#c29b5a',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

export default MoneyStats;
