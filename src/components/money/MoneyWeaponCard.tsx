// src/components/money/MoneyWeaponCard.tsx
import React, { useMemo } from 'react';
import { Hammer, Swords, Shield, Ring } from 'lucide-react';
import {
  calcShards,
  WEAPONS,
  canCraft,
  Weapon,
} from '../../money/moneyWeapons';

interface MoneyWeaponCardProps {
  transactions?: any[];
  dayStatuses?: any[];
  installments?: any[];
}

const MoneyWeaponCard: React.FC<MoneyWeaponCardProps> = ({
  transactions = [],
  dayStatuses = [],
  installments = [],
}) => {
  const shards = useMemo(
    () => calcShards(transactions, dayStatuses, installments),
    [transactions, dayStatuses, installments],
  );

  const { craftable, locked } = useMemo(() => {
    const can = WEAPONS.filter((w) => canCraft(w, shards));
    const lock = WEAPONS.filter((w) => !canCraft(w, shards));
    return { craftable: can, locked: lock };
  }, [shards]);

  const renderWeaponIcon = (weapon: Weapon) => {
    switch (weapon.id) {
      case 'ledger-blade':
        return <Swords size={18} />;
      case 'tea-shield':
        return <Shield size={18} />;
      case 'repay-ring':
        return <Ring size={18} />;
      default:
        return <Swords size={18} />;
    }
  };

  const shardLabel = `기록의 파편 ${shards.recordShard} · 절제의 파편 ${shards.disciplineShard} · 상환의 파편 ${shards.repayShard}`;

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
        <Hammer size={14} />
        WEAPON SYNTHESIS
      </div>

      <div style={{ fontSize: 14, marginBottom: 4, color: '#333' }}>
        이번 달 합성 가능한 장비
      </div>

      <div
        style={{
          fontSize: 11,
          color: '#8b7760',
          marginBottom: 10,
        }}
      >
        {shardLabel}
      </div>

      {/* 합성 가능 장비 */}
      {craftable.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 11,
              color: '#9b7f55',
              marginBottom: 4,
            }}
          >
            합성 가능
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {craftable.map((w) => (
              <WeaponRow key={w.id} weapon={w} shards={shards} active />
            ))}
          </div>
        </div>
      )}

      {/* 아직 조건 부족 장비 */}
      {locked.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 11,
              color: '#b4a38c',
              marginBottom: 4,
            }}
          >
            조건 부족
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {locked.map((w) => (
              <WeaponRow key={w.id} weapon={w} shards={shards} active={false} />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          color: '#999',
        }}
      >
        실제 파편은 소모되지 않고, 이번 달 기록을 기준으로
        “어떤 장비를 쥘 수 있는 상태인지” 보여주는 카드예요.
      </div>
    </div>
  );
};

interface WeaponRowProps {
  weapon: Weapon;
  shards: { recordShard: number; disciplineShard: number; repayShard: number };
  active: boolean;
}

const WeaponRow: React.FC<WeaponRowProps> = ({ weapon, shards, active }) => {
  const icon = (() => {
    switch (weapon.id) {
      case 'ledger-blade':
        return <Swords size={16} />;
      case 'tea-shield':
        return <Shield size={16} />;
      case 'repay-ring':
        return <Ring size={16} />;
      default:
        return <Swords size={16} />;
    }
  })();

  const costTexts: string[] = [];
  if (weapon.cost.recordShard) costTexts.push(`기록 ${weapon.cost.recordShard}`);
  if (weapon.cost.disciplineShard) costTexts.push(`절제 ${weapon.cost.disciplineShard}`);
  if (weapon.cost.repayShard) costTexts.push(`상환 ${weapon.cost.repayShard}`);

  const bonusTexts: string[] = [];
  if (weapon.bonus.hp) bonusTexts.push(`HP +${weapon.bonus.hp}`);
  if (weapon.bonus.mp) bonusTexts.push(`MP +${weapon.bonus.mp}`);
  if (weapon.bonus.def) bonusTexts.push(`DEF +${weapon.bonus.def}`);

  return (
    <div
      style={{
        borderRadius: 10,
        border: '1px solid #e6e0d5',
        padding: '6px 8px',
        backgroundColor: active ? '#fbf6ec' : '#f8f6f2',
        opacity: active ? 1 : 0.65,
        display: 'flex',
        gap: 8,
      }}
    >
      <div
        style={{
          marginTop: 2,
          color: active ? '#9c7a3e' : '#b6a585',
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            color: '#3f3428',
            marginBottom: 2,
          }}
        >
          {weapon.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#8b7760',
            marginBottom: 2,
          }}
        >
          {weapon.description}
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#a08a6a',
          }}
        >
          비용: {costTexts.join(' · ')} / 보너스: {bonusTexts.join(' · ')}
        </div>
      </div>
    </div>
  );
};

export default MoneyWeaponCard;
