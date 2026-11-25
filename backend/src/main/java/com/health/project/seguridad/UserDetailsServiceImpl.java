package com.health.project.seguridad;

import com.health.project.entitys.Usuario;
import com.health.project.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String correo)throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByCorreo(correo);

        if (usuario == null) {
            throw new UsernameNotFoundException("Usuario no encontrado con el correo: " + correo);
        }

        String rolNombre = "USER";

        if (usuario.getRol() != null &&
                "Administrador".equalsIgnoreCase(usuario.getRol().getNombre())) {
            rolNombre = "ADMIN";
        }

        return User.builder()
                .username(usuario.getCorreo())
                .password(usuario.getContrasena())
                .roles(rolNombre)
                .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
                .build();
    }
}