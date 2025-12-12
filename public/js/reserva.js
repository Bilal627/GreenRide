document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registroForm");
    const vehiculosSelect = document.getElementById("vehiculos");
    const fechaIni = document.getElementById("fechainicio");
    const fechaFin = document.getElementById("fechafin");

    //1.Cargar los vehiculos
    async function cargarVehiculos() {
        if(!vehiculosSelect) return;
      
        try{

            const response = await fetch('/api/vehiculos');
    
            if(!response.ok) throw new Error("Error API");

            const vehiculos = await response.json();

            vehiculosSelect.innerHTML = '<option value="">Seleccione un vehiculo</option>';
            vehiculos.forEach(v => {
                const option = document.createElement("option");
                option.value = v.id_vehiculo;
                option.textContent =  `${v.id_vehiculo} - ${v.marca} ${v.modelo} (${v.matricula})`;
                vehiculosSelect.appendChild(option);
            });
        }
        catch(error){
            console.error(error);
            vehiculosSelect.innerHTML = '<option value="">Error cargando vehiculos</option>';
        }
    }

    //2.Validar las fechas
    function configurarFechas(){
        if(!fechaIni || !fechaFin) return;

        const ahora = new Date();
        ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
        const minDate = ahora.toISOString().slice(0, 16);

        fechaIni.min = minDate;

        fechaIni.addEventListener("change", () => {
            fechaFin.min = fechaIni.value;
            fechaFin.disabled = false;
            if(fechaFin.value && fechaFin.value < fechaIni.value){
                fechaFin.value = fechaIni.value;
            }
        });
    }

    //3.Enviamos la reserva
    if(form){
        form.addEventListener("submit", async(e) => {
            e.preventDefault();

            if(!form.checkValidity()){
                e.stopPropagation();
                form.classList.add("was-validated");
                return;
            }

            const data = {
                id_vehiculo: vehiculosSelect.value,
                fecha_inicio: fechaIni.value,
                fecha_fin: fechaFin.value,
                condiciones: document.getElementById("condiciones").checked
            };

            try{
                const response = await fetch('/reserva', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });

                if(response.ok){
                    alert("¡Reserva creada!");
                    window.location.href = "/mis_reservas";
                }
                else{
                    alert("Error: " + await response.text());
                }
            }
            catch(err){
                alert("Error de conexion");
            }
        });
    }

    cargarVehiculos();

    configurarFechas();

});
