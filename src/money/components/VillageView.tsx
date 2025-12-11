import React from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase } from '../moneyLuna';

interface VillageViewProps {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
}

// [수정 포인트] export default가 아니라 export const로 변경
export const VillageView: React.FC<VillageViewProps> = ({ user, onChangeScene }) => {
  
  // 1. 생존 수치 계산
  const currentHpPercent = Math.max(0, Math.min(100, (user.currentBudget / user.maxBudget) * 100));
  
  // 날짜 계산 (남은 일수)
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = lastDay.getDate() - today.getDate();
  
  // 1일 권장 생존 금액
  const dailySurvivalBudget = daysLeft > 0 ? Math.floor(user.currentBudget / daysLeft) : 0;

  // Luna 상태
  const luna = calculateLunaPhase(user.lunaCycle);

  return (
    <div className="flex flex-col items-center w-full h-full bg-black text-gray-200 relative p-4 animate-fadeIn">
      
      {/* --- 1. 상단 정보 (HUD) --- */}
      <div className="w-full border-2 border-gray-600 rounded p-2 mb-4 bg-gray-900">
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm text-gray-400">LV.{user.level} {user.name}</span>
          <span className="text-xs text-yellow-500">{user.jobTitle}</span>
        </div>
        
        {/* HP Bar (예산) */}
        <div className="relative w-full h-6 bg-gray-800 border border-gray-600 rounded">
          <div 
            className={`h-full transition-all duration-500 ${
              currentHpPercent < 20 ? 'bg-red-600 animate-pulse' : 'bg-green-700'
            }`}
            style={{ width: `${currentHpPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold shadow-black drop-shadow-md">
            HP {user.currentBudget.toLocaleString()} / {user.maxBudget.toLocaleString()}
          </span>
        </div>

        {/* MP Bar (의지력) */}
        <div className="relative w-full h-2 mt-1 bg-gray-800 rounded">
          <div 
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(user.mp / user.maxMp) * 100}%` }}
          />
        </div>
      </div>

      {/* --- 2. 메인 비주얼 (내 방) --- */}
      <div className="flex-1 w-full relative flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg bg-gray-800 bg-opacity-50 mb-4 overflow-hidden">
        
        {/* 캐릭터 (중앙) */}
        <div className="flex flex-col items-center animate-float">
          <div className="text-6xl mb-2">🧙</div> 
          <div className="text-xs text-gray-400 bg-black px-2 rounded-full border border-gray-600">
             생존 {daysLeft}일 남음
          </div>
        </div>

        {/* Luna 상태 표시 */}
        <div className="absolute top-2 right-2 text-right">
            <div className={`text-xs px-2 py-1 rounded border ${luna.isPeriod ? 'border-red-500 text-red-400' : 'border-gray-600 text-gray-500'}`}>
                Luna: {luna.phaseName}
            </div>
            {luna.isPeriod && <div className="text-[10px] text-red-500 blink">⚠️ 환경 난이도 상승</div>}
        </div>
      </div>

      {/* --- 3. 생존 가이드 (텍스트) --- */}
      <div className="w-full text-center mb-6">
        <p className="text-gray-400 text-sm mb-1">오늘의 생존 한계선</p>
        <p className="text-2xl text-white font-bold glitch-effect">
          {dailySurvivalBudget.toLocaleString()} G
        </p>
      </div>

      {/* --- 4. 행동 메뉴 (Menu) --- */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <button 
          onClick={() => onChangeScene(Scene.WORLD_MAP)}
          className="p-4 border-2 border-red-900 bg-red-950 hover:bg-red-900 text-red-200 rounded flex flex-col items-center transition-transform active:scale-95"
        >
          <span className="text-2xl mb-1">⚔️</span>
          <span className="text-sm font-bold">지출(Attack)</span>
        </button>

        <button 
          onClick={() => onChangeScene(Scene.INVENTORY)}
          className="p-4 border-2 border-blue-900 bg-blue-950 hover:bg-blue-900 text-blue-200 rounded flex flex-col items-center transition-transform active:scale-95"
        >
          <span className="text-2xl mb-1">🎒</span>
          <span className="text-sm font-bold">가방/정비</span>
        </button>

        <button 
          onClick={() => onChangeScene(Scene.KINGDOM)}
          className="p-3 border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center justify-center gap-2"
        >
          <span>🏰 자산 관리</span>
        </button>

        <button 
          onClick={() => onChangeScene(Scene.COLLECTION)}
          className="p-3 border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center justify-center gap-2"
        >
          <span>📖 도감 확인</span>
        </button>
      </div>

    </div>
  );
};
