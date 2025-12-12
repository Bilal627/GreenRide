const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");


function setContrast(mode) {
  document.body.classList.remove('high-contrast', 'daltonismo');
  
  if (mode === 'high-contrast')
    document.body.classList.add('high-contrast');
  else if (mode === 'daltonismo') 
    document.body.classList.add('daltonismo');

  localStorage.setItem('contrast', mode);
}

function setFontSize(size) {
    const html = document.documentElement;
    html.classList.remove('font-pequeño', 'font-normal', 'font-grande');

    if (size === 'pequeño') 
      html.classList.add('font-pequeño');
    else if (size === 'grande') 
      html.classList.add('font-grande');
    else 
      html.classList.add('font-normal');


    localStorage.setItem('fontSize', size);
}


form.addEventListener("submit", async(event)=>{
  event.preventDefault();

  const email= emailInput.value.trim();
  const password = passwordInput.value;

  if(!form.checkValidity()){
      event.stopPropagation();
      form.classList.add("was-validated");
      return;
  }

  const data = {email,password};

  try{
      
    const response = await fetch("/login",{
      method:"POST",
      headers:{"Content-Type": "application/json"},
      body: JSON.stringify(data)
      
    });

    const result = await response.json();
    console.log("Respuesta del servidor:", response.status, result);

    if (response.ok && result.ok) {
      
      const contrast = result.contraste || 'normal';
      const fontSize = result.fuente || 'normal';
      setContrast(contrast);
      setFontSize(fontSize);

      alert("Login exitoso. Redirigiendo a la pagina principal...");          
      window.location.href = "/";
    } else {
      alert("Error en el login: " + text);
    }
  } catch (error) {
    alert("Error en el correo o contraseña");
    console.error("Error:", error);
  }

});
