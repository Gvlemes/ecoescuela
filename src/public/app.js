// 1. IMPORTACIONES Y CONFIGURACIÓN DE FIREBASE (Asegúrate de tener estos scripts cargados en tus HTML)
import { initializeApp } from "https://gstatic.com";
import { getDatabase, ref, push, onValue, update, remove } from "https://gstatic.com";

// REEMPLAZA ESTO CON TUS CREDENCIALES REALES DE FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCCVjAAdkiNMIB3odwWXDUBbGurE9bgZYM",
  authDomain: "escuelalimpia.firebaseapp.com",
  databaseURL: "https://escuelalimpia-default-rtdb.firebaseio.com",
  projectId: "escuelalimpia",
  storageBucket: "escuelalimpia.firebasestorage.app",
  messagingSenderId: "13533291736",
  appId: "1:13533291736:web:e3e8d514addb119fc4a3ad",
  measurementId: "G-KV3Y0V117P"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let fotoBase64Global = ""; // Almacén temporal de la imagen del reporte

// 2. CONTROL DE PESTAÑAS (VISTA ALUMNO)
window.cambiarPestana = function(idSeccion, botonActivo) {
    document.querySelectorAll('.tab-content').forEach(seccion => seccion.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const elemento = document.getElementById(idSeccion);
    if(elemento) elemento.classList.add('active');
    if(botonActivo) botonActivo.classList.add('active');
    
    if (idSeccion === 'mis-reportes') escucharMisReportes();
}

// 3. FUNCIONES DE DEGRADACIÓN (RESTAURADAS CON TUS MENSAJES ORIGINALES)
window.mostrarDegradacion = function() {
    const combo = document.getElementById('comboMateriales');
    const resultado = document.getElementById('resultadoDegradacion');
    if (!combo || !resultado) return;

    if (combo.value) {
        const datos = combo.value.split('|');
        const tipoAlerta = datos[1]; // verde o naranja
        const tiempo = datos[2];

        resultado.innerHTML = `<div class="panel-alerta ${tipoAlerta}">
            Este componente tarda aproximadamente <strong>${tiempo}</strong> en degradarse en el entorno escolar.
        </div>`;
    } else {
        resultado.innerHTML = '';
    }
}

// 4. PREVISUALIZACIÓN DE FOTOS
window.previsualizarFoto = function(input) {
    const vistaPrevia = document.getElementById('vistaPrevia');
    if (input.files && input.files[0]) {
        const lector = new FileReader();
        lector.onload = function(e) {
            vistaPrevia.innerHTML = `<img src="${e.target.result}" alt="Vista previa" style="max-width: 100%; max-height: 120px;">`;
            fotoBase64Global = e.target.result; 
        }
        lector.readAsDataURL(input.files[0]);
    } else {
        vistaPrevia.innerHTML = "Ninguna imagen seleccionada";
        fotoBase64Global = "";
    }
}

// 5. CAPTURA Y ENVÍO DE REPORTES A FIREBASE (ALUMNO)
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formReporte');
    const msg = document.getElementById('mensajeEnvio');

    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const nombre = document.getElementById('nombreGrupo').value.trim();
            const problema = document.getElementById('problema').value.trim();
            
            const nuevoReporte = {
                nombre: nombre,
                problema: problema,
                foto: fotoBase64Global,
                fecha: new Date().toLocaleString(),
                solucionado: false // Por defecto inicia pendiente
            };

            // Enviar a la colección "reportes" en Firebase de forma remota
            const dbRef = ref(db, 'reportes');
            push(dbRef, nuevoReporte)
                .then(() => {
                    formulario.reset();
                    document.getElementById('vistaPrevia').innerHTML = "Ninguna imagen seleccionada";
                    fotoBase64Global = "";

                    if (msg) {
                        msg.innerHTML = `<div class="panel-alerta verde">¡Tu reporte con foto ha sido enviado y registrado en la base de datos de Firebase!</div>`;
                        setTimeout(() => { msg.innerHTML = ''; }, 4000);
                    }
                })
                .catch((error) => {
                    console.error("Error al enviar a Firebase: ", error);
                    if (msg) msg.innerHTML = `<div class="panel-alerta naranja">Error al enviar el reporte. Revisa la consola.</div>`;
                });
        });
    }

    // Activar escucha de reportes dependiendo del archivo HTML actual
    escucharReportesAdmin();
    escucharMisReportes();
});

// 6. ALUMNOS: ESCUCHAR Y FILTRAR REPORTES DESDE FIREBASE
function escucharMisReportes() {
    const contenedor = document.getElementById('listaMisReportes');
    if (!contenedor) return;

    const dbRef = ref(db, 'reportes');
    
    // Escucha cambios en Firebase en tiempo real
    onValue(dbRef, (snapshot) => {
        contenedor.innerHTML = '';
        const data = snapshot.val();
        const filtro = document.getElementById('busquedaNombre').value.toLowerCase().trim();
        
        if (!data) {
            contenedor.innerHTML = '<p style="text-align:center; color:#999; margin-top:15px;">No hay reportes tuyos registrados todavía.</p>';
            return;
        }

        Object.keys(data).forEach(key => {
            const r = data[key];
            if (r.nombre.toLowerCase().includes(filtro)) {
                const item = document.createElement('div');
                item.className = 'item-reporte';
                
                const badgeClass = r.solucionado ? 'badge-estado badge-solucionado' : 'badge-estado badge-pendiente';
                const textoEstado = r.solucionado ? '✅ Solucionado' : '⏳ Pendiente de revisión';

                item.innerHTML = `
                    <strong>👤 De:</strong> ${r.nombre} | <small>📅 ${r.fecha}</small><br>
                    <strong>🚨 Reporte:</strong> ${r.problema} <br>
                    ${r.foto ? `<img src="${r.foto}" style="max-width: 100%; max-height: 150px; border-radius: 4px; margin-top: 8px;">` : ''}
                    <div><span class="${badgeClass}">${textoEstado}</span></div>
                `;
                contenedor.appendChild(item);
            }
        });
    });
}
// Hacer la función de búsqueda accesible desde el input oninput
window.buscarMisReportes = escucharMisReportes;

// 7. ADMINISTRADOR: ESCUCHAR Y RENDERIZAR DESDE FIREBASE
function escucharReportesAdmin() {
    const contenedorAdmin = document.getElementById('contenedorReportesAdmin');
    if (!contenedorAdmin) return;

    const dbRef = ref(db, 'reportes');
    
    onValue(dbRef, (snapshot) => {
        contenedorAdmin.innerHTML = '';
        const data = snapshot.val();

        if (!data) {
            contenedorAdmin.innerHTML = '<p style="text-align:center; color:#999; margin-top:15px;">No hay reportes de alumnos por el momento.</p>';
            return;
        }

        Object.keys(data).forEach((key) => {
            const r = data[key];
            const tarjeta = document.createElement('div');
            tarjeta.className = 'item-reporte';
            const textoEstado = r.solucionado ? '<span style="color:#2E7D32">✔ Completado</span>' : '<span style="color:#EF6C00">⏳ En Espera</span>';

            tarjeta.innerHTML = `
                <strong>👤 Autor:</strong> ${r.nombre} <br>
                <strong>📅 Recibido:</strong> ${r.fecha} <br>
                <strong>🚨 Incidencia:</strong> ${r.problema} <br>
                ${r.foto ? `<img src="${r.foto}" style="max-width:100%; max-height:200px; margin-top:10px; display:block;">` : ''}
                <div style="margin-top: 5px; font-weight: bold;">Estado: ${textoEstado}</div> <br>
                <button class="btn-status btn-resolver" onclick="cambiarEstadoReporte('${key}', true)">Marcar Solucionado</button>
                <button class="btn-status btn-pendiente" onclick="cambiarEstadoReporte('${key}', false)">Poner en Espera</button>
            `;
            contenedorAdmin.appendChild(tarjeta);
        });
    });
}

// 8. ADMINISTRADOR: ACTUALIZAR ESTADO EN FIREBASE
window.cambiarEstadoReporte = function(key, nuevoEstado) {
    const reportRef = ref(db, `reportes/${key}`);
    update(reportRef, { solucionado: nuevoEstado });
}

// 9. ADMINISTRADOR: VACIAR HISTORIAL EN FIREBASE
window.borrarHistorialTotal = function() {
    if(confirm("¿Seguro que deseas vaciar todos los reportes del sistema de Firebase?")) {
        const dbRef = ref(db, 'reportes');
        remove(dbRef);
    }
}
