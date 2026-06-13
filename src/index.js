import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { db } from "./admin.js"; // Asegúrate de que admin.js también esté dentro de la carpeta src

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aumentamos el límite de tamaño para poder recibir las fotos en Base64 sin problemas
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// CORRECCIÓN DE RUTA: Como index.js está dentro de 'src', subimos un nivel ('..') para encontrar la carpeta 'public'
app.use(express.static(path.join(__dirname, "..", "public")));

// RUTA 1: Guardar un reporte (con foto y estado pendiente)
app.post("/api/guardar", async (req, res) => {
  try {
    const { nombre, mensaje, foto, estado } = req.body;
    
    const nuevoDoc = await db.collection("reportes").add({
      nombre: nombre || "Anónimo",
      mensaje: mensaje || "",
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
    const snapshot = await db.collection("reportes").get();
    const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenamos por fecha directamente en Node.js para evitar errores de índices en Firestore
    datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
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

const PORT = process.env.PORT || 10000; // Cambia el respaldo a 10000

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo y escuchando en el puerto ${PORT}`);
});
