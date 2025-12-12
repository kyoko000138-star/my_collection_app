// src/money/components/VillageView.tsx

import React from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase, getLunaTheme } from '../money/moneyLuna';

// 대화 시스템
import { DialogueBox } from '../game/components/DialogueBox';
import { useDialogue } from '../game/useDialogue';
import { FIRST_MEET_ANGEL_NORMAL } from '../game/dialogueScriptsFirstMeet';

interface VillageViewProps {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
  onDayEnd: () => void; // 🛏 여관에서 쉬기 (하루 마감)
}

export const VillageView: React.FC<VillageViewProps> = ({
  user,
  onChangeScene,
  onDayEnd,
}) => {



  // VillageView.tsx 스타일 부분 수정 제안

const styles = {
  // 전체 배경: 어두운 던전 느낌 or 잔디 느낌
  container: {
    width: '100%', height: '100%',
    backgroundColor: '#2d3748', // 어두운 남색
    // 도트 패턴 (CSS로 구현)
    backgroundImage: 'radial-gradient(#4a5568 15%, transparent 16%)',
    backgroundSize: '16px 16px', 
    position: 'relative',
    color: '#fff',
    fontFamily: '"NeoDungGeunMo", monospace', // 폰트 필수
  },

  // 캐릭터 (이모지 대신 픽셀 느낌 확대)
  characterSprite: {
    fontSize: '80px',
    filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.5))', // 그림자도 딱딱하게
    animation: 'bounce 2s infinite', // 둥실둥실
  },

  // 대화창 (RPG 스타일)
  dialogBox: {
    position: 'absolute', bottom: '120px', left: '10px', right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // 반투명 검정
    border: '4px solid #fff', // 흰색 굵은 테두리
    borderRadius: '8px',
    padding: '16px',
    color: '#fff',
    fontSize: '16px',
    lineHeight: '1.6',
    boxShadow: '0 8px 0 rgba(0,0,0,0.3)',
  },

  // 하단 메뉴 (2x2 그리드)
  controllerArea: {
    position: 'absolute', bottom: '10px', left: '10px', right: '10px',
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '8px',
    padding: '8px',
    backgroundColor: '#4a5568',
    border: '4px solid #cbd5e0',
    borderRadius: '4px'
  },
  
  // 버튼 스타일
  rpgButton: {
    backgroundColor: '#3182ce', // 파판 파란색
    color: 'white',
    border: '2px solid #bee3f8', // 밝은 테두리
    boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.4)', // 입체감
    padding: '12px',
    fontFamily: 'inherit',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left' as 'left', // 텍스트 왼쪽 정렬 (고전 느낌)
  }
};
  // --- 대화 훅 세팅 ---
  const { currentLine, visible, startScript, next } = useDialogue();

  const handleClickAngel = () => {
    // TODO: 나중에 컨디션에 따라 BAD / NORMAL 분기 가능
    startScript(FIRST_MEET_ANGEL_NORMAL);
  };

  if (!user) {
    return (
      <div className="text-white text-center mt-20">L O A D I N G . . .</div>
    );
  }

  const currentHpPercent = Math.max(
    0,
    Math.min(100, (user.currentBudget / user.maxBudget) * 100),
  );

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = lastDay.getDate() - today.getDate();
  const dailySurvivalBudget =
    daysLeft > 0 ? Math.floor(user.currentBudget / daysLeft) : 0;

  const luna = calculateLunaPhase(user.lunaCycle);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-black">
      {/* 1. 배경 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#3b3247',
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 40%)
          `,
          backgroundSize: '20px 20px, 20px 20px, 100% 100%',
        }}
      >
        {/* 창문 + 달 상태 */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-900 border-4 border-amber-900 opacity-80 shadow-inner">
          <div className="w-full h-1/2 border-b-4 border-amber-900" />
          <div className="absolute top-0 left-1/2 h-full w-1 bg-amber-900 -translate-x-1/2" />
          <div className="absolute top-4 right-4 text-2xl drop-shadow-[0_0_5px_rgba(255,255,100,0.8)]">
            {luna.isPeriod ? '🔴' : '🌙'}
          </div>
        </div>
      </div>

      {/* 2. 캐릭터 + 내적독백 */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-20 pointer-events-none">
        <div className="relative animate-bounce-slow">
          <div className="text-[100px] filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            🧙‍♀️
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black opacity-40 rounded-[50%] blur-sm" />
        </div>

        <div className="mt-4 bg-[#fff1cc] text-[#422006] px-4 py-2 rounded-lg border-2 border-[#422006] relative shadow-lg max-w-[80%] text-center">
          <p className="text-sm font-bold leading-tight">
            "
            {luna.isPeriod
              ? '오늘은 몸이 무거워...'
              : '이번 달도 무사히 넘겨야 해.'}
            "
          </p>
          <div className="text-[10px] text-[#854d0e] mt-1 font-bold">
            (생존 {daysLeft}일 남음)
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#fff1cc] border-t-2 border-l-2 border-[#422006] rotate-45" />
        </div>
      </div>

      {/* 👼 천사 테스트 버튼 */}
      <button
        type="button"
        onClick={handleClickAngel}
        className="absolute top-24 right-4 z-20 bg-[#f9e7c8] border border-[#8b5a2b] rounded px-2 py-1 text-[10px] shadow-md hover:bg-[#ffe7b9]"
      >
        👼 천사에게 말 걸기
      </button>

      {/* 🛏 여관에서 쉬기 = 하루 마감 */}
      <button
        type="button"
        onClick={onDayEnd}
        className="absolute bottom-24 left-4 z-20 bg-[#facc15] border border-[#854d0e] rounded px-3 py-1 text-[10px] shadow-md hover:bg-[#fcd34d]"
      >
        🛏 여관에서 쉬기
      </button>

      {/* 3. 좌측 상단 상태창 */}
      <div className="absolute top-2 left-2 z-20 w-[160px]">
        <div className="bg-[#eec39a] border-[3px] border-[#8b5a2b] rounded p-2 shadow-[2px_2px_0_#000] relative">
          <div className="absolute top-1 left-1 w-1 h-1 bg-[#5d4037]" />
          <div className="absolute top-1 right-1 w-1 h-1 bg-[#5d4037]" />
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#5d4037]" />
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#5d4037]" />

          <div className="flex justify-between items-end mb-1 border-b border-[#c19a6b] pb-1">
            <span className="text-xs font-bold text-[#5d4037]">
              {user.name}
            </span>
            <span className="text-[10px] text-[#8b5a2b]">
              Lv.{user.level}
            </span>
          </div>

          {/* HP 바 = 예산 퍼센트 */}
          <div className="relative w-full h-4 bg-[#3e2723] border border-[#5d4037] rounded-sm mb-1">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
              style={{ width: `${currentHpPercent}%` }}
            />
            <span className="absolute inset-0 text-[9px] text-white flex items-center justify-center drop-shadow-md">
              HP {Math.floor(currentHpPercent)}%
            </span>
          </div>

          <div className="text-right">
            <p className="text-[9px] text-[#5d4037]">남은 예산</p>
            <p className="text-sm font-bold text-[#8b5a2b] drop-shadow-sm">
              {user.currentBudget.toLocaleString()} G
            </p>
          </div>
        </div>
      </div>

      {/* 우측 상단: Today Limit (생존 예산) */}
      <div className="absolute top-2 right-2 z-20">
        <div className="bg-[#3b82f6] border-[3px] border-[#1e3a8a] text-white px-3 py-1 rounded-full shadow-[2px_2px_0_#000] flex flex-col items-center">
          <span className="text-[10px] text-blue-100">Today Limit</span>
          <span className="text-sm font-bold text-yellow-300 drop-shadow-md">
            {dailySurvivalBudget.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 하단 컨트롤러 (전투 / 가방 / 자산 / 도감) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-2 bg-gradient-to-t from-black via-black to-transparent">
        <div className="bg-[#fff1cc] border-[4px] border-[#6b4c35] rounded-lg p-1 shadow-[0_0_10px_rgba(0,0,0,0.8)] flex gap-1 h-[80px]">
          <button
            type="button"
            onClick={() => onChangeScene(Scene.WORLD_MAP)}
            className="flex-1 bg-[#ef4444] border-b-4 border-r-4 border-[#991b1b] active:border-0 active:translate-y-1 rounded hover:bg-red-400 transition-colors flex flex-col items-center justify-center group"
          >
            <span className="text-xl group-hover:-translate-y-1 transition-transform">
              ⚔️
            </span>
            <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">
              지출
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeScene(Scene.INVENTORY)}
            className="flex-1 bg-[#3b82f6] border-b-4 border-r-4 border-[#1e40af] active:border-0 active:translate-y-1 rounded hover:bg-blue-400 transition-colors flex flex-col items-center justify-center group"
          >
            <span className="text-xl group-hover:-translate-y-1 transition-transform">
              🎒
            </span>
            <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">
              가방
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeScene(Scene.KINGDOM)}
            className="flex-1 bg-[#10b981] border-b-4 border-r-4 border-[#047857] active:border-0 active:translate-y-1 rounded hover:bg-green-400 transition-colors flex flex-col items-center justify-center group"
          >
            <span className="text-xl group-hover:-translate-y-1 transition-transform">
              🏰
            </span>
            <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">
              자산
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeScene(Scene.COLLECTION)}
            className="flex-1 bg-[#f59e0b] border-b-4 border-r-4 border-[#b45309] active:border-0 active:translate-y-1 rounded hover:bg-yellow-400 transition-colors flex flex-col items-center justify-center group"
          >
            <span className="text-xl group-hover:-translate-y-1 transition-transform">
              📖
            </span>
            <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">
              도감
            </span>
          </button>
        </div>
      </div>

      {/* 공용 대화창 */}
      <DialogueBox line={currentLine} visible={visible} onNext={next} />
    </div>
  );
};
