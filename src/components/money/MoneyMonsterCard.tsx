// src/components/money/MoneyMonsterCard.tsx
import React, { useMemo } from 'react';
import { Bug, Pizza, ShoppingBag, Coffee, Moon } from 'lucide-react';
import {
  getTopDiscretionaryCategory,
  pickMonsterForCategory,
  calcMonsterHp,
  MoneyMonster,
} from '../../money/moneyMonsters';

interface MoneyMonsterCardProps {
  transactions?: any[];
  dayStatuses?: any[]; // { day: number; isNoSpend: boolean }[]
}

const MoneyMonsterCard: React.FC<MoneyMonsterCardProps> = ({
  transactions = [],
  dayStatuses = [],
}) => {
  const topCategory = useMemo(
    () => getTopDiscretionaryCategory(transactions),
    [transactions],
  );

  const monster: MoneyMonster = useMemo(
    () => pickMonsterForCategory(topCategory),
    [topCategory],
  );

  const noSpendDays = useMemo(
    () => (dayStatuses || []).filter((d) => d?.isNoSpend).length,
    [dayStatuses],
  );

  const currentHp = useMemo(
    () => calcMonsterHp(monster, { noSpendDays }),
    [monster, noSpendDays],
  );

  const ratio = monster.maxHp ? currentHp / monster.maxHp : 1;

  const monsterIcon = (() => {
    switch (monster.id) {
      case 'delivery-dragon':
        return <Pizza size={20} />;
      case 'shopping-slime':
        return <ShoppingBag size={20} />;
      case 'cafe-ghost':
        return <Coffee size={20} />;
      case 'idle-slime':
      default:
        return <Moon size={20} />;
    }
  })();

  const subtitle = topCategory
    ? `이번 달 가장 많이 쓴 비필수 지출: “${topCategory}”`
    : '아직 눈에 띄는 소비 패턴이 없어요.';

  return (
    <div
      style={{
        padding: '14px 16px 16px',
        borderRadius: 16,
        border: '1px solid #e5e5e5',
        backgroundColor: '#ffffff',
        fontSize: 13,
        color: '#555',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#b59a7a',
          marginBottom: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Bug size={14} />
        MONEY MONSTER
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            backgroundColor: '#f5efe2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {monsterIcon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: '#3f3428', marginBottom: 2 }}>
            {monster.name}
          </div>
          <div style={{ fontSize: 11, color: '#8b7760' }}>{subtitle}</div>
        </div>
      </div>

      {/* HP 바 */}
      <div
        style={{
          marginTop: 4,
          marginBottom: 6,
          fontSize: 12,
          color: '#8b7760',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>HP</span>
        <span>
          {currentHp} / {monster.maxHp}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 999,
          background: '#e6ddcf',
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(1, ratio)) * 100}%`,
            height: '100%',
            background: '#c76b5a',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 11,
          color: '#8b7760',
          marginBottom: 6,
        }}
      >
        {monster.description}
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#a08a6a',
        }}
      >
        {monster.tip}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          color: '#999',
        }}
      >
        이번 달 무지출 성공일이 늘어날수록, 머니 몬스터의 HP가 조금씩 줄어듭니다.
      </div>
    </div>
  );
};

export default MoneyMonsterCard;
