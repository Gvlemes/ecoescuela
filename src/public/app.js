import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const app = express();

// Configuración de rutas estáticas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Soporte indispensable para recibir las imágenes en Base64 sin romper el servidor
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// === CORRECCIÓN CLAVE DE RUTA PARA EVITAR EL 'CANNOT GET' ===
// Busca la carpeta public tanto afuera de src como adentro por si acaso
const rutaPublica = existsSync(path.join(__dirname, "..", "public")) 
  ? path.join(__dirname, "..", "public") 
  : path.join(__dirname, "public");

app.use(express.static(rutaPublica));

// Inicialización segura de Firebase Admin mediante la variable de Render
let adminApp;
if (process.env.FIREBASE_PRIVATE_KEY_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON);
    adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("🔥 Conectado con éxito a Firebase Cloud Firestore.");
  } catch (error) {
    console.error("Error crítico leyendo las credenciales de Firebase:", error);
  }
} else {
  // Respaldo por si realizas pruebas locales en tu computadora
  adminApp = initializeApp({ projectId: "escuelalimpia" });
}

const db = getFirestore(adminApp);

// ==========================================
// RUTA 1: GUARDAR REPORTE (Desde el Alumno)
// ==========================================
app.post("/api/guardar", async (req, res) => {
  try {
    const { nombre, mensaje, foto } = req.body;
    
    const nuevoDoc = await db.collection("reportes").add({
      nombre: nombre || "Anónimo",
      mensaje: mensaje || "",
      foto: foto || "", 
      estado: "Pendiente", 
      fecha: new Date().toISOString()
    });

    res.status(201).json({ ok: true, id: nuevoDoc.id });
  } catch (error) {
    console.error("Error al insertar documento en Firebase:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ==========================================
// RUTA 2: OBTENER REPORTES (Para Consultas)
// ==========================================
app.get("/api/datos", async (req, res) => {
  try {
    const snapshot = await db.collection("reportes").get();
    const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenar por fecha de más reciente a más antiguo
    datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    res.status(200).json(datos);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Forzar al servidor a usar el puerto que Render asigne o el 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor activo de forma correcta en el puerto ${PORT}`);
});
