// ==========================================
// VARIABLE GLOBAL PARA LA IMAGEN
// ==========================================
let base64Foto = "";

// ==========================================
// 1. NAVEGACIÓN ENTRE PESTAÑAS
// ==========================================
window.cambiarPestana = function(idPestana, boton) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(idPestana).classList.add('active');
  boton.classList.add('active');
};

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
    vidrio: { tiempo: "4,000 años", info: "Es 100% reciclable de forma infinita, pero tarda milenios en la naturaleza.", tipo: "naranja" },
    tarjeta: { tiempo: "Más de 500 años", info: "Contiene fibra de vidrio, polímeros y metales pesados.", tipo: "naranja" },
    soldadura: { tiempo: "Indefinido", info: "Los metales como el estaño y plomo saturan el suelo de toxicidad.", tipo: "naranja" },
    chatarra: { tiempo: "3 a 10 años", info: "Se oxida con facilidad en presencia de humedad.", tipo: "verde" },
    aceite: { tiempo: "Altamente persistente", info: "Un solo litro contamina hasta un millón de litros de agua dulce.", tipo: "naranja" },
    cable: { tiempo: "100 a 400 años", info: "El recubrimiento de PVC no se descompone biológicamente.", tipo: "naranja" },
    pila: { tiempo: "1000 años", info: "Altamente peligrosa; mercurio y litio pueden filtrarse a mantos acuíferos.", tipo: "naranja" },
    disco: { tiempo: "Más de 200 años", info: "Compuesto de aluminio fundido y recubrimientos magnéticos complejos.", tipo: "naranja" },
    toner: { tiempo: "450 años", info: "Los polímeros plásticos del cartucho tardan siglos en desintegrarse.", tipo: "naranja" },
    archivo: { tiempo: "2 a 5 semanas", info: "El papel estándar se degrada rápido, pero tintas químicas retrasan el proceso.", tipo: "verde" }
  };

  if (!material) { res.innerHTML = ""; return; }
  const data = datos[material] || { tiempo: "Desconocido", info: "No hay información de este elemento.", tipo: "naranja" };
  
  res.innerHTML = `<div class="panel-alerta ${data.tipo}"><strong>Tiempo de degradación:</strong> ${data.tiempo}<br><small>${data.info}</small></div>`;
};

// ==========================================
// 3. REPORTAR CON COMPRESIÓN ANTICAÍDAS (BASE64)
// ==========================================
window.previsualizarFoto = function() {
  const file = document.getElementById("fotoInput").files[0]; // Captura el archivo individual
  const preview = document.getElementById("preview");
  
  if (!file) {
    base64Foto = "";
    preview.style.display = "none";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;
    
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Redimensionamos la foto a un ancho máximo de 800px para cuidar la RAM de Render
      const MAX_WIDTH = 800;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Comprimimos la calidad al 60% en formato JPEG para un peso ultraligero
      base64Foto = canvas.toDataURL("image/jpeg", 0.6);
      
      // Mostramos la previsualización optimizada en la pantalla
      preview.src = base64Foto;
      preview.style.display = "block";
    };
  };
  reader.readAsDataURL(file);
};

window.enviarReporteNuevo = async function(event) {
  event.preventDefault(); 

  const nombreInput = document.getElementById("nombreAlumno");
  const mensajeInput = document.getElementById("mensajeAlumno");

  const nombre = nombreInput.value.trim();
  const mensaje = mensajeInput.value.trim();

  if (!nombre || !mensaje) {
    alert("Por favor, llena los campos obligatorios (Nombre y Problema).");
    return;
  }

  const urlBase = window.location.origin;

  try {
    const respuesta = await fetch(`${urlBase}/api/guardar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        nombre: nombre, 
        mensaje: mensaje, 
        foto: base64Foto, // Envía la foto comprimida de forma ligera
        estado: "Pendiente"
      })
    });

    const res = await respuesta.json();
    
    if (res.ok) {
      alert("¡Reporte enviado con éxito! Puedes consultar su estado en la sección 'Mi Reporte' usando tu nombre.");
      document.getElementById("formularioReporte").reset();
      document.getElementById("preview").style.display = "none";
      base64Foto = ""; 
    } else {
      alert("Error al enviar el reporte: " + (res.error || "Falla interna."));
    }
  } catch (err) {
    console.error("Error capturado:", err);
    alert("No se pudo conectar con el servidor. Si acabas de abrir la página en Render, espera 1 minuto a que el servidor termine de encender de fondo e inténtalo de nuevo.");
  }
};

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
};

// ==========================================
// 5. CONSULTAR ESTADO DE MIS REPORTES
// ==========================================
window.buscarMisReportes = function() {
  const nombreBuscar = document.getElementById("busquedaNombre").value.trim().toLowerCase();
  const contenedor = document.getElementById("listaMisReportes");
  if (!nombreBuscar) { alert("Escribe un nombre para buscar."); return; }

  contenedor.innerHTML = "Buscando...";
  
  const urlBase = window.location.origin;

  fetch(`${urlBase}/api/datos`)
    .then(respuesta => respuesta.json())
    .then(datos => {
      const filtrados = datos.filter(item => item.nombre && item.nombre.toLowerCase().includes(nombreBuscar));

      contenedor.innerHTML = "";
      if (filtrados.length === 0) {
        contenedor.innerHTML = "<p>No encontramos reportes con ese nombre.</p>";
        return;
      }

      filtrados.forEach(item => {
        const claseEstado = item.estado === "Resuelto" ? "status-resuelto" : "status-pendiente";
        const icono = item.estado === "Resuelto" ? "✅" : "⏳";
        
        const renderFoto = item.foto ? `<br><img src="${item.foto}" style="max-width:80px; margin-top:8px; border-radius:4px; display:block;" alt="Evidencia">` : "";
        const fechaTexto = item.fecha ? new Date(item.fecha).toLocaleDateString() : 'Sin fecha';

        contenedor.innerHTML += `
          <div class="status-card ${claseEstado}">
            <strong>${icono} Estado: ${item.estado || 'Pendiente'}</strong><br>
            <small>Detalle: ${item.mensaje || 'Sin descripción'}</small>
            ${renderFoto}
            <br><small style="color:#777;">Fecha: ${fechaTexto}</small>
          </div>`;
      });
    })
    .catch(error => {
      console.error("Error en consulta:", error);
      contenedor.innerHTML = "<p style='color:red;'>Error al conectar con la base de datos.</p>";
    });
};
