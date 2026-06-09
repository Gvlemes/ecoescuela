// Arreglo global que funciona como Base de Datos dinámica en la sesión del navegador
let baseDatosReportes = [];
let fotoBase64Global = "";

// Controlador de Pestañas (Tabs)
function cambiarPestana(idPestana, boton) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Activar la pestaña y el botón seleccionado
    document.getElementById(idPestana).classList.add('active');
    boton.classList.add('active');
}

// Lógica Educativa de Degradación de Materiales
function mostrarDegradacion() {
    const material = document.getElementById('comboMateriales').value;
    const caja = document.getElementById('cajaResultadoDegradacion');
    
    const respuestas = {
        "chicle": "Tarda 5 años en deshacerse debido a que el oxígeno lo endurece y reseca.",
        "pet": "Tarda de 450 a 500 años en descomponerse por completo. ¡Evita los refrescos plásticos!",
        "aluminio": "Tarda de 10 a 100 años en desaparecer por oxidación química natural.",
        "bolsa": "Tarda de 150 a 400 años. Solo se rompe en microplásticos nocivos.",
        "carton": "Tarda de 2 a 5 meses. Si se moja se degrada rápido, pero debe depositarse limpio para reciclar.",
        "tetra": "Tarda unos 30 años en degradarse por su compleja estructura de cartón, plástico y aluminio.",
        "unicel": "¡No se degrada nunca! Es 100% permanente y fragmentable, contaminando los patios escolares.",
        "organico": "Tarda de 2 a 4 semanas. Se degrada rápido y sirve de composta, pero genera mal olor en el salón.",
        "jumpers": "Tardan de 200 a 300 años. El cobre interno se oxida, pero el recubrimiento plástico de PVC dura siglos tirado.",
        "pilas": "Tardan entre 500 y 1,000 años. Son extremadamente peligrosas; derraman mercurio, plomo y cadmio tóxico.",
        "pcbs": "Tardan más de 500 años. La baquelita y la fibra de vidrio con resina epóxica no son biodegradables.",
        "motores": "Tardan de 100 a 500 años. Sus carcasas plásticas y engranajes metálicos resisten décadas a la intemperie.",
        "resistencias": "Tardan unos 200 a 400 años. Sus terminales metálicas se oxidan rápido, pero los cuerpos cerámicos y plásticos no."
    };

    if (respuestas[material]) {
        caja.innerHTML = respuestas[material];
    } else {
        caja.innerHTML = "Por favor, selecciona una opción del menú para auditar su impacto ambiental.";
    }
}

// Previsualización y procesamiento multimedia de la fotografía
function previsualizarFoto(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const img = document.getElementById('imgPrevia');
        img.src = reader.result;
        img.style.display = 'block';
        document.getElementById('txtPrevia').style.display = 'none';
        fotoBase64Global = reader.result; // Guardamos la foto en memoria estructurada
    }
    if(event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
}

// Envío de Reporte a la Memoria Dinámica
function enviarReporte() {
    const desc = document.getElementById('txtDescripcion').value.trim();
    
    if (desc === "" || fotoBase64Global === "") {
        alert("Por favor, escribe una descripción y selecciona una fotografía.");
        return;
    }

    // Insertamos los datos del reporte en la Base de Datos simulada
    const nuevoReporte = {
        id: baseDatosReportes.length + 1,
        fecha: new Date().toLocaleString(),
        descripcion: desc,
        foto: fotoBase64Global
    };
    
    baseDatosReportes.unshift(nuevoReporte); // Agrega al inicio del historial

    // Limpiamos los campos del formulario
    document.getElementById('txtDescripcion').value = "";
    document.getElementById('imgPrevia').style.display = 'none';
    document.getElementById('imgPrevia').src = "";
    document.getElementById('txtPrevia').style.display = 'block';
    document.getElementById('inputFoto').value = "";
    fotoBase64Global = "";

    alert("¡Reporte almacenado en el registro escolar de manera correcta!");
    actualizarTablaAdmin();
}

// Calculadora de Huella de Carbono / PET
function calcularHuella() {
    const cantidadSemana = parseFloat(document.getElementById('txtCantidadPet').value);
    const caja = document.getElementById('cajaResultadoCalculadora');

    if (isNaN(cantidadSemana) || cantidadSemana < 0) {
        alert("Ingresa un número válido de botellas.");
        caja.style.display = 'none';
        return;
    }

    const anual = cantidadSemana * 52;
    const kg = anual * 0.025;

    caja.innerHTML = `📊 <strong>Impacto estimado en 1 año:</strong><br><br>` +
                     `• Consumirás aproximadamente <strong>${Math.floor(anual)} botellas</strong>.<br>` +
                     `• Basura plástica acumulada: <strong>${kg.toFixed(2)} kg</strong>.<br><br>` +
                     `💡 <em>Recomendación:</em> Reemplaza el plástico usando termos reutilizables de la escuela.`;
    caja.style.display = 'block';
}

// Control de Autenticación del Administrador (Clave: mecatronica)
function comprobarAccesoAdmin() {
    const clave = document.getElementById('txtPasswordAdmin').value;

    if (clave === "mecatronica") {
        document.getElementById('panelLoginAdmin').style.display = 'none';
        document.getElementById('panelHistorialAdmin').style.display = 'block';
        document.getElementById('txtPasswordAdmin').value = "";
        actualizarTablaAdmin();
    } else {
        alert("La clave introducida es incorrecta.");
        document.getElementById('txtPasswordAdmin').value = "";
    }
}

function cerrarSesionAdmin() {
    document.getElementById('panelHistorialAdmin').style.display = 'none';
    document.getElementById('panelLoginAdmin').style.display = 'block';
}

// Dibuja el historial completo agregando las Miniaturas de las Fotos Reales 📸
function actualizarTablaAdmin() {
    const lista = document.getElementById('listaReportes');
    lista.innerHTML = "";

    if (baseDatosReportes.length === 0) {
        lista.innerHTML = `<p class="txt-vacio">No se han registrado reportes en esta sesión aún.</p>`;
        return;
    }

    baseDatosReportes.forEach(reporte => {
        const card = document.createElement('div');
        card.className = "reporte-card";
        card.innerHTML = `<p><strong>📋 REPORTE NÚMERO:</strong> ${reporte.id}</p>` +
                         `<p><strong>📅 Fecha:</strong> ${reporte.fecha}</p>` +
                         `<p><strong>📝 Descripción:</strong> ${reporte.descripcion}</p>` +
                         `<img src="${reporte.foto}" alt="Evidencia" style="width: 100%; max-width: 200px; height: auto; display: block; margin-top: 8px;">` +
                         `<hr style="border: 0; border-top: 1px solid #EEE; margin-top: 10px;">`;
        lista.appendChild(card);
    });
}
