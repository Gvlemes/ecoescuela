import express from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// Configuraciones necesarias para usar __dirname con módulos ES (import)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// 1. Inicialización adaptada a tu entorno local y producción (Render)
let adminApp;

if (process.env.FIREBASE_PRIVATE_KEY_JSON) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON);
  adminApp = initializeApp({
    credential: cert(serviceAccount)
  });
} else {
  // Desarrollo local
  adminApp = initializeApp({
    projectId: "escuelalimpia"
  });
}

// Exportamos la base de datos Firestore tal como lo tenías
export const db = getFirestore(adminApp);

// ==========================================
// RUTA 1: OBTENER TODOS LOS REPORTES DESDE FIRESTORE
// ==========================================
app.get("/api/datos", async (req, res) => {
  try {
    // Cambia "reportes" si tu colección en Firestore se llama diferente (ej: "evidencias")
    const coleccionRef = db.collection("reportes");
    const snapshot = await coleccionRef.get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const listaReportes = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      
      listaReportes.push({
        id: doc.id, // En Firestore el ID viene directo del documento
        nombre: data.nombre || "Anónimo",
        mensaje: data.mensaje || "Sin descripción",
        estado: data.estado || "Pendiente",
        foto: data.foto || null, // URL pública directa que subió el alumno
        fecha: data.fecha || null
      });
    });

    // Ordenar por fecha de forma descendente (más nuevos primero)
    listaReportes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json(listaReportes);
  } catch (error) {
    console.error("Error al obtener reportes de Firestore:", error);
    res.status(500).json({ ok: false, error: "Error interno del servidor" });
  }
});

// ==========================================
// RUTA 2: ACTUALIZAR ESTADO A RESUELTO
// ==========================================
app.put("/api/resolver/:id", async (req, res) => {
  try {
    const idReporte = req.params.id;
    const docRef = db.collection("reportes").doc(idReporte);

    // En Firestore se utiliza update
    await docRef.update({ estado: "Resuelto" });

    res.json({ ok: true });
  } catch (error) {
    console.error("Error al resolver reporte en Firestore:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ==========================================
// RUTA 3: ELIMINAR REPORTE DEFINITIVAMENTE
// ==========================================
app.delete("/api/eliminar/:id", async (req, res) => {
  try {
    const idReporte = req.params.id;
    const docRef = db.collection("reportes").doc(idReporte);

    // Eliminamos el documento de la colección
    await docRef.delete();

    res.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar reporte de Firestore:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor de Escuela Limpia activo en http://localhost:${PUERTO}`);
});
