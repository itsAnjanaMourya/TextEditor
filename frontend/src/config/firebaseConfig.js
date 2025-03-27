import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7IBIRQiMaowebMd5XunmGvKPLBY99qUg",
  authDomain:"texteditor-53f16.firebaseapp.com" ,
  projectId: "texteditor-53f16",
  storageBucket: "texteditor-53f16.firebasestorage.app" ,
  messagingSenderId: "42051397447",
  appId: "42051397447:web:24988e5cc6728016e88e62",
  measurementId: "G-1GEP5C0E7D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
