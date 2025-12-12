const vehiculoSelect = document.getElementById("vehiculo");
const form = document.getElementById("bajaVehiculosForm");

let vehiculos = [];

async function cargarVehiculos() {
    try {
        const response = await fetch("/api/vehiculosTODO");
        if (!response.ok) throw new Error("Error al obtener vehículos");

        vehiculos = await response.json();
        vehiculoSelect.innerHTML = '<option value="">Selecciona un vehículo</option>';
        vehiculos.forEach(v => {
            const option = document.createElement("option");
            option.value = v.id_vehiculo;
            option.textContent = `${v.id_vehiculo} - ${v.matricula} (${v.estado})`;
            vehiculoSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando vehículos:", error);
        alert("No se pudieron cargar los vehículos");
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const idVehiculo = parseInt(vehiculoSelect.value);
    if (!idVehiculo) {
        alert("Selecciona un vehículo");
        return;
    }

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
    }

    try {
        const response = await fetch("/bajaVehiculos", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: idVehiculo })
        });

        const text = await response.text();

        if (response.ok) {
            alert("Vehículo dado de baja correctamente");
            window.location.href = "/adminIni";
        } else {
            alert("Error al dar de baja: " + text);
        }

    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("Error al dar de baja el vehículo");
    }
});

document.addEventListener("DOMContentLoaded", cargarVehiculos);
