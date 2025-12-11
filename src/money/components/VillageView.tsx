import React from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase } from '../moneyLuna';

interface VillageViewProps {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ user, onChangeScene }) => {
  if (!user) return <div className="text-center mt-20">시스템 로딩 중...</div>;

  // 계산 로직
  const currentHpPercent = Math.max(0, Math.min(100, (user.currentBudget / user.maxBudget) * 100));
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = lastDay.getDate() - today.getDate();
  const dailySurvivalBudget = daysLeft > 0 ? Math.floor(user.currentBudget / daysLeft) : 0;
  const luna = calculateLunaPhase(user.lunaCycle);

  // HP 바 색상 결정 (초록 -> 노랑 -> 빨강)
  let hpColor = '#22c55e'; // Green
  if (currentHpPercent < 50) hpColor = '#eab308'; // Yellow
  if (currentHpPercent < 20) hpColor = '#ef4444'; // Red

  return (
    <div className="flex flex-col w-full h-full bg-[#1a1b26] text-white relative overflow-hidden select-none">
      
      {/* CRT 스캔라인 효과 (레트로 느낌 UP) */}
      <div className="crt-overlay" />

      {/* --- [HEADER] 상태창 영역 (RPG Status Window) --- */}
      <div className="p-4 z-10">
        <div className="rpg-window p-3 mb-2 flex flex-col gap-1">
          <div className="flex justify-between items-end border-b-2 border-dashed border-gray-600 pb-1 mb-2">
            <span className="text-lg text-yellow-400 drop-shadow-md">Lv.{user.level} {user.name}</span>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              {user.jobTitle}
            </span>
          </div>

          {/* HP Bar (두툼한 스타일) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold w-6 text-right text-red-400">HP</span>
            <div className="hp-container flex-1 h-8 relative">
              <div 
                className="h-full transition-all duration-500 relative"
                style={{ 
                  width: `${currentHpPercent}%`, 
                  backgroundColor: hpColor,
                  boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.3)' // 입체감
                }}
              >
                {/* 반짝이는 효과 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-30"></div>
              </div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] z-10">
                {user.currentBudget.toLocaleString()} / {user.maxBudget.toLocaleString()}
              </span>
            </div>
          </div>

          {/* MP Bar */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold w-6 text-right text-blue-400">MP</span>
            <div className="w-full bg-gray-800 h-3 border-2 border-gray-600 rounded-full overflow-hidden">
               <div 
                className="h-full bg-blue-500"
                style={{ width: `${(user.mp / user.maxMp) * 100}%` }}
               />
            </div>
            <span className="text-xs text-gray-400 w-8">{user.mp}</span>
          </div>
        </div>
      </div>

      {/* --- [MAIN] 캐릭터 룸 (프린세스 메이커 스타일) --- */}
      <div className="flex-1 relative flex flex-col items-center justify-center z-0">
        
        {/* 방 배경 장식 (CSS로 창문/벽 표현) */}
        <div className="absolute inset-4 border-4 border-[#2d3748] bg-[#23273a] opacity-50 rounded-xl" />
        
        {/* 캐릭터 & 말풍선 */}
        <div className="relative z-10 flex flex-col items-center animate-bounce-slow">
          {/* 말풍선 */}
          <div className="bg-white text-black px-4 py-2 rounded-xl border-4 border-gray-300 mb-4 relative shadow-lg">
             <p className="text-xs font-bold text-center">
               {luna.isPeriod ? "몸이 무겁다..." : "오늘도 버텨볼까?"}
             </p>
             <p className="text-[10px] text-gray-500 text-center mt-1">
               (생존 {daysLeft}일 남음)
             </p>
             {/* 말풍선 꼬리 */}
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b-4 border-r-4 border-gray-300"></div>
          </div>

          {/* 캐릭터 (이모지 크기 키움) */}
          <div className="text-8xl filter drop-shadow-2xl grayscale-[0.2]">
            🧙
          </div>
        </div>

        {/* 오늘의 생존 한계선 (방 바닥에 적힌 느낌) */}
        <div className="mt-6 text-center z-10">
          <p className="text-gray-500 text-xs mb-1 bg-black bg-opacity-50 px-2 rounded">Today's Limit</p>
          <p className={`text-3xl font-bold ${currentHpPercent < 20 ? 'glitch-text text-red-500' : 'text-white'}`}>
            {dailySurvivalBudget.toLocaleString()} <span className="text-sm">G</span>
          </p>
        </div>
      </div>

      {/* --- [FOOTER] 컨트롤 패널 (게임보이 버튼 스타일) --- */}
      <div className="p-4 bg-[#111] border-t-4 border-gray-700 z-10">
        <div className="grid grid-cols-2 gap-3">
          
          <button 
            onClick={() => onChangeScene(Scene.WORLD_MAP)}
            className="rpg-btn bg-[#ef4444] text-white p-4 rounded active:scale-95 flex flex-col items-center"
          >
            <span className="text-2xl mb-1 drop-shadow-md">⚔️</span>
            <span className="text-sm font-bold">지출 (Attack)</span>
          </button>

          <button 
            onClick={() => onChangeScene(Scene.INVENTORY)}
            className="rpg-btn bg-[#3b82f6] text-white p-4 rounded active:scale-95 flex flex-col items-center"
          >
            <span className="text-2xl mb-1 drop-shadow-md">🎒</span>
            <span className="text-sm font-bold">가방 (Item)</span>
          </button>

          <button 
            onClick={() => onChangeScene(Scene.KINGDOM)}
            className="rpg-btn bg-[#4b5563] text-gray-200 p-3 rounded active:scale-95 text-xs"
          >
            🏰 자산 관리
          </button>

          <button 
            onClick={() => onChangeScene(Scene.COLLECTION)}
            className="rpg-btn bg-[#4b5563] text-gray-200 p-3 rounded active:scale-95 text-xs"
          >
            📖 도감
          </button>

        </div>
      </div>

    </div>
  );
};
