package com.health.project.errors;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.health.project.controllers.AdminController;
import com.health.project.controllers.IndexController;
import com.health.project.controllers.ReservaController;
import com.health.project.controllers.UsuarioController;


// Solo para las vistas Thymeleaf (devuelve el nombre de una plantilla HTML).
// Los errores de la API REST los maneja ApiExceptionHandler y responden JSON (issue #19).
@ControllerAdvice(assignableTypes = { IndexController.class, ReservaController.class,
        AdminController.class, UsuarioController.class })
public class GlobalHandlerException {

    // Esta primera excepción es para validar que no haya usuarios duplicados
    @ExceptionHandler (UsuarioDuplicado.class)
    public String handlerUserNotFound(UsuarioDuplicado ex, Model model){
        model.addAttribute("error", ex.getMessage());
        return "usuarioDuplicado";
    }

    // Esta excepción valida que haya médicos para la especialidad seleccionada 
    @ExceptionHandler(MedicoNoSeleccionadoException.class)
    public String handlerMedicoNoSeleccionado( MedicoNoSeleccionadoException ex, Model model){ 
        model.addAttribute("error", ex.getMessage()); 
        return "medicoNoSeleccionado"; 
    }

    // Esta excepción valida que la reserva exista antes de cambiarle el estado
    @ExceptionHandler(ReservaNoEncontradaException.class)
    public String handlerReservaNoEncontrada(ReservaNoEncontradaException ex, Model model) {
    model.addAttribute("error", ex.getMessage());
    return "reservaNoEncontrada";
    }

    @ExceptionHandler(HorarioNoDisponibleException.class)
    public String handlerHorarioNodisponible(HorarioNoDisponibleException ex, Model model){ 
        model.addAttribute("error", ex.getMessage()); 
        return "horarioNoDisponible"; 
    }
}
