// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    // Selecciona el encabezado del modal con la clase '.fixed-modal .modal-header'
    const modalHeader = document.querySelector('.fixed-modal .modal-header');
    // Selecciona el cuerpo del modal con la clase '.fixed-modal .modal-body'
    const modalBody = document.querySelector('.fixed-modal .modal-body');

    // Verifica si tanto el encabezado como el cuerpo del modal existen
    if (modalHeader && modalBody) {
        // Obtiene la altura del encabezado del modal
        const headerHeight = modalHeader.offsetHeight;
        // Ajusta el margen superior del cuerpo del modal para que coincida con la altura del encabezado
        modalBody.style.marginTop = headerHeight + 'px';
    }
});
