import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB89A8A5C04TwrGfu4_2J-usdwfctD_FZY",
  authDomain: "neu-library-15439.firebaseapp.com",
  projectId: "neu-library-15439",
  storageBucket: "neu-library-15439.firebasestorage.app",
  messagingSenderId: "144360805307",
  appId: "1:144360805307:web:d91c6cf2e8e04159b96a9e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
export default app;
