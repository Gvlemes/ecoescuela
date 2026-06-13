let miGrafica = null;

// 1. CARGA INICIAL AUTOMÁTICA
document.addEventListener("DOMContentLoaded", () => {
  cargarDatosAdmin();
});

// ==========================================
// 2. LEER REPORTES DESDE EL BACKEND (RENDER)
// ==========================================
async function cargarDatosAdmin() {
  try {
    const respuesta = await fetch("/api/datos");
    if (!respuesta.ok) throw new Error(`Fallo de respuesta: ${respuesta.status}`);
    
    const datos = await respuesta.json();
    
    // Inyectar la información en la tabla y en la gráfica
    renderizarTabla(datos);
    actualizarGraficaMetricas(datos);

  } catch (error) {
    console.error("Error al actualizar la base de datos:", error);
    const cuerpo = document.getElementById("cuerpoTablaAdmin");
    if (cuerpo) {
      cuerpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Fallo de sincronización con Render.</td></tr>`;
    }
  }
}

// ==========================================
// 3. RENDERIZAR TABLA HTML DE REPORTES
// ==========================================
function renderizarTabla(lista) {
  const cuerpoTabla = document.getElementById("cuerpoTablaAdmin");
  if (!cuerpoTabla) return;

  if (!lista || lista.length === 0) {
    cuerpoTabla.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748B;">No se registran puntos sucios en el sistema 🌱</td></tr>`;
    return;
  }

  cuerpoTabla.innerHTML = "";
  lista.forEach(item => {
    const esResuelto = item.estado === "Resuelto";
    const textoBoton = esResuelto ? "✅ Atendido" : "⏳ Resolver";
    const claseBtn = esResuelto ? "btn-desactivado" : "btn-resolver";
    
    // Condicional para pintar la imagen si viene cargada en Base64
    const htmlFoto = item.foto 
      ? `<img src="${item.foto}" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border: 1px solid #CBD5E1;" alt="Evidencia">` 
      : `<span style="color:#94A3B8; font-size:11px;">Sin evidencia</span>`;

    cuerpoTabla.innerHTML += `
      <tr>
        <td><strong>${item.nombre || "Anónimo"}</strong></td>
        <td>${item.mensaje || ""}</td>
        <td>${htmlFoto}</td>
        <td><span class="badge ${esResuelto ? 'badge-verde' : 'badge-naranja'}">${item.estado || "Pendiente"}</span></td>
        <td>
          <button class="${claseBtn}" ${esResuelto ? "disabled" : ""} onclick="marcarComoResuelto('${item.id}')">${textoBoton}</button>
          <button class="btn-eliminar" onclick="eliminarReporte('${item.id}')">🗑️</button>
        </td>
      </tr>
    `;
  });
}

// ==========================================
// 4. CONTROLADOR DE LA GRÁFICA CIRCULAR
// ==========================================
function actualizarGraficaMetricas(lista) {
  const ctx = document.getElementById("graficaReportes");
  if (!ctx) return;

  let pendientes = 0;
  let resueltos = 0;

  lista.forEach(item => {
    if (item.estado === "Resuelto") resueltos++;
    else pendientes++;
  });

  // Rompemos la instancia previa para refrescar los datos de la gráfica limpiamente
  if (miGrafica) {
    miGrafica.destroy();
  }

  miGrafica = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Pendientes ⏳", "Resueltos ✅"],
      datasets: [{
        data: [pendientes, resueltos],
        backgroundColor: ["#EA580C", "#16A34A"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// ==========================================
// 5. ACCIÓN: MARCAR REPORTES COMO ATENDIDOS
// ==========================================
async function marcarComoResuelto(id) {
  if (!confirm("¿Deseas marcar este punto de la escuela como Resuelto?")) return;
  try {
    const respuesta = await fetch(`/api/resolver/${id}`, { method: "PUT" });
    if (respuesta.ok) {
      cargarDatosAdmin();
    } else {
      alert("No se pudo actualizar el estado.");
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 6. ACCIÓN: ELIMINAR REPORTES EN FIRESTORE
// ==========================================
async function eliminarReporte(id) {
  if (!confirm("¿Seguro que deseas eliminar este reporte permanentemente de la base de datos?")) return;
  try {
    const respuesta = await fetch(`/api/eliminar/${id}`, { method: "DELETE" });
    if (respuesta.ok) {
      cargarDatosAdmin();
    } else {
      alert("No se pudo eliminar el registro.");
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 🔄 7. ACTUALIZACIÓN AUTOMÁTICA EN TIEMPO REAL (CADA 3 SEGUNDOS)
// ==========================================
setInterval(() => {
  if (typeof cargarDatosAdmin === "function") {
    cargarDatosAdmin();
  }
}, 3000);
