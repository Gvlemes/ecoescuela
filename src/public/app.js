// ==========================================
// 1. NAVEGACIÓN ENTRE PESTAÑAS
// ==========================================
function cambiarPestana(idPestana, boton) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(idPestana).classList.add('active');
  boton.classList.add('active');
}

function mostrarDegradacion() {
    const material = document.getElementById("comboMateriales").value;
    const caja = document.getElementById("cajaResultadoDegradacion");

    const respuestas = {
        // Básicos que ya tenías configurados o planeados
        chicle: "El chicle tarda 5 años en degradarse. Al tirarlo al suelo daña los patios escolares y afecta a las aves.",
        pet: "Las botellas plásticas tardan de 100 a 1,000 años. Evita el plástico de un solo uso en la cafetería.",
        aluminio: "Las latas de refresco tardan de 10 a 100 años. Son 100% reciclables de forma infinita.",
        bolsa: "Las bolsas plásticas tardan alrededor de 150 años en fragmentarse en microplásticos nocivos.",
        carton: "El papel y cartón toman de 2 a 5 meses. Deposítalos limpios en los contenedores de reciclaje.",
        unicel: "El unicel NO se degrada nunca químicamente; solo se divide en pedazos más pequeños de por vida.",
        organico: "Los residuos orgánicos tardan de 1 a 6 meses. ¡Ideales para una sección de compostaje escolar!",

        // Mecatrónica
        cables: "El recubrimiento de PVC de los cables tarda de 30 a 40 años en degradarse.",
        metales_taller: "Las rebabas y piezas metálicas de desecho tardan un siglo en corroerse en el taller.",
        baterias: "Las pilas tardan más de 500 años y liberan mercurio y litio altamente contaminantes.",

        // Gestión Administrativa
        papel_bond: "El papel de reportes tarda unos meses. Los administradores deben fomentar la entrega digital.",
        carton_archivo: "El cartón de las cajas de archivo tarda cerca de 1 año. Reutilízalas para almacenamiento interno.",
        boligrafo: "Un bolígrafo común tarda 100 años en desaparecer debido a sus plásticos densos.",

        // Soporte y Mantenimiento
        carcasa: "Los plásticos ABS de computadoras obsoletas tardan 150 años. Se debe priorizar la reparación.",
        teclado: "Las teclas resisten hasta 400 años sin degradarse debido a los polímeros empleados.",
        toner: "Un cartucho de tóner tarda 450 años y sus componentes químicos afectan la calidad del aire.",

        // Programación
        cd: "Los discos ópticos antiguos toman 100 años en desaparecer. Es mejor migrar tus respaldos a la nube.",
        usb: "Los componentes plásticos y las resinas de una memoria USB dañada tardan 300 años en degradarse.",

        // Producción Industrial
        pallets: "La madera industrial de las tarimas tarda de 1 a 3 años si no está tratada químicamente.",
        flejes: "Los flejes plásticos de embalaje de carga industrial tardan hasta 300 años en fragmentarse.",
        neumaticos: "El caucho vulcanizado de montacargas toma 600 años. Su acumulación es un riesgo de incendio."
    };

    if (respuestas[material]) {
        caja.innerHTML = `<div class="panel-alerta naranja"><strong>Impacto de Degradación:</strong><br>${respuestas[material]}</div>`;
    } else {
        caja.innerHTML = "<p style='color: #666; font-style: italic;'>Por favor, selecciona una opción para auditar su impacto.</p>";
    }
}

<div id="cajaResultadoDegradacion"></div>
// ==========================================
// 3. REPORTAR CON IMAGEN (BASE64)
// ==========================================
let base64Foto = "";
function previsualizarFoto() {
  const file = document.getElementById("fotoInput").files[0]; // Corregido el índice del archivo
  const preview = document.getElementById("preview");
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = function () {
    base64Foto = reader.result;
    preview.src = base64Foto;
    preview.style.display = "block";
  }
  reader.readAsDataURL(file);
}

document.getElementById("formularioReporte").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreAlumno").value;
  const mensaje = document.getElementById("mensajeAlumno").value;

  try {
    const respuesta = await fetch("/api/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, mensaje, foto: base64Foto, estado: "Pendiente" })
    });

    if (!respuesta.ok) {
      throw new Error(`Servidor fuera de línea o ruta inválida: ${respuesta.status}`);
    }

    const res = await respuesta.json();
    if (res.ok) {
      alert("¡Reporte enviado con éxito! Puedes consultar su estado en la sección 'Mi Reporte' usando tu nombre.");
      document.getElementById("formularioReporte").reset();
      document.getElementById("preview").style.display = "none";
      base64Foto = "";
      // Forzar recarga inmediata de las listas locales tras enviar
      buscarMisReportes(); 
    } else {
      alert("Error al procesar el reporte en el servidor.");
    }
  } catch (error) {
    console.error("Error de comunicación:", error);
    alert("Hubo un fallo crítico de red. Asegúrate de compilar usando Clear Build Cache.");
  }
});

// ==========================================
// 4. CALCULADORA ECOLÓGICA CON RECOMENDACIONES DINÁMICAS
// ==========================================
function calcularImpacto() {
  const botellas = parseInt(document.getElementById("calcBotellas").value) || 0;
  const totalAnual = botellas * 52;
  const tiempoDegradacion = totalAnual > 0 ? "450 años" : "0 años";
  
  let recomendacion = "";
  let claseAlerta = "";

  if (botellas === 0) {
    claseAlerta = "verde";
    recomendacion = "🌟 <strong>¡Increíble, nivel Héroe Ecológico!</strong> Sigue así, estás cuidando al planeta al máximo al no generar estos residuos.";
  } else if (botellas >= 1 && botellas <= 3) {
    claseAlerta = "verde";
    recomendacion = "👍 <strong>¡Buen trabajo!</strong> Tu consumo es bajo. Intenta sustituirlas por completo usando un termo reutilizable en la escuela.";
  } else if (botellas >= 4 && botellas <= 7) {
    claseAlerta = "naranja";
    recomendacion = "⚠️ <strong>¡Atención!</strong> Estás usando casi una botella diaria. Te sugerimos organizar con tu grupo un reto para usar cantimploras de agua.";
  } else {
    claseAlerta = "naranja";
    recomendacion = "🚨 <strong>¡Alerta Ecológica!</strong> Tu consumo es muy alto. Recuerda que cada botella tarda siglos en degradarse. ¡Es momento de cambiar a un termo hoy mismo!";
  }
  
  document.getElementById("resultadoCalculadora").innerHTML = `
    <div class="panel-alerta ${claseAlerta}">
      📊 <strong>Tu impacto estimado:</strong><br>
      Desechas unas <strong>${totalAnual} botellas</strong> de plástico al año.<br>
      Esa basura acumulada tardará más de <strong>${tiempoDegradacion}</strong> en desaparecer de la Tierra si no se recicla.<br><br>
      🌱 <strong>Recomendación para ti:</strong><br>
      ${recomendacion}
    </div>`;
}

// ==========================================
// 5. CONSULTAR ESTADO DE MIS REPORTES
// ==========================================
async function buscarMisReportes() {
  const nombreBuscar = document.getElementById("busquedaNombre").value.trim().toLowerCase();
  const contenedor = document.getElementById("listaMisReportes");
  
  // Si la caja de texto de búsqueda está vacía, no hacemos la petición de red
  if (!nombreBuscar) { return; }

  try {
    const respuesta = await fetch("/api/datos");
    const datos = await respuesta.json();

    const filtrados = datos.filter(item => item.nombre && item.nombre.toLowerCase().includes(nombreBuscar));

    contenedor.innerHTML = "";
    if (filtrados.length === 0) {
      contenedor.innerHTML = "<p>No encontramos reportes con ese nombre.</p>";
      return;
    }

    filtrados.forEach(item => {
      const claseEstado = item.estado === "Resuelto" ? "status-resuelto" : "status-pendiente";
      const icono = item.estado === "Resuelto" ? "✅" : "⏳";
      const fechaFormateada = item.fecha ? new Date(item.fecha).toLocaleDateString() : "Reciente";
      
      contenedor.innerHTML += `
        <div class="status-card ${claseEstado}">
          <strong>${icono} Estado: ${item.estado || "Pendiente"}</strong><br>
          <small>Detalle: ${item.mensaje}</small><br>
          <small style="color:#777;">Fecha: ${fechaFormateada}</small>
        </div>`;
    });
  } catch (error) {
    console.error("Error en consulta de alumno:", error);
  }
}

// ==========================================
// 🔄 6. ACTUALIZACIÓN AUTOMÁTICA EN SEGUNDO PLANO (CADA 3 SEGUNDOS)
// ==========================================
setInterval(() => {
  // Llama de forma automática a la búsqueda solo si el alumno ya escribió un nombre
  const nombreBuscar = document.getElementById("busquedaNombre") ? document.getElementById("busquedaNombre").value.trim() : "";
  if (nombreBuscar !== "") {
    buscarMisReportes();
  }
}, 3000);
