package com.health.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.health.project.entitys.Espacio;
import com.health.project.entitys.Especialidad;
import com.health.project.entitys.Medico;
import com.health.project.entitys.Usuario;
import com.health.project.errors.MedicoNoSeleccionadoException;
import com.health.project.repository.EspacioRepository;
import com.health.project.repository.EspecialidadRepository;
import com.health.project.repository.MedicoRepository;

@Service
public class MedicoServiceImpl implements MedicoService {
    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired 
    private EspecialidadRepository repoEspecialidad;

    @Autowired 
    private EspacioRepository repoEspacio;



    @Override
    public List<Medico> buscarTodos() {
        return medicoRepository.findAll();
    }

    @Override
    public Medico buscarPorId(Long id) {
        return medicoRepository.findById(id).orElse(null);
    }

    @Override
    public void guardar(Medico medico) {
        medicoRepository.save(medico);
    }

    @Override
    public Medico guardarMedicoDesdeUsuario(Usuario usuario, Long especialidadId, Long espacioId) {
        Medico medico;

        if (usuario.getId() != null) {
            medico = medicoRepository.findById(usuario.getId()).orElse(new Medico());
        } else {
            medico = new Medico();
        }
        medico.setCedula(usuario.getCedula());
        medico.setNombre(usuario.getNombre());
        medico.setFecha_nacimiento(usuario.getFecha_nacimiento());
        medico.setAntecedentes(usuario.getAntecedentes());
        medico.setTelefono(usuario.getTelefono());
        medico.setCorreo(usuario.getCorreo());
        medico.setContrasena(usuario.getContrasena());
        medico.setActivo(usuario.getActivo() != null ? usuario.getActivo() : true);
        medico.setRol(usuario.getRol());

        // Asignación de la Especialidad
        if (especialidadId != null) {
            Especialidad esp = repoEspecialidad.findById(especialidadId).orElse(null);
            medico.setEspecialidad(esp);
        }

        if (espacioId != null) {
            Espacio espacio = repoEspacio.findById(espacioId).orElse(null);
            medico.setEspacio(espacio);
        }




    medicoRepository.save(medico);
    return medico;
    }
    public List<Object[]> medicosMasCotizados() {
        return medicoRepository.medicosMasCotizados();
    }

    public List<Medico> buscarPorEspecialidad(Long especialidadId) {
    Especialidad especialidad = repoEspecialidad.findById(especialidadId).orElse(null);
    List<Medico> medicos = medicoRepository.findByEspecialidadId(especialidadId);
    if (medicos.isEmpty()) {
        throw new MedicoNoSeleccionadoException(
                especialidad.getNombreEspecialidad()
        );
    }
    return medicos;
    }
}