package com.health.project.service;

import java.util.List;

import com.health.project.entitys.Usuario;

public interface UsuarioService {
    List<Usuario> buscarTodos();
    Usuario buscarPorId(Long id);
    void guardar(Usuario usuario);
    void desactivar(Long id);
    void activar (Long id);
    Long consultarId (Usuario usuario);
    Long pacientesTerceraEdad();
    Usuario validarCredenciales(String correo, String contrasena);
}
