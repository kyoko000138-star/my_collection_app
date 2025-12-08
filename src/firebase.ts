// src/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔧 Firebase 콘솔에서 가져온 설정값
const firebaseConfig = {
  apiKey: "AIzaSyB_U8Zh16n250tTc7i8X8kKUpSVP5P337Y",
  authDomain: "my-project-0076-b774a.firebaseapp.com",
  projectId: "my-project-0076-b774a",
  storageBucket: "my-project-0076-b774a.firebasestorage.app",
  messagingSenderId: "626792123184",
  appId: "1:626792123184:web:404e4b95dbd2f0796d16f5",
 // appId는 꼭 필요하진 않아서 생략해도 동작함
  // appId: '콘솔에서 복사한 appId를 쓰고 싶으면 여기에 넣기'
};

/ 🔥 Firebase App (중복 초기화 방지)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔐 Auth + Google 로그인 프로바이더
const auth = getAuth(app);

// ❗❗ 여기만 이렇게 수정!
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// 🗂 Firestore + Storage
const db = getFirestore(app);
const storage = getStorage(app);

// 📁 Firestore 네임스페이스
const appId = 'my-collection-app';

// ✅ 최종 export (여기서만 한 번에 export)
export { app, auth, db, storage, googleProvider, appId };
