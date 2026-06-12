// ==========================================
// 1. CONFIGURACIÓN Y PROTOCOLO DE SEGURIDAD FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCCVjAAdkiNMIB3odwWXDUBbGurE9bgZYM",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebaseio.com",
  projectId: "escuelalimpia",
  storageBucket: "escuelalimpia.firebasestorage.app",
  messagingSenderId: "13533291736",
  appId: "1:13533291736:web:e3e8d514addb119fc4a3ad",
  measurementId: "G-KV3Y0V117P"
};

let db = null;
let fotoBase64Global = ""; 

// Inicialización ultra-segura: Si Firebase falla, la interfaz NO se rompe
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log("Firebase conectado exitosamente.");
    } else {
        console.warn("Librería de Firebase no detectada en el HTML. Trabajando en modo local.");
    }
} catch (error) {
    console.error("Error al inicializar Firebase:", error);
}

// Inicializar funciones automáticas al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    // Si Firebase está activo, empezamos a escuchar los reportes en tiempo real
    if (db) {
        escucharReportesAdmin();
        escucharMisReportes();
    }
});

// ==========================================
// 2. CONTROL DE INTERFACES Y PESTAÑAS (Fijo, nunca falla)
// ==========================================
function cambiarPestana(idSeccion, botonActivo) {
    // 1. Ocultar todas las secciones
    document.querySelectorAll('.tab-content').forEach(seccion => {
        seccion.classList.remove('active');
    });
    
    // 2. Quitar color activo a todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 3. Mostrar la sección seleccionada y activar su botón
    const elemento = document.getElementById(idSeccion);
    if (elemento) {
        elemento.classList.add('active');
    }
    if (botonActivo) {
        botonActivo.classList.add('active');
    }
    
    // Si entra a mis reportes, refrescar la lista
    if (idSeccion === 'mis-reportes' && db) {
        escucharMisReportes();
    }
}

// ==========================================
// 3. LÓGICA DE TU INTERFAZ (DEGRADACIÓN Y CALCULADORA)
// ==========================================
function mostrarDegradacion() {
    const combo = document.getElementById('comboMateriales');
    const resultado = document.getElementById('resultadoDegradacion');
    if (!combo || !resultado) return;

    if (combo.value) {
        const datos = combo.value.split('|');
        const tipoAlerta = datos[1]; // COLOR (verde o naranja)
        const tiempo = datos[2];     // TIEMPO (ej. 1 año)

        resultado.innerHTML = `<div class="panel-alerta ${tipoAlerta}">
            Este componente tarda aproximadamente <strong>${tiempo}</strong> en degradarse en el entorno escolar.
        </div>`;
    } else {
        resultado.innerHTML = '';
    }
}

function calcularImpacto() {
    const botellas = parseInt(document.getElementById('cantBotellas').value) || 0;
    const totalAnual = botellas * 52;
    const resultado = document.getElementById('resultadoCalculo');
    if (!resultado) return;

    if (totalAnual > 0) {
        resultado.innerHTML = `<div class="panel-alerta verde">
            Al año consumes aproximadamente <strong>${totalAnual} botellas plásticas</strong>. ¡Intenta utilizar termos reutilizables en la escuela!
        </div>`;
    } else {
        resultado.innerHTML = `<div class="panel-alerta verde">¡Excelente! No generas desechos de botellas plásticas esta semana.</div>`;
    }
}

// ==========================================
// 4. PROCESAMIENTO DE IMÁGENES Y ENVÍOS
// ==========================================
function previsualizarFoto(input) {
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

function guardarReporteFirebase(event) {
    if (event) event.preventDefault(); // Detiene por completo cualquier recarga de página
    
    const msg = document.getElementById('mensajeEnvio');
    const nombre = document.getElementById('nombreGrupo').value.trim();
    const problema = document.getElementById('problema').value.trim();
    
    const nuevoReporte = {
        nombre: nombre,
        problema: problema,
        foto: fotoBase64Global,
        fecha: new Date().toLocaleString(),
        solucionado: false 
    };

    // Validar si la base de datos está en línea antes de empujar los datos
    if (!db) {
        if (msg) msg.innerHTML = `<div class="panel-alerta naranja">Error: No hay conexión con la base de datos de Firebase.</div>`;
        return;
    }

    db.ref('reportes').push(nuevoReporte)
        .then(() => {
            document.getElementById('formReporte').reset();
            document.getElementById('vistaPrevia').innerHTML = "Ninguna imagen seleccionada";
            fotoBase64Global = "";

            if (msg) {
                msg.innerHTML = `<div class="panel-alerta verde">¡Tu reporte con foto ha sido enviado y registrado en Firebase!</div>`;
                setTimeout(() => { msg.innerHTML = ''; }, 4000);
            }
        })
        .catch((error) => {
            console.error("Error Firebase:", error);
            if (msg) msg.innerHTML = `<div class="panel-alerta naranja">Error de red al guardar en la base de datos.</div>`;
        });
}

// ==========================================
// 5. BANDEJAS DE ENTRADA Y LECTURAS EN TIEMPO REAL
// ==========================================
function escucharMisReportes() {
    const contenedor = document.getElementById('listaMisReportes');
    if (!contenedor || !db) return;

    db.ref('reportes').on('value', (snapshot) => {
        contenedor.innerHTML = '';
        const data = snapshot.val();
        const inputBusqueda = document.getElementById('busquedaNombre');
        const filtro = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : '';
        
        if (!data) {
            contenedor.innerHTML = '<p style="text-align:center; color:#999; margin-top:15px;">No hay reportes registrados.</p>';
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
                    ${r.foto ? `<img src="${r.foto}" style="max-width: 100%; max-height: 150px; border-radius: 4px; margin-top: 8px; display:block;">` : ''}
                    <div><span class="${badgeClass}">${textoEstado}</span></div>
                `;
                contenedor.appendChild(item);
            }
        });
    });
}

function escucharReportesAdmin() {
    const contenedorAdmin = document.getElementById('contenedorReportesAdmin');
    if (!contenedorAdmin || !db) return;

    db.ref('reportes').on('value', (snapshot) => {
        contenedorAdmin.innerHTML = '';
        const data = snapshot.val();

        if (!data) {
            contenedorAdmin.innerHTML = '<p style="text-align:center; color:#999; margin-top:15px;">No hay incidencias en la bandeja.</p>';
            return;
        }

        Object.keys(data).forEach((key) => {
            const r = data[key];
            const tarjeta = document.createElement('div');
            tarjeta.className = 'item-reporte';
            const textoEstado = r.solucionado ? '<span style="color:#2E7D32; font-weight:bold;">✔ Completado</span>' : '<span style="color:#EF6C00; font-weight:bold;">⏳ En Espera</span>';

            tarjeta.innerHTML = `
                <strong>👤 Autor:</strong> ${r.nombre} <br>
                <strong>📅 Recibido:</strong> ${r.fecha} <br>
                <strong>🚨 Incidencia:</strong> ${r.problema} <br>
                ${r.foto ? `<img src="${r.foto}" style="max-width:100%; max-height:200px; margin-top:10px; display:block;">` : ''}
                <div style="margin-top: 10px; margin-bottom:10px;">Estado: ${textoEstado}</div>
                <button class="btn-status btn-resolver" onclick="cambiarEstadoReporte('${key}', true)" style="padding: 6px 12px; background-color: #2E7D32; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right:5px;">Marcar Solucionado</button>
                <button class="btn-status btn-pendiente" onclick="cambiarEstadoReporte('${key}', false)" style="padding: 6px 12px; background-color: #EF6C00; color: white; border: none; border-radius: 4px; cursor: pointer;">Poner en Espera</button>
            `;
            contenedorAdmin.appendChild(tarjeta);
        });
    });
}

function cambiarEstadoReporte(key, nuevoEstado) {
    if (db) {
        db.ref('reportes/' + key).update({ solucionado: nuevoEstado });
    }
}

function borrarHistorialTotal() {
    if (db && confirm("¿Seguro que deseas vaciar por completo la base de datos de Firebase?")) {
        db.ref('reportes').remove();
    }
}
