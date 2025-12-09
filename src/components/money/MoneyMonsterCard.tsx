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
  dayStatuses?: any[]; 
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

  // 🩸 몬스터 상태 (건강함 / 빈사 / 토벌) 계산
  const status = useMemo(() => {
    if (currentHp === 0) return { color: '#999', text: '토벌 완료!', bg: '#eeeeee', isDead: true };
    if (monster.maxHp > 0 && currentHp / monster.maxHp <= 0.3) {
      return { color: '#d9534f', text: '빈사 상태! (마지막 일격 필요)', bg: '#fbe9e9', isDead: false }; // 빨강 위기
    }
    return { color: '#3f3428', text: '아직 쌩쌩함', bg: '#f5efe2', isDead: false }; // 평소
  }, [currentHp, monster.maxHp]);

  const monsterIcon = (() => {
    switch (monster.id) {
      case 'delivery-dragon':
        return <Pizza size={20} color={status.isDead ? '#999' : '#000'} />;
      case 'shopping-slime':
        return <ShoppingBag size={20} color={status.isDead ? '#999' : '#000'} />;
      case 'cafe-ghost':
        return <Coffee size={20} color={status.isDead ? '#999' : '#000'} />;
      case 'idle-slime':
      default:
        return <Moon size={20} color={status.isDead ? '#999' : '#000'} />;
    }
  })();

  const subtitle = topCategory
    ? `주요 출몰 지역: “${topCategory}”`
    : '아직 눈에 띄는 녀석이 없어요.';

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
        {/* 몬스터 아이콘 영역 (상태에 따라 배경색/투명도 변화) */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            backgroundColor: status.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative', // CLEAR 뱃지 위치 잡기용
            transition: 'all 0.3s ease',
            opacity: status.isDead ? 0.7 : 1,
          }}
        >
          {status.isDead && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -6,
                backgroundColor: '#d9534f',
                color: 'white',
                fontSize: 9,
                fontWeight: 'bold',
                padding: '2px 4px',
                borderRadius: 4,
                transform: 'rotate(15deg)',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              CLEAR
            </span>
          )}
          {monsterIcon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: '#3f3428', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            {monster.name}
            {/* 상태 텍스트 뱃지 */}
            <span style={{ 
              fontSize: 10, 
              color: status.isDead ? '#999' : status.color,
              backgroundColor: status.isDead ? '#eee' : 'transparent',
              padding: status.isDead ? '1px 4px' : 0,
              borderRadius: 4
            }}>
              [{status.text}]
            </span>
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
            background: status.isDead ? '#ccc' : (ratio <= 0.3 ? '#d9534f' : '#c76b5a'), // 위기일 때 빨간색
            transition: 'width 0.3s ease, background 0.3s ease',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 11,
          color: '#8b7760',
          marginBottom: 6,
          lineHeight: 1.4,
        }}
      >
        {status.isDead ? "훌륭합니다! 몬스터가 도망쳤습니다. 이대로 유지하세요!" : monster.description}
      </div>
      
      {!status.isDead && (
        <div
          style={{
            fontSize: 11,
            color: '#a08a6a',
          }}
        >
          Tip: {monster.tip}
        </div>
      )}
    </div>
  );
};

export default MoneyMonsterCard;
