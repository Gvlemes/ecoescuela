// ==========================================
// IMPORTACIÓN DE MÓDULOS DE FIREBASE
// ==========================================
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy 
} from "https://gstatic.com";

// Asegurar el registro global de las funciones nativas para tus botones HTML (onclick / onchange)
document.addEventListener('DOMContentLoaded', () => {
  window.cambiarPestana = cambiarPestana;
  window.mostrarDegradacion = mostrarDegradacion;
  window.previsualizarFoto = previsualizarFoto;
  window.calcularImpacto = calcularImpacto;
  window.buscarMisReportes = buscarMisReportes;
});

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
// 2. CONCIENTIZACIÓN DE DEGRADACIÓN (COMPLETO)
// ==========================================
function mostrarDegradacion() {
  const material = document.getElementById("comboMateriales").value;
  const res = document.getElementById("resultadoDegradacion");
  
  const datos = {
    // 📋 Componentes Básicos / Comunes
    plastico: { tiempo: "450 años", info: "Las botellas se fragmentan en microplásticos dañinos para el suelo.", tipo: "naranja" },
    chicle: { tiempo: "5 años", info: "Contiene resinas sintéticas que los pájaros confunden con comida.", tipo: "naranja" },
    lata: { tiempo: "10 años", info: "El aluminio se oxida lentamente, requiere mucha energía reciclarlo.", tipo: "naranja" },
    vidrio: { tiempo: "4,000 años", info: "Es 100% reciclable de forma infinita, pero tarda milenios en la naturaleza.", tipo: "naranja" },
    papel: { tiempo: "1 año", info: "Se degrada rápido si hay humedad, pero evitemos desperdiciarlo.", tipo: "verde" },

    // ⚙️ Mecatrónica
    tarjeta: { tiempo: "Más de 1,000 años", info: "Las PCBs contienen fibra de vidrio y resinas que deben ir a reciclaje electrónico.", tipo: "naranja" },
    soldadura: { tiempo: "Indefinido", info: "Contiene metales pesados que pueden contaminar el agua subterránea si se tiran al suelo.", tipo: "naranja" },

    // 🏭 Producción Industrial
    chatarra: { tiempo: "50 a 100 años", info: "Las virutas de metal se oxidan lentamente. Reutilízalas en proyectos de fundición.", tipo: "naranja" },
    aceite: { tiempo: "Altamente persistente", info: "¡Un solo litro de aceite industrial contamina un millón de litros de agua!", tipo: "naranja" },

    // 💻 Soporte y Mantenimiento
    cable: { tiempo: "100 a 400 años", info: "El aislamiento de PVC libera toxinas si se quema. Separa el cobre de forma segura.", tipo: "naranja" },
    pila: { tiempo: "500 a 1,000 años", info: "Las pilas de botón contienen mercurio o litio altamente tóxicos. Usa contenedores especiales.", tipo: "naranja" },

    // 💾 Programación
    disco: { tiempo: "Varios siglos", info: "Los platos magnéticos y carcasas de aluminio pueden ser reciclados por separado.", tipo: "naranja" },

    // 💼 Procesos de Gestión Administrativa
    toner: { tiempo: "450 años", info: "El polvo de tóner es un peligro respiratorio y su carcasa plástica dura siglos.", tipo: "naranja" },
    archivo: { tiempo: "2 a 5 años", info: "El papel químico de copia no es fácilmente reciclable como el papel normal debido a sus tintas.", tipo: "naranja" }
  };

  if(!material) { res.innerHTML = ""; return; }
  const data = datos[material];
  
  // Se corrigió "data.type" de tu código original a "data.tipo" para que lea correctamente la propiedad del objeto
  res.innerHTML = `<div class="panel-alerta ${data.tipo}"><strong>Tiempo de degradación:</strong> ${data.tiempo}<br><small>${data.info}</small></div>`;
}

// ==========================================
// 3. REPORTAR CON IMAGEN (FIREBASE CLOUD)
// ==========================================
let base64Foto = "";
function previsualizarFoto() {
  const file = document.getElementById("fotoInput").files[0];
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
  const nombre = document.getElementById("nombreAlumno").value.trim();
  const mensaje = document.getElementById("mensajeAlumno").value.trim();

  if (!nombre || !mensaje) return;

  try {
    // Estructura adaptada para enviar el reporte de forma remota
    const nuevoReporte = {
      nombre: nombre,
      mensaje: mensaje,
      foto: base64Foto,
      estado: "Pendiente",
      fecha: new Date().toISOString(), // Formato ISO para procesar filtros estables por fecha
      timestamp: Date.now()            // Indexador numérico exacto para ordenar
    };

    // Guardado directo en la nube en tu colección de Firebase
    await addDoc(collection(window.dbCloud, "reportesEscuela"), nuevoReporte);

    alert("¡Reporte enviado con éxito! Puedes consultar su estado en la sección 'Mi Reporte' usando tu nombre.");
    
    // Limpieza de campos en pantalla
    document.getElementById("formularioReporte").reset();
    document.getElementById("preview").style.display = "none";
    base64Foto = "";

  } catch (error) {
    console.error("Error al guardar reporte en Firebase: ", error);
    alert("Error de conexión al enviar el reporte al administrador.");
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

  // Tu lógica dinámica original basada en la cantidad ingresada
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
// 5. CONSULTAR ESTADO DE MIS REPORTES (FIREBASE CLOUD)
// ==========================================
async function buscarMisReportes() {
  const nombreBuscar = document.getElementById("busquedaNombre").value.trim().toLowerCase();
  const contenedor = document.getElementById("listaMisReportes");
  if (!nombreBuscar) { alert("Escribe un nombre para buscar."); return; }

  contenedor.innerHTML = "Buscando...";

  try {
    // Traer registros desde la nube ordenados por la marca de tiempo más reciente
    const q = query(collection(window.dbCloud, "reportesEscuela"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    let datos = [];
    querySnapshot.forEach((doc) => {
      datos.push(doc.data());
    });

    const filtrados = datos.filter(item => item.nombre.toLowerCase().includes(nombreBuscar));

    contenedor.innerHTML = "";
    if (filtrados.length === 0) {
      contenedor.innerHTML = "<p>No encontramos reportes con ese nombre.</p>";
      return;
    }

    filtrados.forEach(item => {
      const claseEstado = item.estado === "Resuelto" ? "status-resuelto" : "status-pendiente";
      const icono = item.estado === "Resuelto" ? "✅" : "⏳";
      
      let htmlCard = `
        <div class="status-card ${claseEstado}">
          <strong>${icono} Estado: ${item.estado}</strong><br>
          <small>Detalle: ${item.mensaje}</small><br>
          <small style="color:#777;">Fecha: ${new Date(item.fecha).toLocaleDateString()}</small>
      `;

      // Si el reporte en la nube tiene una imagen adjunta, la renderiza en miniatura para el alumno
      if (item.foto) {
        htmlCard += `<br><img src="${item.foto}" style="max-width:80px; margin-top:8px; border-radius:4px; display:block;">`;
      }

      htmlCard += `</div>`;
      contenedor.innerHTML += htmlCard;
    });

  } catch (error) {
    console.error("Error al consultar Firebase: ", error);
    contenedor.innerHTML = "<p style='color:red;'>Error al conectar con la base de datos central de la escuela.</p>";
  }
}
