const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS y JSON para que Firebase funcione desde el navegador sin bloqueos
app.use(cors());
app.use(express.json());

// Servir de forma estática los archivos de la carpeta pública
// Como index.js está dentro de 'src', subimos un nivel para encontrar 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para alumnos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para administrador
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor de Escuela Limpia corriendo en el puerto ${PORT}`);
});
