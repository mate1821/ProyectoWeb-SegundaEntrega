package com.health.project.controllers;

import com.health.project.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.health.project.service.EspecialidadService;
import com.health.project.service.EstadoResService;
import com.health.project.service.MedicoService;
import com.health.project.service.ServicioService;
import com.health.project.service.UsuarioService;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private EspecialidadService especialidadService;

    @Autowired
    private MedicoService medicoService;

    @Autowired
    private ServicioService servicioService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired 
    private ReservaService rersevaService;

    @Autowired 
    private EstadoResService estadoService;

    @GetMapping("/inicio")
    public String panel(Model model) {
        model.addAttribute("citasPorEspecialidad", especialidadService.conteoDeCitasporEspecialidad());
        model.addAttribute("medicosMasCotizados", medicoService.medicosMasCotizados());
        model.addAttribute("serviciosEnOrden", servicioService.serviciosEnOrden());
        model.addAttribute("pacientesTerceraEdad", usuarioService.pacientesTerceraEdad());
        return "admin";
    }

    @GetMapping("/verReservasGlobales")
    public String reservasGlobal(Model model) {
        model.addAttribute("reservas", rersevaService.buscarReservas());
        model.addAttribute("estados", estadoService.buscarTodos());
        return "mostrar_reservas";
    }
}