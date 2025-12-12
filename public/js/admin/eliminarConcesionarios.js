    const concesionarioSelect = document.getElementById("concesionario");
    const form = document.getElementById("eliminarConcesionariosForm");
    

    async function cargarConcesionarios() {
        try{
            const response = await fetch("/api/concesionarios");
            if(!response.ok) throw new Error("Error al obtener concesionarios");


            const concesionarios = await response.json();
            concesionarioSelect.innerHTML = '<option value="">Selecciona un concesionario</option>';
            concesionarios.forEach(c => {
                const option = document.createElement("option");
                option.value = c.id_concesionario;
                option.textContent = `${c.id_concesionario} - ${c.nombre}`;
                concesionarioSelect.appendChild(option);
            });
        
        
        } catch(error){
            console.error("Error cargando concesionarios:", error);
            alert("No se pudieron cargar los concesionarios");
        }
    }

    document.addEventListener("DOMContentLoaded",cargarConcesionarios);


    form.addEventListener("submit",async(event)=>{
        event.preventDefault();

        if(!form.checkValidity()){
            form.classList.add("was-validated");
            return;
        }

        const id= parseInt(concesionarioSelect.value);
        if(!id){
            alert("Seleciona un concesionario");
            return;
        }


        try{


            const response = await fetch("/eliminarConcesionarios",{
                method: "DELETE",
                headers:{"Content-Type": "application/json" },
                body: JSON.stringify({id})
            });

            if(response.ok){

            alert("Eliminacion correctamente. Redirigiendo a la pagina adminIni");
            window.location.href = "/adminIni";
            }
            else
                alert("Error al eliminar: " + text)


        }catch(err){
            console.error("Error cargando concesionarios:", error);
            alert("Error en eliminar concesionario");
        }




    });
