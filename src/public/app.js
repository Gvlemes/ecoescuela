// 1. Alternar pestañas en la vista de Alumno
function cambiarPestana(idSeccion, botonActivo) {
    document.querySelectorAll('.tab-content').forEach(seccion => seccion.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const elemento = document.getElementById(idSeccion);
    if(elemento) elemento.classList.add('active');
    if(botonActivo) botonActivo.classList.add('active');
}

// 2. Mostrar datos de degradación
function mostrarDegradacion() {
    const combo = document.getElementById('comboMateriales');
    const resultado = document.getElementById('resultadoDegradacion');
    if(combo && combo.value) {
        resultado.innerHTML = `<div class="panel-alerta naranja">Este material tarda aprox. <strong>${combo.value}</strong> en degradarse.</div>`;
    } else if (resultado) {
        resultado.innerHTML = '';
    }
}

// 3. Calcular impacto ecológico
function calcularImpacto() {
    const botellas = parseInt(document.getElementById('cantBotellas').value) || 0;
    const resultado = document.getElementById('resultadoCalculo');
    if(resultado) {
        resultado.innerHTML = `<div class="panel-alerta verde">Al año tiras unas <strong>${botellas * 52} botellas</strong>. ¡Usa termos!</div>`;
    }
}

// 4. Capturar envíos de reportes (Solo corre si existe el formulario en pantalla)
const formulario = document.getElementById('formReporte');
if (formulario) {
    formulario.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const nombre = document.getElementById('nombreGrupo').value.trim();
        const problema = document.getElementById('problema').value.trim();
        
        const nuevoReporte = {
            nombre: nombre,
            problema: problema,
            fecha: new Date().toLocaleString()
        };

        // Extraer historial previo o inicializarlo vacío
        let reportes = JSON.parse(localStorage.getItem('datosEscuelaLimpia')) || [];
        reportes.push(nuevoReporte);
        
        // Guardar la lista actualizada en memoria local compartida
        localStorage.setItem('datosEscuelaLimpia', JSON.stringify(reportes));

        // Limpiar interfaz
        formulario.reset();
        const msg = document.getElementById('mensajeEnvio');
        msg.innerHTML = `<div class="panel-alerta verde">¡Enviado! Tu reporte ya se acomodó en el panel de control.</div>`;
        setTimeout(() => msg.innerHTML = '', 3000);
    });
}

// 5. Cargar y acomodar los reportes de manera automática en el panel admin.html
function renderizarReportesAdmin() {
    const contenedor = document.getElementById('contenedorReportesAdmin');
    if (!contenedor) return; // Si no estamos en la página admin, se detiene aquí.

    const reportes = JSON.parse(localStorage.getItem('datosEscuelaLimpia')) || [];
    contenedor.innerHTML = '';

    if (reportes.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; color:#999; margin-top:15px;">No hay reportes de alumnos por el momento.</p>';
        return;
    }

    // Mapear y pintar los reportes estructurados
    reportes.forEach(reporte => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'item-reporte';
        tarjeta.innerHTML = `
            <strong>👤 Alumno/Grupo:</strong> ${reporte.nombre} <br>
            <strong>📅 Fecha de Envío:</strong> ${reporte.fecha} <br>
            <strong>🚨 Situación Reportada:</strong> ${reporte.problema}
        `;
        contenedor.appendChild(tarjeta);
    });
}

// 6. Función para resetear la simulación del panel administrador
function borrarHistorial() {
    if(confirm("¿Seguro que deseas vaciar todos los reportes recibidos?")) {
        localStorage.removeItem('datosEscuelaLimpia');
        renderizarReportesAdmin();
    }
}

// Ejecutar automáticamente la lectura al cargar las páginas
document.addEventListener('DOMContentLoaded', renderizarReportesAdmin);
