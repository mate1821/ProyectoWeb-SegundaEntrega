package com.health.project.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.health.project.entitys.Reserva;
import com.health.project.errors.UsuarioConReservasException;
import com.health.project.repository.ReservaRepository;
import com.health.project.repository.UsuarioRepository;

/** Regla de UsuarioServiceImpl.eliminar: solo se borra si el usuario no tiene reservas. */
@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplEliminarTest {

    @Mock UsuarioRepository repo;
    @Mock ReservaRepository reservaRepo;
    @InjectMocks UsuarioServiceImpl service;

    @Test
    void eliminar_sinReservas_borraElUsuario() {
        when(reservaRepo.findMisReservas(5L)).thenReturn(List.of());
        when(reservaRepo.findByMedicoId(5L)).thenReturn(List.of());

        service.eliminar(5L);

        verify(repo).deleteById(5L);
    }

    @Test
    void eliminar_pacienteConReservas_lanzaExcepcionYNoBorra() {
        when(reservaRepo.findMisReservas(5L)).thenReturn(List.of(new Reserva()));

        assertThatThrownBy(() -> service.eliminar(5L)).isInstanceOf(UsuarioConReservasException.class);

        verify(repo, never()).deleteById(anyLong());
    }

    @Test
    void eliminar_medicoConReservas_lanzaExcepcionYNoBorra() {
        when(reservaRepo.findMisReservas(8L)).thenReturn(List.of());
        when(reservaRepo.findByMedicoId(8L)).thenReturn(List.of(new Reserva()));

        assertThatThrownBy(() -> service.eliminar(8L)).isInstanceOf(UsuarioConReservasException.class);

        verify(repo, never()).deleteById(anyLong());
    }
}
