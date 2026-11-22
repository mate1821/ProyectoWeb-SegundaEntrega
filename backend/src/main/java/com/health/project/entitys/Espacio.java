package com.health.project.entitys;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @Column(nullable = false, length = 151)
    private String nombre;

    @ManyToOne 
    private Tipo tipo;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 150)
    private String ubicacion;

    // Foto del espacio en Base64 (se pone en el DataLoader).
    // TEXT porque una foto en Base64 ocupa decenas de miles de caracteres (varchar(255) no alcanza).
    // @JsonIgnore: Espacio viaja dentro de cada reserva y la foto haría pesado ese JSON;
    // se pide aparte con GET /api/espacios/{id}/foto
    @Column(columnDefinition = "TEXT")
    @JsonIgnore
    private String imagenUrl;

    @Column(nullable = false)
    private boolean abierto;

    private Double latitud;

    private Double longitud;

    @OneToMany (mappedBy = "espacio")
    @JsonIgnore 
    List<Medico> medicos;

    public Espacio(String nombre, String descripcion, String ubicacion, String imagenUrl, boolean abierto){
        this.nombre=nombre;
        this.descripcion=descripcion;
        this.ubicacion=ubicacion;
        this.imagenUrl=imagenUrl;
        this.abierto=abierto;
    }

    public Espacio(String nombre, String descripcion, String ubicacion, String imagenUrl, boolean abierto,
            Double latitud, Double longitud){
        this(nombre, descripcion, ubicacion, imagenUrl, abierto);
        this.latitud=latitud;
        this.longitud=longitud;
    }
}