// src/pages/MoneyRoomPage.tsx

import React, { useState, useEffect } from 'react';
import { MoneySummaryView } from '../money/components/MoneySummaryView';

// Data & Logic
import { UserState, Scene } from '../money/types';
import { CLASS_TYPES } from '../money/constants';
import {
  checkDailyReset,
  applySpend,
  applyDefense,
  applyDayEnd,
  applyPurify,
  applyCraftEquipment,
  getAssetBuildingsView,
  getDailyMonster,
} from '../money/moneyGameLogic';
import { calculateLunaPhase, getLunaTheme } from '../money/moneyLuna';

// Views
import { VillageView } from '../money/components/VillageView';
import { WorldMapView } from '../money/components/WorldMapView';
import { BattleView } from '../money/components/BattleView';

// Modals
import { InventoryModal } from '../money/components/InventoryModal';
import { KingdomModal } from '../money/components/KingdomModal';
import { CollectionModal } from '../money/components/CollectionModal';
import { OnboardingModal } from '../money/components/OnboardingModal';
import DailyLogModal from '../money/components/DailyLogModal';

const STORAGE_KEY = 'money-room-save-v5-full';

// ✅ (핵심) garden + counters 날짜 필드까지 포함해서 "완전한 기본 형태"를 보장
const INITIAL_STATE: UserState = {
  name: 'Player 1',
  level: 1,
  jobTitle: CLASS_TYPES.GUARDIAN,

  currentBudget: 0,
  maxBudget: 0,

  mp: 30,
  maxMp: 30,

  junk: 0,
  salt: 0,

  // ✅ 룰북 반영: 정원(결과 시각화)
  garden: {
    treeLevel: 0,
    pondLevel: 0,
    flowerState: 'normal',
    weedCount: 0,
  },

  lunaCycle: { startDate: '', periodLength: 5, cycleLength: 28 },

  inventory: [],
  collection: [],
  pending: [],
  materials: {},

  assets: { fortress: 0, airfield: 0, mansion: 0, tower: 0, warehouse: 0 },

  counters: {
    defenseActionsToday: 0,
    junkObtainedToday: 0,
    noSpendStreak: 0,
    dailyTotalSpend: 0,
    guardPromptShownToday: false,
    hadSpendingToday: false,

    // ✅ 신규 필드(저장 데이터에 없을 수 있으니 기본값 제공)
    lastDailyResetDate: '',
    lastDayEndDate: '',
  },
};

// ✅ (핵심) localStorage 저장본이 "부분 데이터"여도 크래시 안 나게 딥-머지
const mergeUserState = (base: UserState, saved: Partial<UserState>): UserState => {
  return {
    ...base,
    ...saved,

    lunaCycle: { ...base.lunaCycle, ...(saved.lunaCycle || {}) },
    assets: { ...base.assets, ...(saved.assets || {}) },
    counters: { ...base.counters, ...(saved.counters || {}) },
    garden: { ...base.garden, ...(saved.garden || {}) },

    inventory: Array.isArray(saved.inventory) ? saved.inventory : base.inventory,
    collection: Array.isArray(saved.collection) ? saved.collection : base.collection,
    pending: Array.isArray(saved.pending) ? saved.pending : base.pending,

    materials: saved.materials ?? base.materials,
  };
};

const MoneyRoomPage: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<UserState>(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (!savedRaw) return INITIAL_STATE;

      const saved = JSON.parse(savedRaw) as Partial<UserState>;
      return mergeUserState(INITIAL_STATE, saved);
    } catch {
      return INITIAL_STATE;
    }
  });

  const [scene, setScene] = useState<Scene>(Scene.VILLAGE);
  const [activeDungeon, setActiveDungeon] = useState<string>('etc');

  const [viewMode, setViewMode] = useState<'GAME' | 'SUMMARY'>('GAME');
  const [showDailyLog, setShowDailyLog] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // ✅ (핵심) 첫 진입 시에도 혹시 state 형태가 깨져 있으면 merge 후 reset
  useEffect(() => {
    setGameState((prev) => checkDailyReset(mergeUserState(INITIAL_STATE, prev)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Memo ---
  const todayStr = useMemo(() => getKSTDateString(), []);
  const lunaPhase = calculateLunaPhase(gameState.lunaCycle);
  const theme = getLunaTheme(lunaPhase);
  const isNewUser = gameState.maxBudget === 0;

  const weather = getMoneyWeather(gameState);
  const weatherMeta = getWeatherMeta(weather);

  const currentMonsterType =
    scene === Scene.BATTLE
      ? activeDungeon !== 'etc'
        ? activeDungeon
        : getDailyMonster(gameState.pending)
      : 'etc';

  const hpPercent =
    gameState.maxBudget > 0
      ? Math.round((gameState.currentBudget / gameState.maxBudget) * 100)
      : 0;

  // --- Reward apply helper ---
  const applyRewardToState = (state: UserState, reward: RewardItem): UserState => {
    const next = JSON.parse(JSON.stringify(state)) as UserState;
    next.seedPackets = Math.max(0, (next.seedPackets || 0) - 1);

    // DECOR → garden.decorations에 좌표 저장
    if (reward.type === 'DECOR') {
      if (!next.garden) next.garden = { treeLevel: 0, weedCount: 0, flowerState: 'normal', decorations: [] };
      if (!next.garden.decorations) next.garden.decorations = [];

      next.garden.decorations.push({
        id: reward.id,
        x: Math.floor(12 + Math.random() * 76),  // 12~88
        y: Math.floor(35 + Math.random() * 45),  // 35~80
        obtainedAt: new Date().toISOString(),
      });
      return next;
    }

    // ITEM → inventory
    if (reward.type === 'ITEM') {
      if (!next.inventory) next.inventory = [];
      const idx = next.inventory.findIndex((i: any) => i.id === reward.id);
      if (idx >= 0) next.inventory[idx].count = (next.inventory[idx].count || 1) + 1;
      else next.inventory.push({ id: reward.id, name: reward.name, type: 'consumable', count: 1 });
      return next;
    }

    // MATERIAL → materials
    if (reward.type === 'MATERIAL') {
      if (!next.materials) next.materials = {};
      next.materials[reward.id] = (next.materials[reward.id] || 0) + 1;
      return next;
    }

    // BADGE → collection
    if (reward.type === 'BADGE') {
      if (!next.collection) next.collection = [];
      const exists = next.collection.some((c: any) => c.id === reward.id);
      if (!exists) {
        next.collection.push({
          id: reward.id,
          name: reward.name,
          description: reward.desc,
          obtainedAt: new Date().toISOString(),
          category: 'BADGE',
        });
      }
      return next;
    }

    return next;
  };

  // --- Handlers ---
  const handleSpend = (amount: number) => {
    const { newState, message } = applySpend(gameState, amount, false, activeDungeon);
    setGameState(deepMergeSave(INITIAL_STATE, newState));
    setTimeout(() => {
      alert(message);
      setScene(Scene.VILLAGE);
    }, 100);
  };

  const handleGuard = () => {
    const next = applyDefense(gameState);
    setGameState(deepMergeSave(INITIAL_STATE, next));
    setTimeout(() => {
      alert('🛡️ 방어 성공! 의지력(MP)을 회복했습니다.');
      setScene(Scene.VILLAGE);
    }, 100);
  };

  // 🛏 하루 마감
  const handleDayEnd = () => {
    const { newState, message } = applyDayEnd(gameState);
    let next = deepMergeSave(INITIAL_STATE, newState);

    // ✅ 무지출 보상: 씨앗 봉투 +1 (룰북의 “절약 도파민” 장치로 직결) 
    if (!gameState.counters.hadSpendingToday) {
      next.seedPackets = (next.seedPackets || 0) + 1;
    }

    setGameState(next);
    setShowDailyLog(true);

    // 로그 메시지도 보고 싶으면 alert(message) 추가해도 됨
    // alert(message);
  };

  const handleReset = () => {
    if (
      window.confirm(
        '머니룸 데이터를 모두 초기화할까요?\n(예산/자산/도감 기록이 모두 지워집니다)',
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleOnboarding = (data: any) => {
    setGameState((prev) => {
      const merged = deepMergeSave(INITIAL_STATE, prev);
      return {
        ...merged,
        name: data.profile.name,
        jobTitle: data.profile.classType,
        maxBudget: data.budget.total,
        currentBudget: data.budget.current,
        lunaCycle: {
          ...merged.lunaCycle,
          startDate: data.luna.nextPeriodDate || todayStr,
        },
      };
    });
  };

  const handlePullSeed = () => {
    if ((gameState.seedPackets || 0) <= 0) return;
    const reward = pullGacha();
    setGameState((prev) => applyRewardToState(deepMergeSave(INITIAL_STATE, prev), reward));
    setLastReward(reward);
  };

  // --- Render ---
  return (
    <div style={{ ...styles.appContainer, backgroundColor: theme.bg || '#0b1020' }}>
      {/* 🎮 게임 / 📊 요약 토글 */}
      <div style={styles.viewToggle}>
        <button
          type="button"
          onClick={() => setViewMode('GAME')}
          style={{
            ...styles.viewToggleBtn,
            backgroundColor:
              viewMode === 'GAME' ? '#0f172a' : 'rgba(15,23,42,0.6)',
          }}
        >
          🎮 게임
        </button>
        <button
          type="button"
          onClick={() => setViewMode('SUMMARY')}
          style={{
            ...styles.viewToggleBtn,
            backgroundColor:
              viewMode === 'SUMMARY' ? '#0f172a' : 'rgba(15,23,42,0.6)',
          }}
        >
          📊 요약
        </button>
      </div>

      {/* 🌦️ 날씨 뱃지 + 🌱 씨앗 버튼 */}
      <div style={styles.topRight}>
        <div style={styles.weatherBadge} title="소비 패턴 날씨">
          <span style={{ fontSize: 14 }}>{weatherMeta.icon}</span>
          <span style={{ fontSize: 11, opacity: 0.85 }}>{weatherMeta.label}</span>
        </div>
        <button
          type="button"
          style={styles.seedBtn}
          onClick={() => setRewardOpen(true)}
          title="씨앗 봉투 열기"
        >
          🌱 {gameState.seedPackets || 0}
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      {viewMode === 'SUMMARY' ? (
        <MoneySummaryView
          user={gameState}
          onBackToGame={() => setViewMode('GAME')}
        />
      ) : (
        <div style={styles.screenWrap}>
          {/* ✅ 날씨 오버레이는 ‘마을(정원)’에서만 */}
          {scene === Scene.VILLAGE && <WeatherOverlay weather={weather} />}

          {/* ✅ 정원 데코 오버레이 (VillageView 수정 없이도 보이게) */}
          {scene === Scene.VILLAGE && gameState.garden?.decorations?.length > 0 && (
            <div style={styles.decorLayer}>
              {gameState.garden.decorations.slice(0, 40).map((d, idx) => (
                <div
                  key={`${d.id}-${idx}`}
                  style={{
                    position: 'absolute',
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: 22,
                    opacity: 0.95,
                    filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.25))',
                  }}
                >
                  {DECOR_EMOJI[d.id] || '✨'}
                </div>
              ))}
            </div>
          )}

          {isNewUser && <OnboardingModal onComplete={handleOnboarding} />}

          {scene === Scene.VILLAGE && (
            <VillageView user={gameState} onChangeScene={setScene} onDayEnd={handleDayEnd} />
          )}

          {scene === Scene.WORLD_MAP && (
            <WorldMapView
              onSelectDungeon={(id) => {
                setActiveDungeon(id);
                setScene(Scene.BATTLE);
              }}
              onBack={() => setScene(Scene.VILLAGE)}
            />
          )}

          {scene === Scene.BATTLE && (
            <BattleView
              dungeonId={currentMonsterType}
              playerHp={gameState.currentBudget}
              maxHp={gameState.maxBudget}
              onSpend={handleSpend}
              onGuard={handleGuard}
              onRun={() => setScene(Scene.WORLD_MAP)}
            />
          )}

          {/* 인벤토리 / 정원(자산) / 도감 모달 */}
          <InventoryModal
            open={scene === Scene.INVENTORY}
            onClose={() => setScene(Scene.VILLAGE)}
            junk={gameState.junk}
            salt={gameState.salt}
            materials={gameState.materials}
            equipment={gameState.inventory.map((i: any) => i.name)}
            collection={gameState.collection}
            canPurify={gameState.mp > 0}
            onPurify={() => {
              const { newState, message } = applyPurify(gameState);
              setGameState(deepMergeSave(INITIAL_STATE, newState));
              alert(message);
            }}
            onCraft={() => {
              const { newState, message } = applyCraftEquipment(gameState);
              setGameState(deepMergeSave(INITIAL_STATE, newState));
              alert(message);
            }}
          />

          <KingdomModal
            open={scene === Scene.KINGDOM}
            onClose={() => setScene(Scene.VILLAGE)}
            buildings={getAssetBuildingsView(gameState)}
          />

          <CollectionModal
            open={scene === Scene.COLLECTION}
            onClose={() => setScene(Scene.VILLAGE)}
            collection={gameState.collection}
          />
        </div>
      )}

      {/* 하루 마감 리포트 */}
      <DailyLogModal
        open={showDailyLog}
        onClose={() => setShowDailyLog(false)}
        today={todayStr}
        hp={hpPercent}
        mp={gameState.mp}
        def={gameState.counters.defenseActionsToday}
        junkToday={gameState.counters.junkObtainedToday}
        defenseActionsToday={gameState.counters.defenseActionsToday}
        noSpendStreak={gameState.counters.noSpendStreak}
        pending={gameState.pending}
      />

      {/* ✅ 씨앗봉투 모달 */}
      <RewardModal
        open={rewardOpen}
        seedPackets={gameState.seedPackets || 0}
        lastReward={lastReward}
        onPull={handlePullSeed}
        onClose={() => setRewardOpen(false)}
      />

      {/* 디버그 Reset */}
      <div style={styles.debugArea}>
        <button type="button" onClick={handleReset}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    maxWidth: '420px',
    margin: '0 auto',
    minHeight: '100dvh',
    color: '#fff',
    fontFamily: '"NeoDungGeunMo", monospace',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 1s ease',
  },

  // ✅ “부모 높이 확정”을 위한 래퍼
  screenWrap: {
    position: 'relative',
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
  },

  decorLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 6,
    pointerEvents: 'none',
  },

  viewToggle: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 40,
    display: 'flex',
    gap: 4,
  },
  viewToggleBtn: {
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid #4b5563',
    fontSize: 11,
    color: '#e5e7eb',
    cursor: 'pointer',
    backgroundColor: '#020617',
  },

  topRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 50,
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  weatherBadge: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(6px)',
  },
  seedBtn: {
    padding: '6px 10px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(0,0,0,0.35)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 12,
  },

  debugArea: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    opacity: 0.4,
    fontSize: 10,
    zIndex: 60,
  },
};

export default MoneyRoomPage;
