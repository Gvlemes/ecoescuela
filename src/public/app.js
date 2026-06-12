function cambiarPestana(idPestana, boton) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(idPestana).classList.add('active');
  boton.classList.add('active');
}

function mostrarDegradacion() {
  const material = document.getElementById("comboMateriales").value;
  const res = document.getElementById("resultadoDegradacion");
  
  const datos = {
    // Básicos
    plastico: { tiempo: "450 años", info: "Las botellas se fragmentan lentamente en microplásticos dañinos para el medio ambiente.", tipo: "naranja" },
    chicle: { tiempo: "5 años", info: "Contiene polímeros sintéticos. Al endurecerse atrapa bacterias de las superficies.", tipo: "naranja" },
    lata: { tiempo: "10 años", info: "El aluminio se oxida de forma paulatina. Reciclarlo ahorra un 95% de energía.", tipo: "naranja" },
    vidrio: { tiempo: "4,000 años", info: "Estructura mineral sumamente resistente, aunque es 100% reciclable de forma infinita.", tipo: "naranja" },
    // Mecatrónica
    tarjeta: { tiempo: "100 a 500 años", info: "La combinación de fibra de vidrio, resina epoxi y metales pesados contamina gravemente los mantos acuíferos si se desecha incorrectamente.", tipo: "naranja" },
    soldadura: { tiempo: "Permanente", info: "Las aleaciones no sufren degradación biológica y acumulan metales nocivos en el suelo de la escuela.", tipo: "naranja" },
    // Producción Industrial
    chatarra: { tiempo: "50 a 100 años", info: "El acero y hierro se corroen lentamente. Sus residuos afilados representan un riesgo de seguridad.", tipo: "naranja" },
    aceite: { tiempo: "No biodegradable", info: "Forma una capa impermeable sobre el agua y suelo, asfixiando la flora y la fauna locales.", tipo: "naranja" },
    // Soporte y Mantenimiento
    cable: { tiempo: "200 a 400 años", info: "El revestimiento plástico de PVC no se disuelve y libera toxinas nocivas si se incinera de manera directa.", tipo: "naranja" },
    pila: { tiempo: "1,000 años", info: "Altamente peligrosa. Una sola pila de reloj puede contaminar miles de litros de agua debido al mercurio y litio.", tipo: "naranja" },
    // Programación
    disco: { tiempo: "Más de 500 años", info: "Los platos mecánicos de aluminio y carcasas magnéticas requieren procesos de reciclaje tecnológico especializado.", tipo: "naranja" },
    // Procesos de Gestión Administrativa
    toner: { tiempo: "450 años", info: "Los plásticos de ingeniería del cartucho resisten la intemperie y el polvo químico es nocivo si se inhala.", tipo: "naranja" },
    archivo: { tiempo: "1 a 3 años", info: "El papel estándar es biodegradable en composteros, pero las tintas sintéticas tardan más en disolverse.", tipo: "verde" }
  };

  if(!material) { res.innerHTML = ""; return; }
  const data = datos[material];
  res.innerHTML = `<div class="panel-alerta ${data.type}"><strong>Tiempo estimado en la naturaleza:</strong> ${data.tiempo}<br><small>${data.info}</small></div>`;
}

let base64Foto = "";
function previsualizarFoto() {
  const file = document.getElementById("fotoInput").files;
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

  const respuesta = await fetch("/api/guardar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, mensaje, foto: base64Foto, estado: "Pendiente" })
  });

  const res = await respuesta.json();
  if (res.ok) {
    alert("¡Reporte enviado con éxito! Consúltalo en 'Mi Reporte' con tu nombre.");
    document.getElementById("formularioReporte").reset();
    document.getElementById("preview").style.display = "none";
    base64Foto = "";
  } else {
    alert("Error al enviar el reporte.");
  }
});

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
    recomendacion = "👍 <strong>¡Buen trabajo!</strong> Tu consumo es bajo. Intenta sustituirlas por completo usando un termo reutilizable.";
  } else if (botellas >= 4 && botellas <= 7) {
    claseAlerta = "naranja";
    recomendacion = "⚠️ <strong>¡Atención!</strong> Estás usando casi una botella diaria. Te sugerimos organizar un reto con tu grupo para usar cantimploras.";
  } else {
    claseAlerta = "naranja";
    recomendacion = "🚨 <strong>¡Alerta Ecológica!</strong> Tu consumo es muy alto. Recuerda que cada botella tarda siglos en desaparecer. ¡Cambia a un termo hoy mismo!";
  }
  
  document.getElementById("resultadoCalculadora").innerHTML = `
    <div class="panel-alerta ${claseAlerta}">
      📊 <strong>Tu impacto estimado:</strong><br>
      Desechas unas <strong>${totalAnual} botellas</strong> al año.<br>
      Esa basura tardará más de <strong>${tiempoDegradacion}</strong> en desaparecer de la Tierra.<br><br>
      🌱 <strong>Recomendación:</strong><br>
      ${recomendacion}
    </div>`;
}

async function buscarMisReportes() {
  const nombreBuscar = document.getElementById("busquedaNombre").value.trim().toLowerCase();
  const contenedor = document.getElementById("listaMisReportes");
  if (!nombreBuscar) { alert("Escribe un nombre para buscar."); return; }

  contenedor.innerHTML = "Buscando...";
  const respuesta = await fetch("/api/datos");
  const datos = await respuesta.json();

  const filtrados = datos.filter(item => item.nombre.toLowerCase().includes(nombreBuscar));

  contenedor.innerHTML = "";
  if (filtrados.length === 0) {
    contenedor.innerHTML = "<p>No encontramos reportes con ese nombre.</p>";
    return;
  }

  filtrados.forEach(item => {
    const claseEstado = item.estado === "Resuelto" ? "status-resuelto" : "status-pendiente";
    const icono = item.estado === "Resuelto" ? "✅" : "⏳";
    contenedor.innerHTML += `
      <div class="status-card ${claseEstado}">
        <strong>${icono} Estado: ${item.estado}</strong><br>
        <small>Detalle: ${item.mensaje}</small><br>
        <small style="color:#777;">Fecha: ${new Date(item.fecha).toLocaleDateString()}</small>
      </div>`;
  });
}
