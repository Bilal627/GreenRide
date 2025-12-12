function setContrast(mode){
    document.body.classList.remove('high-contrast', 'daltonismo');

    if(mode === 'high-contrast'){
        document.body.classList.add('high-contrast');
    }
    else if(mode === 'daltonismo'){
        document.body.classList.add('daltonismo');
    }

    localStorage.setItem('contrast', mode);
}

function setFontSize(size){
    const html = document.documentElement;

    html.classList.remove('font-pequeño', 'font-normal', 'font-grande');

    if(size === 'pequeño') html.classList.add('font-pequeño');
    else if (size === 'grande') html.classList.add('font-grande');
    else html.classList.add('font-normal');

    localStorage.setItem('fontSize', size);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedContrast = localStorage.getItem('contrast') || 'normal';
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';

    setContrast(savedContrast);
    setFontSize(savedFontSize);

    document.addEventListener('keydown', (event) => {
        if(event.altKey){
            switch (event.key.toLowerCase()){
                case 'a':
                    const modal = document.getElementById('accesibilityModal');
                    if(modal && window.bootstrap){
                        const m = bootstrap.Modal.getOrCreateInstance(modal);
                        m.show();
                    }
                    break;
                case 'r':
                    window.location.href = '/reserva';
                    break;
                case 'h':
                    window.location.href = '/mis_reservas';
                    break;
            }
        }
    });
});


document.getElementById("guardar").addEventListener('click',async()=>{


    const contrast = localStorage.getItem('contrast') || 'normal';
    const fontSize = localStorage.getItem('fontSize') || 'normal';


    const data = {contrast,fontSize};

    try{
        const response=await fetch('/guardarAccesibilidad',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

            const text = await response.text();

            console.log("Respuesta del servidor:", response.status, text);

        if (response.ok) {
            alert("Preferencias guardadas correctamente");
            const modalEl = document.getElementById('accessibilityModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        } else {
            alert("Error al guardar preferencias: " + text);
        }
    } catch (error) {
        alert("Error al conectar con el servidor");
        console.error("Error:", error);
    }
});