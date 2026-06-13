// Variable global para la gráfica
let miGrafica = null;

// 1. CARGA INICIAL AL ABRIR EL PANEL
document.addEventListener("DOMContentLoaded", () => {
  cargarDatosAdmin();
});

// ==========================================
// 2. FUNCIÓN PRINCIPAL: TRAER DATOS DE RENDER
// ==========================================
async function cargarDatosAdmin() {
  const tabla = document.getElementById("tablaReportesAdmin");
  if (!tabla) return;

  try {
    const respuesta = await fetch("/api/datos");
    if (!respuesta.ok) throw new Error("Error en la petición de red");
    
    const datos = await respuesta.json();
    
    // Rellenar la tabla y actualizar las métricas de las gráficas
    renderizarTabla(datos);
    actualizarGraficaMétricas(datos);

  } catch (error) {
    console.error("Error al refrescar el panel:", error);
  }
}

// ==========================================
// 3. RENDERIZAR TABLA DE REPORTES
// ==========================================
function renderizarTabla(lista) {
  const cuerpoTabla = document.getElementById("cuerpoTablaAdmin");
  if (!cuerpoTabla) return;

  if (lista.length === 0) {
    cuerpoTabla.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay reportes registrados</td></tr>`;
    return;
  }

  cuerpoTabla.innerHTML = "";
  lista.forEach(item => {
    const esResuelto = item.estado === "Resuelto";
    const textoBoton = esResuelto ? "✅ Atendido" : "⏳ Resolver";
    const claseBtn = esResuelto ? "btn-desactivado" : "btn-resolver";
    const htmlFoto = item.foto ? `<img src="${item.foto}" style="width:60px; height:60px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="abrirModalFoto('${item.foto}')">` : "No adjunta";

    cuerpoTabla.innerHTML += `
      <tr>
        <td><strong>${item.nombre || "Anónimo"}</strong></td>
        <td>${item.mensaje || ""}</td>
        <td>${htmlFoto}</td>
        <td><span class="badge ${item.estado === "Resuelto" ? "badge-verde" : "badge-naranja"}">${item.estado || "Pendiente"}</span></td>
        <td>
          <button class="${claseBtn}" ${esResuelto ? "disabled" : ""} onclick="marcarComoResuelto('${item.id}')">${textoBoton}</button>
          <button class="btn-eliminar" onclick="eliminarReporte('${item.id}')">🗑️</button>
        </td>
      </tr>
    `;
  });
}

// ==========================================
// 4. ACTUALIZAR GRÁFICAS (CHART.JS)
// ==========================================
function actualizarGraficaMétricas(lista) {
  const ctx = document.getElementById("graficaReportes");
  if (!ctx) return;

  let pendientes = 0;
  let resueltos = 0;

  lista.forEach(item => {
    if (item.estado === "Resuelto") resueltos++;
    else pendientes++;
  });

  // Si la gráfica ya existía, la destruimos para redibujarla sin parpadeos
  if (miGrafica) {
    miGrafica.destroy();
  }

  miGrafica = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Pendientes ⏳", "Resueltos ✅"],
      datasets: [{
        data: [pendientes, resueltos],
        backgroundColor: ["#E65100", "#1B5E20"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// ==========================================
// 5. ACCIONES: RESOLVER Y ELIMINAR
// ==========================================
async function marcarComoResuelto(id) {
  if (!confirm("¿Seguro que deseas marcar este punto sucio como Resuelto?")) return;
  try {
    const res = await fetch(`/api/resolver/${id}`, { method: "PUT" });
    if (res.ok) cargarDatosAdmin();
  } catch (err) { alert("Error de comunicación."); }
}

async function eliminarReporte(id) {
  if (!confirm("¿Estás completamente seguro de eliminar este reporte permanentemente?")) return;
  try {
    const res = await fetch(`/api/eliminar/${id}`, { method: "DELETE" });
    if (res.ok) cargarDatosAdmin();
  } catch (err) { alert("Error de comunicación."); }
}

// ==========================================
// 🔄 6. TEMPORIZADOR AUTOMÁTICO (10 SEGUNDOS)
// ==========================================
setInterval(() => {
  console.log("🔄 Ejecutando auto-refresco del panel administrativo...");
  cargarDatosAdmin();
}, 10000);
