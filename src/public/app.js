document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener los valores del formulario
    const escuela = document.getElementById('escuela').value;
    const direccion = document.getElementById('direccion').value;
    const observaciones = document.getElementById('observaciones').value;

    const btnSubmit = e.target.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Generando reporte...';

    try {
        // Enviar datos al backend
        const response = await fetch('/api/reporte', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ escuela, direccion, observaciones })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        // Recibir el PDF como un archivo descargable (Blob)
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_${escuela.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Limpieza
        a.remove();
        window.URL.revokeObjectURL(url);
        alert('¡Reporte generado y descargado con éxito!');

    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al generar el reporte. Inténtalo de nuevo.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'Generar Reporte';
    }
});

