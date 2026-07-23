// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAhb2gZY4pZ-DPJ3v1j3Bf8L8POtzQlZyM",
  authDomain: "cefrcenter-a22f3.firebaseapp.com",
  projectId: "cefrcenter-a22f3",
  storageBucket: "cefrcenter-a22f3.firebasestorage.app",
  messagingSenderId: "19501884732",
  appId: "1:19501884732:web:ecbca22cdb4102395e6a39",
  measurementId: "G-4N0XZGFJMF"
};

let analytics = null;
let auth = null;
let provider = null;

try {
  const app = initializeApp(firebaseConfig);
  analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  setPersistence(auth, browserLocalPersistence).catch(() => {});
} catch (e) {
  console.warn("Firebase init failed, continuing without auth analytics.", e);
  auth = null;
  provider = null;
}

export { auth, provider, analytics };