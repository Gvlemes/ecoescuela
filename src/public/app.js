// --- CONFIGURACIÓN DE BASE DE DATOS DE DEGRADACIÓN ---
const DATOS_DEGRADACION = {
  plastico: { tiempo: "500 años", alerta: "naranja", consejo: "Usa un termo reutilizable. Las botellas plásticas se fragmentan en microplásticos dañinos." },
  chicle: { tiempo: "5 años", alerta: "naranja", consejo: "El chicle se endurece y absorbe contaminantes. Tíralo siempre envuelto en papel al basurero." },
  lata: { tiempo: "10 años", alerta: "naranja", consejo: "El aluminio es 100% reciclable. Deposítalo en el contenedor de metales." },
  vidrio: { tiempo: "4,000 años", alerta: "naranja", consejo: "Es el material más duradero pero fácil de reciclar. ¡Evita que termine en el suelo!" },
  tarjeta: { tiempo: "Más de 1,000 años", alerta: "naranja", consejo: "Las PCBs contienen fibra de vidrio y resinas epóxicas. Deben ir a centros de reciclaje electrónico." },
  soldadura: { tiempo: "Indefinido", alerta: "naranja", consejo: "Contiene metales pesados que pueden contaminar el agua subterránea si se tiran al suelo." },
  chatarra: { tiempo: "50 a 100 años", alerta: "naranja", consejo: "Las virutas se oxidan, pero pueden herir a alguien. Reutilízalas en proyectos de fundición." },
  aceite: { tiempo: "Altamente persistente", alerta: "naranja", consejo: "¡Un solo litro de aceite contamina un millón de litros de agua! Almacénalo en bidones." },
  cable: { tiempo: "100 a 400 años", alerta: "naranja", consejo: "El PVC libera toxinas si se quema. Separa el cobre del plástico de forma segura." },
  pila: { tiempo: "500 a 1,000 años", alerta: "naranja", consejo: "Las pilas de botón contienen mercurio o litio altamente tóxicos. Usa contenedores especiales." },
  disco: { tiempo: "Siglos", alerta: "naranja", consejo: "Los platos magnéticos y carcasas de aluminio pueden ser desarmados y reciclados por separado." },
  toner: { tiempo: "450 años", alerta: "naranja", consejo: "El polvo de tóner es un peligro respiratorio y el plástico dura siglos. Prefiere cartuchos rellenables." },
  archivo: { tiempo: "2 a 5 años", alerta: "naranja", consejo: "El papel químico no es fácilmente reciclable como el papel normal debido a sus tintas. Reduce su uso." }
};

// --- INICIALIZACIÓN GENERAL ---
document.addEventListener('DOMContentLoaded', () => {
  // Asegurar que las funciones globales estén disponibles para los atributos HTML onclick/onchange
  window.cambiarPestana = cambiarPestana;
  window.mostrarDegradacion = mostrarDegradacion;
  window.previsualizarFoto = previsualizarFoto;
  window.calcularImpacto = calcularImpacto;
  window.buscarMisReportes = buscarMisReportes;

  // Escuchar el envío del formulario de reportes
  const form = document.getElementById('formularioReporte');
  if (form) {
    form.addEventListener('submit', guardarReporte);
  }
});

// --- PESTAÑA: NAVEGACIÓN ---
function cambiarPestana(idPestana, botonActivo) {
  // Ocultar todos los contenidos de las pestañas
  document.querySelectorAll('.tab-content').forEach(cont => cont.classList.remove('active'));
  // Desactivar todos los botones
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // Activar la pestaña y el botón seleccionados
  document.getElementById(idPestana).classList.add('active');
  botonActivo.classList.add('active');
}

// --- PESTAÑA 1: TIEMPOS DE DEGRADACIÓN ---
function mostrarDegradacion() {
  const combo = document.getElementById('comboMateriales');
  const contenedor = document.getElementById('resultadoDegradacion');
  const seleccion = combo.value;

  if (!seleccion) {
    contenedor.innerHTML = "";
    return;
  }

  const info = DATOS_DEGRADACION[seleccion];
  contenedor.innerHTML = `
    <div class="panel-alerta ${info.alerta}">
      <strong>Tiempo estimado:</strong> ${info.tiempo}<br><br>
      <strong>Impacto / Consejo:</strong> ${info.consejo}
    </div>
  `;
}

// --- PESTAÑA 2: PREVISUALIZACIÓN Y CONTROL DE REPORTES ---
let fotoBase64 = ""; // Variable temporal para guardar la imagen en texto

function previsualizarFoto() {
  const input = document.getElementById('fotoInput');
  const preview = document.getElementById('preview');
  const archivo = input.files[0];

  if (archivo) {
    const lector = new FileReader();
    lector.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      fotoBase64 = e.target.result; // Guardamos el resultado para el reporte
    };
    lector.readAsDataURL(archivo);
  } else {
    preview.style.display = 'none';
    fotoBase64 = "";
  }
}

function guardarReporte(evento) {
  evento.preventDefault();
  
  const nombre = document.getElementById('nombreAlumno').value.trim();
  const mensaje = document.getElementById('mensajeAlumno').value.trim();

  if (!nombre || !mensaje) return;

  // Estructura del nuevo reporte
  const nuevoReporte = {
    id: Date.now(),
    nombre: nombre,
    mensaje: mensaje,
    foto: fotoBase64,
    estado: "Pendiente", // Estado inicial por defecto
    fecha: new Date().toLocaleDateString()
  };

  // Obtener reportes existentes de localStorage o inicializar array [1]
  const reportesExistentes = JSON.parse(localStorage.getItem('reportesEscuela')) || [];
  reportesExistentes.push(nuevoReporte);
  
  // Guardar de vuelta en localStorage [1]
  localStorage.setItem('reportesEscuela', JSON.stringify(reportesExistentes));

  // Feedback visual e interno al usuario
  alert("¡Reporte enviado con éxito a la dirección escolar!");
  
  // Limpiar el formulario
  document.getElementById('formularioReporte').reset();
  document.getElementById('preview').style.display = 'none';
  fotoBase64 = "";
}

// --- PESTAÑA 3: CALCULADORA DE DESECHOS ---
function calcularImpacto() {
  const botellasSemanales = parseInt(document.getElementById('calcBotellas').value) || 0;
  const contenedor = document.getElementById('resultadoCalculadora');

  if (botellasSemanales <= 0) {
    contenedor.innerHTML = `
      <div class="panel-alerta verde" style="margin-top:15px;">
        🌱 ¡Felicidades! No generas desperdicio de botellas plásticas. Sigue así.
      </div>
    `;
    return;
  }

  // Cálculos de proyección
  const alAnio = botellasSemanales * 52;
  const pesoAproximadoGramos = alAnio * 22; // Una botella PET promedio pesa ~22g
  const pesoKilos = (pesoAproximadoGramos / 1000).toFixed(2);
  const tiempoDegradacionTotal = alAnio * 500; // 500 años acumulados por botella

  contenedor.innerHTML = `
    <div class="panel-alerta naranja" style="margin-top:15px;">
      ⚠️ <strong>Tu impacto anual estimado:</strong><br>
      • Desechas <strong>${alAnio}</strong> botellas de plástico al año.<br>
      • Generas aprox. <strong>${pesoKilos} kg</strong> de basura plástica pura.<br>
      • Ese lote sumará <strong>${tiempoDegradacionTotal.toLocaleString()} años</strong> acumulados de contaminación en el planeta antes de degradarse.<br><br>
      💡 <em>Prueba cambiar a un termo de acero inoxidable para reducir este impacto a cero.</em>
    </div>
  `;
}

// --- PESTAÑA 4: REVISAR ESTADO DEL REPORTE ---
function buscarMisReportes() {
  const terminoBusqueda = document.getElementById('busquedaNombre').value.trim().toLowerCase();
  const contenedorLista = document.getElementById('listaMisReportes');
  
  if (!terminoBusqueda) {
    contenedorLista.innerHTML = "<p style='font-size:14px; color:#666;'>Por favor escribe un nombre o grupo.</p>";
    return;
  }

  // Cargar registros desde localStorage [1]
  const reportesExistentes = JSON.parse(localStorage.getItem('reportesEscuela')) || [];
  
  // Filtrar si el nombre del alumno incluye el término buscado
  const reportesFiltrados = reportesExistentes.filter(rep => 
    rep.nombre.toLowerCase().includes(terminoBusqueda)
  );

  if (reportesFiltrados.length === 0) {
    contenedorLista.innerHTML = `
      <p style='font-size:14px; color:#c0392b; font-weight:bold;'>
        No se encontraron reportes asociados a "${terminoBusqueda}".
      </p>
    `;
    return;
  }

  // Renderizar los reportes encontrados
  contenedorLista.innerHTML = "";
  reportesFiltrados.forEach(rep => {
    const claseEstado = rep.estado === "Resuelto" ? "status-resuelto" : "status-pendiente";
    
    let htmlReporte = `
      <div class="status-card ${claseEstado}">
        <strong>Fecha:</strong> ${rep.fecha}<br>
        <strong>De:</strong> ${rep.nombre}<br>
        <strong>Problema:</strong> ${rep.mensaje}<br>
        <strong>Estado:</strong> <span style="font-weight:bold;">${rep.estado}</span>
    `;

    // Si guardó foto, mostrar la miniatura en el historial
    if (rep.foto) {
      htmlReporte += `<br><img src="${rep.foto}" style="max-width:80px; margin-top:8px; border-radius:4px; display:block;">`;
    }

    htmlReporte += `</div>`;
    contenedorLista.innerHTML += htmlReporte;
  });
}
