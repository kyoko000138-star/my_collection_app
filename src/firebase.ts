// src/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔧 Firebase 콘솔에서 가져온 설정값
const firebaseConfig = {
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

// Vite HMR 대비: 이미 초기화된 앱이 있으면 그걸 재사용
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase 서비스 인스턴스
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 🔑 우리가 Firestore 경로에서 쓰는 appId
//   예: artifacts / appId / users / ...
export const appId = 'my-collection-app';
// 👉 예전에 다른 문자열(예: 'private-archive') 쓰고 있었다면
//     여기 이 문자열만 그걸로 바꿔주면 돼요.

// 나머지 인스턴스 export
export { app, auth, db, storage };

