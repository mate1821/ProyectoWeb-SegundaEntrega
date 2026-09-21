package com.health.project.entitys;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Espacio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @ManyToOne 
    private Tipo tipo;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 150)
    private String ubicacion;

    @Column(length = 255)
    private String imagenUrl;

    @Column(nullable = false)
    private boolean abierto;

    @OneToMany (mappedBy = "espacio")
    List<Medico> medicos;

    public Espacio(String nombre, String descripcion, String ubicacion, String imagenUrl, boolean abierto){
        this.nombre=nombre;
        this.descripcion=descripcion;
        this.ubicacion=ubicacion;
        this.imagenUrl=imagenUrl;
        this.abierto=abierto;
    }
}