const form = document.getElementById("modificarPerfilForm");

form.addEventListener("submit",(async(event)=>{
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;

    const contrasenaInput = document.getElementById("contrasena");
    const contrasena = contrasenaInput.value;


    if(!form.checkValidity()){
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
    }


    if (contrasena.length < 8) {
    contrasenaInput.classList.add("is-invalid");
    contrasenaInput.nextElementSibling.textContent = "Debe tener al menos 8 caracteres";
    return;
    } 
    else if (!/[A-Z]/.test(contrasena)) {
        contrasenaInput.classList.add("is-invalid");
        contrasenaInput.nextElementSibling.textContent = "Debe contener al menos una letra mayúscula";
        return;
    }
    else if (!/[a-z]/.test(contrasena)) {
        contrasenaInput.classList.add("is-invalid");
        contrasenaInput.nextElementSibling.textContent = "Debe contener al menos una letra minúscula";
        return;
    } 
    else {
        contrasenaInput.classList.remove("is-invalid");
    }



    const data = { nombre, contrasena, telefono: telefono || null };

    try{
        const response= await fetch("/perfil",{
            method: "POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
        const text = await response.text();
        console.log("respuesta del servidor: ",response.status, text);

        if(response.ok){
            alert("Modificado correctamente. Redirigiendo a la pagina principal...");
            window.location.href ="/";
        }
        else{
            alert("Error en modificar perfil: "+ text);
        }
    }catch(error){
        alert("error al conectar con el servidor");
        console.error("error: ",error)
    }


}));