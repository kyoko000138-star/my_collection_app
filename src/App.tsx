// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';

import {
  ChevronLeft,
  Box,
  Flame,
  Coffee,
  Leaf,
  MapPin,
  Quote,
  Sparkles,
  Archive,
  Activity,
  Moon,
  Wallet,
} from 'lucide-react';

// 👉 페이지들
import CollectionsPage from './pages/CollectionsPage';
import IncensePage from './pages/IncensePage';
import TeaPage from './pages/TeaPage';
import JournalPage from './pages/JournalPage';
import TripsPage from './pages/TripsPage';
import WakaArchivePage from './pages/WakaArchivePage';
import BoredomPage from './pages/BoredomPage';
import MoneyRoomPage from './pages/MoneyRoomPage';

// --- 🎨 Design System: Art Museum (Black & White) ---
const theme = {
  colors: {
    bg: '#ffffff',
    ink: '#111111',
    inkLight: '#888888',
    border: '#e5e5e5',
  },
  fonts: {
    serif: '"Gowun Batang", "Noto Serif KR", serif',
    sans: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  },
};

// --- 🧱 Layout Component ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // ✅ 수정 1: 머니룸 페이지인지 확인
  const isMoneyRoom = location.pathname === '/money-room';

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#f0f0f0] py-0 sm:py-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap');
        
        body { 
          margin: 0; 
          font-family: ${theme.fonts.sans}; 
          color: ${theme.colors.ink};
          -webkit-font-smoothing: antialiased;
        }
        /* 스크롤바 숨기기 (선택사항) */
        ::-webkit-scrollbar { display: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: theme.colors.bg,
          
          // ✅ 수정 2: 전체 높이를 부모(body)에 맞춰 100%로 고정
          height: '100%', 
          
          boxShadow:
            '0 0 0 1px rgba(0,0,0,0.02), 0 30px 60px -15px rgba(0,0,0,0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          
          // ✅ 수정 3: 겉 껍데기는 스크롤 금지 (내부 main만 스크롤)
          overflow: 'hidden', 
        }}
      >
        {/* 홈이 아닐 때만 상단 바 */}
        {!isHome && (
          <header
            style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              // sticky 대신 상단 고정 효과를 위해 zIndex 유지
              zIndex: 50,
              borderBottom: `1px solid ${theme.colors.border}`,
              flexShrink: 0, // 헤더 크기 고정
            }}
          >
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: theme.colors.ink,
                padding: 0,
                marginRight: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={24} strokeWidth={1} />
            </button>
            <span
              style={{
                fontFamily: theme.fonts.serif,
                fontSize: '14px',
                fontWeight: 400,
                color: theme.colors.ink,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Private Archive
            </span>
          </header>
        )}

        {/* 메인 영역 */}
        <main
          style={{
            flex: 1, // 남은 공간 꽉 채우기
            padding: isHome ? '0' : '24px',
            position: 'relative',
            zIndex: 1,
            
            // ✅ 수정 4: 머니룸이면 스크롤 막고(게임화면), 아니면 스크롤 허용(auto)
            overflowY: isMoneyRoom ? 'hidden' : 'auto',
            
            // 모바일 터치 스크롤 부드럽게
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

// --- 🏷️ Category Section Component ---
const CategorySection: React.FC<{
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="fade-in" style={{ marginBottom: '48px' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${theme.colors.ink}`,
      }}
    >
      <Icon size={16} strokeWidth={1.5} color={theme.colors.ink} />
      <span
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: theme.colors.ink,
        }}
      >
        {title}
      </span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
      {children}
    </div>
  </div>
);

// --- 🖼️ Minimal Card ---
const MinimalCard: React.FC<{
  roomNo: string;
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
  path: string;
}> = ({ roomNo, title, desc, icon: Icon, path }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(path)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px 0',
        cursor: 'pointer',
        borderBottom: `1px solid ${theme.colors.border}`,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.paddingLeft = '10px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.paddingLeft = '0px';
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: '10px',
          color: theme.colors.inkLight,
          width: '32px',
          letterSpacing: '0.05em',
        }}
      >
        {roomNo}
      </div>

      <div style={{ flex: 1, padding: '0 16px' }}>
        <h3
          style={{
            fontFamily: theme.fonts.serif,
            fontSize: '17px',
            fontWeight: 400,
            color: theme.colors.ink,
            margin: '0 0 4px 0',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: theme.colors.inkLight,
            margin: 0,
            fontWeight: 300,
          }}
        >
          {desc}
        </p>
      </div>

      <div style={{ color: theme.colors.ink, opacity: 0.8 }}>
        <Icon size={18} strokeWidth={1} />
      </div>
    </div>
  );
};

// --- 🏠 Home Page ---
const HomePage: React.FC = () => {
  return (
    <div style={{ padding: '60px 24px 80px' }}>
      <div
        style={{ textAlign: 'center', marginBottom: '56px', marginTop: '20px' }}
        className="fade-in"
      >
        <h1
          style={{
            fontFamily: theme.fonts.sans,
            fontSize: '32px',
            fontWeight: 900,
            color: theme.colors.ink,
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em',
            lineHeight: 0.9,
          }}
        >
          MY
          <br />
          COLLECTION
        </h1>
        <div
          style={{
            fontFamily: theme.fonts.serif,
            fontSize: '12px',
            color: theme.colors.inkLight,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Private Archive
        </div>
      </div>

      <CategorySection title="Archive" icon={Archive}>
        <MinimalCard
          roomNo="01"
          title="문향 기록"
          desc="오늘 피운 향과 공기의 메모"
          icon={Flame}
          path="/incense"
        />
        <MinimalCard
          roomNo="02"
          title="소장품 기록"
          desc="향목 · 다구 · 기물"
          icon={Box}
          path="/collections"
        />
        <MinimalCard
          roomNo="03"
          title="찻자리 기록"
          desc="차와 시간이 머무는 곳"
          icon={Coffee}
          path="/tea"
        />
      </CategorySection>

      <CategorySection title="Active" icon={Activity}>
        <MinimalCard
          roomNo="04"
          title="여행 기록"
          desc="발자국과 시선이 닿은 곳"
          icon={MapPin}
          path="/trips"
        />
        <MinimalCard
          roomNo="05"
          title="오늘의 하루"
          desc="내면을 정리하는 일기"
          icon={Leaf}
          path="/journal"
        />
        <MinimalCard
          roomNo="06"
          title="이번 달 머니룸"
          desc="예산 · 무지출 · 작은 게임"
          icon={Wallet}
          path="/money-room"
          />
      </CategorySection>
   

      <CategorySection title="Healing" icon={Moon}>
        <MinimalCard
          roomNo="07"
          title="라운지"
          desc="다도 · 영상 · 작은 휴식"
          icon={Sparkles}
          path="/boredom"
        />
        <MinimalCard
          roomNo="08"
          title="오늘의 와카"
          desc="하루 한 편, 오래된 노래"
          icon={Quote}
          path="/waka"
        />
      </CategorySection>

      <div
        style={{ textAlign: 'center', marginTop: '60px', opacity: 0.3 }}
        className="fade-in"
      >
        <span
          style={{
            fontFamily: theme.fonts.sans,
            fontSize: '10px',
            color: theme.colors.ink,
            letterSpacing: '0.2em',
          }}
        >
          © 2025 JI YELIM
        </span>
      </div>
    </div>
  );
};

// --- 🔐 로그인 페이지 ---
const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider); // ✅ 모든 브라우저에서 팝업 방식
    } catch (e) {
      console.error('구글 로그인 실패', e);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div
        style={{
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: theme.fonts.serif,
            fontSize: 22,
            marginBottom: 8,
          }}
        >
          MY COLLECTION
        </h1>
        <p
          style={{
            fontSize: 13,
            color: '#666',
            marginBottom: 32,
          }}
        >
          개인 아카이브에 들어가기 위해
          <br />
          구글 계정으로 로그인해 주세요.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            border: '1px solid #ddd',
            borderRadius: 999,
            padding: '10px 18px',
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            backgroundColor: '#fff',
          }}
        >
          {loading ? '로그인 중...' : 'Google 계정으로 로그인'}
        </button>
      </div>
    </Layout>
  );
};

// --- 🚀 Main App Component ---
const App: React.FC = () => {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<null | { uid: string }>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({ uid: fbUser.uid });
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  if (!authReady) {
    return (
      <Layout>
        <div
          style={{
            padding: '80px 24px',
            textAlign: 'center',
            fontSize: 13,
            color: '#777',
          }}
        >
          개인 아카이브를 여는 중입니다...
        </div>
      </Layout>
    );
  }

  // 🔐 로그인 안 된 상태 → 로그인 화면
  if (!user) {
    return <LoginPage />;
  }

  // ✅ 로그인 완료 → 기존 라우트
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/incense" element={<IncensePage />} />
        <Route path="/tea" element={<TeaPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/money-room" element={<MoneyRoomPage />} />
        <Route path="/waka" element={<WakaArchivePage />} />
        <Route path="/boredom" element={<BoredomPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
