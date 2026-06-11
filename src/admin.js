import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp;

// Si estamos en Render, usaremos una variable de entorno que contendrá el JSON completo
if (process.env.FIREBASE_PRIVATE_KEY_JSON) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON);
  adminApp = initializeApp({
    credential: cert(serviceAccount)
  });
} else {
  // Configuración de respaldo para tu desarrollo local clásico
  adminApp = initializeApp({
    projectId: "escuelalimpia"
  });
}

export const db = getFirestore(adminApp);
