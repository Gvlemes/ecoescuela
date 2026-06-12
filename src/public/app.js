// Añade este evento para asegurar que el HTML ya exista al ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // Capturar el formulario de reportes
    const formulario = document.getElementById('formReporte');
    const msg = document.getElementById('mensajeEnvio');

    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            // Detiene la recarga automática de la página
            event.preventDefault(); 
            
            const nombre = document.getElementById('nombreGrupo').value.trim();
            const problema = document.getElementById('problema').value.trim();
            
            // Estructura del reporte
            const nuevoReporte = {
                nombre: nombre,
                problema: problema,
                fecha: new Date().toLocaleString()
            };

            // Guardar en la memoria local
            let reportes = JSON.parse(localStorage.getItem('datosEscuelaLimpia')) || [];
            reportes.push(nuevoReporte);
            localStorage.setItem('datosEscuelaLimpia', JSON.stringify(reportes));

            // Limpiar los campos del formulario
            formulario.reset();

            // Mostrar el aviso verde de éxito en pantalla
            if (msg) {
                msg.innerHTML = `<div class="panel-alerta verde" style="background-color: #E8F5E9; color: #1B5E20; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid #C8E6C9;">
                                    ¡Listo! Tu reporte ha sido enviado y acomodado en el panel.
                                 </div>`;
                
                // Desaparecer el aviso después de 4 segundos
                setTimeout(() => { msg.innerHTML = ''; }, 4000);
            }
        });
    }

    // Código para pintar los reportes en la administración (si estás en admin.html)
    const contenedorAdmin = document.getElementById('contenedorReportesAdmin');
    if (contenedorAdmin) {
        const reportes = JSON.parse(localStorage.getItem('datosEscuelaLimpia')) || [];
        contenedorAdmin.innerHTML = '';

        if (reportes.length === 0) {
            contenedorAdmin.innerHTML = '<p style="text-align:center; color:#999; margin-top:15px;">No hay reportes de alumnos por el momento.</p>';
            return;
        }

        reportes.forEach(reporte => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'item-reporte';
            tarjeta.style = "border-left: 5px solid #0D47A1; background: #F9F9F9; padding: 15px; margin-top: 15px; border-radius: 0 6px 6px 0;";
            tarjeta.innerHTML = `
                <strong>👤 Alumno/Grupo:</strong> ${reporte.nombre} <br>
                <strong>📅 Fecha de Envío:</strong> ${reporte.fecha} <br>
                <strong>🚨 Situación:</strong> ${reporte.problema}
            `;
            contenedorAdmin.appendChild(tarjeta);
        });
    }
});

// Mantén tu función de cambiar pestañas fuera del DOMContentLoaded para que sea global
function cambiarPestana(idSeccion, botonActivo) {
    document.querySelectorAll('.tab-content').forEach(seccion => seccion.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const elemento = document.getElementById(idSeccion);
    if(elemento) elemento.classList.add('active');
    if(botonActivo) botonActivo.classList.add('active');
}
