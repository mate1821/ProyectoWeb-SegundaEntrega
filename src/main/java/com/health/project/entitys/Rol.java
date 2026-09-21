package com.health.project.entitys;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@Getter 
@Setter 

@Entity 
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Integer puede ser null
    @Column(nullable = false, length = 100)
    private String nombre;

    @OneToMany (mappedBy = "rol")
    private List<Usuario> usuarios;

    public Rol(String nombre){
        this.nombre=nombre;
    }
}


