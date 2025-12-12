const form = document.getElementById("altaConcesionariosForm");

form.addEventListener("submit", async (event)=>{

    event.preventDefault();


    const nombre = document.getElementById("nombre").value;
    const ciudad = document.getElementById("ciudad").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    
    if(!form.checkValidity()){
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
    }


    const data = {
        nombre,
        ciudad,
        direccion,
        telefono
    }

    try{
        const response = await fetch ("/altaConcesionarios",{
            method:"POST",
            headers:{ "Content-Type": "application/json" },
            body:JSON.stringify(data)
        });

        const text = await response.text();
        console.log("Respuesta del servidor:", response.status, text);
        
        if (response.ok) {
          alert("Alta concesionario exitoso. Redirigiendo a la pagina adminIni");
          window.location.href = "/adminIni";
        } else {
          alert("Error en la alta: " + text);
        }
      } catch (error) {
        alert("Error al conectar con el servidor");
        console.error("Error:", error);
      }




});