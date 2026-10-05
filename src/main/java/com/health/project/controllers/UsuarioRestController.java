package com.health.project.controllers;

import java.util.List;
import org.springframework.web.bind.annotation.*;

import com.health.project.entitys.Usuario;
import com.health.project.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioRestController {

    private final UsuarioService usuarioService;

    public UsuarioRestController(UsuarioService usuarioService) {
    this.usuarioService = usuarioService;
}

@GetMapping
public List<Usuario> listar() {
    return usuarioService.buscarTodos();
}


@GetMapping("/{id}")
public Usuario buscarPorId(@PathVariable Long id) {
    return usuarioService.buscarPorId(id);
}

@PostMapping
public void  crear(@RequestBody Usuario usuario) {
    usuarioService.guardar(usuario);
}

@PutMapping("/{id}")
public void  actualizar(@PathVariable Long id ,@RequestBody Usuario usuario) {
    usuario.setId(id);
    usuarioService.guardar(usuario);
}


@DeleteMapping("/{id}")
public void eliminar(@PathVariable Long id) {
    usuarioService.desactivar(id);
}



}
