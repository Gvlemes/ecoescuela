// 1. CONFIGURACIÓN DE FIREBASE (Conectado usando el método clásico compatible)
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

// Inicializar Firebase clásico
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let fotoBase64Global = ""; 

// Ejecutar lecturas iniciales automáticas cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    escucharReportesAdmin();
    escucharMisReportes();
});

// 2. MANEJO DE PESTAÑAS (Funciona directo con tus onclick)
function cambiarPestana(idSeccion, botonActivo) {
    document.querySelectorAll('.tab-content').forEach(seccion => seccion.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const elemento = document.getElementById(idSeccion);
    if (elemento) elemento.classList.add('active');
    if (botonActivo) botonActivo.classList.add('active');
    
    if (idSeccion === 'mis-reportes') escucharMisReportes();
}

// 3. RECUPERACIÓN DE TUS FUNCIONES ORIGINALES DE DEGRADACIÓN
function mostrarDegradacion() {
    const combo = document.getElementById('comboMateriales');
    const resultado = document.getElementById('resultadoDegradacion');
    if (!combo || !resultado) return;

    if (combo.value) {
        const datos = combo.value.split('|');
        const tipoAlerta = datos[1]; // verde o naranja
        const tiempo = datos[2];     // tiempo de degradación

        resultado.innerHTML = `<div class="panel-alerta ${tipoAlerta}">
            Este componente tarda aproximadamente <strong>${tiempo}</strong> en degradarse en el entorno escolar.
        </div>`;
    } else {
        resultado.innerHTML = '';
    }
}

// 4. PROCESAMIENTO DE IMÁGENES (BASE64)
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

// 5. ENVÍO SEGURO A FIREBASE REALTIME DATABASE
function guardarReporteFirebase(event) {
    event.preventDefault();
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

    // Usando el método push clásico
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
        });
}

// 6. CONSULTA DE REPORTES PARA EL ALUMNO (MIS REPORTES)
function escucharMisReportes() {
    const contenedor = document.getElementById('listaMisReportes');
    if (!contenedor) return;

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

// 7. BANDEJA DE ENTRADA DEL ADMINISTRADOR (ADMIN.HTML)
function escucharReportesAdmin() {
    const contenedorAdmin = document.getElementById('contenedorReportesAdmin');
    if (!contenedorAdmin) return;

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

// 8. ADMINISTRADOR: CAMBIAR ESTADO
function cambiarEstadoReporte(key, nuevoEstado) {
    db.ref('reportes/' + key).update({ solucionado: nuevoEstado });
}

// 9. BORRAR HISTORIAL TOTAL
function borrarHistorialTotal() {
    if (confirm("¿Seguro que deseas vaciar por completo la base de datos de Firebase?")) {
        db.ref('reportes').remove();
    }
}
