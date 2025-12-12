
document.addEventListener('DOMContentLoaded', () => {
  const autonomiaInput = document.getElementById('autonomia_km');
  const plazasInput = document.getElementById('plazas');
  const colorSelect = document.getElementById('color');
  const tarjetas = document.querySelectorAll('.tarjeta-vehiculo');

  function filtrarVehiculos() {
    const autonomiaMin = parseInt(autonomiaInput.value) || 0;
    const plazasMin = parseInt(plazasInput.value) || 0;
    const color = colorSelect.value;

    tarjetas.forEach(tarjeta => {
      const autonomia = parseInt(tarjeta.querySelector('li:nth-child(4)').textContent.replace(/\D/g,'')) || 0;
      const plazas = parseInt(tarjeta.querySelector('li:nth-child(3)').textContent.replace(/\D/g,'')) || 0;
      const colorVehiculo = tarjeta.querySelector('li:nth-child(5)').textContent.split(':')[1].trim().toLowerCase();

      const cumpleAutonomia = autonomia >= autonomiaMin;
      const cumplePlazas = plazas >= plazasMin;
      const cumpleColor = !color || colorVehiculo === color.toLowerCase();

      if(cumpleAutonomia && cumplePlazas && cumpleColor){
        tarjeta.parentElement.style.display = 'block';
      } else {
        tarjeta.parentElement.style.display = 'none';
      }
    });
  }

  autonomiaInput.addEventListener('input', filtrarVehiculos);
  plazasInput.addEventListener('input', filtrarVehiculos);
  colorSelect.addEventListener('change', filtrarVehiculos);
});

