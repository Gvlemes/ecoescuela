let miGrafica = null;
// 🔥 Inicializar la conexión en tiempo real con el servidor
const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  inicializarGraficaVacia(); 
  cargarDatosAdmin();        
});

// 🔥 ESCUCHAR CAMBIOS EN TIEMPO REAL
socket.on("nuevo-reporte", () => {
  console.log("⚡ ¡Base de datos actualizada! Recargando interfaz...");
  cargarDatosAdmin();
});

async function cargarDatosAdmin() {
  try {
    const respuesta = await fetch("/api/datos");
    if (!respuesta.ok) throw new Error("Error de red");
    const datos = await respuesta.json();
    renderizarTarjetas(datos);
    actualizarGraficaMetricas(datos);
  } catch (error) {
    console.error(error);
  }
}

function renderizarTarjetas(lista) {
  const contenedor = document.getElementById("cuerpoTablaAdmin") || document.getElementById("listaReportesAdmin");
  if (!contenedor) return;

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = `<p style="text-align:center; padding: 20px;">No hay reportes 🌱</p>`;
    return;
  }

  let htmlContenido = "";
  lista.forEach(item => {
    const esResuelto = item.estado === "Resuelto";
    const colorBorde = esResuelto ? "#16A34A" : "#EA580C"; 
    const fechaTxt = item.fecha ? new Date(item.fecha).toLocaleString('es-ES') : "Reciente";
    const htmlFoto = item.foto ? `<img src="${item.foto}" style="width:100%; max-width:280px; max-height:180px; object-fit:cover; border-radius:6px; margin: 10px 0; display:block;" alt="Evidencia">` : "";

    htmlContenido += `
      <div style="background: white; border-left: 6px solid ${colorBorde}; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span>👤 <strong>Alumno:</strong> ${item.nombre || "Anónimo"}</span>
          <span class="badge ${esResuelto ? 'badge-verde' : 'badge-naranja'}">${item.estado || "Pendiente"}</span>
        </div>
        <p>📝 <strong>Reporte:</strong> ${item.mensaje || ""}</p>
        ${htmlFoto}
        <div style="font-size: 11px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span>ID: ${item.id} | ${fechaTxt}</span>
          <div style="display: flex; gap: 8px;">
            <button ${esResuelto ? 'disabled' : ''} onclick="marcarComoResuelto('${item.id}')" style="background-color: #16A34A; color: white; padding: 6px 12px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">${esResuelto ? 'Completado' : 'Resolver'}</button>
            <button onclick="eliminarReporte('${item.id}')" style="background-color: #EF4444; color: white; padding: 6px 12px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Eliminar</button>
          </div>
        </div>
      </div>
    `;
  });
  contenedor.innerHTML = htmlContenido;
}

function inicializarGraficaVacia() {
  const ctx = document.getElementById("graficaReportes");
  if (!ctx || miGrafica !== null) return;
  miGrafica = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Pendientes ⏳", "Resueltos ✅"],
      datasets: [{ data:, backgroundColor: ["#EA580C", "#16A34A"], borderWidth: 1 }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function actualizarGraficaMetricas(lista) {
  if (!miGrafica) return;
  let p = 0, r = 0;
  lista.forEach(i => { if (i.estado === "Resuelto") r++; else p++; });
  miGrafica.data.datasets[0].data = [p, r];
  miGrafica.update(); 
}

async function marcarComoResuelto(id) {
  try { await fetch(`/api/resolver/${id}`, { method: "PUT" }); } catch (err) {}
}

async function eliminarReporte(id) {
  if (!confirm("¿Eliminar reporte permanentemente?")) return;
  try { await fetch(`/api/eliminar/${id}`, { method: "DELETE" }); } catch (err) {}
}
