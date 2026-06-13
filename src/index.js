const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');
const admin = require('firebase-admin');

const app = express();
// Render asigna un puerto dinámico mediante la variable de entorno PORT
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta estática "src/public" correctamente
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar Firebase Admin buscando 'llave.json' en la raíz del proyecto
try {
    if (!admin.apps.length) {
        // En Render, process.cwd() apunta a la raíz del repositorio
        const serviceAccountPath = path.join(process.cwd(), 'llave.json');
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
        console.log("Firebase inicializado correctamente.");
    }
} catch (error) {
    console.error('Error crítico inicializando Firebase:', error);
}

const db = admin.firestore();

// Endpoint para guardar en Firebase y generar el PDF
app.post('/api/reporte', async (req, res) => {
    const { escuela, direccion, observaciones } = req.body;

    if (!escuela || !direccion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        // 1. Guardar los datos del reporte en Firestore
        await db.collection('reportes').add({
            escuela,
            direccion,
            observaciones: observaciones || 'No se registraron observaciones adicionales.',
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        });

        // 2. Configurar la respuesta HTTP para descargar el PDF al instante
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${escuela.replace(/\s+/g, '_')}.pdf`);

        // 3. Crear el PDF en memoria y enviarlo directamente al cliente
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        // --- Estructura visual del PDF ---
        doc.fillColor('#1A365D').font('Helvetica-Bold').fontSize(26).text('REPORTE DE INFRAESTRUCTURA', { align: 'center' });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#CBD5E1').stroke();
        doc.moveDown(1.5);

        doc.fillColor('#334155').font('Helvetica-Bold').fontSize(14).text('Datos del Establecimiento:');
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(12).fillColor('#000000');
        doc.text(`Escuela: `, { continued: true }).font('Helvetica-Bold').text(escuela);
        doc.font('Helvetica').text(`Dirección: `, { continued: true }).font('Helvetica-Bold').text(direccion);
        doc.moveDown(1.5);

        doc.fillColor('#334155').font('Helvetica-Bold').fontSize(14).text('Observaciones / Diagnóstico:');
        doc.moveDown(0.5);
        doc.font('Helvetica').text(observaciones || 'No se registraron observaciones adicionales.', { align: 'justify', lineGap: 4 });

        doc.end();

    } catch (error) {
        console.error('Error procesando el reporte:', error);
        res.status(500).json({ error: 'Error interno al procesar el reporte' });
    }
});

// En Render el servidor SI debe quedarse escuchando siempre
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
