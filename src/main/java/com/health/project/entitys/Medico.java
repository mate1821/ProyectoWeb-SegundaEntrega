package com.health.project.entitys;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

import jakarta.persistence.*;

@Getter
@Setter 
@NoArgsConstructor 
@EqualsAndHashCode(callSuper = true)//Para distinguir 2 médicos, que también tenga en cuenta los datos que están en la clase usuario, no solo los de aquí
@Entity
public class Medico extends Usuario {

    @ManyToOne
    private Especialidad especialidad;

    @ManyToOne
    private Espacio espacio;

    @OneToMany (mappedBy = "medico")
    List<Reserva> reservas;

    public Medico(Long cedula, String nombre, Date fecha_nacimiento ,String antecedentes , String telefono, String correo, String contrasena, boolean activo) {
        super(cedula, nombre, fecha_nacimiento, antecedentes, telefono,correo, contrasena, activo);
    }
}