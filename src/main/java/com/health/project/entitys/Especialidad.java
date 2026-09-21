package com.health.project.entitys;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;


@AllArgsConstructor 
@NoArgsConstructor 
@Getter 
@Setter 

@Entity 
public class Especialidad {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length =150, unique=true)
    private String nombreEspecialidad ; 

    @Column(nullable = false)
    private Double costo;

    @OneToMany (mappedBy="especialidad")
    List<Medico> medicos;

    public Especialidad(String nombre, Double costo){
        this.nombreEspecialidad=nombre;
        this.costo=costo;
    }
}
