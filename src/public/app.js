// ==========================================
// 1. NAVEGACIÓN ENTRE PESTAÑAS
// ==========================================
window.cambiarPestana = function(idPestana, boton) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(idPestana).classList.add('active');
  boton.classList.add('active');
}

// ==========================================
// 2. CONCIENTIZACIÓN DE DEGRADACIÓN
// ==========================================
window.mostrarDegradacion = function() {
  const material = document.getElementById("comboMateriales").value;
  const res = document.getElementById("resultadoDegradacion");
  
  const datos = {
    plastico: { tiempo: "450 años", info: "Las botellas se fragmentan en microplásticos dañinos para el suelo.", tipo: "naranja" },
    chicle: { tiempo: "5 años", info: "Contiene resinas sintéticas que los pájaros confunden con comida.", tipo: "naranja" },
    lata: { tiempo: "10 años", info: "El aluminio se oxida lentamente, requiere mucha energía reciclarlo.", tipo: "naranja" },
    papel: { tiempo: "1 año", info: "Se degrada rápido si hay humedad, pero evitemos desperdiciarlo.", tipo: "verde" },
    vidrio: { tiempo: "4,000 años", info: "Es 100% reciclable de forma infinita, pero tarda milenios en la naturaleza.", tipo: "naranja" }
  };

  if(!material) { res.innerHTML = ""; return; }
  const data = datos[material];
  // CORREGIDO: Se cambió data.type por data.tipo para que carguen los estilos correctamente
  res.innerHTML = `<div class="panel-alerta ${data.tipo}"><strong>Tiempo de degradación:</strong> ${data.tiempo}<br><small>${data.info}</small></div>`;
}

// ==========================================
// 3. REPORTAR CON IMAGEN (BASE64)
// ==========================================
let base64Foto = "";

window.previsualizarFoto = function() {
  const file = document.getElementById("fotoInput").files[0];
  const preview = document.getElementById("preview");
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = function () {
    base64Foto = reader.result; // Aquí se guarda la foto en Base64 de forma correcta
    preview.src = base64Foto;
    preview.style.display = "block";
  }
  reader.readAsDataURL(file);
}

// Esperamos a que cargue el DOM para enganchar de manera segura el evento Submit del formulario
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formularioReporte");
  if (formulario) {
    formulario.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombreAlumno").value;
      const mensaje = document.getElementById("mensajeAlumno").value;

      // Enviamos los datos directo a tu API
      const respuesta = await fetch("/api/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre, 
          mensaje, 
          foto: base64Foto, // Ahora sí se envía la imagen codificada
          estado: "Pendiente",
          fecha: new Date().toISOString() // Añadimos fecha para que funcione la gráfica del admin
        })
      });

      const res = await respuesta.json();
      if (res.ok) {
        alert("¡Reporte enviado con éxito! Puedes consultar su estado en la sección 'Mi Reporte' usando tu nombre.");
        formulario.reset();
        document.getElementById("preview").style.display = "none";
        base64Foto = ""; // Limpiamos la variable
      } else {
        alert("Error al enviar el reporte.");
      }
    });
  }
});

// ==========================================
// 4. CALCULADORA ECOLÓGICA CON RECOMENDACIONES DINÁMICAS
// ==========================================
window.calcularImpacto = function() {
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
window.buscarMisReportes = async function() {
  const nombreBuscar = document.getElementById("busquedaNombre").value.trim().toLowerCase();
  const contenedor = document.getElementById("listaMisReportes");
  if (!nombreBuscar) { alert("Escribe un nombre para buscar."); return; }

  contenedor.innerHTML = "Buscando...";
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
    
    // Mostramos la imagen dentro del historial si el reporte la tiene
    const renderFoto = item.foto ? `<br><img src="${item.foto}" style="max-width:80px; margin-top:5px; border-radius:4px; display:block;" alt="Evidencia">` : "";

    contenedor.innerHTML += `
      <div class="status-card ${claseEstado}">
        <strong>${icono} Estado: ${item.estado}</strong><br>
        <small>Detalle: ${item.mensaje}</small>
        ${renderFoto}
        <br><small style="color:#777;">Fecha: ${item.fecha ? new Date(item.fecha).toLocaleDateString() : 'Sin fecha'}</small>
      </div>`;
  });
}
