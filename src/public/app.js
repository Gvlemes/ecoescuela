// ==========================================
// 1. NAVEGACIÓN ENTRE PESTAÑAS
// ==========================================
function cambiarPestana(idPestana, boton) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(idPestana).classList.add('active');
  boton.classList.add('active');
}

// ==========================================
// 2. CONCIENTIZACIÓN DE DEGRADACIÓN
// ==========================================
// ==========================================
// 2. CONCIENTIZACIÓN DE DEGRADACIÓN
// ==========================================
function mostrarDegradacion() {
  const material = document.getElementById("comboMateriales").value;
  const res = document.getElementById("resultadoDegradacion");
  
  const datos = {
    // 🍏 MATERIALES BÁSICOS
    plastico: { tiempo: "450 años", info: "Las botellas se fragmentan en microplásticos dañinos para el suelo.", tipo: "naranja" },
    chicle: { tiempo: "5 años", info: "Contiene resinas sintéticas que los pájaros confunden con comida.", tipo: "naranja" },
    lata: { tiempo: "10 a 100 años", info: "El aluminio se oxida lentamente, requiere mucha energía reciclarlo.", tipo: "naranja" },
    papel: { tiempo: "2 a 5 meses", info: "Se degrada rápido si hay humedad. ¡Recíclalo en los botes azules!", tipo: "verde" },
    vidrio: { tiempo: "4,000 años", info: "Es 100% reciclable de forma infinita, pero tarda milenios en la naturaleza.", tipo: "naranja" },

    // 💼 GESTIÓN ADMINISTRATIVA
    papel_bond: { tiempo: "2 a 5 meses", info: "Su producción gasta mucha agua. Fomenta el uso de archivos digitales en oficinas.", tipo: "verde" },
    carton_archivo: { tiempo: "1 año", info: "El cartón es altamente reciclable; se debe reutilizar para archivo interno.", tipo: "verde" },
    boligrafo: { tiempo: "100 años", info: "Hecho de plásticos densos y puntas metálicas. Prefiere plumas recargables.", tipo: "naranja" },

    // 🤖 MECATRÓNICA
    cables: { tiempo: "30 a 40 años", info: "El recubrimiento aislante de PVC se fragmenta liberando toxinas al entorno.", tipo: "naranja" },
    metales_taller: { tiempo: "100 años", info: "Las rebabas y piezas de metal tardan un siglo en corroerse. El scrap debe fundirse.", tipo: "naranja" },
    baterias: { tiempo: "500 a 1,000 años", info: "Liberan litio y mercurio. Deben ir exclusivamente al contenedor de pilas.", tipo: "naranja" },

    // 🔧 SOPORTE Y MANTENIMIENTO
    carcasa: { tiempo: "150 años", info: "Plásticos ABS de computadoras. El soporte debe priorizar reparar antes de desechar.", tipo: "naranja" },
    teclado: { tiempo: "400 años", info: "Las teclas resisten siglos debido a los polímeros de alta densidad.", tipo: "naranja" },
    toner: { tiempo: "450 años", info: "Contiene polvos químicos nocivos que pueden contaminar el aire del laboratorio.", tipo: "naranja" },

    // 💻 PROGRAMACIÓN
    cd: { tiempo: "100 años", info: "Los discos ópticos tardan un siglo. Es mejor usar almacenamiento en la nube.", tipo: "naranja" },
    usb: { tiempo: "300 años", info: "Las resinas epóxicas y componentes de memorias dañadas no se degradan fácilmente.", tipo: "naranja" },

    // 🏭 PRODUCCIÓN INDUSTRIAL
    pallets: { tiempo: "1 a 3 años", info: "Madera industrial. Se puede reutilizar para proyectos de diseño o mobiliario.", tipo: "verde" },
    flejes: { tiempo: "300 años", info: "Las bandas plásticas de embalaje se acumulan rompiendo ciclos ecológicos.", tipo: "naranja" },
    neumaticos: { tiempo: "600 años", info: "El caucho vulcanizado tarda siglos y su acumulación genera riesgos de incendio.", tipo: "naranja" }
  };

  if(!material) { res.innerHTML = ""; return; }
  const data = datos[material];
  // Corregido: Se cambió "data.type" por "data.tipo" para que coincida con tu objeto
  res.innerHTML = `<div class="panel-alerta ${data.tipo}"><strong>Tiempo de degradación:</strong> ${data.tiempo}<br><small>${data.info}</small></div>`;
}

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
