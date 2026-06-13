// ==========================================
// 1. NAVEGACIÓN ENTRE PESTAÑAS
// ==========================================
function cambiarPestana(idPestana, boton) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(idPestana).classList.add('active');
  boton.classList.add('active');
}

<label for="comboMateriales">Selecciona un material:</label>
<select id="comboMateriales" onchange="mostrarDegradacion()">
  <option value="">-- Seleccionar --</option>
  
  <optgroup label="🍏 Materiales Básicos">
    <option value="chicle">Chicle</option>
    <option value="pet">Botella de Plástico</option>
    <option value="aluminio">Lata de Aluminio</option>
    <option value="bolsa">Bolsa Plástica</option>
    <option value="carton">Papel o Cartón</option>
    <option value="unicel">Unicel</option>
    <option value="organico">Residuos Orgánicos</option>
  </optgroup>

  <optgroup label="🤖 Mecatrónica">
    <option value="jumpers">Cables Jumpers (PVC/Cobre)</option>
    <option value="pilas">Pilas y Baterías Alcalinas</option>
    <option value="pcbs">Tarjetas de Circuitos (PCBs)</option>
    <option value="motores">Motores DC / Servomotores</option>
    <option value="resistencias">Resistencias y Componentes Cerámicos</option>
  </optgroup>

  <optgroup label="🔧 Soporte y Mantenimiento">
    <option value="carcasas">Carcasas de Plástico ABS</option>
    <option value="gabinetes">Gabinetes de Metal y Acero</option>
    <option value="termica">Pasta Térmica Usada</option>
    <option value="ethernet">Cableado Ethernet Estructural</option>
  </optgroup>

  <optgroup label="💻 Programación">
    <option value="discos">Discos Duros Dañados (HDD)</option>
    <option value="toner">Cartuchos de Tóner Láser</option>
  </optgroup>

  <optgroup label="💼 Progresos de Gestión Administrativa">
    <option value="carpetas">Carpetas Rígidas de PVC</option>
    <option value="hojas_calculo">Hojas de Cálculo Impresas</option>
  </optgroup>

  <optgroup label="🏭 Producción Industrial">
    <option value="virutas">Virutas de Metal con Aceite</option>
    <option value="bandas">Bandas de Transmisión / Caucho</option>
    <option value="cascos">Cascos de Protección</option>
  </optgroup>
</select>

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
