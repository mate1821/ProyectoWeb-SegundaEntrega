package com.health.project.entitys;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

@Getter 
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)//Permite que la clase médico herede de esta llevando sus atributos allá
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Integer puede ser null
    @Column(nullable = false, length = 100)
    private Long cedula;
    @Column(nullable = false, length = 100)
    private String nombre;
    @Column(nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date fecha_nacimiento; 
    @Column(length = 120)
    private String antecedentes;
    @Column(length = 120)
    private String correo;

    @ManyToOne
    private Rol rol;
    @Column(length = 120)
    private String telefono;
    @Column(length = 120)
    private Boolean activo= true;
    @Column(length = 120)
    private String contrasena;
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @OneToMany (mappedBy="usuario")
    List<Reserva> reservas;


@Override
public String toString() {
    return nombre;
}


    // constructor sin el elemento del id 
    public Usuario (Long cedula, String nombre, Date fechaNacimiento,String antecedentes , String telefono, String correo, String contrasena, boolean activo) {
        this.cedula = cedula;
        this.nombre = nombre;
        this.fecha_nacimiento = fechaNacimiento;
        this.antecedentes = antecedentes;
        this.telefono = telefono;
        this.correo = correo;
        this.activo=activo;
        this.contrasena = contrasena;
        this.fechaRegistro= LocalDateTime.now();

    }







}

