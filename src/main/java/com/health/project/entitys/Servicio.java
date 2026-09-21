package com.health.project.entitys;

import java.util.List;

import jakarta.annotation.Generated;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter

public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private Double costo;

    @ManyToMany(mappedBy = "servicios")
    List<Reserva> reservas;

    public Servicio(String nombre, Double costo) {
        this.nombre = nombre;
        this.costo = costo;
    }
    
    public Servicio() {
    }
}