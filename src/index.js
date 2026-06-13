import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync, readdirSync } from "fs";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// ==========================================
// 🔍 BUSCADOR AUTOMÁTICO DE CARPETA PÚBLICA
// ==========================================
function encontrarRutaPublica() {
  const raizProyecto = process.cwd();
  
  const opcion1 = path.join(raizProyecto, "public");
  if (existsSync(path.join(opcion1, "index.html"))) return opcion1;

  const opcion2 = path.join(raizProyecto, "src", "public");
  if (existsSync(path.join(opcion2, "index.html"))) return opcion2;

  try {
    const archivos = readdirSync(raizProyecto, { withFileTypes: true });
    for (const archivo of archivos) {
      if (archivo.isDirectory() && archivo.name !== "node_modules" && archivo.name !== ".git" && archivo.name !== "src") {
        const rutaPosible = path.join(raizProyecto, archivo.name);
        if (existsSync(path.join(rutaPosible, "index.html"))) {
          return rutaPosible;
        }
      }
    }
  } catch (e) {
    console.log("Error buscando directorios:", e);
  }

  return opcion1;
}

const carpetaWeb = encontrarRutaPublica();
app.use(express.static(carpetaWeb));

app.get("/", (req, res) => {
  res.sendFile(path.join(carpetaWeb, "index.html"));
});

// ==========================================
// CONFIGURACIÓN DE FIREBASE
// ==========================================
let adminApp;
if (process.env.FIREBASE_PRIVATE_KEY_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON);
    adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error("Error cargando credenciales de Firebase:", error);
  }
} else {
  adminApp = initializeApp({ projectId: "escuelalimpia" });
}

const db = getFirestore(adminApp);

// ==========================================
// ENDPOINTS DE LA API (TODOS INCLUIDOS)
// ==========================================

// 1. GUARDAR REPORTE
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
    res.status(500).json({ ok: false, error: error.message });
  }
});

// 2. OBTENER REPORTES
app.get("/api/datos", async (req, res) => {
  try {
    const snapshot = await db.collection("reportes").get();
    const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    res.status(200).json(datos);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// 3. MARCAR COMO RESUELTO
app.put("/api/resolver/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("reportes").doc(id).update({ estado: "Resuelto" });
    res.status(200).json({ ok: true, msg: "Reporte marcado como resuelto" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// 4. ELIMINAR REPORTE
app.delete("/api/eliminar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("reportes").doc(id).delete();
    res.status(200).json({ ok: true, msg: "Documento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
