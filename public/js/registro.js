
    const form = document.getElementById("registroForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const concesionarioSelect = document.getElementById("concesionario");

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

    function validarEmailUCM(email) {
      const limpio = email.trim();
      if (/["'<>]/.test(limpio)) return false;
      const re = /^[A-Za-z0-9._%+-]+@ucm\.es$/i;
      return re.test(limpio);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const telefono = document.getElementById("telefono").value.trim();
      const concesionario = document.getElementById("concesionario").value;

      if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
      }

      if (!validarEmailUCM(email)) {
        emailInput.classList.add("is-invalid");
        emailInput.nextElementSibling.textContent = "Debe ser un correo válido @ucm.es (sin comillas ni espacios)";
        return;
      } else {
        emailInput.classList.remove("is-invalid");
      }

      if (password.length < 8) {
        passwordInput.classList.add("is-invalid");
        passwordInput.nextElementSibling.textContent = "Debe tener al menos 8 caracteres";
        return;
      } 
      else if (!/[A-Z]/.test(password)) {
        passwordInput.classList.add("is-invalid");
        passwordInput.nextElementSibling.textContent = "Debe contener al menos una letra mayúscula";
        return;
      }
      else if (!/[a-z]/.test(password)) {
        passwordInput.classList.add("is-invalid");
        passwordInput.nextElementSibling.textContent = "Debe contener al menos una letra minúscula";
        return;
      } 
      else {
        passwordInput.classList.remove("is-invalid");
      }

      const data = { nombre, email, password, telefono: telefono || null, concesionario };

      try {

     
        const response = await fetch("/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const text = await response.text();
        console.log("Respuesta del servidor:", response.status, text);

        if (response.ok) {
          alert("Registro exitoso. Redirigiendo al login...");
          window.location.href = "/login";
        } else {
          alert("Error en el registro: " + text);
        }
      } catch (error) {
        alert("Error al conectar con el servidor");
        console.error("Error:", error);
      }
    });