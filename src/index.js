import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { db } from "./admin.js";

dotenv.config();

// Inicializamos la variable app (Debe ir AQUÍ, antes de usarla)
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aumentamos el límite de tamaño para poder recibir las fotos en Base64 sin problemas
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Hace que la carpeta "public" sea visible para el navegador
app.use(express.static(path.join(__dirname, "public")));

// RUTA 1: Guardar un reporte (con foto y estado pendiente)
app.post("/api/guardar", async (req, res) => {
  try {
    const { nombre, mensaje, foto, estado } = req.body;
    
    const nuevoDoc = await db.collection("reportes").add({
      nombre,
      mensaje,
      foto: foto || "", 
      estado: estado || "Pendiente", 
      fecha: new Date().toISOString()
    });

    res.status(201).json({ ok: true, id: nuevoDoc.id, msg: "¡Guardado en Firestore!" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// RUTA 2: Obtener todos los datos almacenados
app.get("/api/datos", async (req, res) => {
  try {
    const snapshot = await db.collection("reportes").orderBy("fecha", "desc").get();
    const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(datos);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// RUTA 3: Permitir al administrador cambiar el estado a "Resuelto"
app.put("/api/resolver/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("reportes").doc(id).update({ estado: "Resuelto" });
    res.status(200).json({ ok: true, msg: "Reporte marcado como resuelto" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// RUTA 4: Eliminar un reporte de Firestore usando su ID único
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
app.listen(PORT, () => console.log(`🚀 Servidor listo en http://localhost:${PORT}`));
