// src/components/money/MoneyStats.tsx
import React, { useMemo } from 'react';
import type { MonthlyBudget, Transaction, DayStatus, Installment } from './types';
import { Activity, Brain, Shield } from 'lucide-react';

interface MoneyStatsProps {
  monthlyBudget: MonthlyBudget | null;
  transactions: Transaction[];
  dayStatuses: DayStatus[];
  installments: Installment[];
}

const MoneyStats: React.FC<MoneyStatsProps> = ({
  monthlyBudget,
  transactions,
  dayStatuses,
  installments,
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
        background: '#f7f2e8',
        border: '1px solid #e0d5c2',
        marginBottom: '16px',
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b59a7a' }}>
        MONEY STATUS
      </div>
      <div style={{ fontSize: 18, marginBottom: 12, color: '#5a4633' }}>이번 달 머니 스탯</div>

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
  const ratio = Math.max(0, Math.min(1, value / max));

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
