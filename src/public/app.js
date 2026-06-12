// Base de datos local de materiales y residuos
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

// 2. MOSTRAR INFORMACIÓN DE DEGRADACIÓN
window.mostrarDegradacion = function() {
  const seleccion = document.getElementById("comboMateriales").value;
  const contenedor = document.getElementById("resultadoDegradacion");

  // Si no hay selección válida, limpiamos el recuadro
  if (!seleccion || !datosDegradacion[seleccion]) {
    contenedor.innerHTML = "";
    return;
  }

  const { tiempo, info, clase } = datosDegradacion[seleccion];
  
  // Renderizamos la alerta con los estilos originales
  contenedor.innerHTML = `
    <div class="panel-alerta ${clase}" style="margin-top: 15px;">
      <strong>⏱️ Tiempo estimado:</strong> ${tiempo}<br>
      <p style="margin-top:5px; color:inherit; font-size:13px;">${info}</p>
    </div>
  `;
};
// 3. PREVISUALIZAR LA FOTO Y TRANSFORMARLA A CADENA BASE64
window.previsualizarFoto = function() {
  const input = document.getElementById("fotoInput");
  const preview = document.getElementById("preview");
  
  if (input.files && input.files[0]) {
    const lector = new FileReader();
    
    lector.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = "block"; // Muestra la foto en miniatura
      fotoBase64 = e.target.result;    // Guarda la cadena de texto de la imagen
    };
    
    lector.readAsDataURL(input.files[0]);
  } else {
    preview.style.display = "none";
    fotoBase64 = "";
  }
};

// INTERCEPTOR DEL FORMULARIO DE ENVÍO
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formularioReporte");
  if (formulario) {
    formulario.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evita que la página se refresque sola
      
      const nombre = document.getElementById("nombreAlumno").value;
      const mensaje = document.getElementById("mensajeAlumno").value;
      
      try {
        const respuesta = await fetch("/api/datos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nombre,
            mensaje: mensaje,
            foto: fotoBase64, // Mandamos el texto de la imagen directamente a Firestore
            fecha: new Date().toISOString(),
            estado: "Pendiente"
          })
        });
        
        if (respuesta.ok) {
          alert("¡Reporte enviado exitosamente a la escuela! 🎉");
          formulario.reset();
          document.getElementById("preview").style.display = "none";
          fotoBase64 = ""; // Reseteamos la variable
        } else {
          alert("Error en el servidor al intentar procesar el reporte.");
        }
      } catch (err) {
        console.error(err);
        alert("No se pudo establecer conexión con el servidor.");
      }
    });
  }
});
/ 4. CALCULADORA DE DESECHOS PLÁSTICOS
window.calcularImpacto = function() {
  const botellas = parseInt(document.getElementById("calcBotellas").value) || 0;
  const contenedor = document.getElementById("resultadoCalculadora");

  const alAnio = botellas * 52;
  const tiempoTotal = alAnio * 450;

  contenedor.innerHTML = `
    <div class="panel-alerta naranja" style="margin-top: 15px;">
      Al año consumes aproximadamente <strong>${alAnio} botellas</strong>.<br>
      Tus desperdicios anuales tardarán un equivalente de <strong>${tiempoTotal} años</strong> en desaparecer por completo.
    </div>
  `;
};
Usa el código con precaución.Parte 5: Buscador del Historial de EstadosEsta función realiza una petición de tipo GET a tu API, busca coincidencias por el nombre del alumno y dibuja la lista de sus reportes mostrando el estado actual ("Pendiente" o "Resuelto") junto con la foto que envió.javascript// 5. CONSULTAR HISTORIAL Y ESTADO DE REPORTES
window.buscarMisReportes = async function() {
  const nombreBusqueda = document.getElementById("busquedaNombre").value.trim().toLowerCase();
  const contenedorResultados = document.getElementById("listaMisReportes");

  if (!nombreBusqueda) {
    alert("Por favor, introduce tu nombre o grupo para buscar.");
    return;
  }

  contenedorResultados.innerHTML = "Buscando en los registros escolares...";

  try {
    const respuesta = await fetch("/api/datos");
    const reportes = await respuesta.json();

    // Filtramos los documentos de Firestore que contengan el nombre del alumno
    const filtrados = reportes.filter(r => r.nombre && r.nombre.toLowerCase().includes(nombreBusqueda));

    contenedorResultados.innerHTML = "";

    if (filtrados.length === 0) {
      contenedorResultados.innerHTML = "<p style='font-size: 14px; color: #666;'>No se encontraron reportes con ese nombre.</p>";
      return;
    }

    filtrados.forEach(rep => {
      const div = document.createElement("div");
      const esResuelto = rep.estado === "Resuelto";
      div.className = `status-card ${esResuelto ? 'status-resuelto' : 'status-pendiente'}`;

      // Si el reporte contiene el String de la foto, lo dibujamos en miniatura
      const tagFoto = rep.foto ? `<img src="${rep.foto}" style="max-width: 100px; display: block; margin-top: 8px; border-radius: 4px;" alt="Evidencia">` : "";

      div.innerHTML = `
        <strong>Estado: ${rep.estado || "Pendiente"}</strong><br>
        <span style="font-size: 13px; color: #555;">${rep.mensaje}</span><br>
        ${tagFoto}
        <small style="display: block; margin-top: 5px; color: #888;">Fecha: ${rep.fecha ? new Date(rep.fecha).toLocaleDateString() : 'No registrada'}</small>
      `;
      contenedorResultados.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    contenedorResultados.innerHTML = "<p style='color: red; font-size: 14px;'>Error al conectar con el servidor.</p>";
  }
};
