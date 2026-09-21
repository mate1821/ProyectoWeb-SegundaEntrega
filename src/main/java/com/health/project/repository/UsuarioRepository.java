package com.health.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.health.project.entitys.Rol;
import com.health.project.entitys.Usuario;

public interface UsuarioRepository 
extends JpaRepository<Usuario, Long>{
    @Query("""
        SELECT count(*) 
        from Usuario as u
        where (YEAR(CURRENT_DATE) - YEAR(u.fecha_nacimiento))>=60
            """)

    Long pacientesTerceraEdad();

    boolean existsByCedulaAndRol(Long cedula, Rol rol);

    boolean existsByCorreoAndRol(String correo, Rol rol);

    Usuario findFirstByCorreoAndContrasena(String correo, String contrasena);

}