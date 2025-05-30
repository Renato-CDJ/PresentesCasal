
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDyIEHrdcMttMA1RylqqG_wokheP5EcIc4",
  authDomain: "presentescasal.firebaseapp.com",
  projectId: "presentescasal",
  storageBucket: "presentescasal.firebasestorage.app",
  messagingSenderId: "518416733032",
  appId: "1:518416733032:web:c6ccf8b438b5563864bcdd",
  measurementId: "G-VECFNQVX87"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
};
