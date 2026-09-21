package com.health.project.entitys;

import java.util.List;

import org.hibernate.mapping.ManyToOne;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Getter 
@Setter
@AllArgsConstructor 
@NoArgsConstructor 
public class EstadoReserva {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @OneToMany (mappedBy = "estado")
    List<Reserva> reservas;


    public EstadoReserva(String nombre){
        this.nombre=nombre;
    }
    
}
