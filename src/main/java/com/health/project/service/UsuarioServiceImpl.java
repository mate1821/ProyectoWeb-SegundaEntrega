package com.health.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.health.project.entitys.Usuario;
import com.health.project.errors.UsuarioConReservasException;
import com.health.project.errors.UsuarioDuplicado;
import com.health.project.repository.ReservaRepository;
import com.health.project.repository.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService {
    @Autowired
    private UsuarioRepository repo;
    @Autowired
    private ReservaRepository reservaRepo;

    @Override
    public List<Usuario> buscarTodos(){
        return repo.findAllOrderById();
    }
    @Override
    public Usuario buscarPorId(Long id){
        return repo.findById(id).orElse(null);
    }
    @Override
    public void guardar(Usuario usuario){

    if (usuario.getId() == null) {

    if (repo.existsByCedulaAndRol( usuario.getCedula(), usuario.getRol())) {

        throw new UsuarioDuplicado("Ya existe un usuario de tipo "+ usuario.getRol().getNombre()+ " registrado con la cédula "+ usuario.getCedula());
    }

    if (repo.existsByCorreoAndRol(usuario.getCorreo(),usuario.getRol())) {

        throw new UsuarioDuplicado( "Ya existe un usuario de tipo " + usuario.getRol().getNombre()+ " registrado con el correo "+ usuario.getCorreo());
    }
}
        repo.save(usuario);
    }

    @Override 
    public Long consultarId (Usuario usuario) {
        return usuario.getId();
    }

    @Override
    public void desactivar(Long id){
        Usuario usuario = buscarPorId(id);
        if (usuario!=null){
            usuario.setActivo(false);
            repo.save(usuario);
        }
    }
    @Override
    public void activar(Long id){
        Usuario usuario = buscarPorId(id);
        if (usuario!=null){
            usuario.setActivo(true);
            repo.save(usuario);
        }
    }

    // Borra el usuario de la base de datos. Si es paciente o médico con reservas no se puede
    // (la reserva lo referencia): en ese caso se lanza UsuarioConReservasException.
    @Override
    public void eliminar(Long id) {
        if (!reservaRepo.findMisReservas(id).isEmpty() || !reservaRepo.findByMedicoId(id).isEmpty()) {
            throw new UsuarioConReservasException(id);
        }
        repo.deleteById(id);
    }

    public Long pacientesTerceraEdad() {
        return repo.pacientesTerceraEdad();
    }

    @Override
    public Usuario validarCredenciales(String correo, String contrasena) {
        return repo.findFirstByCorreoAndContrasena(correo, contrasena);
}

    
}
