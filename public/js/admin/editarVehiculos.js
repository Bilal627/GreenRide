const form = document.getElementById("editarVehiculosForm");

const vehiculoSelect = document.getElementById("vehiculo");
const matriculaInput = document.getElementById("matricula");
const marcaInput = document.getElementById("marca");
const modeloInput = document.getElementById("modelo");
const anioInput = document.getElementById("ano_matriculacion"); // coincide con HTML
const plazasInput = document.getElementById("numero_plazas");
const autonomiaInput = document.getElementById("autonomia_km");
const colorInput = document.getElementById("color");
const imagenInput = document.getElementById("imagen");
const estadoSelect = document.getElementById("estado");
const concesionarioSelect = document.getElementById("concesionario");
const editar = document.getElementById("editar");

let concesionarios = [];
let vehiculos = [];

async function cargarConcesionarios() {
    try {
        const response = await fetch("/api/concesionarios");
        if (!response.ok) throw new Error("Error al obtener concesionarios");

        concesionarios = await response.json();
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

async function cargarVehiculos() {
    try {
        const response = await fetch("/api/vehiculosTODO");
        if (!response.ok) throw new Error("Error al obtener vehículos");

        vehiculos = await response.json();
        vehiculoSelect.innerHTML = '<option value="">Selecciona un vehículo</option>';
        vehiculos.forEach(v => {
            const option = document.createElement("option");
            option.value = v.id_vehiculo;
            option.textContent = `${v.id_vehiculo} - ${v.matricula}`;
            vehiculoSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando vehículos:", error);
        alert("No se pudieron cargar los vehículos");
    }
}

document.addEventListener("DOMContentLoaded", cargarConcesionarios);
document.addEventListener("DOMContentLoaded", cargarVehiculos);

vehiculoSelect.addEventListener("change", () => {
    const id = parseInt(vehiculoSelect.value);
    const inputs = [matriculaInput, marcaInput, modeloInput, anioInput, plazasInput, autonomiaInput, colorInput, imagenInput, estadoSelect, concesionarioSelect];

    if (!id) {
        inputs.forEach(input => {
            if (input) { 
                input.disabled = true;
                input.value = "";
            }
        });
        editar.disabled=true;
        return;
    } else {
        inputs.forEach(input => { if (input) input.disabled = false; });

        const seleccionado = vehiculos.find(v => v.id_vehiculo === id);
        if (seleccionado) {
            matriculaInput.value = seleccionado.matricula || "";
            marcaInput.value = seleccionado.marca || "";
            modeloInput.value = seleccionado.modelo || "";
            anioInput.value = seleccionado.ano_matriculacion || "";
            plazasInput.value = seleccionado.numero_plazas || "";
            autonomiaInput.value = seleccionado.autonomia_km || "";
            colorInput.value = seleccionado.color || "";
            imagenInput.value = seleccionado.imagen || "";
            estadoSelect.value = seleccionado.estado || "";
            concesionarioSelect.value = seleccionado.id_concesionario || "";
        }
        editar.disabled = false;
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const data = {
        id_vehiculo: parseInt(vehiculoSelect.value),
        matricula: matriculaInput.value,
        marca: marcaInput.value,
        modelo: modeloInput.value,
        ano_matriculacion: parseInt(anioInput.value),
        numero_plazas: parseInt(plazasInput.value),
        autonomia_km: parseInt(autonomiaInput.value), 
        color: colorInput.value,
        imagen: imagenInput.value,
        estado: estadoSelect.value,
        id_concesionario: parseInt(concesionarioSelect.value) 
    };

    try {
        const response = await fetch("/editarVehiculos", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        if (response.ok) {
            alert("Vehículo editado correctamente. Redirigiendo...");
            window.location.href = "/adminIni";
        } else {
            alert("Error al editar vehículo: " + text);
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("Error al editar el vehículo");
    }
});
