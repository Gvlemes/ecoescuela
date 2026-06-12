// ==========================================
// 1. MANEJO DE PESTAÑAS (Navegación del sistema)
// ==========================================
const botonesTab = document.querySelectorAll(".tab-btn");
const contenidosTab = document.querySelectorAll(".tab-content");

botonesTab.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesTab.forEach(b => b.classList.remove("active"));
    contenidosTab.forEach(c => c.classList.remove("active"));

    boton.classList.add("active");
    const targetId = boton.getAttribute("data-target");
    document.getElementById(targetId).classList.add("active");
  });
});

// ==========================================
// 2. PESTAÑA DE DEGRADACIÓN (Datos informativos)
// ==========================================
const datosDegradacion = {
  plastico: { tiempo: "450 años", info: "Altamente contaminante, se fragmenta en microplásticos nocivos.", clase: "naranja" },
  chicle: { tiempo: "5 años", info: "Se endurece y degrada lentamente por acción del oxígeno.", clase: "naranja" },
  lata: { tiempo: "10 a 100 años", info: "El aluminio requiere mucho tiempo para oxidarse por completo.", clase: "naranja" },
  vidrio: { tiempo: "4000 años", info: "Es reciclable al 100% pero en la naturaleza tarda milenios.", clase: "verde" },
  tarjeta: { tiempo: "Más de 500 años", info: "Contiene fibra de vidrio, polímeros y metales pesados.", clase: "naranja" },
  soldadura: { tiempo: "Indefinido", info: "Los metales como el estaño y plomo saturan el suelo de toxicidad.", clase: "naranja" },
  chatarra: { tiempo: "3 a 10 años", info: "Se oxida con facilidad en presencia de humedad.", clase: "verde" },
  aceite: { tiempo: "Altamente persistente", info: "Un solo litro contamina hasta un millón de litros de agua dulce.", clase: "naranja" },
  cable: { tiempo: "100 a 400 años", info: "El recubrimiento de PVC no se descompone biológicamente.", clase: "naranja" },
  pila: { tiempo: "1000 años", info: "Altamente peligrosa; mercurio y litio pueden filtrarse a mantos acuíferos.", clase: "naranja" },
  disco: { tiempo: "Más de 200 años", info: "Compuesto de aluminio fundido y recubrimientos magnéticos complejos.", clase: "naranja" },
  toner: { tiempo: "450 años", info: "Los polímeros plásticos del cartucho tardan siglos en desintegrarse.", clase: "naranja" },
  archivo: { tiempo: "2 a 5 semanas", info: "El papel estándar se degrada rápido, pero tintas químicas retrasan el proceso.", clase: "verde" }
};

document.getElementById("comboMateriales").addEventListener("change", (e) => {
  const contenedor = document.getElementById("resultadoDegradacion");
  const seleccion = e.target.value;

  if (!seleccion || !datosDegradacion[seleccion]) {
    contenedor.innerHTML = "";
    return;
  }

  const { tiempo, info, clase } = datosDegradacion[seleccion];
  contenedor.innerHTML = `
    <div class="panel-alerta ${clase}">
      <strong>⏱️ Tiempo estimado:</strong> ${tiempo}<br>
      <p style="margin-top:5px; color:inherit; font-size:13px;">${info}</p>
    </div>
  `;
});

// ==========================================
// 3. PREVISUALIZACIÓN Y PROCESAMIENTO DE FOTO
// ==========================================
const fotoInput = document.getElementById("fotoInput");
const preview = document.getElementById("preview");
let stringFotoBase64 = "";

fotoInput.addEventListener("change", (e) => {
  const archivo = e.target.files[0];
  if (archivo) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      preview.src = evt.target.result;
      preview.style.display = "block";
      stringFotoBase64 = evt.target.result; // URL Base64 para transferencia directa
    };
    reader.readAsDataURL(archivo);
  } else {
    preview.style.display = "none";
    stringFotoBase64 = "";
  }
});

// ==========================================
// 4. ENVÍO DE REPORTE AL BACKEND (POST)
// ==========================================
document.getElementById("formularioReporte").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btnEnviar = document.getElementById("btnEnviar");

  const nombre = document.getElementById("nombreAlumno").value.trim();
  const mensaje = document.getElementById("mensajeAlumno").value.trim();

  btnEnviar.disabled = true;
  btnEnviar.innerText = "Enviando reporte...";

  try {
    // Almacenamos el payload listo para mandarse al backend de express
    const payload = {
      nombre,
      mensaje,
      foto: stringFotoBase64, // Enviamos el string codificado de la imagen
      fecha: new Date().toISOString(),
      estado: "Pendiente"
    };

    // Ajusta la URL si tu endpoint de creación cambia (ej: /api/nuevo-reporte)
    const respuesta = await fetch("/api/datos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (respuesta.ok) {
      alert("¡Reporte enviado exitosamente a la escuela! 🎉");
      document.getElementById("formularioReporte").reset();
      preview.style.display = "none";
      stringFotoBase64 = "";
    } else {
      alert("Hubo un problema al procesar el reporte en el servidor.");
    }
  } catch (error) {
    console.error(error);
    alert("Error de conexión con la base de datos.");
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.innerText = "Enviar Reporte a la Escuela";
  }
});

// ==========================================
// 5. CALCULADORA DE IMPACTO
// ==========================================
document.getElementById("btnCalcular").addEventListener("click", () => {
  const botellas = parseInt(document.getElementById("calcBotellas").value) || 0;
  const contenedor = document.getElementById("resultadoCalculadora");

  const alAnio = botellas * 52;
  const tiempoDescomposicion = alAnio * 450;

  contenedor.innerHTML = `
    <div class="panel-alerta naranja" style="margin-top:15px;">
      Al año consumes aproximadamente <strong>${alAnio} botellas</strong>.<br>
      Tus desechos anuales tardarán un acumulado de <strong>${tiempoDescomposicion} años</strong> en desaparecer del planeta.
    </div>
  `;
});

// ==========================================
// 6. BUSCADOR DE HISTORIAL / ESTADOS (GET)
// ==========================================
document.getElementById("btnBuscar").addEventListener("click", async () => {
  const nombreBusqueda = document.getElementById("busquedaNombre").value.trim().toLowerCase();
  const contenedorResultados = document.getElementById("listaMisReportes");

  if (!nombreBusqueda) {
    alert("Por favor introduce un nombre o grupo para realizar la consulta.");
    return;
  }

  contenedorResultados.innerHTML = "Buscando en la base de datos...";

  try {
    const respuesta = await fetch("/api/datos");
    const reportes = await respuesta.json();

    // Filtramos los reportes que coincidan parcialmente con el nombre ingresado
    const filtrados = reportes.filter(r => r.nombre && r.nombre.toLowerCase().includes(nombreBusqueda));

    contenedorResultados.innerHTML = "";

    if (filtrados.length === 0) {
      contenedorResultados.innerHTML = "<p style='font-size:14px; color:#666;'>No se encontraron reportes asociados a ese nombre.</p>";
      return;
    }

    filtrados.forEach(rep => {
      const div = document.createElement("div");
      const esResuelto = rep.estado === "Resuelto";
      div.className = `status-card ${esResuelto ? 'status-resuelto' : 'status-pendiente'}`;

      const tagFoto = rep.foto ? `<img src="${rep.foto}" class="foto-status" alt="Evidencia adjunta">` : "";

      div.innerHTML = `
        <strong>Estado: ${rep.estado || "Pendiente"}</strong><br>
        <span style="font-size:13px; color:#555;">${rep.mensaje}</span><br>
        ${tagFoto}
        <small style="display:block; margin-top:5px; color:#888;">Fecha: ${rep.fecha ? new Date(rep.fecha).toLocaleDateString() : 'No registrada'}</small>
      `;
      contenedorResultados.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    contenedorResultados.innerHTML = "<p style='color:red; font-size:14px;'>Error al conectar con el servidor.</p>";
  }
});
