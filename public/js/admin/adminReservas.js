

document.addEventListener('click',async (e)=>{

    if (e.target.classList.contains('guardar_incidencia')) {

        const boton = e.target;
        const idReserva= boton.dataset.idReserva;


        const incidencias_reportadas = document.querySelector(`.form-control[name='incidencia'][data-id-reserva='${idReserva}']`);
        const incidencia=incidencias_reportadas.value.trim();


        const inputKm = document.querySelector(`.form-control[name='km_recorrido'][data-id-reserva='${idReserva}']`);
        let kmRecorridos = parseInt(inputKm.value.trim(),10);


        if(isNaN(kmRecorridos) ) kmRecorridos = 0;

        if(kmRecorridos<0){
            inputKm.classList.add('is-invalid');
            return;
        }
        else inputKm.classList.remove('is-invalid');


        try {
            const response = await fetch('/reservasIncidenciasKm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_reserva: idReserva, 
                                        incidencia,
                                        km_recorrido:kmRecorridos
                                    })
        });

        if (!response.ok) throw new Error('Error al guardar la incidencia');

            alert('Incidencia/Km recorridos guardados correctamente');
            location.reload();
        } catch (error) {
            console.error(error);
            alert('No se pudo guardar la incidencia');
        }

    }

    if (e.target.classList.contains('terminar_reserva')) {

        const boton = e.target;
        const idReserva = boton.dataset.idReserva;

        try {
            const response = await fetch('/terminar_reserva', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_reserva: idReserva })
            });

            if (!response.ok) throw new Error("Error finalizar/cancelar reserva");

            alert("Reserva finalizada/cancelada correctamente");
            location.reload();

        } catch (err) {
            console.error(err);
            alert("No se pudo finalizar/cancelar la reserva");
        }
    }



});