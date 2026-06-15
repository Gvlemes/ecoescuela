import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync, readdirSync } from "fs";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createServer } from "http";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

function encontrarRutaPublica() {
  const raizProyecto = process.cwd();
  const opcion1 = path.join(raizProyecto, "public");
  if (existsSync(path.join(opcion1, "index.html"))) return opcion1;
  const opcion2 = path.join(raizProyecto, "src", "public");
  if (existsSync(path.join(opcion2, "index.html"))) return opcion2;
  return opcion1;
}

const carpetaWeb = encontrarRutaPublica();
app.use(express.static(carpetaWeb));

// Inicialización de Firebase
let adminApp;
if (process.env.FIREBASE_PRIVATE_KEY_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON);
    adminApp = initializeApp({ credential: cert(serviceAccount) });
  } catch (error) {
    console.error("Error en Firebase:", error);
  }
} else {
  adminApp = initializeApp({ projectId: "escuelalimpia" });
}
const db = getFirestore(adminApp);

// Conexión de WebSockets
io.on("connection", (socket) => {
  console.log("🖥️ Panel de administración conectado via WebSocket");
});

// ==========================================
// ENDPOINTS
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

    // 🔥 EVENTO EN TIEMPO REAL: Avisa al admin que hay un nuevo reporte
    io.emit("nuevo-reporte");

    res.status(201).json({ ok: true, id: nuevoDoc.id });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

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

app.put("/api/resolver/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("reportes").doc(id).update({ estado: "Resuelto" });
    io.emit("nuevo-reporte"); // Actualiza también al resolver
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
});

app.delete("/api/eliminar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("reportes").doc(id).delete();
    io.emit("nuevo-reporte"); // Actualiza al eliminar
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
});

const PORT = process.env.PORT || 3000;
// NOTA: Cambiamos app.listen por httpServer.listen para habilitar los Sockets
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor en tiempo real activo en puerto ${PORT}`);
});
