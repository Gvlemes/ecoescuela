// 1. CONTROL DE PESTAÑAS (INTERFACES)
function cambiarPestana(pestanaId, boton) {
    document.querySelectorAll('.tab-content').forEach(cont => cont.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const contenedorDestino = document.getElementById(pestanaId);
    if (contenedorDestino) {
        contenedorDestino.classList.add('active');
        boton.classList.add('active');
    }
}

// 2. SELECTOR DE DEGRADACIÓN POR CARRERAS
function mostrarDegradacion() {
    const material = document.getElementById("comboMateriales").value;
    const caja = document.getElementById("cajaResultadoDegradacion");

    if (!caja) return;

    const respuestas = {
        chicle: "El chicle tarda 5 años en degradarse. Al tirarlo al suelo daña los patios escolares y afecta a las aves.",
        pet: "Las botellas plásticas tardan de 100 a 1,000 años. Evita el plástico de un solo uso en la cafetería.",
        aluminio: "Las latas de refresco tardan de 10 a 100 años. Son 100% reciclables de forma infinita.",
        bolsa: "Las bolsas plásticas tardan alrededor de 150 años en fragmentarse en microplásticos nocivos.",
        carton: "El papel y cartón toman de 2 a 5 meses. Deposítalos limpios en los contenedores de reciclaje.",
        unicel: "El unicel NO se degrada nunca químicamente; solo se divide en pedazos más pequeños de por vida.",
        organico: "Los residuos orgánicos tardan de 1 a 6 meses. ¡Ideales para una sección de compostaje escolar!",
        cables: "El recubrimiento de PVC de los cables tarda de 30 a 40 años en degradarse.",
        metales_taller: "Las rebabas y piezas metálicas de desecho tardan un siglo en corroerse en el taller.",
        baterias: "Las pilas tardan más de 500 años y liberan mercurio y litio altamente contaminantes.",
        papel_bond: "El papel de reportes tarda unos meses. Los administradores deben fomentar la entrega digital.",
        carton_archivo: "El cartón de las cajas de archivo tarda cerca de 1 año. Reutilízalas para almacenamiento interno.",
        boligrafo: "Un bolígrafo común tarda 100 años en desaparecer debido a sus plásticos densos.",
        carcasa: "Los plásticos ABS de computadoras obsoletas tardan 150 años. Se debe priorizar la reparación.",
        teclado: "Las teclas resisten hasta 400 años sin degradarse debido a los polímeros empleados.",
        toner: "Un cartucho de tóner tarda 450 años y sus componentes químicos afectan la calidad del aire.",
        cd: "Los discos ópticos antiguos toman 100 años en desaparecer. Es mejor migrar tus respaldos a la nube.",
        usb: "Los componentes plásticos y las resinas de una memoria USB dañada tardan 300 años en degradarse.",
        pallets: "La madera industrial de las tarimas tarda de 1 a 3 años si no está tratada químicamente.",
        flejes: "Los flejes plásticos de embalaje de carga industrial tardan hasta 300 años en fragmentarse.",
        neumaticos: "El caucho vulcanizado de montacargas toma 600 años. Su acumulación es un riesgo de incendio."
    };

    if (respuestas[material]) {
        caja.innerHTML = `<div style="margin-top:15px; padding:15px; background-color:#fff3e0; border-left:6px solid #ff9800; color:#e65100; border-radius:6px;"><strong>Impacto de Degradación:</strong><br>${respuestas[material]}</div>`;
    } else {
        caja.innerHTML = "<p style='color: #666; font-style: italic;'>Por favor, selecciona una opción para auditar su impacto.</p>";
    }
}

// 3. REPORTAR CON IMAGEN (BASE64)
let base64Foto = "";

function previsualizarFoto() {
    const input = document.getElementById("fotoInput");
    const preview = document.getElementById("preview");
    
    if (!input || !input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onloadend = function () {
        base64Foto = reader.result;
        if (preview) {
            preview.src = base64Foto;
            preview.style.display = "block";
        }
    }
    reader.readAsDataURL(file);
}

// 4. ENVÍO DEL FORMULARIO CON FETCH
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formularioReporte");
    if (formulario) {
        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById("nombreAlumno").value;
            const mensaje = document.getElementById("mensajeAlumno").value;
            
            try {
                const respuesta = await fetch("/api/guardar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, mensaje, foto: base64Foto, estado: "Pendiente" })
                });
                
                if (!respuesta.ok) {
                    throw new Error(`Ruta inválida o servidor caído: ${respuesta.status}`);
                }
                
                alert("¡Reporte enviado con éxito!");
                formulario.reset();
                const preview = document.getElementById("preview");
                if (preview) preview.style.display = "none";
                base64Foto = "";
                
            } catch (error) {
                console.error("Error al mandar el reporte:", error);
                alert("Hubo un error al procesar el envío.");
            }
        });
    }
});
