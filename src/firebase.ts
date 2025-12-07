// src/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ✅ Firebase 콘솔에서 복사해 온 설정 값으로 교체해줘!
const firebaseConfig = {
  apiKey: 'AIzaSyB_U8Zh16n250tTc7i8X8kKUpSVP5P337Y',
  authDomain: 'my-project-0076-b774a.firebaseapp.com',
  projectId: 'my-project-0076-b774a',
  // 있으면 아래 값들도 같이 넣어주면 좋아요 (콘솔에서 그대로 복붙)
  // storageBucket: 'my-project-0076-b774a.appspot.com',
  // messagingSenderId: '...',
  // appId: '...',
};

// 🔥 중복 초기화 방지
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 공용 인스턴스
export const auth = getAuth(app);
export const db = getFirestore(app);

// 🔑 Google 로그인용 Provider
export const googleProvider = new GoogleAuthProvider();

// Firestore에서 상위 키로 쓰고 싶으면 아무 문자열이나
export const appId = 'my-collection-app';

export default app;
