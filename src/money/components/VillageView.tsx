import React from 'react';
import { UserState } from '../types';
import { GAME_CONSTANTS, CLASS_TYPES } from '../constants';
import { getAssetBuildingsView } from '../moneyGameLogic';

interface VillageViewProps {
  gameState: UserState;
  hp: number;
  todayStr: string;
  theme: any;
  onGoAdventure: () => void;
  onOpenInventory: () => void;
  onOpenKingdom: () => void;
  onOpenCollection: () => void;
  onDayEnd: () => void;
  getClassBadge: (type: any) => string;
  getHpColor: (hp: number) => string;
}

export const VillageView: React.FC<VillageViewProps> = ({
  gameState, hp, todayStr, theme,
  onGoAdventure, onOpenInventory, onOpenKingdom, onOpenCollection, onDayEnd,
  getClassBadge, getHpColor
}) => {
  const assetBuildings = getAssetBuildingsView(gameState);

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={{display:'flex', flexDirection:'column'}}>
          <span style={styles.date}>{todayStr}</span>
          <span style={styles.classBadge}>
            {getClassBadge(gameState.profile.classType)} Lv.{gameState.profile.level} {gameState.profile.name}
          </span>
        </div>
        <span style={{...styles.modeBadge, color: theme.color, borderColor: theme.color}}>
          {theme.label}
        </span>
      </header>

      {/* HERO (Village Mode) */}
      <section style={styles.heroSection}>
        <div style={styles.avatarArea}>
          <span style={{fontSize: '40px'}}>🏡</span>
        </div>
        <div style={styles.hpLabel}><span>HP</span><span>{hp}%</span></div>
        <div style={styles.hpBarBg}>
          <div style={{...styles.hpBarFill, width: `${hp}%`, backgroundColor: getHpColor(hp)}} />
        </div>
        <div style={styles.budgetDetail}>
          잔액: {gameState.budget.current.toLocaleString()} / {gameState.budget.total.toLocaleString()}
        </div>
      </section>

      {/* STATS */}
      <section style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>MP</div>
          <div style={{color: '#60a5fa', fontWeight:'bold'}}>{gameState.runtime.mp} / {GAME_CONSTANTS.MAX_MP}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>오늘지출</div>
          <div style={{color: '#fca5a5', fontWeight:'bold'}}>{gameState.counters.dailyTotalSpend.toLocaleString()}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>스트릭</div>
          <div style={{fontWeight:'bold', color: '#fbbf24'}}>{gameState.counters.noSpendStreak}일</div>
        </div>
      </section>

      {/* MENU BUTTONS */}
      <div style={styles.menuGrid}>
        <button onClick={onGoAdventure} style={styles.btnAdventure}>⚔️ 모험 떠나기 (지출)</button>
        
        <div style={styles.subGrid}>
          <button onClick={onOpenInventory} style={styles.btnMenu}>🎒 인벤토리</button>
          <button onClick={onOpenKingdom} style={styles.btnMenu}>🏰 내 왕국</button>
          <button onClick={onOpenCollection} style={styles.btnMenu}>📖 도감</button>
        </div>

        <button 
          onClick={onDayEnd} 
          disabled={gameState.counters.lastDayEndDate === todayStr}
          style={styles.btnEndDay}
        >
          {gameState.counters.lastDayEndDate === todayStr ? "💤 오늘 마감 완료" : "🌙 오늘 마감하기"}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  date: { fontSize: '20px', textShadow: '2px 2px 0px #000' },
  classBadge: { fontSize: '12px', color: '#9ca3af', marginTop: '4px' },
  modeBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid', height: 'fit-content' },
  heroSection: { marginBottom: '25px', textAlign: 'center' },
  avatarArea: { width: '80px', height: '80px', margin: '0 auto 10px', backgroundColor: '#374151', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hpLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '18px' },
  hpBarBg: { width: '100%', height: '24px', backgroundColor: '#374151', border: '2px solid #fff' },
  hpBarFill: { height: '100%', transition: 'width 0.2s steps(5)' },
  budgetDetail: { textAlign: 'right', fontSize: '12px', color: '#9ca3af', marginTop: '6px' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' },
  statBox: { backgroundColor: '#000', padding: '10px', border: '2px solid #374151', textAlign: 'center' },
  statLabel: { fontSize: '12px', color: '#9ca3af', marginBottom: '4px' },
  
  menuGrid: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' },
  btnAdventure: { padding: '20px', fontSize: '18px', backgroundColor: '#ef4444', color: 'white', border: '2px solid #fff', boxShadow: '4px 4px 0 #7f1d1d', fontWeight: 'bold', cursor: 'pointer' },
  subGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
  btnMenu: { padding: '15px', backgroundColor: '#374151', color: '#fff', border: '2px solid #fff', boxShadow: '4px 4px 0 #000', cursor: 'pointer', fontSize: '12px' },
  btnEndDay: { padding: '15px', backgroundColor: '#1e3a8a', color: '#fbbf24', border: '2px solid #fbbf24', boxShadow: '4px 4px 0 #000', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
};
