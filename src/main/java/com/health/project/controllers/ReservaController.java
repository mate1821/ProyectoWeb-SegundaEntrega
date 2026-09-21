
package com.health.project.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.health.project.entitys.Reserva;
import com.health.project.entitys.Servicio;
import com.health.project.service.EspecialidadService;
import com.health.project.service.EstadoResService;
import com.health.project.service.MedicoService;
import com.health.project.service.ReservaService;
import com.health.project.service.ServicioService;
import com.health.project.service.UsuarioService;
import java.time.LocalDateTime;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/reservas")
public class ReservaController {
    
    @Autowired
    ReservaService service;

    
    @Autowired
    private EspecialidadService espService;

    @Autowired
    private MedicoService medService;

    @Autowired
    private UsuarioService pacienteService;

    
    @Autowired
    private ServicioService serviciosService;

    @Autowired
    private EstadoResService estadoService;




@GetMapping("/mostrarMisReservas/{id}")
public String mostrarMisReservas(@PathVariable Long id, Model model) {

model.addAttribute("reservas", service.misReservas(id));
model.addAttribute("estados", estadoService.buscarTodos());
return "mostrar_reservas";

}




    @GetMapping("/mostrar")
    public String mostrarReservas(Model model) {
        model.addAttribute("reservas", service.buscarReservas());
        model.addAttribute("estados", estadoService.buscarTodos());

        return "mostrar_reservas";
    }
    
    @GetMapping("/Crear/{id}")
    public String crearReservas(@PathVariable Long id,Model model, @RequestParam(required = false) Long especialidadId)  {

    model.addAttribute("reserva", new Reserva());
    model.addAttribute("especialidades", espService.buscarTodos());
    model.addAttribute("paciente", pacienteService.buscarPorId(id)); 
    model.addAttribute("fechaSolicitud", LocalDateTime.now());
    model.addAttribute("fechaMinima", LocalDate.now());
    model.addAttribute("especialidadId", especialidadId);
    model.addAttribute("servicios",serviciosService.searchAll());
    model.addAttribute("medicos", especialidadId == null ? List.of() : medService.buscarPorEspecialidad(especialidadId));

    return "reserva-form";

    }

    @GetMapping("/Editar/{id}")
    public String editarReservas(@PathVariable Long id, @RequestParam  long reservaId ,Model model, @RequestParam(required = false) Long especialidadId)  {

    Reserva r=service.buscarPorId(reservaId);
    Long idEsp = especialidadId;
    if (idEsp == null && r != null && r.getMedico() != null && r.getMedico().getEspecialidad() != null) {
        idEsp = r.getMedico().getEspecialidad().getId();
    } // Para cargar el medico previo en el
    model.addAttribute("reserva", r);
    model.addAttribute("especialidades", espService.buscarTodos());
    model.addAttribute("paciente", pacienteService.buscarPorId(id)); 
    model.addAttribute("fechaSolicitud", LocalDateTime.now());
    model.addAttribute("fechaMinima", LocalDate.now());
    model.addAttribute("especialidadId", idEsp);
    model.addAttribute("servicios",serviciosService.searchAll());
    model.addAttribute("medicos", idEsp == null ? List.of() : medService.buscarPorEspecialidad(idEsp));
    return "reserva-form";

    }


@PostMapping("/guardar")
public String guardarReserva(@ModelAttribute Reserva reserva,@RequestParam(name = "servicioIds", required = false) List<Long> servicioIds,@RequestParam(required = false) Long pacienteId,@RequestParam(required = false) Long medicoId) {

    reserva.setUsuario(pacienteService.buscarPorId(pacienteId));
    reserva.setMedico(medService.buscarPorId(medicoId));
    reserva.setEstado(estadoService.buscarPorId(1L));

    if (reserva.getFechaSolicitud() == null) {
        reserva.setFechaSolicitud(LocalDateTime.now());
    }

    if (servicioIds != null && !servicioIds.isEmpty()) {
    List<Servicio> servicios = serviciosService.buscarPorIds(servicioIds);
    reserva.setServicios(servicios);
}

double total = reserva.getMedico().getEspecialidad().getCosto();

    if (reserva.getServicios() != null) {
        for (Servicio s : reserva.getServicios()) {
            total += s.getCosto();
            System.out.println("Servicios:");
            System.out.println(s.getNombre());
        }
    }
    if (reserva.getHoraInicio() != null) {
    reserva.setHoraFin(reserva.getHoraInicio().plusHours(1));
    }

    reserva.setTotal(total);
    service.guardar(reserva);

    return "redirect:/reservas/mostrarMisReservas/"+ reserva.getUsuario().getId();
}

@PostMapping("/cambiarEstado")
public String cambiarEstado(@RequestParam Long idReserva, @RequestParam Long idEstado) {
    service.cambiarEstado(idReserva, idEstado);
    Reserva reserva = service.buscarPorId(idReserva);
    return "redirect:/reservas/mostrarMisReservas/" + reserva.getUsuario().getId();
}

@GetMapping("/mostrarReservasMedico/{id}")
public String mostrarReservasMedico(@PathVariable Long id, Model model) {
    model.addAttribute("reservas", service.reservasDelMedico(id));
    model.addAttribute("estados", estadoService.buscarTodos());
    return "mostrar_reservas";
}

}
