import { initializeApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCp80DfyolQRG6lv8AUaIDWXYSOe_tWKo4",
  authDomain: "dieta-familiar-dbeca.firebaseapp.com",
  projectId: "dieta-familiar-dbeca",
  storageBucket: "dieta-familiar-dbeca.firebasestorage.app",
  messagingSenderId: "711070484643",
  appId: "1:711070484643:web:18d186e84489d605261716",
  measurementId: "G-72BZT8XMY6"
};

const app = initializeApp(firebaseConfig);

// Caché en el móvil: al abrir la app se ven al instante los últimos datos
// y se actualizan en segundo plano. También funciona sin cobertura.
let base;
try {
  base = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch (e) {
  console.warn("Sin caché local de Firestore", e);
  base = getFirestore(app);
}

export const db = base;