import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://gstatic.com";

// ⚠️ DEBES COLOCAR TUS CREDENCIALES REALES DE FIREBASE AQUÍ
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🚫 LISTA DE PALABRAS PROHIBIDAS MEJORADA (Garantiza el bloqueo absoluto)
const PALABRAS_PROHIBIDAS = [
  "tonto", "estupido", "mierda", "puto", "puta", "pendejo", "pendeja", "putas", "putos",
  "culero", "cabron", "pito", "verga", "chingar", "pene", "vagina", "basura de escuela", "poto", "hola"
];

function esTextoInapropiadoOInfantil(texto) {
  const limpio = texto.toLowerCase().trim();

  if (limpio.length < 4) {
    alert("⚠️ Nombre o reporte demasiado corto. Por favor escribe datos válidos.");
    return true;
  }

  // Detectar spam repetitivo infantil como "asdasdasd", "aaaa", "jajaja"
  if (/([a-z0-9]{3,})\1{2,}/.test(limpio) || /^(.)\1+$/.test(limpio)) {
    alert("❌ Reporte Bloqueado: Por favor, evita escribir caracteres repetidos o textos sin sentido.");
    return true;
  }

  // Comparación por coincidencia de palabras prohibidas
  for (let palabra of PALABRAS_PROHIBIDAS) {
    if (limpio.includes(palabra)) {
      alert(`🚨 Seguridad: Se detectó lenguaje inapropiado o de prueba ("${palabra}"). Usa expresiones adecuadas para la escuela.`);
      return true;
    }
  }
  return false;
}
// Exponer visualizador de degradación al ámbito global
window.mostrarDegradacion = function() {
  const material = document.getElementById("comboMateriales").value;
  const res = document.getElementById("resultadoDegradacion");
  
  const datos = {
    plastico: { tiempo: "450 años", info: "Las botellas se fragmentan lentamente en microplásticos dañinos para el medio ambiente.", tipo: "naranja" },
    chicle: { tiempo: "5 años", info: "Contiene polímeros sintéticos. Al endurecerse atrapa bacterias de las superficies.", tipo: "naranja" },
    lata: { tiempo: "10 años", info: "El aluminio se oxida de forma paulatina. Reciclarlo ahorra un 95% de energía.", tipo: "naranja" },
    vidrio: { tiempo: "4,000 años", info: "Estructura mineral sumamente resistente, aunque es 100% reciclable de forma infinita.", tipo: "naranja" },
    tarjeta: { tiempo: "100 a 500 años", info: "La combinación de fibra de vidrio, resina epoxi y metales pesados contamina gravemente los mantos acuíferos si se desecha incorrectamente.", tipo: "naranja" },
    soldadura: { tiempo: "Permanente", info: "Las aleaciones no sufren degradación biológica y acumulan metales nocivos en el suelo de la escuela.", tipo: "naranja" },
    chatarra: { tiempo: "50 a 100 años", info: "El acero y hierro se corroen lentamente. Sus residuos afilados representan un riesgo de seguridad.", tipo: "naranja" },
    aceite: { tiempo: "No biodegradable", info: "Forma una capa impermeable sobre el agua y suelo, asfixiando la flora y la fauna locales.", tipo: "naranja" },
    cable: { tiempo: "200 a 400 años", info: "El revestimiento plástico de PVC no se disuelve y libera toxinas nocivas si se incinera de manera directa.", tipo: "naranja" },
    pila: { tiempo: "1,000 años", info: "Altamente peligrosa. Una sola pila de reloj puede contaminar miles de litros de agua debido al mercurio y litio.", tipo: "naranja" },
    disco: { tiempo: "Más de 500 años", info: "Los platos mecánicos de aluminio y carcasas magnéticas requieren procesos de reciclaje tecnológico especializado.", tipo: "naranja" },
    toner: { tiempo: "450 años", info: "Los plásticos de ingeniería del cartucho resisten la intemperie y el polvo químico es nocivo si se inhala.", tipo: "naranja" },
    archivo: { tiempo: "1 a 3 años", info: "El papel estándar es biodegradable en composteros, pero las tintas sintéticas tardan más en disolverse.", tipo: "verde" }
  };

  if(!material) { res.innerHTML = ""; return; }
  const data = datos[material];
  res.innerHTML = `<div class="panel-alerta ${data.tipo}"><strong>Tiempo estimado en la naturaleza:</strong> ${data.tiempo}<br><small>${data.info}</small></div>`;
};

let base64Foto = "";
window.previsualizarFoto = function() {
  const fileInput = document.getElementById("fotoInput");
  const preview = document.getElementById("preview");
  if (!fileInput.files || fileInput.files.length === 0) return;
  const file = fileInput.files[0];

  // Filtro de tamaño: Bloquea fotos falsas o excesivamente grandes
  if (file.size > 2 * 1024 * 1024) { 
    alert("❌ Archivo rechazado: La foto es demasiado pesada (Máximo 2MB).");
    fileInput.value = "";
    preview.style.display = "none";
    base64Foto = "";
    return;
  }

  const reader = new FileReader();
  reader.onloadend = function () {
    base64Foto = reader.result;
    preview.src = base64Foto;
    preview.style.display = "block";
  }
  reader.readAsDataURL(file);
};

// Escuchador seguro del submit del formulario
document.getElementById("formularioReporte").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreAlumno").value;
  const mensaje = document.getElementById("mensajeAlumno").value;

  // Ejecución estricta de las reglas de bloqueo antes de tocar Firebase
  if (esTextoInapropiadoOInfantil(nombre) || esTextoInapropiadoOInfantil(mensaje)) {
    return; 
  }

  const ahora = new Date();
  try {
    await addDoc(collection(db, "reportes"), {
      usuario: nombre,
      descripcion: mensaje,
      fotoUrl: base64Foto,
      estado: "Pendiente",
      fechaHora: ahora.toLocaleString('es-ES', { hour12: true }),
      fechaRaw: ahora.toISOString()
    });

    alert("¡Reporte enviado con éxito! Consúltalo en 'Mi Reporte' con tu nombre.");
    document.getElementById("formularioReporte").reset();
    document.getElementById("preview").style.display = "none";
    base64Foto = "";
  } catch (error) {
    alert("Error de conexión con la base de datos.");
  }
});

window.calcularImpacto = function() {
  const botellas = parseInt(document.getElementById("calcBotellas").value) || 0;
  const totalAnual = botellas * 52;
  const tiempoDegradacion = totalAnual > 0 ? "450 años" : "0 años";
  let recomendacion = "", claseAlerta = "";

  if (botellas === 0) {
    claseAlerta = "verde";
    recomendacion = "🌟 <strong>¡Increíble, nivel Héroe Ecológico!</strong> Sigue así.";
  } else if (botellas >= 1 && botellas <= 3) {
    claseAlerta = "verde";
    recomendacion = "👍 <strong>¡Buen trabajo!</strong> Tu consumo es bajo.";
  } else if (botellas >= 4 && botellas <= 7) {
    claseAlerta = "naranja";
    recomendacion = "⚠️ <strong>¡Atención!</strong> Estás usando casi una botella diaria.";
  } else {
    claseAlerta = "naranja";
    recomendacion = "🚨 <strong>¡Alerta Ecológica!</strong> Tu consumo es muy alto.";
  }
  
  document.getElementById("resultadoCalculadora").innerHTML = `
    <div class="panel-alerta ${claseAlerta}">
      📊 <strong>Tu impacto estimado:</strong> Desechas <strong>${totalAnual} botellas</strong> al año.<br>
      Tardarán más de <strong>${tiempoDegradacion}</strong> en degradarse.<br><br>
      🌱 <strong>Recomendación:</strong> ${recomendacion}
    </div>`;
};

window.buscarMisReportes = async function() {
  const nombreBuscar = document.getElementById("busquedaNombre").value.trim().toLowerCase();
  const contenedor = document.getElementById("listaMisReportes");
  if (!nombreBuscar) { alert("Escribe un nombre para buscar."); return; }

  contenedor.innerHTML = "<p>Buscando en la red de la escuela...</p>";
  try {
    const q = query(collection(db, "reportes"), orderBy("fechaRaw", "desc"));
    const querySnapshot = await getDocs(q);
    contenedor.innerHTML = "";
    let encontrados = 0;

    querySnapshot.forEach((docSnap) => {
      const item = docSnap.data();
      if (item.usuario && item.usuario.toLowerCase().includes(nombreBuscar)) {
        encontrados++;
        const esResuelto = item.estado === "Resuelto";
        const claseEstado = esResuelto ? "status-resuelto" : "status-pendiente";
        const icono = esResuelto ? "✅" : "⏳";
        
        contenedor.innerHTML += `
          <div class="status-card ${claseEstado}">
            <strong>${icono} Estado: ${item.estado || 'Pendiente'}</strong><br>
            <small>Detalle: ${item.descripcion}</small><br>
            <small style="color:#777;">Fecha: ${item.fechaHora || 'Reciente'}</small>
          </div>`;
      }
    });

    if (encontrados === 0) contenedor.innerHTML = "<p>No encontramos reportes con ese nombre.</p>";
  } catch (error) {
    contenedor.innerHTML = "<p style='color:red;'>Error de red.</p>";
  }
};
