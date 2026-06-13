// CONFIGURACIÓN DE FIREBASE COMPATIBLE
const firebaseConfig = {
  apiKey: "AIzaSyCCVjAAdkiNMIB3odwWXDUBbGurE9bgZYM",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebaseio.com",
  projectId: "escuelalimpla",
  storageBucket: "escuelalimpla.firebasestorage.app",
  messagingSenderId: "13533291736",
  appId: "1:13533291736:web:e3e8d514addb119fc4a3ad",
  measurementId: "G-KV3Y0V117P"
};

let db = null;
let fotoBase64Global = ""; 

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database("https://firebaseio.com");
        console.log("Firebase conectado correctamente.");
    }
} catch (error) {
    console.error("Error al conectar con Firebase:", error);
}

document.addEventListener('DOMContentLoaded', () => {
    if (db) {
        escucharReportesAdmin();
        escucharMisReportes();
    }
});

// PESTAÑAS VISTA ALUMNO
function cambiarPestana(idSeccion, botonActivo) {
    document.querySelectorAll('.tab-content').forEach(seccion => seccion.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const elemento = document.getElementById(idSeccion);
    if (elemento) elemento.classList.add('active');
    if (botonActivo) botonActivo.classList.add('active');
    
    if (idSeccion === 'mis-reportes' && db) escucharMisReportes();
}

// LOGICA DEGRADACIÓN ORIGINAL CORREGIDA
function mostrarDegradacion() {
    const combo = document.getElementById('comboMateriales');
    const resultado = document.getElementById('resultadoDegradacion');
    if (!combo || !resultado) return;

    if (combo.value) {
        const datos = combo.value.split('|');
        const tipoAlerta = datos[1]; 
        const tiempo = datos[2];     

        resultado.innerHTML = `<div class="panel-alerta ${tipoAlerta}">
            Este componente tarda aproximadamente <strong>${tiempo}</strong> en degradarse en el entorno escolar.
        </div>`;
    } else {
        resultado.innerHTML = '';
    }
}

// CALCULADORA REINTEGRADA ORIGINAL
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

// PREVISUALIZAR Y COMPRIMIR FOTOS AUTOMÁTICAMENTE
function previsualizarFoto(input) {
    const vistaPrevia = document.getElementById('vistaPrevia');
    if (input.files && input.files[0]) {
        const lector = new FileReader();
        lector.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const dataUrlOptimizada = canvas.toDataURL('image/jpeg', 0.6);
                vistaPrevia.innerHTML = `<img src="${dataUrlOptimizada}" alt="Vista previa" style="max-width: 100%; max-height: 120px;">`;
                fotoBase64Global = dataUrlOptimizada; 
            };
        };
        lector.readAsDataURL(input.files[0]);
    } else {
        vistaPrevia.innerHTML = "Ninguna imagen seleccionada";
        fotoBase64Global = "";
    }
}

// GUARDAR REPORTE SEGURO
function guardarReporteFirebase(event) {
    if (event) event.preventDefault();
    const msg = document.getElementById('mensajeEnvio');
    
    if (!db) {
        if (msg) msg.innerHTML = `<div class="panel-alerta naranja">Error: No hay conexión con la base de datos de Firebase.</div>`;
        return;
    }

    const nombre = document.getElementById('nombreGrupo').value.trim();
    const problema = document.getElementById('problema').value.trim();
    
    const nuevoReporte = {
        nombre: nombre,
        problema: problema,
        foto: fotoBase64Global, 
        fecha: new Date().toLocaleString(),
        solucionado: false 
    };

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
            if (msg) msg.innerHTML = `<div class="panel-alerta naranja">Error al guardar el reporte en la base de datos.</div>`;
        });
}

// ESCUCHAS ALUMNO
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

// ESCUCHAS ADMINISTRADOR (ACOMODO LIMPIO)
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
                ${r.foto ? `<img src="${r.foto}" class="img-admin">` : ''}
                <div style="margin-top: 10px; margin-bottom:10px;">Estado: ${textoEstado}</div>
                <button class="btn-status btn-resolver" onclick="cambiarEstadoReporte('${key}', true)">Marcar Solucionado</button>
                <button class="btn-status btn-pendiente" onclick="cambiarEstadoReporte('${key}', false)">Poner en Espera</button>
            `;
            contenedorAdmin.appendChild(tarjeta);
        });
    });
}

function cambiarEstadoReporte(key, nuevoEstado) {
    if (db) db.ref('reportes/' + key).update({ solucionado: nuevoEstado });
}

function borrarHistorialTotal() {
    if (db && confirm("¿Seguro que deseas vaciar por completo la base de datos de Firebase?")) {
        db.ref('reportes').remove();
    }
}

