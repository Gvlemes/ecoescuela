let baseDatosReportes = [];
let fotoBase64Global = "";

function cambiarPestana(idPestana, boton) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(idPestana).classList.add('active');
    boton.classList.add('active');
}

function mostrarDegradacion() {
    const material = document.getElementById('comboMateriales').value;
    const caja = document.getElementById('cajaResultadoDegradacion');
    
    const respuestas = {
        // Básicos
        "chicle": "Tarda 5 años en deshacerse debido a que el oxígeno lo endurece y reseca.",
        "pet": "Tarda de 450 a 500 años en descomponerse por completo. ¡Evita los refrescos plásticos!",
        "aluminio": "Tarda de 10 a 100 años en desaparecer por oxidación química natural.",
        "bolsa": "Tarda de 150 a 400 años. Solo se rompe en microplásticos nocivos.",
        "carton": "Tarda de 2 a 5 meses. Si se moja se degrada rápido, pero debe depositarse limpio para reciclar.",
        "tetra": "Tarda unos 30 años en degradarse por su compleja estructura de cartón, plástico y aluminio.",
        "unicel": "¡No se degrada nunca! Es 100% permanente y fragmentable, contaminando los patios escolares.",
        "organico": "Tarda de 2 a 4 semanas. Se degrada rápido y sirve de composta, pero genera mal olor en el salón.",
        
        // Mecatrónica
        "jumpers": "Tardan de 200 a 300 años. El cobre interno se oxida, pero el recubrimiento plástico de PVC dura siglos tirado.",
        "pilas": "Tardan entre 500 y 1,000 años. Son extremadamente peligrosas; derraman mercurio, plomo y cadmio tóxico.",
        "pcbs": "Tardan más de 500 años. La baquelita y la fibra de vidrio con resina epóxica no son biodegradables.",
        "motores": "Tardan de 100 a 500 años. Sus carcasas plásticas y engranajes metálicos resisten décadas a la intemperie.",
        "resistencias": "Tardan unos 200 a 400 años. Sus terminales metálicas se oxidan rápido, pero los cuerpos cerámicos y plásticos no.",
        
        // Soporte y Mantenimiento
        "carcasas": "Tardan de 400 a 500 años. El plástico ABS rígido usado en teclados y carcasas de monitores es extremadamente denso y se fragmenta lentamente en microplásticos.",
        "gabinetes": "Tardan de 50 a 100 años. La lámina de acero y metal se oxidará lentamente con la humedad del laboratorio, pero las pinturas plásticas protectoras retrasan el proceso.",
        "termica": "¡No se biodegrada! Los compuestos de silicona y óxidos metálicos (como óxido de zinc o aluminio) se resecan y dispersan en el suelo, contaminando las capas de tierra del taller.",
        
        // Programación
        "ethernet": "Tardan de 200 a 300 años. El recubrimiento exterior de PVC protege los hilos de cobre interiores contra los hongos y bacterias, durando siglos tirado en los contenedores.",
        "discos": "Tardan más de 500 años. Los platos de aluminio recubiertos de aleaciones magnéticas y los brazos mecánicos metálicos duran décadas, mientras que las tarjetas controladoras no se degradan.",
        
        // Gestión Administrativa y Contabilidad 👇
        "toner": "Tarda de 400 a 500 años. El cartucho exterior es de plástico de alta densidad y el polvo negro residual contiene polímeros magnéticos, carbono y metales pesados altamente contaminantes para el agua escolar.",
        "carpetas": "Tardan de 100 a 400 años. Las cubiertas rígidas de polipropileno o PVC protegen las hojas de la humedad, pero resisten el ataque de bacterias de la tierra durante siglos al desecharse.",
        "hojas_calculo": "Tardan de 2 a 5 meses. Al ser papel blanco de oficina se degrada rápido si se moja, pero la tinta de tóner fundida con calor ralentiza el proceso y no sirve para composta.",
        
        // Producción Industrial
        "virutas": "Tardan de 10 a 50 años en oxidarse por completo. Sin embargo, al estar impregnadas con aceite de corte (soluble o refrigerante), este aceite drena al suelo matando plantas y contaminando el agua del subsuelo.",
        "bandas": "Tardan de 50 a 150 años. El caucho vulcanizado reforzado con hilos textiles o de acero está diseñado para resistir fricción extrema, por lo que el ambiente tarde décadas en agrietarlo.",
        "cascos": "Tardan de 400 a 500 años. Fabricados con polietileno de alta densidad o policarbonato para resistir impactos duros, el sol solar solo los fragmenta muy despacio con el paso de los siglos."
    };

    if (respuestas[material]) {
        caja.innerHTML = respuestas[material];
    } else {
        caja.innerHTML = "Por favor, selecciona una opción del menú para auditar su impacto ambiental.";
    }
}

function previsualizarFoto(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const img = document.getElementById('imgPrevia');
        img.src = reader.result;
        img.style.display = 'block';
        document.getElementById('txtPrevia').style.display = 'none';
        fotoBase64Global = reader.result;
    }
    if(event.target.files) {
        reader.readAsDataURL(event.target.files);
    }
}

function enviarReporte() {
    const desc = document.getElementById('txtDescripcion').value.trim();
    
    if (desc === "" || fotoBase64Global === "") {
        alert("Por favor, escribe una descripción y selecciona una fotografía.");
        return;
    }

    const nuevoReporte = {
        id: baseDatosReportes.length + 1,
        fecha: new Date().toLocaleString(),
        descripcion: desc,
        foto: fotoBase64Global
    };
    
    baseDatosReportes.unshift(nuevoReporte);

    document.getElementById('txtDescripcion').value = "";
    document.getElementById('imgPrevia').style.display = 'none';
    document.getElementById('imgPrevia').src = "";
    document.getElementById('txtPrevia').style.display = 'block';
    document.getElementById('inputFoto').value = "";
    fotoBase64Global = "";

    alert("¡Reporte almacenado en el registro escolar de manera correcta!");
    actualizarTablaAdmin();
}

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
