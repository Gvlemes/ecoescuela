let miGrafica = null;

// 1. CARGA INICIAL AUTOMÁTICA AL ABRIR EL PANEL
document.addEventListener("DOMContentLoaded", () => {
  inicializarGraficaVacia(); // Prepara la gráfica de forma segura
  cargarDatosAdmin();        // Primera consulta de Firebase
});

// ==========================================
// 2. LEER REPORTES DESDE EL BACKEND (RENDER)
// ==========================================
async function cargarDatosAdmin() {
  try {
    const respuesta = await fetch("/api/datos");
    if (!respuesta.ok) throw new Error(`Fallo de respuesta: ${respuesta.status}`);
    
    const datos = await respuesta.json();
    
    // Inyectar las tarjetas visuales y actualizar la gráfica
    renderizarTarjetas(datos);
    actualizarGraficaMetricas(datos);

  } catch (error) {
    console.error("Error al actualizar la base de datos:", error);
    const cuerpo = document.getElementById("cuerpoTablaAdmin") || document.getElementById("listaReportesAdmin");
    if (cuerpo) {
      cuerpo.innerHTML = `<p style="text-align:center; color:red; padding: 20px;">Fallo de sincronización con el servidor.</p>`;
    }
  }
}

// ==========================================
// 3. RENDERIZAR TARJETAS EN TIEMPO REAL
// ==========================================
function renderizarTarjetas(lista) {
  // Busca el contenedor de tus reportes en el HTML
  const contenedor = document.getElementById("cuerpoTablaAdmin") || document.getElementById("listaReportesAdmin");
  if (!contenedor) return;

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = `<p style="text-align:center; color:#64748B; padding: 20px;">No se registran puntos sucios en el sistema 🌱</p>`;
    return;
  }

  let htmlContenido = "";

  lista.forEach(item => {
    const esResuelto = item.estado === "Resuelto";
    const colorBorde = esResuelto ? "#16A34A" : "#EA580C"; // Verde para resuelto, Naranja para pendiente
    const fechaTxt = item.fecha ? new Date(item.fecha).toLocaleString('es-ES') : "Reciente";
    
    // Si incluye imagen Base64, se dibuja la etiqueta de la foto
    const htmlFoto = item.foto 
      ? `<img src="${item.foto}" style="width:100%; max-width:280px; max-height:180px; object-fit:cover; border-radius:6px; margin: 10px 0; display:block; border: 1px solid #E2E8F0;" alt="Evidencia">` 
      : "";

    // Generación dinámica de cada tarjeta exactamente como tu interfaz original
    htmlContenido += `
      <div style="background: white; border-left: 6px solid ${colorBorde}; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 14px; color: #334155;">👤 <strong>Alumno / Encargado:</strong> ${item.nombre || "Anónimo"}</span>
          <span class="badge ${esResuelto ? 'badge-verde' : 'badge-naranja'}">${item.estado || "Pendiente"}</span>
        </div>
        <p style="font-size: 15px; margin: 5px 0; color: #1E293B;">📝 <strong>Reporte:</strong> ${item.mensaje || ""}</p>
        ${htmlFoto}
        <div style="font-size: 11px; color: #94A3B8; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <span>ID: ${item.id} | Fecha: ${fechaTxt}</span>
          <div style="display: flex; gap: 8px;">
            <button class="${esResuelto ? 'btn-desactivado' : 'btn-resolver'}" ${esResuelto ? 'disabled' : ''} onclick="marcarComoResuelto('${item.id}')" style="background-color: #16A34A; color: white; padding: 6px 12px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">${esResuelto ? 'Completado' : 'Marcar Resuelto 📞'}</button>
            <button class="btn-eliminar" onclick="eliminarReporte('${item.id}')" style="background-color: #EF4444; color: white; padding: 6px 12px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Eliminar 🗑️</button>
          </div>
        </div>
      </div>
    `;
  });

  contenedor.innerHTML = htmlContenido;
}

// ==========================================
// 4. INICIALIZAR Y ACTUALIZAR GRÁFICA (MÉTODO SEGURO)
// ==========================================
function inicializarGraficaVacia() {
  const ctx = document.getElementById("graficaReportes");
  if (!ctx || miGrafica !== null) return;

  miGrafica = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Pendientes ⏳", "Resueltos ✅"],
      datasets: [{
        data:, // Inicializado correctamente con valores numéricos base
        backgroundColor: ["#EA580C", "#16A34A"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function actualizarGraficaMetricas(lista) {
  if (!miGrafica) return;

  let pendientes = 0;
  let resueltos = 0;

  lista.forEach(item => {
    if (item.estado === "Resuelto") resueltos++;
    else pendientes++;
  });

  // Modifica los valores internos y actualiza la animación sin recrear el lienzo
  miGrafica.data.datasets[0].data = [pendientes, resueltos];
  miGrafica.update(); 
}

// ==========================================
// 5. ACCIONES (RESOLVER / ELIMINAR)
// ==========================================
async function marcarComoResuelto(id) {
  if (!confirm("¿Deseas marcar este punto de la escuela como Resuelto?")) return;
  try {
    const respuesta = await fetch(`/api/resolver/${id}`, { method: "PUT" });
    if (respuesta.ok) cargarDatosAdmin();
  } catch (err) { console.error(err); }
}

async function eliminarReporte(id) {
  if (!confirm("¿Seguro que deseas eliminar este reporte permanentemente?")) return;
  try {
    const respuesta = await fetch(`/api/eliminar/${id}`, { method: "DELETE" });
    if (respuesta.ok) cargarDatosAdmin();
  } catch (err) { console.error(err); }
}

// ==========================================
// 🔄 6. SINCRONIZACIÓN ULTRA RÁPIDA (CADA 2 SEGUNDOS)
// ==========================================
setInterval(() => {
  cargarDatosAdmin();
}, 2000);
