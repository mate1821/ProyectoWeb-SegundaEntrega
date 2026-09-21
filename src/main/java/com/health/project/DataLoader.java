package com.health.project;

import com.health.project.repository.EstadoReservaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.health.project.entitys.Espacio;
import com.health.project.entitys.Especialidad;
import com.health.project.entitys.EstadoReserva;
import com.health.project.entitys.Medico;
import com.health.project.entitys.Reserva;
import com.health.project.entitys.Rol;
import com.health.project.entitys.Servicio;
import com.health.project.entitys.Tipo;
import com.health.project.entitys.Usuario;
import com.health.project.repository.ReservaRepository;
import com.health.project.repository.RolRepository;
import com.health.project.repository.ServicioRepository;
import com.health.project.repository.TipoRepository;
import com.health.project.repository.UsuarioRepository;
import com.health.project.repository.EspacioRepository;
import com.health.project.repository.EspecialidadRepository;
import com.health.project.repository.MedicoRepository;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Component
@Transactional
public class DataLoader implements CommandLineRunner {

        @Autowired
        private ReservaRepository reservaRepo;

        @Autowired
        private UsuarioRepository usuarioRepo;

        @Autowired
        private MedicoRepository medicoRepo;

        @Autowired
        private EspecialidadRepository especialidadRepo;

        @Autowired
        private EspacioRepository espacioRepo;

        @Autowired
        private RolRepository rolRepo;

        @Autowired
        private TipoRepository tipoRepo;

        @Autowired
        private EstadoReservaRepository estadoResRepo;

        @Autowired
        private ServicioRepository servicioRepo;

        @Override
        public void run(String... args) throws Exception {

                Random random = new Random(42);

                // Rol
                Rol rolMedico = rolRepo.save(new Rol("Medico"));
                Rol rolPaciente = rolRepo.save(new Rol("Paciente"));
                Rol rolAdmin = rolRepo.save(new Rol("Administrador"));

                // Tipos de espacios
                tipoRepo.save(new Tipo("Consultorio"));
                tipoRepo.save(new Tipo("Sala de urgencias"));
                tipoRepo.save(new Tipo("Sala de cirugía"));
                tipoRepo.save(new Tipo("Laboratorio"));

                // Estados de reserva
                estadoResRepo.save(new EstadoReserva("Confirmada"));
                estadoResRepo.save(new EstadoReserva("Cancelada"));
                estadoResRepo.save(new EstadoReserva("Completada"));
                estadoResRepo.save(new EstadoReserva("Desactivada"));

                // Servicios
                servicioRepo.save(new Servicio("Nocturno", 50000.00));
                servicioRepo.save(new Servicio("Festivo", 60000.00));
                servicioRepo.save(new Servicio("Domicilio", 70000.00));

                // Especialidades
                especialidadRepo.save(new Especialidad("MEDICINA_GENERAL", 50000.0));
                especialidadRepo.save(new Especialidad("PEDIATRIA", 70000.0));
                especialidadRepo.save(new Especialidad("CARDIOLOGIA", 120000.0));
                especialidadRepo.save(new Especialidad("DERMATOLOGIA", 100000.0));
                especialidadRepo.save(new Especialidad("NEUROLOGIA", 130000.0));
                especialidadRepo.save(new Especialidad("GINECOLOGIA", 90000.0));
                especialidadRepo.save(new Especialidad("ORTOPEDIA", 110000.0));
                especialidadRepo.save(new Especialidad("CIRUGIA_GENERAL", 150000.0));
                especialidadRepo.save(new Especialidad("OFTALMOLOGIA", 100000.0));
                especialidadRepo.save(new Especialidad("UROLOGIA", 120000.0));
                especialidadRepo.save(new Especialidad("ENDOCRINOLOGIA", 100000.0));
                especialidadRepo.save(new Especialidad("GASTROENTEROLOGIA", 120000.0));
                especialidadRepo.save(new Especialidad("ONCOLOGIA", 180000.0));
                especialidadRepo.save(new Especialidad("PSIQUIATRIA", 90000.0));
                especialidadRepo.save(new Especialidad("NEUMOLOGIA", 110000.0));

                // Espacio:
                espacioRepo.save(new Espacio("Hospital1", "Consultorio 101", "Calle 42 # 18-27",
                                "Consultorio equipado para consulta general", true));
                espacioRepo.save(new Espacio("Hospital2", "Consultorio 101", "Carrera 67 # 24-15",
                                "Consultorio equipado para consulta general", true));
                espacioRepo.save(new Espacio("Hospital3", "Consultorio 101", "Calle 91 # 53-08",
                                "Consultorio equipado para consulta general", true));
                espacioRepo.save(new Espacio("Hospital4", "Consultorio 101", "Carrera 15 # 76-42",
                                "Consultorio equipado para consulta general", true));

                // insercion de usuarios

                usuarioRepo.save(new Usuario(1001L, "Ana Torres", new GregorianCalendar(1995, 3, 12).getTime(),
                                "Sin antecedentes relevantes", "3001234567", "ana.torres@gmail.com", "clave123", true));
                usuarioRepo.save(new Usuario(1002L, "Carlos Ruiz", new GregorianCalendar(1988, 7, 22).getTime(),
                                "Hipertensión controlada", "3007654321", "carlos.ruiz@gmail.com", "clave123", true));
                usuarioRepo.save(new Usuario(1003L, "Laura Gómez", new GregorianCalendar(1992, 11, 5).getTime(), null,
                                "3009876543", "laura.gomez@gmail.com", "clave123", true));
                usuarioRepo.save(new Usuario(1004L, "Pedro Sánchez", new GregorianCalendar(1979, 1, 18).getTime(), null,
                                "3004561234", "mati67@gmail.com", "clave123", true));
                usuarioRepo.save(new Usuario(1006L, "Valeria", new GregorianCalendar(2000, 5, 30).getTime(),
                                "Alergia a la penicilina", "3002223344", "valeria@gmail.com", "rey123", false));
                usuarioRepo.save(new Usuario(1005L, "Sofía Ramírez", new GregorianCalendar(2000, 5, 30).getTime(),
                                "Alergia a la penicilina", "3002223344", "sofia.ramirez@gmail.com", "clave123", false));

                usuarioRepo.save(new Usuario(1005L, "Rey", new GregorianCalendar(2000, 5, 30).getTime(),
                                "Alergia a la penicilina", "3002223344", "rey@gmail.com", "valeria123", false));


                // Insercion de medicos
                Medico med1 = new Medico(2001L, "Laura Gómez", new GregorianCalendar(1985, 4, 10).getTime(), "Ninguno",
                                "3011234567", "laura.gomez@gmail.com", "clave123", true);
                Medico med2 = new Medico(2002L, "Andrés Bermúdez", new GregorianCalendar(1979, 8, 3).getTime(),
                                "Ninguno", "3017654321", "andres.bermudez@gmail.com", "clave123", true);
                Medico med3 = new Medico(2003L, "Ansu Fati", new GregorianCalendar(1979, 8, 3).getTime(),
                                "Ninguno", "3017654320", "ansufati@gmail.com", "clave123", true);

                medicoRepo.save(med1);
                medicoRepo.save(med2);
                medicoRepo.save(med3);

                // LOS DATOS QUE SON LLAVES FORÁNEAS SE ELIGEN ALEATORIAMENTE AQUI
                int cantidadRoles = rolRepo.findAll().size();
                for (Usuario u : usuarioRepo.findAll()) {
                        if (u instanceof Medico) {
                                u.setRol(rolMedico);
                        } else {
                                int randomNum = random.nextInt(2, cantidadRoles + 1);
                                Rol r = rolRepo.findById((long) randomNum).get();
                                u.setRol(r);
                        }
                        usuarioRepo.save(u);
                }

                int cantidadEspecialidades = especialidadRepo.findAll().size();
                int cantidadEspacios = espacioRepo.findAll().size();

                for (Medico m : medicoRepo.findAll()) {

                        int randomNum1 = random.nextInt(1, cantidadEspecialidades + 1);
                        Especialidad especialidad = especialidadRepo.findById((long) randomNum1).get();
                        int randomNum2 = random.nextInt(1, cantidadEspacios + 1);
                        Espacio espacio = espacioRepo.findById((long) randomNum2).get();
                        m.setEspecialidad(especialidad);
                        m.setEspacio(espacio);
                        medicoRepo.save(m);
                }

                int cantidadTipos = tipoRepo.findAll().size();

                for (Espacio e : espacioRepo.findAll()) {

                        int randomNum1 = random.nextInt(1, cantidadTipos + 1);
                        Tipo t = tipoRepo.findById((long) randomNum1).get();
                        e.setTipo(t);
                        espacioRepo.save(e);
                }

                // reservas

                // Filtramos usuarios que NO sean médicos (solo pacientes) 
                List<Usuario> soloPacientes = new ArrayList<>();
                for (Usuario u : usuarioRepo.findAll()) {
                        if (!(u instanceof Medico)) {
                                soloPacientes.add(u);
                        }
                }

                Reserva r1 = new Reserva(LocalDate.of(2026, 9, 10), LocalTime.of(9, 0), LocalTime.of(9, 30),
                                LocalDateTime.now(), "Primera consulta", 120000);
                Reserva r2 = new Reserva(LocalDate.of(2026, 9, 11), LocalTime.of(10, 0), LocalTime.of(10, 30),
                                LocalDateTime.now(), "Control mensual", 70000);
                Reserva r3 = new Reserva(LocalDate.of(2026, 9, 12), LocalTime.of(14, 0), LocalTime.of(14, 30),
                                LocalDateTime.now(), null, 130000);
                Reserva r4 = new Reserva(LocalDate.of(2026, 9, 15), LocalTime.of(16, 0), LocalTime.of(16, 30),
                                LocalDateTime.now(), "Paciente canceló", 70000);

                reservaRepo.save(r1);
                reservaRepo.save(r2);
                reservaRepo.save(r3);
                reservaRepo.save(r4);

                List<Medico> todosLosMedicos = medicoRepo.findAll();
                int cantidadMedicos = todosLosMedicos.size();
                int cantidadPacientes = soloPacientes.size();
                int cantidadEstados = estadoResRepo.findAll().size();

                for (Reserva r : reservaRepo.findAll()) {
                        int randomPaciente = random.nextInt(0, cantidadPacientes);
                        Usuario paciente = soloPacientes.get(randomPaciente);

                        int randomMedico = random.nextInt(0, cantidadMedicos);
                        Medico medico = todosLosMedicos.get(randomMedico);

                        int randomEstado = random.nextInt(1, cantidadEstados + 1);
                        EstadoReserva estado = estadoResRepo.findById((long) randomEstado).get();

                        r.setUsuario(paciente);
                        r.setMedico(medico);
                        r.setEstado(estado);
                        reservaRepo.save(r);
                }

                int cantidadServicios = servicioRepo.findAll().size();
                int cantidadServiciosPorReserva = 2;
                for (Reserva r : reservaRepo.findAll()) {

                        for (int i = 0; i < cantidadServiciosPorReserva; i++) {
                                int randomNum1 = random.nextInt(1, cantidadServicios + 1);
                                Servicio s = servicioRepo.findById((long) randomNum1).get();
                                if (r.getServicios() == null) {
                                        r.setServicios(new ArrayList<>());
                                }
                                r.getServicios().add(s);
                                reservaRepo.save(r);
                        }
                }

        }

}
