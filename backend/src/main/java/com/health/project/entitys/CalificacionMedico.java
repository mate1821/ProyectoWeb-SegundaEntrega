package com.health.project.entitys;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
public class CalificacionMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long idCalificacion;

    @ManyToOne
    @JsonIgnoreProperties("contrasena")
    public Usuario usuario;

    @ManyToOne
    @JsonIgnoreProperties("contrasena")
    public Medico medico;

    @Column(nullable = false)
    public int puntuacion;

    @Column(length = 255)
    public String comentario;

    @Column(nullable = false, updatable = false)
    public LocalDateTime fecha;

    public CalificacionMedico(int puntuacion, String comentario, LocalDateTime fecha) {
        this.puntuacion = puntuacion;
        this.comentario = comentario;
        this.fecha = fecha;
    }
}