package com.health.project.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.health.project.entitys.Usuario;
import com.health.project.service.UsuarioService;

@Controller
public class IndexController {

    @Autowired 
    UsuarioService userService;



    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/inicio-sesion")
    public String mostrarInicioSesion() {
        return "inicioSesion";
    }

    @PostMapping("/inicio-sesion")
    public String inicioSesion(@RequestParam String correo, @RequestParam String contrasena) {
     Usuario usuario = userService.validarCredenciales(correo, contrasena);
    if (usuario == null) {
        return "redirect:/login";
    }
    if (usuario.getRol().getId().equals(1L)) {
        return "redirect:usuarios/InicioMedico/"+usuario.getId();
    } else if (usuario.getRol().getId().equals(2L)) {
        return "redirect:usuarios/Inicio/" + usuario.getId();
    } else if (usuario.getRol().getId().equals(3L)) {
        return "redirect:/admin/inicio";
    }
    return "redirect:/login";
    
}
}