const form = document.getElementById("editarUsuariosForm");
const usuariosSelect = document.getElementById("usuario");
const concesionarioSelect = document.getElementById("concesionario");
const rol = document.getElementById("rol");
const nombre = document.getElementById("nombre");
const telefono = document.getElementById("telefono");
const correo = document.getElementById("correo");
const editar = document.getElementById("editar");


    let usuarios = [];

    async function cargarUsuarios() {
    try {
        const response = await fetch("/api/usuarios");
        if (!response.ok) throw new Error("Error al obtener usuarios");

        usuarios = await response.json();

        // Filtrar usuarios que no sean admin
        const usuariosFiltrados = usuarios.filter(u => u.rol !== "admin");

        usuariosSelect.innerHTML = '<option value="">Selecciona un usuario</option>';
        usuariosFiltrados.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id_usuario;
            option.textContent = `${c.id_usuario} - ${c.nombre}`;
            usuariosSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando usuarios:", error);
        alert("No se pudieron cargar los usuarios");
    }
    }

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

    //document.addEventListener("DOMContentLoaded",cargarConcesionarios);

    //document.addEventListener("DOMContentLoaded",cargarUsuarios);

    document.addEventListener("DOMContentLoaded", () => {
    cargarConcesionarios();
    cargarUsuarios();
    });

    usuariosSelect.addEventListener("change",()=>{

    const id = parseInt(usuariosSelect.value);

    if(!id){
        nombre.disabled = true;
        correo.disabled = true;
        telefono.disabled = true;
        concesionarioSelect.disabled=true;
        rol.disabled = true;
        editar.disabled=true;

        nombre.value = "";
        correo.value = "";
        telefono.value = "";

        rol.value ="";
        concesionarioSelect.value="";
        
        return;
    }
    else{

        rol.disabled = false;
        editar.disabled = false;
        concesionarioSelect.disabled=false;
        const selecionado = usuarios.find(c => c.id_usuario === id);

        nombre.value = selecionado.nombre||"";
        correo.value =selecionado.correo ||"";
        telefono.value = selecionado.telefono||"";
        rol.value = selecionado.rol||"";
        concesionarioSelect.value = selecionado.id_concesionario || "";

    }

});

form.addEventListener("submit",(async(event)=>{
    event.preventDefault();


    if(!form.checkValidity()){
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
    }


    const data = {
        id:parseInt(usuariosSelect.value),
        id_concesionario:parseInt(concesionarioSelect.value),
        rol: rol.value
    }

    try{
        const response= await fetch("/editarUsuarios",{
            method: "PUT",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
        const text = await response.text();
        console.log("respuesta del servidor: ",response.status, text);

        if(response.ok){
            alert("Editada correctamente. Redirigiendo a la pagina adminIni...");
            window.location.href ="/adminIni";
        }
        else{
            alert("Error en editar usuario: "+ text);
        }
    }catch(error){
        alert("error al conectar con el servidor");
        console.error("error: ",error)
    }


}));