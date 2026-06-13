const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir los archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta API para generar el reporte
app.post('/api/reporte', (req, res) => {
    const { escuela, direccion, observaciones } = req.body;

    if (!escuela || !direccion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        // Crear el documento PDF en memoria
        const doc = new PDFDocument({ margin: 50 });

        // Configurar los headers de respuesta para descarga de archivo
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte.pdf`);

        // Conectar el flujo del PDF directamente a la respuesta HTTP
        doc.pipe(res);

        // --- Diseño del PDF ---
        // Título Principal
        doc.fillColor('#1A365D')
           .font('Helvetica-Bold')
           .fontSize(26)
           .text('REPORTE DE INFRAESTRUCTURA', { align: 'center' });
        
        doc.moveDown(0.5);
        
        // Línea divisoria decorativa
        doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#CBD5E1').stroke();
        doc.moveDown(1.5);

        // Datos de la Escuela
        doc.fillColor('#334155').font('Helvetica-Bold').fontSize(14).text('Datos del Establecimiento:');
        doc.moveDown(0.5);
        
        doc.font('Helvetica').fontSize(12).fillColor('#000000');
        doc.text(`Escuela: `, { continued: true }).font('Helvetica-Bold').text(escuela);
        doc.font('Helvetica').text(`Dirección: `, { continued: true }).font('Helvetica-Bold').text(direccion);
        
        doc.moveDown(1.5);

        // Sección de Observaciones o Hallazgos
        doc.fillColor('#334155').font('Helvetica-Bold').fontSize(14).text('Observaciones / Diagnóstico:');
        doc.moveDown(0.5);
        
        doc.font('Helvetica').fontSize(12).fillColor('#000000');
        doc.text(observaciones || 'No se registraron observaciones adicionales.', {
            align: 'justify',
            lineGap: 4
        });

        // Terminar y enviar el PDF
        doc.end();

    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: 'No se pudo generar el PDF' });
    }
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo perfectamente en http://localhost:${PORT}`);
});
