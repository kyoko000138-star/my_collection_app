import React from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase } from '../moneyLuna';

interface VillageViewProps {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ user, onChangeScene }) => {
  if (!user) return <div className="text-white text-center mt-20">L O A D I N G . . .</div>;

  // 로직 계산
  const currentHpPercent = Math.max(0, Math.min(100, (user.currentBudget / user.maxBudget) * 100));
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = lastDay.getDate() - today.getDate();
  const dailySurvivalBudget = daysLeft > 0 ? Math.floor(user.currentBudget / daysLeft) : 0;
  const luna = calculateLunaPhase(user.lunaCycle);

  return (
    // [전체 컨테이너] 화면 꽉 채우기 & 스크롤 방지
    <div className="relative w-full h-full overflow-hidden select-none bg-black">

      {/* ---------------------------------------------------------------------------
          1. [배경 레이어] 프린세스 메이커처럼 '방 이미지'가 깔려야 함 
          * 실제 개발 시: backgroundColor 대신 backgroundImage: url('/assets/room_pixel_art.png') 사용 권장
      --------------------------------------------------------------------------- */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          // [임시 배경] 픽셀 아트 방 느낌을 내기 위한 CSS 패턴 (나중에 이미지로 교체하세요!)
          backgroundColor: '#3b3247',
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 40%)
          `,
          backgroundSize: '20px 20px, 20px 20px, 100% 100%'
        }}
      >
        {/* 창문 효과 (간이) */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-900 border-4 border-amber-900 opacity-80 shadow-inner">
           <div className="w-full h-1/2 border-b-4 border-amber-900"></div>
           <div className="absolute top-0 left-1/2 h-full w-1 bg-amber-900 -translate-x-1/2"></div>
           {/* 달 (Luna 상태) */}
           <div className="absolute top-4 right-4 text-2xl drop-shadow-[0_0_5px_rgba(255,255,100,0.8)]">
             {luna.isPeriod ? '🔴' : '🌙'}
           </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------------
          2. [캐릭터 레이어] 방 중앙에 서 있는 캐릭터
      --------------------------------------------------------------------------- */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-20 pointer-events-none">
        {/* 캐릭터 스프라이트 */}
        <div className="relative animate-bounce-slow">
           <div className="text-[100px] filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
             🧙‍♀️
           </div>
           {/* 그림자 */}
           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black opacity-40 rounded-[50%] blur-sm"></div>
        </div>

        {/* 대사창 (캐릭터 머리 위 말풍선) */}
        <div className="mt-4 bg-[#fff1cc] text-[#422006] px-4 py-2 rounded-lg border-2 border-[#422006] relative shadow-lg max-w-[80%] text-center">
          <p className="text-sm font-bold leading-tight">
             "{luna.isPeriod ? "오늘은 몸이 무거워..." : "이번 달도 무사히 넘겨야 해."}"
          </p>
          <div className="text-[10px] text-[#854d0e] mt-1 font-bold">
            (생존 {daysLeft}일 남음)
          </div>
          {/* 말풍선 꼬리 */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#fff1cc] border-t-2 border-l-2 border-[#422006] rotate-45"></div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------------
          3. [UI 레이어 - HUD] 화면 가장자리에 고정된 정보창 (스타듀밸리 스타일)
      --------------------------------------------------------------------------- */}
      
      {/* (1) 좌측 상단: 상태창 (나무 판자 느낌) */}
      <div className="absolute top-2 left-2 z-20 w-[160px]">
        <div className="bg-[#eec39a] border-[3px] border-[#8b5a2b] rounded p-2 shadow-[2px_2px_0_#000] relative">
          {/* 나사 못 장식 */}
          <div className="absolute top-1 left-1 w-1 h-1 bg-[#5d4037]"></div>
          <div className="absolute top-1 right-1 w-1 h-1 bg-[#5d4037]"></div>
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#5d4037]"></div>
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#5d4037]"></div>

          <div className="flex justify-between items-end mb-1 border-b border-[#c19a6b] pb-1">
             <span className="text-xs font-bold text-[#5d4037]">{user.name}</span>
             <span className="text-[10px] text-[#8b5a2b]">Lv.{user.level}</span>
          </div>

          {/* HP Bar (고전 RPG 스타일) */}
          <div className="relative w-full h-4 bg-[#3e2723] border border-[#5d4037] rounded-sm mb-1">
             <div 
               className="h-full bg-gradient-to-r from-green-400 to-green-600" 
               style={{ width: `${currentHpPercent}%` }}
             />
             <span className="absolute inset-0 text-[9px] text-white flex items-center justify-center drop-shadow-md">
               HP {Math.floor(currentHpPercent)}%
             </span>
          </div>
          
          {/* 예산 텍스트 */}
          <div className="text-right">
             <p className="text-[9px] text-[#5d4037]">남은 예산</p>
             <p className="text-sm font-bold text-[#8b5a2b] drop-shadow-sm">
               {user.currentBudget.toLocaleString()} G
             </p>
          </div>
        </div>
      </div>

      {/* (2) 우측 상단: 날짜/시간 (시계 느낌) */}
      <div className="absolute top-2 right-2 z-20">
         <div className="bg-[#3b82f6] border-[3px] border-[#1e3a8a] text-white px-3 py-1 rounded-full shadow-[2px_2px_0_#000] flex flex-col items-center">
            <span className="text-[10px] text-blue-100">Today Limit</span>
            <span className="text-sm font-bold text-yellow-300 drop-shadow-md">
              {dailySurvivalBudget.toLocaleString()}
            </span>
         </div>
      </div>

      {/* ---------------------------------------------------------------------------
          4. [UI 레이어 - 컨트롤러] 하단 메뉴 (포켓몬/GBA 스타일)
      --------------------------------------------------------------------------- */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-2 bg-gradient-to-t from-black via-black to-transparent">
        <div className="bg-[#fff1cc] border-[4px] border-[#6b4c35] rounded-lg p-1 shadow-[0_0_10px_rgba(0,0,0,0.8)] flex gap-1 h-[80px]">
          
          {/* 버튼 1: 공격 (빨강) */}
          <button 
            onClick={() => onChangeScene(Scene.WORLD_MAP)}
            className="flex-1 bg-[#ef4444] border-b-4 border-r-4 border-[#991b1b] active:border-0 active:translate-y-1 rounded hover:bg-red-400 transition-colors flex flex-col items-center justify-center group"
          >
            <span className="text-xl group-hover:-translate-y-1 transition-transform">⚔️</span>
            <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">지출</span>
          </button>

          {/* 버튼 2: 인벤토리 (파랑) */}
          <button 
            onClick={() => onChangeScene(Scene.INVENTORY)}
            className="flex-1 bg-[#3b82f6] border-b-4 border-r-4 border-[#1e40af] active:border-0 active:translate-y-1 rounded hover:bg-blue-400 transition-colors flex flex-col items-center justify-center group"
          >
             <span className="text-xl group-hover:-translate-y-1 transition-transform">🎒</span>
             <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">가방</span>
          </button>
          
          {/* 버튼 3: 자산 (초록) */}
          <button 
            onClick={() => onChangeScene(Scene.KINGDOM)}
            className="flex-1 bg-[#10b981] border-b-4 border-r-4 border-[#047857] active:border-0 active:translate-y-1 rounded hover:bg-green-400 transition-colors flex flex-col items-center justify-center group"
          >
             <span className="text-xl group-hover:-translate-y-1 transition-transform">🏰</span>
             <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">자산</span>
          </button>
          
           {/* 버튼 4: 도감 (노랑) */}
           <button 
            onClick={() => onChangeScene(Scene.COLLECTION)}
            className="flex-1 bg-[#f59e0b] border-b-4 border-r-4 border-[#b45309] active:border-0 active:translate-y-1 rounded hover:bg-yellow-400 transition-colors flex flex-col items-center justify-center group"
          >
             <span className="text-xl group-hover:-translate-y-1 transition-transform">📖</span>
             <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">도감</span>
          </button>

        </div>
      </div>

    </div>
  );
};
