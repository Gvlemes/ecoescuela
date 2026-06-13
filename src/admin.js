let miGrafica = null;

// Movemos los segundos aquí para que sean accesibles de forma global
let segundosRestantes = 10;

// 1. CARGA INICIAL AUTOMÁTICA (Espera a que el HTML esté 100% dibujado)
document.addEventListener("DOMContentLoaded", () => {
  cargarDatosAdmin();
  iniciarRelojContador(); // Inicia el reloj de forma segura
});

async function cargarDatosAdmin() {
  try {
    const respuesta = await fetch("/api/datos");
    if (!respuesta.ok) throw new Error(`Fallo de respuesta: ${respuesta.status}`);
    
    const datos = await respuesta.json();
    
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

function actualizarGraficaMetricas(lista) {
  const ctx = document.getElementById("graficaReportes");
  if (!ctx) return;

  let pendientes = 0;
  let resueltos = 0;

  lista.forEach(item => {
    if (item.estado === "Resuelto") resueltos++;
    else pendientes++;
  });

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

async function eliminarReporte(id) {
  if (!confirm("¿Estás seguro de eliminar este reporte permanentemente?")) return;
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
// 🔄 7. CONTROLADOR SEGURO DE CONTEO Y REFRESCO
// ==========================================
function iniciarRelojContador() {
  // Capturamos los elementos estrictamente AQUÍ, cuando el DOM already cargó
  const textoContador = document.getElementById("texto-contador");
  const circuloPulso = document.getElementById("circulo-pulso");
  const contenedorIndicador = document.getElementById("indicador-actualizacion");

  if (textoContador) {
    textoContador.innerHTML = `Actualizando en ${segundosRestantes}s...`;
  }

  setInterval(() => {
    segundosRestantes--;

    if (textoContador) {
      textoContador.innerHTML = `Actualizando en ${segundosRestantes}s...`;
    }

    if (segundosRestantes <= 0) {
      segundosRestantes = 10; // Reinicio automático

      if (textoContador) textoContador.innerHTML = "🔄 Sincronizando red...";
      if (circuloPulso) circuloPulso.style.backgroundColor = "#EA580C";
      if (contenedorIndicador) {
        contenedorIndicador.style.background = "#FFF3E0";
        contenedorIndicador.style.color = "#E65100";
      }

      // Consigue los datos de Render de fondo
      cargarDatosAdmin().then(() => {
        setTimeout(() => {
          if (circuloPulso) circuloPulso.style.backgroundColor = "#1B5E20";
          if (contenedorIndicador) {
            contenedorIndicador.style.background = "#E8F5E9";
            contenedorIndicador.style.color = "#1B5E20";
          }
        }, 800);
      });
    }
  }, 1000);
}
