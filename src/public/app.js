// ==========================================
// VARIABLES GLOBALES
// ==========================================
let baseDatosReportes = [];
let fotoBase64Global = "";

// ==========================================
// 1. NAVEGACIÓN ENTRE PESTAÑAS
// ==========================================
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
// ==========================================
// 2. CONCIENTIZACIÓN DE DEGRADACIÓN
// ==========================================
function mostrarDegradacion() {
    const material = document.getElementById('comboMateriales').value;
    const caja = document.getElementById('cajaResultadoDegradacion');
    
    const respuestas = {
        "chicle": "Tarda 5 años en deshacerse debido a que el oxígeno lo endurece y reseca.",
        "pet": "Tarda de 450 a 500 años en descomponerse por completo. ¡Evita los refrescos plásticos!",
        "aluminio": "Tarda de 10 a 100 años en desaparecer por de oxidación química natural.",
        "bolsa": "Tarda de 150 a 400 años. Solo se rompe en microplásticos nocivos.",
        "carton": "Tarda de 2 a 5 meses. Si se moja se degrada rápido, pero debe depositarse limpio para reciclar.",
        "unicel": "¡No se degrada nunca! Es 100% permanente y fragmentable, contaminando los patios escolares.",
        "organico": "Tarda de 2 a 4 semanas. Se degrada rápido y sirve de composta, pero genera mal olor en el salón.",
        "jumpers": "Tardan de 200 a 300 años. El cobre interno se oxida, pero el recubrimiento plástico de PVC dura siglos tirado.",
        "pilas": "Tardan entre 500 y 1,000 años. Son extremadamente peligrosas; derraman mercurio, plomo y cadmio tóxico.",
        "pcbs": "Tardan más de 500 años. La baquelita y la fibra de vidrio con resina epóxica no son biodegradables.",
        "motores": "Tardan de 100 a 500 años. Sus carcasas plásticas y engranajes metálicos resisten décadas a la intemperie.",
        "resistencias": "Tardan unos 200 a 400 años. Sus terminales metálicas se oxidan rápido, pero los cuerpos cerámicos y plásticos no.",
        "carcasas": "Tardan de 400 a 500 años. El plástico ABS rígido usado en teclados y carcasas de monitores es extremadamente denso y se fragmenta lentamente en microplásticos.",
        "gabinetes": "Tardan de 50 a 100 años. La lámina de acero y metal se oxidará lentamente con la humedad del laboratorio, pero las pinturas plásticas protectoras retrasan el proceso.",
        "termica": "¡No se biodegrada! Los compuestos de silicona y óxidos metálicos (como óxido de zinc o aluminio) se resecan y dispersan en el suelo, contaminando las capas de tierra del taller.",
        "ethernet": "Tardan de 200 a 300 años. El recubrimiento exterior de PVC protege los hilos de cobre interiores contra los hongos y bacterias, durando siglos tirado en los contenedores.",
        "discos": "Tardan más de 500 años. Los platos de aluminio recubiertos de aleaciones magnéticas y los brazos mecánicos metálicos duran décadas, mientras que las tarjetas controladoras no se degradan.",
        "toner": "Tarda de 400 a 500 años. El cartucho exterior es de plástico de alta densidad y el polvo negro residual contiene polímeros magnéticos, carbono y metales pesados altamente contaminantes para el agua escolar.",
        "carpetas": "Tardan de 100 a 400 años. Las cubiertas rígidas de polipropileno o PVC protegen las hojas de la humedad, pero resisten el ataque de bacterias de la tierra durante siglos al desecharse.",
        "hojas_calculo": "Tardan de 2 a 5 meses. Al ser papel blanco de oficina se degrada rápido si se moja, pero la tinta de tóner fundida con calor ralentiza el proceso y no sirve para composta.",
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
// ==========================================
// 3. PREVISUALIZAR FOTOGRAFÍA (OPTIMIZADA)
// ==========================================
function previsualizarFoto(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const img = document.getElementById('imgPrevia');
        const imgOptimizada = new Image();
        imgOptimizada.src = reader.result;
        
        imgOptimizada.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 500; 
            let width = imgOptimizada.width;
            let height = imgOptimizada.height;

            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext("2d");
            ctx.drawImage(imgOptimizada, 0, 0, width, height);

            fotoBase64Global = canvas.toDataURL("image/jpeg", 0.6);
            img.src = fotoBase64Global;
            img.style.display = 'block';
            document.getElementById('txtPrevia').style.display = 'none';
        };
    };
    if (event.target.files && event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
}
// ==========================================
// 3. ENVIAR REPORTE AL ADMINISTRADOR
// ==========================================
async function enviarReporte() {
    const desc = document.getElementById('txtDescripcion').value.trim();
    const nombre = document.getElementById('txtNombreAlumno') ? document.getElementById('txtNombreAlumno').value.trim() : "Alumno Anónimo";
    
    if (desc === "" || fotoBase64Global === "") {
        alert("Por favor, escribe una descripción y selecciona una fotografía.");
        return;
    }

    const nuevoReporte = {
        id: baseDatosReportes.length + 1,
        fecha: new Date().toISOString(),
        nombre: nombre,
        descripcion: desc,
        mensaje: desc,   
        foto: fotoBase64Global,
        estado: "Pendiente"
    };

    try {
        const respuesta = await fetch("/api/guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoReporte)
        });

        const res = await respuesta.json();

        if (res.ok) {
            baseDatosReportes.unshift(nuevoReporte);
            document.getElementById('txtDescripcion').value = "";
            document.getElementById('imgPrevia').style.display = 'none';
            document.getElementById('imgPrevia').src = "";
            document.getElementById('txtPrevia').style.display = 'block';
            document.getElementById('inputFoto').value = "";
            if (document.getElementById('txtNombreAlumno')) document.getElementById('txtNombreAlumno').value = "";
            fotoBase64Global = "";

            alert("¡Reporte almacenado en el registro escolar de manera correcta!");
        } else {
            alert("Hubo un problema de conexión para enviar el reporte.");
        }
    } catch (err) {
        console.error(err);
        alert("Hubo un problema de conexión para enviar el reporte.");
    }
}
// ==========================================
// 4. CALCULADORA ECOLÓGICA (PROYECCIÓN PET)
// ==========================================
function calcularHuella() {
    const cantidadSemana = parseFloat(document.getElementById('txtCantidadPet').value);
    const caja = document.getElementById('cajaResultadoCalculadora');

    if (isNaN(cantidadSemana) || cantidadSemana < 0) {
        alert("Ingresa un número válido de botellas.");
        caja.style.display = 'none';
        return;
    }

    caja.style.display = 'block';
    const anual = cantidadSemana * 52;
    const kg = anual * 0.025;
    let fraseDinamica = "";

    if (cantidadSemana === 0) {
        caja.className = "panel-alerta verde";
        fraseDinamica = `🌟 <strong>¡Increíble! Tu huella plástica es perfecta.</strong><br><br>` +
                        `• Consumo anual: <strong>0 botellas</strong> (0.00 kg de desperdicio).<br><br>` +
                        `💡 <strong>Recomendación:</strong> ¡Eres un líder ambiental! Tu misión ahora es compartir tu hábito e inspirar a los alumnos de las otras carreras técnicas de la escuela a dejar los plásticos desechables.`;
    } else if (cantidadSemana >= 1 && cantidadSemana <= 3) {
        caja.className = "panel-alerta naranja";
        fraseDinamica = `📊 <strong>Impacto Moderado:</strong> En 1 año consumirás unas <strong>${Math.floor(anual)} botellas</strong> (${kg.toFixed(2)} kg de basura).<br><br>` +
                        `🌱 <strong>Recomendación:</strong> Estás muy cerca de una huella impecable. Te sugerimos dar el paso definitivo esta semana: adquiere un termo reutilizable en la cooperativa escolar y dile adiós al PET.`;
    } else if (cantidadSemana >= 4 && cantidadSemana <= 7) {
        caja.className = "panel-alerta naranja";
        fraseDinamica = `⚠️ <strong>Impacto Alto Detectado:</strong> Al año acumularás <strong>${Math.floor(anual)} botellas</strong>, equivalentes a <strong>${kg.toFixed(2)} kg</strong> de plástico permanente.<br><br>` +
                        `📢 <strong>Recomendación:</strong> Estás arrojando un volumen considerable de basura a las áreas verdes de la escuela. Márcate el objetivo de reducir tu consumo a la mitad a partir de mañana mismo.`;
    } else {
        caja.className = "panel-alerta naranja";
        fraseDinamica = `🚨 <strong>¡ALERTA ROJA ECOLÓGICA!</strong> Tu consumo anual alcanzará la alarmante cifra de <strong>${Math.floor(anual)} botellas</strong>, tirando <strong>${kg.toFixed(2)} kg</strong> de plástico denso al ecosistema.<br><br>` +
                        `💡 <strong>Recomendación Crítica:</strong> Estás generando un impacto severo e irreversible en los patios del plantel. Requieres sustituir tus botellas PET por cantimploras de acero inoxidable hoy mismo.`;
    }
    caja.innerHTML = fraseDinamica;
}

// ==========================================
// 5. CONSULTAR ESTADO DE MIS REPORTES (CLOUD)
// ==========================================
async function buscarMisReportes() {
    const nombreBuscar = document.getElementById("busquedaNombre").value.trim().toLowerCase();
    const contenedor = document.getElementById("listaMisReportes");
    if (!nombreBuscar) { alert("Escribe un nombre para buscar."); return; }

    contenedor.innerHTML = "Buscando...";
    
    try {
        const respuesta = await fetch("/api/datos");
        const datos = await respuesta.json();

        const filtrados = datos.filter(item => 
            (item.nombre && item.nombre.toLowerCase().includes(nombreBuscar)) || 
            (item.descripcion && item.descripcion.toLowerCase().includes(nombreBuscar))
        );

        contenedor.innerHTML = "";
        if (filtrados.length === 0) {
            contenedor.innerHTML = "<p>No encontramos reportes con ese nombre.</p>";
            return;
        }

        filtrados.forEach(item => {
            const claseEstado = item.estado === "Resuelto" ? "status-resuelto" : "status-pendiente";
            const icono = item.estado === "Resuelto" ? "✅" : "⏳";
            
            let descFinal = item.descripcion || item.mensaje || "Sin detalles";
            let fechaFinal = item.fecha ? new Date(item.fecha).toLocaleDateString() : "Reciente";

            let tarjetaHTML = `
                <div class="status-card ${claseEstado}">
                    <strong>${icono} Estado: ${item.estado || 'Pendiente'}</strong><br>
                    <small>De: ${item.nombre || 'Anónimo'}</small><br>
                    <small>Detalle: ${descFinal}</small><br>
                    <small style="color:#777;">Fecha: ${fechaFinal}</small>
            `;

            if (item.foto) {
                tarjetaHTML += `<br><img src="${item.foto}" style="max-width:80px; margin-top:8px; border-radius:4px; display:block;">`;
            }

            tarjetaHTML += `</div>`;
            contenedor.innerHTML += tarjetaHTML;
        });
    } catch (error) {
        console.error("Error al buscar:", error);
        contenedor.innerHTML = "<p style='color:red;'>Error al cargar el historial.</p>";
    }
}
