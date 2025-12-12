    const concesionarioSelect = document.getElementById("concesionario");
    const nombre = document.getElementById("nombre");
    const ciudad = document.getElementById("ciudad");
    const direccion = document.getElementById("direccion");
    const editar = document.getElementById("editar");
    const telefono = document.getElementById("telefono");
    const form = document.getElementById("editarConcesionariosForm");


    let concesionarios = [];

    async function cargarConcesionarios() {
        try{
            const response = await fetch("/api/concesionarios");
            if(!response.ok) throw new Error("Error al obtener concesionarios");


            concesionarios = await response.json();
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

    concesionarioSelect.addEventListener("change",()=>{

    const id = parseInt(concesionarioSelect.value);

    if(!id){
        nombre.disabled = true;
        ciudad.disabled = true;
        direccion.disabled = true;
        telefono.disabled = true;
        editar.disabled = true;

        nombre.value = "";
        ciudad.value = "";
        direccion.value = "";
        telefono.value = "";
   
        return;
    }
    else{

        nombre.disabled = false;
        ciudad.disabled = false;
        direccion.disabled = false;
        telefono.disabled = false;
        editar.disabled = false;
        const selecionado = concesionarios.find(c => c.id_concesionario === id);

        nombre.value = selecionado.nombre || "";
        ciudad.value =  selecionado.ciudad || "";
        direccion.value =  selecionado.direccion || "";
        telefono.value =  selecionado.telefono_contacto || "";

    }

    });


form.addEventListener("submit",async(event)=>{
    event.preventDefault();

    if(!form.checkValidity()){
        form.classList.add("was-validated");
        return;
    }

    const data = {
        id:parseInt(concesionarioSelect.value),
        nombre: nombre.value,
        ciudad:ciudad.value,
        direccion: direccion.value,
        telefono: telefono.value

    }

    try{
        const response = await fetch("/editarConcesionarios",{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(data)
        });

        const text = await response.text();
        if(response.ok){
            alert("Editacion correctamente. Redirigiendo a la pagina adminIni");
            window.location.href = "/adminIni";
        }
        else
            alert("Error al editar: " + text)
        
            

    }catch(error){
        alert("error al conectar con el servidor");
        console.error("error: ",error)
    }




});
    