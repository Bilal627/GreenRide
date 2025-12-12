const form = document.getElementById("altaVehiculosForm");

const concesionarioSelect = document.getElementById("concesionario");
const matriculaInput = document.getElementById("matricula");
const marcaInput = document.getElementById("marca");
const modeloInput = document.getElementById("modelo");
const anioInput = document.getElementById("ano_matriculacion");
const plazasInput = document.getElementById("numero_plazas");
const autonomiaInput = document.getElementById("autonomia_km");
const colorInput = document.getElementById("color");
const imagenInput = document.getElementById("imagen");
const estadoInput = document.getElementById("estado");

async function cargarConcesionarios() {
    try {
        const response = await fetch("/api/concesionarios");
        if (!response.ok) throw new Error("Error al obtener concesionarios");

        const concesionarios = await response.json();
        concesionarioSelect.innerHTML = '<option value="">Selecciona un concesionario</option>';
        concesionarios.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id_concesionario;
            option.textContent = `${c.id_concesionario} - ${c.nombre}`;
            concesionarioSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando concesionarios:", error);
        alert("No se pudieron cargar los concesionarios");
    }
}

document.addEventListener("DOMContentLoaded", cargarConcesionarios);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
    }

    const anio = parseInt(anioInput.value);
    const plazas = parseInt(plazasInput.value);
    const autonomia = parseInt(autonomiaInput.value);
    const idConcesionario = parseInt(concesionarioSelect.value);

    if (isNaN(anio) || isNaN(plazas) || isNaN(autonomia) || isNaN(idConcesionario)) {
        alert("Complete correctamente todos los campos numéricos");
        return;
    }

    const data = {
        matricula: matriculaInput.value,
        marca: marcaInput.value,
        modelo: modeloInput.value,
        ano_matriculacion: anio,
        numero_plazas: plazas,
        autonomia_km: autonomia,
        color: colorInput.value,
        imagen: imagenInput.value,
        estado: estadoInput.value,
        id_concesionario: idConcesionario
    };

    try {
        const response = await fetch("/altaVehiculos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        console.log("Respuesta del servidor:", response.status, text);

        if (response.ok) {
            alert("Vehículo creado correctamente. Redirigiendo...");
            window.location.href = "/adminIni";
        } else {
            alert("Error al crear vehículo: " + text);
        }
    } catch (error) {
        alert("Error al conectar con el servidor");
        console.error("Error:", error);
    }
});