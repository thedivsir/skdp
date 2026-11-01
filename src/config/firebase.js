import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeNPrghr4qRIBLw31du8wQGNoFkZpG4go",
  authDomain: "skdm-spc.firebaseapp.com",
  projectId: "skdm-spc",
  storageBucket: "skdm-spc.firebasestorage.app",
  messagingSenderId: "935785103895",
  appId: "1:935785103895:web:fb7eccc77e9b972f831252",
  measurementId: "G-VJ6Y385SDG",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
