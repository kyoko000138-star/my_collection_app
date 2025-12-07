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


// src/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ 1) firebaseConfig: 여기는 "기존 파일에 있던 설정" 그대로 복붙하면 됨
//    (import.meta.env.VITE_... 쓰고 있었다면 그 코드 그대로 사용)
const firebaseConfig = {
  apiKey: "AIzaSyB_U8Zh16n250tTc7i8X8kKUpSVP5P337Y",
  authDomain: "my-project-0076-b774a.firebaseapp.com",
  databaseURL: "https://my-project-0076-b774a-default-rtdb.firebaseio.com",
  projectId: "my-project-0076-b774a",
  storageBucket: "my-project-0076-b774a.firebasestorage.app",
  messagingSenderId: "626792123184",
  appId: "1:626792123184:web:404e4b95dbd2f0796d16f5",
  measurementId: "G-EQSX25ZJFX"
};

// 이미 초기화된 앱이 있으면 재사용 (Vite HMR 대비)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ 2) 각 서비스 인스턴스 만들기
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ 3) appId: ***여기도 기존 firebase.ts에 있던 로직대로 맞춰줘야 함***
// 예전 코드가 이렇게 되어 있었다면:
//
//   export const appId = 'my-collection-app';
//
// 그 문자열을 그대로 유지해야 기존 Firestore 데이터랑 연결됨.
// 만약 원래 이런 코드가 없이 그냥 사용했다면 아래처럼 써도 됨.
const appId =
  // 이미 문자열 상수로 쓰던 게 있다면 그걸로 교체하기
  'my-collection-app';
// 또는 원래 이렇게 쓰고 있었다면 ↓
// const appId = app.options.appId as string;

// 최종 export: 🔥 이제 storage까지 같이 내보내기
export { app, auth, db, storage, appId };
