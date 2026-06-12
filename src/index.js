const express = require('express');
const path = require('path');
const cors = require('cors'); // Asegúrate de tener 'cors' instalado

const app = express();
const PORT = process.env.PORT || 3000;

// 🚨 ESTO ES LO QUE ARREGLA EL BLOQUEO EN NODE: Permitir conexiones cruzadas
app.use(cors());
app.use(express.json());

// Servir de forma estática la carpeta pública desde el servidor de Node
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Ruta principal para servir el HTML del Alumno
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

// Ruta para servir el panel del Administrador
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor Node activo corriendo en el puerto ${PORT}`);
});
