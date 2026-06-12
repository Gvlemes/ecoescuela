let fotoBase64Global = ""; // Variable para guardar el string de la foto temporalmente

// 1. Control de Pestañas
function cambiarPestana(idSeccion, botonActivo) {
    document.querySelectorAll('.tab-content').forEach(seccion => seccion.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const elemento = document.getElementById(idSeccion);
    if(elemento) elemento.classList.add('active');
    if(botonActivo) botonActivo.classList.add('active');
    
    if (idSeccion === 'mis-reportes') buscarMisReportes();
}

// 2. Funciones Originales de Degradación restauradas
function mostrarDegradacion() {
    const combo = document.getElementById('comboMateriales');
    const resultado = document.getElementById('resultadoDegradacion');
    if (!combo || !resultado) return;

    if (combo.value) {
        // Separa el valor por el caracter '|' [nombre, tipoAlerta, tiempo]
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

// 3. Previsualizar la foto antes de enviar
function previsualizarFoto(input) {
    const vistaPrevia = document.getElementById('vistaPrevia');
    if (input.files && input.files[0]) {
        const lector = new FileReader();
        lector.onload = function(e) {
            vistaPrevia.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
            fotoBase64Global = e.target.result; // Guarda la imagen convertida en texto
        }
        lector.readAsDataURL(input.files[0]);
    } else {
        vistaPrevia.innerHTML = "Ninguna imagen seleccionada";
        fotoBase64Global = "";
    }
}

// 4. Inicializar eventos al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formReporte');
    const msg = document.getElementById('mensajeEnvio');

    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const nombre = document.getElementById('nombreGrupo').value.trim();
            const problema = document.getElementById('problema').value.trim();
            
            const nuevoReporte = {
                id: Date.now(), // ID único para identificar el reporte al cambiar estado
                nombre: nombre,
                problema: problema,
                foto: fotoBase64Global,
                fecha: new Date().toLocaleString(),
                solucionado: false // Estado inicial: No solucionado (Pendiente)
            };

            let reportes = JSON.parse(localStorage.getItem('datosEscuelaLimpia')) || [];
            reportes.push(nuevoReporte);
            localStorage.setItem('datosEscuelaLimpia', JSON.stringify(reportes));

            // Limpieza del formulario
            formulario.reset();
            document.getElementById('vistaPrevia').innerHTML = "Ninguna imagen seleccionada";
            fotoBase64Global = "";

            if (msg) {
                msg.innerHTML = `<div class="panel-alerta verde">¡Tu reporte con foto ha sido enviado y registrado correctamente!</div>`;
                setTimeout(() => { msg.innerHTML = ''; }, 4000);
            }
            buscarMisReportes();
        });
    }

    // Renderizar la vista de administración si se está en admin.html
    renderizarReportesAdmin();
});

// 5. Alumnos: Buscar y Filtrar sus propios reportes y ver estados
function buscarMisReportes() {
    const contenedor = document.getElementById('listaMisReportes');
    if (!contenedor) return;

    const filtro = document.getElementById('busquedaNombre').value.toLowerCase().trim();
    const reportes = JSON.parse(localStorage.getItem('datosEscuelaLimpia')) || [];
    contenedor.innerHTML = '';

    // Filtrar los reportes que coincidan con la búsqueda
    const filtrados = reportes.filter(r => r.nombre.toLowerCase().includes(filtro));

    if (filtrados.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; color:#999; margin-top:15px;">Escribe tu nombre correctamente o no tienes reportes vigentes.</p>';
        return;
    }

    filtrados.forEach(r => {
        const item = document.createElement('div');
        item.className = 'item-reporte';
        
        // Determinar etiquetas de estado
        const badgeClass = r.solucionado ? 'badge-estado badge-solucionado' : 'badge-estado badge-pendiente';
        const textoEstado = r.solucionado ? '✅ Solucionado' : '⏳ Pendiente de revisión';

        item.innerHTML = `
            <strong>👤 De:</strong> ${r.nombre} | <small>📅 ${r.fecha}</small><br>
            <strong>🚨 Reporte:</strong> ${r.problema} <br>
            ${r.foto ? `<img src="${r.foto}" class="img-reporte">` : ''}
            <div><span class="${badgeClass}">${textoEstado}</span></div>
        `;
        contenedor.appendChild(item);
    });
}

// 6. Administrador: Renderizar reportes y botones de control de estado
function renderizarReportesAdmin() {
    const contenedorAdmin = document.getElementById('contenedorReportesAdmin');
    if (!contenedorAdmin) return;

    const reportes = JSON.parse(localStorage.getItem('datosEscuelaLimpia')) || [];
    contenedorAdmin.innerHTML = '';

    if (reportes.length === 0) {
        contenedorAdmin.innerHTML = '<p style="text-align:center; color:#999; margin-top:15px;">No hay reportes de alumnos por el momento.</p>';
        return;
    }

    reportes.forEach((r) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'item-reporte';
        const textoEstado = r.solucionado ? '<span style="color:#2E7D32">✔ Completado</span>' : '<span style="color:#EF6C00">⏳ En Espera</span>';

        tarjeta.innerHTML = `
            <strong>👤 Autor:</strong> ${r.nombre} <br>
            <strong>📅 Recibido:</strong> ${r.fecha} <br>
            <strong>🚨 Incidencia:</strong> ${r.problema} <br>
            ${r.foto ? `<img src="${r.foto}" class="img-admin">` : ''}
            <div class="estado-actual">Estado: ${textoEstado}</div> <br>
            <button class="btn-status btn-resolver" onclick="cambiarEstadoReporte(${r.id}, true)">Marcar Solucionado</button>
            <button class="btn-status btn-pendiente" onclick="cambiarEstadoReporte(${r.id}, false)">Poner en Espera</button>
        `;
        contenedorAdmin.appendChild(tarjeta);
    });
}

// 7. Administrador: Cambiar el estado del reporte de un alumno
function cambiarEstadoReporte(idReporte, nuevoEstado) {
    let reportes = JSON.parse(localStorage.getItem('datosEscuelaLimpia')) || [];
    reportes = reportes.map(r => {
        if (r.id === idReporte) {
            r.solucionado = nuevoEstado;
        }
        return r;
    });
    localStorage.setItem('datosEscuelaLimpia', JSON.stringify(reportes));
    renderizarReportesAdmin(); // Refrescar panel admin
}

// 8. Limpiar toda la memoria local del Administrador
function borrarHistorialTotal() {
    if(confirm("¿Seguro que deseas vaciar todos los reportes del sistema?")) {
        localStorage.removeItem('datosEscuelaLimpia');
        renderizarReportesAdmin();
    }
}
