document.addEventListener('DOMContentLoaded', function () {

    const radiosRol = document.querySelectorAll('input[name="rol.id"]');
    const seccionPaciente = document.getElementById('seccion-paciente');
    const seccionMedico = document.getElementById('seccion-medico');

    function mostrarSeccionPorRol() {
        if (seccionPaciente) seccionPaciente.style.display = 'none';
        if (seccionMedico) seccionMedico.style.display = 'none';

        const seleccionado = document.querySelector('input[name="rol.id"]:checked');
        if (seleccionado) {
            if (seleccionado.value == 1) {
                if (seccionMedico) seccionMedico.style.display = 'block';
            } else if (seleccionado.value == 2) {
                if (seccionPaciente) seccionPaciente.style.display = 'block';
            }
        }
    }
    radiosRol.forEach(radio => {
        radio.addEventListener('change', mostrarSeccionPorRol);
    });

    mostrarSeccionPorRol();
});