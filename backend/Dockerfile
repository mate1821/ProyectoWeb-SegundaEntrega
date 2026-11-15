# ---------- Etapa 1: Compilación y Empaquetado ----------
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app

# Copiar primero el archivo pom.xml para descargar y cachear las dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente completo del proyecto
COPY src ./src

# Ejecutar la limpieza y empaquetado para generar el JAR (omitiendo tests para agilizar)
RUN mvn clean package -DskipTests

# ---------- Etapa 2: Ejecución del JAR generado ----------
FROM eclipse-temurin:25-jre
WORKDIR /app

# Copiar automáticamente el JAR resultante de la etapa anterior a la raíz del contenedor
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto en el que corre la aplicación Spring Boot
EXPOSE 8090

# Comando para ejecutar la aplicación automáticamente al iniciar el contenedor
ENTRYPOINT ["java", "-jar", "app.jar"]