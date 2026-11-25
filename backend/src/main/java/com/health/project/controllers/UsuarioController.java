package com.health.project.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.health.project.entitys.Rol;
import com.health.project.entitys.Usuario;
import com.health.project.service.EspacioService;
import com.health.project.service.EspecialidadService;
import com.health.project.service.MedicoService;
import com.health.project.service.RolService;
import com.health.project.service.UsuarioService;

import com.health.project.entitys.Medico;

@Controller
@RequestMapping("/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private RolService rolService;

    @Autowired
    private EspecialidadService espService;

    @Autowired 
    private MedicoService medicoService;

    @Autowired 
    private EspacioService espacioService;

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("usuarios", usuarioService.buscarTodos());
        return "usuarios";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("usuario", new Usuario());
        model.addAttribute("Roles", rolService.searchAll());
        model.addAttribute("Especialidades", espService.buscarTodos());
        model.addAttribute("Espacios", espacioService.buscarTodos());
        return "usuario-form";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Usuario usuario, @RequestParam(value = "especialidadId", required = false) Long especialidadId,@RequestParam(value = "espacioId", required = false) Long espacioId) {
        Rol rol = rolService.searchById(usuario.getRol().getId());
        usuario.setRol(rol);

        //Si el roll es medico, que se usen los metodos del servicio de médico
        if (rol != null && "Medico".equalsIgnoreCase(rol.getNombre())) {
        medicoService.guardarMedicoDesdeUsuario(usuario, especialidadId, espacioId);
        }
        else {
            usuarioService.guardar(usuario);
        }
        return "redirect:/inicio-sesion";
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Long id, Model model) {
        model.addAttribute("usuario", usuarioService.buscarPorId(id));
        model.addAttribute("Roles", rolService.searchAll());
        model.addAttribute("Especialidades", espService.buscarTodos());
        model.addAttribute("Espacios", espacioService.buscarTodos());
        return "usuario-form";
    }

    @GetMapping("/desactivar/{id}")
    public String desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
        return "redirect:/usuarios";
    }

    @GetMapping("/activar/{id}")
    public String activar(@PathVariable Long id) {
        usuarioService.activar(id);
        return "redirect:/usuarios";
    }

    @GetMapping("/Inicio/{id}")
    public String inicio(@PathVariable Long id, Model model) {
        model.addAttribute("usuarioId", id);
        return "inicioUsuario";
    }

    @GetMapping("/InicioMedico/{id}")
    public String inicioMedico(@PathVariable Long id, Model model) {
        model.addAttribute("medicoId", id);
        return "inicioMedico";
    }
    
}